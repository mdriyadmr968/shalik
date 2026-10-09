export interface SafetyCheckResult {
  isApproved: Boolean;
  sanitizedResponse: string;
  detectedViolations: string[];
  requiresHelplineEscalation: boolean;
}

export class PesticideSafetyGuard {
  private readonly bannedPesticidesBn = [
    'প্যারা কোয়াট',
    'প্যারা কোয়াট',
    'paraquat',
    'এনডোসালফান',
    'endosulfan',
    'কার্বোফিউরান',
    'carbofuran',
    'মনোক্রোটোফস',
    'monocrotophos',
    'ডিডিটি',
    'ddt'
  ];

  public validateAndSanitize(
    response: string,
    modelConfidence: number = 0.9,
    language: 'bn' | 'en' = 'bn'
  ): SafetyCheckResult {
    const violations: string[] = [];
    const lower = response.toLowerCase();

    for (const banned of this.bannedPesticidesBn) {
      if (lower.includes(banned.toLowerCase())) {
        violations.push(
          language === 'en'
            ? `Banned pesticide detected: ${banned}`
            : `নিষিদ্ধ বালাইনাশক সনাক্ত হয়েছে: ${banned}`
        );
      }
    }

    const lowConfidence = modelConfidence < 0.45;

    let sanitized: string;
    if (violations.length > 0) {
      if (language === 'en') {
        sanitized =
          '⚠️ Warning: Government-banned agrochemicals have been detected in this recommendation. ' +
          'Please do not apply prohibited toxic chemicals that endanger health and the environment. ' +
          'For officially approved safe remedies, contact your local Sub-Assistant Agriculture Officer (SAAO) or Krishi Call Center 16123.';
      } else {
        sanitized =
          '⚠️ সতর্কবার্তা: আপনার উল্লেখিত প্রতিকারে সরকারিভাবে নিষিদ্ধ বালাইনাশকের নাম পাওয়া গেছে। ' +
          'দয়া করে পরিবেশ ও মানবদেহের জন্য ঝুঁকিপূর্ণ নিষিদ্ধ বিষ প্রয়োগ করবেন না। ' +
          'অনুমোদিত নিরাপদ বালাইনাশকের সঠিক তালিকার জন্য আপনার এলাকার উপ-সহকারী কৃষি কর্মকর্তা (SAAO) বা কৃষি কল সেন্টার ১৬১২৩-এ যোগাযোগ করুন।';
      }
    } else if (lowConfidence) {
      if (language === 'en') {
        sanitized =
          `${response}\n\n⚠️ Shalik Advisory: The symptom description is somewhat ambiguous. ` +
          'To avoid incorrect application, please call Krishi Call Center 16123 to speak directly with an agricultural specialist.';
      } else {
        sanitized =
          `${response}\n\n⚠️ শালিকের পরামর্শ: লক্ষণটি কিছুটা অস্পষ্ট হওয়ায় পূর্ণ নিশ্চিত হওয়া যায়নি। ` +
          'ভুল প্রয়োগ এড়াতে অনুগ্রহ করে কৃষি কল সেন্টার ১৬১২৩-এ কল করে কৃষি বিশেষজ্ঞের সাথে কথা বলুন।';
      }
    } else {
      sanitized = response;
    }

    return {
      isApproved: violations.length === 0,
      sanitizedResponse: sanitized,
      detectedViolations: violations,
      requiresHelplineEscalation: lowConfidence || violations.length > 0
    };
  }
}
