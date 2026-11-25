import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { SwPush } from '@angular/service-worker';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  HabitMakerUIButton,
  HabitMakerUIButtonIcon,
  HabitMakerUIEmojiPicker,
  HabitMakerUIFormField,
  HabitMakerUIFormFieldError,
  HabitMakerUIFormFieldLabel,
  HabitMakerUIHeader,
  HabitMakerUIIcon,
  HabitMakerUICalendar,
  HabitMakerUICard,
  HabitMakerUIInput,
  HabitMakerUIModal,
  HabitMakerUIModalContent,
  HabitMakerUIModalTitle,
  HabitMakerUIToggle,
  HabitMakerUIText,
} from '@habit-maker/habit-maker-ui';
import { firstValueFrom } from 'rxjs';
import { TitleService, isDesktopApp } from '@habit-maker/shared-data-access';
import { HabitCard } from '../habit-card/habit-card';
import type { HabitMakerUICardDayToggleEvent } from '../habit-card/habit-card';
import {
  EMPTY,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { Habit, HabitService } from '@habit-maker/habits-data-access';
import { LanguageService } from '@habit-maker/i18n-data-access';
import { HabitDetailResolveResult } from './habit-detail.resolver';

const nonBlankValidator: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { nonBlank: true };

@Component({
  imports: [
    HabitMakerUIText,
    HabitCard,
    HabitMakerUIButton,
    HabitMakerUIButtonIcon,
    HabitMakerUIEmojiPicker,
    HabitMakerUIFormField,
    HabitMakerUIFormFieldError,
    HabitMakerUIFormFieldLabel,
    HabitMakerUIHeader,
    HabitMakerUIIcon,
    HabitMakerUICalendar,
    HabitMakerUICard,
    HabitMakerUIInput,
    HabitMakerUIModal,
    HabitMakerUIModalContent,
    HabitMakerUIModalTitle,
    HabitMakerUIToggle,
    ReactiveFormsModule,
    TranslocoPipe,
  ],
  selector: 'app-habit-detail',
  templateUrl: './habit-detail.html',
})
export class HabitDetail implements OnInit {
  private readonly titleService = inject(TitleService);
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
  protected readonly completionUpdate =
    signal<HabitMakerUICardDayToggleEvent | null>(null);
  protected readonly calendarWindowStart = signal<string | null>(null);
  protected readonly calendarMonth = signal<string | null>(null);
  protected readonly calendarCompletions = signal<Record<string, boolean>>({});
  protected readonly calendarCompletedDates = computed(() =>
    Object.keys(this.calendarCompletions()).filter(
      (date) => this.calendarCompletions()[date],
    ),
  );
  protected readonly dayCompletionError = signal('');
  protected readonly loadError = signal('');
  protected readonly isDeletingHabit = signal(false);
  protected readonly deleteHabitError = signal('');
  protected readonly isArchivingHabit = signal(false);
  protected readonly archiveHabitError = signal('');
  protected readonly isSavingHabitName = signal(false);
  protected readonly editHabitForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(100),
        nonBlankValidator,
      ],
    }),
    emoji: new FormControl<string | null>(null),
  });
  private readonly editFormStatus = toSignal(
    this.editHabitForm.statusChanges.pipe(startWith(this.editHabitForm.status)),
    { initialValue: this.editHabitForm.status },
  );
  protected readonly editHabitEmoji = toSignal(
    this.editHabitForm.controls.emoji.valueChanges.pipe(
      startWith(this.editHabitForm.controls.emoji.value),
    ),
    { initialValue: this.editHabitForm.controls.emoji.value },
  );
  protected readonly editHabitNameTouched = signal(false);
  protected readonly pinnedEditHabitEmoji = signal<string | null>(null);
  protected readonly editHabitNameError = computed(() => {
    this.editFormStatus();
    this.editHabitNameTouched();
    const control = this.editHabitForm.controls.name;
    if (!this.editHabitNameTouched() || control.valid) return '';
    return control.hasError('maxlength')
      ? 'habitDetail.editNameTooLong'
      : 'habitDetail.editInvalidName';
  });
  protected readonly editHabitError = signal('');
  protected readonly canSaveHabitName = computed(
    () => this.editFormStatus() === 'VALID' && !this.isSavingHabitName(),
  );
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
    const today = new Date();
    this.calendarMonth.set(
      this.toLocalDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    );
    this.titleService.setTitle('pageTitles.habitDetail');
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
          if (this.calendarMonth()) {
            this.loadCalendarCompletions(this.calendarMonth()!);
          }
          this.titleService.setTitle('pageTitles.habitNamed', {
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

    if (isDesktopApp()) {
      if (typeof Notification === 'undefined') {
        this.reminderNotice.set('habitDetail.reminderUnsupported');
        return;
      }
      if (Notification.permission === 'denied') {
        this.reminderNotice.set('habitDetail.reminderBlocked');
        return;
      }
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          this.reminderNotice.set('habitDetail.reminderBlocked');
          return;
        }
      }

      this.isSavingReminder.set(true);
      this.reminderNotice.set('');
      try {
        await this.persistReminder(true, this.savedReminderTime(), true);
      } catch {
        this.isSavingReminder.set(false);
        this.reminderNotice.set('habitDetail.reminderError');
      }
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
    if (isDesktopApp()) {
      this.reminderPublicKey.set(null);
      if (typeof Notification === 'undefined') {
        this.pushConfigurationState.set('missing');
      } else {
        this.pushConfigurationState.set('available');
        if (Notification.permission === 'denied') {
          this.reminderNotice.set('habitDetail.reminderBlocked');
        }
      }
      return;
    }

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

  protected updateCalendarMonth(monthStart: string): void {
    this.calendarMonth.set(monthStart);
    this.loadCalendarCompletions(monthStart);
  }

  private loadCalendarCompletions(monthStart: string): void {
    const currentHabit = this.habit();
    if (!currentHabit) return;
    if (typeof this.habitService.getCompletionsForRange !== 'function') return;

    const [yearValue, monthValue] = monthStart.split('-').map(Number);
    const monthStartsOn = new Date(yearValue, monthValue - 1, 1);
    const leadingEmpty = (monthStartsOn.getDay() + 6) % 7;
    const monthDays = new Date(yearValue, monthValue, 0).getDate();
    const displayedCellCount = 42;
    const trailingDays = displayedCellCount - leadingEmpty - monthDays;

    const firstDisplayedDate = new Date(
      yearValue,
      monthValue - 1,
      1 - leadingEmpty,
    );
    const lastDisplayedDate = new Date(
      yearValue,
      monthValue - 1,
      monthDays + trailingDays,
    );

    const from = this.toLocalDate(firstDisplayedDate);
    const to = this.toLocalDate(lastDisplayedDate);

    this.habitService
      .getCompletionsForRange(currentHabit.id, from, to)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (completions) => {
          this.calendarCompletions.set(
            Object.fromEntries(
              completions.map((completion) => [
                completion.date,
                completion.completed,
              ]),
            ),
          );
        },
        error: () => {
          this.calendarCompletions.set({});
        },
      });
  }

  protected toggleDayCompletion(event: HabitMakerUICardDayToggleEvent): void {
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
          this.calendarCompletions.update((completions) => ({
            ...completions,
            [completion.date]: completion.completed,
          }));
          this.completionUpdate.set({
            date: completion.date,
            completed: completion.completed,
          });
          this.habit.update((habit) =>
            habit && typeof completion.currentStreak === 'number'
              ? { ...habit, currentStreak: completion.currentStreak }
              : habit,
          );
          if (completion.date === this.getLocalDate()) {
            this.isCompletedToday.set(completion.completed);
          }
        },
        error: () => {
          this.isSavingDayCompletion.set(false);
          this.dayCompletionError.set('habitDetail.activityError');
        },
      });
  }

  protected openEditHabitModal(
    modal: HabitMakerUIModal,
    trigger: HTMLElement,
  ): void {
    const currentHabit = this.habit();
    if (!currentHabit) return;

    this.editHabitForm.reset({
      name: currentHabit.name,
      emoji: currentHabit.emoji ?? null,
    });
    this.editHabitNameTouched.set(false);
    this.editHabitError.set('');
    this.pinnedEditHabitEmoji.set(currentHabit.emoji ?? null);
    modal.openFrom(trigger);
  }

  protected setEditHabitEmoji(emoji: string | null): void {
    this.editHabitForm.controls.emoji.setValue(emoji);
  }

  protected saveHabitName(modal: HabitMakerUIModal): void {
    const currentHabit = this.habit();
    if (!currentHabit || this.isSavingHabitName()) return;

    if (this.editHabitForm.invalid) {
      this.editHabitForm.markAllAsTouched();
      this.editHabitNameTouched.set(true);
      return;
    }

    const { name: rawName, emoji } = this.editHabitForm.getRawValue();
    const name = rawName.trim();
    this.isSavingHabitName.set(true);
    this.editHabitError.set('');
    this.habitService
      .updateHabit(currentHabit.id, name, emoji)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (habit) => {
          this.isSavingHabitName.set(false);
          this.habit.set(habit);
          this.titleService.setTitle('pageTitles.habitNamed', {
            name: habit.name,
          });
          modal.close();
        },
        error: () => {
          this.isSavingHabitName.set(false);
          this.editHabitError.set('habitDetail.editError');
        },
      });
  }

  protected archiveHabit(archived: boolean): void {
    const currentHabit = this.habit();
    if (!currentHabit || this.isArchivingHabit()) return;

    this.isArchivingHabit.set(true);
    this.archiveHabitError.set('');
    this.habitService
      .archiveHabit(currentHabit.id, archived)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (habit) => {
          this.isArchivingHabit.set(false);
          this.habit.set(habit);
        },
        error: () => {
          this.isArchivingHabit.set(false);
          this.archiveHabitError.set('habitDetail.archiveError');
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
