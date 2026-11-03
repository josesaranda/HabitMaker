import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { SwPush } from '@angular/service-worker';
import {
  HabitMakerUIHeader,
  HabitMakerUIInput,
  HabitMakerUIOption,
  HabitMakerUISelect,
  HabitMakerUIButton,
} from '@habit-maker/habit-maker-ui';
import { finalize, take } from 'rxjs';
import {
  AdminEmailConfiguration,
  AdminPushConfiguration,
  AdminService,
  AdminUser,
} from '../admin/admin.service';
import { BrowserService } from '../browser/browser.service';
import { AuthService } from '../auth/auth.service';
import { HabitService } from '../habits/habit.service';
import { AppVersionService, VersionCheckResult } from './app-version.service';
import { LanguageService, SupportedLanguage } from '../i18n/language.service';

const RELEASES_URL = 'https://github.com/josesaranda/HabitMaker/releases';

@Component({
  imports: [
    HabitMakerUIHeader,
    HabitMakerUIInput,
    HabitMakerUIButton,
    HabitMakerUISelect,
    HabitMakerUIOption,
    FormsModule,
    TranslocoPipe,
  ],
  selector: 'app-settings',
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  private readonly browserService = inject(BrowserService);
  private readonly authService = inject(AuthService);
  private readonly swPush = inject(SwPush, { optional: true });
  private readonly habitService = inject(HabitService, { optional: true });
  private readonly adminService = inject(AdminService);
  private readonly appVersionService = inject(AppVersionService);
  protected readonly languageService = inject(LanguageService);
  protected readonly email = signal(this.authService.getUserEmail());
  protected readonly isAdmin = signal(
    this.authService.getUserRole() === 'admin',
  );
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly emailConfiguration =
    signal<AdminEmailConfiguration | null>(null);
  protected readonly isLoadingEmailConfiguration = signal(false);
  protected readonly emailConfigurationError = signal('');
  protected readonly pushConfiguration =
    signal<AdminPushConfiguration | null>(null);
  protected readonly isLoadingPushConfiguration = signal(false);
  protected readonly pushConfigurationError = signal('');
  protected readonly testEmailAddress = signal('');
  protected readonly isSendingTestEmail = signal(false);
  protected readonly testEmailMessage = signal('');
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
    this.browserService.setTitle('pageTitles.settings');
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadAppVersion();
      this.checkForUpdates();
      this.loadUsers();
      this.loadEmailConfiguration();
      this.loadPushConfiguration();
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
          this.updateCheckError.set('settings.checkError');
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
          this.appVersionLoadError.set('settings.versionError');
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
          this.usersLoadError.set('settings.usersError');
        },
      });
  }

  private loadEmailConfiguration(): void {
    this.isLoadingEmailConfiguration.set(true);
    this.adminService
      .getEmailConfiguration()
      .pipe(finalize(() => this.isLoadingEmailConfiguration.set(false)))
      .subscribe({
        next: (configuration) => this.emailConfiguration.set(configuration),
        error: () => {
          this.emailConfigurationError.set('settings.emailConfigurationError');
        },
      });
  }

  private loadPushConfiguration(): void {
    this.isLoadingPushConfiguration.set(true);
    this.adminService
      .getPushConfiguration()
      .pipe(finalize(() => this.isLoadingPushConfiguration.set(false)))
      .subscribe({
        next: (configuration) => this.pushConfiguration.set(configuration),
        error: () => {
          this.pushConfigurationError.set(
            'settings.pushConfigurationError',
          );
        },
      });
  }

  protected sendTestEmail(event: SubmitEvent): void {
    event.preventDefault();
    const recipient = this.testEmailAddress().trim();
    if (!recipient || this.isSendingTestEmail()) return;

    this.isSendingTestEmail.set(true);
    this.testEmailMessage.set('');
    this.adminService
      .sendTestEmail(recipient)
      .pipe(finalize(() => this.isSendingTestEmail.set(false)))
      .subscribe({
        next: () => this.testEmailMessage.set('settings.testEmailSent'),
        error: () => this.testEmailMessage.set('settings.testEmailError'),
      });
  }

  protected setLanguage(language: SupportedLanguage): void {
    this.languageService.setLanguage(language);
    if (!this.swPush?.isEnabled || !this.habitService) return;

    const habitService = this.habitService;
    this.swPush.subscription.pipe(take(1)).subscribe((subscription) => {
      if (!subscription) return;
      habitService
        .savePushSubscription(subscription.toJSON(), language)
        .subscribe({ error: () => undefined });
    });
  }
}
