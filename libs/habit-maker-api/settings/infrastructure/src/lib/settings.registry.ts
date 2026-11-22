import type { SettingsNamespace } from '@habit-maker/api-settings-domain';
import {
  parseEmailSmtpSettings,
  parsePushVapidSettings,
} from '@habit-maker/api-settings-domain';

export interface SettingsDefinition {
  version: number;
  secretFields: readonly string[];
  env: Readonly<Record<string, string>>;
  defaults: Readonly<Record<string, unknown>>;
  parse: (input: unknown) => Record<string, unknown>;
}

export const SETTINGS_DEFINITIONS: Record<
  SettingsNamespace,
  SettingsDefinition
> = {
  'email.smtp': {
    version: 1,
    secretFields: ['password'],
    env: {
      host: 'SMTP_HOST',
      port: 'SMTP_PORT',
      protocol: 'SMTP_PROTOCOL',
      user: 'SMTP_USER',
      password: 'SMTP_PASSWORD',
      from: 'SMTP_FROM',
      enabled: 'SMTP_ENABLED',
    },
    defaults: {
      port: 587,
      protocol: 'smtp',
      enabled: true,
    },
    parse: (input) =>
      parseEmailSmtpSettings(input) as unknown as Record<string, unknown>,
  },
  'push.vapid': {
    version: 1,
    secretFields: ['privateKey'],
    env: {
      publicKey: 'VAPID_PUBLIC_KEY',
      privateKey: 'VAPID_PRIVATE_KEY',
      subject: 'VAPID_SUBJECT',
      enabled: 'PUSH_ENABLED',
    },
    defaults: {
      subject: 'mailto:admin@habitmaker.local',
      enabled: true,
    },
    parse: (input) =>
      parsePushVapidSettings(input) as unknown as Record<string, unknown>,
  },
};

export const SETTINGS_NAMESPACES = Object.keys(
  SETTINGS_DEFINITIONS,
) as SettingsNamespace[];

export function isSettingsNamespace(value: string): value is SettingsNamespace {
  return Object.prototype.hasOwnProperty.call(SETTINGS_DEFINITIONS, value);
}
