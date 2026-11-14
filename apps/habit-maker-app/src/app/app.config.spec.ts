import { ActivatedRouteSnapshot } from '@angular/router';
import { isQueryParamOnlyNavigation } from './app.config';

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
