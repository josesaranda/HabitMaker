// Tauri uses custom protocol origins that no regular website can claim.
// Allowing them lets the desktop app reach the same API as the web frontend.
const TAURI_CORS_ORIGINS = [
  'tauri://localhost',
  'http://tauri.localhost',
  'https://tauri.localhost',
];

export function resolveCorsOrigins(corsOrigin: string | undefined): string[] {
  const configuredOrigins = (corsOrigin ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...configuredOrigins, ...TAURI_CORS_ORIGINS])];
}
