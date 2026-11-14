import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { authTokenInterceptor } from '../auth/auth-token.interceptor';
import { HabitService } from './habit.service';

const API_URL = environment.API_URL || '/api';

describe('HabitService', () => {
  let service: HabitService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
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

    service.createHabit('  Leer 10 minutos  ', '📚').subscribe((habit) => {
      responseName = habit.name;
    });
    expect(createEventEmitted).toBe(false);

    const request = httpTestingController.expectOne(`${API_URL}/habits`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Leer 10 minutos',
      emoji: '📚',
    });
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush({
      id: 'habit-1',
      name: 'Leer 10 minutos',
      emoji: '📚',
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

  it('loads one habit by id with the saved access token', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');
    let receivedName = '';

    service.getHabit('habit-1').subscribe((habit) => {
      receivedName = habit.name;
    });

    const request = httpTestingController.expectOne(
      `${API_URL}/habits/habit-1`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush({
      id: 'habit-1',
      name: 'Leer 10 minutos',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    });

    expect(receivedName).toBe('Leer 10 minutos');
  });

  it('checks whether the habit is complete today using the local date', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');
    let completed = false;

    service.getTodayCompletion('habit-1').subscribe((status) => {
      completed = status.completed;
    });

    const request = httpTestingController.expectOne(
      (candidate) =>
        candidate.url === `${API_URL}/habits/habit-1/completions/today`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('date')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush({ date: '2026-11-01', completed: true, completedAt: null });

    expect(completed).toBe(true);
  });

  it('requests completion statuses for only the selected dates', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');
    const selectedDates = ['2026-10-30', '2026-10-31', '2026-11-01'];
    let receivedDates: string[] = [];

    service
      .getCompletionsForDates('habit-1', selectedDates)
      .subscribe((statuses) => {
        receivedDates = statuses.map(({ date }) => date);
      });

    const request = httpTestingController.expectOne(
      (candidate) =>
        candidate.url === `${API_URL}/habits/habit-1/completions` &&
        candidate.params.has('dates'),
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('dates')).toBe(selectedDates.join(','));
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush(
      selectedDates.map((date, index) => ({
        date,
        completed: index === 1,
        completedAt: null,
      })),
    );

    expect(receivedDates).toEqual(selectedDates);
  });

  it('sets completion for a specific date', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');
    let completed = true;

    service
      .setCompletion('habit-1', '2026-10-30', false)
      .subscribe((status) => {
        completed = status.completed;
      });

    const request = httpTestingController.expectOne(
      `${API_URL}/habits/habit-1/completions/2026-10-30`,
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ completed: false });
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush({ date: '2026-10-30', completed: false, completedAt: null });

    expect(completed).toBe(false);
  });

  it('renames a habit with its encoded id and the saved access token', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');
    let receivedName = '';

    service
      .updateHabit('habit/1', '  Leer 10 minutos  ', '📚')
      .subscribe((habit) => {
      receivedName = habit.name;
      });

    const request = httpTestingController.expectOne(
      `${API_URL}/habits/habit%2F1`,
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      name: 'Leer 10 minutos',
      emoji: '📚',
    });
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush({
      id: 'habit/1',
      name: 'Leer 10 minutos',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-02T00:00:00.000Z',
    });

    expect(receivedName).toBe('Leer 10 minutos');
  });

  it('loads and updates authenticated per-habit reminder preferences', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');
    let loadedTime: string | null = null;
    service.getReminder('habit-1').subscribe((reminder) => {
      loadedTime = reminder.time;
    });
    const getRequest = httpTestingController.expectOne(
      `${API_URL}/habits/habit-1/reminder`,
    );
    expect(getRequest.request.method).toBe('GET');
    expect(getRequest.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    getRequest.flush({
      enabled: true,
      time: '08:30',
      timeZone: 'Europe/Madrid',
    });
    expect(loadedTime).toBe('08:30');

    let saved = false;
    service
      .saveReminder('habit-1', {
        enabled: true,
        time: '09:00',
        timeZone: 'Europe/Madrid',
      })
      .subscribe(() => (saved = true));
    const putRequest = httpTestingController.expectOne(
      `${API_URL}/habits/habit-1/reminder`,
    );
    expect(putRequest.request.method).toBe('PUT');
    expect(putRequest.request.body).toEqual({
      enabled: true,
      time: '09:00',
      timeZone: 'Europe/Madrid',
    });
    putRequest.flush({
      enabled: true,
      time: '09:00',
      timeZone: 'Europe/Madrid',
    });
    expect(saved).toBe(true);
  });

  it('stores push subscriptions using the authenticated request', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');
    const subscription = {
      endpoint: 'https://push.example.com/subscription/1',
      keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
    } as PushSubscriptionJSON;
    let saved = false;

    service
      .savePushSubscription(subscription, 'es')
      .subscribe(() => (saved = true));

    const request = httpTestingController.expectOne(
      `${API_URL}/push/subscriptions`,
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ ...subscription, language: 'es' });
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush(null);
    expect(saved).toBe(true);
  });

  it('deletes a habit by its encoded id with the saved access token', () => {
    sessionStorage.setItem('habitmaker.authToken', 'access-token');
    let completed = false;

    service.deleteHabit('habit/1').subscribe(() => {
      completed = true;
    });

    const request = httpTestingController.expectOne(
      `${API_URL}/habits/habit%2F1`,
    );
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer access-token',
    );
    request.flush(null);

    expect(completed).toBe(true);
  });

  it('does not send a request when no access token is available', () => {
    let hasError = false;
    service
      .createHabit('Leer', '✨')
      .subscribe({ error: () => (hasError = true) });

    expect(hasError).toBe(true);
    httpTestingController.expectNone(`${API_URL}/habits`);
  });
});
