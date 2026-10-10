import { ShalikDatabase } from '../data/database/ShalikDatabase';
import { ChatMessageEntity, AlertEntity, FarmerProfileEntity } from '../data/database/Entities';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export interface SyncState {
  isOnline: boolean;
  status: SyncStatus;
  lastSyncedAt: number | null;
  pendingCount: number;
  lastSyncError: string | null;
  remoteType: 'supabase' | 'rest' | 'simulated';
}

export type SyncListener = (state: SyncState) => void;

/**
 * Reads sync configuration from environment variables
 */
function getSyncConfig() {
  let supabaseUrl: string | undefined;
  let supabaseKey: string | undefined;
  let syncApiUrl: string | undefined;

  try {
    const metaEnv = new Function(
      'try { return import.meta.env; } catch (_) { return undefined; }'
    )();
    if (metaEnv) {
      supabaseUrl = metaEnv.VITE_SUPABASE_URL;
      supabaseKey = metaEnv.VITE_SUPABASE_ANON_KEY;
      syncApiUrl = metaEnv.VITE_SYNC_API_URL;
    }
  } catch (_) {}

  try {
    if (typeof process !== 'undefined' && process.env) {
      supabaseUrl = supabaseUrl || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      supabaseKey = supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      syncApiUrl = syncApiUrl || process.env.VITE_SYNC_API_URL || process.env.SYNC_API_URL;
    }
  } catch (_) {}

  return { supabaseUrl, supabaseKey, syncApiUrl };
}

const CLOUD_STORAGE_KEY = 'shalik_simulated_cloud_database_v1';

export class SyncManager {
  private static instance: SyncManager | null = null;
  private db: ShalikDatabase;
  private listeners: Set<SyncListener> = new Set();

  private isOnline: boolean =
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  private status: SyncStatus = 'idle';
  private lastSyncedAt: number | null = null;
  private lastSyncError: string | null = null;

