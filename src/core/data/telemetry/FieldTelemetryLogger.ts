export interface FieldQueryTelemetry {
  queryId: string;
  timestampIso: string;
  timeToFirstTokenMs: number;
  totalGenerationMs: number;
  tokensGenerated: number;
  peakAppRamMb: number;
  asrDurationSeconds?: number;
  wasImageIncluded?: boolean;
  didCrashOrError?: boolean;
  farmerRating?: number | null; // 1 to 5
}

export class FieldTelemetryLogger {
  private inMemoryLogs: FieldQueryTelemetry[] = [];

  async logQueryTelemetry(telemetry: FieldQueryTelemetry): Promise<void> {
    const item: FieldQueryTelemetry = {
      ...telemetry,
      asrDurationSeconds: telemetry.asrDurationSeconds ?? 0,
      wasImageIncluded: telemetry.wasImageIncluded ?? false,
      didCrashOrError: telemetry.didCrashOrError ?? false,
      farmerRating: telemetry.farmerRating ?? null
    };
    this.inMemoryLogs.push(item);
  }

  async exportTelemetryForFieldResearcher(): Promise<string> {
    if (this.inMemoryLogs.length === 0) return '[]';
    return JSON.stringify(this.inMemoryLogs, null, 2);
  }

  async clearTelemetry(): Promise<void> {
    this.inMemoryLogs = [];
  }

  getTelemetryCount(): number {
    return this.inMemoryLogs.length;
  }
}
