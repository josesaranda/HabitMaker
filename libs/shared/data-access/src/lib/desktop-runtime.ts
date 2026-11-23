export const DESKTOP_API_URL_STORAGE_KEY = 'habitmaker.desktop.apiUrl';
export const DEFAULT_DESKTOP_API_URL = 'http://localhost:8080/api';

const HEALTH_CHECK_TIMEOUT_MS = 8_000;

export function isDesktopApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function getDesktopApiUrl(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage.getItem(DESKTOP_API_URL_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function saveDesktopApiUrl(apiUrl: string): void {
  window.localStorage.setItem(DESKTOP_API_URL_STORAGE_KEY, apiUrl);
}

/**
 * Accepts both a server origin (https://example.com) and an API URL
 * (https://example.com/api). Origins are completed with the default `/api`
 * path so users do not have to remember it.
 */
export function normalizeDesktopApiUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username || url.password) return null;

    const path = url.pathname.replace(/\/+$/, '');
    return `${url.origin}${path || '/api'}`;
  } catch {
    return null;
  }
}

export async function testDesktopApiConnection(
  apiUrl: string,
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiUrl}/health`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return false;

    const payload = (await response.json()) as { status?: unknown };
    return payload.status === 'ok';
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
