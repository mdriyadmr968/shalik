export enum DeviceTier {
  ENTRY_4GB = 'ENTRY_4GB',
  MID_6GB = 'MID_6GB',
  HIGH_8GB_PLUS = 'HIGH_8GB_PLUS'
}

export interface DeviceSpec {
  totalRamMb: number;
  availableRamMb: number;
  freeStorageMb: number;
  cpuCores: number;
  isArm64: boolean;
  recommendedTier: DeviceTier;
  recommendedModelFileName: string;
  maxContextTokens: number;
  isLowRamModeActive: boolean;
  isLowStorageWarning: boolean;
}

export class DeviceCapabilityDetector {
  private customSpec?: Partial<DeviceSpec>;

  constructor(customSpec?: Partial<DeviceSpec>) {
    this.customSpec = customSpec;
  }

  public detectDeviceCapabilities(): DeviceSpec {
    // Default reference specs for typical 6GB rural Android smartphone
    const totalRamMb = this.customSpec?.totalRamMb ?? 5940;
    const availableRamMb = this.customSpec?.availableRamMb ?? 2140;
    const freeStorageMb = this.customSpec?.freeStorageMb ?? 14200;
    const cpuCores = this.customSpec?.cpuCores ?? 8;
    const isArm64 = this.customSpec?.isArm64 ?? true;

    let tier: DeviceTier;
    if (totalRamMb >= 7500) {
      tier = DeviceTier.HIGH_8GB_PLUS;
    } else if (totalRamMb >= 5200) {
      tier = DeviceTier.MID_6GB;
    } else {
      tier = DeviceTier.ENTRY_4GB;
    }

    const recommendedModel =
      tier === DeviceTier.HIGH_8GB_PLUS
        ? 'gemma-3n-e4b-it-w4a16.litertlm'
        : 'gemma-3n-e2b-it-w4a16.litertlm';

    const maxContextTokens =
      tier === DeviceTier.HIGH_8GB_PLUS
        ? 2048
        : tier === DeviceTier.MID_6GB
        ? 1024
        : 512;

    const isLowRam = tier === DeviceTier.ENTRY_4GB || availableRamMb < 900;
    const isLowStorage = freeStorageMb < 1500;

    return {
      totalRamMb,
      availableRamMb,
      freeStorageMb,
      cpuCores,
      isArm64,
      recommendedTier: tier,
      recommendedModelFileName: recommendedModel,
      maxContextTokens,
      isLowRamModeActive: isLowRam,
      isLowStorageWarning: isLowStorage
    };
  }
}
