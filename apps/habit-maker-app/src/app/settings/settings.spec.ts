import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { of } from 'rxjs';
import { provideTranslocoTesting } from '../../../test-support/transloco-testing';
import { AdminService } from '../admin/admin.service';
import { AuthService } from '../auth/auth.service';
import { HabitService } from '../habits/habit.service';
import { AppUpdateService } from '../app-update.service';
import { AppVersionService } from './app-version.service';
import { Settings } from './settings';

describe('Settings', () => {
  beforeEach(() => localStorage.removeItem('habitmaker.language'));

  it('shows the user settings with the signed-in email in a readonly input', async () => {
    const getCurrentVersion = vi.fn(() => of({ version: '1.2.3' }));
    const savePushSubscription = vi.fn(() => of(void 0));
    const getSessions = vi.fn(() =>
      of([
        {
          id: 'current-session',
          deviceName: 'Chrome on macOS',
          createdAt: '2026-10-01T12:00:00.000Z',
          lastUsedAt: '2026-10-02T12:00:00.000Z',
          expiresAt: '2026-11-01T12:00:00.000Z',
          isCurrent: true,
        },
        {
          id: 'other-session',
          deviceName: 'Safari on iOS',
          createdAt: '2026-10-01T12:00:00.000Z',
          lastUsedAt: '2026-10-02T12:00:00.000Z',
          expiresAt: '2026-11-01T12:00:00.000Z',
          isCurrent: false,
        },
      ]),
    );
    const revokeSession = vi.fn(() => of(void 0));
    const revokeOtherSessions = vi.fn(() => of(void 0));
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
    const checkForPwaUpdates = vi.fn().mockResolvedValue('up-to-date');
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        provideTranslocoTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getUserEmail: () => 'persona@example.com',
            getUserRole: () => 'user',
            getSessions,
            revokeSession,
            revokeOtherSessions,
          },
        },
        {
          provide: AdminService,
          useValue: {
            getUsers: vi.fn(() => of([])),
            getEmailConfiguration: vi.fn(),
            getPushConfiguration: vi.fn(),
            sendTestEmail: vi.fn(),
          },
        },
        {
          provide: SwPush,
          useValue: {
            isEnabled: true,
            subscription: of({
              toJSON: () => ({
                endpoint: 'https://push.example.com/device',
                keys: { p256dh: 'p256dh', auth: 'auth' },
              }),
            }),
          },
        },
        {
          provide: HabitService,
          useValue: { savePushSubscription },
        },
        {
          provide: AppVersionService,
          useValue: {
            getCurrentVersion,
            checkForUpdates,
          },
        },
        {
          provide: AppUpdateService,
          useValue: { checkForUpdates: checkForPwaUpdates },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const email = compiled.querySelector<HTMLInputElement>('#user-email');
    const language = compiled.querySelector<HTMLButtonElement>(
      'habit-maker-ui-select .hm-ui-select__trigger',
    );

    expect(compiled.querySelector('habit-maker-ui-header')).not.toBeNull();
    expect(compiled.querySelector('h2')?.textContent).toContain(
      'Ajustes de usuario',
    );
    expect(compiled.querySelector('#pwa-update-title')?.textContent).toContain(
      'Actualización de la aplicación',
    );
    const pwaUpdateButton = compiled.querySelector<HTMLButtonElement>(
      '#check-pwa-update',
    );
    expect(compiled.querySelector('#sessions-title')?.textContent).toContain(
      'Sesiones abiertas',
    );
    expect(getSessions).toHaveBeenCalledOnce();
    expect(compiled.textContent).toContain('Chrome on macOS');
    expect(compiled.textContent).toContain('Safari on iOS');
    expect(compiled.textContent).toContain('Este dispositivo');
    expect(email?.value).toBe('persona@example.com');
    expect(email?.readOnly).toBe(true);
    expect(language?.getAttribute('role')).toBe('combobox');
    expect(language?.textContent).toContain('Español');
    language!.click();
    fixture.detectChanges();
    compiled
      .querySelector<HTMLElement>('habit-maker-ui-option[value="en"]')!
      .click();
    fixture.detectChanges();
    expect(compiled.querySelector('h2')?.textContent).toContain(
      'User settings',
    );
    expect(language?.textContent).toContain('English');
    expect(savePushSubscription).toHaveBeenCalledWith(
      {
        endpoint: 'https://push.example.com/device',
        keys: { p256dh: 'p256dh', auth: 'auth' },
      },
      'en',
    );
    pwaUpdateButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(checkForPwaUpdates).toHaveBeenCalledOnce();
    expect(compiled.textContent).toContain('The app is up to date.');
    expect(compiled.querySelector('#admin-settings-title')).toBeNull();
    expect(compiled.querySelector('#email-settings-title')).toBeNull();
    expect(compiled.querySelector('#admin-push-settings-title')).toBeNull();
    expect(compiled.querySelector('#app-settings-title')).toBeNull();
    expect(compiled.textContent).not.toContain('Versión actual');
    const sessionsSection = compiled
      .querySelector('#sessions-title')
      ?.closest('section');
    const sessionCloseButton =
      sessionsSection?.querySelectorAll<HTMLButtonElement>('li button')[1];
    expect(sessionCloseButton).toBeDefined();
    sessionCloseButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(revokeSession).toHaveBeenCalledWith('other-session');
    sessionsSection
      ?.querySelector<HTMLButtonElement>(':scope > div > button')
      ?.click();
    expect(revokeOtherSessions).toHaveBeenCalledOnce();
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
    const getEmailConfiguration = vi.fn(() =>
      of({
        host: 'smtp.example.com',
        port: 587,
        protocol: 'smtp' as const,
        user: 'mailer@example.com',
        from: 'no-reply@example.com',
        passwordConfigured: true,
        missingVariables: [],
        isConfigured: true,
      }),
    );
    const sendTestEmail = vi.fn(() => of({ success: true }));
    const getPushConfiguration = vi.fn(() =>
      of({
        publicKeyConfigured: true,
        privateKeyConfigured: false,
        subjectConfigured: false,
        isConfigured: false,
      }),
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
        provideTranslocoTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getUserEmail: () => 'admin@example.com',
            getUserRole: () => 'admin',
            getSessions: vi.fn(() => of([])),
          },
        },
        {
          provide: AdminService,
          useValue: {
            getUsers,
            getEmailConfiguration,
            getPushConfiguration,
            sendTestEmail,
          },
        },
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
    expect(getEmailConfiguration).toHaveBeenCalledOnce();
    expect(getPushConfiguration).toHaveBeenCalledOnce();
    expect(
      compiled.querySelector('#admin-settings-title')?.textContent,
    ).toContain('Ajustes de administración');
    expect(compiled.querySelector('#admin-users-title')?.textContent).toContain(
      'Usuarios de la aplicación',
    );
    expect(compiled.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(
      compiled.querySelector('#admin-push-settings-title')?.textContent,
    ).toContain('Configuración de notificaciones');
    expect(compiled.textContent).toContain(
      'Las notificaciones push no están configuradas.',
    );
    expect(
      compiled.querySelector('#admin-push-settings-title')?.parentElement
        ?.textContent,
    ).toContain('VAPID_PUBLIC_KEY');
    expect(
      compiled.querySelector('#admin-push-settings-title')?.parentElement
        ?.textContent,
    ).toContain('VAPID_PRIVATE_KEY');
    expect(compiled.textContent).toContain(
      'No está definida; se usará el valor predeterminado.',
    );
    expect(compiled.textContent).toContain('Administrador');
    expect(compiled.textContent).toContain('Usuario');
    expect(compiled.querySelector<HTMLInputElement>('#smtp-host')?.value).toBe(
      'smtp.example.com',
    );
    expect(
      compiled.querySelector<HTMLInputElement>('#smtp-password')?.value,
    ).toBe('••••••••');
    expect(
      compiled.querySelector('#app-settings-title')?.textContent,
    ).toContain('Versión de la aplicación');
    expect(
      Array.from(
        compiled.querySelectorAll('#admin-users-title, #app-settings-title'),
      ).map((heading) => heading.textContent?.trim()),
    ).toEqual(['Usuarios de la aplicación', 'Versión de la aplicación']);
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

    const testEmail = compiled.querySelector<HTMLInputElement>(
      '#test-email-address',
    )!;
    testEmail.value = 'recipient@example.com';
    testEmail.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      compiled
        .querySelector<HTMLButtonElement>('#test-email-address')
        ?.closest('form')
        ?.querySelector('button')?.disabled,
    ).toBe(false);
    testEmail
      .closest('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(sendTestEmail).toHaveBeenCalledWith('recipient@example.com');
    expect(compiled.textContent).toContain(
      'El correo de prueba se ha enviado correctamente.',
    );
  });
});
