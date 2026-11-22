import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  HabitMakerUIButton,
  HabitMakerUIFormField,
  HabitMakerUIFormFieldError,
  HabitMakerUIFormFieldLabel,
  HabitMakerUIInput,
  HabitMakerUIOption,
  HabitMakerUISelect,
  HabitMakerUIText,
  HabitMakerUIToggle,
} from '@habit-maker/habit-maker-ui';
import { finalize, startWith } from 'rxjs';
import {
  AdminEmailConfiguration,
  AdminPushConfiguration,
  AdminService,
  AdminUser,
  UpdateEmailConfigurationInput,
  UpdatePushConfigurationInput,
} from '@habit-maker/admin-data-access';
import {
  AppVersionService,
  VersionCheckResult,
} from '@habit-maker/settings-data-access';

const RELEASES_URL = 'https://github.com/josesaranda/HabitMaker/releases';

@Component({
  imports: [
    HabitMakerUIText,
    HabitMakerUIFormField,
    HabitMakerUIFormFieldError,
    HabitMakerUIFormFieldLabel,
    HabitMakerUIInput,
    HabitMakerUIButton,
    HabitMakerUIOption,
    HabitMakerUISelect,
    ReactiveFormsModule,
    TranslocoPipe,
    HabitMakerUIToggle,
  ],
  selector: 'app-settings-admin',
  templateUrl: './settings-admin.html',
})
export class SettingsAdmin implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly appVersionService = inject(AppVersionService);
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly emailConfiguration =
    signal<AdminEmailConfiguration | null>(null);
  protected readonly isLoadingEmailConfiguration = signal(false);
  protected readonly emailConfigurationError = signal('');
  protected readonly emailForm = new FormGroup({
    host: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    port: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d+$/)],
    }),
    protocol: new FormControl('smtp', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    user: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    from: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', { nonNullable: true }),
    enabled: new FormControl(true, { nonNullable: true }),
  });
  protected readonly isSavingEmailConfiguration = signal(false);
  protected readonly emailConfigurationMessage = signal('');
  protected readonly pushConfiguration = signal<AdminPushConfiguration | null>(
    null,
  );
  protected readonly isLoadingPushConfiguration = signal(false);
  protected readonly pushConfigurationError = signal('');
  protected readonly pushForm = new FormGroup({
    publicKey: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    privateKey: new FormControl('', { nonNullable: true }),
    subject: new FormControl('', { nonNullable: true }),
    enabled: new FormControl(true, { nonNullable: true }),
  });
  protected readonly isSavingPushConfiguration = signal(false);
  protected readonly pushConfigurationMessage = signal('');
  protected readonly testEmailForm = new FormGroup({
    testEmailAddress: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  protected readonly testEmailAddressTouched = signal(false);
  private readonly testEmailFormStatus = toSignal(
    this.testEmailForm.statusChanges.pipe(startWith(this.testEmailForm.status)),
    { initialValue: this.testEmailForm.status },
  );
  protected readonly testEmailAddressError = computed(() => {
    this.testEmailFormStatus();
    this.testEmailAddressTouched();
    const control = this.testEmailForm.controls.testEmailAddress;
    if (!this.testEmailAddressTouched() || control.valid) return '';
    return control.hasError('required')
      ? 'signup.emailRequired'
      : 'signup.emailInvalid';
  });
  protected readonly canSendTestEmail = computed(
    () =>
      this.testEmailFormStatus() === 'VALID' &&
      !this.isSendingTestEmail() &&
      !!this.emailConfiguration()?.isConfigured,
  );
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

  ngOnInit(): void {
    this.loadAppVersion();
    this.checkForUpdates();
    this.loadUsers();
    this.loadEmailConfiguration();
    this.loadPushConfiguration();
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
        next: (configuration) => {
          this.emailConfiguration.set(configuration);
          this.emailForm.patchValue({
            host: configuration.host,
            port: configuration.port,
            protocol: configuration.protocol || 'smtp',
            user: configuration.user,
            from: configuration.from,
            password: '',
            enabled: configuration.enabled,
          });
        },
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
        next: (configuration) => {
          this.pushConfiguration.set(configuration);
          this.pushForm.patchValue({
            publicKey: configuration.publicKey,
            privateKey: '',
            subject: configuration.subject,
            enabled: configuration.enabled,
          });
        },
        error: () => {
          this.pushConfigurationError.set('settings.pushConfigurationError');
        },
      });
  }

  protected saveEmailConfiguration(): void {
    this.emailForm.markAllAsTouched();
    if (this.emailForm.invalid || this.isSavingEmailConfiguration()) return;

    const value = this.emailForm.getRawValue();
    const input: UpdateEmailConfigurationInput = {
      host: value.host.trim(),
      port: value.port.trim(),
      protocol: value.protocol,
      user: value.user.trim(),
      from: value.from.trim(),
      enabled: value.enabled,
    };
    const password = value.password.trim();
    if (password) input.password = password;

    this.isSavingEmailConfiguration.set(true);
    this.emailConfigurationMessage.set('');
    this.adminService
      .updateEmailConfiguration(input)
      .pipe(finalize(() => this.isSavingEmailConfiguration.set(false)))
      .subscribe({
        next: (configuration) => {
          this.emailConfiguration.set(configuration);
          this.emailForm.patchValue({
            host: configuration.host,
            port: configuration.port,
            protocol: configuration.protocol || 'smtp',
            user: configuration.user,
            from: configuration.from,
            password: '',
            enabled: configuration.enabled,
          });
          this.emailConfigurationMessage.set(
            'settings.emailConfigurationSaved',
          );
        },
        error: () => {
          this.emailConfigurationMessage.set(
            'settings.emailConfigurationSaveError',
          );
        },
      });
  }

  protected savePushConfiguration(): void {
    this.pushForm.markAllAsTouched();
    if (this.pushForm.invalid || this.isSavingPushConfiguration()) return;

    const value = this.pushForm.getRawValue();
    const input: UpdatePushConfigurationInput = {
      publicKey: value.publicKey.trim(),
      subject: value.subject.trim(),
      enabled: value.enabled,
    };
    const privateKey = value.privateKey.trim();
    if (privateKey) input.privateKey = privateKey;

    this.isSavingPushConfiguration.set(true);
    this.pushConfigurationMessage.set('');
    this.adminService
      .updatePushConfiguration(input)
      .pipe(finalize(() => this.isSavingPushConfiguration.set(false)))
      .subscribe({
        next: (configuration) => {
          this.pushConfiguration.set(configuration);
          this.pushForm.patchValue({
            publicKey: configuration.publicKey,
            privateKey: '',
            subject: configuration.subject,
            enabled: configuration.enabled,
          });
          this.pushConfigurationMessage.set('settings.pushConfigurationSaved');
        },
        error: () => {
          this.pushConfigurationMessage.set(
            'settings.pushConfigurationSaveError',
          );
        },
      });
  }

  protected sendTestEmail(): void {
    this.testEmailForm.markAllAsTouched();
    this.testEmailAddressTouched.set(true);
    if (this.testEmailForm.invalid || this.isSendingTestEmail()) return;

    const recipient = this.testEmailForm.controls.testEmailAddress.value.trim();

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
}
