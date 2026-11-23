import { Component, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { HabitMakerUIHeader } from '@habit-maker/habit-maker-ui';
import { AuthService } from '@habit-maker/auth-data-access';
import { TitleService } from '@habit-maker/shared-data-access';
import { SettingsAdmin } from './settings-admin';
import { SettingsUser } from './settings-user';

@Component({
  imports: [HabitMakerUIHeader, SettingsAdmin, SettingsUser, TranslocoPipe],
  selector: 'app-settings',
  templateUrl: './settings.html',
})
export class Settings {
  private readonly titleService = inject(TitleService);
  private readonly authService = inject(AuthService);
  protected readonly isAdmin = signal(
    this.authService.getUserRole() === 'admin',
  );

  constructor() {
    this.titleService.setTitle('pageTitles.settings');
  }
}
