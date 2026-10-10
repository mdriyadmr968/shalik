import { LiteRtLmEngine } from '../src/core/llm/LiteRtLmEngine';

describe('LiteRtLmEngine', () => {
  let engine: LiteRtLmEngine;

  beforeEach(() => {
    engine = new LiteRtLmEngine();
  });

  it('should initialize successfully with recommended model', async () => {
    const ready = await engine.initialize();
    expect(ready).toBe(true);
    expect(engine.isReady()).toBe(true);
  });

  it('should stream grounded agricultural tokens for rice blast', async () => {
    await engine.initialize();
    const tokens: string[] = [];

    for await (const chunk of engine.generateStream('ধানের পাতায় বাদামী দাগ পড়েছে')) {
      tokens.push(chunk);
    }

    const fullResponse = tokens.join('');
    expect(fullResponse).toContain('ব্লাস্ট বা বাদামী দাগ রোগ');
    expect(fullResponse).toContain('ট্রাইসাইক্লাজোল');
    expect(fullResponse).toContain('১৬১২৩');
  });

  it('should handle cancellation mid-stream', async () => {
    await engine.initialize();
    const tokens: string[] = [];
    const stream = engine.generateStream('ধানের পাতায় দাগ');

    let count = 0;
    for await (const chunk of stream) {
      tokens.push(chunk);
      count++;
      if (count === 1) {
        engine.cancelGeneration();
      }
    }

    expect(tokens.length).toBeLessThan(5);
  });

  it('should stream helpful greeting response for English "hi"', async () => {
    await engine.initialize();
    const tokens: string[] = [];
    for await (const chunk of engine.generateStream('hi')) {
      tokens.push(chunk);
    }
    const full = tokens.join('');
    expect(full).toContain('Shalik');
    expect(full).toContain('farm assistant');
    expect(full).not.toContain('Based on the symptoms, this appears to be Rice Blast');
  });

  it('should stream polite greeting response for Bangla "সালাম কেমন আছেন"', async () => {
    await engine.initialize();
    const tokens: string[] = [];
    for await (const chunk of engine.generateStream('সালাম কেমন আছেন')) {
      tokens.push(chunk);
    }
    const full = tokens.join('');
    expect(full).toContain('শালিক');
    expect(full).toContain('কৃষি পরামর্শক');
    expect(full).not.toContain('ব্লাস্ট বা বাদামী দাগ রোগ হতে পারে');
  });
});
