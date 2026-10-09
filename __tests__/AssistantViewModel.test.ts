import { AssistantViewModel } from '../src/features/assistant/viewmodel/AssistantViewModel';
import { ShalikDatabase } from '../src/core/data/database/ShalikDatabase';
import { ChatRepository } from '../src/core/data/repository/ChatRepository';
import { AlertRepository } from '../src/core/data/repository/AlertRepository';
import { FarmerProfileRepository } from '../src/core/data/repository/FarmerProfileRepository';
import { LiteRtLmEngine } from '../src/core/llm/LiteRtLmEngine';
import { MessageSender } from '../src/core/data/models/ChatMessage';

describe('AssistantViewModel', () => {
  let viewModel: AssistantViewModel;
  let db: ShalikDatabase;

  beforeEach(() => {
    db = ShalikDatabase.getInstance();
    const chatRepo = new ChatRepository(db);
    const alertRepo = new AlertRepository(db);
    const profileRepo = new FarmerProfileRepository(db);
    const llmEngine = new LiteRtLmEngine();

    viewModel = new AssistantViewModel(chatRepo, alertRepo, profileRepo, llmEngine);
  });

  afterEach(() => {
    viewModel.cancelGeneration();
    viewModel.stopAudio();
  });

  it('should initialize with ready state and new conversation', () => {
    const state = viewModel.getState();
    expect(state.currentConversationId).not.toBeNull();
    expect(state.isGenerating).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should attach and remove images with quality check', () => {
    viewModel.attachImage('file:///leaf.jpg', 30); // Dark image
    let state = viewModel.getState();
    expect(state.attachedImageUri).toBe('file:///leaf.jpg');
    expect(state.imageQualityWarning).toContain('বেশি অন্ধকার');

    viewModel.removeAttachedImage();
    state = viewModel.getState();
    expect(state.attachedImageUri).toBeNull();
    expect(state.imageQualityWarning).toBeNull();
  });

  it('should handle voice recording start and stop', async () => {
    viewModel.startVoiceRecording('test_voice.wav');
    let state = viewModel.getState();
    expect(state.recordingState.type).toBe('Recording');

    await viewModel.stopVoiceRecordingAndTranscribe('test_voice.wav');
    state = viewModel.getState();
    expect(state.pendingVoiceTranscript).toContain('ধানের পাতায়');

    viewModel.dismissVoiceTranscript();
    state = viewModel.getState();
    expect(state.pendingVoiceTranscript).toBeNull();
  });

  it('should send user query and generate grounded response with citations', async () => {
    await viewModel.sendQuery('ধানের পাতায় বাদামী দাগ কি রোগ');
    const state = viewModel.getState();

    expect(state.messages.length).toBeGreaterThanOrEqual(2);
    const userMsg = state.messages.find(m => m.sender === MessageSender.USER);
    const shalikMsg = state.messages.find(m => m.sender === MessageSender.SHALIK);

    expect(userMsg?.text).toBe('ধানের পাতায় বাদামী দাগ কি রোগ');
    expect(shalikMsg).toBeDefined();
    expect(shalikMsg?.text).toContain('ব্লাস্ট');
    expect(shalikMsg?.citedSources.length).toBeGreaterThan(0);
  });
});
