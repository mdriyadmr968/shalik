export type AsrResult =
  | { type: 'Partial'; text: string }
  | { type: 'Final'; text: string; confidence: number }
  | { type: 'Error'; message: string };

export interface SpeechToText {
  engineName: string;
  isAvailable(): boolean;
  transcribe(audioFilePath: string): AsyncIterable<AsrResult>;
}
