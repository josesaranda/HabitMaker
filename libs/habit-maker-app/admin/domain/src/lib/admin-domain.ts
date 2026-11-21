export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
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
