import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Habit, HabitService } from '../habits/habit.service';

export type HabitDetailResolveResult =
  { habit: Habit; error: null } | { habit: null; error: 'not-found' | 'load' };

export const habitDetailResolver: ResolveFn<HabitDetailResolveResult> = (
  route,
) =>
  inject(HabitService)
    .getHabit(route.paramMap.get('id') ?? '')
    .pipe(
      map((habit) => ({ habit, error: null })),
      catchError((error: unknown) =>
        of<HabitDetailResolveResult>({
          habit: null,
          error:
            error instanceof HttpErrorResponse && error.status === 404
              ? 'not-found'
              : 'load',
        }),
      ),
    );
