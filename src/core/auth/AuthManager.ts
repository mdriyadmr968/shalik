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
  private currentUser: User | null = null;
  private listeners: Set<AuthListener> = new Set();
  private db: ShalikDatabase;

  private constructor() {
    this.db = ShalikDatabase.getInstance();
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
    const cleanedPhone = phone.replace(/[\s-]/g, '');
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
    const cleanedPhone = params.phone.replace(/[\s-]/g, '');
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

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      phone: cleanedPhone,
      name: params.name.trim(),
      pinHash: PinHasher.hashPin(params.pin),
      role: params.role || UserRole.FARMER,
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
