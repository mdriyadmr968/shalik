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
  private static instance: FieldTelemetryLogger | null = null;
  private inMemoryLogs: FieldQueryTelemetry[] = [];
  private listeners: Set<() => void> = new Set();

  public static getInstance(): FieldTelemetryLogger {
    if (!FieldTelemetryLogger.instance) {
      FieldTelemetryLogger.instance = new FieldTelemetryLogger();
    }
    return FieldTelemetryLogger.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => {
      try { fn(); } catch (_) {}
    });
  }

  async logQueryTelemetry(telemetry: FieldQueryTelemetry): Promise<void> {
    const item: FieldQueryTelemetry = {
      ...telemetry,
      asrDurationSeconds: telemetry.asrDurationSeconds ?? 0,
      wasImageIncluded: telemetry.wasImageIncluded ?? false,
      didCrashOrError: telemetry.didCrashOrError ?? false,
      farmerRating: telemetry.farmerRating ?? null
    };
    this.inMemoryLogs.unshift(item);
    if (this.inMemoryLogs.length > 100) {
      this.inMemoryLogs.pop();
    }
    this.notify();
  }

  async exportTelemetryForFieldResearcher(): Promise<string> {
    if (this.inMemoryLogs.length === 0) return '[]';
    return JSON.stringify(this.inMemoryLogs, null, 2);
  }

  async clearTelemetry(): Promise<void> {
    this.inMemoryLogs = [];
    this.notify();
  }

  getTelemetryCount(): number {
    return this.inMemoryLogs.length;
  }

  getRecentLogs(limit: number = 10): FieldQueryTelemetry[] {
    return this.inMemoryLogs.slice(0, limit);
  }

  getAverageLatency(): number {
    if (this.inMemoryLogs.length === 0) return 0;
    const sum = this.inMemoryLogs.reduce((acc, log) => acc + log.totalGenerationMs, 0);
    return Math.round(sum / this.inMemoryLogs.length);
  }

  getAverageTtft(): number {
    if (this.inMemoryLogs.length === 0) return 0;
    const sum = this.inMemoryLogs.reduce((acc, log) => acc + log.timeToFirstTokenMs, 0);
    return Math.round(sum / this.inMemoryLogs.length);
  }

  getTotalTokens(): number {
    return this.inMemoryLogs.reduce((acc, log) => acc + (log.tokensGenerated || 0), 0);
  }
}
