import { firstValueFrom, of, throwError } from 'rxjs';
import {
  PwaPreloadStrategy,
  isRunningAsStandalonePwa,
} from './pwa-preload.strategy';

describe('PwaPreloadStrategy', () => {
  const load = () => of('lazy-route');
  const strategy = new PwaPreloadStrategy();

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window.navigator as Navigator & { standalone?: boolean })
      .standalone;
  });

  it('preloads lazy routes when running as an installed PWA', async () => {
    stubStandaloneDisplayMode(true);

    const result = await firstValueFrom(strategy.preload({}, load));

    expect(result).toBe('lazy-route');
  });

  it('does not preload lazy routes in a regular browser tab', async () => {
    stubStandaloneDisplayMode(false);

    const result = await firstValueFrom(strategy.preload({}, load));

    expect(result).toBeNull();
  });

  it('does not preload when a lazy chunk fails to load', async () => {
    stubStandaloneDisplayMode(true);
    const failingLoad = () => throwError(() => new Error('chunk load error'));

    const result = await firstValueFrom(strategy.preload({}, failingLoad));

    expect(result).toBeNull();
  });
});

describe('isRunningAsStandalonePwa', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window.navigator as Navigator & { standalone?: boolean })
      .standalone;
  });

  it('detects standalone display mode', () => {
    stubStandaloneDisplayMode(true);

    expect(isRunningAsStandalonePwa()).toBe(true);
  });

  it('detects iOS home screen apps via navigator.standalone', () => {
    stubStandaloneDisplayMode(false);
    Object.defineProperty(window.navigator, 'standalone', {
      value: true,
      configurable: true,
    });

    expect(isRunningAsStandalonePwa()).toBe(true);
  });

  it('returns false in a regular browser tab', () => {
    stubStandaloneDisplayMode(false);

    expect(isRunningAsStandalonePwa()).toBe(false);
  });
});

function stubStandaloneDisplayMode(matches: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches }) as typeof window.matchMedia,
  );
}
