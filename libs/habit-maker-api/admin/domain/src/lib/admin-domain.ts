import type { UserRole } from '@habit-maker/api-auth-domain';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AdminEmailConfiguration {
  host: string;
  port: string;
  protocol: string;
  user: string;
  from: string;
  passwordConfigured: boolean;
  missingVariables: string[];
  isConfigured: boolean;
}

export interface AdminPushConfiguration {
  publicKeyConfigured: boolean;
  privateKeyConfigured: boolean;
  subjectConfigured: boolean;
  isConfigured: boolean;
}
