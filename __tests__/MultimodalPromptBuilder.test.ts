import { MultimodalPromptBuilder } from '../src/features/assistant/prompt/MultimodalPromptBuilder';

describe('MultimodalPromptBuilder', () => {
  let builder: MultimodalPromptBuilder;

  beforeEach(() => {
    builder = new MultimodalPromptBuilder();
  });

  it('should determine appropriate Bangla season based on date', () => {
    const mayDate = new Date(2026, 4, 15); // Month index 4 is May
    const seasonMay = builder.determineCurrentBanglaSeason(mayDate);
    expect(seasonMay).toContain('গ্রীষ্মকাল');

    const julyDate = new Date(2026, 6, 15); // July
    const seasonJuly = builder.determineCurrentBanglaSeason(julyDate);
    expect(seasonJuly).toContain('বর্ষাকাল');

    const decDate = new Date(2026, 11, 15); // December
    const seasonDec = builder.determineCurrentBanglaSeason(decDate);
    expect(seasonDec).toContain('শীতকাল');
  });

  it('should build prompt with weather alert and knowledge passages', () => {
    const prompt = builder.buildPrompt({
      farmerQuestion: 'আমার ধানের পাতায় দাগ, কি করব?',
      cropName: 'ধান',
      district: 'কুড়িগ্রাম',
      activeWeatherAlert: 'বিপদ সংকেত: বন্যা পূর্বাভাস',
      hasImageAttached: true,
      classifierTopLabel: 'ব্লাস্ট রোগ',
      classifierConfidence: 0.94,
      retrievedKnowledgePassages: ['ব্লাস্ট রোগ: ট্রাইসাইক্লাজোল স্প্রে করুন (BRRI)']
    });

    expect(prompt).toContain('বর্তমান প্রেক্ষাপট:');
    expect(prompt).toContain('ফসল - ধান');
    expect(prompt).toContain('জেলা - কুড়িগ্রাম');
    expect(prompt).toContain('⚠️ সক্রিয় দুর্যোগ সতর্কতা: বিপদ সংকেত: বন্যা পূর্বাভাস');
    expect(prompt).toContain('পাতার ছবির লক্ষণ শনাক্তকরণ: ব্লাস্ট রোগ (সম্ভাব্যতা 94%)');
    expect(prompt).toContain('[উৎস 1]: ব্লাস্ট রোগ: ট্রাইসাইক্লাজোল স্প্রে করুন (BRRI)');
    expect(prompt).toContain('কৃষকের প্রশ্ন: আমার ধানের পাতায় দাগ, কি করব?');
  });
});
