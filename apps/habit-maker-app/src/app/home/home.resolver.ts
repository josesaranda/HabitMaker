import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Habit, HabitService } from '../habits/habit.service';

export interface HomeHabitsResolveResult {
  habits: Habit[];
  hasError: boolean;
}

export const homeHabitsResolver: ResolveFn<HomeHabitsResolveResult> = () =>
  inject(HabitService)
    .getHabits()
    .pipe(
      map((habits) => ({ habits, hasError: false })),
      catchError(() => of({ habits: [], hasError: true })),
    );
