import { Component, inject } from '@angular/core';
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
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
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    this.authService.signup(
      String(formData.get('name') ?? ''),
      String(formData.get('email') ?? ''),
      String(formData.get('password') ?? ''),
    );
    void this.router.navigateByUrl('/home');
  }
}
