import { LanguageManager } from '../src/i18n/LanguageManager';
import { MultimodalPromptBuilder } from '../src/features/assistant/prompt/MultimodalPromptBuilder';
import { PesticideSafetyGuard } from '../src/core/data/safety/PesticideSafetyGuard';
import { AlertActionTemplates } from '../src/features/alerts/template/AlertActionTemplates';
import { AlertType } from '../src/core/data/models/Alert';

describe('LanguageManager and Bilingual Support', () => {
  let langManager: LanguageManager;

  beforeEach(() => {
    langManager = LanguageManager.getInstance();
  });

  it('should support language toggling between Bengali and English', async () => {
    await langManager.setLanguage('bn');
    expect(langManager.getLanguage()).toBe('bn');
    let t = langManager.getTranslations();
    expect(t.tabAssistant).toBe('পরামর্শ');
    expect(t.appTitle).toBe('শালিক (Shalik)');

    await langManager.toggleLanguage();
    expect(langManager.getLanguage()).toBe('en');
    t = langManager.getTranslations();
    expect(t.tabAssistant).toBe('Assistant');
    expect(t.appTitle).toBe('Shalik');

    await langManager.toggleLanguage();
    expect(langManager.getLanguage()).toBe('bn');
  });

  it('should notify subscribers when language changes', async () => {
    const received: string[] = [];
    const unsub = langManager.subscribe(l => {
      received.push(l);
    });

    await langManager.setLanguage('en');
    await langManager.setLanguage('bn');
    unsub();

    expect(received).toContain('en');
    expect(received).toContain('bn');
  });

  it('should build English multimodal prompt when language is en', () => {
    const promptBuilder = new MultimodalPromptBuilder();
    const prompt = promptBuilder.buildPrompt({
      farmerQuestion: 'Brown spots on leaves',
      cropName: 'Rice',
      district: 'Kurigram',
      language: 'en'
    });

    expect(prompt).toContain('Current Context:');
    expect(prompt).toContain('Crop - Rice');
    expect(prompt).toContain('District - Kurigram');
    expect(prompt).toContain("Farmer's Query: Brown spots on leaves");
  });

  it('should produce English pesticide safety warnings when language is en', () => {
    const safetyGuard = new PesticideSafetyGuard();
    const result = safetyGuard.validateAndSanitize(
      'Apply paraquat herbicide on your field',
      0.9,
      'en'
    );

    expect(result.isApproved).toBe(false);
    expect(result.sanitizedResponse).toContain('Warning: Government-banned agrochemicals');
    expect(result.sanitizedResponse).toContain('16123');
  });

  it('should provide English action steps for alerts', () => {
    const templates = AlertActionTemplates.getTemplatesForAlert(AlertType.FLOOD, 'ধান');
    expect(templates.length).toBeGreaterThan(0);
    const floodTemplate = templates[0];
    expect(floodTemplate.titleEn).toContain('Pre-Flood Rapid Harvest');
    expect(floodTemplate.actionStepsEn.length).toBeGreaterThan(0);
    expect(floodTemplate.urgencyNoteEn).toContain('Urgent:');
  });
});
