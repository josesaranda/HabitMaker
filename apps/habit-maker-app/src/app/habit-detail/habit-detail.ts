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
import { BrowserService } from '../browser/browser.service';
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
  private readonly browserService = inject(BrowserService);
  private readonly route = inject(ActivatedRoute);
  private readonly habitService = inject(HabitService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly habit = signal<Habit | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isNotFound = signal(false);
  protected readonly isCompletedToday = signal(false);
  protected readonly isSavingCompletion = signal(false);
  protected readonly completionError = signal('');
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
    this.browserService.setTitle('Detalle del hábito');
    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? ''),
        distinctUntilChanged(),
        tap(() => {
          this.isLoading.set(true);
          this.habit.set(null);
          this.isNotFound.set(false);
          this.loadError.set('');
          this.isCompletedToday.set(false);
          this.completionError.set('');
        }),
        switchMap((id) =>
          this.habitService.getHabit(id).pipe(
            switchMap((habit) =>
              this.habitService
                .getTodayCompletion(habit.id)
                .pipe(map((completion) => ({ habit, completion }))),
            ),
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
      .subscribe(({ habit, completion }) => {
        this.habit.set(habit);
        this.browserService.setTitle(`Hábito: ${habit.name}`);
        this.isCompletedToday.set(completion.completed);
        this.isLoading.set(false);
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
}
