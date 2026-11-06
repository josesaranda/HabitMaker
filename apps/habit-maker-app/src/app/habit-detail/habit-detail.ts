import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import confetti from '@hiseb/confetti';
import {
  HabitMakerUIButton,
  HabitMakerUIHeader,
  HabitMakerUIIcon,
  HabitMakerUIModal,
} from '@habit-maker/habit-maker-ui';
import { BrowserService } from '../browser/browser.service';
import { HabitCard } from '../habit-card/habit-card';
import type { HabitCardDayToggleEvent } from '../habit-card/habit-card';
import {
  EMPTY,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { Habit, HabitService } from '../habits/habit.service';
import { LanguageService } from '../i18n/language.service';
import { HabitDetailResolveResult } from './habit-detail.resolver';

@Component({
  imports: [
    HabitCard,
    HabitMakerUIButton,
    HabitMakerUIHeader,
    HabitMakerUIIcon,
    HabitMakerUIModal,
    TranslocoPipe,
  ],
  selector: 'app-habit-detail',
  templateUrl: './habit-detail.html',
})
export class HabitDetail implements OnInit {
  private readonly browserService = inject(BrowserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly habitService = inject(HabitService);
  private readonly languageService = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly swPush = inject(SwPush, { optional: true });

  protected readonly habit = signal<Habit | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isNotFound = signal(false);
  protected readonly isCompletedToday = signal(false);
  protected readonly isSavingDayCompletion = signal(false);
  protected readonly completionRefresh = signal(0);
  protected readonly calendarWindowStart = signal<string | null>(null);
  protected readonly dayCompletionError = signal('');
  protected readonly loadError = signal('');
  protected readonly isDeletingHabit = signal(false);
  protected readonly deleteHabitError = signal('');
  protected readonly isLoadingReminder = signal(true);
  protected readonly isSavingReminder = signal(false);
  protected readonly reminderEnabled = signal(false);
  protected readonly pushConfigurationState = signal<
    'loading' | 'available' | 'missing' | 'error'
  >('loading');
  protected readonly shouldShowReminderSettings = computed(
    () => this.pushConfigurationState() !== 'missing',
  );
  protected readonly reminderTime = signal('08:00');
  protected readonly savedReminderTime = signal('08:00');
  protected readonly hasPendingReminderChanges = computed(
    () =>
      this.reminderEnabled() &&
      this.reminderTime() !== this.savedReminderTime(),
  );
  protected readonly reminderPublicKey = signal<string | null>(null);
  protected readonly reminderNotice = signal('');

  ngOnInit(): void {
    this.browserService.setTitle('pageTitles.habitDetail');
    this.route.queryParamMap
      .pipe(
        map((params) => params.get('from')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((queryStartDate) => {
        const windowStartDate = this.normalizeCalendarStart(queryStartDate);
        this.calendarWindowStart.set(windowStartDate);
        if (queryStartDate !== windowStartDate) {
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { from: windowStartDate },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
      });

    this.route.data
      .pipe(
        map(
          (data) => data['habitResult'] as HabitDetailResolveResult | undefined,
        ),
        filter(
          (result): result is HabitDetailResolveResult => result !== undefined,
        ),
        distinctUntilChanged(),
        tap(() => {
          this.isLoading.set(true);
          this.habit.set(null);
          this.isNotFound.set(false);
          this.loadError.set('');
          this.isCompletedToday.set(false);
          this.isSavingDayCompletion.set(false);
          this.dayCompletionError.set('');
        }),
        switchMap((result) => {
          if (!result.habit) {
            this.isLoading.set(false);
            this.isNotFound.set(result.error === 'not-found');
            if (result.error === 'load') {
              this.loadError.set('habitDetail.loadError');
            }
            return EMPTY;
          }

          const habit = result.habit;
          this.habit.set(habit);
          this.loadReminder(habit.id);
          this.browserService.setTitle('pageTitles.habitNamed', {
            name: habit.name,
          });
          this.isLoading.set(false);
          return this.habitService.getTodayCompletion(habit.id).pipe(
            catchError(() => {
              this.loadError.set('habitDetail.loadError');
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((completion) => {
        this.isCompletedToday.set(completion.completed);
      });
  }

  protected async toggleReminder(enabled: boolean): Promise<void> {
    const currentHabit = this.habit();
    if (!currentHabit || this.isSavingReminder()) return;

    if (!enabled) {
      this.reminderTime.set(this.savedReminderTime());
      await this.persistReminder(false, this.savedReminderTime());
      return;
    }

    if (!this.swPush?.isEnabled || typeof Notification === 'undefined') {
      this.reminderNotice.set('habitDetail.reminderUnsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      this.reminderNotice.set('habitDetail.reminderBlocked');
      return;
    }

    const publicKey = this.reminderPublicKey();
    if (!publicKey) {
      this.reminderNotice.set('habitDetail.reminderUnsupported');
      return;
    }

    this.isSavingReminder.set(true);
    this.reminderNotice.set('');
    try {
      // requestSubscription is called only from this explicit user action.
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: publicKey,
      });
      await firstValueFrom(
        this.habitService.savePushSubscription(
          subscription.toJSON(),
          this.languageService.language(),
        ),
      );
      await this.persistReminder(true, this.savedReminderTime(), true);
    } catch {
      this.isSavingReminder.set(false);
      this.reminderNotice.set(
        this.notificationsAreBlocked()
          ? 'habitDetail.reminderBlocked'
          : 'habitDetail.reminderError',
      );
    }
  }

  protected setReminderTime(time: string): void {
    this.reminderTime.set(time);
  }

  protected async saveReminderTime(): Promise<void> {
    if (!this.hasPendingReminderChanges() || this.isSavingReminder()) return;
    await this.persistReminder(
      true,
      this.reminderTime(),
      false,
      'habitDetail.reminderTimeSaved',
    );
  }

  private loadReminder(habitId: string): void {
    this.isLoadingReminder.set(true);
    this.pushConfigurationState.set('loading');
    this.reminderNotice.set('');
    this.habitService
      .getReminder(habitId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reminder) => {
          this.reminderEnabled.set(reminder.enabled);
          if (reminder.time) {
            this.reminderTime.set(reminder.time);
            this.savedReminderTime.set(reminder.time);
          }
          this.isLoadingReminder.set(false);
        },
        error: () => {
          this.isLoadingReminder.set(false);
          this.reminderNotice.set('habitDetail.reminderError');
        },
      });
    this.habitService
      .getPushPublicKey()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ publicKey }) => {
          this.reminderPublicKey.set(publicKey);
          if (!publicKey) {
            this.pushConfigurationState.set('missing');
            return;
          }
          this.pushConfigurationState.set('available');
          if (!this.swPush?.isEnabled || typeof Notification === 'undefined') {
            this.reminderNotice.set('habitDetail.reminderUnsupported');
          } else if (Notification.permission === 'denied') {
            this.reminderNotice.set('habitDetail.reminderBlocked');
          }
        },
        error: () => {
          this.reminderPublicKey.set(null);
          this.pushConfigurationState.set('error');
          this.reminderNotice.set('habitDetail.reminderError');
        },
      });
  }

  private async persistReminder(
    enabled: boolean,
    time: string,
    alreadySaving = false,
    successMessage = enabled
      ? 'habitDetail.reminderEnabled'
      : 'habitDetail.reminderDisabled',
  ): Promise<void> {
    const currentHabit = this.habit();
    if (!currentHabit) return;

    if (!alreadySaving) this.isSavingReminder.set(true);
    this.reminderNotice.set('');
    try {
      const reminder = await firstValueFrom(
        this.habitService.saveReminder(currentHabit.id, {
          enabled,
          time,
          timeZone: this.getLocalTimeZone(),
        }),
      );
      this.reminderEnabled.set(reminder.enabled);
      if (reminder.time) {
        this.reminderTime.set(reminder.time);
        this.savedReminderTime.set(reminder.time);
      }
      this.reminderNotice.set(successMessage);
    } catch {
      this.reminderNotice.set('habitDetail.reminderError');
    } finally {
      this.isSavingReminder.set(false);
    }
  }

  private getLocalTimeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  }

  private notificationsAreBlocked(): boolean {
    return (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'denied'
    );
  }

  protected updateCalendarWindow(windowStartDate: string): void {
    const normalizedStartDate = this.normalizeCalendarStart(windowStartDate);
    if (!normalizedStartDate) return;

    this.calendarWindowStart.set(normalizedStartDate);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { from: normalizedStartDate },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private normalizeCalendarStart(value: string | null): string | null {
    if (value === null) return null;

    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!dateParts) return null;

    const [, yearValue, monthValue, dayValue] = dateParts;
    const year = Number(yearValue);
    const month = Number(monthValue) - 1;
    const day = Number(dayValue);
    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    const latestStartDate = new Date();
    latestStartDate.setHours(0, 0, 0, 0);
    latestStartDate.setDate(latestStartDate.getDate() - 6);
    if (date > latestStartDate) {
      return this.toLocalDate(latestStartDate);
    }
    return value;
  }

  protected toggleDayCompletion(event: HabitCardDayToggleEvent): void {
    const currentHabit = this.habit();
    if (!currentHabit || this.isSavingDayCompletion()) return;

    this.isSavingDayCompletion.set(true);
    this.dayCompletionError.set('');
    this.habitService
      .setCompletion(currentHabit.id, event.date, event.completed)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (completion) => {
          this.isSavingDayCompletion.set(false);
          this.completionRefresh.update((version) => version + 1);
          if (completion.completed) {
            confetti({
              position: event.position,
              color: ['#a8c5ad', '#e6b875', '#ffffff'],
            });
          }
          if (completion.date === this.getLocalDate()) {
            this.isCompletedToday.set(completion.completed);
          }
        },
        error: () => {
          this.isSavingDayCompletion.set(false);
          this.dayCompletionError.set(
            'habitDetail.activityError',
          );
        },
      });
  }

  protected deleteHabit(modal: HabitMakerUIModal): void {
    const currentHabit = this.habit();
    if (!currentHabit || this.isDeletingHabit()) return;

    this.isDeletingHabit.set(true);
    this.deleteHabitError.set('');
    this.habitService
      .deleteHabit(currentHabit.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeletingHabit.set(false);
          modal.close();
          void this.router.navigate(['/home']);
        },
        error: () => {
          this.isDeletingHabit.set(false);
          this.deleteHabitError.set('habitDetail.deleteError');
        },
      });
  }

  private getLocalDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
