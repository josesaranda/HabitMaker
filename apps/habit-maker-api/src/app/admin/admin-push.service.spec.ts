import { AdminPushService } from './admin-push.service';

describe('AdminPushService', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('reports which VAPID variables are configured without returning their values', () => {
    vi.stubEnv('VAPID_PUBLIC_KEY', 'public-secret-value');
    vi.stubEnv('VAPID_PRIVATE_KEY', 'private-secret-value');
    vi.stubEnv('VAPID_SUBJECT', 'mailto:admin@example.com');

    const configuration = new AdminPushService().getConfiguration();

    expect(configuration).toEqual({
      publicKeyConfigured: true,
      privateKeyConfigured: true,
      subjectConfigured: true,
      isConfigured: true,
    });
    expect(JSON.stringify(configuration)).not.toContain('secret-value');
  });

  it('treats the subject as optional but requires both VAPID keys', () => {
    vi.stubEnv('VAPID_PUBLIC_KEY', 'public-key');
    vi.stubEnv('VAPID_PRIVATE_KEY', ' ');
    vi.stubEnv('VAPID_SUBJECT', '');

    expect(new AdminPushService().getConfiguration()).toEqual({
      publicKeyConfigured: true,
      privateKeyConfigured: false,
      subjectConfigured: false,
      isConfigured: false,
    });
  });
});
