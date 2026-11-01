import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('stores tokens in sessionStorage when remember-session is unchecked', () => {
    const tokens = authService.login('person@example.com', 'password123');

    expect(tokens).toEqual({
      authToken: 'habitmaker-demo-auth-token',
      refreshToken: 'habitmaker-demo-refresh-token',
    });
    expect(authService.getAuthToken()).toBe(tokens.authToken);
    expect(authService.getRefreshToken()).toBe(tokens.refreshToken);
    expect(localStorage.getItem('habitmaker.authToken')).toBeNull();
    expect(sessionStorage.getItem('habitmaker.authToken')).toBe(tokens.authToken);
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('stores tokens in localStorage when remember-session is checked', () => {
    const tokens = authService.login('person@example.com', 'password123', true);

    expect(localStorage.getItem('habitmaker.authToken')).toBe(tokens.authToken);
    expect(sessionStorage.getItem('habitmaker.authToken')).toBeNull();
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('simulates signup and refresh with fixed tokens', () => {
    const signupTokens = authService.signup(
      'Persona',
      'person@example.com',
      'password123',
    );
    const refreshedTokens = authService.refreshToken(signupTokens.refreshToken);

    expect(refreshedTokens).toEqual(signupTokens);
    expect(localStorage.getItem('habitmaker.authToken')).toBeNull();
    expect(sessionStorage.getItem('habitmaker.authToken')).toBe(signupTokens.authToken);
    expect(authService.refreshToken('invalid-refresh-token')).toBeNull();
  });

  it('rejects unknown tokens and clears credentials on logout', () => {
    localStorage.setItem('habitmaker.authToken', 'invalid-token');

    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.isTokenValid('invalid-token')).toBe(false);

    authService.login('person@example.com', 'password123');
    authService.logout();

    expect(authService.getAuthToken()).toBeNull();
    expect(authService.getRefreshToken()).toBeNull();
    expect(authService.isAuthenticated()).toBe(false);
  });
});
