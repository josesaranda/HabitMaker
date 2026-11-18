import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  HabitMakerUIButton,
  HabitMakerUICheckbox,
  HabitMakerUIFormField,
  HabitMakerUIFormFieldError,
  HabitMakerUIFormFieldIconRight,
  HabitMakerUIFormFieldLabel,
  HabitMakerUIIcon,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@habit-maker/habit-maker-ui';
import { startWith } from 'rxjs';
import { BrowserService } from '../browser/browser.service';
import { AuthService } from '../auth/auth.service';
import { AuthStory } from '../auth-story/auth-story';

@Component({
  selector: 'app-login',
  imports: [
    AuthStory,
    HabitMakerUIButton,
    HabitMakerUICheckbox,
    HabitMakerUIIcon,
    HabitMakerUIInput,
    HabitMakerUIFormField,
    HabitMakerUIFormFieldError,
    HabitMakerUIFormFieldIconRight,
    HabitMakerUIFormFieldLabel,
    HabitMakerUILink,
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './login.html',
})
export class Login {
  private readonly browserService = inject(BrowserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    remember: new FormControl(true, { nonNullable: true }),
  });
  protected passwordVisible = signal(false);
  protected message = signal('');
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly emailTouched = signal(false);
  protected readonly passwordTouched = signal(false);
  protected readonly submitted = signal(false);
  private readonly formStatus = toSignal(
    this.form.statusChanges.pipe(startWith(this.form.status)),
    { initialValue: this.form.status },
  );
  private readonly emailValue = toSignal(
    this.form.controls.email.valueChanges.pipe(
      startWith(this.form.controls.email.value),
    ),
    { initialValue: this.form.controls.email.value },
  );
  private readonly passwordValue = toSignal(
    this.form.controls.password.valueChanges.pipe(
      startWith(this.form.controls.password.value),
    ),
    { initialValue: this.form.controls.password.value },
  );

  constructor() {
    this.browserService.setTitle('pageTitles.login');
  }

  protected readonly emailError = computed(() => {
    this.formStatus();
    const value = this.emailValue();
    const shouldValidate =
      this.submitted() || this.emailTouched() || value.length > 0;
    if (!shouldValidate) return null;
    const errors = this.form.controls.email.errors;
    if (errors?.['required']) return 'login.emailRequired';
    if (errors?.['email']) return 'login.emailInvalid';
    return null;
  });

  protected readonly passwordError = computed(() => {
    this.formStatus();
    const value = this.passwordValue();
    const shouldValidate =
      this.submitted() || this.passwordTouched() || value.length > 0;
    if (!shouldValidate) return null;
    const errors = this.form.controls.password.errors;
    if (errors?.['required']) return 'login.passwordRequired';
    if (errors?.['minlength']) return 'login.passwordInvalid';
    return null;
  });

  protected onEmailBlur(): void {
    this.emailTouched.set(true);
  }

  protected onPasswordBlur(): void {
    this.passwordTouched.set(true);
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.message.set('');

    if (this.form.invalid) return;

    const { email, password, remember } = this.form.getRawValue();
    this.authService.login(email, password, remember).subscribe({
      next: () => void this.router.navigateByUrl('/home'),
      error: () => this.message.set('login.error'),
    });
  }
}
