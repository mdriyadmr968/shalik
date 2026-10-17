import { LanguageManager } from '../../../i18n/LanguageManager';
import { Language } from '../../../i18n/translations';

export interface QualityCheckResult {
  isGoodQuality: boolean;
  averageLuminance: number;
  isTooDark: boolean;
  isTooBright: boolean;
  warningMessageBn: string | null;
  warningMessageEn: string | null;
  warningMessage: string | null;
}

export class ImageQualityChecker {
  public evaluateImageQuality(
    simulatedLuminance: number = 128,
    lang?: Language
  ): QualityCheckResult {
    const isTooDark = simulatedLuminance < 40.0;
    const isTooBright = simulatedLuminance > 225.0;

    const currentLang = lang || LanguageManager.getInstance().getLanguage();

    let warningBn: string | null = null;
    let warningEn: string | null = null;

    if (isTooDark) {
      warningBn = 'ছবিটি বেশি অন্ধকার। দিনের আলোয় বা ফ্ল্যাশ দিয়ে ছবি তুলুন।';
      warningEn = 'Image is too dark. Please take photo in daylight or with flash.';
    } else if (isTooBright) {
      warningBn = 'ছবিতে অতিরিক্ত রোদ বা আলো পড়েছে। ছায়ায় ধরে ছবি তুলুন।';
      warningEn = 'Image is overexposed to harsh sunlight. Please take photo in partial shade.';
    }

    const warning = currentLang === 'en' ? warningEn : warningBn;

    return {
      isGoodQuality: !isTooDark && !isTooBright,
      averageLuminance: simulatedLuminance,
      isTooDark,
      isTooBright,
      warningMessageBn: warningBn,
      warningMessageEn: warningEn,
      warningMessage: warning
    };
  }
}
