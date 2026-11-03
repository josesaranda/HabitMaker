import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import confetti from '@hiseb/confetti';
import {
  HabitMakerUIHeader,
  HabitMakerUIIcon,
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
import { HabitDetailResolveResult } from './habit-detail.resolver';

@Component({
  imports: [HabitCard, HabitMakerUIHeader, HabitMakerUIIcon, TranslocoPipe],
  selector: 'app-habit-detail',
  templateUrl: './habit-detail.html',
})
export class HabitDetail implements OnInit {
  private readonly browserService = inject(BrowserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly habitService = inject(HabitService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly habit = signal<Habit | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isNotFound = signal(false);
  protected readonly isCompletedToday = signal(false);
  protected readonly isSavingDayCompletion = signal(false);
  protected readonly completionRefresh = signal(0);
  protected readonly calendarWindowStart = signal<string | null>(null);
  protected readonly dayCompletionError = signal('');
  protected readonly loadError = signal('');

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
    latestStartDate.setDate(latestStartDate.getDate() - 3);
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
