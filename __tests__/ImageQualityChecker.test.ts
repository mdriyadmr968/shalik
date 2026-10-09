import { ImageQualityChecker } from '../src/features/assistant/vision/ImageQualityChecker';

describe('ImageQualityChecker', () => {
  let checker: ImageQualityChecker;

  beforeEach(() => {
    checker = new ImageQualityChecker();
  });

  it('should flag low luminance (< 40) as too dark with Bangla message', () => {
    const result = checker.evaluateImageQuality(25);
    expect(result.isGoodQuality).toBe(false);
    expect(result.isTooDark).toBe(true);
    expect(result.isTooBright).toBe(false);
    expect(result.warningMessageBn).toContain('বেশি অন্ধকার');
  });

  it('should flag high luminance (> 225) as too bright with Bangla message', () => {
    const result = checker.evaluateImageQuality(240);
    expect(result.isGoodQuality).toBe(false);
    expect(result.isTooDark).toBe(false);
    expect(result.isTooBright).toBe(true);
    expect(result.warningMessageBn).toContain('অতিরিক্ত রোদ বা আলো');
  });

  it('should accept balanced luminance as good quality without warning', () => {
    const result = checker.evaluateImageQuality(135);
    expect(result.isGoodQuality).toBe(true);
    expect(result.isTooDark).toBe(false);
    expect(result.isTooBright).toBe(false);
    expect(result.warningMessageBn).toBeNull();
  });
});
