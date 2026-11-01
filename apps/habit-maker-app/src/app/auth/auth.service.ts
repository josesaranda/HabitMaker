import { Injectable } from '@angular/core';

export interface AuthTokens {
  authToken: string;
  refreshToken: string;
}

const AUTH_TOKEN = 'habitmaker-demo-auth-token';
const REFRESH_TOKEN = 'habitmaker-demo-refresh-token';
const AUTH_TOKEN_STORAGE_KEY = 'habitmaker.authToken';
const REFRESH_TOKEN_STORAGE_KEY = 'habitmaker.refreshToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(_email: string, _password: string): AuthTokens {
    return this.saveTokens();
  }

  signup(_name: string, _email: string, _password: string): AuthTokens {
    return this.saveTokens();
  }

  getAuthToken(): string | null {
    return this.getStoredValue(AUTH_TOKEN_STORAGE_KEY);
  }

  getRefreshToken(): string | null {
    return this.getStoredValue(REFRESH_TOKEN_STORAGE_KEY);
  }

  isTokenValid(token: string | null = this.getAuthToken()): boolean {
    return token === AUTH_TOKEN;
  }

  isAuthenticated(): boolean {
    return this.isTokenValid();
  }

  refreshToken(refreshToken: string | null = this.getRefreshToken()): AuthTokens | null {
    if (refreshToken !== REFRESH_TOKEN) {
      return null;
    }

    return this.saveTokens();
  }

  logout(): void {
    this.removeStoredValue(AUTH_TOKEN_STORAGE_KEY);
    this.removeStoredValue(REFRESH_TOKEN_STORAGE_KEY);
  }

  private saveTokens(): AuthTokens {
    const tokens = { authToken: AUTH_TOKEN, refreshToken: REFRESH_TOKEN };
    this.storeValue(AUTH_TOKEN_STORAGE_KEY, tokens.authToken);
    this.storeValue(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    return tokens;
  }

  private getStoredValue(key: string): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  }

  private storeValue(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private removeStoredValue(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}
