import { BanglaFormatters } from '../src/features/assistant/util/BanglaFormatters';

describe('BanglaFormatters', () => {
  it('should convert English digits to Bangla numerals', () => {
    expect(BanglaFormatters.toBanglaDigits('0123456789')).toBe('০১২৩৪৫৬৭৮৯');
    expect(BanglaFormatters.toBanglaDigits(16123)).toBe('১৬১২৩');
    expect(BanglaFormatters.toBanglaDigits(25)).toBe('২৫');
  });

  it('should convert Bangla numerals to English digits', () => {
    expect(BanglaFormatters.toEnglishDigits('০১২৩৪৫৬৭৮৯')).toBe('0123456789');
    expect(BanglaFormatters.toEnglishDigits('০১৭১১০০০০০১')).toBe('01711000001');
    expect(BanglaFormatters.toEnglishDigits('১২৩৪')).toBe('1234');
  });

  it('should preserve non-digit characters unchanged', () => {
    expect(BanglaFormatters.toBanglaDigits('তাপমাত্রা 38°C')).toBe('তাপমাত্রা ৩৮°C');
    expect(BanglaFormatters.toEnglishDigits('তাপমাত্রা ৩৮°C')).toBe('তাপমাত্রা 38°C');
  });
});
