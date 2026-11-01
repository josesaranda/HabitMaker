import { Component, inject, signal } from '@angular/core';
import { HabitMakerUIInput } from '@habit-maker/habit-maker-ui';
import { BrowserService } from '../browser/browser.service';
import { AuthService } from '../auth/auth.service';

@Component({
  imports: [HabitMakerUIInput],
  selector: 'app-settings',
  templateUrl: './settings.html',
})
export class Settings {
  private readonly browserService = inject(BrowserService);
  private readonly authService = inject(AuthService);
  protected readonly email = signal(this.authService.getUserEmail());

  constructor() {
    this.browserService.setTitle('Ajustes');
  }
}
