import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslocoTesting } from '@habit-maker/test-support';
import { API_BASE_URL } from '@habit-maker/shared-config';
import { RecoverPassword } from './recover-password';

const API_URL = '/api';

describe('RecoverPassword', () => {
  let fixture: ComponentFixture<RecoverPassword>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoverPassword],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslocoTesting(),
        { provide: API_BASE_URL, useValue: API_URL },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecoverPassword);
    httpTestingController = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpTestingController.verify());

  it('renders the email form and a link back to login', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('#recover-title')?.textContent).toContain(
      'Recupera tu contraseña',
    );
    expect(
      compiled.querySelector('input.hm-input[type="email"]'),
    ).not.toBeNull();
    expect(compiled.querySelector('a[routerLink="/login"]')).not.toBeNull();
    expect(compiled.querySelector('button[hmButton="primary"]')).not.toBeNull();
  });

  it('shows a required email error and does not submit an empty value', () => {
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(
      new SubmitEvent('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    const email: HTMLInputElement =
      fixture.nativeElement.querySelector('#email');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(
      fixture.nativeElement.querySelector('#recover-email-error')?.textContent,
    ).toContain('El correo electrónico es obligatorio');
    httpTestingController.expectNone(`${API_URL}/auth/forgot-password`);
  });

  it('rejects an email with an invalid format', () => {
    const email: HTMLInputElement =
      fixture.nativeElement.querySelector('#email');
    email.value = 'not-an-email';
    email.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(
      fixture.nativeElement.querySelector('#recover-email-error')?.textContent,
    ).toContain('Introduce un correo electrónico válido');
    httpTestingController.expectNone(`${API_URL}/auth/forgot-password`);
  });

  it('shows a generic confirmation after submitting an email', () => {
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    const email: HTMLInputElement =
      fixture.nativeElement.querySelector('#email');
    email.value = 'persona@example.com';
    email.dispatchEvent(new Event('input'));

    form.dispatchEvent(
      new SubmitEvent('submit', { bubbles: true, cancelable: true }),
    );
    httpTestingController
      .expectOne(`${API_URL}/auth/forgot-password`)
      .flush({ message: 'If an account exists, instructions will be sent.' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#recover-title')?.textContent).toContain(
      'Solicitud recibida',
    );
    expect(compiled.querySelector('[role="status"]')?.textContent).toContain(
      'persona@example.com',
    );
    expect(compiled.querySelector('form')).toBeNull();
  });
});
