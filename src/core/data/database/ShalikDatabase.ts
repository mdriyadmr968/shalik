import { ChatDao } from './dao/ChatDao';
import { AlertDao } from './dao/AlertDao';
import { FarmerProfileDao } from './dao/FarmerProfileDao';
import { UserDao } from '../../auth/database/UserDao';
import { User, UserRole } from '../../auth/models/User';
import { PinHasher } from '../../auth/security/PinHasher';
import { ConversationEntity, ChatMessageEntity, AlertEntity, FarmerProfileEntity } from './Entities';

type Listener = () => void;

const STORAGE_KEY = 'shalik_offline_db_v1';

export class ShalikDatabase {
  private static instance: ShalikDatabase | null = null;

  private conversations: Map<number, ConversationEntity> = new Map();
  private messages: Map<number, ChatMessageEntity> = new Map();
  private alerts: Map<string, AlertEntity> = new Map();
  private users: Map<string, User> = new Map();
  private farmerProfile: FarmerProfileEntity | null = null;

  private conversationIdSeq = 1;
  private messageIdSeq = 1;

  private listeners: Set<Listener> = new Set();

  private constructor() {
    const loaded = this.loadFromStorage();
    if (!loaded) {
      this.seedDefaultData();
      this.persist();
    }
  }

  public static getInstance(): ShalikDatabase {
    if (!ShalikDatabase.instance) {
      ShalikDatabase.instance = new ShalikDatabase();
    }
    return ShalikDatabase.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.persist();
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) { /* no-op */ }
    });
  }

  private loadFromStorage(): boolean {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.conversations)) {
            this.conversations = new Map(parsed.conversations);
          }
          if (Array.isArray(parsed.messages)) {
            this.messages = new Map(parsed.messages);
          }
          if (Array.isArray(parsed.alerts)) {
            this.alerts = new Map(parsed.alerts);
          }
          if (Array.isArray(parsed.users)) {
            this.users = new Map(parsed.users);
          }
          if (parsed.farmerProfile) {
            this.farmerProfile = parsed.farmerProfile;
          }
          if (typeof parsed.conversationIdSeq === 'number') {
            this.conversationIdSeq = parsed.conversationIdSeq;
          }
          if (typeof parsed.messageIdSeq === 'number') {
            this.messageIdSeq = parsed.messageIdSeq;
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Failed to restore from storage:', e);
    }
    return false;
  }

  private persist(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const payload = {
          conversations: Array.from(this.conversations.entries()),
          messages: Array.from(this.messages.entries()),
          alerts: Array.from(this.alerts.entries()),
          users: Array.from(this.users.entries()),
          farmerProfile: this.farmerProfile,
          conversationIdSeq: this.conversationIdSeq,
          messageIdSeq: this.messageIdSeq
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (e) {
      // Storage unavailable or quota limit
    }
  }

  public resetDatabase(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {}
    this.conversations.clear();
    this.messages.clear();
    this.alerts.clear();
    this.users.clear();
    this.conversationIdSeq = 1;
    this.messageIdSeq = 1;
    this.seedDefaultData();
    this.persist();
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) { /* no-op */ }
    });
  }

  private seedDefaultData() {
    // Default farmer profile
    this.farmerProfile = {
      id: 1,
      farmerName: 'কৃষক ভাই',
      district: 'কুড়িগ্রাম',
      upazila: 'চিলমারী',
      primaryCropsCsv: 'ধান,আলু',
      isOnboarded: true,
      preferredLanguage: 'bn'
    };

    // Initial default weather/disaster alerts
    const now = Date.now();
    const expiry = now + (3 * 24 * 3600 * 1000);
    const validFromIso = new Date(now).toISOString();
    const validToIso = new Date(expiry).toISOString();

    const initialAlerts: AlertEntity[] = [
      {
        id: 'alert_flood_kurigram_init',
        type: 'FLOOD',
        severityLevel: 3,
        districtCodesCsv: 'কুড়িগ্রাম,সিরাজগঞ্জ,গাইবান্ধা',
        upazilaCodesCsv: 'চিলমারী,উলিপুর',
        validFromIso,
        validToIso,
        messageBn: 'বন্যা পূর্বাভাস: ব্রহ্মপুত্র ও তিস্তা নদীর পানি বিপদসীমার উপর দিয়ে প্রবাহিত হতে পারে। নিম্নাঞ্চলের পাকা ফসল দ্রুত কেটে নিরাপদ স্থানে রাখুন।',
        messageEn: 'Flood alert: Brahmaputra and Teesta river water levels rising above danger mark.',
        source: 'FFWC/BWDB বন্যা পূর্বাভাস ও সতর্কীকরণ কেন্দ্র',
        actionTemplatesCsv: 'act_flood_rice_mature',
        signature: 'sig_ffwc_ed25519_verified',
        receivedAt: now - 3600000,
        isRead: false
      },
      {
        id: 'alert_heat_rajshahi_init',
        type: 'HEAT',
        severityLevel: 2,
        districtCodesCsv: 'রাজশাহী,পাবনা,চুয়াডাঙ্গা,কুড়িগ্রাম',
        upazilaCodesCsv: '',
        validFromIso,
        validToIso,
        messageBn: 'তীব্র তাপপ্রবাহ সতর্কতা: আগামী ৪৮ ঘণ্টায় দিনের তাপমাত্রা ৩৮° সেলসিয়াস ছাড়িয়ে যেতে পারে। বোরো ধান ও শাকসবজির জমিতে পর্যাপ্ত পানি ধরে রাখুন।',
        messageEn: 'Heatwave alert: Max temperature expected to exceed 38C.',
        source: 'BMD বাংলাদেশ আবহাওয়া অধিদপ্তর',
        actionTemplatesCsv: 'act_heat_rice_flowering',
        signature: 'sig_bmd_ed25519_verified',
        receivedAt: now - 7200000,
        isRead: false
      }
    ];

    initialAlerts.forEach(a => this.alerts.set(a.id, a));

    // Seed default demo users for offline authentication (Farmer, SAAO Officer, Admin)
    const seedUsers: User[] = [
      {
        id: 'usr_farmer_1',
        phone: '01711000001',
        name: 'করিম মিয়া (Karim Mia)',
        pinHash: PinHasher.hashPin('1234'),
        role: UserRole.FARMER,
        district: 'কুড়িগ্রাম',
        upazila: 'চিলমারী',
        createdAt: now - (86400000 * 10)
      },
      {
        id: 'usr_officer_1',
        phone: '01811000002',
        name: 'ড. রফিকুল ইসলাম (Dr. Rafiqul Islam)',
        pinHash: PinHasher.hashPin('5678'),
        role: UserRole.OFFICER,
        district: 'কুড়িগ্রাম',
        upazila: 'চিলমারী',
        createdAt: now - (86400000 * 30)
      },
      {
        id: 'usr_admin_1',
        phone: '01911000003',
        name: 'কৃষি সিস্টেম প্রশাসক (Agri Admin)',
        pinHash: PinHasher.hashPin('9999'),
        role: UserRole.ADMIN,
        district: 'ঢাকা',
        upazila: 'রমনা',
        createdAt: now - (86400000 * 60)
      }
    ];

    seedUsers.forEach(u => this.users.set(u.id, u));
  }

  public chatDao(): ChatDao {
    return {
      getAllConversations: async (): Promise<ConversationEntity[]> => {
        return Array.from(this.conversations.values()).sort((a, b) => b.createdAt - a.createdAt);
      },
      insertConversation: async (conv): Promise<number> => {
        const id = 'id' in conv && conv.id ? conv.id : this.conversationIdSeq++;
        const entity: ConversationEntity = {
          id,
          title: conv.title,
          createdAt: conv.createdAt || Date.now(),
          lastMessagePreview: conv.lastMessagePreview || ''
        };
        this.conversations.set(id, entity);
        this.notify();
        return id;
      },
      updateConversation: async (conv): Promise<void> => {
        const existing = this.conversations.get(conv.id);
        if (existing) {
          this.conversations.set(conv.id, { ...existing, ...conv });
          this.notify();
        }
      },
      getConversationById: async (id: number): Promise<ConversationEntity | null> => {
        return this.conversations.get(id) || null;
      },
      getMessagesForConversation: async (convId: number): Promise<ChatMessageEntity[]> => {
        return Array.from(this.messages.values())
          .filter(m => m.conversationId === convId)
          .sort((a, b) => a.timestamp - b.timestamp);
      },
      insertMessage: async (msg): Promise<number> => {
        const id = 'id' in msg && msg.id ? msg.id : this.messageIdSeq++;
        const entity: ChatMessageEntity = {
          id,
          conversationId: msg.conversationId,
          sender: msg.sender,
          text: msg.text,
          timestamp: msg.timestamp || Date.now(),
          imageUri: msg.imageUri || null,
          citedSourcesCsv: msg.citedSourcesCsv || '',
          isSynced: 'isSynced' in msg ? (msg as any).isSynced : false
        };
        this.messages.set(id, entity);
        this.notify();
        return id;
      },
      deleteMessagesForConversation: async (convId: number): Promise<void> => {
        for (const [id, msg] of this.messages.entries()) {
          if (msg.conversationId === convId) {
            this.messages.delete(id);
          }
        }
        this.notify();
      },
      deleteConversation: async (convId: number): Promise<void> => {
        this.conversations.delete(convId);
        for (const [id, msg] of this.messages.entries()) {
          if (msg.conversationId === convId) {
            this.messages.delete(id);
          }
        }
        this.notify();
      }
    };
  }

  public farmerProfileDao(): FarmerProfileDao {
    return {
      getProfile: async (): Promise<FarmerProfileEntity | null> => {
        return this.farmerProfile;
      },
      saveProfile: async (profile: FarmerProfileEntity): Promise<void> => {
        this.farmerProfile = {
          ...profile,
          id: 1,
          isSynced: false,
          updatedAt: Date.now()
        };
        this.notify();
      }
    };
  }

  public alertDao(): AlertDao {
    return {
      getAllAlerts: async (): Promise<AlertEntity[]> => {
        return Array.from(this.alerts.values()).sort((a, b) => b.receivedAt - a.receivedAt);
      },
      getAlertsForDistrict: async (districtCode: string): Promise<AlertEntity[]> => {
        return Array.from(this.alerts.values())
          .filter(a => a.districtCodesCsv.includes(districtCode))
          .sort((a, b) => b.severityLevel - a.severityLevel || b.receivedAt - a.receivedAt);
      },
      getAlertById: async (alertId: string): Promise<AlertEntity | null> => {
        return this.alerts.get(alertId) || null;
      },
      insertAlert: async (alert: AlertEntity): Promise<void> => {
        this.alerts.set(alert.id, { ...alert, isSynced: alert.isSynced ?? false });
        this.notify();
      },
      insertAlerts: async (alerts: AlertEntity[]): Promise<void> => {
        alerts.forEach(a => this.alerts.set(a.id, { ...a, isSynced: a.isSynced ?? false }));
        this.notify();
      },
      markAsRead: async (alertId: string): Promise<void> => {
        const item = this.alerts.get(alertId);
        if (item) {
          this.alerts.set(alertId, { ...item, isRead: true });
          this.notify();
        }
      },
      deleteExpiredAlerts: async (currentIsoTimestamp: string): Promise<void> => {
        for (const [id, alert] of this.alerts.entries()) {
          if (alert.validToIso < currentIsoTimestamp) {
            this.alerts.delete(id);
          }
        }
        this.notify();
      }
    };
  }

  public userDao(): UserDao {
    return {
      getUserByPhone: async (phone: string): Promise<User | null> => {
        const cleaned = phone.replace(/[\s-]/g, '');
        for (const user of this.users.values()) {
          if (user.phone.replace(/[\s-]/g, '') === cleaned) {
            return user;
          }
        }
        return null;
      },
      getUserById: async (id: string): Promise<User | null> => {
        return this.users.get(id) || null;
      },
      getAllUsers: async (): Promise<User[]> => {
        return Array.from(this.users.values()).sort((a, b) => b.createdAt - a.createdAt);
      },
      insertUser: async (user: User): Promise<void> => {
        this.users.set(user.id, user);
        this.notify();
      },
      updateUser: async (user: User): Promise<void> => {
        this.users.set(user.id, user);
        this.notify();
      },
      deleteUser: async (id: string): Promise<void> => {
        this.users.delete(id);
        this.notify();
      }
    };
  }

  // ============================================================================
  // Online / Real Database Synchronization APIs
  // ============================================================================

  public getUnsyncedMessages(): ChatMessageEntity[] {
    return Array.from(this.messages.values()).filter(m => m.isSynced === false);
  }

  public markMessagesSynced(ids: number[]): void {
    const idSet = new Set(ids);
    this.messages.forEach(m => {
      if (idSet.has(m.id)) {
        m.isSynced = true;
      }
    });
    this.persist();
  }

  public getUnsyncedAlerts(): AlertEntity[] {
    return Array.from(this.alerts.values()).filter(a => a.isSynced === false);
  }

  public markAlertsSynced(ids: string[]): void {
    const idSet = new Set(ids);
    this.alerts.forEach(a => {
      if (idSet.has(a.id)) {
        a.isSynced = true;
      }
    });
    this.persist();
  }

  public getProfile(): FarmerProfileEntity | null {
    return this.farmerProfile;
  }

  public isProfileSynced(): boolean {
    return this.farmerProfile?.isSynced !== false;
  }

  public markProfileSynced(): void {
    if (this.farmerProfile) {
      this.farmerProfile.isSynced = true;
      this.persist();
    }
  }

  public getPendingSyncCount(): number {
    let count = 0;
    count += this.getUnsyncedMessages().length;
    count += this.getUnsyncedAlerts().length;
    if (this.farmerProfile && this.farmerProfile.isSynced === false) {
      count += 1;
    }
    return count;
  }

  public mergeRemoteAlerts(incomingAlerts: AlertEntity[]): number {
    let newCount = 0;
    for (const alert of incomingAlerts) {
      if (!this.alerts.has(alert.id)) {
        this.alerts.set(alert.id, { ...alert, isSynced: true });
        newCount++;
      }
    }
    if (newCount > 0) {
      this.notify();
    }
    return newCount;
  }
}
