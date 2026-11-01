import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const createJwt = (expiresAt = Math.floor(Date.now() / 1000) + 3600): string =>
  `header.${btoa(JSON.stringify({ exp: expiresAt }))}.signature`;
const API_URL = environment.API_URL || '/api';

describe('AuthService', () => {
  let authService: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    authService = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('sends login credentials and stores the returned JWT in sessionStorage', () => {
    const token = createJwt();
    authService.login('person@example.com', 'password123').subscribe();

    const request = httpTestingController.expectOne(`${API_URL}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'person@example.com',
      password: 'password123',
    });
    request.flush({ accessToken: token });

    expect(authService.getAuthToken()).toBe(token);
    expect(localStorage.getItem('habitmaker.authToken')).toBeNull();
    expect(sessionStorage.getItem('habitmaker.authToken')).toBe(token);
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('stores the login JWT in localStorage when remember-session is checked', () => {
    const token = createJwt();
    authService.login('person@example.com', 'password123', true).subscribe();
    httpTestingController
      .expectOne(`${API_URL}/auth/login`)
      .flush({ accessToken: token });

    expect(localStorage.getItem('habitmaker.authToken')).toBe(token);
    expect(sessionStorage.getItem('habitmaker.authToken')).toBeNull();
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('sends signup data and stores the returned JWT', () => {
    const token = createJwt();
    authService
      .signup('Persona', 'person@example.com', 'password123')
      .subscribe();

    const request = httpTestingController.expectOne(`${API_URL}/auth/signup`);
    expect(request.request.body).toEqual({
      name: 'Persona',
      email: 'person@example.com',
      password: 'password123',
    });
    request.flush({ accessToken: token });

    expect(authService.getAuthToken()).toBe(token);
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('reads the email claim from the stored access token', () => {
    const payload = btoa(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 3600,
        email: 'person@example.com',
      }),
    );
    sessionStorage.setItem(
      'habitmaker.authToken',
      `header.${payload}.signature`,
    );

    expect(authService.getUserEmail()).toBe('person@example.com');
  });

  it('reads the role claim from the stored access token', () => {
    const payload = btoa(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: 'admin',
      }),
    );
    sessionStorage.setItem(
      'habitmaker.authToken',
      `header.${payload}.signature`,
    );

    expect(authService.getUserRole()).toBe('admin');
  });

  it('sends password-recovery requests to the API', () => {
    authService.forgotPassword('person@example.com').subscribe();

    const request = httpTestingController.expectOne(
      `${API_URL}/auth/forgot-password`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'person@example.com' });
    request.flush({
      message: 'If an account exists, instructions will be sent.',
    });
  });

  it('rejects missing, malformed, and expired JWTs', () => {
    expect(authService.isTokenValid(null)).toBe(false);
    expect(authService.isTokenValid('invalid-token')).toBe(false);
    expect(
      authService.isTokenValid(createJwt(Math.floor(Date.now() / 1000) - 1)),
    ).toBe(false);
  });

  it('clears credentials on logout', () => {
    const token = createJwt();
    authService.login('person@example.com', 'password123').subscribe();
    httpTestingController
      .expectOne(`${API_URL}/auth/login`)
      .flush({ accessToken: token });

    authService.logout();

    expect(authService.getAuthToken()).toBeNull();
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('can defer the reactive logout state until navigation completes', () => {
    const token = createJwt();
    authService.login('person@example.com', 'password123').subscribe();
    httpTestingController
      .expectOne(`${API_URL}/auth/login`)
      .flush({ accessToken: token });

    authService.logout({ deferStateUpdate: true });

    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.authenticated()).toBe(true);

    authService.syncAuthenticatedState();
    expect(authService.authenticated()).toBe(false);
  });
});
