import { Injectable, signal } from '@angular/core';

export interface AuthTokens {
  authToken: string;
  refreshToken: string;
}

const AUTH_TOKEN = 'habitmaker-demo-auth-token';
const REFRESH_TOKEN = 'habitmaker-demo-refresh-token';
const AUTH_TOKEN_STORAGE_KEY = 'habitmaker.authToken';
const REFRESH_TOKEN_STORAGE_KEY = 'habitmaker.refreshToken';
type TokenStorage = 'local' | 'session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticatedState = signal(this.isTokenValid());
  readonly authenticated = this.authenticatedState.asReadonly();

  login(_email: string, _password: string, rememberSession = false): AuthTokens {
    return this.saveTokens(rememberSession);
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

    const rememberSession =
      this.getStorageValue('local', REFRESH_TOKEN_STORAGE_KEY) === refreshToken;
    return this.saveTokens(rememberSession);
  }

  logout(): void {
    this.clearTokens();
    this.authenticatedState.set(false);
  }

  private saveTokens(rememberSession = false): AuthTokens {
    const tokens = { authToken: AUTH_TOKEN, refreshToken: REFRESH_TOKEN };
    this.clearTokens();
    const storage: TokenStorage = rememberSession ? 'local' : 'session';
    this.storeValue(storage, AUTH_TOKEN_STORAGE_KEY, tokens.authToken);
    this.storeValue(storage, REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    this.authenticatedState.set(true);
    return tokens;
  }

  private getStoredValue(key: string): string | null {
    return (
      this.getStorageValue('local', key) ?? this.getStorageValue('session', key)
    );
  }

  private getStorageValue(storage: TokenStorage, key: string): string | null {
    return this.getStorage(storage)?.getItem(key) ?? null;
  }

  private storeValue(storage: TokenStorage, key: string, value: string): void {
    this.getStorage(storage)?.setItem(key, value);
  }

  private clearTokens(): void {
    for (const storage of ['local', 'session'] as const) {
      this.getStorage(storage)?.removeItem(AUTH_TOKEN_STORAGE_KEY);
      this.getStorage(storage)?.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  }

  private getStorage(storage: TokenStorage): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return storage === 'local' ? window.localStorage : window.sessionStorage;
  }
}
