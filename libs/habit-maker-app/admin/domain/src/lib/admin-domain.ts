export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export type AdminSettingsSource = 'database' | 'environment';

export interface AdminEmailConfiguration {
  host: string;
  port: string;
  protocol: string;
  user: string;
  from: string;
  passwordConfigured: boolean;
  missingVariables: string[];
  isConfigured: boolean;
  enabled: boolean;
  source: AdminSettingsSource;
}

export interface AdminPushConfiguration {
  publicKey: string;
  publicKeyConfigured: boolean;
  privateKeyConfigured: boolean;
  subject: string;
  subjectConfigured: boolean;
  isConfigured: boolean;
  enabled: boolean;
  source: AdminSettingsSource;
}

export interface UpdateEmailConfigurationInput {
  host: string;
  port: string;
  protocol: string;
  user: string;
  from: string;
  password?: string;
  enabled?: boolean;
}

export interface UpdatePushConfigurationInput {
  publicKey: string;
  privateKey?: string;
  subject: string;
  enabled?: boolean;
}
