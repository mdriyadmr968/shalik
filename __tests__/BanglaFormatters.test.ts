import { BanglaFormatters } from '../src/features/assistant/util/BanglaFormatters';

describe('BanglaFormatters', () => {
  it('should convert English digits to Bangla numerals', () => {
    expect(BanglaFormatters.toBanglaDigits('0123456789')).toBe('০১২৩৪৫৬৭৮৯');
    expect(BanglaFormatters.toBanglaDigits(16123)).toBe('১৬১২৩');
    expect(BanglaFormatters.toBanglaDigits(25)).toBe('২৫');
  });

  it('should preserve non-digit characters unchanged', () => {
    expect(BanglaFormatters.toBanglaDigits('তাপমাত্রা 38°C')).toBe('তাপমাত্রা ৩৮°C');
  });
});
