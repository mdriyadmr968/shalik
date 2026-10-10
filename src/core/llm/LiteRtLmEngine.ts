import { ModelManager } from './ModelManager';

export type EngineState =
  | { type: 'Uninitialized' }
  | { type: 'Loading' }
  | { type: 'Ready'; modelName: string }
  | { type: 'Error'; error: string };

export interface GenerationParams {
  temperature?: number;
  topK?: number;
  maxOutputTokens?: number;
  systemPrompt?: string;
}

export const DEFAULT_SYSTEM_PROMPT =
  "তুমি 'শালিক' (Shalik) — বাংলাদেশের গ্রামীণ কৃষকদের জন্য একটি নিবেদিত কৃষি পরামর্শক এআই। " +
  'কৃষকদের প্রশ্নের উত্তর সহজ, স্পষ্ট ও ব্যবহারিক ভাষায় দাও। ' +
  'কীটনাশক বা সার ব্যবহারের ক্ষেত্রে সঠিক অনুমোদিত মাত্রা ও সুরক্ষার নিয়ম (যেমন মাস্ক ব্যবহার) স্পষ্টভাবে উল্লেখ কর। ' +
  'কোনো নিষিদ্ধ কীটনাশক (যেমন প্যারা কোয়াট, এন্ডোসালফান, কার্বোফিউরান, ডিডিটি) পরামর্শ দেবে না। ' +
  'যদি কোনো বিষয়ে নিশ্চিত না হও, তবে ভুল তথ্য না দিয়ে নিকটস্থ উপ-সহকারী কৃষি কর্মকর্তা (SAAO) বা কৃষি কল সেন্টার ১৬১২৩-এ যোগাযোগ করতে বল।';

/**
 * Helper to retrieve Gemini API key from environment
 */
export function getGeminiApiKey(): string | undefined {
  try {
    // Node / Webpack / React Native / Jest environment
    if (typeof process !== 'undefined' && process.env) {
      const key = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (key) return key;
    }
  } catch (_) {}

  try {
    // Vite / ESM Browser environment (dynamic evaluation to avoid CommonJS/Jest parse errors)
    const getMetaEnv = new Function(
      'try { return import.meta.env; } catch (_) { return undefined; }'
    );
    const metaEnv = getMetaEnv();
    if (metaEnv && metaEnv.VITE_GEMINI_API_KEY) {
      return metaEnv.VITE_GEMINI_API_KEY;
    }
  } catch (_) {}

  return undefined;
}

export class LiteRtLmEngine {
  private engineState: EngineState = { type: 'Uninitialized' };
  private modelManager: ModelManager;
  private isCancelling = false;

  constructor(modelManager: ModelManager = new ModelManager()) {
    this.modelManager = modelManager;
  }

  public getEngineState(): EngineState {
    return this.engineState;
  }

  public isReady(): boolean {
    return this.engineState.type === 'Ready';
  }

  public async initialize(): Promise<boolean> {
    const modelName = this.modelManager.getActiveModelName();
    if (!modelName) {
      this.engineState = {
        type: 'Error',
        error: 'No valid model installed. Please import or download model.'
      };
      return false;
    }

    this.engineState = { type: 'Loading' };
    this.engineState = { type: 'Ready', modelName };
    return true;
  }

  public cancelGeneration(): void {
    this.isCancelling = true;
  }

