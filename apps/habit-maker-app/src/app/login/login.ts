import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  HabitMakerUIButton,
  HabitMakerUICheckbox,
  HabitMakerUIIcon,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@habit-maker/habit-maker-ui';
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
    HabitMakerUILink,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './login.html',
})
export class Login {
  private readonly browserService = inject(BrowserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected passwordVisible = signal(false);
  protected message = signal('');
  protected readonly currentYear = signal(new Date().getFullYear());

  constructor() {
    this.browserService.setTitle('pageTitles.login');
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    this.message.set('');
    this.authService
      .login(
        String(formData.get('email') ?? ''),
        String(formData.get('password') ?? ''),
        formData.has('remember'),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl('/home'),
        error: () =>
          this.message.set(
            'login.error',
          ),
      });
  }
}
