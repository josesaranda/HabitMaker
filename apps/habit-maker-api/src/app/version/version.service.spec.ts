import { ServiceUnavailableException } from '@nestjs/common';
import { VersionService } from './version.service';

const currentVersion = (
  require('../../../../../package.json') as { version: string }
).version;
const newerVersion = `${Number(currentVersion.split('.')[0]) + 1}.0.0`;

describe('VersionService', () => {
  let service: VersionService;
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    service = new VersionService();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('GITHUB_TOKEN', '');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns the version declared by the project package', () => {
    expect(service.getCurrentVersion()).toEqual({ version: currentVersion });
  });

  it('reports a newer GitHub release and its metadata', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          tag_name: `v${newerVersion}`,
          html_url: `https://github.com/josesaranda/HabitMaker/releases/tag/v${newerVersion}`,
          published_at: '2026-10-01T12:00:00Z',
        }),
        { status: 200 },
      ),
    );

    await expect(service.checkForUpdates()).resolves.toEqual({
      currentVersion,
      latestVersion: newerVersion,
      updateAvailable: true,
      releaseUrl: `https://github.com/josesaranda/HabitMaker/releases/tag/v${newerVersion}`,
      publishedAt: '2026-10-01T12:00:00Z',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/josesaranda/HabitMaker/releases/latest',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.github+json',
        }),
      }),
    );
  });

  it('does not report an update when the latest release is not newer', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          tag_name: `v${currentVersion}`,
          html_url: `https://github.com/josesaranda/HabitMaker/releases/tag/v${currentVersion}`,
          published_at: '2026-10-01T12:00:00Z',
        }),
        { status: 200 },
      ),
    );

    await expect(service.checkForUpdates()).resolves.toMatchObject({
      latestVersion: currentVersion,
      updateAvailable: false,
    });
  });

  it('falls back to the latest stable tag when no GitHub release exists', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            { name: 'v1.0.0-beta.1' },
            { name: `v${newerVersion}` },
            { name: `v${currentVersion}` },
          ]),
          { status: 200 },
        ),
      );

    await expect(service.checkForUpdates()).resolves.toEqual({
      currentVersion,
      latestVersion: newerVersion,
      updateAvailable: true,
      releaseUrl: `https://github.com/josesaranda/HabitMaker/releases/tag/v${newerVersion}`,
      publishedAt: null,
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.github.com/repos/josesaranda/HabitMaker/tags?per_page=100',
      expect.any(Object),
    );
  });

  it('returns no update when the repository has no releases or stable tags', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));

    await expect(service.checkForUpdates()).resolves.toMatchObject({
      currentVersion,
      latestVersion: null,
      updateAvailable: false,
      releaseUrl: null,
      publishedAt: null,
    });
  });

  it('reports when a private repository cannot be accessed without a token', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(service.checkForUpdates()).rejects.toThrow(
      'configura GITHUB_TOKEN',
    );
  });

  it('authenticates GitHub requests when a token is configured', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'github-test-token');
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          tag_name: `v${newerVersion}`,
          html_url: `https://github.com/josesaranda/HabitMaker/releases/tag/v${newerVersion}`,
          published_at: '2026-10-01T12:00:00Z',
        }),
        { status: 200 },
      ),
    );

    await service.checkForUpdates();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/repos/josesaranda/HabitMaker/releases/latest',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer github-test-token',
        }),
      }),
    );
  });

  it('surfaces GitHub failures as a service unavailable error', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(service.checkForUpdates()).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
