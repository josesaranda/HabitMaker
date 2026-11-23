import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import {
  AuthService,
  authTokenInterceptor,
} from '@habit-maker/auth-data-access';
import {
  LanguageService,
  TranslocoHttpLoader,
} from '@habit-maker/i18n-data-access';
import { API_BASE_URL, AUTH_TOKEN_PROVIDER } from '@habit-maker/shared-config';
import {
  getDesktopApiUrl,
  isDesktopApp,
} from '@habit-maker/shared-data-access';
import { PwaPreloadStrategy } from './pwa-preload.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => {
      inject(LanguageService);
    }),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    { provide: AUTH_TOKEN_PROVIDER, useExisting: AuthService },
    { provide: API_BASE_URL, useFactory: resolveApiBaseUrl },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode() && !isDesktopApp(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideRouter(
      appRoutes,
      withPreloading(PwaPreloadStrategy),
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          if (isQueryParamOnlyNavigation(from, to)) transition.skipTransition();
        },
      }),
    ),
  ],
};

export function resolveApiBaseUrl(): string {
  if (isDesktopApp()) {
    return getDesktopApiUrl() ?? '';
  }

  return environment.API_URL || '/api';
}

export function isQueryParamOnlyNavigation(
  from: ActivatedRouteSnapshot,
  to: ActivatedRouteSnapshot,
): boolean {
  return (
    hasSameRouteTree(from, to) &&
    !hasSameParams(from.queryParams, to.queryParams)
  );
}

function hasSameRouteTree(
  from: ActivatedRouteSnapshot,
  to: ActivatedRouteSnapshot,
): boolean {
  return (
    from.routeConfig === to.routeConfig &&
    from.outlet === to.outlet &&
    hasSameParams(from.params, to.params) &&
    from.children.length === to.children.length &&
    from.children.every((child, index) =>
      hasSameRouteTree(child, to.children[index]),
    )
  );
}

function hasSameParams(
  from: Record<string, unknown>,
  to: Record<string, unknown>,
): boolean {
  const fromKeys = Object.keys(from).sort();
  const toKeys = Object.keys(to).sort();
  if (
    fromKeys.length !== toKeys.length ||
    fromKeys.some((key, index) => key !== toKeys[index])
  ) {
    return false;
  }

  return fromKeys.every((key) => {
    const fromValue = from[key];
    const toValue = to[key];
    if (Array.isArray(fromValue) && Array.isArray(toValue)) {
      return (
        fromValue.length === toValue.length &&
        fromValue.every((value, index) => value === toValue[index])
      );
    }
    return fromValue === toValue;
  });
}
