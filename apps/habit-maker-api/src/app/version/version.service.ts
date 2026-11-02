import { Injectable, ServiceUnavailableException } from '@nestjs/common';

const { version: currentVersion } = require('../../../../../package.json') as {
  version: string;
};

const LATEST_RELEASE_URL =
  'https://api.github.com/repos/josesaranda/HabitMaker/releases/latest';
const REPOSITORY_TAGS_URL =
  'https://api.github.com/repos/josesaranda/HabitMaker/tags?per_page=100';
const RELEASES_PAGE_URL = 'https://github.com/josesaranda/HabitMaker/releases';

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  published_at: string;
}

interface GitHubTag {
  name: string;
}

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
}

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  releaseUrl: string | null;
  publishedAt: string | null;
}

@Injectable()
export class VersionService {
  getCurrentVersion(): { version: string } {
    return { version: currentVersion };
  }

  async checkForUpdates(): Promise<VersionCheckResult> {
    const response = await this.fetchGitHub(LATEST_RELEASE_URL);

    if (response.status === 404) {
      return this.checkLatestTag();
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        'GitHub no pudo proporcionar la última versión',
      );
    }

    try {
      const release = (await response.json()) as GitHubRelease;
      const latestVersion = release.tag_name.replace(/^v/, '');

      return {
        currentVersion,
        latestVersion,
        updateAvailable: compareVersions(latestVersion, currentVersion) > 0,
        releaseUrl: release.html_url,
        publishedAt: release.published_at,
      };
    } catch {
      throw new ServiceUnavailableException(
        'La respuesta de GitHub no contiene una versión válida',
      );
    }
  }

  private async checkLatestTag(): Promise<VersionCheckResult> {
    const response = await this.fetchGitHub(REPOSITORY_TAGS_URL);

    if (response.status === 404) {
      throw new ServiceUnavailableException(
        'No se puede acceder al repositorio de GitHub. Si es privado, configura GITHUB_TOKEN en el backend.',
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        'GitHub no pudo proporcionar los tags del repositorio',
      );
    }

    try {
      const tags = (await response.json()) as GitHubTag[];
      if (!Array.isArray(tags)) {
        throw new Error('La respuesta de GitHub no es una lista de tags');
      }

      const latestTag = tags
        .map(({ name }) => name)
        .filter((tag) => isStableVersion(tag))
        .reduce<string | null>((latest, tag) => {
          if (!latest || compareVersions(tag, latest) > 0) {
            return tag;
          }
          return latest;
        }, null);

      if (!latestTag) {
        return {
          currentVersion,
          latestVersion: null,
          updateAvailable: false,
          releaseUrl: null,
          publishedAt: null,
        };
      }

      const latestVersion = latestTag.replace(/^v/, '');
      return {
        currentVersion,
        latestVersion,
        updateAvailable: compareVersions(latestVersion, currentVersion) > 0,
        releaseUrl: `${RELEASES_PAGE_URL}/tag/${latestTag}`,
        publishedAt: null,
      };
    } catch {
      throw new ServiceUnavailableException(
        'La respuesta de GitHub no contiene tags con versiones válidas',
      );
    }
  }

  private async fetchGitHub(url: string): Promise<Response> {
    const token = process.env.GITHUB_TOKEN?.trim();

    try {
      return await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'HabitMaker-version-check',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      throw new ServiceUnavailableException(
        'No se pudo consultar la última versión en GitHub',
      );
    }
  }
}

function compareVersions(left: string, right: string): number {
  const leftVersion = parseVersion(left);
  const rightVersion = parseVersion(right);

  for (const field of ['major', 'minor', 'patch'] as const) {
    if (leftVersion[field] !== rightVersion[field]) {
      return leftVersion[field] > rightVersion[field] ? 1 : -1;
    }
  }

  if (
    leftVersion.prerelease.length === 0 ||
    rightVersion.prerelease.length === 0
  ) {
    if (leftVersion.prerelease.length === rightVersion.prerelease.length) {
      return 0;
    }
    return leftVersion.prerelease.length === 0 ? 1 : -1;
  }

  const identifierCount = Math.max(
    leftVersion.prerelease.length,
    rightVersion.prerelease.length,
  );
  for (let index = 0; index < identifierCount; index += 1) {
    const leftIdentifier = leftVersion.prerelease[index];
    const rightIdentifier = rightVersion.prerelease[index];

    if (leftIdentifier === undefined || rightIdentifier === undefined) {
      return leftIdentifier === rightIdentifier
        ? 0
        : leftIdentifier === undefined
          ? -1
          : 1;
    }
    if (leftIdentifier === rightIdentifier) {
      continue;
    }

    const leftIsNumeric = /^\d+$/.test(leftIdentifier);
    const rightIsNumeric = /^\d+$/.test(rightIdentifier);
    if (leftIsNumeric && rightIsNumeric) {
      return Number(leftIdentifier) > Number(rightIdentifier) ? 1 : -1;
    }
    if (leftIsNumeric !== rightIsNumeric) {
      return leftIsNumeric ? -1 : 1;
    }
    return leftIdentifier > rightIdentifier ? 1 : -1;
  }

  return 0;
}

function parseVersion(version: string): ParsedVersion {
  const match =
    /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.exec(
      version,
    );

  if (!match) {
    throw new Error(`Versión semántica inválida: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4]?.split('.') ?? [],
  };
}

function isStableVersion(version: string): boolean {
  try {
    return parseVersion(version).prerelease.length === 0;
  } catch {
    return false;
  }
}
