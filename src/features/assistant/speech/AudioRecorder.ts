export type RecordingState =
  | { type: 'Idle' }
  | { type: 'Recording'; durationMs: number; amplitude: number }
  | { type: 'Completed'; audioFilePath: string; durationMs: number }
  | { type: 'Error'; message: string };

export class AudioRecorder {
  public static readonly SAMPLE_RATE = 16000;
  public static readonly MAX_RECORDING_DURATION_MS = 30000;

  private state: RecordingState = { type: 'Idle' };
  private recordingTimer: any = null;
  private startTime: number = 0;
  private listeners: Set<(state: RecordingState) => void> = new Set();

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

  public async startRecording(outputFilePath: string): Promise<boolean> {
    if (this.state.type === 'Recording') return false;

    this.startTime = Date.now();
    this.setState({ type: 'Recording', durationMs: 0, amplitude: 0.2 });

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
    this.setState({ type: 'Idle' });
  }
}
