export type RecordingState =
  | { type: 'Idle' }
  | { type: 'Recording'; durationMs: number; amplitude: number }
  | { type: 'Completed'; audioFilePath: string; durationMs: number }
  | { type: 'Error'; message: string };

export class AudioRecorder {
  public static readonly SAMPLE_RATE = 16000;
  public static readonly MAX_RECORDING_DURATION_MS = 30000;
  public static lastCapturedTranscript: string | null = null;

  private state: RecordingState = { type: 'Idle' };
  private recordingTimer: any = null;
  private startTime: number = 0;
  private listeners: Set<(state: RecordingState) => void> = new Set();
  private recognition: any = null;

  public getState(): RecordingState {
    return this.state;
  }

  public subscribe(listener: (state: RecordingState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(newState: RecordingState) {
    this.state = newState;
    this.listeners.forEach(fn => fn(this.state));
  }

  public async startRecording(
    outputFilePath: string = 'farmer_voice.wav',
    lang: string = 'bn-BD'
  ): Promise<boolean> {
    if (this.state.type === 'Recording') return false;

    AudioRecorder.lastCapturedTranscript = null;
    this.startTime = Date.now();
    this.setState({ type: 'Recording', durationMs: 0, amplitude: 0.2 });

    // Initialize Web Speech Recognition in browser environments
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.lang = lang.startsWith('en') ? 'en-US' : 'bn-BD';
          this.recognition.continuous = true;
          this.recognition.interimResults = true;

          this.recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0].transcript;
            }
            if (fullText.trim()) {
              AudioRecorder.lastCapturedTranscript = fullText.trim();
            }
          };

          this.recognition.onerror = () => {
            // Non-fatal, speech will fall back to audio heuristic
          };

          this.recognition.start();
        } catch (_) {}
      }
    }

    this.recordingTimer = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      if (elapsed >= AudioRecorder.MAX_RECORDING_DURATION_MS) {
        this.stopRecording(outputFilePath);
      } else {
        const simulatedAmplitude = 0.2 + Math.random() * 0.6;
        this.setState({
          type: 'Recording',
          durationMs: elapsed,
          amplitude: simulatedAmplitude
        });
      }
    }, 200);

    return true;
  }

  public stopRecording(outputFilePath: string = 'farmer_voice_query.wav'): void {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
      this.recognition = null;
    }

    if (this.state.type === 'Recording') {
      const elapsed = Date.now() - this.startTime;
      this.setState({
        type: 'Completed',
        audioFilePath: outputFilePath,
        durationMs: elapsed
      });
    } else {
      this.setState({ type: 'Idle' });
    }
  }

  public reset(): void {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
      this.recognition = null;
    }
    this.setState({ type: 'Idle' });
  }
}
