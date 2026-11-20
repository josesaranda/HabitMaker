import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  HabitMakerUIButton,
  HabitMakerUIButtonIcon,
  HabitMakerUICardCompact,
  HabitMakerUIHeader,
  HabitMakerUIIcon,
  HabitMakerUIModal,
  HabitMakerUINotification,
  HabitMakerUIText,
} from '@habit-maker/habit-maker-ui';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { BrowserService } from '../browser/browser.service';
import {
  Habit,
  HabitCompletionStatus,
  HabitService,
} from '../habits/habit.service';
import { LanguageService } from '../i18n/language.service';
import confetti from '@hiseb/confetti';
import { NewHabit } from '../new-habit/new-habit';
import { SettingsService } from '../settings/settings.service';

@Component({
  imports: [
    HabitMakerUIText,
    HabitMakerUIButton,
    HabitMakerUIButtonIcon,
    HabitMakerUICardCompact,
    HabitMakerUIHeader,
    HabitMakerUIIcon,
    HabitMakerUIModal,
    HabitMakerUINotification,
    NewHabit,
    TranslocoPipe,
  ],
  selector: 'app-today',
  templateUrl: './today.html',
})
export class Today implements OnInit {
  private readonly browserService = inject(BrowserService);
  private readonly habitService = inject(HabitService);
  private readonly languageService = inject(LanguageService);
  private readonly homePreferences = inject(SettingsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly allDoneNotification = viewChild(HabitMakerUINotification);

  protected readonly habits = signal<Habit[]>([]);
  protected readonly completions = signal<Record<string, boolean>>({});
  protected readonly showArchived = signal(false);
  protected readonly hasArchived = signal(false);
  protected readonly hasLoadedHabits = signal(false);
  protected readonly loadError = signal('');
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
    this.browserService.setTitle('pageTitles.today');
    this.showArchived.set(this.homePreferences.getShowArchived());
    this.loadHabits();
    this.habitService.habitCreated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadHabits());
  }

  protected toggleShowArchived(): void {
    this.showArchived.update((value) => !value);
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
            this.allDoneNotification()?.open();
            this.launchConfetti();
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

  private launchConfetti(): void {
    const width = window.innerWidth || 1024;
    const launchPoints = [0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9].map((fraction) =>
      Math.round(width * fraction),
    );

    launchPoints.forEach((x, index) => {
      setTimeout(() => {
        confetti({
          position: { x, y: 0 },
          count: 140,
          size: 1.1,
          velocity: 220,
        });
      }, index * 120);
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
    this.loadError.set('');
    forkJoin({
      habits: this.habitService
        .getHabits({ includeArchived: this.showArchived() })
        .pipe(catchError(() => of(null))),
      archived: this.habitService
        .getArchivedCount()
        .pipe(catchError(() => of({ count: 0 }))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ habits, archived }) => {
        this.hasLoadedHabits.set(habits !== null);
        if (habits === null) {
          this.habits.set([]);
          this.completions.set({});
          this.loadError.set('home.loadError');
        } else {
          this.habits.set(habits);
          this.loadTodayCompletions(habits);
        }
        this.hasArchived.set(archived.count > 0);
      });
  }

  private loadTodayCompletions(habits: Habit[]): void {
    if (habits.length === 0) {
      this.completions.set({});
      return;
    }

    const requests: Record<
      string,
      Observable<HabitCompletionStatus | null>
    > = {};
    for (const habit of habits) {
      requests[habit.id] = this.habitService
        .getTodayCompletion(habit.id)
        .pipe(catchError(() => of(null)));
    }

    forkJoin(requests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.completions.set(
          Object.fromEntries(
            Object.entries(results).map(([habitId, completion]) => [
              habitId,
              completion?.completed ?? false,
            ]),
          ),
        );
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
