import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  EmailSmtpSettings,
  PublicEmailSmtpSettings,
  PublicPushVapidSettings,
  PublicSettings,
  PushVapidSettings,
  SettingsNamespace,
  SettingsSource,
} from '@habit-maker/api-settings-domain';
import { SettingsValidationError } from '@habit-maker/api-settings-domain';
import { SettingEntity } from './setting.entity';
import { SettingsSecretsCipher } from './settings-secrets.cipher';
import {
  SETTINGS_DEFINITIONS,
  SETTINGS_NAMESPACES,
  type SettingsDefinition,
} from './settings.registry';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settings: Repository<SettingEntity>,
    private readonly cipher: SettingsSecretsCipher,
  ) {}

  async getInternal(
    namespace: 'email.smtp',
  ): Promise<Partial<EmailSmtpSettings>>;
  async getInternal(
    namespace: 'push.vapid',
  ): Promise<Partial<PushVapidSettings>>;
  async getInternal(
    namespace: SettingsNamespace,
  ): Promise<Partial<EmailSmtpSettings> | Partial<PushVapidSettings>>;
  async getInternal(
    namespace: SettingsNamespace,
  ): Promise<Partial<EmailSmtpSettings> | Partial<PushVapidSettings>> {
    const definition = SETTINGS_DEFINITIONS[namespace];
    const row = await this.settings
      .createQueryBuilder('setting')
      .addSelect('setting.secrets')
      .where('setting.namespace = :namespace', { namespace })
      .getOne();

    const resolved: Record<string, unknown> = {
      ...definition.defaults,
      ...this.readEnvironment(definition),
    };

    if (row) {
      Object.assign(resolved, row.value, this.decryptSecrets(row, definition));
    }

    return resolved as Partial<EmailSmtpSettings> | Partial<PushVapidSettings>;
  }

  async getPublic(namespace: 'email.smtp'): Promise<PublicEmailSmtpSettings>;
  async getPublic(namespace: 'push.vapid'): Promise<PublicPushVapidSettings>;
  async getPublic(namespace: SettingsNamespace): Promise<PublicSettings>;
  async getPublic(namespace: SettingsNamespace): Promise<PublicSettings> {
    const source = await this.getSource(namespace);
    const settings = await this.getInternal(namespace);

    if (namespace === 'email.smtp') {
      return this.toPublicEmail(settings as Partial<EmailSmtpSettings>, source);
    }

    return this.toPublicPush(settings as Partial<PushVapidSettings>, source);
  }

  async getPublicAll(): Promise<Record<SettingsNamespace, PublicSettings>> {
    const entries = await Promise.all(
      SETTINGS_NAMESPACES.map(
        async (namespace) =>
          [namespace, await this.getPublic(namespace)] as const,
      ),
    );

    return Object.fromEntries(entries) as Record<
      SettingsNamespace,
      PublicSettings
    >;
  }

  async update(
    namespace: SettingsNamespace,
    input: unknown,
    userId: string | null,
  ): Promise<void> {
    const definition = SETTINGS_DEFINITIONS[namespace];
    const provided = this.parseInputObject(input);
    const existing = await this.getInternal(namespace);
    const merged: Record<string, unknown> = { ...existing, ...provided };

    for (const field of definition.secretFields) {
      const value = provided[field];
      if (typeof value !== 'string' || value.trim() === '') {
        merged[field] = (existing as Record<string, unknown>)[field];
      }
    }

    const parsed = definition.parse(merged);

    if (definition.secretFields.length > 0 && !this.cipher.isAvailable()) {
      throw new ServiceUnavailableException(
        'SETTINGS_ENCRYPTION_KEY is not configured',
      );
    }

    const value: Record<string, unknown> = { ...parsed };
    const secrets: Record<string, string> = {};

    for (const field of definition.secretFields) {
      const secret = parsed[field];
      if (typeof secret === 'string' && secret.length > 0) {
        secrets[field] = this.cipher.encrypt(secret);
      }
      delete value[field];
    }

    await this.settings.save({
      namespace,
      value,
      secrets,
      schemaVersion: definition.version,
      updatedBy: userId,
    });
  }

  async reset(namespace: SettingsNamespace): Promise<void> {
    await this.settings.delete({ namespace });
  }

  async getSource(namespace: SettingsNamespace): Promise<SettingsSource> {
    const count = await this.settings.countBy({ namespace });
    return count > 0 ? 'database' : 'environment';
  }

  private readEnvironment(
    definition: SettingsDefinition,
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [field, variable] of Object.entries(definition.env)) {
      const raw = process.env[variable];
      if (raw === undefined) continue;
      const value = definition.secretFields.includes(field) ? raw : raw.trim();
      if (value.trim() !== '') resolved[field] = value;
    }

    return resolved;
  }

  private decryptSecrets(
    row: SettingEntity,
    definition: SettingsDefinition,
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [field, encrypted] of Object.entries(row.secrets ?? {})) {
      if (!definition.secretFields.includes(field)) continue;
      resolved[field] = this.cipher.decrypt(encrypted);
    }

    return resolved;
  }

  private toPublicEmail(
    settings: Partial<EmailSmtpSettings>,
    source: SettingsSource,
  ): PublicEmailSmtpSettings {
    let isConfigured = true;
    try {
      SETTINGS_DEFINITIONS['email.smtp'].parse(settings);
    } catch {
      isConfigured = false;
    }

    const missingVariables = isConfigured
      ? []
      : Object.entries(SETTINGS_DEFINITIONS['email.smtp'].env)
          .filter(
            ([field]) =>
              this.asString((settings as Record<string, unknown>)[field]) ===
              '',
          )
          .map(([, variable]) => variable);

    return {
      host: this.asString(settings.host),
      port: this.asString(settings.port),
      protocol: this.asString(settings.protocol),
      user: this.asString(settings.user),
      from: this.asString(settings.from),
      passwordConfigured: this.asString(settings.password) !== '',
      missingVariables,
      isConfigured,
      enabled: settings.enabled !== false,
      source,
    };
  }

  private toPublicPush(
    settings: Partial<PushVapidSettings>,
    source: SettingsSource,
  ): PublicPushVapidSettings {
    const publicKey = this.asString(settings.publicKey);
    const privateKey = this.asString(settings.privateKey);
    const subject = this.asString(settings.subject);

    return {
      publicKey,
      publicKeyConfigured: publicKey !== '',
      privateKeyConfigured: privateKey !== '',
      subject,
      subjectConfigured: subject !== '',
      isConfigured: publicKey !== '' && privateKey !== '',
      enabled: settings.enabled !== false,
      source,
    };
  }

  private parseInputObject(input: unknown): Record<string, unknown> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new SettingsValidationError([
        { field: 'settings', message: 'A settings object is required' },
      ]);
    }

    return input as Record<string, unknown>;
  }

  private asString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
    return '';
  }
}
