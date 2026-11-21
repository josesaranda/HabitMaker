import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
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
  HabitMakerUIHeader,
  HabitMakerUIIcon,
  HabitMakerUIModal,
  HabitMakerUIText,
} from '@habit-maker/habit-maker-ui';

import { BrowserService } from '@habit-maker/shared-data-access';
import { HabitCard } from '../habit-card/habit-card';
import type { HabitMakerUICardDayToggleEvent } from '../habit-card/habit-card';
import { HabitService } from '@habit-maker/habits-data-access';
import { HabitStore } from '@habit-maker/habits-data-access';
import { NewHabit } from '../new-habit/new-habit';
import { SettingsService } from '@habit-maker/settings-data-access';

@Component({
  imports: [
    HabitMakerUIText,
    HabitMakerUIButton,
    HabitMakerUIButtonIcon,
    HabitMakerUIHeader,
    HabitMakerUIIcon,
    HabitMakerUIModal,
    HabitCard,
    NewHabit,
    TranslocoPipe,
  ],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly browserService = inject(BrowserService);
  private readonly habitService = inject(HabitService);
  private readonly habitStore = inject(HabitStore);
  private readonly homePreferences = inject(SettingsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly habits = this.habitStore.habits;
  protected readonly showArchived = this.habitStore.showArchived;
  protected readonly hasArchived = this.habitStore.hasArchived;
  protected readonly hasLoadedHabits = this.habitStore.hasLoadedHabits;
  protected readonly loadError = this.habitStore.loadError;
  protected readonly savingDayHabitIds = signal<ReadonlySet<string>>(new Set());
  protected readonly dayCompletionError = signal('');
  protected readonly completionUpdates = signal<
    Record<string, HabitMakerUICardDayToggleEvent>
  >({});
  protected readonly streakUpdates = signal<Record<string, number>>({});
  protected readonly currentStreaks = computed(() => {
    const streaks: Record<string, number | undefined> = {};
    for (const habit of this.habits()) {
      streaks[habit.id] = habit.currentStreak;
    }
    return { ...streaks, ...this.streakUpdates() };
  });
  protected readonly hasHabits = computed(() => this.habits().length > 0);
  protected readonly activeHabits = computed(() =>
    this.habits().filter((h) => !h.archivedAt),
  );
  protected readonly archivedHabits = computed(() =>
    this.habits().filter((h) => !!h.archivedAt),
  );
  protected readonly archivedSectionRef =
    viewChild<ElementRef<HTMLElement>>('archivedSection');

  ngOnInit(): void {
    this.browserService.setTitle('pageTitles.home');
    const showArchived = this.homePreferences.getShowArchived();
    this.habitStore.setShowArchived(showArchived);
    this.loadHabits();
    this.habitService.habitCreated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadHabits());
  }

  protected toggleShowArchived(): void {
    const wasHidden = !this.showArchived();
    this.habitStore.setShowArchived(!this.showArchived());
    this.homePreferences.setShowArchived(this.showArchived());
    this.loadHabits({
      onLoaded: wasHidden
        ? () => this.scrollToArchived()
        : () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    });
  }

  private loadHabits({ onLoaded }: { onLoaded?: () => void } = {}): void {
    this.habitStore.load(this.showArchived(), () => {
      this.streakUpdates.set({});
      onLoaded?.();
    });
  }

  private scrollToArchived(): void {
    this.archivedSectionRef()?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  protected toggleDayCompletion(
    habitId: string,
    event: HabitMakerUICardDayToggleEvent,
  ): void {
    if (this.savingDayHabitIds().has(habitId)) return;

    this.setSavingDayHabit(habitId, true);
    this.dayCompletionError.set('');
    this.habitService
      .setCompletion(habitId, event.date, event.completed)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (completion) => {
          this.setSavingDayHabit(habitId, false);
          this.completionUpdates.update((updates) => ({
            ...updates,
            [habitId]: {
              date: completion.date,
              completed: completion.completed,
            },
          }));
          if (typeof completion.currentStreak === 'number') {
            this.streakUpdates.update((streaks) => ({
              ...streaks,
              [habitId]: completion.currentStreak,
            }));
          }
        },
        error: () => {
          this.setSavingDayHabit(habitId, false);
          this.dayCompletionError.set('home.activityError');
        },
      });
  }

  private setSavingDayHabit(habitId: string, saving: boolean): void {
    this.savingDayHabitIds.update((habitIds) => {
      const next = new Set(habitIds);
      if (saving) {
        next.add(habitId);
      } else {
        next.delete(habitId);
      }
      return next;
    });
  }
}
