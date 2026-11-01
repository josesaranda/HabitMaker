import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('returns and stores fixed tokens when logging in', () => {
    const tokens = authService.login('person@example.com', 'password123');

    expect(tokens).toEqual({
      authToken: 'habitmaker-demo-auth-token',
      refreshToken: 'habitmaker-demo-refresh-token',
    });
    expect(authService.getAuthToken()).toBe(tokens.authToken);
    expect(authService.getRefreshToken()).toBe(tokens.refreshToken);
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
