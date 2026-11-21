import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '@habit-maker/shared-config';
import { AuthService } from './auth.service';

const PUBLIC_AUTH_ENDPOINTS = [
  'login',
  'signup',
  'forgot-password',
  'reset-password',
];

function isApiRequest(url: string, apiUrl: string): boolean {
  return url === apiUrl || url.startsWith(`${apiUrl}/`);
}

function isPublicAuthRequest(url: string, apiUrl: string): boolean {
  const requestPath = url.split('?')[0];

  return PUBLIC_AUTH_ENDPOINTS.some(
    (endpoint) => requestPath === `${apiUrl}/auth/${endpoint}`,
  );
}

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const apiUrl = (inject(API_BASE_URL, { optional: true }) || '/api').replace(
    /\/$/,
    '',
  );
  const token = authService.getAuthToken();

  if (
    !isApiRequest(request.url, apiUrl) ||
    isPublicAuthRequest(request.url, apiUrl)
  ) {
    return next(request);
  }

  return next(
    token
      ? request.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      : request,
  ).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.clearLocalSession();
        void router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
