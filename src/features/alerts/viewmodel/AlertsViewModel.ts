import { ShalikAlert } from '../../../core/data/models/Alert';
import { AlertRepository } from '../../../core/data/repository/AlertRepository';
import { FarmerProfileRepository } from '../../../core/data/repository/FarmerProfileRepository';
import { ActionTemplate, AlertActionTemplates } from '../template/AlertActionTemplates';
import { BanglaTextToSpeech } from '../../assistant/speech/BanglaTextToSpeech';

export interface AlertsUiState {
  alerts: ShalikAlert[];
  selectedAlert: ShalikAlert | null;
  selectedTemplates: ActionTemplate[];
  isSpeaking: boolean;
}

export class AlertsViewModel {
  private alertRepository: AlertRepository;
  private profileRepository: FarmerProfileRepository;
  private tts: BanglaTextToSpeech;

  private state: AlertsUiState;
  private listeners: Set<(state: AlertsUiState) => void> = new Set();

  constructor(
    alertRepository: AlertRepository = new AlertRepository(),
    profileRepository: FarmerProfileRepository = new FarmerProfileRepository()
  ) {
    this.alertRepository = alertRepository;
    this.profileRepository = profileRepository;
    this.tts = new BanglaTextToSpeech();

    this.state = {
      alerts: [],
      selectedAlert: null,
      selectedTemplates: [],
      isSpeaking: false
    };

    this.init();
  }

  private async init() {
    this.tts.subscribe(ttsState => {
      this.setState({ isSpeaking: ttsState.type === 'Speaking' });
    });

    this.alertRepository.subscribe(async () => {
      await this.refreshAlerts();
    });

    await this.refreshAlerts();
  }

  public getState(): AlertsUiState {
    return this.state;
  }

  public subscribe(listener: (state: AlertsUiState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private setState(updates: Partial<AlertsUiState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(fn => fn(this.state));
  }

  public async refreshAlerts(): Promise<void> {
    const list = await this.alertRepository.getAllAlerts();
    this.setState({ alerts: list });
  }

  public async selectAlert(alert: ShalikAlert): Promise<void> {
    const profile = await this.profileRepository.getFarmerProfile();
    const primaryCrop = profile.primaryCrops[0] || 'ধান';
    const templates = AlertActionTemplates.getTemplatesForAlert(alert.type, primaryCrop);

    this.setState({
      selectedAlert: alert,
      selectedTemplates: templates
    });

    await this.alertRepository.markAsRead(alert.id);
  }

  public dismissDetail(): void {
    this.setState({
      selectedAlert: null,
      selectedTemplates: []
    });
  }

  public playAlertAudio(text: string): void {
    this.tts.speak(text);
  }

  public stopAudio(): void {
    this.tts.stop();
  }
}
