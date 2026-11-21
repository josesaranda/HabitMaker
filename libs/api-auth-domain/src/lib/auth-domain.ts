export type UserRole = 'admin' | 'user';

export interface AuthSession {
  id: string;
  userId: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  revokedAt: string | null;
}
