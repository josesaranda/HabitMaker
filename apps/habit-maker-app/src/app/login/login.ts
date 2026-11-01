import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  HabitMakerUIButton,
  HabitMakerUICheckbox,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@org/habit-maker-ui';

@Component({
  selector: 'app-login',
  imports: [
    HabitMakerUIButton,
    HabitMakerUICheckbox,
    HabitMakerUIInput,
    HabitMakerUILink,
    RouterLink,
  ],
  templateUrl: './login.html',
})
export class Login {
  protected passwordVisible = false;
  protected message = '';

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.message = 'El acceso estará disponible próximamente.';
  }
}
