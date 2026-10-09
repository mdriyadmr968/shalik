import { PesticideSafetyGuard } from '../src/core/data/safety/PesticideSafetyGuard';

describe('PesticideSafetyGuard', () => {
  let guard: PesticideSafetyGuard;

  beforeEach(() => {
    guard = new PesticideSafetyGuard();
  });

  it('should block responses containing Paraquat (প্যারা কোয়াট)', () => {
    const response = 'আগাছা দমনে জমিতে প্যারা কোয়াট স্প্রে করতে পারেন।';
    const result = guard.validateAndSanitize(response, 0.9);

    expect(result.isApproved).toBe(false);
    expect(result.detectedViolations.length).toBeGreaterThan(0);
    expect(result.requiresHelplineEscalation).toBe(true);
    expect(result.sanitizedResponse).toContain('সরকারিভাবে নিষিদ্ধ বালাইনাশকের নাম পাওয়া গেছে');
    expect(result.sanitizedResponse).toContain('১৬১২৩');
  });

  it('should block responses containing Endosulfan (এনডোসালফান)', () => {
    const response = 'পোকা দমনে এনডোসালফান বা endosulfan প্রয়োগ করুন।';
    const result = guard.validateAndSanitize(response, 0.9);

    expect(result.isApproved).toBe(false);
    expect(result.detectedViolations.length).toBeGreaterThan(0);
    expect(result.requiresHelplineEscalation).toBe(true);
  });

  it('should block responses containing Carbofuran (কার্বোফিউরান)', () => {
    const response = 'মাজরা পোকার জন্য জমিতে কার্বোফিউরান ছিটিয়ে দিন।';
    const result = guard.validateAndSanitize(response, 0.9);

    expect(result.isApproved).toBe(false);
    expect(result.detectedViolations.length).toBeGreaterThan(0);
  });

  it('should block responses containing DDT (ডিডিটি)', () => {
    const response = 'পোকা মারতে ডিডিটি পাউডার ব্যবহার করুন।';
    const result = guard.validateAndSanitize(response, 0.9);

    expect(result.isApproved).toBe(false);
    expect(result.detectedViolations.length).toBeGreaterThan(0);
  });

  it('should escalate ambiguous/low confidence advice (< 0.45) to 16123 helpline', () => {
    const response = 'লক্ষণটি স্পষ্ট নয়, সম্ভবত ছত্রাক হতে পারে।';
    const result = guard.validateAndSanitize(response, 0.35);

    expect(result.isApproved).toBe(true);
    expect(result.requiresHelplineEscalation).toBe(true);
    expect(result.sanitizedResponse).toContain('কৃষি কল সেন্টার ১৬১২৩-এ কল করে');
  });

  it('should allow approved safe agrochemical advice', () => {
    const response = 'ধানের ব্লাস্ট রোগে ট্রাইসাইক্লাজোল গ্রুপের অনুমোদিত ছত্রাকনাশক স্প্রে করুন।';
    const result = guard.validateAndSanitize(response, 0.95);

    expect(result.isApproved).toBe(true);
    expect(result.detectedViolations.length).toBe(0);
    expect(result.requiresHelplineEscalation).toBe(false);
    expect(result.sanitizedResponse).toBe(response);
  });
});
