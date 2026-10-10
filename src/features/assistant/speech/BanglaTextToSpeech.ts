export type TtsState =
  | { type: 'Idle' }
  | { type: 'Initializing' }
  | { type: 'Ready' }
  | { type: 'Speaking' }
  | { type: 'VoiceDataMissing' }
  | { type: 'Error'; message: string };

export class BanglaTextToSpeech {
  private state: TtsState = { type: 'Ready' };
  private listeners: Set<(state: TtsState) => void> = new Set();
  private speakingTimer: any = null;

  public getState(): TtsState {
    return this.state;
  }

  public subscribe(listener: (state: TtsState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(newState: TtsState) {
    this.state = newState;
    this.listeners.forEach(fn => fn(this.state));
  }

  public cleanTextForSpeech(input: string): string {
    return input
      .replace(/[*#_`~]/g, '')
      .replace(/[🌱⚠️✍️🌾🔴🟢📌📚]/gu, '')
      .replace(/সূত্র:[^\n]+/g, '')
      .trim();
  }

  public speak(text: string, onDone?: () => void): void {
    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return;

    this.stop();
    this.setState({ type: 'Speaking' });

    // 1. If Web SpeechSynthesis is available (Browser / Web environment)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleaned);
        const isEnglish = /[a-zA-Z]/.test(cleaned) && !/[\u0980-\u09FF]/.test(cleaned);
        utterance.lang = isEnglish ? 'en-US' : 'bn-BD';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
          isEnglish ? v.lang.startsWith('en') : v.lang.startsWith('bn')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          this.setState({ type: 'Idle' });
          if (onDone) onDone();
        };

        utterance.onerror = () => {
          this.setState({ type: 'Idle' });
          if (onDone) onDone();
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        console.warn('SpeechSynthesis error, falling back to timer:', e);
      }
    }

    // 2. Fallback timer for Node/Testing environments or unsupported devices
    const wordCount = cleaned.split(/\s+/).length;
    const durationMs = Math.min(Math.max(wordCount * 350, 1500), 8000);

    this.speakingTimer = setTimeout(() => {
      this.setState({ type: 'Idle' });
      if (onDone) onDone();
    }, durationMs);
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }

    if (this.speakingTimer) {
      clearTimeout(this.speakingTimer);
      this.speakingTimer = null;
    }
    this.setState({ type: 'Idle' });
  }

  public shutdown(): void {
    this.stop();
  }
}
