import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminService } from '../admin/admin.service';
import { AuthService } from '../auth/auth.service';
import { Settings } from './settings';

describe('Settings', () => {
  it('shows the user settings with the signed-in email in a readonly input', async () => {
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
  });

  it('shows administration settings and the user list only for admins', async () => {
    const getUsers = vi.fn(() =>
      of([
        { id: 'admin-1', email: 'admin@example.com', role: 'admin' as const },
        { id: 'user-1', email: 'persona@example.com', role: 'user' as const },
      ]),
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
  });
});
