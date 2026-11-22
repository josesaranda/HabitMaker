export type SettingsNamespace = 'email.smtp' | 'push.vapid';

export type SettingsSource = 'database' | 'environment';

export interface EmailSmtpSettings {
  host: string;
  port: number;
  protocol: 'smtp' | 'smtps';
  user: string;
  password: string;
  from: string;
  enabled: boolean;
}

export interface PushVapidSettings {
  publicKey: string;
  privateKey: string;
  subject: string;
  enabled: boolean;
}

export interface PublicEmailSmtpSettings {
  host: string;
  port: string;
  protocol: string;
  user: string;
  from: string;
  passwordConfigured: boolean;
  missingVariables: string[];
  isConfigured: boolean;
  enabled: boolean;
  source: SettingsSource;
}

export interface PublicPushVapidSettings {
  publicKey: string;
  publicKeyConfigured: boolean;
  privateKeyConfigured: boolean;
  subject: string;
  subjectConfigured: boolean;
  isConfigured: boolean;
  enabled: boolean;
  source: SettingsSource;
}

export type PublicSettings = PublicEmailSmtpSettings | PublicPushVapidSettings;

export interface SettingsValidationIssue {
  field: string;
  message: string;
}

export class SettingsValidationError extends Error {
  constructor(readonly issues: SettingsValidationIssue[]) {
    super(issues.map((issue) => issue.message).join('; '));
    this.name = 'SettingsValidationError';
  }
}

export const DEFAULT_VAPID_SUBJECT = 'mailto:admin@habitmaker.local';

export function parseEmailSmtpSettings(input: unknown): EmailSmtpSettings {
  const value = asRecord(input);
  const issues: SettingsValidationIssue[] = [];

  const host = readString(value['host']);
  if (!host) {
    issues.push({ field: 'host', message: 'The SMTP host is required' });
  }

  const port = readPort(value['port']);
  if (port === null) {
    issues.push({
      field: 'port',
      message: 'The SMTP port must be an integer between 1 and 65535',
    });
  }

  const protocol = readProtocol(value['protocol']);
  if (!protocol) {
    issues.push({
      field: 'protocol',
      message: 'The SMTP protocol must be "smtp" or "smtps"',
    });
  }

  const user = readString(value['user']);
  if (!user) {
    issues.push({ field: 'user', message: 'The SMTP user is required' });
  }

  const password = readSecret(value['password']);
  if (!password) {
    issues.push({
      field: 'password',
      message: 'The SMTP password is required',
    });
  }

  const from = readString(value['from']);
  if (!from) {
    issues.push({ field: 'from', message: 'The sender address is required' });
  }

  if (issues.length > 0) {
    throw new SettingsValidationError(issues);
  }

  return {
    host: host as string,
    port: port as number,
    protocol: protocol as 'smtp' | 'smtps',
    user: user as string,
    password: password as string,
    from: from as string,
    enabled: readBoolean(value['enabled']),
  };
}

export function parsePushVapidSettings(input: unknown): PushVapidSettings {
  const value = asRecord(input);
  const issues: SettingsValidationIssue[] = [];

  const publicKey = readString(value['publicKey']);
  if (!publicKey) {
    issues.push({
      field: 'publicKey',
      message: 'The VAPID public key is required',
    });
  }

  const privateKey = readSecret(value['privateKey']);
  if (!privateKey) {
    issues.push({
      field: 'privateKey',
      message: 'The VAPID private key is required',
    });
  }

  if (issues.length > 0) {
    throw new SettingsValidationError(issues);
  }

  return {
    publicKey: publicKey as string,
    privateKey: privateKey as string,
    subject: readString(value['subject']) || DEFAULT_VAPID_SUBJECT,
    enabled: readBoolean(value['enabled']),
  };
}

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new SettingsValidationError([
      { field: 'settings', message: 'A settings object is required' },
    ]);
  }

  return input as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readSecret(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim().length > 0 ? value : null;
}

function readBoolean(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }
    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }
  }
  if (typeof value === 'number') return value !== 0;
  return true;
}

function readPort(value: unknown): number | null {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number.parseInt(value.trim(), 10)
        : Number.NaN;

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 65535
    ? parsed
    : null;
}

function readProtocol(value: unknown): 'smtp' | 'smtps' | null {
  if (typeof value !== 'string') return null;
  const protocol = value.trim().toLowerCase();
  return protocol === 'smtp' || protocol === 'smtps' ? protocol : null;
}
