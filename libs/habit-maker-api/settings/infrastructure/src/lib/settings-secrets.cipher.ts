import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';
const IV_LENGTH = 12;

@Injectable()
export class SettingsSecretsCipher {
  private readonly key: Buffer | null;

  constructor() {
    this.key = readEncryptionKey(process.env['SETTINGS_ENCRYPTION_KEY']);
  }

  isAvailable(): boolean {
    return this.key !== null;
  }

  encrypt(value: string): string {
    const key = this.requireKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      VERSION,
      iv.toString('base64url'),
      authTag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join('.');
  }

  decrypt(value: string): string {
    const key = this.requireKey();
    const [version, iv, authTag, encrypted] = value.split('.');

    if (version !== VERSION || !iv || !authTag || !encrypted) {
      throw new Error('Unsupported encrypted setting format');
    }

    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(iv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64url'));

    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  private requireKey(): Buffer {
    if (!this.key) {
      throw new Error('SETTINGS_ENCRYPTION_KEY is not configured');
    }

    return this.key;
  }
}

function readEncryptionKey(value: string | undefined): Buffer | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const key = /^[0-9a-f]{64}$/i.test(trimmed)
    ? Buffer.from(trimmed, 'hex')
    : Buffer.from(trimmed, 'base64');

  if (key.length !== 32) {
    throw new Error(
      'SETTINGS_ENCRYPTION_KEY must contain exactly 32 bytes encoded as base64 or hex',
    );
  }

  return key;
}
