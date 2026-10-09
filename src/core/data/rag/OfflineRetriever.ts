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
  // Static offline knowledge base chunks from BRRI, DAE, BARI
  private readonly knowledgeBase: RetrievedChunk[] = [
    {
      chunkId: 'chunk_0001',
      sourceId: 'brri-rkb-blast',
      sourceTitle: 'BRRI Rice Knowledge Bank',
      crop: 'ধান',
      topic: 'ব্লাস্ট রোগ',
      passage: 'ধানের ব্লাস্ট রোগে ট্রাইসাইক্লাজোল গ্রুপের ছত্রাকনাশক (যেমন ট্রুপার বা ট্রাইকো প্রতি লিটার পানিতে ০.৭৫ গ্রাম) অথবা এমিস্টার টপ স্প্রে করতে হয়। অতিরিক্ত ইউরিয়া সার বন্ধ রাখতে হবে এবং জমিতে সার্বক্ষণিক ছিপছিপে পানি ধরে রাখতে হবে।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0002',
      sourceId: 'dae-bph-management',
      sourceTitle: 'DAE বালাই ব্যবস্থাপনা নির্দেশিকা',
      crop: 'ধান',
      topic: 'বাদামী গাছফড়িং (কারেন্ট পোকা)',
      passage: 'বাদামী গাছফড়িং দমনে জমির পানি ৩-৪ দিন শুকিয়ে নিতে হবে এবং ১০-১২ হাত পর পর বিলি কেটে আলো-বাতাস চলাচলের ব্যবস্থা করতে হবে। আক্রমণ বেশি হলে পাইমেট্রোজিন বা ডিনেটোফুরান গ্রুপের অনুমোদিত কীটনাশক গাছের গোড়ায় স্প্রে করতে হবে।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0003',
      sourceId: 'bari-hatboi-late-blight',
      sourceTitle: 'BARI কৃষি প্রযুক্তি হাতবই',
      crop: 'আলু',
      topic: 'নাবি ধসা রোগ',
      passage: 'আলুর নাবি ধসা রোগে কুয়াশাচ্ছন্ন আবহাওয়ায় সাইমোক্সানিল + মেনকোজেব (কার্জেট এম-৮) বা মেটাল্যাক্সিল + মেনকোজেব (রিডোমিল গোল্ড প্রতি লিটার পানিতে ২ গ্রাম হারে) ৩-৫ দিন পর পর ২-৩ বার স্প্রে করতে হয়। সেচ সাময়িক বন্ধ রাখতে হবে।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0004',
      sourceId: 'brri-urea-schedule',
      sourceTitle: 'BRRI ধান আবাদ নির্দেশিকা',
      crop: 'ধান',
      topic: 'ইউরিয়া সারের কিস্তি',
      passage: 'বোরো ধানে ইউরিয়া সার সমান ৩ কিস্তিতে প্রয়োগ করতে হয়। ১ম কিস্তি চারা রোপণের ১৫-২০ দিন পর, ২য় কিস্তি ৩৫-৪০ দিন পর এবং ৩য় কিস্তি কাইচ থোড় আসার ৫-৭ দিন আগে। জমিতে ছিপছিপে পানি থাকা প্রয়োজন।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0005',
      sourceId: 'dae-stem-borer',
      sourceTitle: 'DAE সমন্বিত বালাই ব্যবস্থাপনা (IPM)',
      crop: 'ধান',
      topic: 'মাজরা পোকা (Stem Borer)',
      passage: 'মাজরা পোকা দমনে জমিতে ডালপালা পুঁতে পার্চিং করুন। আলোর ফাঁদ ব্যবহার করে মা মথ ধ্বংস করুন। আক্রমণ মাত্রাতিরিক্ত হলে ক্লোরানট্রানিলিপ্রোল বা কার্টাপ গ্রুপের অনুমোদিত কীটনাশক স্প্রে করুন।',
      relevanceScore: 1.0
    },
    {
      chunkId: 'chunk_0006',
      sourceId: 'bari-eggplant-borer',
      sourceTitle: 'BARI সবজি উৎপাদন প্রযুক্তি',
      crop: 'বেগুন',
      topic: 'ডগা ও ফল ছিদ্রকারী পোকা',
      passage: 'বেগুনের ডগা ও ফল ছিদ্রকারী পোকা দমনে আক্রান্ত ডগা কেটে ধ্বংস করুন ও সেক্স ফেরোমোন ফাঁদ ব্যবহার করুন। প্রয়োজনে স্পাইনোস্যাড বা এমামেক্টিন বেনজোয়েট স্প্রে করুন। বেগুন তোলার ৭ দিন আগে স্প্রে বন্ধ রাখুন।',
      relevanceScore: 1.0
    }
  ];

  public async retrieveRelevantPassages(
    query: string,
    crop: string = 'ধান',
    topK: number = 3
  ): Promise<RetrievedChunk[]> {
    const delimiters = /[\s।,\?—]+/;
    const queryTokens = query.split(delimiters).filter(t => t.length > 2);

    const scored = this.knowledgeBase.map(chunk => {
      let score = 0.0;
      if (
        chunk.crop.toLowerCase().includes(crop.toLowerCase()) ||
        crop.toLowerCase().includes(chunk.crop.toLowerCase())
      ) {
        score += 2.0;
      }

      for (const token of queryTokens) {
        if (chunk.passage.toLowerCase().includes(token.toLowerCase())) {
          score += 1.5;
        }
        if (chunk.topic.toLowerCase().includes(token.toLowerCase())) {
          score += 3.0;
        }
      }

      return {
        ...chunk,
        relevanceScore: score
      };
    });

    return scored
      .filter(item => item.relevanceScore > 1.5)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK);
  }
}
