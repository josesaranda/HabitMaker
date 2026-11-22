import 'reflect-metadata';
import { ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SettingsValidationError } from '@habit-maker/api-settings-domain';
import { SettingEntity } from './setting.entity';
import { SettingsSecretsCipher } from './settings-secrets.cipher';
import { SettingsService } from './settings.service';

const ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');

describe('SettingsService', () => {
  let dataSource: DataSource;
  let service: SettingsService;

  beforeEach(async () => {
    vi.stubEnv('SETTINGS_ENCRYPTION_KEY', ENCRYPTION_KEY);
    vi.stubEnv('SMTP_HOST', 'smtp.environment.example.com');
    vi.stubEnv('SMTP_PORT', '587');
    vi.stubEnv('SMTP_PROTOCOL', 'smtp');
    vi.stubEnv('SMTP_USER', 'environment@example.com');
    vi.stubEnv('SMTP_PASSWORD', 'environment-secret');
    vi.stubEnv('SMTP_FROM', 'HabitMaker <environment@example.com>');
    vi.stubEnv('VAPID_PUBLIC_KEY', 'environment-public-key');
    vi.stubEnv('VAPID_PRIVATE_KEY', 'environment-private-secret');
    vi.stubEnv('VAPID_SUBJECT', 'mailto:admin@example.com');

    dataSource = new DataSource({
      type: 'sqljs',
      autoSave: false,
      entities: [SettingEntity],
      synchronize: true,
    });
    await dataSource.initialize();

    service = new SettingsService(
      dataSource.getRepository(SettingEntity),
      new SettingsSecretsCipher(),
    );
  });

  afterEach(async () => {
    await dataSource.destroy();
    vi.unstubAllEnvs();
  });

  it('falls back to environment variables without persisting them', async () => {
    const configuration = await service.getPublic('email.smtp');

    expect(configuration).toEqual({
      host: 'smtp.environment.example.com',
      port: '587',
      protocol: 'smtp',
      user: 'environment@example.com',
      from: 'HabitMaker <environment@example.com>',
      passwordConfigured: true,
      missingVariables: [],
      isConfigured: true,
      enabled: true,
      source: 'environment',
    });
    expect(configuration).not.toHaveProperty('password');
    expect(await service.getSource('email.smtp')).toBe('environment');
  });

  it('persists a complete configuration and encrypts its secret', async () => {
    await service.update(
      'email.smtp',
      {
        host: 'smtp.database.example.com',
        port: '465',
        protocol: 'smtps',
        user: 'database@example.com',
        from: 'HabitMaker <database@example.com>',
        password: 'database-secret',
      },
      'admin-1',
    );

    const row = await dataSource
      .getRepository(SettingEntity)
      .createQueryBuilder('setting')
      .addSelect('setting.secrets')
      .where('setting.namespace = :namespace', { namespace: 'email.smtp' })
      .getOneOrFail();

    expect(JSON.stringify(row.value)).not.toContain('database-secret');
    expect(JSON.stringify(row.secrets)).not.toContain('database-secret');
    expect(row.secrets['password']).toMatch(/^v1\./);
    expect(row.updatedBy).toBe('admin-1');
    expect(row.schemaVersion).toBe(1);

    expect(await service.getPublic('email.smtp')).toMatchObject({
      host: 'smtp.database.example.com',
      port: '465',
      protocol: 'smtps',
      passwordConfigured: true,
      isConfigured: true,
      enabled: true,
      source: 'database',
    });
    expect((await service.getInternal('email.smtp')).password).toBe(
      'database-secret',
    );
  });

  it('keeps the stored password when an update does not include one', async () => {
    await service.update(
      'email.smtp',
      {
        host: 'smtp.database.example.com',
        port: '587',
        protocol: 'smtp',
        user: 'database@example.com',
        from: 'HabitMaker <database@example.com>',
        password: 'first-secret',
      },
      'admin-1',
    );

    await service.update(
      'email.smtp',
      {
        host: 'smtp.changed.example.com',
        port: '587',
        protocol: 'smtp',
        user: 'database@example.com',
        from: 'HabitMaker <database@example.com>',
        password: '',
      },
      'admin-1',
    );

    expect((await service.getInternal('email.smtp')).password).toBe(
      'first-secret',
    );
    expect((await service.getPublic('email.smtp')).host).toBe(
      'smtp.changed.example.com',
    );
  });

  it('rejects invalid updates', async () => {
    await expect(
      service.update(
        'email.smtp',
        { host: '', port: 'not-a-port', protocol: 'http' },
        'admin-1',
      ),
    ).rejects.toThrow(SettingsValidationError);
  });

  it('never exposes the VAPID private key', async () => {
    const configuration = await service.getPublic('push.vapid');

    expect(configuration).toEqual({
      publicKey: 'environment-public-key',
      publicKeyConfigured: true,
      privateKeyConfigured: true,
      subject: 'mailto:admin@example.com',
      subjectConfigured: true,
      isConfigured: true,
      enabled: true,
      source: 'environment',
    });
    expect(JSON.stringify(configuration)).not.toContain(
      'environment-private-secret',
    );
  });

  it('falls back to the environment after resetting a namespace', async () => {
    await service.update(
      'push.vapid',
      {
        publicKey: 'database-public-key',
        privateKey: 'database-private-secret',
        subject: 'mailto:database@example.com',
      },
      'admin-1',
    );
    expect(await service.getSource('push.vapid')).toBe('database');

    await service.reset('push.vapid');

    expect(await service.getSource('push.vapid')).toBe('environment');
    expect((await service.getPublic('push.vapid')).publicKey).toBe(
      'environment-public-key',
    );
  });

  it('refuses to persist secrets when the encryption key is missing', async () => {
    vi.stubEnv('SETTINGS_ENCRYPTION_KEY', '');
    const serviceWithoutKey = new SettingsService(
      dataSource.getRepository(SettingEntity),
      new SettingsSecretsCipher(),
    );

    await expect(
      serviceWithoutKey.update(
        'email.smtp',
        {
          host: 'smtp.database.example.com',
          port: '587',
          protocol: 'smtp',
          user: 'database@example.com',
          from: 'HabitMaker <database@example.com>',
          password: 'database-secret',
        },
        'admin-1',
      ),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
