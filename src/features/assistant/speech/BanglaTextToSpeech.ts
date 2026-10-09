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

    // Duration estimated based on word count (~150 words per minute at 0.85 rate)
    const wordCount = cleaned.split(/\s+/).length;
    const durationMs = Math.min(Math.max(wordCount * 350, 1500), 8000);

    this.speakingTimer = setTimeout(() => {
      this.setState({ type: 'Idle' });
      if (onDone) onDone();
    }, durationMs);
  }

  public stop(): void {
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
