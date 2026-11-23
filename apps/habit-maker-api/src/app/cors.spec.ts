import { resolveCorsOrigins } from './cors';

describe('resolveCorsOrigins', () => {
  it('always allows the Tauri desktop origins', () => {
    expect(resolveCorsOrigins(undefined)).toEqual([
      'http://localhost:4200',
      'tauri://localhost',
      'http://tauri.localhost',
      'https://tauri.localhost',
    ]);
  });

  it('accepts a comma-separated list of origins', () => {
    expect(
      resolveCorsOrigins('https://habits.example.com, http://localhost:8080 ,'),
    ).toEqual([
      'https://habits.example.com',
      'http://localhost:8080',
      'tauri://localhost',
      'http://tauri.localhost',
      'https://tauri.localhost',
    ]);
  });

  it('does not repeat an origin that is already configured', () => {
    expect(resolveCorsOrigins('tauri://localhost')).toEqual([
      'tauri://localhost',
      'http://tauri.localhost',
      'https://tauri.localhost',
    ]);
  });
});
