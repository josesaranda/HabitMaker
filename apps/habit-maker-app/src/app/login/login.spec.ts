import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslocoTesting } from '../../../test-support/transloco-testing';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslocoTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders the login form with shared UI components', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    const email = compiled.querySelector('input.hm-input[type="email"]');
    const password = compiled.querySelector('input.hm-input[type="password"]');
    const passwordLabel = compiled.querySelector(
      'hm-form-field > label[hmLabel][for="password"]',
    );
    const remember = compiled.querySelector<HTMLInputElement>(
      'input[hmCheckbox][name="remember"]',
    );

    expect(compiled.querySelector('#login-title')?.textContent).toContain(
      'Inicia sesión',
    );
    expect(email).not.toBeNull();
    expect(email?.classList).toContain('hm-input');
    expect(password).not.toBeNull();
    expect(passwordLabel?.textContent).toContain('Contraseña');
    expect(remember?.checked).toBe(true);
    expect(compiled.querySelector('button[hmButton="primary"]')).not.toBeNull();
  });

  it('toggles password visibility', () => {
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[hmIconRight]',
    );
    toggle.click();
    fixture.detectChanges();

    const password: HTMLInputElement =
      fixture.nativeElement.querySelector('#password');
    expect(password.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows field errors and does not submit empty credentials', () => {
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(
      new SubmitEvent('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    const email: HTMLInputElement =
      fixture.nativeElement.querySelector('#email');
    const password: HTMLInputElement =
      fixture.nativeElement.querySelector('#password');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(password.getAttribute('aria-invalid')).toBe('true');
    expect(
      fixture.nativeElement.querySelector('#login-email-error')?.textContent,
    ).toContain('El correo electrónico es obligatorio');
    expect(
      fixture.nativeElement.querySelector('#login-password-error')?.textContent,
    ).toContain('La contraseña es obligatoria');
  });

  it('validates email format and password length', () => {
    const email: HTMLInputElement =
      fixture.nativeElement.querySelector('#email');
    const password: HTMLInputElement =
      fixture.nativeElement.querySelector('#password');
    email.value = 'not-an-email';
    password.value = 'short';
    email.dispatchEvent(new Event('input'));
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(password.getAttribute('aria-invalid')).toBe('true');
    expect(
      fixture.nativeElement.querySelector('#login-email-error')?.textContent,
    ).toContain('Introduce un correo electrónico válido');
    expect(
      fixture.nativeElement.querySelector('#login-password-error')?.textContent,
    ).toContain('La contraseña debe tener al menos 8 caracteres');
  });
});
