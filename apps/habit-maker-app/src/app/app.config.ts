import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withViewTransitions } from '@angular/router';
import { appRoutes } from './app.routes';
import { authTokenInterceptor } from './auth/auth-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    provideRouter(appRoutes, withViewTransitions()),
  ],
};
