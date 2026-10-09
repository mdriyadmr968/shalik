export interface PromptContext {
  farmerQuestion: string;
  cropName?: string;
  district?: string;
  hasImageAttached?: boolean;
  classifierTopLabel?: string | null;
  classifierConfidence?: number | null;
  activeWeatherAlert?: string | null;
  retrievedKnowledgePassages?: string[];
  language?: 'bn' | 'en';
}

export class MultimodalPromptBuilder {
  public buildPrompt(context: PromptContext): string {
    const isEn = context.language === 'en';
    const crop = context.cropName || (isEn ? 'Rice' : 'ধান');
    const district = context.district || '';
    const season = isEn
      ? this.determineCurrentEnglishSeason()
      : this.determineCurrentBanglaSeason();

    const parts: string[] = [];

    if (isEn) {
      let contextLine = `Current Context: Season - ${season}, Crop - ${crop}`;
      if (district.trim().length > 0) {
        contextLine += `, District - ${district}`;
      }
      parts.push(contextLine);

      if (context.activeWeatherAlert) {
        parts.push(`⚠️ Active Disaster Warning: ${context.activeWeatherAlert}`);
      }

      if (context.hasImageAttached && context.classifierTopLabel) {
        const confPct = Math.round((context.classifierConfidence ?? 0.9) * 100);
        parts.push(
          `Leaf Photo Symptom Diagnosis: ${context.classifierTopLabel} (Confidence ${confPct}%)`
        );
      }

      if (context.retrievedKnowledgePassages && context.retrievedKnowledgePassages.length > 0) {
        parts.push('\nOfficial Agricultural Extension Reference Data:');
        context.retrievedKnowledgePassages.forEach((passage, i) => {
          parts.push(`[Source ${i + 1}]: ${passage}`);
        });
        parts.push(
          'Please answer concisely based on the verified references above and cite the sources.'
        );
      }

      parts.push(`\nFarmer's Query: ${context.farmerQuestion}`);
    } else {
      let contextLine = `বর্তমান প্রেক্ষাপট: ঋতু - ${season}, ফসল - ${crop}`;
      if (district.trim().length > 0) {
        contextLine += `, জেলা - ${district}`;
      }
      parts.push(contextLine);

      if (context.activeWeatherAlert) {
        parts.push(`⚠️ সক্রিয় দুর্যোগ সতর্কতা: ${context.activeWeatherAlert}`);
      }

      if (context.hasImageAttached && context.classifierTopLabel) {
        const confPct = Math.round((context.classifierConfidence ?? 0.9) * 100);
        parts.push(
          `পাতার ছবির লক্ষণ শনাক্তকরণ: ${context.classifierTopLabel} (সম্ভাব্যতা ${confPct}%)`
        );
      }

      if (context.retrievedKnowledgePassages && context.retrievedKnowledgePassages.length > 0) {
        parts.push('\nঅনুমোদিত কৃষি সম্প্রসারণ রেফারেন্স তথ্য:');
        context.retrievedKnowledgePassages.forEach((passage, i) => {
          parts.push(`[উৎস ${i + 1}]: ${passage}`);
        });
        parts.push(
          'অনুগ্রহ করে উপরের বিশ্বস্ত তথ্যের ওপর ভিত্তি করে উত্তর দিন এবং উত্তরের শেষে উৎস উল্লেখ করুন।'
        );
      }

      parts.push(`\nকৃষকের প্রশ্ন: ${context.farmerQuestion}`);
    }

    return parts.join('\n');
  }

  public determineCurrentBanglaSeason(date: Date = new Date()): string {
    const month = date.getMonth() + 1; // 1-12
    switch (month) {
      case 4:
      case 5:
        return 'গ্রীষ্মকাল (বোরো কর্তন ও আউশ আবাদ)';
      case 6:
      case 7:
        return 'বর্ষাকাল (রোপা আমন বীজতলা ও রোপণ)';
      case 8:
      case 9:
        return 'শরৎকাল (আমন ফসলের পরিচর্যা)';
      case 10:
      case 11:
        return 'হেমন্তকাল (আমন ধান কর্তন ও রবি ফসল সূচনা)';
      case 12:
      case 1:
        return 'শীতকাল (বোরো ধানের বীজতলা ও রবি শাকসবজি)';
      case 2:
      case 3:
        return 'বসন্তকাল (বোরো ফসলের বৃদ্ধি ও সেচ)';
      default:
        return 'চলতি মৌসুম';
    }
  }

  public determineCurrentEnglishSeason(date: Date = new Date()): string {
    const month = date.getMonth() + 1;
    switch (month) {
      case 4:
      case 5:
        return 'Summer (Boro harvest & Aus planting)';
      case 6:
      case 7:
        return 'Monsoon (T. Aman seedbed & transplanting)';
      case 8:
      case 9:
        return 'Autumn (Aman vegetative care)';
      case 10:
      case 11:
        return 'Late Autumn (Aman harvest & early Rabi crops)';
      case 12:
      case 1:
        return 'Winter (Boro seedbed & winter vegetables)';
      case 2:
      case 3:
        return 'Spring (Boro tillering & irrigation)';
      default:
        return 'Current season';
    }
  }
}
