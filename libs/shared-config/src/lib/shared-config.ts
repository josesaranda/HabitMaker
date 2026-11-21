import { InjectionToken } from '@angular/core';

export interface AuthTokenProvider {
  getAuthToken(): string | null;
}

export const AUTH_TOKEN_PROVIDER = new InjectionToken<AuthTokenProvider>(
  'AUTH_TOKEN_PROVIDER',
);

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
