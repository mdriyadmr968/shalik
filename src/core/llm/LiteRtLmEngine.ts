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
  "তুমি 'শালিক' (Shalik) — বাংলাদেশের গ্রামীণ কৃষকদের জন্য একটি অফলাইন কৃষি পরামর্শক এআই। " +
  'কৃষকদের প্রশ্নের উত্তর সহজ, স্পষ্ট ও ব্যবহারিক ভাষায় দাও। ' +
  'কীটনাশক বা সার ব্যবহারের ক্ষেত্রে সঠিক অনুমোদিত মাত্রা ও সুরক্ষার নিয়ম (যেমন মাস্ক ব্যবহার) স্পষ্টভাবে উল্লেখ কর। ' +
  'যদি কোনো বিষয়ে নিশ্চিত না হও, তবে ভুল তথ্য না দিয়ে নিকটস্থ উপ-সহকারী কৃষি কর্মকর্তা (SAAO) বা কৃষি কল সেন্টার ১৬১২৩-এ যোগাযোগ করতে বল।';

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
    const mockChunks = this.generateMockGroundedResponse(userPrompt);

    for (const chunk of mockChunks) {
      if (this.isCancelling) {
        break;
      }
      yield chunk;
      await new Promise(res => setTimeout(res, 25));
    }
  }

  private generateMockGroundedResponse(prompt: string): string[] {
    const p = prompt.toLowerCase();
    const isEnglish = /[a-zA-Z]/.test(prompt) && !/[\u0980-\u09FF]/.test(prompt);

    if (isEnglish) {
      if (p.includes('blast') || p.includes('brown spot') || p.includes('spot')) {
        return [
          'Based on the symptoms, this appears to be Rice Blast or Brown Spot disease.\n\n',
          'Actionable Steps:\n',
          '1. Maintain sufficient standing water in the paddy field; do not let it dry out.\n',
          '2. Suspend excessive top-dressing of urea fertilizer temporarily.\n',
          '3. Spray Tricyclazole group fungicide (e.g. Trooper/Trico at 0.75g per liter of water).\n\n',
          '⚠️ Safety note: Wear a face mask while spraying. For further assistance, call Krishi Call Center 16123.'
        ];
      } else if (p.includes('urea') || p.includes('fertilizer')) {
        return [
          'Recommended Urea Fertilizer Schedule for Boro Rice:\n\n',
          '1. Apply in three equal split doses:\n',
          '   - 1st dose: 15-20 days after transplanting.\n',
          '   - 2nd dose: 35-40 days after transplanting (active tillering).\n',
          '   - 3rd dose: 5-7 days before panicle initiation.\n',
          '2. Deep placement of Guti Urea requires only single application and prevents nitrogen loss.\n\n',
          '⚠️ Ensure shallow standing water when applying urea; avoid excessive flooding.'
        ];
      } else {
        return [
          'I understand your agricultural inquiry.\n\n',
          'Initial Guidance:\n',
          '1. Safely isolate and remove severely diseased plant foliage.\n',
          '2. Ensure proper field drainage if waterlogged.\n',
          '3. Apply officially approved agrochemicals in precise doses.\n\n',
          'Please consult your local Sub-Assistant Agriculture Officer (SAAO) or Krishi Call Center 16123 for specific field diagnoses.'
        ];
      }
    }

    if (p.includes('ব্লাস্ট') || (p.includes('ধান') && p.includes('দাগ'))) {
      return [
        'আপনার ধানের লক্ষণ অনুযায়ী এটি ব্লাস্ট বা বাদামী দাগ রোগ হতে পারে।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. জমিতে পর্যাপ্ত পানি ধরে রাখুন, শুকিয়ে যেতে দেবেন না।\n',
        '২. ইউরিয়া সারের উপরিপ্রয়োগ আপাতত বন্ধ রাখুন।\n',
        '৩. ট্রাইসাইক্লাজোল গ্রুপের ছত্রাকনাশক (যেমন ট্রুপার বা ট্রাইকো) প্রতি লিটার পানিতে ০.৭৫ গ্রাম হারে মিশিয়ে স্প্রে করুন।\n\n',
        '⚠️ সতর্কতা: স্প্রে করার সময় নাক-মুখ ঢেকে রাখুন। অতিরিক্ত তথ্যের জন্য কৃষি কল সেন্টার ১৬১২৩-এ কল করুন।'
      ];
    } else if (p.includes('কারেন্ট পোকা') || p.includes('গাছফড়িং')) {
      return [
        'লক্ষণ দেখে মনে হচ্ছে এটি বাদামী গাছফড়িং বা কারেন্ট পোকার আক্রমণ।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. জমির পানি ৩-৪ দিনের জন্য পুরোপুরি নামিয়ে দিন।\n',
        '২. জমিতে ১০-১২ হাত পর পর বিলি কেটে আলো-বাতাস চলাচলের পথ করে দিন।\n',
        '৩. আক্রমণ বেশি হলে পাইমেট্রোজিন বা ডিনেটোফুরান গ্রুপের অনুমোদিত কীটনাশক গাছের গোড়ায় স্প্রে করুন।\n\n',
        '⚠️ জরুরি পরামর্শ: স্প্রে পাতার উপরে নয়, গাছের গোড়ায় করুন।'
      ];
    } else if (p.includes('আলু') || p.includes('নাবি ধসা')) {
      return [
        'কুয়াশাচ্ছন্ন আবহাওয়ায় এটি আলুর নাবি ধসা (Late Blight) রোগের লক্ষণ।\n\n',
        'করণীয় পদক্ষেপ:\n',
        '১. জমিতে সেচ দেওয়া সাময়িকভাবে বন্ধ রাখুন।\n',
        '২. কুয়াশা কেটে রোদ ওঠার পর সাইমোক্সানিল+মেনকোজেব বা রিডোমিল গোল্ড (প্রতি লিটারে ২ গ্রাম) ৩-৫ দিন পর পর স্প্রে করুন।\n',
        '৩. আক্রান্ত গাছ দ্রুত জমি থেকে তুলে পুড়িয়ে ফেলুন।\n\n',
        'পরামর্শ: রোগ বিস্তারের আগেই সতর্কতামূলক ব্যবস্থা গ্রহণ করুন।'
      ];
    } else if (p.includes('ইউরিয়া') || p.includes('সার')) {
      return [
        'বোরো ধানে ইউরিয়া সার দেওয়ার সঠিক নিয়ম:\n\n',
        '১. সমান তিন কিস্তিতে প্রয়োগ করতে হবে:\n',
        '   - ১ম কিস্তি: চারা রোপণের ১৫-২০ দিন পর।\n',
        '   - ২য় কিস্তি: চারা রোপণের ৩৫-৪০ দিন পর (কুশি আসার মাঝামাঝি)।\n',
        '   - ৩য় কিস্তি: কাইচ থোড় আসার ৫-৭ দিন আগে।\n',
        '২. গুটি ইউরিয়া ব্যবহার করলে একবারেই দিলে চলে ও সারের অপচয় রোধ হয়।\n\n',
        '⚠️ জমিতে ছিপছিপে পানি রেখে সার দিন, অতিরিক্ত পানিতে সার দেওয়া এড়িয়ে চলুন।'
      ];
    } else {
      return [
        'আপনার ফসলের সমস্যার বিষয়টি বুঝতে পেরেছি।\n\n',
        'প্রাথমিক পরামর্শ:\n',
        '১. আক্রান্ত গাছের অংশ সাবধানে সরিয়ে ফেলুন।\n',
        '২. জমিতে অতিরিক্ত পানি জমে থাকলে তা নিষ্কাশনের ব্যবস্থা করুন।\n',
        '৩. অনুমোদিত বালাইনাশক সঠিক মাত্রায় প্রয়োগ করুন।\n\n',
        'প্রয়োজনে আপনার এলাকার উপ-সহকারী কৃষি কর্মকর্তা (SAAO) বা কৃষি কল সেন্টার ১৬১২৩-এ যোগাযোগ করুন।'
      ];
    }
  }
}
