import { ActivatedRouteSnapshot } from '@angular/router';
import { DESKTOP_API_URL_STORAGE_KEY } from '@habit-maker/shared-data-access';
import { environment } from '../environments/environment';
import { isQueryParamOnlyNavigation, resolveApiBaseUrl } from './app.config';

describe('resolveApiBaseUrl', () => {
  afterEach(() => {
    localStorage.removeItem(DESKTOP_API_URL_STORAGE_KEY);
    delete (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  });

  it('uses the environment API URL on the web', () => {
    expect(resolveApiBaseUrl()).toBe(environment.API_URL || '/api');
  });

  it('uses the configured API URL in the desktop app', () => {
    (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {};
    localStorage.setItem(
      DESKTOP_API_URL_STORAGE_KEY,
      'https://habits.example.com/api',
    );

    expect(resolveApiBaseUrl()).toBe('https://habits.example.com/api');
  });

  it('returns an empty API URL in the desktop app until one is configured', () => {
    (window as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__ = {};

    expect(resolveApiBaseUrl()).toBe('');
  });
});

describe('isQueryParamOnlyNavigation', () => {
  it('identifies query-param changes within the same route tree', () => {
    const habitRoute = {};
    const from = snapshot(null, {}, { from: '2026-10-01' }, [
      snapshot(habitRoute, { id: 'habit-1' }, { from: '2026-10-01' }),
    ]);
    const to = snapshot(null, {}, { from: '2026-10-02' }, [
      snapshot(habitRoute, { id: 'habit-1' }, { from: '2026-10-02' }),
    ]);

    expect(isQueryParamOnlyNavigation(from, to)).toBe(true);
  });

  it('keeps view transitions for route or path-param changes', () => {
    const from = snapshot(null, {}, {}, [
      snapshot({}, { id: 'habit-1' }, { from: '2026-10-01' }),
    ]);
    const differentRoute = snapshot(null, {}, {}, [
      snapshot({}, { id: 'habit-1' }, { from: '2026-10-02' }),
    ]);
    const differentPathParam = snapshot(null, {}, {}, [
      snapshot(
        from.children[0].routeConfig,
        { id: 'habit-2' },
        {
          from: '2026-10-02',
        },
      ),
    ]);

    expect(isQueryParamOnlyNavigation(from, differentRoute)).toBe(false);
    expect(isQueryParamOnlyNavigation(from, differentPathParam)).toBe(false);
  });
});

function snapshot(
  routeConfig: object | null,
  params: Record<string, unknown>,
  queryParams: Record<string, unknown>,
  children: ActivatedRouteSnapshot[] = [],
): ActivatedRouteSnapshot {
  return {
    routeConfig,
    params,
    queryParams,
    outlet: 'primary',
    children,
  } as unknown as ActivatedRouteSnapshot;
}
