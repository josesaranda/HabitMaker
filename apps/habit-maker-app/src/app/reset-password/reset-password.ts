import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  HabitMakerUIButton,
  HabitMakerUIIcon,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@habit-maker/habit-maker-ui';
import { AuthStory } from '../auth-story/auth-story';
import { AuthService } from '../auth/auth.service';
import { BrowserService } from '../browser/browser.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    AuthStory,
    HabitMakerUIButton,
    HabitMakerUIIcon,
    HabitMakerUIInput,
    HabitMakerUILink,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly browserService = inject(BrowserService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected readonly token = signal(
    this.route.snapshot.queryParamMap.get('token') ?? '',
  );
  protected readonly hasToken = computed(() => this.token().length > 0);
  protected readonly passwordValue = signal('');
  protected readonly confirmPasswordValue = signal('');
  protected readonly passwordsMismatch = computed(
    () =>
      this.confirmPasswordValue().length > 0 &&
      this.passwordValue() !== this.confirmPasswordValue(),
  );
  protected readonly submitting = signal(false);
  protected readonly passwordUpdated = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly currentYear = signal(new Date().getFullYear());

  constructor() {
    this.browserService.setTitle('pageTitles.resetPassword');
  }

  protected onPasswordInput(event: Event): void {
    this.passwordValue.set((event.target as HTMLInputElement).value);
    this.errorMessage.set('');
  }

  protected onConfirmPasswordInput(event: Event): void {
    this.confirmPasswordValue.set((event.target as HTMLInputElement).value);
    this.errorMessage.set('');
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');
    this.passwordValue.set(password);
    this.confirmPasswordValue.set(confirmPassword);
    this.errorMessage.set('');

    if (password !== confirmPassword) {
      this.errorMessage.set('resetPassword.passwordMismatch');
      return;
    }

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
