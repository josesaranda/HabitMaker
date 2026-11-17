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
} from '@habit-maker/habit-maker-ui';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { BrowserService } from '../browser/browser.service';
import { HabitCard } from '../habit-card';
import type { HabitMakerUICardDayToggleEvent } from '../habit-card';
import { Habit, HabitService } from '../habits/habit.service';
import { NewHabit } from '../new-habit/new-habit';
import { SettingsService } from '../settings/settings.service';

@Component({
  imports: [
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
  private readonly homePreferences = inject(SettingsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly habits = signal<Habit[]>([]);
  protected readonly showArchived = signal(false);
  protected readonly hasArchived = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly isReloading = signal(false);
  protected readonly loadError = signal('');
  protected readonly isSavingDayCompletion = signal(false);
  protected readonly dayCompletionError = signal('');
  protected readonly completionUpdates = signal<
    Record<string, HabitMakerUICardDayToggleEvent>
  >({});
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
    this.showArchived.set(showArchived);
    this.loadHabits();
    this.habitService.habitCreated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadHabits({ silent: true }));
  }

  protected toggleShowArchived(): void {
    const wasHidden = !this.showArchived();
    this.showArchived.update((v) => !v);
    this.homePreferences.setShowArchived(this.showArchived());
    this.loadHabits({
      silent: true,
      onLoaded: wasHidden
        ? () => this.scrollToArchived()
        : () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    });
  }

  private loadHabits({ silent = false, onLoaded }: { silent?: boolean; onLoaded?: () => void } = {}): void {
    if (silent) {
      this.isReloading.set(true);
    } else {
      this.isLoading.set(true);
    }
    this.loadError.set('');
    forkJoin({
      habits: this.habitService
        .getHabits({ includeArchived: this.showArchived() })
        .pipe(catchError(() => of(null))),
      archived: this.habitService
        .getArchivedCount()
        .pipe(catchError(() => of({ count: 0 }))),
    })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.isReloading.set(false);
        }),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ habits, archived }) => {
        if (habits === null) {
          this.habits.set([]);
          this.loadError.set('home.loadError');
        } else {
          this.habits.set(habits);
        }
        this.hasArchived.set(archived.count > 0);
        if (onLoaded) {
          setTimeout(onLoaded);
        }
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
    if (this.isSavingDayCompletion()) return;

    this.isSavingDayCompletion.set(true);
    this.dayCompletionError.set('');
    this.habitService
      .setCompletion(habitId, event.date, event.completed)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (completion) => {
          this.isSavingDayCompletion.set(false);
          this.completionUpdates.update((updates) => ({
            ...updates,
            [habitId]: {
              date: completion.date,
              completed: completion.completed,
            },
          }));
        },
        error: () => {
          this.isSavingDayCompletion.set(false);
          this.dayCompletionError.set('home.activityError');
        },
      });
  }
}
