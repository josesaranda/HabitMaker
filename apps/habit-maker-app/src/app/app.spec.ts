import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { provideTranslocoTesting } from '../../test-support/transloco-testing';
import { App } from './app';
import { appRoutes } from './app.routes';
import { AuthService } from '@habit-maker/auth-data-access';
import { HabitService } from '@habit-maker/habits-data-access';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideTranslocoTesting(),
        provideHttpClient(),
        provideRouter(appRoutes),
        {
          provide: HabitService,
          useValue: {
            getHabits: () => of([]),
            getArchivedCount: () => of({ count: 0 }),
            getHabit: (id: string) =>
              of({
                id,
                name: 'Leer 10 minutos',
                createdAt: '2026-11-01T00:00:00.000Z',
                updatedAt: '2026-11-01T00:00:00.000Z',
              }),
            getTodayCompletion: () =>
              of({ date: '2026-11-01', completed: false, completedAt: null }),
            getTodayCompletions: () => of({}),
            getHabitsWithTodayCompletions: () =>
              of({ habits: [], completions: {} }),
            getCompletionsForDates: () => of([]),
            getReminder: () =>
              of({ enabled: false, time: null, timeZone: null }),
            getPushPublicKey: () => of({ publicKey: null }),
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
    expect(
      compiled.querySelector('app-login #login-title')?.textContent,
    ).toContain('Inicia sesión');
    expect(compiled.querySelector('hm-navbar')).toBeNull();
    expect(
      compiled
        .querySelector('.app-content-shell')
        ?.classList.contains('app-content-shell--with-mobile-navbar'),
    ).toBe(false);
  });

  it('navigates to the signup page', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/signup');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('app-signup #signup-title')?.textContent,
    ).toContain('Crea tu cuenta');
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
      fixture.nativeElement.querySelector('hm-header-outlet h1')?.textContent,
    ).toContain('Detalle del hábito');
    expect(
      fixture.nativeElement.querySelector(
        'app-habit-detail app-habit-card hm-card article h2',
      )?.textContent,
    ).toContain('Leer 10 minutos');
  });

  it('opens the Today page with the date in the header', async () => {
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    );
    localStorage.setItem('habitmaker.authToken', `header.${payload}.signature`);
    TestBed.inject(AuthService).syncAuthenticatedState();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/today');
    await fixture.whenStable();
    fixture.detectChanges();

    const expectedDate = new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('app-today')).not.toBeNull();
    expect(
      compiled.querySelector('hm-header-outlet h1#today-title')?.textContent,
    ).toContain(`Hoy ${expectedDate}`);
    expect(
      compiled.querySelector('a.app-navbar__link[href="/today"]')?.textContent,
    ).toContain('Hoy');
    expect(
      compiled.querySelector(
        'hm-header-outlet button[aria-label="Mostrar hábitos archivados"]',
      ),
    ).toBeNull();
    const mobileTodayLink = compiled.querySelector<HTMLAnchorElement>(
      'a.app-navbar__mobile-today',
    );
    expect(mobileTodayLink?.getAttribute('href')).toBe('/today');
    expect(mobileTodayLink?.getAttribute('aria-label')).toBe('Hoy');
    expect(
      mobileTodayLink?.querySelector('hm-icon')?.getAttribute('name'),
    ).toBe('calendar');
    expect(mobileTodayLink?.textContent?.trim()).toBe(
      String(new Date().getDate()),
    );
  });

  it('shows the archived option on the Today page when archived habits exist', async () => {
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    );
    localStorage.setItem('habitmaker.authToken', `header.${payload}.signature`);

    const activeHabit = {
      id: 'habit-1',
      name: 'Leer 10 minutos',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    };
    const archivedHabit = {
      id: 'habit-2',
      name: 'Caminar',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
      archivedAt: '2026-11-10T00:00:00.000Z',
    };
    TestBed.overrideProvider(HabitService, {
      useValue: {
        getHabits: ({ includeArchived = false } = {}) =>
          of(includeArchived ? [activeHabit, archivedHabit] : [activeHabit]),
        getArchivedCount: () => of({ count: 1 }),
        getTodayCompletion: () =>
          of({ date: '2026-11-19', completed: false, completedAt: null }),
        getTodayCompletions: () => of({}),
        getHabitsWithTodayCompletions: ({
          includeArchived = false,
        }: { includeArchived?: boolean } = {}) =>
          of({
            habits: includeArchived
              ? [activeHabit, archivedHabit]
              : [activeHabit],
            completions: {},
          }),
        habitCreated$: EMPTY,
      },
    });
    TestBed.inject(AuthService).syncAuthenticatedState();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/today');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const archivedToggle = compiled.querySelector<HTMLButtonElement>(
      'hm-header-outlet button[aria-label="Mostrar hábitos archivados"]',
    );

    expect(archivedToggle).not.toBeNull();
    expect(compiled.textContent).not.toContain('Caminar');

    archivedToggle?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      compiled.querySelector('#today-archived-title')?.textContent,
    ).toContain('Hábitos archivados');
    expect(compiled.textContent).toContain('Caminar');
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
      fixture.nativeElement.querySelector('app-home #home-title')?.textContent,
    ).toContain('¡Bienvenido a casa!');
    expect(
      fixture.nativeElement.querySelector('[data-testid="home-add-habit"]')
        ?.textContent,
    ).toContain('Añade tu primer hábito');
    expect(
      fixture.nativeElement.querySelector('hm-navbar hm-brand'),
    ).not.toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled
        .querySelector('.app-content-shell')
        ?.classList.contains('app-content-shell--with-mobile-navbar'),
    ).toBe(true);
    expect(
      compiled.querySelector('hm-header-outlet h1#habits-title')?.textContent,
    ).toContain('Tus hábitos');
    const addHabitButton = compiled.querySelector<HTMLButtonElement>(
      'hm-header-outlet button[hmButtonIcon]',
    );
    expect(compiled.querySelector('app-home hm-header h1')).toBeNull();
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
    expect(logoutButton?.getAttribute('size')).toBe('normal');

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
      fixture.nativeElement.querySelector('app-home #home-title')?.textContent,
    ).toContain('¡Bienvenido a casa!');

    await router.navigateByUrl('/settings');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('hm-header-outlet h1')?.textContent,
    ).toContain('Ajustes');
    expect(
      fixture.nativeElement.querySelector('app-home hm-header h1'),
    ).toBeNull();

    expect(
      fixture.nativeElement.querySelector('hm-navbar hm-brand'),
    ).not.toBeNull();
  });
});
