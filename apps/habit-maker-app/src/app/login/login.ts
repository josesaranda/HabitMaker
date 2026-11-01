import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  HabitMakerUIBrand,
  HabitMakerUIButton,
  HabitMakerUICheckbox,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@habit-maker/habit-maker-ui';

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
  protected passwordVisible = signal(false);
  protected message = signal('');

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.message.set('El acceso estará disponible próximamente.');
  }
}
