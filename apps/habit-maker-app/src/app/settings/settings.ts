import { Component, inject, OnInit, signal } from '@angular/core';
import {
  HabitMakerUIHeader,
  HabitMakerUIInput,
  HabitMakerUIButton,
} from '@habit-maker/habit-maker-ui';
import { finalize } from 'rxjs';
import { AdminService, AdminUser } from '../admin/admin.service';
import { BrowserService } from '../browser/browser.service';
import { AuthService } from '../auth/auth.service';
import { AppVersionService, VersionCheckResult } from './app-version.service';

const RELEASES_URL = 'https://github.com/josesaranda/HabitMaker/releases';

@Component({
  imports: [HabitMakerUIHeader, HabitMakerUIInput, HabitMakerUIButton],
  selector: 'app-settings',
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  private readonly browserService = inject(BrowserService);
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  private readonly appVersionService = inject(AppVersionService);
  protected readonly email = signal(this.authService.getUserEmail());
  protected readonly isAdmin = signal(
    this.authService.getUserRole() === 'admin',
  );
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly isLoadingUsers = signal(false);
  protected readonly usersLoadError = signal('');
  protected readonly appVersion = signal<string | null>(null);
  protected readonly isLoadingAppVersion = signal(true);
  protected readonly appVersionLoadError = signal('');
  protected readonly isCheckingUpdates = signal(false);
  protected readonly updateAvailable = signal<boolean | null>(null);
  protected readonly latestVersion = signal<string | null>(null);
  protected readonly updateCheckError = signal('');
  protected readonly releasesUrl = signal(RELEASES_URL);

  constructor() {
    this.browserService.setTitle('Ajustes');
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadAppVersion();
      this.checkForUpdates();
      this.loadUsers();
    }
  }

  protected checkForUpdates(): void {
    this.isCheckingUpdates.set(true);
    this.updateCheckError.set('');
    this.appVersionService
      .checkForUpdates()
      .pipe(finalize(() => this.isCheckingUpdates.set(false)))
      .subscribe({
        next: (result) => this.applyVersionCheck(result),
        error: () => {
          this.updateAvailable.set(null);
          this.updateCheckError.set(
            'No se pudo comprobar si hay una nueva versión. Inténtalo de nuevo.',
          );
        },
      });
  }

  private loadAppVersion(): void {
    this.appVersionService
      .getCurrentVersion()
      .pipe(finalize(() => this.isLoadingAppVersion.set(false)))
      .subscribe({
        next: ({ version }) => this.appVersion.set(version),
        error: () => {
          this.appVersionLoadError.set('No se pudo cargar la versión actual.');
        },
      });
  }

  private applyVersionCheck(result: VersionCheckResult): void {
    this.updateAvailable.set(result.updateAvailable);
    this.latestVersion.set(result.latestVersion);
    if (result.releaseUrl) {
      this.releasesUrl.set(result.releaseUrl);
    }
  }

  private loadUsers(): void {
    this.isLoadingUsers.set(true);
    this.adminService
      .getUsers()
      .pipe(finalize(() => this.isLoadingUsers.set(false)))
      .subscribe({
        next: (users) => this.users.set(users),
        error: () => {
          this.users.set([]);
          this.usersLoadError.set('No se pudieron cargar los usuarios.');
        },
      });
  }
}
