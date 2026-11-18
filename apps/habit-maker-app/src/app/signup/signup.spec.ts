import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslocoTesting } from '../../../test-support/transloco-testing';
import { Signup } from './signup';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTranslocoTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders the signup fields with shared UI components', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    const name = compiled.querySelector('input.hm-input[name="name"]');
    const email = compiled.querySelector('input#email');
    const password = compiled.querySelector('input#password');

    expect(compiled.querySelector('#signup-title')?.textContent).toContain(
      'Crea tu cuenta',
    );
    expect(name).not.toBeNull();
    expect(email).not.toBeNull();
    expect(password).not.toBeNull();
    expect(compiled.querySelector('button[hmButton="primary"]')).not.toBeNull();
  });

  it('shows required errors and blocks an invalid submission', () => {
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(
      new SubmitEvent('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    const name: HTMLInputElement = fixture.nativeElement.querySelector('#name');
    const email: HTMLInputElement =
      fixture.nativeElement.querySelector('#email');
    const password: HTMLInputElement =
      fixture.nativeElement.querySelector('#password');
    const terms: HTMLInputElement =
      fixture.nativeElement.querySelector('[name="terms"]');

    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(password.getAttribute('aria-invalid')).toBe('true');
    expect(terms.getAttribute('aria-invalid')).toBe('true');
    expect(
      fixture.nativeElement.querySelector('#signup-name-error')?.textContent,
    ).toContain('El nombre es obligatorio');
    expect(
      fixture.nativeElement.querySelector('#signup-terms-error')?.textContent,
    ).toContain('Debes aceptar los términos');
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

  it('shows and clears the password length error', () => {
    const password: HTMLInputElement =
      fixture.nativeElement.querySelector('#password');
    password.value = 'short';
    password.dispatchEvent(new Event('input'));
    password.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const help: HTMLElement = fixture.nativeElement.querySelector(
      '#signup-password-help',
    );
    expect(password.getAttribute('aria-invalid')).toBe('true');
    expect(password.classList).toContain('hm-input--error');
    expect(help.textContent).toContain('al menos 8 caracteres');

    password.value = 'habit123';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(password.getAttribute('aria-invalid')).toBeNull();
    expect(password.classList).not.toContain('hm-input--error');
  });

  it('shows an error for an invalid email and clears it when corrected', () => {
    const email: HTMLInputElement =
      fixture.nativeElement.querySelector('#email');
    email.value = 'not-an-email';
    email.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const help: HTMLElement =
      fixture.nativeElement.querySelector('#signup-email-help');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(email.classList).toContain('hm-input--error');
    expect(help.textContent).toContain('correo electrónico válido');

    email.value = 'persona@example.com';
    email.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(email.getAttribute('aria-invalid')).toBeNull();
    expect(email.classList).not.toContain('hm-input--error');
  });
});
