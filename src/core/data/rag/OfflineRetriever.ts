export interface RetrievedChunk {
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  crop: string;
  topic: string;
  passage: string;
  relevanceScore: number;
}

export class OfflineRetriever {
  // Offline agricultural knowledge base curated from BRRI, DAE, BARI publications
  private readonly knowledgeBase: RetrievedChunk[] = [
    {
      chunkId: 'chunk_0001',
      sourceId: 'brri-rkb-blast',
      sourceTitle: 'BRRI Rice Knowledge Bank - রোগ ও বালাই ব্যবস্থাপনা',
      crop: 'ধান',
      topic: 'ব্লাস্ট রোগ (Rice Blast)',
      passage: 'ধানের ব্লাস্ট রোগে ট্রাইসাইক্লাজোল গ্রুপের ছত্রাকনাশক (যেমন ট্রুপার বা ট্রাইকো প্রতি লিটার পানিতে ০.৭৫ গ্রাম) অথবা এমিস্টার টপ বিকেলে স্প্রে করতে হয়। অতিরিক্ত ইউরিয়া সার বন্ধ রাখতে হবে এবং জমিতে সার্বক্ষণিক ছিপছিপে পানি ধরে রাখতে হবে।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0002',
      sourceId: 'dae-bph-management',
      sourceTitle: 'DAE সমন্বিত বালাই ব্যবস্থাপনা নির্দেশিকা',
      crop: 'ধান',
      topic: 'বাদামী গাছফড়িং বা কারেন্ট পোকা (BPH)',
      passage: 'বাদামী গাছফড়িং (কারেন্ট পোকা) দমনে জমির পানি ৩-৪ দিন শুকিয়ে নিতে হবে এবং ১০-১২ হাত পর পর বিলি কেটে আলো-বাতাস চলাচলের ব্যবস্থা করতে হবে। আক্রমণ বেশি হলে পাইমেট্রোজিন বা ডিনেটোফুরান গ্রুপের অনুমোদিত কীটনাশক গাছের গোড়ায় স্প্রে করতে হবে। পাতার উপরে স্প্রে করা যাবে না।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0003',
      sourceId: 'bari-hatboi-late-blight',
      sourceTitle: 'BARI কৃষি প্রযুক্তি হাতবই - কন্দাল ফসল',
      crop: 'আলু',
      topic: 'আলুর নাবি ধসা রোগ (Late Blight)',
      passage: 'আলুর নাবি ধসা রোগে কুয়াশাচ্ছন্ন আবহাওয়ায় সাইমোক্সানিল + মেনকোজেব (কার্জেট এম-৮) বা মেটাল্যাক্সিল + মেনকোজেব (রিডোমিল গোল্ড প্রতি লিটার পানিতে ২ গ্রাম হারে) ৩-৫ দিন পর পর ২-৩ বার স্প্রে করতে হয়। সেচ সাময়িক বন্ধ রাখতে হবে এবং আক্রান্ত গাছ জমি থেকে সরাতে হবে।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0004',
      sourceId: 'brri-urea-schedule',
      sourceTitle: 'BRRI ধান আবাদ নির্দেশিকা',
      crop: 'ধান',
      topic: 'ইউরিয়া সারের সঠিক কিস্তি ও প্রয়োগ',
      passage: 'বোরো ধানে ইউরিয়া সার সমান ৩ কিস্তিতে প্রয়োগ করতে হয়। ১ম কিস্তি চারা রোপণের ১৫-২০ দিন পর, ২য় কিস্তি ৩৫-৪০ দিন পর (কুশি আসার মাঝামাঝি) এবং ৩য় কিস্তি কাইচ থোড় আসার ৫-৭ দিন আগে। গুটি ইউরিয়া ব্যবহার করলে একবারেই দেওয়া যায়। জমিতে ছিপছিপে পানি থাকা প্রয়োজন।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0005',
      sourceId: 'dae-stem-borer',
      sourceTitle: 'DAE সমন্বিত বালাই ব্যবস্থাপনা (IPM)',
      crop: 'ধান',
      topic: 'মাজরা পোকা (Stem Borer) - মরা ডিগ ও সাদা শিষ',
      passage: 'মাজরা পোকা দমনে জমিতে ডালপালা পুঁতে পার্চিং করুন এবং আলোর ফাঁদ ব্যবহার করে মা মথ ধ্বংস করুন। কুশি অবস্থায় মরা ডিগ বা শিষ অবস্থায় সাদা শিষ দেখা দিলে ক্লোরানট্রানিলিপ্রোল বা কার্টাপ গ্রুপের অনুমোদিত কীটনাশক নির্দেশিত মাত্রায় স্প্রে করুন।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0006',
      sourceId: 'bari-eggplant-borer',
      sourceTitle: 'BARI সবজি উৎপাদন প্রযুক্তি',
      crop: 'বেগুন',
      topic: 'বেগুনের ডগা ও ফল ছিদ্রকারী পোকা',
      passage: 'বেগুনের ডগা ও ফল ছিদ্রকারী পোকা দমনে আক্রান্ত ডগা কেটে ধ্বংস করুন ও সেক্স ফেরোমোন ফাঁদ ব্যবহার করুন। প্রয়োজনে স্পাইনোস্যাড বা এমামেক্টিন বেনজোয়েট স্প্রে করুন। বেগুন তোলার ৭-১০ দিন আগে কীটনাশক স্প্রে বন্ধ রাখুন।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0007',
      sourceId: 'dae-flood-advisory',
      sourceTitle: 'DAE দুর্যোগ ব্যবস্থাপনা ও কৃষি পুনর্বাসন সেল',
      crop: 'ধান',
      topic: 'আকস্মিক বন্যা ও পাহাড়ি ঢলে পাকা ধান কর্তন',
      passage: 'হাওর বা নিম্নাঞ্চলে পাহাড়ি ঢল বা আগাম বন্যার পূর্বাভাস থাকলে ধানের ৮০ ভাগ পেকে গেলেই দ্রুত কেটে ফেলতে হবে। সম্পূর্ণ পাকার অপেক্ষা করা যাবে না। কাটা ধান উঁচু স্থানে বা পাকা রাস্তায় ত্রিপল দিয়ে ঢেকে সংরক্ষণ করুন।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0008',
      sourceId: 'bari-bacterial-wilt',
      sourceTitle: 'BARI উদ্ভিদ রোগতত্ত্ব বিভাগ',
      crop: 'টমেটো',
      topic: 'টমেটোর ব্যাকটেরিয়াজনিত ঢলে পড়া রোগ (Bacterial Wilt)',
      passage: 'টমেটোর ব্যাকটেরিয়াজনিত ঢলে পড়া রোগে কাণ্ড কাটলে পানিতে সাদা সুতার মতো ব্যাকটেরিয়াল উজ বের হয়। এতে ছত্রাকনাশকে কাজ হয় না। আক্রান্ত গাছ শিকড়সহ তুলে মাটিতে পুঁতে ফেলতে হবে এবং জমিতে চুন বা ব্লিচিং পাউডার দিয়ে শোধন করতে হবে।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0009',
      sourceId: 'bari-wheat-blast',
      sourceTitle: 'BARI গম ও ভুট্টা গবেষণা ইনস্টিটিউট',
      crop: 'গম',
      topic: 'গম ব্লাস্ট রোগ (Wheat Blast)',
      passage: 'গম ব্লাস্ট রোগে শিষের উপরের অংশ সাদা হয়ে শুকিয়ে যায় ও দানা চিটা হয়ে যায়। প্রতিরোধে ট্রাইফ্লক্সিস্ট্রবিন + টেবুকোনাজল (নেটিভো) বা অনুমোদিত ছত্রাকনাশক বিকেলে স্প্রে করতে হয়। পরবর্তী মৌসুমের জন্য ব্লাস্ট প্রতিরোধী বারি গম ৩৩ চাষের পরামর্শ দেওয়া হয়।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0010',
      sourceId: 'brri-zinc-deficiency',
      sourceTitle: 'BRRI মৃত্তিকা বিজ্ঞান বিভাগ',
      crop: 'ধান',
      topic: 'দস্তা (জিঙ্ক) ও সালফারের ঘাটতি (খাঁয়রা রোগ)',
      passage: 'ধানের কচি পাতার শিরাগুলোর মাঝে হলুদ হয়ে যাওয়া ও পাতায় মরচে রঙের ছোপ পড়া দস্তার ঘাটতির লক্ষণ। হেক্টর প্রতি জিংক সালফেট বা চিলেটেড জিংক (১ গ্রাম প্রতি লিটার পানি) স্প্রে করুন। কখনোই ফসফেট সারের সাথে জিংক মিশিয়ে প্রয়োগ করবেন না।',
      relevanceScore: 1.0
    }
  ];

