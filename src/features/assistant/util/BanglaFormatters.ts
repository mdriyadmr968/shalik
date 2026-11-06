export class BanglaFormatters {
  private static readonly englishToBanglaDigits: Record<string, string> = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯'
  };

  private static readonly banglaToEnglishDigits: Record<string, string> = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9'
  };

  public static toBanglaDigits(input: string | number): string {
    const str = String(input);
    return str
      .split('')
      .map(ch => BanglaFormatters.englishToBanglaDigits[ch] || ch)
      .join('');
  }

  public static toEnglishDigits(input: string | number): string {
    const str = String(input);
    return str
      .split('')
      .map(ch => BanglaFormatters.banglaToEnglishDigits[ch] || ch)
      .join('');
  }

  public static formatDigits(input: string | number, language: 'bn' | 'en' = 'bn'): string {
    if (language === 'en') {
      return String(input);
    }
    return BanglaFormatters.toBanglaDigits(input);
  }
}
