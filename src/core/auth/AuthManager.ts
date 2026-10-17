import { ShalikDatabase } from '../data/database/ShalikDatabase';
import { User, UserRole, Permission, RolePermissions } from './models/User';
import { PinHasher } from './security/PinHasher';

export type AuthListener = (user: User | null) => void;

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export class AuthManager {
  private static instance: AuthManager | null = null;
  private static readonly SESSION_STORAGE_KEY = 'shalik_auth_session_user_v1';
  private currentUser: User | null = null;
  private listeners: Set<AuthListener> = new Set();
  private db: ShalikDatabase;

  private constructor() {
    this.db = ShalikDatabase.getInstance();
    this.restoreSession();
  }

  private restoreSession() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(AuthManager.SESSION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.currentUser = {
            id: parsed.id,
            phone: PinHasher.normalizePhone(parsed.phone || ''),
            name: parsed.name,
            pinHash: '',
            role: parsed.role || UserRole.FARMER,
            district: parsed.district || '',
            upazila: parsed.upazila || '',
            createdAt: parsed.createdAt || Date.now()
          };
          // Asynchronously verify against authoritative database
          this.db.userDao().getUserById(parsed.id).then(dbUser => {
            if (!dbUser) {
              this.logout();
            } else if (this.currentUser && (this.currentUser.role !== dbUser.role || this.currentUser.name !== dbUser.name)) {
              this.currentUser = dbUser;
              this.notify();
            }
          }).catch(() => {});
        }
      }
    } catch (_) {}
  }

  private saveSession(user: User | null) {
    try {
      if (typeof localStorage !== 'undefined') {
        if (user) {
          const sanitized = {
            id: user.id,
            phone: user.phone,
            name: user.name,
            role: user.role,
            district: user.district,
            upazila: user.upazila,
            createdAt: user.createdAt
          };
          localStorage.setItem(AuthManager.SESSION_STORAGE_KEY, JSON.stringify(sanitized));
        } else {
          localStorage.removeItem(AuthManager.SESSION_STORAGE_KEY);
        }
      }
    } catch (_) {}
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveSession(this.currentUser);
    this.listeners.forEach(fn => {
      try { fn(this.currentUser); } catch (e) { /* ignore */ }
    });
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public hasPermission(permission: Permission): boolean {
    if (!this.currentUser) return false;
    const permissions = RolePermissions[this.currentUser.role] || [];
    return permissions.includes(permission);
  }

  public async login(phone: string, pin: string): Promise<AuthResult> {
    const cleanedPhone = PinHasher.normalizePhone(phone);
    if (!PinHasher.isValidPhone(cleanedPhone)) {
      return {
        success: false,
        error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
      };
    }

    if (!PinHasher.isValidPin(pin)) {
      return {
        success: false,
        error: 'অনুগ্রহ করে ৪ ডিজিটের পিন কোড দিন (যেমন: 1234)'
      };
    }

    const user = await this.db.userDao().getUserByPhone(cleanedPhone);
    if (!user) {
      return {
        success: false,
        error: 'এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নিবন্ধন করুন।'
      };
    }

    const isPinCorrect = PinHasher.verifyPin(pin, user.pinHash);
    if (!isPinCorrect) {
      return {
        success: false,
        error: 'ভুল পিন কোড প্রদান করেছেন। আবার চেষ্টা করুন।'
      };
    }

    this.currentUser = user;
    this.notify();
    return { success: true, user };
  }

  public async register(params: {
    phone: string;
    pin: string;
    name: string;
    role?: UserRole;
    district?: string;
    upazila?: string;
  }): Promise<AuthResult> {
    const cleanedPhone = PinHasher.normalizePhone(params.phone);
    if (!PinHasher.isValidPhone(cleanedPhone)) {
      return {
        success: false,
        error: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
      };
    }

    if (!PinHasher.isValidPin(params.pin)) {
      return {
        success: false,
        error: 'পিন কোড অবশ্যই ৪ ডিজিটের হতে হবে।'
      };
    }

    if (!params.name || params.name.trim().length < 2) {
      return {
        success: false,
        error: 'অনুগ্রহ করে আপনার পুরো নাম প্রদান করুন।'
      };
    }

    const existing = await this.db.userDao().getUserByPhone(cleanedPhone);
    if (existing) {
      return {
        success: false,
        error: 'এই মোবাইল নম্বরটি ইতিমধ্যে নিবন্ধিত রয়েছে। লগইন করার চেষ্টা করুন।'
      };
    }

    // Public self-registration is strictly restricted to FARMER role.
    // Elevated roles (OFFICER, ADMIN) are assigned by system admins or initialized in demo accounts.
    const assignedRole =
      params.role === UserRole.ADMIN || params.role === UserRole.OFFICER
        ? UserRole.FARMER
        : (params.role || UserRole.FARMER);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      phone: cleanedPhone,
      name: params.name.trim(),
      pinHash: PinHasher.hashPin(params.pin),
      role: assignedRole,
      district: params.district?.trim() || 'কুড়িগ্রাম',
      upazila: params.upazila?.trim() || 'চিলমারী',
      createdAt: Date.now()
    };

    await this.db.userDao().insertUser(newUser);
    this.currentUser = newUser;
    this.notify();

    return { success: true, user: newUser };
  }

  public logout(): void {
    this.currentUser = null;
    this.notify();
  }

  /**
   * Fast 1-tap demo login for rapid testing & evaluation
   */
  public async quickLogin(role: UserRole): Promise<AuthResult> {
    const demoCredentials: Record<UserRole, { phone: string; pin: string }> = {
      [UserRole.FARMER]: { phone: '01711000001', pin: '1234' },
      [UserRole.OFFICER]: { phone: '01811000002', pin: '5678' },
      [UserRole.ADMIN]: { phone: '01911000003', pin: '9999' }
    };

    const creds = demoCredentials[role];
    if (!creds) {
      return { success: false, error: 'অজানা রোল' };
    }
    return this.login(creds.phone, creds.pin);
  }

  public async getAllUsers(): Promise<User[]> {
    return this.db.userDao().getAllUsers();
  }

  public async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    if (!this.hasPermission(Permission.MANAGE_USERS)) {
      throw new Error('অনুমতি নেই: শুধুমাত্র সিস্টেম প্রশাসক ব্যবহারকারীর পদবি পরিবর্তন করতে পারেন');
    }

    const user = await this.db.userDao().getUserById(userId);
    if (!user) return false;

    const updatedUser: User = { ...user, role: newRole };
    await this.db.userDao().updateUser(updatedUser);

    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = updatedUser;
    }
    this.notify();
    return true;
  }
}
