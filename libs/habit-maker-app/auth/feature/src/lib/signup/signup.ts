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
  HabitMakerUIFormFieldHint,
  HabitMakerUIFormFieldIconRight,
  HabitMakerUIFormFieldLabel,
  HabitMakerUIIcon,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@habit-maker/habit-maker-ui';
import { startWith } from 'rxjs';
import { TitleService, isDesktopApp } from '@habit-maker/shared-data-access';
import { AuthService } from '@habit-maker/auth-data-access';
import { DesktopMenuService } from '@habit-maker/desktop-data-access';
import { AuthStory } from '../auth-story/auth-story';

@Component({
  selector: 'app-signup',
  imports: [
    AuthStory,
    HabitMakerUIButton,
    HabitMakerUICheckbox,
    HabitMakerUIIcon,
    HabitMakerUIInput,
    HabitMakerUIFormField,
    HabitMakerUIFormFieldError,
    HabitMakerUIFormFieldHint,
    HabitMakerUIFormFieldIconRight,
    HabitMakerUIFormFieldLabel,
    HabitMakerUILink,
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './signup.html',
})
export class Signup {
  private readonly titleService = inject(TitleService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly desktopMenuService = inject(DesktopMenuService, {
    optional: true,
  });
  protected readonly isDesktop = signal(isDesktopApp());
  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    terms: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });
  protected passwordVisible = signal(false);
  protected message = signal('');
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly nameTouched = signal(false);
  protected readonly emailTouched = signal(false);
  protected readonly passwordTouched = signal(false);
  protected readonly termsTouched = signal(false);
  protected readonly submitted = signal(false);
  private readonly formStatus = toSignal(
    this.form.statusChanges.pipe(startWith(this.form.status)),
    { initialValue: this.form.status },
  );
  protected readonly nameValue = toSignal(
    this.form.controls.name.valueChanges.pipe(
      startWith(this.form.controls.name.value),
    ),
    { initialValue: this.form.controls.name.value },
  );
  protected readonly emailValue = toSignal(
    this.form.controls.email.valueChanges.pipe(
      startWith(this.form.controls.email.value),
    ),
    { initialValue: this.form.controls.email.value },
  );
  protected readonly passwordValue = toSignal(
    this.form.controls.password.valueChanges.pipe(
      startWith(this.form.controls.password.value),
    ),
    { initialValue: this.form.controls.password.value },
  );
  protected readonly termsValue = toSignal(
    this.form.controls.terms.valueChanges.pipe(
      startWith(this.form.controls.terms.value),
    ),
    { initialValue: this.form.controls.terms.value },
  );

  constructor() {
    this.titleService.setTitle('pageTitles.signup');
  }

  protected readonly nameError = computed(() => {
    this.formStatus();
    this.nameValue();
    if (!(this.submitted() || this.nameTouched())) return null;
    return this.form.controls.name.errors?.['required']
      ? 'signup.nameRequired'
      : null;
  });
  protected readonly emailError = computed(() => {
    this.formStatus();
    const value = this.emailValue();
    const shouldValidate =
      this.submitted() || this.emailTouched() || value.length > 0;
    if (!shouldValidate) return null;
    const errors = this.form.controls.email.errors;
    if (errors?.['required']) return 'signup.emailRequired';
    if (errors?.['email']) return 'signup.emailInvalid';
    return null;
  });
  protected readonly passwordError = computed(() => {
    this.formStatus();
    const value = this.passwordValue();
    const shouldValidate =
      this.submitted() || this.passwordTouched() || value.length > 0;
    if (!shouldValidate) return null;
    const errors = this.form.controls.password.errors;
    if (errors?.['required']) return 'signup.passwordRequired';
    if (errors?.['minlength']) return 'signup.passwordInvalid';
    return null;
  });
  protected readonly termsError = computed(() => {
    this.formStatus();
    this.termsValue();
    return this.submitted() || this.termsTouched()
      ? this.form.controls.terms.errors?.['required']
        ? 'signup.termsRequired'
        : null
      : null;
  });

  protected readonly nameInvalid = computed(() => this.nameError() !== null);
  protected readonly emailInvalid = computed(() => this.emailError() !== null);
  protected readonly passwordInvalid = computed(
    () => this.passwordError() !== null,
  );
  protected readonly termsInvalid = computed(() => this.termsError() !== null);

  protected onNameBlur(): void {
    this.nameTouched.set(true);
  }

  protected onEmailBlur(): void {
    this.emailTouched.set(true);
  }

  protected onPasswordBlur(): void {
    this.passwordTouched.set(true);
  }

  protected onTermsBlur(): void {
    this.termsTouched.set(true);
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.message.set('');

    if (this.form.invalid) return;

    const { name, email, password } = this.form.getRawValue();
    this.authService.signup(name, email, password).subscribe({
      next: () => void this.router.navigateByUrl('/home'),
      error: () => this.message.set('signup.error'),
    });
  }

  protected connectToServer(): void {
    this.desktopMenuService?.connectToServer();
  }
}
