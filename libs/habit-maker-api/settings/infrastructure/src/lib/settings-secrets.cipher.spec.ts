import { describe, expect, it, vi } from 'vitest';
import { SettingsSecretsCipher } from './settings-secrets.cipher';

const VALID_KEY = Buffer.alloc(32, 7).toString('base64');

describe('SettingsSecretsCipher', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('encrypts and decrypts a secret without storing it in plain text', () => {
    vi.stubEnv('SETTINGS_ENCRYPTION_KEY', VALID_KEY);
    const cipher = new SettingsSecretsCipher();

    const encrypted = cipher.encrypt('smtp-secret');

    expect(encrypted).toMatch(/^v1\./);
    expect(encrypted).not.toContain('smtp-secret');
    expect(cipher.decrypt(encrypted)).toBe('smtp-secret');
  });

  it('reports when the encryption key is not configured', () => {
    vi.stubEnv('SETTINGS_ENCRYPTION_KEY', '');
    const cipher = new SettingsSecretsCipher();

    expect(cipher.isAvailable()).toBe(false);
    expect(() => cipher.encrypt('secret')).toThrow(
      'SETTINGS_ENCRYPTION_KEY is not configured',
    );
  });

  it('rejects keys that are not exactly 32 bytes', () => {
    vi.stubEnv('SETTINGS_ENCRYPTION_KEY', 'too-short');

    expect(() => new SettingsSecretsCipher()).toThrow(
      'SETTINGS_ENCRYPTION_KEY must contain exactly 32 bytes',
    );
  });

  it('does not decrypt a value with a different key', () => {
    vi.stubEnv('SETTINGS_ENCRYPTION_KEY', VALID_KEY);
    const encrypted = new SettingsSecretsCipher().encrypt('secret');

    vi.stubEnv(
      'SETTINGS_ENCRYPTION_KEY',
      Buffer.alloc(32, 9).toString('base64'),
    );
    const otherCipher = new SettingsSecretsCipher();

    expect(() => otherCipher.decrypt(encrypted)).toThrow();
  });
});
