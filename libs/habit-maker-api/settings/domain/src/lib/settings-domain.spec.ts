import { describe, expect, it } from 'vitest';
import {
  DEFAULT_VAPID_SUBJECT,
  parseEmailSmtpSettings,
  parsePushVapidSettings,
  SettingsValidationError,
} from './settings-domain';

describe('settings domain', () => {
  it('normalizes a valid SMTP configuration', () => {
    expect(
      parseEmailSmtpSettings({
        host: ' smtp.example.com ',
        port: '465',
        protocol: 'SMTPS',
        user: 'mailer@example.com',
        password: 'secret',
        from: 'HabitMaker <no-reply@example.com>',
      }),
    ).toEqual({
      host: 'smtp.example.com',
      port: 465,
      protocol: 'smtps',
      user: 'mailer@example.com',
      password: 'secret',
      from: 'HabitMaker <no-reply@example.com>',
      enabled: true,
    });
  });

  it('rejects an incomplete SMTP configuration', () => {
    expect(() =>
      parseEmailSmtpSettings({ host: '', port: 'abc', protocol: 'http' }),
    ).toThrow(SettingsValidationError);
  });

  it('uses the default VAPID subject when it is empty', () => {
    expect(
      parsePushVapidSettings({
        publicKey: 'public-key',
        privateKey: 'private-key',
        subject: '',
      }),
    ).toEqual({
      publicKey: 'public-key',
      privateKey: 'private-key',
      subject: DEFAULT_VAPID_SUBJECT,
      enabled: true,
    });
  });

  it('requires both VAPID keys', () => {
    expect(() => parsePushVapidSettings({ publicKey: 'public-key' })).toThrow(
      SettingsValidationError,
    );
  });
});
