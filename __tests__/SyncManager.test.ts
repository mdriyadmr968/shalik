import { SyncManager } from '../src/core/sync/SyncManager';
import { ShalikDatabase } from '../src/core/data/database/ShalikDatabase';
import { MessageSender } from '../src/core/data/models/ChatMessage';

describe('SyncManager', () => {
  let syncManager: SyncManager;
  let db: ShalikDatabase;

  beforeEach(() => {
    db = ShalikDatabase.getInstance();
    syncManager = SyncManager.getInstance();
  });

  it('should initialize with online state and idle status', () => {
    const state = syncManager.getState();
    expect(state).toBeDefined();
    expect(typeof state.isOnline).toBe('boolean');
    expect(['idle', 'synced', 'syncing', 'error', 'offline']).toContain(state.status);
  });

  it('should detect pending sync items when new message is saved', async () => {
    const convId = await db.chatDao().insertConversation({
      title: 'নতুন চ্যাট',
      createdAt: Date.now(),
      lastMessagePreview: ''
    });

    await db.chatDao().insertMessage({
      conversationId: convId,
      sender: 'USER',
      text: 'আমার ধানে পোকা লেগেছে',
      timestamp: Date.now(),
      citedSourcesCsv: ''
    });

    const pendingCount = db.getPendingSyncCount();
    expect(pendingCount).toBeGreaterThan(0);

    const unsynced = db.getUnsyncedMessages();
    expect(unsynced.length).toBeGreaterThan(0);
    expect(unsynced[unsynced.length - 1].text).toBe('আমার ধানে পোকা লেগেছে');
  });

  it('should execute syncAll successfully and mark items as synced', async () => {
    syncManager.setSimulatedOnline(true);
    const success = await syncManager.syncAll();
    expect(success).toBe(true);

    const state = syncManager.getState();
    expect(state.status).toBe('synced');
    expect(state.lastSyncedAt).toBeGreaterThan(0);
    expect(db.getUnsyncedMessages().length).toBe(0);
  });

  it('should handle offline mode gracefully', async () => {
    syncManager.setSimulatedOnline(false);
    const success = await syncManager.syncAll();
    expect(success).toBe(false);

    const state = syncManager.getState();
    expect(state.status).toBe('offline');
    expect(state.isOnline).toBe(false);

    // Restore online
    syncManager.setSimulatedOnline(true);
  });

  it('should notify subscribers when sync state changes', done => {
    const unsubscribe = syncManager.subscribe(state => {
      expect(state).toBeDefined();
      unsubscribe();
      done();
    });

    syncManager.syncAll();
  });
});
