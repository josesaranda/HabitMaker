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
  withViewTransitions,
} from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { appRoutes } from './app.routes';
import { authTokenInterceptor } from './auth/auth-token.interceptor';
import { TranslocoHttpLoader } from './i18n/transloco-loader';
import { LanguageService } from './i18n/language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => {
      inject(LanguageService);
    }),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
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
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          if (isQueryParamOnlyNavigation(from, to)) transition.skipTransition();
        },
      }),
    ),
  ],
};

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
