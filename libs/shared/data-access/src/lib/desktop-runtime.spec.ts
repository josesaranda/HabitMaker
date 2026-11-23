import {
  DESKTOP_API_URL_STORAGE_KEY,
  getDesktopApiUrl,
  isDesktopApp,
  normalizeDesktopApiUrl,
  saveDesktopApiUrl,
  testDesktopApiConnection,
} from './desktop-runtime';

describe('desktop runtime', () => {
  afterEach(() => {
    localStorage.removeItem(DESKTOP_API_URL_STORAGE_KEY);
    delete (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    vi.restoreAllMocks();
  });

  it('detects the Tauri runtime', () => {
    expect(isDesktopApp()).toBe(false);

    (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {};

    expect(isDesktopApp()).toBe(true);
  });

  it('stores and reads the API URL', () => {
    expect(getDesktopApiUrl()).toBeNull();

    saveDesktopApiUrl('https://habits.example.com/api');

    expect(getDesktopApiUrl()).toBe('https://habits.example.com/api');
  });

  it('normalizes server origins and API URLs', () => {
    expect(normalizeDesktopApiUrl('https://habits.example.com')).toBe(
      'https://habits.example.com/api',
    );
    expect(normalizeDesktopApiUrl(' https://habits.example.com/api/ ')).toBe(
      'https://habits.example.com/api',
    );
    expect(normalizeDesktopApiUrl('http://localhost:8080')).toBe(
      'http://localhost:8080/api',
    );
  });

  it('rejects invalid API URLs', () => {
    expect(normalizeDesktopApiUrl('')).toBeNull();
    expect(normalizeDesktopApiUrl('habits.example.com')).toBeNull();
    expect(normalizeDesktopApiUrl('ftp://habits.example.com')).toBeNull();
    expect(
      normalizeDesktopApiUrl('https://user:secret@habits.example.com'),
    ).toBeNull();
  });

  it('accepts an API that answers the health check', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
      );

    await expect(
      testDesktopApiConnection('https://habits.example.com/api'),
    ).resolves.toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'https://habits.example.com/api/health',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    );
  });

  it('rejects a response that is not the HabitMaker API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<html></html>', { status: 200 }),
    );

    await expect(
      testDesktopApiConnection('https://habits.example.com'),
    ).resolves.toBe(false);
  });

  it('rejects an unreachable API', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));

    await expect(
      testDesktopApiConnection('https://habits.example.com'),
    ).resolves.toBe(false);
  });
});
