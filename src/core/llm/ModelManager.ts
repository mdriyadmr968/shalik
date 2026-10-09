import { DeviceCapabilityDetector } from './DeviceCapabilityDetector';
import * as crypto from 'crypto';

export type ModelState =
  | { type: 'NotInstalled' }
  | { type: 'Importing'; progressPercent: number }
  | { type: 'Ready'; modelFileName: string; sizeMb: number }
  | { type: 'Error'; message: string };

export class ModelManager {
  private state: ModelState = { type: 'NotInstalled' };
  private capabilityDetector: DeviceCapabilityDetector;
  private installedModels: Map<string, number> = new Map(); // name -> sizeMb

  constructor(capabilityDetector: DeviceCapabilityDetector = new DeviceCapabilityDetector()) {
    this.capabilityDetector = capabilityDetector;
    // Default installed bundled model
    const spec = this.capabilityDetector.detectDeviceCapabilities();
    this.installedModels.set(spec.recommendedModelFileName, 1950);
    this.checkInstalledModel();
  }

  public getModelState(): ModelState {
    return this.state;
  }

  public getActiveModelName(): string | null {
    const spec = this.capabilityDetector.detectDeviceCapabilities();
    return this.installedModels.has(spec.recommendedModelFileName)
      ? spec.recommendedModelFileName
      : null;
  }

  public checkInstalledModel(): void {
    const spec = this.capabilityDetector.detectDeviceCapabilities();
    const size = this.installedModels.get(spec.recommendedModelFileName);
    if (size && size > 0) {
      this.state = {
        type: 'Ready',
        modelFileName: spec.recommendedModelFileName,
        sizeMb: size
      };
    } else {
      this.state = { type: 'NotInstalled' };
    }
  }

  public verifyChecksum(content: string, expectedSha256: string): boolean {
    try {
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      return hash.toLowerCase() === expectedSha256.toLowerCase();
    } catch (e) {
      return false;
    }
  }

  public async importModel(
    fileName: string,
    sizeMb: number,
    onProgress?: (percent: number) => void
  ): Promise<boolean> {
    try {
      this.state = { type: 'Importing', progressPercent: 0 };
      for (let p = 10; p <= 100; p += 30) {
        if (onProgress) onProgress(p);
        this.state = { type: 'Importing', progressPercent: p };
      }
      this.installedModels.set(fileName, sizeMb);
      this.state = {
        type: 'Ready',
        modelFileName: fileName,
        sizeMb
      };
      return true;
    } catch (e: any) {
      this.state = { type: 'Error', message: e?.message || 'Import failed' };
      return false;
    }
  }
}
