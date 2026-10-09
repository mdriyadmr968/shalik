export enum UserRole {
  FARMER = 'FARMER',
  OFFICER = 'OFFICER',
  ADMIN = 'ADMIN'
}

export interface UserRoleDetail {
  role: UserRole;
  labelBn: string;
  labelEn: string;
}

export const UserRoleDetails: Record<UserRole, UserRoleDetail> = {
  [UserRole.FARMER]: {
    role: UserRole.FARMER,
    labelBn: 'কৃষক',
    labelEn: 'Farmer'
  },
  [UserRole.OFFICER]: {
    role: UserRole.OFFICER,
    labelBn: 'উপ-সহকারী কৃষি কর্মকর্তা (SAAO)',
    labelEn: 'Agricultural Extension Officer'
  },
  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    labelBn: 'প্রশাসক',
    labelEn: 'System Administrator'
  }
};

export enum Permission {
  ASK_ADVICE = 'ASK_ADVICE',
  VIEW_ALERTS = 'VIEW_ALERTS',
  BROADCAST_ALERT = 'BROADCAST_ALERT',
  VIEW_FIELD_TELEMETRY = 'VIEW_FIELD_TELEMETRY',
  MANAGE_USERS = 'MANAGE_USERS',
  CONFIGURE_SAFETY_RULES = 'CONFIGURE_SAFETY_RULES'
}

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.FARMER]: [
    Permission.ASK_ADVICE,
    Permission.VIEW_ALERTS
  ],
  [UserRole.OFFICER]: [
    Permission.ASK_ADVICE,
    Permission.VIEW_ALERTS,
    Permission.BROADCAST_ALERT,
    Permission.VIEW_FIELD_TELEMETRY
  ],
  [UserRole.ADMIN]: [
    Permission.ASK_ADVICE,
    Permission.VIEW_ALERTS,
    Permission.BROADCAST_ALERT,
    Permission.VIEW_FIELD_TELEMETRY,
    Permission.MANAGE_USERS,
    Permission.CONFIGURE_SAFETY_RULES
  ]
};

export interface User {
  id: string;
  phone: string;
  name: string;
  pinHash: string;
  role: UserRole;
  district: string;
  upazila: string;
  createdAt: number;
}
