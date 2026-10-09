import { DeviceCapabilityDetector, DeviceTier } from '../src/core/llm/DeviceCapabilityDetector';

describe('DeviceCapabilityDetector', () => {
  it('should detect mid tier (6GB) for reference phone and recommend E2B model', () => {
    const detector = new DeviceCapabilityDetector({
      totalRamMb: 5940,
      availableRamMb: 2140,
      freeStorageMb: 14200
    });
    const spec = detector.detectDeviceCapabilities();

    expect(spec.recommendedTier).toBe(DeviceTier.MID_6GB);
    expect(spec.recommendedModelFileName).toBe('gemma-3n-e2b-it-w4a16.litertlm');
    expect(spec.maxContextTokens).toBe(1024);
    expect(spec.isLowRamModeActive).toBe(false);
  });

  it('should detect entry tier (4GB) and trigger low-RAM mode', () => {
    const detector = new DeviceCapabilityDetector({
      totalRamMb: 3800,
      availableRamMb: 800,
      freeStorageMb: 10000
    });
    const spec = detector.detectDeviceCapabilities();

    expect(spec.recommendedTier).toBe(DeviceTier.ENTRY_4GB);
    expect(spec.maxContextTokens).toBe(512);
    expect(spec.isLowRamModeActive).toBe(true);
  });

  it('should detect high tier (8GB+) and recommend E4B model with 2048 context', () => {
    const detector = new DeviceCapabilityDetector({
      totalRamMb: 8000,
      availableRamMb: 4500,
      freeStorageMb: 25000
    });
    const spec = detector.detectDeviceCapabilities();

    expect(spec.recommendedTier).toBe(DeviceTier.HIGH_8GB_PLUS);
    expect(spec.recommendedModelFileName).toBe('gemma-3n-e4b-it-w4a16.litertlm');
    expect(spec.maxContextTokens).toBe(2048);
  });
});
