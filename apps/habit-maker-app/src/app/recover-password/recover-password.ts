import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  selector: 'app-recover-password',
  imports: [
    AuthStory,
    HabitMakerUIButton,
    HabitMakerUIIcon,
    HabitMakerUIInput,
    HabitMakerUILink,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css',
})
export class RecoverPassword {
  private readonly browserService = inject(BrowserService);
  private readonly authService = inject(AuthService);
  protected readonly requestSent = signal(false);
  protected readonly submitting = signal(false);
  protected readonly email = signal('');
  protected readonly errorMessage = signal('');

  constructor() {
    this.browserService.setTitle('pageTitles.recover');
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const email = String(formData.get('email') ?? '');
    this.errorMessage.set('');
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
