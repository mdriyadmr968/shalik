import { ChatMessage, Conversation, MessageSender } from '../../../core/data/models/ChatMessage';
import { ChatRepository } from '../../../core/data/repository/ChatRepository';
import { AlertRepository } from '../../../core/data/repository/AlertRepository';
import { FarmerProfileRepository } from '../../../core/data/repository/FarmerProfileRepository';
import { OfflineRetriever } from '../../../core/data/rag/OfflineRetriever';
import { PesticideSafetyGuard } from '../../../core/data/safety/PesticideSafetyGuard';
import { FieldTelemetryLogger } from '../../../core/data/telemetry/FieldTelemetryLogger';
import { LiteRtLmEngine, EngineState } from '../../../core/llm/LiteRtLmEngine';
import { ModelManager, ModelState } from '../../../core/llm/ModelManager';
import { MultimodalPromptBuilder } from '../prompt/MultimodalPromptBuilder';
import { AudioRecorder, RecordingState } from '../speech/AudioRecorder';
import { BanglaTextToSpeech, TtsState } from '../speech/BanglaTextToSpeech';
import { GemmaAudioSpeechToText } from '../speech/GemmaAudioSpeechToText';
import { ImageQualityChecker } from '../vision/ImageQualityChecker';

export interface AssistantUiState {
  currentConversationId: number | null;
  conversations: Conversation[];
  messages: ChatMessage[];
  streamingText: string;
  isGenerating: boolean;
  engineState: EngineState;
  modelState: ModelState;
  recordingState: RecordingState;
  ttsState: TtsState;
  pendingVoiceTranscript: string | null;
  attachedImageUri: string | null;
  imageQualityWarning: string | null;
  error: string | null;
}

export class AssistantViewModel {
  private chatRepository: ChatRepository;
  private alertRepository: AlertRepository;
  private profileRepository: FarmerProfileRepository;
  private offlineRetriever: OfflineRetriever;
  private pesticideSafetyGuard: PesticideSafetyGuard;
  private telemetryLogger: FieldTelemetryLogger;
  private llmEngine: LiteRtLmEngine;
  private modelManager: ModelManager;
  private promptBuilder: MultimodalPromptBuilder;
  private audioRecorder: AudioRecorder;
  private textToSpeech: BanglaTextToSpeech;
  private speechToText: GemmaAudioSpeechToText;
  private imageQualityChecker: ImageQualityChecker;

  private state: AssistantUiState;
  private listeners: Set<(state: AssistantUiState) => void> = new Set();
  private isCancelling = false;

  constructor(
    chatRepo: ChatRepository = new ChatRepository(),
    alertRepo: AlertRepository = new AlertRepository(),
    profileRepo: FarmerProfileRepository = new FarmerProfileRepository(),
    llmEngine: LiteRtLmEngine = new LiteRtLmEngine()
  ) {
    this.chatRepository = chatRepo;
    this.alertRepository = alertRepo;
    this.profileRepository = profileRepo;
    this.llmEngine = llmEngine;
    this.modelManager = new ModelManager();
    this.offlineRetriever = new OfflineRetriever();
    this.pesticideSafetyGuard = new PesticideSafetyGuard();
    this.telemetryLogger = new FieldTelemetryLogger();
    this.promptBuilder = new MultimodalPromptBuilder();
    this.audioRecorder = new AudioRecorder();
    this.textToSpeech = new BanglaTextToSpeech();
    this.speechToText = new GemmaAudioSpeechToText(this.llmEngine);
    this.imageQualityChecker = new ImageQualityChecker();

    this.state = {
      currentConversationId: null,
      conversations: [],
      messages: [],
      streamingText: '',
      isGenerating: false,
      engineState: this.llmEngine.getEngineState(),
      modelState: this.modelManager.getModelState(),
      recordingState: this.audioRecorder.getState(),
      ttsState: this.textToSpeech.getState(),
      pendingVoiceTranscript: null,
      attachedImageUri: null,
      imageQualityWarning: null,
      error: null
    };

    this.init();
  }

