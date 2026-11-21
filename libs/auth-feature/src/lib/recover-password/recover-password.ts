import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  HabitMakerUIButton,
  HabitMakerUIFormField,
  HabitMakerUIFormFieldError,
  HabitMakerUIFormFieldLabel,
  HabitMakerUIIcon,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@habit-maker/habit-maker-ui';
import { startWith } from 'rxjs';
import { AuthStory } from '../auth-story/auth-story';
import { AuthService } from '@habit-maker/auth-data-access';
import { BrowserService } from '@habit-maker/shared-data-access';

@Component({
  selector: 'app-recover-password',
  imports: [
    AuthStory,
    HabitMakerUIButton,
    HabitMakerUIIcon,
    HabitMakerUIInput,
    HabitMakerUIFormField,
    HabitMakerUIFormFieldError,
    HabitMakerUIFormFieldLabel,
    HabitMakerUILink,
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './recover-password.html',
})
export class RecoverPassword {
  private readonly browserService = inject(BrowserService);
  private readonly authService = inject(AuthService);
  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  protected readonly requestSent = signal(false);
  protected readonly submitting = signal(false);
  protected readonly email = signal('');
  protected readonly errorMessage = signal('');
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly emailTouched = signal(false);
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

  constructor() {
    this.browserService.setTitle('pageTitles.recover');
  }

  protected readonly emailError = computed(() => {
    this.formStatus();
    const value = this.emailValue();
    const shouldValidate =
      this.submitted() || this.emailTouched() || value.length > 0;
    if (!shouldValidate) return null;
    const errors = this.form.controls.email.errors;
    if (errors?.['required']) return 'recover.emailRequired';
    if (errors?.['email']) return 'recover.emailInvalid';
    return null;
  });

  protected onEmailBlur(): void {
    this.emailTouched.set(true);
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.errorMessage.set('');

    if (this.form.invalid) return;

    const { email } = this.form.getRawValue();
    this.submitting.set(true);
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.submitting.set(false);
        this.email.set(email);
        this.requestSent.set(true);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('recover.error');
      },
    });
  }
}
