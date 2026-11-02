import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslocoTesting } from '../../../test-support/transloco-testing';
import { environment } from '../../environments/environment';
import { RecoverPassword } from './recover-password';

const API_URL = environment.API_URL || '/api';

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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecoverPassword);
    httpTestingController = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => httpTestingController.verify());

  it('renders the email form and a link back to login', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h2')?.textContent).toContain(
      'Recupera tu contraseña',
    );
    expect(
      compiled.querySelector('input[hmInput][type="email"]'),
    ).not.toBeNull();
    expect(compiled.querySelector('a[routerLink="/login"]')).not.toBeNull();
    expect(compiled.querySelector('button[hmButton="primary"]')).not.toBeNull();
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
    expect(compiled.querySelector('h2')?.textContent).toContain(
      'Solicitud recibida',
    );
    expect(compiled.querySelector('[role="status"]')?.textContent).toContain(
      'persona@example.com',
    );
    expect(compiled.querySelector('form')).toBeNull();
  });
});
