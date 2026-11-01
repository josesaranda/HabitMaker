import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  HabitMakerUIBrand,
  HabitMakerUIButton,
  HabitMakerUICheckbox,
  HabitMakerUIInput,
  HabitMakerUILink,
} from '@habit-maker/habit-maker-ui';

@Component({
  selector: 'app-signup',
  imports: [
    HabitMakerUIBrand,
    HabitMakerUIButton,
    HabitMakerUICheckbox,
    HabitMakerUIInput,
    HabitMakerUILink,
    RouterLink,
  ],
  templateUrl: './signup.html',
})
export class Signup {
  protected passwordVisible = false;
  protected message = '';
  protected emailValue = '';
  protected emailTouched = false;
  protected emailFormatValid = true;
  protected passwordValue = '';
  protected passwordTouched = false;

  protected get emailInvalid(): boolean {
    return (
      (this.emailTouched || this.emailValue.length > 0) &&
      !this.emailFormatValid
    );
  }

  protected get passwordInvalid(): boolean {
    return (
      this.passwordValue.length < 8 &&
      (this.passwordTouched || this.passwordValue.length > 0)
    );
  }

  protected onEmailInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emailValue = input.value;
    this.emailFormatValid = input.validity.valid;
  }

  protected onEmailBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emailTouched = true;
    this.emailFormatValid = input.validity.valid;
  }

  protected onPasswordInput(event: Event): void {
    this.passwordValue = (event.target as HTMLInputElement).value;
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.message = 'La creación de cuenta estará disponible próximamente.';
  }
}
