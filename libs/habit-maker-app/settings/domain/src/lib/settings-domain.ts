export interface CurrentVersion {
  version: string;
}

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  releaseUrl: string | null;
  publishedAt: string | null;
}
