import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface AccessTokenResponse {
  accessToken: string;
}

interface MessageResponse {
  message: string;
}

export interface LogoutOptions {
  deferStateUpdate?: boolean;
}

const AUTH_TOKEN_STORAGE_KEY = 'habitmaker.authToken';
const API_URL = environment.API_URL || '/api';
type TokenStorage = 'local' | 'session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authenticatedState = signal(this.isTokenValid());
  readonly authenticated = this.authenticatedState.asReadonly();

  login(
    email: string,
    password: string,
    rememberSession = false,
  ): Observable<void> {
    return this.http
      .post<AccessTokenResponse>(`${API_URL}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap(({ accessToken }) => this.saveToken(accessToken, rememberSession)),
        map(() => undefined),
      );
  }

  signup(name: string, email: string, password: string): Observable<void> {
    return this.http
      .post<AccessTokenResponse>(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      })
      .pipe(
        tap(({ accessToken }) => this.saveToken(accessToken)),
        map(() => undefined),
      );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http
      .post<MessageResponse>(`${API_URL}/auth/forgot-password`, {
        email,
      })
      .pipe(map(() => undefined));
  }

  getAuthToken(): string | null {
    return this.getStoredValue(AUTH_TOKEN_STORAGE_KEY);
  }

  isTokenValid(token: string | null = this.getAuthToken()): boolean {
    if (!token) {
      return false;
    }

    const payload = token.split('.')[1];
    if (!payload) {
      return false;
    }

    try {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const binaryPayload = atob(paddedBase64);
      const bytes = Uint8Array.from(binaryPayload, (character) =>
        character.charCodeAt(0),
      );
      const claims = JSON.parse(new TextDecoder().decode(bytes)) as {
        exp?: unknown;
      };

      return typeof claims.exp === 'number' && claims.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.isTokenValid();
  }

  logout({ deferStateUpdate = false }: LogoutOptions = {}): void {
    this.clearToken();
    if (!deferStateUpdate) {
      this.authenticatedState.set(false);
    }
  }

  syncAuthenticatedState(): void {
    this.authenticatedState.set(this.isTokenValid());
  }

  private saveToken(token: string, rememberSession = false): void {
    this.clearToken();
    const storage: TokenStorage = rememberSession ? 'local' : 'session';
    this.getStorage(storage)?.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    this.authenticatedState.set(true);
  }

  private getStoredValue(key: string): string | null {
    return (
      this.getStorageValue('local', key) ?? this.getStorageValue('session', key)
    );
  }

  private getStorageValue(storage: TokenStorage, key: string): string | null {
    return this.getStorage(storage)?.getItem(key) ?? null;
  }

  private clearToken(): void {
    for (const storage of ['local', 'session'] as const) {
      this.getStorage(storage)?.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  }

  private getStorage(storage: TokenStorage): Storage | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return storage === 'local' ? window.localStorage : window.sessionStorage;
  }
}
