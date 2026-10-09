import { Language, translations, Translations } from './translations';
import { FarmerProfileRepository } from '../core/data/repository/FarmerProfileRepository';

type LanguageListener = (lang: Language) => void;

export class LanguageManager {
  private static instance: LanguageManager | null = null;
  private currentLanguage: Language = 'bn';
  private listeners: Set<LanguageListener> = new Set();
  private profileRepo: FarmerProfileRepository | null = null;

  private constructor() {
    this.profileRepo = new FarmerProfileRepository();
    this.initFromProfile();
  }

  public static getInstance(): LanguageManager {
    if (!LanguageManager.instance) {
      LanguageManager.instance = new LanguageManager();
    }
    return LanguageManager.instance;
  }

  private async initFromProfile() {
    if (this.profileRepo) {
      try {
        const profile = await this.profileRepo.getFarmerProfile();
        if (profile.preferredLanguage === 'en' || profile.preferredLanguage === 'bn') {
          this.currentLanguage = profile.preferredLanguage;
          this.notify();
        }
      } catch (e) {
        // Fallback to default 'bn'
      }
    }
  }

  public getLanguage(): Language {
    return this.currentLanguage;
  }

  public getTranslations(): Translations {
    return translations[this.currentLanguage];
  }

  public async setLanguage(lang: Language): Promise<void> {
    if (this.currentLanguage === lang) return;
    this.currentLanguage = lang;
    this.notify();

    if (this.profileRepo) {
      try {
        const profile = await this.profileRepo.getFarmerProfile();
        await this.profileRepo.saveProfile({
          ...profile,
          preferredLanguage: lang
        });
      } catch (e) {
        // no-op
      }
    }
  }

  public toggleLanguage(): Promise<void> {
    const nextLang = this.currentLanguage === 'bn' ? 'en' : 'bn';
    return this.setLanguage(nextLang);
  }

  public subscribe(listener: LanguageListener): () => void {
    this.listeners.add(listener);
    listener(this.currentLanguage);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try { fn(this.currentLanguage); } catch (e) { /* no-op */ }
    });
  }
}
