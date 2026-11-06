import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const API_URL = (environment.API_URL || '/api').replace(/\/$/, '');
const PUBLIC_AUTH_ENDPOINTS = [
  'login',
  'signup',
  'forgot-password',
  'reset-password',
];

function isApiRequest(url: string): boolean {
  return url === API_URL || url.startsWith(`${API_URL}/`);
}

function isPublicAuthRequest(url: string): boolean {
  const requestPath = url.split('?')[0];

  return PUBLIC_AUTH_ENDPOINTS.some(
    (endpoint) => requestPath === `${API_URL}/auth/${endpoint}`,
  );
}

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAuthToken();

  if (!isApiRequest(request.url) || isPublicAuthRequest(request.url)) {
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
