export interface AuthSession {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface LogoutOptions {
  deferStateUpdate?: boolean;
}

export type UserRole = 'admin' | 'user';
