import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { SwPush } from '@angular/service-worker';
import {
  HabitMakerUIBadge,
  HabitMakerUIInput,
  HabitMakerUIOption,
  HabitMakerUISelect,
  HabitMakerUIButton,
} from '@habit-maker/habit-maker-ui';
import { finalize, take } from 'rxjs';
import { AppUpdateService } from '../app-update.service';
import { AuthService, type AuthSession } from '../auth/auth.service';
import { HabitService } from '../habits/habit.service';
import { LanguageService, SupportedLanguage } from '../i18n/language.service';

@Component({
  imports: [
    DatePipe,
    FormsModule,
    HabitMakerUIBadge,
    HabitMakerUIInput,
    HabitMakerUIOption,
    HabitMakerUISelect,
    HabitMakerUIButton,
    TranslocoPipe,
  ],
  selector: 'app-settings-user',
  templateUrl: './settings-user.html',
})
export class SettingsUser implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly swPush = inject(SwPush, { optional: true });
  private readonly habitService = inject(HabitService, { optional: true });
  private readonly appUpdateService = inject(AppUpdateService);
  protected readonly languageService = inject(LanguageService);
  protected readonly email = signal(this.authService.getUserEmail());
  protected readonly sessions = signal<AuthSession[]>([]);
  protected readonly isLoadingSessions = signal(true);
  protected readonly sessionsLoadError = signal('');
  protected readonly sessionActionError = signal('');
  protected readonly revokingSessionId = signal<string | null>(null);
  protected readonly isRevokingOtherSessions = signal(false);
  protected readonly pwaUpdateStatus = signal<
    | 'idle'
    | 'checking'
    | 'update-available'
    | 'up-to-date'
    | 'unavailable'
    | 'error'
  >('idle');

  ngOnInit(): void {
    this.loadSessions();
  }

  protected loadSessions(): void {
    this.isLoadingSessions.set(true);
    this.sessionsLoadError.set('');
    this.authService
      .getSessions()
      .pipe(finalize(() => this.isLoadingSessions.set(false)))
      .subscribe({
        next: (sessions) => this.sessions.set(sessions),
        error: () => {
          this.sessions.set([]);
          this.sessionsLoadError.set('settings.sessionsError');
        },
      });
  }

  protected revokeSession(session: AuthSession): void {
    if (this.revokingSessionId() || this.isRevokingOtherSessions()) return;

    this.revokingSessionId.set(session.id);
    this.sessionActionError.set('');
    this.authService
      .revokeSession(session.id)
      .pipe(finalize(() => this.revokingSessionId.set(null)))
      .subscribe({
        next: () => {
          if (session.isCurrent) {
            this.authService.clearLocalSession();
            void this.router.navigateByUrl('/login');
            return;
          }
          this.loadSessions();
        },
        error: () => this.sessionActionError.set('settings.revokeSessionError'),
      });
  }

  protected revokeOtherSessions(): void {
    if (this.isRevokingOtherSessions() || this.revokingSessionId()) return;

    this.isRevokingOtherSessions.set(true);
    this.sessionActionError.set('');
    this.authService
      .revokeOtherSessions()
      .pipe(finalize(() => this.isRevokingOtherSessions.set(false)))
      .subscribe({
        next: () => this.loadSessions(),
        error: () => this.sessionActionError.set('settings.revokeSessionError'),
      });
  }

  protected async checkForPwaUpdates(): Promise<void> {
    if (this.pwaUpdateStatus() === 'checking') return;

    this.pwaUpdateStatus.set('checking');
    this.pwaUpdateStatus.set(await this.appUpdateService.checkForUpdates());
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