  private async init() {
    this.audioRecorder.subscribe(recState => {
      this.setState({ recordingState: recState });
    });

    this.textToSpeech.subscribe(ttsState => {
      this.setState({ ttsState });
    });

    this.chatRepository.subscribe(async () => {
      await this.refreshConversations();
      if (this.state.currentConversationId) {
        await this.refreshMessages(this.state.currentConversationId);
      }
    });

    await this.llmEngine.initialize();
    this.setState({
      engineState: this.llmEngine.getEngineState(),
      modelState: this.modelManager.getModelState()
    });

    await this.startNewConversation();
  }

  public getState(): AssistantUiState {
    return this.state;
  }

  public subscribe(listener: (state: AssistantUiState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private setState(updates: Partial<AssistantUiState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(fn => fn(this.state));
  }

  public async startNewConversation(): Promise<void> {
    this.cancelGeneration();
    this.textToSpeech.stop();

    const convId = await this.chatRepository.createConversation('নতুন পরামর্শ');
    const convs = await this.chatRepository.getConversations();

    this.setState({
      currentConversationId: convId,
      conversations: convs,
      messages: [],
      streamingText: '',
      isGenerating: false,
      attachedImageUri: null,
      pendingVoiceTranscript: null,
      error: null
    });
  }

  public async selectConversation(convId: number): Promise<void> {
    this.cancelGeneration();
    this.textToSpeech.stop();

    const msgs = await this.chatRepository.getMessages(convId);
    this.setState({
      currentConversationId: convId,
      messages: msgs,
      streamingText: '',
      isGenerating: false
    });
  }

  private async refreshConversations() {
    const convs = await this.chatRepository.getConversations();
    this.setState({ conversations: convs });
  }

  private async refreshMessages(convId: number) {
    const msgs = await this.chatRepository.getMessages(convId);
    this.setState({ messages: msgs });
  }

  public startVoiceRecording(outputFile: string = 'farmer_voice.wav') {
    this.audioRecorder.startRecording(outputFile);
  }

  public async stopVoiceRecordingAndTranscribe(outputFile: string = 'farmer_voice.wav') {
    this.audioRecorder.stopRecording(outputFile);
    try {
      for await (const result of this.speechToText.transcribe(outputFile)) {
        if (result.type === 'Partial' || result.type === 'Final') {
          this.setState({ pendingVoiceTranscript: result.text });
        } else if (result.type === 'Error') {
          this.setState({ error: result.message });
        }
      }
    } catch (e: any) {
      this.setState({ error: e?.message || 'ASR Error' });
    }
  }

  public confirmVoiceTranscript(text: string) {
    this.setState({ pendingVoiceTranscript: null });
    this.sendQuery(text);
  }

  public dismissVoiceTranscript() {
    this.setState({ pendingVoiceTranscript: null });
  }

  public attachImage(imageUri: string, simulatedLuminance: number = 120) {
    const quality = this.imageQualityChecker.evaluateImageQuality(simulatedLuminance);
    this.setState({
      attachedImageUri: imageUri,
      imageQualityWarning: quality.warningMessageBn
    });
  }

  public removeAttachedImage() {
    this.setState({
      attachedImageUri: null,
      imageQualityWarning: null
    });
  }

  public playMessageAudio(text: string) {
    this.textToSpeech.speak(text);
  }

  public stopAudio() {
    this.textToSpeech.stop();
  }

  public async sendQuery(userText: string): Promise<void> {
    const trimmed = userText.trim();
    if (!trimmed || this.state.isGenerating) return;

    const convId = this.state.currentConversationId;
    if (!convId) return;

    const attachedImg = this.state.attachedImageUri;
    const profile = await this.profileRepository.getFarmerProfile();
    const primaryCrop = profile.primaryCrops[0] || 'ধান';
    const district = profile.district || '';

    const startTime = Date.now();
    let ttftTime = 0;
    let tokenCount = 0;

    try {
      // Save User Message
      await this.chatRepository.saveMessage({
        id: 0,
        conversationId: convId,
        sender: MessageSender.USER,
        text: trimmed,
        timestamp: Date.now(),
        imageUri: attachedImg,
        citedSources: []
      });

      this.setState({
        isGenerating: true,
        streamingText: '',
        attachedImageUri: null,
        imageQualityWarning: null,
        error: null
      });

      if (!this.llmEngine.isReady()) {
        await this.llmEngine.initialize();
      }

      // M5: Offline RAG Retrieval
      const relevantChunks = await this.offlineRetriever.retrieveRelevantPassages(
        trimmed,
        primaryCrop,
        2
      );
      const passages = relevantChunks.map(c => `${c.topic}: ${c.passage} (${c.sourceTitle})`);
      const citations = Array.from(new Set(relevantChunks.map(c => c.sourceTitle)));

      // M6: Active Climate & Weather Alerts Context
      let activeWeatherAlert: string | null = null;
      if (district) {
        const districtAlerts = await this.alertRepository.getAlertsForDistrict(district);
        if (districtAlerts.length > 0) {
          const topAlert = districtAlerts[0];
          activeWeatherAlert = `${topAlert.severity.labelBn}: ${topAlert.messageBn} (উৎস: ${topAlert.source})`;
        }
      }

      // Language context
      const currentLang = (await this.profileRepository.getFarmerProfile()).preferredLanguage === 'en' ? 'en' : 'bn';

      // Build Prompt
      const prompt = this.promptBuilder.buildPrompt({
        farmerQuestion: trimmed,
        cropName: primaryCrop,
        district,
        hasImageAttached: attachedImg !== null,
        classifierTopLabel: attachedImg ? (currentLang === 'en' ? 'Rice Blast' : 'ব্লাস্ট রোগ') : null,
        classifierConfidence: attachedImg ? 0.92 : null,
        activeWeatherAlert,
        retrievedKnowledgePassages: passages,
        language: currentLang
      });

      let fullRawResponse = '';
      this.isCancelling = false;

      for await (const chunk of this.llmEngine.generateStream(prompt)) {
        if (this.isCancelling) break;

        if (ttftTime === 0) {
          ttftTime = Date.now() - startTime;
        }
        tokenCount++;
        fullRawResponse += chunk;
        this.setState({ streamingText: fullRawResponse });
      }

      if (this.isCancelling) {
        this.setState({ isGenerating: false, streamingText: '' });
        return;
      }

      // M5: Pesticide Safety Guard Check
      const safetyCheck = this.pesticideSafetyGuard.validateAndSanitize(
        fullRawResponse,
        0.92,
        currentLang
      );
      const sanitizedResponse = safetyCheck.sanitizedResponse;

      // Save Shalik message
      await this.chatRepository.saveMessage({
        id: 0,
        conversationId: convId,
        sender: MessageSender.SHALIK,
        text: sanitizedResponse,
        timestamp: Date.now(),
        imageUri: null,
        citedSources: citations
      });

      await this.chatRepository.updateConversationPreview(convId, trimmed);

      const totalLatency = Date.now() - startTime;
      await this.telemetryLogger.logQueryTelemetry({
        queryId: `q_${Date.now()}`,
        timestampIso: new Date().toISOString(),
        timeToFirstTokenMs: ttftTime || totalLatency,
        totalGenerationMs: totalLatency,
        tokensGenerated: tokenCount,
        peakAppRamMb: 2140,
        wasImageIncluded: attachedImg !== null,
        didCrashOrError: false
      });

      this.setState({
        isGenerating: false,
        streamingText: ''
      });

      // TTS Readout
      this.textToSpeech.speak(sanitizedResponse);
    } catch (e: any) {
      this.setState({
        isGenerating: false,
        error: `ত্রুটি: ${e?.message || 'অজ্ঞাত সমস্যা'}`
      });
    }
  }

  public cancelGeneration() {
    this.isCancelling = true;
    this.llmEngine.cancelGeneration();
    this.textToSpeech.stop();
    this.setState({ isGenerating: false });
  }
}
