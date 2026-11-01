import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HabitMakerUIButton } from '@habit-maker/habit-maker-ui';
import {
  EMPTY,
  catchError,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { Habit, HabitService } from '../habits/habit.service';

@Component({
  imports: [HabitMakerUIButton, RouterLink],
  selector: 'app-habit-detail',
  templateUrl: './habit-detail.html',
})
export class HabitDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly habitService = inject(HabitService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly habit = signal<Habit | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isNotFound = signal(false);
  protected readonly isCompletedToday = signal(false);
  protected readonly loadError = signal('');
  protected readonly createdAtLabel = computed(() => {
    const createdAt = this.habit()?.createdAt;
    if (!createdAt) return '';

    const rawDate = createdAt.split('T', 1)[0];
    const date = new Date(`${rawDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return rawDate;

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? ''),
        distinctUntilChanged(),
        tap(() => {
          this.isLoading.set(true);
          this.habit.set(null);
          this.isNotFound.set(false);
          this.loadError.set('');
        }),
        switchMap((id) =>
          this.habitService.getHabit(id).pipe(
            catchError((error: unknown) => {
              this.isLoading.set(false);
              if (error instanceof HttpErrorResponse && error.status === 404) {
                this.isNotFound.set(true);
              } else {
                this.loadError.set('No se pudo cargar este hábito.');
              }
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((habit) => {
        this.habit.set(habit);
        this.isLoading.set(false);
      });
  }

  protected markCompletedToday(): void {
    this.isCompletedToday.set(true);
  }
}
