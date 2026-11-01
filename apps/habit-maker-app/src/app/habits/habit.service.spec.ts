import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { HabitService } from './habit.service';

const API_URL = environment.API_URL || '/api';

describe('HabitService', () => {
  let service: HabitService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(HabitService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('sends a trimmed habit name with the saved access token', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');
    let responseName = '';
    let createEventEmitted = false;
    service.habitCreated$.subscribe(() => (createEventEmitted = true));

    service.createHabit('  Leer 10 minutos  ').subscribe((habit) => {
      responseName = habit.name;
    });
    expect(createEventEmitted).toBe(false);

    const request = httpTestingController.expectOne(`${API_URL}/habits`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ name: 'Leer 10 minutos' });
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush({
      id: 'habit-1',
      name: 'Leer 10 minutos',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    });

    expect(responseName).toBe('Leer 10 minutos');
    expect(createEventEmitted).toBe(true);
  });

  it('loads the authenticated user habits', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');
    let receivedNames: string[] = [];

    service.getHabits().subscribe((habits) => {
      receivedNames = habits.map(({ name }) => name);
    });

    const request = httpTestingController.expectOne(`${API_URL}/habits`);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush([
      {
        id: 'habit-1',
        name: 'Leer 10 minutos',
        createdAt: '2026-11-01T00:00:00.000Z',
        updatedAt: '2026-11-01T00:00:00.000Z',
      },
    ]);

    expect(receivedNames).toEqual(['Leer 10 minutos']);
  });

  it('does not send a request when no access token is available', () => {
    let hasError = false;
    service.createHabit('Leer').subscribe({ error: () => (hasError = true) });

    expect(hasError).toBe(true);
    httpTestingController.expectNone(`${API_URL}/habits`);
  });
});
