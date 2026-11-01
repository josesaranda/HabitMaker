import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  HabitMakerUIBrand,
  HabitMakerUIButton,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@habit-maker/habit-maker-ui';

@Component({
  selector: 'app-recover-password',
  imports: [
    HabitMakerUIBrand,
    HabitMakerUIButton,
    HabitMakerUIInput,
    HabitMakerUILink,
    RouterLink,
  ],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css',
})
export class RecoverPassword {
  protected readonly requestSent = signal(false);
  protected readonly email = signal('');

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    this.email.set(String(formData.get('email') ?? ''));
    this.requestSent.set(true);
  }
}
