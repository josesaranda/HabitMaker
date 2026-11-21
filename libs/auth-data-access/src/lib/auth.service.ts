import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AuthSession, LogoutOptions } from '@habit-maker/auth-domain';
import { API_BASE_URL } from '@habit-maker/shared-config';

interface AccessTokenResponse {
  accessToken: string;
}

interface MessageResponse {
  message: string;
}

const AUTH_TOKEN_STORAGE_KEY = 'habitmaker.authToken';
type TokenStorage = 'local' | 'session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL, { optional: true });
  private readonly authenticatedState = signal(this.isTokenValid());

  private get apiUrl(): string {
    return this.apiBaseUrl || '/api';
  }
  readonly authenticated = this.authenticatedState.asReadonly();

  login(
    email: string,
    password: string,
    rememberSession = false,
  ): Observable<void> {
    return this.http
      .post<AccessTokenResponse>(`${this.apiUrl}/auth/login`, {
        email,
        password,
        rememberSession,
      })
      .pipe(
        tap(({ accessToken }) => this.saveToken(accessToken, rememberSession)),
        map(() => undefined),
      );
  }

  signup(name: string, email: string, password: string): Observable<void> {
    return this.http
      .post<AccessTokenResponse>(`${this.apiUrl}/auth/signup`, {
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
      .post<MessageResponse>(`${this.apiUrl}/auth/forgot-password`, {
        email,
      })
      .pipe(map(() => undefined));
  }

  resetPassword(token: string, password: string): Observable<void> {
    return this.http
      .post<MessageResponse>(`${this.apiUrl}/auth/reset-password`, {
        token,
        password,
      })
      .pipe(map(() => undefined));
  }

  getAuthToken(): string | null {
    return this.getStoredValue(AUTH_TOKEN_STORAGE_KEY);
  }

  getUserEmail(): string {
    const claims = this.getTokenClaims();
    return typeof claims?.email === 'string' ? claims.email : '';
  }

  getUserRole(): 'admin' | 'user' | null {
    const role = this.getTokenClaims()?.role;
    return role === 'admin' || role === 'user' ? role : null;
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
    this.revokeCurrentSession().subscribe({ error: () => undefined });
    this.clearToken();
    if (!deferStateUpdate) {
      this.authenticatedState.set(false);
    }
  }

  getSessions(): Observable<AuthSession[]> {
    return this.http.get<AuthSession[]>(`${this.apiUrl}/auth/sessions`);
  }

  revokeSession(sessionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/auth/sessions/${encodeURIComponent(sessionId)}`,
    );
  }

  revokeOtherSessions(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/auth/sessions/others`);
  }

  revokeCurrentSession(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/auth/sessions/current`);
  }

  clearLocalSession(): void {
    this.clearToken();
    this.authenticatedState.set(false);
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

  private getTokenClaims(): { email?: unknown; role?: unknown } | null {
    const payload = this.getAuthToken()?.split('.')[1];
    if (!payload) {
      return null;
    }

    try {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const binaryPayload = atob(paddedBase64);
      const bytes = Uint8Array.from(binaryPayload, (character) =>
        character.charCodeAt(0),
      );
      return JSON.parse(new TextDecoder().decode(bytes)) as {
        email?: unknown;
        role?: unknown;
      };
    } catch {
      return null;
    }
  }
}
