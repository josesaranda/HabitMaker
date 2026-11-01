import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  HabitMakerUIButton,
  HabitMakerUICheckbox,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@habit-maker/habit-maker-ui';
import { BrowserService } from '../browser/browser.service';
import { AuthService } from '../auth/auth.service';
import { AuthStory } from '../auth-story/auth-story';

@Component({
  selector: 'app-signup',
  imports: [
    AuthStory,
    HabitMakerUIButton,
    HabitMakerUICheckbox,
    HabitMakerUIInput,
    HabitMakerUILink,
    RouterLink,
  ],
  templateUrl: './signup.html',
})
export class Signup {
  private readonly browserService = inject(BrowserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected passwordVisible = signal(false);
  protected message = signal('');
  protected emailValue = signal('');
  protected emailTouched = signal(false);
  protected emailFormatValid = signal(true);
  protected passwordValue = signal('');
  protected passwordTouched = signal(false);

  constructor() {
    this.browserService.setTitle('Crear cuenta');
  }

  protected emailInvalid = computed(
    () =>
      (this.emailTouched() || this.emailValue().length > 0) &&
      !this.emailFormatValid(),
  );

  protected passwordInvalid = computed(
    () =>
      this.passwordValue().length < 8 &&
      (this.passwordTouched() || this.passwordValue().length > 0),
  );

  protected onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emailValue.set(input.value);
    this.emailFormatValid.set(input.validity.valid);
  }

  protected onEmailBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emailTouched.set(true);
    this.emailFormatValid.set(input.validity.valid);
  }

  protected onPasswordInput(event: Event): void {
    this.passwordValue.set((event.target as HTMLInputElement).value);
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    this.message.set('');
    this.authService
      .signup(
        String(formData.get('name') ?? ''),
        String(formData.get('email') ?? ''),
        String(formData.get('password') ?? ''),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl('/home'),
        error: () =>
          this.message.set(
            'No se pudo crear la cuenta. Revisa tus datos e inténtalo de nuevo.',
          ),
      });
  }
}
