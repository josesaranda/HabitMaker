import { SettingsService } from '@habit-maker/api-settings-infrastructure';
import { AdminPushService } from './admin-push.service';

describe('AdminPushService', () => {
  const getPublic = vi.fn();
  const update = vi.fn();
  const service = new AdminPushService({
    getPublic,
    update,
  } as unknown as SettingsService);

  beforeEach(() => {
    getPublic.mockReset().mockResolvedValue({
      publicKey: 'public-key',
      publicKeyConfigured: true,
      privateKeyConfigured: true,
      subject: 'mailto:admin@example.com',
      subjectConfigured: true,
      isConfigured: true,
      source: 'database',
      enabled: true,
    });
    update.mockReset().mockResolvedValue(undefined);
  });

  it('returns the public VAPID configuration without the private key', async () => {
    const configuration = await service.getConfiguration();

    expect(getPublic).toHaveBeenCalledWith('push.vapid');
    expect(configuration).toEqual({
      publicKey: 'public-key',
      publicKeyConfigured: true,
      privateKeyConfigured: true,
      subject: 'mailto:admin@example.com',
      subjectConfigured: true,
      isConfigured: true,
      source: 'database',
      enabled: true,
    });
    expect(JSON.stringify(configuration)).not.toContain('private-key');
  });

  it('persists the VAPID configuration through the settings service', async () => {
    const input = {
      publicKey: 'new-public-key',
      privateKey: 'new-private-key',
      subject: 'mailto:admin@example.com',
    };

    await service.updateConfiguration(input, 'admin-1');

    expect(update).toHaveBeenCalledWith('push.vapid', input, 'admin-1');
    expect(getPublic).toHaveBeenCalledWith('push.vapid');
  });
});
