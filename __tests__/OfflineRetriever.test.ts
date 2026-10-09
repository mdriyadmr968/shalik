import { OfflineRetriever } from '../src/core/data/rag/OfflineRetriever';

describe('OfflineRetriever', () => {
  let retriever: OfflineRetriever;

  beforeEach(() => {
    retriever = new OfflineRetriever();
  });

  it('should retrieve relevant passages for rice blast query', async () => {
    const results = await retriever.retrieveRelevantPassages('ধানের ব্লাস্ট রোগ প্রতিকার', 'ধান', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].topic).toContain('ব্লাস্ট');
    expect(results[0].sourceTitle).toContain('BRRI');
    expect(results[0].relevanceScore).toBeGreaterThan(1.5);
  });

  it('should retrieve relevant passages for brown planthopper (কারেন্ট পোকা)', async () => {
    const results = await retriever.retrieveRelevantPassages('কারেন্ট পোকা বা বাদামী গাছফড়িং দমন', 'ধান', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].topic).toContain('গাছফড়িং');
    expect(results[0].passage).toContain('পাইমেট্রোজিন');
  });

  it('should retrieve late blight for potato (আলু)', async () => {
    const results = await retriever.retrieveRelevantPassages('আলুর নাবি ধসা রোগ কি ওষুধ দিব', 'আলু', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].crop).toBe('আলু');
    expect(results[0].topic).toContain('নাবি ধসা');
    expect(results[0].sourceTitle).toContain('BARI');
  });

  it('should respect topK parameter', async () => {
    const results = await retriever.retrieveRelevantPassages('ধানের রোগ ও সার', 'ধান', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });
});
