import { AuthManager } from '../src/core/auth/AuthManager';
import { UserRole, Permission } from '../src/core/auth/models/User';
import { PinHasher } from '../src/core/auth/security/PinHasher';

describe('Offline Authentication & RBAC Authorization Suite', () => {
  let authManager: AuthManager;

  beforeEach(() => {
    authManager = AuthManager.getInstance();
    authManager.logout();
  });

  describe('PinHasher & Validation', () => {
    it('hashes 4-digit PIN deterministically with salt', () => {
      const hash1 = PinHasher.hashPin('1234');
      const hash2 = PinHasher.hashPin('1234');
      const hashOther = PinHasher.hashPin('5678');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hashOther);
      expect(hash1.length).toBe(64); // SHA-256 hex string length
    });

    it('verifies correct PIN and rejects incorrect PIN', () => {
      const hash = PinHasher.hashPin('9999');
      expect(PinHasher.verifyPin('9999', hash)).toBe(true);
      expect(PinHasher.verifyPin('1234', hash)).toBe(false);
    });

    it('validates 11-digit Bangladeshi phone numbers accurately', () => {
      expect(PinHasher.isValidPhone('01711000001')).toBe(true);
      expect(PinHasher.isValidPhone('01811000002')).toBe(true);
      expect(PinHasher.isValidPhone('01911000003')).toBe(true);
      expect(PinHasher.isValidPhone('01300000000')).toBe(true);

      // Invalid
      expect(PinHasher.isValidPhone('01211000001')).toBe(false); // 012 is not standard BD operator
      expect(PinHasher.isValidPhone('12345')).toBe(false);
      expect(PinHasher.isValidPhone('abc01711000')).toBe(false);
    });

    it('validates 4-digit PIN format', () => {
      expect(PinHasher.isValidPin('1234')).toBe(true);
      expect(PinHasher.isValidPin('0000')).toBe(true);
      expect(PinHasher.isValidPin('123')).toBe(false);
      expect(PinHasher.isValidPin('12345')).toBe(false);
      expect(PinHasher.isValidPin('abcd')).toBe(false);
    });
  });

  describe('Authentication Flow', () => {
    it('authenticates seeded farmer account successfully', async () => {
      const result = await authManager.login('01711000001', '1234');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.role).toBe(UserRole.FARMER);
      expect(authManager.isAuthenticated()).toBe(true);
      expect(authManager.getCurrentUser()?.phone).toBe('01711000001');
    });

    it('authenticates seeded SAAO Officer account successfully', async () => {
      const result = await authManager.login('01811000002', '5678');
      expect(result.success).toBe(true);
      expect(result.user?.role).toBe(UserRole.OFFICER);
      expect(authManager.getCurrentUser()?.name).toContain('রফিকুল ইসলাম');
    });

    it('authenticates seeded Administrator account successfully', async () => {
      const result = await authManager.login('01911000003', '9999');
      expect(result.success).toBe(true);
      expect(result.user?.role).toBe(UserRole.ADMIN);
    });

    it('rejects login with incorrect PIN', async () => {
      const result = await authManager.login('01711000001', '0000');
      expect(result.success).toBe(false);
      expect(result.error).toContain('ভুল পিন কোড');
      expect(authManager.isAuthenticated()).toBe(false);
    });

    it('rejects login with non-existent phone number', async () => {
      const result = await authManager.login('01799999999', '1234');
      expect(result.success).toBe(false);
      expect(result.error).toContain('কোনো অ্যাকাউন্ট পাওয়া যায়নি');
    });

    it('registers a new farmer account and logs them in', async () => {
      const testPhone = '01755123456';
      const result = await authManager.register({
        phone: testPhone,
        pin: '4321',
        name: 'নতুন কৃষক',
        role: UserRole.FARMER,
        district: 'গাইবান্ধা',
        upazila: 'সুন্দরগঞ্জ'
      });

      expect(result.success).toBe(true);
      expect(result.user?.name).toBe('নতুন কৃষক');
      expect(result.user?.role).toBe(UserRole.FARMER);
      expect(authManager.getCurrentUser()?.phone).toBe(testPhone);

      // Verify we can log in with new credentials
      authManager.logout();
      const loginRes = await authManager.login(testPhone, '4321');
      expect(loginRes.success).toBe(true);
    });

    it('rejects registration with already registered phone number', async () => {
      const result = await authManager.register({
        phone: '01711000001', // Already seeded farmer
        pin: '1234',
        name: 'ডুপ্লিকেট'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('ইতিমধ্যে নিবন্ধিত');
    });

    it('logs out and clears current user session', async () => {
      await authManager.login('01711000001', '1234');
      expect(authManager.isAuthenticated()).toBe(true);

      authManager.logout();
      expect(authManager.isAuthenticated()).toBe(false);
      expect(authManager.getCurrentUser()).toBeNull();
    });

    it('executes 1-tap quick demo login correctly', async () => {
      const quickRes = await authManager.quickLogin(UserRole.OFFICER);
      expect(quickRes.success).toBe(true);
      expect(authManager.getCurrentUser()?.role).toBe(UserRole.OFFICER);
    });
  });

  describe('Role-Based Access Control (RBAC) Permissions', () => {
    it('enforces Farmer role permissions correctly', async () => {
      await authManager.login('01711000001', '1234');

      // Allowed
      expect(authManager.hasPermission(Permission.ASK_ADVICE)).toBe(true);
      expect(authManager.hasPermission(Permission.VIEW_ALERTS)).toBe(true);

      // Prohibited
      expect(authManager.hasPermission(Permission.BROADCAST_ALERT)).toBe(false);
      expect(authManager.hasPermission(Permission.VIEW_FIELD_TELEMETRY)).toBe(false);
      expect(authManager.hasPermission(Permission.MANAGE_USERS)).toBe(false);
      expect(authManager.hasPermission(Permission.CONFIGURE_SAFETY_RULES)).toBe(false);
    });

    it('enforces SAAO Extension Officer role permissions correctly', async () => {
      await authManager.login('01811000002', '5678');

      // Allowed
      expect(authManager.hasPermission(Permission.ASK_ADVICE)).toBe(true);
      expect(authManager.hasPermission(Permission.VIEW_ALERTS)).toBe(true);
      expect(authManager.hasPermission(Permission.BROADCAST_ALERT)).toBe(true);
      expect(authManager.hasPermission(Permission.VIEW_FIELD_TELEMETRY)).toBe(true);

      // Prohibited
      expect(authManager.hasPermission(Permission.MANAGE_USERS)).toBe(false);
      expect(authManager.hasPermission(Permission.CONFIGURE_SAFETY_RULES)).toBe(false);
    });

    it('enforces Admin role permissions with full access', async () => {
      await authManager.login('01911000003', '9999');

      expect(authManager.hasPermission(Permission.ASK_ADVICE)).toBe(true);
      expect(authManager.hasPermission(Permission.VIEW_ALERTS)).toBe(true);
      expect(authManager.hasPermission(Permission.BROADCAST_ALERT)).toBe(true);
      expect(authManager.hasPermission(Permission.VIEW_FIELD_TELEMETRY)).toBe(true);
      expect(authManager.hasPermission(Permission.MANAGE_USERS)).toBe(true);
      expect(authManager.hasPermission(Permission.CONFIGURE_SAFETY_RULES)).toBe(true);
    });

    it('allows Admin to update user role and prohibits Farmer from doing so', async () => {
      // Login as Admin
      await authManager.login('01911000003', '9999');
      const updated = await authManager.updateUserRole('usr_farmer_1', UserRole.OFFICER);
      expect(updated).toBe(true);

      // Verify role change
      const users = await authManager.getAllUsers();
      const farmerUser = users.find(u => u.id === 'usr_farmer_1');
      expect(farmerUser?.role).toBe(UserRole.OFFICER);

      // Now login as another farmer and try to update role -> should reject
      authManager.logout();
      await authManager.register({
        phone: '01766998877',
        pin: '1111',
        name: 'সাধারণ কৃষক',
        role: UserRole.FARMER
      });

      await expect(
        authManager.updateUserRole('usr_farmer_1', UserRole.ADMIN)
      ).rejects.toThrow('অনুমতি নেই');
    });
  });
});
