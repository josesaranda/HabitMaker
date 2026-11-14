import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

/**
 * Preloads every lazy route, but only when the application is running as an
 * installed PWA (standalone mode). Installed users get instant navigation and
 * the service worker caches the chunks for offline use, while regular browser
 * visits keep lazy loading untouched.
 */
@Injectable({ providedIn: 'root' })
export class PwaPreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    if (isRunningAsStandalonePwa()) {
      return load().pipe(catchError(() => of(null)));
    }
    return of(null);
  }
}

export function isRunningAsStandalonePwa(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}
