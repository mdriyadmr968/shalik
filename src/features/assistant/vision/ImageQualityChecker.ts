export interface QualityCheckResult {
  isGoodQuality: boolean;
  averageLuminance: number;
  isTooDark: boolean;
  isTooBright: boolean;
  warningMessageBn: string | null;
}

export class ImageQualityChecker {
  public evaluateImageQuality(simulatedLuminance: number = 128): QualityCheckResult {
    const isTooDark = simulatedLuminance < 40.0;
    const isTooBright = simulatedLuminance > 225.0;

    let warning: string | null = null;
    if (isTooDark) {
      warning = 'ছবিটি বেশি অন্ধকার। দিনের আলোয় বা ফ্ল্যাশ দিয়ে ছবি তুলুন।';
    } else if (isTooBright) {
      warning = 'ছবিতে অতিরিক্ত রোদ বা আলো পড়েছে। ছায়ায় ধরে ছবি তুলুন।';
    }

    return {
      isGoodQuality: !isTooDark && !isTooBright,
      averageLuminance: simulatedLuminance,
      isTooDark,
      isTooBright,
      warningMessageBn: warning
    };
  }
}
