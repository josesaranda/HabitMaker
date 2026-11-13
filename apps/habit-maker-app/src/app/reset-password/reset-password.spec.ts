import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideTranslocoTesting } from '../../../test-support/transloco-testing';
import { environment } from '../../environments/environment';
import { ResetPassword } from './reset-password';

const API_URL = environment.API_URL || '/api';

describe('ResetPassword', () => {
  let fixture: ComponentFixture<ResetPassword>;
  let httpTestingController: HttpTestingController;

  async function createComponent(token: string | null): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ResetPassword],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslocoTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => token } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    httpTestingController = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  afterEach(() => httpTestingController?.verify());

  it('submits matching passwords and confirms success', async () => {
    await createComponent('one-time-token');
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    const password: HTMLInputElement =
      fixture.nativeElement.querySelector('#password');
    const confirmPassword: HTMLInputElement =
      fixture.nativeElement.querySelector('#confirmPassword');
    password.value = 'new-password';
    confirmPassword.value = 'new-password';
    password.dispatchEvent(new Event('input'));
    confirmPassword.dispatchEvent(new Event('input'));

    expect(
      fixture.nativeElement.querySelector('#password-help')?.textContent,
    ).toContain('Usa al menos 8 caracteres.');
    expect(
      fixture.nativeElement.querySelector('#password-match-error')?.textContent,
    ).toBe('');

    form.dispatchEvent(
      new SubmitEvent('submit', { bubbles: true, cancelable: true }),
    );
    httpTestingController
      .expectOne(`${API_URL}/auth/reset-password`)
      .flush({ message: 'Password updated successfully' });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('#reset-password-title')?.textContent,
    ).toContain('Ya puedes iniciar sesión');
    expect(
      fixture.nativeElement.querySelector('a[routerLink="/login"]'),
    ).not.toBeNull();
  });

  it('does not submit when the passwords differ', async () => {
    await createComponent('one-time-token');
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    (
      fixture.nativeElement.querySelector('#password') as HTMLInputElement
    ).value = 'new-password';
    (
      fixture.nativeElement.querySelector(
        '#confirmPassword',
      ) as HTMLInputElement
    ).value = 'different-password';
    fixture.nativeElement
      .querySelector('#password')
      ?.dispatchEvent(new Event('input'));
    fixture.nativeElement
      .querySelector('#confirmPassword')
      ?.dispatchEvent(new Event('input'));

    form.dispatchEvent(
      new SubmitEvent('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('#password-match-error')?.textContent,
    ).toContain('Las contraseñas no coinciden.');
    httpTestingController.expectNone(`${API_URL}/auth/reset-password`);

    const confirmPassword: HTMLInputElement =
      fixture.nativeElement.querySelector('#confirmPassword');
    confirmPassword.value = 'new-password';
    confirmPassword.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('#password-match-error')?.textContent,
    ).toBe('');
  });

  it('asks the user to request a new link when no token is present', async () => {
    await createComponent(null);

    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('a[routerLink="/forgot-password"]'),
    ).not.toBeNull();
  });
});
