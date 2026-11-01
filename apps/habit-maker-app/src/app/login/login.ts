import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  HabitMakerUIBrand,
  HabitMakerUIButton,
  HabitMakerUICheckbox,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@habit-maker/habit-maker-ui';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    HabitMakerUIBrand,
    HabitMakerUIButton,
    HabitMakerUICheckbox,
    HabitMakerUIInput,
    HabitMakerUILink,
    RouterLink,
  ],
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected passwordVisible = signal(false);
  protected message = signal('');

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    this.authService.login(
      String(formData.get('email') ?? ''),
      String(formData.get('password') ?? ''),
      formData.has('remember'),
    );
    void this.router.navigateByUrl('/home');
  }
}
