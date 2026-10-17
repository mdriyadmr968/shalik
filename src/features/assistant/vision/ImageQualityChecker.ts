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

  /**
   * Evaluates average perceptual luminance from an image data URL or image source using an offscreen HTML canvas.
   * Returns a luminance value in the range [0, 255].
   * Falls back gracefully to 128 if canvas or image loading is unavailable (e.g. Node/SSR).
   */
  public static async analyzeImageLuminance(imageSrc: string): Promise<number> {
    if (typeof Image === 'undefined' || typeof document === 'undefined') {
      return 128;
    }

    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const sampleSize = 64; // Downscale to 64x64 for fast luminance analysis
            canvas.width = sampleSize;
            canvas.height = sampleSize;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(128);
              return;
            }
            ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
            const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
            const data = imageData.data;
            let totalLuminance = 0;
            const pixelCount = sampleSize * sampleSize;

            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              // Standard ITU-R BT.601 perceptual luminance formula
              totalLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
            }

            resolve(totalLuminance / pixelCount);
          } catch (e) {
            resolve(128);
          }
        };
        img.onerror = () => resolve(128);
        img.src = imageSrc;
      } catch (err) {
        resolve(128);
      }
    });
  }
}
