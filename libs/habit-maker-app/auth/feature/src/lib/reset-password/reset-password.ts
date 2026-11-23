import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  HabitMakerUIButton,
  HabitMakerUIFormField,
  HabitMakerUIFormFieldError,
  HabitMakerUIFormFieldHint,
  HabitMakerUIFormFieldLabel,
  HabitMakerUIIcon,
  HabitMakerUIInput,
  HabitMakerUILink,
  HabitMakerUIText,
} from '@habit-maker/habit-maker-ui';
import { startWith } from 'rxjs';
import { AuthStory } from '../auth-story/auth-story';
import { AuthService } from '@habit-maker/auth-data-access';
import { TitleService } from '@habit-maker/shared-data-access';

const matchingPasswordsValidator: ValidatorFn = (
  control,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password',
  imports: [
    HabitMakerUIText,
    AuthStory,
    HabitMakerUIButton,
    HabitMakerUIIcon,
    HabitMakerUIInput,
    HabitMakerUIFormField,
    HabitMakerUIFormFieldError,
    HabitMakerUIFormFieldHint,
    HabitMakerUIFormFieldLabel,
    HabitMakerUILink,
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly titleService = inject(TitleService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly token = signal(
    this.route.snapshot.queryParamMap.get('token') ?? '',
  );
  protected readonly hasToken = computed(() => this.token().length > 0);
  protected readonly form = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
    },
    { validators: matchingPasswordsValidator },
  );
  protected readonly passwordTouched = signal(false);
  protected readonly confirmPasswordTouched = signal(false);
  protected readonly submitted = signal(false);
  private readonly formStatus = toSignal(
    this.form.statusChanges.pipe(startWith(this.form.status)),
    { initialValue: this.form.status },
  );
  private readonly passwordValue = toSignal(
    this.form.controls.password.valueChanges.pipe(
      startWith(this.form.controls.password.value),
    ),
    { initialValue: this.form.controls.password.value },
  );
  private readonly confirmPasswordValue = toSignal(
    this.form.controls.confirmPassword.valueChanges.pipe(
      startWith(this.form.controls.confirmPassword.value),
    ),
    { initialValue: this.form.controls.confirmPassword.value },
  );
  protected readonly passwordError = computed(() => {
    this.formStatus();
    const value = this.passwordValue();
    const shouldValidate =
      this.submitted() || this.passwordTouched() || value.length > 0;
    if (!shouldValidate) return null;
    const errors = this.form.controls.password.errors;
    if (errors?.['required']) return 'resetPassword.passwordRequired';
    if (errors?.['minlength']) return 'resetPassword.passwordInvalid';
    return null;
  });
  protected readonly confirmPasswordError = computed(() => {
    this.formStatus();
    this.passwordValue();
    const confirmPassword = this.confirmPasswordValue();
    const shouldValidate =
      this.submitted() ||
      this.confirmPasswordTouched() ||
      confirmPassword.length > 0;
    if (!shouldValidate) return null;
    const errors = this.form.controls.confirmPassword.errors;
    if (errors?.['required']) return 'resetPassword.confirmPasswordRequired';
    if (errors?.['minlength']) return 'resetPassword.passwordInvalid';
    if (this.form.hasError('passwordMismatch')) {
      return 'resetPassword.passwordMismatch';
    }
    return null;
  });
  protected readonly submitting = signal(false);
  protected readonly passwordUpdated = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly currentYear = signal(new Date().getFullYear());

  constructor() {
    this.titleService.setTitle('pageTitles.resetPassword');
  }

  protected onPasswordBlur(): void {
    this.passwordTouched.set(true);
  }

  protected onConfirmPasswordBlur(): void {
    this.confirmPasswordTouched.set(true);
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.errorMessage.set('');

    if (this.form.invalid) return;

    const { password } = this.form.getRawValue();
    this.submitting.set(true);
    this.authService.resetPassword(this.token(), password).subscribe({
      next: () => {
        this.submitting.set(false);
        this.passwordUpdated.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(
          error.status === 400
            ? 'resetPassword.invalidLink'
            : 'resetPassword.error',
        );
      },
    });
  }
}
