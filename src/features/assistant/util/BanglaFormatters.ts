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

  public static toBanglaDigits(input: string | number): string {
    const str = String(input);
    return str
      .split('')
      .map(ch => BanglaFormatters.englishToBanglaDigits[ch] || ch)
      .join('');
  }

  public static formatDigits(input: string | number, language: 'bn' | 'en' = 'bn'): string {
    if (language === 'en') {
      return String(input);
    }
    return BanglaFormatters.toBanglaDigits(input);
  }
}
