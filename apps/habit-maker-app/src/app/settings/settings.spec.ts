import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminService } from '../admin/admin.service';
import { AuthService } from '../auth/auth.service';
import { AppVersionService } from './app-version.service';
import { Settings } from './settings';

describe('Settings', () => {
  it('shows the user settings with the signed-in email in a readonly input', async () => {
    const getCurrentVersion = vi.fn(() => of({ version: '1.2.3' }));
    const checkForUpdates = vi.fn(() =>
      of({
        currentVersion: '1.2.3',
        latestVersion: '1.2.3',
        updateAvailable: false,
        releaseUrl:
          'https://github.com/josesaranda/HabitMaker/releases/tag/v1.2.3',
        publishedAt: '2026-10-01T12:00:00Z',
      }),
    );
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getUserEmail: () => 'persona@example.com',
            getUserRole: () => 'user',
          },
        },
        {
          provide: AdminService,
          useValue: { getUsers: vi.fn(() => of([])) },
        },
        {
          provide: AppVersionService,
          useValue: {
            getCurrentVersion,
            checkForUpdates,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const email = compiled.querySelector<HTMLInputElement>('#user-email');

    expect(compiled.querySelector('h1')?.textContent).toContain('Ajustes');
    expect(compiled.querySelector('h2')?.textContent).toContain(
      'Ajustes de usuario',
    );
    expect(email?.value).toBe('persona@example.com');
    expect(email?.readOnly).toBe(true);
    expect(compiled.querySelector('#admin-settings-title')).toBeNull();
    expect(compiled.querySelector('#app-settings-title')).toBeNull();
    expect(compiled.textContent).not.toContain('Versión actual');
    expect(getCurrentVersion).not.toHaveBeenCalled();
    expect(checkForUpdates).not.toHaveBeenCalled();
  });

  it('shows administration settings and the user list only for admins', async () => {
    const getUsers = vi.fn(() =>
      of([
        { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const },
        { id: 'user-1', email: 'persona@example.com', role: 'user' as const },
      ]),
    );
    const checkForUpdates = vi.fn(() =>
      of({
        currentVersion: '1.2.3',
        latestVersion: '1.3.0',
        updateAvailable: true,
        releaseUrl:
          'https://github.com/josesaranda/HabitMaker/releases/tag/v1.3.0',
        publishedAt: '2026-10-02T12:00:00Z',
      }),
    );
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getUserEmail: () => 'admin@example.com',
            getUserRole: () => 'admin',
          },
        },
        { provide: AdminService, useValue: { getUsers } },
        {
          provide: AppVersionService,
          useValue: {
            getCurrentVersion: vi.fn(() => of({ version: '1.2.3' })),
            checkForUpdates,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(getUsers).toHaveBeenCalledOnce();
    expect(
      compiled.querySelector('#admin-settings-title')?.textContent,
    ).toContain('Ajustes de administración');
    expect(compiled.querySelector('#admin-users-title')?.textContent).toContain(
      'Usuarios de la aplicación',
    );
    expect(compiled.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(compiled.textContent).toContain('Administrador');
    expect(compiled.textContent).toContain('Usuario');
    expect(
      compiled.querySelector('#app-settings-title')?.textContent,
    ).toContain('Versión de la aplicación');
    expect(compiled.textContent).toContain('1.2.3');
    expect(checkForUpdates).toHaveBeenCalledOnce();
    expect(compiled.textContent).toContain(
      'Hay una nueva versión disponible: 1.3.0.',
    );
    expect(
      compiled.querySelector<HTMLAnchorElement>(
        'a[href="https://github.com/josesaranda/HabitMaker/releases/tag/v1.3.0"]',
      )?.textContent,
    ).toContain('Ver versión 1.3.0');
  });
});
