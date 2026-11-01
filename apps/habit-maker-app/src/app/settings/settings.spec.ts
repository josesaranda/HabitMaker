import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { Settings } from './settings';

describe('Settings', () => {
  it('shows the user settings with the signed-in email in a readonly input', async () => {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        {
          provide: AuthService,
          useValue: { getUserEmail: () => 'persona@example.com' },
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
  });
});
