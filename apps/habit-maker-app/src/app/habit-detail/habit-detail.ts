import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HabitMakerUIButton } from '@habit-maker/habit-maker-ui';
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
import { HabitDetailResolveResult } from './habit-detail.resolver';

@Component({
  imports: [HabitCard, HabitMakerUIButton, RouterLink],
  selector: 'app-habit-detail',
  templateUrl: './habit-detail.html',
})
export class HabitDetail implements OnInit {
  private readonly browserService = inject(BrowserService);
  private readonly route = inject(ActivatedRoute);
  private readonly habitService = inject(HabitService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly habit = signal<Habit | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isNotFound = signal(false);
  protected readonly isCompletedToday = signal(false);
  protected readonly isSavingCompletion = signal(false);
  protected readonly isSavingDayCompletion = signal(false);
  protected readonly completionRefresh = signal(0);
  protected readonly completionError = signal('');
  protected readonly dayCompletionError = signal('');
  protected readonly loadError = signal('');

  ngOnInit(): void {
    this.browserService.setTitle('Detalle del hábito');
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
          this.completionError.set('');
          this.isSavingDayCompletion.set(false);
          this.dayCompletionError.set('');
        }),
        switchMap((result) => {
          if (!result.habit) {
            this.isLoading.set(false);
            this.isNotFound.set(result.error === 'not-found');
            if (result.error === 'load') {
              this.loadError.set('No se pudo cargar este hábito.');
            }
            return EMPTY;
          }

          const habit = result.habit;
          this.habit.set(habit);
          this.browserService.setTitle(`Hábito: ${habit.name}`);
          this.isLoading.set(false);
          return this.habitService.getTodayCompletion(habit.id).pipe(
            catchError(() => {
              this.loadError.set('No se pudo cargar este hábito.');
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

  protected markCompletedToday(): void {
    const currentHabit = this.habit();
    if (!currentHabit || this.isCompletedToday() || this.isSavingCompletion()) {
      return;
    }

    this.isSavingCompletion.set(true);
    this.completionError.set('');
    this.habitService
      .markCompletedToday(currentHabit.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (completion) => {
          this.isCompletedToday.set(completion.completed);
          this.isSavingCompletion.set(false);
        },
        error: () => {
          this.isSavingCompletion.set(false);
          this.completionError.set(
            'No se pudo guardar la actividad. Inténtalo de nuevo.',
          );
        },
      });
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
          if (completion.date === this.getLocalDate()) {
            this.isCompletedToday.set(completion.completed);
          }
        },
        error: () => {
          this.isSavingDayCompletion.set(false);
          this.dayCompletionError.set(
            'No se pudo actualizar la actividad. Inténtalo de nuevo.',
          );
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
}
