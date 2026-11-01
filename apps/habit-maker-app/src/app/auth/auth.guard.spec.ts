import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
    });
  });

  afterEach(() => localStorage.clear());

  it('redirects to login when there is no valid token', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

    expect(result).toEqual(TestBed.inject(Router).parseUrl('/login'));
  });

  it('allows navigation when an unexpired JWT is stored', () => {
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    );
    localStorage.setItem('habitmaker.authToken', `header.${payload}.signature`);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );

    expect(result).toBe(true);
  });
});