  // Common conversational / greeting keywords that should NOT trigger agronomic RAG passages
  private readonly greetingPatterns: RegExp[] = [
    /^(hi|hello|hey|greetings|hola)\b/i,
    /^(সালাম|আসসালামু|নমস্কার|আদাব|হ্যালো|কেমন আছেন|ভাল আছেন)/i,
    /^(good morning|good afternoon|good evening)\b/i
  ];

  public async retrieveRelevantPassages(
    query: string,
    crop: string = 'ধান',
    topK: number = 3
  ): Promise<RetrievedChunk[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    // Check if query is merely a greeting or casual expression
    const isPureGreeting = this.greetingPatterns.some(pattern => pattern.test(trimmed));
    if (isPureGreeting && trimmed.length < 30) {
      return [];
    }

    const delimiters = /[\s।,\?—\.\!\:\;]+/;
    const queryTokens = trimmed
      .toLowerCase()
      .split(delimiters)
      .filter(t => t.length >= 2);

    if (queryTokens.length === 0) {
      return [];
    }

    const scored = this.knowledgeBase.map(chunk => {
      let tokenScore = 0.0;
      const lowerTopic = chunk.topic.toLowerCase();
      const lowerPassage = chunk.passage.toLowerCase();
      const lowerCrop = chunk.crop.toLowerCase();

      for (const token of queryTokens) {
        if (lowerTopic.includes(token)) {
          tokenScore += 4.0;
        } else if (lowerPassage.includes(token)) {
          tokenScore += 2.0;
        }
      }

      // Only grant crop bonus IF the user query has at least one matching token or explicitly mentions the crop
      let totalScore = tokenScore;
      if (tokenScore > 0) {
        if (
          lowerCrop.includes(crop.toLowerCase()) ||
          crop.toLowerCase().includes(lowerCrop)
        ) {
          totalScore += 1.5;
        }
      }

      return {
        ...chunk,
        relevanceScore: totalScore
      };
    });

    return scored
      .filter(item => item.relevanceScore >= 3.0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK);
  }
}
