import { FieldTelemetryLogger } from '../src/core/data/telemetry/FieldTelemetryLogger';

describe('FieldTelemetryLogger', () => {
  let logger: FieldTelemetryLogger;

  beforeEach(async () => {
    logger = FieldTelemetryLogger.getInstance();
    await logger.clearTelemetry();
  });

  it('maintains singleton instance and tracks query metrics accurately', async () => {
    const instance1 = FieldTelemetryLogger.getInstance();
    const instance2 = FieldTelemetryLogger.getInstance();
    expect(instance1).toBe(instance2);

    expect(logger.getTelemetryCount()).toBe(0);
    expect(logger.getAverageLatency()).toBe(0);

    await logger.logQueryTelemetry({
      queryId: 'q_001',
      timestampIso: new Date().toISOString(),
      timeToFirstTokenMs: 150,
      totalGenerationMs: 300,
      tokensGenerated: 45,
      peakAppRamMb: 2100
    });

    await logger.logQueryTelemetry({
      queryId: 'q_002',
      timestampIso: new Date().toISOString(),
      timeToFirstTokenMs: 250,
      totalGenerationMs: 500,
      tokensGenerated: 55,
      peakAppRamMb: 2150,
      wasImageIncluded: true
    });

    expect(logger.getTelemetryCount()).toBe(2);
    expect(logger.getAverageLatency()).toBe(400); // (300 + 500) / 2
    expect(logger.getAverageTtft()).toBe(200); // (150 + 250) / 2
    expect(logger.getTotalTokens()).toBe(100);

    const recent = logger.getRecentLogs(1);
    expect(recent.length).toBe(1);
    expect(recent[0].queryId).toBe('q_002');
  });

  it('notifies listeners on new telemetry item and on clear', async () => {
    let callCount = 0;
    const unsub = logger.subscribe(() => {
      callCount++;
    });

    await logger.logQueryTelemetry({
      queryId: 'q_test',
      timestampIso: new Date().toISOString(),
      timeToFirstTokenMs: 100,
      totalGenerationMs: 200,
      tokensGenerated: 20,
      peakAppRamMb: 2000
    });

    expect(callCount).toBe(1);

    await logger.clearTelemetry();
    expect(callCount).toBe(2);
    expect(logger.getTelemetryCount()).toBe(0);

    unsub();
  });

  it('exports valid JSON payload for field researchers', async () => {
    await logger.logQueryTelemetry({
      queryId: 'q_export',
      timestampIso: '2026-10-17T12:00:00Z',
      timeToFirstTokenMs: 120,
      totalGenerationMs: 240,
      tokensGenerated: 30,
      peakAppRamMb: 2050
    });

    const json = await logger.exportTelemetryForFieldResearcher();
    const parsed = JSON.parse(json);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);
    expect(parsed[0].queryId).toBe('q_export');
  });
});