  private constructor(db: ShalikDatabase = ShalikDatabase.getInstance()) {
    this.db = db;
    this.initNetworkListeners();
    this.restoreSyncMetadata();
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  public getState(): SyncState {
    const config = getSyncConfig();
    const remoteType = config.supabaseUrl
      ? 'supabase'
      : config.syncApiUrl
      ? 'rest'
      : 'simulated';

    return {
      isOnline: this.isOnline,
      status: this.isOnline ? this.status : 'offline',
      lastSyncedAt: this.lastSyncedAt,
      pendingCount: this.db.getPendingSyncCount(),
      lastSyncError: this.lastSyncError,
      remoteType
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(fn => {
      try { fn(state); } catch (_) {}
    });
  }

  private initNetworkListeners() {
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.status = 'idle';
        this.notify();
        // Auto-sync immediately when returning online
        this.syncAll();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.status = 'offline';
        this.notify();
      });
    }
  }

  private restoreSyncMetadata() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('shalik_last_synced_at');
        if (raw) {
          this.lastSyncedAt = parseInt(raw, 10);
        }
      }
    } catch (_) {}
  }

  /**
   * Triggers full bidirectional data sync between local SQLite/Map and remote database
   */
  public async syncAll(): Promise<boolean> {
    if (!this.isOnline) {
      this.status = 'offline';
      this.notify();
      return false;
    }

    this.status = 'syncing';
    this.lastSyncError = null;
    this.notify();

    try {
      const config = getSyncConfig();

      if (config.supabaseUrl && config.supabaseKey) {
        await this.syncWithSupabase(config.supabaseUrl, config.supabaseKey);
      } else if (config.syncApiUrl) {
        await this.syncWithRestApi(config.syncApiUrl);
      } else {
        await this.syncWithSimulatedCloud();
      }

      this.lastSyncedAt = Date.now();
      this.status = 'synced';
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('shalik_last_synced_at', String(this.lastSyncedAt));
        }
      } catch (_) {}

      this.notify();
      return true;
    } catch (err: any) {
      console.error('Data synchronization failed:', err);
      this.status = 'error';
      this.lastSyncError = err?.message || 'Sync failed';
      this.notify();
      return false;
    }
  }

  /**
   * Syncs with Supabase PostgreSQL tables:
   * - `chat_messages`
   * - `farmer_profiles`
   * - `alerts`
   */
  private async syncWithSupabase(supabaseUrl: string, anonKey: string): Promise<void> {
    const headers = {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    // 1. Push un-synced chat messages
    const unsyncedMsgs = this.db.getUnsyncedMessages();
    if (unsyncedMsgs.length > 0) {
      const payload = unsyncedMsgs.map(m => ({
        local_id: m.id,
        conversation_id: m.conversationId,
        sender: m.sender,
        text: m.text,
        timestamp: new Date(m.timestamp).toISOString(),
        image_uri: m.imageUri,
        cited_sources: m.citedSourcesCsv
      }));

      const res = await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 201) {
        this.db.markMessagesSynced(unsyncedMsgs.map(m => m.id));
      }
    }

    // 2. Push farmer profile
    if (!this.db.isProfileSynced()) {
      const profile = this.db.getProfile();
      if (profile) {
        const payload = {
          farmer_name: profile.farmerName,
          district: profile.district,
          upazila: profile.upazila,
          primary_crops: profile.primaryCropsCsv,
          preferred_language: profile.preferredLanguage,
          updated_at: new Date().toISOString()
        };

        const res = await fetch(`${supabaseUrl}/rest/v1/farmer_profiles`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (res.ok || res.status === 201) {
          this.db.markProfileSynced();
        }
      }
    }

    // 3. Pull new alerts
    const alertsRes = await fetch(
      `${supabaseUrl}/rest/v1/alerts?select=*&order=received_at.desc&limit=10`,
      { headers }
    );

    if (alertsRes.ok) {
      const remoteAlerts = await alertsRes.json();
      if (Array.isArray(remoteAlerts) && remoteAlerts.length > 0) {
        const mappedAlerts: AlertEntity[] = remoteAlerts.map(r => ({
          id: r.id || `alert_remote_${Date.now()}`,
          type: r.type || 'FLOOD',
          severityLevel: r.severity_level || 2,
          districtCodesCsv: r.district_codes || '',
          upazilaCodesCsv: r.upazila_codes || '',
          validFromIso: r.valid_from || new Date().toISOString(),
          validToIso: r.valid_to || new Date(Date.now() + 86400000).toISOString(),
          messageBn: r.message_bn || '',
          messageEn: r.message_en || null,
          source: r.source || 'Cloud Sync',
          actionTemplatesCsv: r.action_templates || '',
          signature: r.signature || 'verified_cloud_signature',
          receivedAt: Date.now(),
          isRead: false,
          isSynced: true
        }));
        this.db.mergeRemoteAlerts(mappedAlerts);
      }
    }
  }

  /**
   * Syncs with a generic JSON REST backend
   */
  private async syncWithRestApi(apiUrl: string): Promise<void> {
    const unsyncedMsgs = this.db.getUnsyncedMessages();
    const unsyncedAlerts = this.db.getUnsyncedAlerts();
    const profile = this.db.getProfile();

    const payload = {
      messages: unsyncedMsgs,
      alerts: unsyncedAlerts,
      profile: !this.db.isProfileSynced() ? profile : null,
      clientTimestamp: Date.now()
    };

    const res = await fetch(`${apiUrl}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`REST Sync failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    if (unsyncedMsgs.length > 0) {
      this.db.markMessagesSynced(unsyncedMsgs.map(m => m.id));
    }
    if (unsyncedAlerts.length > 0) {
      this.db.markAlertsSynced(unsyncedAlerts.map(a => a.id));
    }
    if (!this.db.isProfileSynced()) {
      this.db.markProfileSynced();
    }

    if (data?.incomingAlerts && Array.isArray(data.incomingAlerts)) {
      this.db.mergeRemoteAlerts(data.incomingAlerts);
    }
  }

  /**
   * Simulated Remote Cloud Store:
   * Allows fully testing and demonstrating real database synchronization even without cloud credentials.
   */
  private async syncWithSimulatedCloud(): Promise<void> {
    // Simulate real network request latency
    await new Promise(res => setTimeout(res, 250));

    let remoteCloudData: {
      messages: ChatMessageEntity[];
      alerts: AlertEntity[];
      profiles: FarmerProfileEntity[];
    } = { messages: [], alerts: [], profiles: [] };

    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(CLOUD_STORAGE_KEY);
        if (raw) {
          remoteCloudData = JSON.parse(raw);
        }
      }
    } catch (_) {}

    // 1. Push local un-synced messages to simulated remote cloud
    const unsyncedMsgs = this.db.getUnsyncedMessages();
    if (unsyncedMsgs.length > 0) {
      remoteCloudData.messages.push(...unsyncedMsgs);
      this.db.markMessagesSynced(unsyncedMsgs.map(m => m.id));
    }

    // 2. Push local un-synced alerts (e.g. extension officer broadcasts)
    const unsyncedAlerts = this.db.getUnsyncedAlerts();
    if (unsyncedAlerts.length > 0) {
      remoteCloudData.alerts.push(...unsyncedAlerts);
      this.db.markAlertsSynced(unsyncedAlerts.map(a => a.id));
    }

    // 3. Push farmer profile update
    if (!this.db.isProfileSynced()) {
      const profile = this.db.getProfile();
      if (profile) {
        remoteCloudData.profiles.push(profile);
        this.db.markProfileSynced();
      }
    }

    // Save remote cloud storage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(remoteCloudData));
      }
    } catch (_) {}
  }

  /**
   * Manual simulate toggling network status for testing in development/UI
   */
  public setSimulatedOnline(online: boolean) {
    this.isOnline = online;
    this.status = online ? 'idle' : 'offline';
    this.notify();
    if (online) {
      this.syncAll();
    }
  }
}
