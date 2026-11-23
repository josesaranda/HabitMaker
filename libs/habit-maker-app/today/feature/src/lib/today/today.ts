import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  HabitMakerUIButton,
  HabitMakerUIButtonIcon,
  HabitMakerUICardCompact,
  HabitMakerUIHeader,
  HabitMakerUIIcon,
  HabitMakerUIModal,
  HabitMakerUINotificationService,
  HabitMakerUIText,
} from '@habit-maker/habit-maker-ui';

import { TitleService } from '@habit-maker/shared-data-access';
import { HabitService } from '@habit-maker/habits-data-access';
import { HabitStore } from '@habit-maker/habits-data-access';
import { LanguageService } from '@habit-maker/i18n-data-access';
import { ConfettiService } from '@habit-maker/shared-data-access';
import { NewHabit } from '@habit-maker/habits-feature';
import { SettingsService } from '@habit-maker/settings-data-access';

@Component({
  imports: [
    HabitMakerUIText,
    HabitMakerUIButton,
    HabitMakerUIButtonIcon,
    HabitMakerUICardCompact,
    HabitMakerUIHeader,
    HabitMakerUIIcon,
    HabitMakerUIModal,
    NewHabit,
    TranslocoPipe,
  ],
  selector: 'app-today',
  templateUrl: './today.html',
})
export class Today implements OnInit {
  private readonly titleService = inject(TitleService);
  private readonly habitService = inject(HabitService);
  private readonly habitStore = inject(HabitStore);
  private readonly languageService = inject(LanguageService);
  private readonly homePreferences = inject(SettingsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(
    HabitMakerUINotificationService,
  );
  private readonly transloco = inject(TranslocoService);
  private readonly confettiService = inject(ConfettiService);

  protected readonly habits = this.habitStore.habits;
  protected readonly completions = signal<Record<string, boolean>>({});
  protected readonly showArchived = this.habitStore.showArchived;
  protected readonly hasArchived = this.habitStore.hasArchived;
  protected readonly hasLoadedHabits = this.habitStore.hasLoadedHabits;
  protected readonly loadError = this.habitStore.loadError;
  protected readonly completionError = signal('');
  protected readonly savingHabitIds = signal<ReadonlySet<string>>(new Set());
  protected readonly locale = this.languageService.locale;
  protected readonly todayDate = computed(() =>
    new Intl.DateTimeFormat(this.locale(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date()),
  );
  protected readonly activeHabits = computed(() =>
    this.habits().filter((habit) => !habit.archivedAt),
  );
  protected readonly archivedHabits = computed(() =>
    this.habits().filter((habit) => !!habit.archivedAt),
  );
  protected readonly hasActiveHabits = computed(
    () => this.activeHabits().length > 0,
  );
  protected readonly completionLabels = computed<Record<string, string>>(() => {
    const completions = this.completions();
    const spanish = this.locale().startsWith('es');

    return Object.fromEntries(
      this.habits().map((habit) => {
        const completed = completions[habit.id] ?? false;
        const label = spanish
          ? completed
            ? `Desmarcar ${habit.name} como completado`
            : `Marcar ${habit.name} como completado`
          : completed
            ? `Unmark ${habit.name} as complete`
            : `Mark ${habit.name} as complete`;
        return [habit.id, label];
      }),
    );
  });

  ngOnInit(): void {
    this.titleService.setTitle('pageTitles.today');
    this.habitStore.setShowArchived(this.homePreferences.getShowArchived());
    this.loadHabits();
    this.habitService.habitCreated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadHabits());
  }

  protected toggleShowArchived(): void {
    this.habitStore.setShowArchived(!this.showArchived());
    this.homePreferences.setShowArchived(this.showArchived());
    this.loadHabits();
  }

  protected toggleCompletion(habitId: string, completed: boolean): void {
    if (this.savingHabitIds().has(habitId)) return;

    const previous = this.completions()[habitId] ?? false;
    this.completions.update((completions) => ({
      ...completions,
      [habitId]: completed,
    }));
    this.setSaving(habitId, true);
    this.completionError.set('');
    this.habitService
      .setCompletion(habitId, this.getLocalDate(), completed)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (completion) => {
          this.setSaving(habitId, false);
          this.completions.update((completions) => ({
            ...completions,
            [habitId]: completion.completed,
          }));

          if (
            completion.completed &&
            this.activeHabits().length > 0 &&
            this.activeHabits().every(
              (habit) => this.completions()[habit.id] === true,
            )
          ) {
            this.notificationService
              .create({
                type: 'success',
                label: this.transloco.translate('today.allDoneTitle'),
                content: this.transloco.translate('today.allDoneMessage'),
                position: 'top-right',
                duration: 5000,
              })
              .open();
            this.confettiService.launch();
          }
        },
        error: () => {
          this.setSaving(habitId, false);
          this.completions.update((completions) => ({
            ...completions,
            [habitId]: previous,
          }));
          this.completionError.set('home.activityError');
        },
      });
  }

  private setSaving(habitId: string, saving: boolean): void {
    this.savingHabitIds.update((habitIds) => {
      const next = new Set(habitIds);
      if (saving) {
        next.add(habitId);
      } else {
        next.delete(habitId);
      }
      return next;
    });
  }

  private loadHabits(): void {
    this.habitStore.load(this.showArchived(), () => {
      const habits = this.habits();
      if (habits.length === 0) {
        this.completions.set({});
        return;
      }
      this.habitService
        .getTodayCompletions(habits.map((habit) => habit.id))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((completions) => this.completions.set(completions));
    });
  }

  private getLocalDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
