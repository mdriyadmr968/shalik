import { ModelManager } from '../src/core/llm/ModelManager';
import { PinHasher } from '../src/core/auth/security/PinHasher';

describe('ModelManager', () => {
  let modelManager: ModelManager;

  beforeEach(() => {
    modelManager = new ModelManager();
  });

  it('initializes with ready state and recommended bundled model', () => {
    const state = modelManager.getModelState();
    expect(state.type).toBe('Ready');
    if (state.type === 'Ready') {
      expect(state.modelFileName).toContain('gemma-3n');
      expect(state.sizeMb).toBeGreaterThan(0);
    }
  });

  it('verifies SHA-256 checksums correctly with pure TypeScript crypto', () => {
    const sampleContent = 'SHALIK_GEMMA_MODEL_WEIGHTS_V1';
    const expectedHash = PinHasher.sha256(sampleContent);

    expect(modelManager.verifyChecksum(sampleContent, expectedHash)).toBe(true);
    expect(modelManager.verifyChecksum(sampleContent, 'invalid_hash')).toBe(false);
  });

  it('handles simulated model import with progress callback', async () => {
    const progressList: number[] = [];
    const success = await modelManager.importModel('custom-model.litertlm', 1800, p => {
      progressList.push(p);
    });

    expect(success).toBe(true);
    expect(progressList.length).toBeGreaterThan(0);
    const state = modelManager.getModelState();
    expect(state.type).toBe('Ready');
    if (state.type === 'Ready') {
      expect(state.modelFileName).toBe('custom-model.litertlm');
      expect(state.sizeMb).toBe(1800);
    }
  });
});
