import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { App } from './app';
import { appRoutes } from './app.routes';
import { AuthService } from './auth/auth.service';
import { HabitService } from './habits/habit.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideRouter(appRoutes),
        {
          provide: HabitService,
          useValue: {
            getHabits: () => of([]),
            getHabit: (id: string) =>
              of({
                id,
                name: 'Leer 10 minutos',
                createdAt: '2026-11-01T00:00:00.000Z',
                updatedAt: '2026-11-01T00:00:00.000Z',
              }),
            getTodayCompletion: () =>
              of({ date: '2026-11-01', completed: false, completedAt: null }),
            getCompletionsForDates: () => of([]),
            markCompletedToday: () =>
              of({
                date: '2026-11-01',
                completed: true,
                completedAt: '2026-11-01T12:00:00.000Z',
              }),
            habitCreated$: EMPTY,
            createHabit: (name: string) =>
              of({
                id: 'habit-1',
                name,
                createdAt: '',
                updatedAt: '',
              }),
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders the router outlet and opens the login route by default', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.querySelector('app-login h2')?.textContent).toContain(
      'Inicia sesión',
    );
    expect(compiled.querySelector('hm-navbar')).toBeNull();
  });

  it('navigates to the signup page', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/signup');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-signup h2')?.textContent).toContain(
      'Crea tu cuenta',
    );
  });

  it('opens the detail page for a habit route', async () => {
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    );
    localStorage.setItem('habitmaker.authToken', `header.${payload}.signature`);
    TestBed.inject(AuthService).syncAuthenticatedState();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/habits/habit-1');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('app-habit-detail'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        'app-habit-detail app-habit-card article strong',
      )?.textContent,
    ).toContain('Leer 10 minutos');
  });

  it('redirects authenticated users from login and signup to home', async () => {
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    );
    localStorage.setItem('habitmaker.authToken', `header.${payload}.signature`);
    TestBed.inject(AuthService).syncAuthenticatedState();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/login');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('app-home h1')?.textContent,
    ).toContain('¡Bienvenido a casa!');
    expect(
      fixture.nativeElement.querySelector('app-home button')?.textContent,
    ).toContain('Añade tu primer hábito');
    expect(
      fixture.nativeElement.querySelector('hm-navbar hm-brand'),
    ).not.toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    const addHabitButton = compiled.querySelector<HTMLButtonElement>(
      'button[hmButtonIcon]',
    );
    expect(addHabitButton?.getAttribute('aria-label')).toBe('Añadir hábito');
    const mobileSettingsLink = compiled.querySelector<HTMLAnchorElement>(
      'a.app-navbar__mobile-settings',
    );
    expect(mobileSettingsLink?.getAttribute('href')).toBe('/settings');
    expect(mobileSettingsLink?.getAttribute('aria-label')).toBe('Ajustes');
    expect(
      mobileSettingsLink?.querySelector('hm-icon')?.getAttribute('name'),
    ).toBe('settings');
    const logoutButton = compiled.querySelector<HTMLButtonElement>(
      'button[aria-label="Cerrar sesión"]',
    );
    expect(logoutButton?.getAttribute('hmButtonIcon')).toBe('secondary');
    expect(logoutButton?.getAttribute('size')).toBe('small');

    const dialog =
      compiled.querySelector<HTMLDialogElement>('hm-modal dialog')!;
    Object.defineProperty(dialog, 'showModal', {
      configurable: true,
      value: () => dialog.setAttribute('open', ''),
    });
    addHabitButton?.click();
    fixture.detectChanges();

    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('app-new-habit')).not.toBeNull();

    const input = dialog.querySelector<HTMLInputElement>('#new-habit-name')!;
    input.value = 'Leer 10 minutos';
    input.dispatchEvent(new Event('input'));
    dialog
      .querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(dialog.open).toBe(false);

    await router.navigateByUrl('/signup');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('app-home h1')?.textContent,
    ).toContain('¡Bienvenido a casa!');
    expect(
      fixture.nativeElement.querySelector('hm-navbar hm-brand'),
    ).not.toBeNull();
  });
});
