import type { UserRole } from '@habit-maker/api-auth-domain';
import type {
  PublicEmailSmtpSettings,
  PublicPushVapidSettings,
} from '@habit-maker/api-settings-domain';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
}

export type AdminEmailConfiguration = PublicEmailSmtpSettings;

export type AdminPushConfiguration = PublicPushVapidSettings;