  /**
   * Generates a streaming response for the given user prompt.
   * If a Gemini API key is configured (VITE_GEMINI_API_KEY), queries the live Gemini LLM.
   * Otherwise (or when offline), falls back to the local grounded agricultural rule engine.
   */
  public async *generateStream(
    userPrompt: string,
    params: GenerationParams = {}
  ): AsyncIterable<string> {
    if (!this.isReady()) {
      await this.initialize();
      if (!this.isReady()) {
        throw new Error('LiteRT Engine is not ready. Call initialize() first.');
      }
    }

    this.isCancelling = false;
    const apiKey = getGeminiApiKey();

    if (apiKey && apiKey.trim().length > 0 && typeof fetch !== 'undefined') {
      try {
        let yieldedAny = false;
        for await (const chunk of this.streamGeminiApi(userPrompt, apiKey, params)) {
          if (this.isCancelling) break;
          yieldedAny = true;
          yield chunk;
        }
        if (yieldedAny || this.isCancelling) {
          return;
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local offline engine:', err);
      }
    }

    // Local grounded offline rule-engine fallback
    const mockChunks = this.generateMockGroundedResponse(userPrompt);

    for (const chunk of mockChunks) {
      if (this.isCancelling) {
        break;
      }
      yield chunk;
      await new Promise(res => setTimeout(res, 25));
    }
  }

  /**
   * Live streaming client for Google Gemini REST API (SSE format)
   */
  private async *streamGeminiApi(
    prompt: string,
    apiKey: string,
    params: GenerationParams
  ): AsyncIterable<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const systemInstruction = params.systemPrompt || DEFAULT_SYSTEM_PROMPT;
    const body = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: params.temperature ?? 0.3,
        maxOutputTokens: params.maxOutputTokens ?? 1024
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      const json = await response.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) yield text;
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      if (this.isCancelling) break;
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6).trim();
          try {
            const data = JSON.parse(jsonStr);
            const partText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (partText) {
              yield partText;
            }
          } catch (_) {
            // Ignore partial SSE lines
          }
        }
      }
    }
  }

  /**
   * Extracts the actual user question from the multimodal prompt builder template
   */
  private extractUserQuestion(prompt: string): string {
    const bnMatch = prompt.match(/কৃষকের প্রশ্ন:\s*([^\n\r]+)/);
    if (bnMatch) return bnMatch[1].trim();
    const enMatch = prompt.match(/Farmer's Query:\s*([^\n\r]+)/i);
    if (enMatch) return enMatch[1].trim();
    return prompt.trim();
  }

  /**
   * Grounded local response generator with greeting & topic awareness
   */
  public generateMockGroundedResponse(prompt: string): string[] {
    const question = this.extractUserQuestion(prompt);
    const qLower = question.toLowerCase();
    const pLower = prompt.toLowerCase();
    const isEnglish = /[a-zA-Z]/.test(question) && !/[\u0980-\u09FF]/.test(question);

    // 1. Check for pure greetings
    const isGreeting =
      /^(hi|hello|hey|greetings|good morning|good evening|good afternoon)\b/i.test(question) ||
      /^(সালাম|আসসালামু|নমস্কার|আদাব|হ্যালো|কেমন আছেন|ভাল আছেন)/i.test(question);

    if (isGreeting && question.length < 35) {
      if (isEnglish) {
        return [
          'Hello! I am **Shalik (শালিক)**, your offline AI farm assistant. 🌾\n\n',
          'I am here to help you in Bengali or English. How can I assist you today?\n\n',
          '• **Diagnose Diseases:** Inquire about fungal, bacterial, or pest symptoms\n',
          '• **Fertilizer Guidance:** Inquire about Urea and balanced fertilizer dosage schedules\n',
          '• **Disaster Alerts:** Check local flood and heatwave warnings\n',
          '• **Photo Diagnosis:** Attach a leaf photo for automated diagnosis\n\n',
          'Please type your agricultural question or attach a photo!'
        ];
      }

      return [
        'সালাম! আমি **শালিক (Shalik)** — বাংলাদেশের কৃষকদের জন্য ডিজিটাল কৃষি পরামর্শক। 🌾\n\n',
        'আজ আপনার ফসলের বিষয়ে কীভাবে সাহায্য করতে পারি? আপনি জানতে পারেন:\n\n',
        '১. **রোগ ও পোকা দমন:** ধানের ব্লাস্ট, কারেন্ট পোকা, মাজরা পোকা বা আলুর নাবি ধসা রোগ\n',
        '২. **সারের সঠিক প্রয়োগ:** বোরো ধানে ইউরিয়া সারের কিস্তি ও মাত্রা\n',
        '৩. **আবহাওয়া সতর্কতা:** স্থানীয় বন্যা ও খরা/তাপপ্রবাহের পূর্বাভাস\n',
        '৪. **ছবি বিশ্লেষণ:** আক্রান্ত পাতার ছবি তুলে পাঠালে স্বয়ংক্রিয় শনাক্তকরণ\n\n',
        'আপনার প্রশ্নটি নিচে লিখুন বা পাতার ছবি যুক্ত করুন!'
      ];
    }

    // 2. English Inquiries
    if (isEnglish) {
      if (qLower.includes('blast') || qLower.includes('brown spot') || qLower.includes('spot')) {
        return [
          'Based on the symptoms, this appears to be Rice Blast or Brown Spot disease.\n\n',
          'Actionable Steps:\n',
          '1. Maintain sufficient standing water in the paddy field; do not let it dry out.\n',
          '2. Suspend excessive top-dressing of urea fertilizer temporarily.\n',
          '3. Spray Tricyclazole group fungicide (e.g. Trooper/Trico at 0.75g per liter of water).\n\n',
          '⚠️ Safety note: Wear a face mask while spraying. For further assistance, call Krishi Call Center 16123.'
        ];
      } else if (qLower.includes('urea') || qLower.includes('fertilizer')) {
        return [
          'Recommended Urea Fertilizer Schedule for Boro Rice:\n\n',
          '1. Apply in three equal split doses:\n',
          '   - 1st dose: 15-20 days after transplanting.\n',
          '   - 2nd dose: 35-40 days after transplanting (active tillering).\n',
          '   - 3rd dose: 5-7 days before panicle initiation.\n',
          '2. Deep placement of Guti Urea requires only single application and prevents nitrogen loss.\n\n',
          '⚠️ Ensure shallow standing water when applying urea; avoid excessive flooding.'
        ];
      } else if (qLower.includes('hopper') || qLower.includes('bph')) {
        return [
          'This matches Brown Plant Hopper (BPH / Current Poka) damage.\n\n',
          'Actionable Steps:\n',
          '1. Drain out water from the field for 3-4 days.\n',
          '2. Create alleys every 10-12 rows for sunlight and aeration.\n',
          '3. Spray Pymetrozine or Dinotefuran at the base of rice plants (not on leaves).\n\n',
          '⚠️ Emergency note: Spray directed strictly at plant bases.'
        ];
      } else {
        return [
          'I understand your agricultural inquiry.\n\n',
          'Initial Guidance:\n',
          '1. Safely isolate and inspect affected plant foliage.\n',
          '2. Ensure proper field drainage and balanced irrigation.\n',
          '3. Apply officially approved agrochemicals in recommended dosages.\n\n',
          'Please consult your local Sub-Assistant Agriculture Officer (SAAO) or Krishi Call Center 16123 for specific field diagnoses.'
        ];
      }
    }

    // 3. Bengali Inquiries — Targeted Keyword Matching on User's Question & Citation Context
    if (
      qLower.includes('ব্লাস্ট') ||
      (qLower.includes('ধান') && qLower.includes('দাগ')) ||
      (qLower.includes('পাতা') && qLower.includes('দাগ'))
    ) {
      return [
        'আপনার ধানের লক্ষণ অনুযায়ী এটি ব্লাস্ট বা বাদামী দাগ রোগ হতে পারে।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. জমিতে পর্যাপ্ত পানি ধরে রাখুন, শুকিয়ে যেতে দেবেন না।\n',
        '২. ইউরিয়া সারের উপরিপ্রয়োগ আপাতত বন্ধ রাখুন।\n',
        '৩. ট্রাইসাইক্লাজোল গ্রুপের ছত্রাকনাশক (যেমন ট্রুপার বা ট্রাইকো) প্রতি লিটার পানিতে ০.৭৫ গ্রাম হারে মিশিয়ে স্প্রে করুন।\n\n',
        '⚠️ সতর্কতা: স্প্রে করার সময় নাক-মুখ ঢেকে রাখুন। অতিরিক্ত তথ্যের জন্য কৃষি কল সেন্টার ১৬১২৩-এ কল করুন।'
      ];
    } else if (qLower.includes('কারেন্ট পোকা') || qLower.includes('গাছফড়িং') || qLower.includes('বিপিএইচ')) {
      return [
        'লক্ষণ দেখে মনে হচ্ছে এটি বাদামী গাছফড়িং বা কারেন্ট পোকার আক্রমণ।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. জমির পানি ৩-৪ দিনের জন্য পুরোপুরি নামিয়ে দিন।\n',
        '২. জমিতে ১০-১২ হাত পর পর বিলি কেটে আলো-বাতাস চলাচলের পথ করে দিন।\n',
        '৩. আক্রমণ বেশি হলে পাইমেট্রোজিন বা ডিনেটোফুরান গ্রুপের অনুমোদিত কীটনাশক গাছের গোড়ায় স্প্রে করুন।\n\n',
        '⚠️ জরুরি পরামর্শ: স্প্রে পাতার উপরে নয়, অবশ্যই গাছের গোড়ায় করতে হবে।'
      ];
    } else if (qLower.includes('আলু') || qLower.includes('নাবি ধসা') || qLower.includes('লেইট ব্লাইট')) {
      return [
        'কুয়াশাচ্ছন্ন আবহাওয়ায় এটি আলুর নাবি ধসা (Late Blight) রোগের লক্ষণ।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. জমিতে সেচ দেওয়া সাময়িকভাবে বন্ধ রাখুন।\n',
        '২. কুয়াশা কেটে রোদ ওঠার পর সাইমোক্সানিল+মেনকোজেব বা রিডোমিল গোল্ড (প্রতি লিটারে ২ গ্রাম) ৩-৫ দিন পর পর স্প্রে করুন।\n',
        '৩. আক্রান্ত গাছ দ্রুত জমি থেকে তুলে পুড়িয়ে ফেলুন।\n\n',
        'পরামর্শ: রোগ বিস্তারের আগেই সতর্কতামূলক ব্যবস্থা গ্রহণ করুন।'
      ];
    } else if (qLower.includes('মাজরা') || qLower.includes('মরা ডিগ') || qLower.includes('সাদা শিষ')) {
      return [
        'লক্ষণ অনুযায়ী এটি ধান ফসলের মাজরা পোকা (Stem Borer)-এর আক্রমণ।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. জমিতে ডালপালা পুঁতে পার্চিং (পাখি বসার ব্যবস্থা) করুন এবং আলোর ফাঁদ ব্যবহার করুন।\n',
        '২. আক্রমণ বেশি হলে ক্লোরানট্রানিলিপ্রোল বা কার্টাপ গ্রুপের অনুমোদিত কীটনাশক স্প্রে করুন।\n\n',
        '⚠️ সতর্কতা: কীটনাশক প্রয়োগের সময় হাতমোজা ও মাস্ক ব্যবহার করুন।'
      ];
    } else if (qLower.includes('ইউরিয়া') || qLower.includes('সার')) {
      return [
        'বোরো ধানে ইউরিয়া সার দেওয়ার সঠিক নিয়ম:\n\n',
        '১. সমান তিন কিস্তিতে প্রয়োগ করতে হবে:\n',
        '   - ১ম কিস্তি: চারা রোপণের ১৫-২০ দিন পর।\n',
        '   - ২য় কিস্তি: চারা রোপণের ৩৫-৪০ দিন পর (কুশি আসার মাঝামাঝি)।\n',
        '   - ৩য় কিস্তি: কাইচ থোড় আসার ৫-৭ দিন আগে।\n',
        '২. গুটি ইউরিয়া ব্যবহার করলে একবারেই দিলে চলে ও সারের অপচয় রোধ হয়।\n\n',
        '⚠️ জমিতে ছিপছিপে পানি রেখে সার দিন, অতিরিক্ত পানিতে সার দেওয়া এড়িয়ে চলুন।'
      ];
    } else if (qLower.includes('বন্যা') || qLower.includes('পাহাড়ি ঢল') || qLower.includes('হাওর')) {
      return [
        'বন্যা ও পাহাড়ি ঢলের ঝুঁকি ব্যবস্থাপনায় জরুরি পরামর্শ:\n\n',
        '১. ধানের ৮০ ভাগ পেকে গেলেই সম্পূর্ণ পাকার অপেক্ষা না করে দ্রুত কেটে ঘরে তুলুন।\n',
        '২. কম্বাইন হারভেস্টার বা অতিরিক্ত শ্রমিক নিয়োগ করে দ্রুত ফসল সংগ্রহ করুন।\n',
        '৩. কাটা ধান উঁচু স্থানে বা পাকা রাস্তায় ত্রিপল দিয়ে সংরক্ষণ করুন।\n\n',
        'জরুরি তথ্যের জন্য স্থানীয় উপ-সহকারী কৃষি কর্মকর্তা (SAAO)-এর সাথে যোগাযোগ রাখুন।'
      ];
    } else if (qLower.includes('টমেটো') || qLower.includes('ঢলে পড়া')) {
      return [
        'টমেটো গাছের এই লক্ষণ ব্যাকটেরিয়াজনিত ঢলে পড়া রোগ (Bacterial Wilt)।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. এতে সাধারণ ছত্রাকনাশকে কাজ হয় না। আক্রান্ত গাছ শিকড়সহ তুলে মাটিতে পুঁতে ফেলুন।\n',
        '২. জমিতে চুন বা ব্লিচিং পাউডার দিয়ে জীবাণুমুক্ত করার ব্যবস্থা করুন।\n\n',
        'পরামর্শ: পরবর্তী মৌসুমে রোগ প্রতিরোধী জাতের বীজ ব্যবহার করুন।'
      ];
    } else if (qLower.includes('গম')) {
      return [
        'গম ফসলে শিষ সাদা হয়ে যাওয়া গম ব্লাস্ট (Wheat Blast)-এর লক্ষণ হতে পারে।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. ট্রাইফ্লক্সিস্ট্রবিন+টেবুকোনাজল (নেটিভো) অনুমোদিত মাত্রায় বিকেলে স্প্রে করুন।\n',
        '২. আক্রান্ত জমির বীজ পরবর্তী মৌসুমের জন্য সংরক্ষণ করবেন না।\n\n',
        'জরুরি পরামর্শের জন্য কৃষি কল সেন্টার ১৬১২৩-এ যোগাযোগ করুন।'
      ];
    } else if (qLower.includes('দস্তা') || qLower.includes('জিঙ্ক') || qLower.includes('খাঁয়রা')) {
      return [
        'ধানের পাতায় মরচে রঙের ছোপ ও হলুদাভ ভাব দস্তা (Zinc)-এর ঘাটতি নির্দেশ করে।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. জিংক সালফেট বা চিলেটেড জিংক (প্রতি লিটার পানিতে ১ গ্রাম) স্প্রে করুন।\n',
        '২. মনে রাখবেন, কখনোই ডিএপি বা টিএসপি (ফসফেট) সারের সাথে জিংক মিশিয়ে ছিটাবেন না।\n\n',
        'পরামর্শ: জমি কয়েকদিন শুকিয়ে রোদ লাগানোর ব্যবস্থা করুন।'
      ];
    } else if (pLower.includes('ব্লাস্ট')) {
      // In case an image classifier or passage indicated blast
      return [
        'আপনার ধানের লক্ষণ অনুযায়ী এটি ব্লাস্ট বা বাদামী দাগ রোগ হতে পারে।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. জমিতে পর্যাপ্ত পানি ধরে রাখুন, শুকিয়ে যেতে দেবেন না।\n',
        '২. ইউরিয়া সারের উপরিপ্রয়োগ আপাতত বন্ধ রাখুন।\n',
        '৩. ট্রাইসাইক্লাজোল গ্রুপের ছত্রাকনাশক (যেমন ট্রুপার বা ট্রাইকো) প্রতি লিটার পানিতে ০.৭৫ গ্রাম হারে মিশিয়ে স্প্রে করুন।\n\n',
        '⚠️ সতর্কতা: স্প্রে করার সময় নাক-মুখ ঢেকে রাখুন। অতিরিক্ত তথ্যের জন্য কৃষি কল সেন্টার ১৬১২৩-এ কল করুন।'
      ];
    } else {
      return [
        'আপনার ফসলের সমস্যার বিষয়টি বুঝতে পেরেছি।\n\n',
        'প্রাথমিক পরামর্শ:\n',
        '১. আক্রান্ত পাতার কোনো স্পষ্ট পরিবর্তন থাকলে (যেমন পোকা, দাগ বা পাতা হলুদ হওয়া) বিস্তারিত জানান।\n',
        '২. চাইলে নিচের ক্যামেরা বাটন দিয়ে পাতার একটি পরিষ্কার ছবি তুলে যুক্ত করতে পারেন।\n',
        '৩. জরুরি পরামর্শের জন্য সরকারি কৃষি কল সেন্টার ১৬১২৩-এ সরাসরি ফোন করুন (সকাল ৭টা - রাত ৯টা)।\n\n',
        'আপনার এলাকার উপ-সহকারী কৃষি কর্মকর্তা (SAAO)-এর সাথে যোগাযোগ রাখতে পারেন।'
      ];
    }
  }
}
