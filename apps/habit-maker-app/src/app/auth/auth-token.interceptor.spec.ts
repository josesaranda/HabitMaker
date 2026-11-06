import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { authTokenInterceptor } from './auth-token.interceptor';

const API_URL = environment.API_URL || '/api';

describe('authTokenInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('adds the stored bearer token to API requests', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');

    http.get(`${API_URL}/habits`).subscribe();

    const request = httpTestingController.expectOne(`${API_URL}/habits`);
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush([]);
  });

  it('does not attach the token to public authentication endpoints', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');

    http.post(`${API_URL}/auth/forgot-password`, {}).subscribe();

    const request = httpTestingController.expectOne(
      `${API_URL}/auth/forgot-password`,
    );
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ message: 'OK' });

    http.post(`${API_URL}/auth/reset-password`, {}).subscribe();

    const resetRequest = httpTestingController.expectOne(
      `${API_URL}/auth/reset-password`,
    );
    expect(resetRequest.request.headers.has('Authorization')).toBe(false);
    resetRequest.flush({ message: 'OK' });
  });

  it('does not attach the token to requests outside the configured API', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');

    http.get('https://example.com/data').subscribe();

    const request = httpTestingController.expectOne('https://example.com/data');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('clears a revoked session after the API rejects it', () => {
    sessionStorage.setItem('habitmaker.authToken', 'revoked-token');

    http.get(`${API_URL}/habits`).subscribe({ error: () => undefined });

    const request = httpTestingController.expectOne(`${API_URL}/habits`);
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(sessionStorage.getItem('habitmaker.authToken')).toBeNull();
  });
});
