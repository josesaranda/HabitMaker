import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';
import { Habit } from '@habit-maker/habits-domain';
import { HabitService } from './habit.service';

@Injectable({ providedIn: 'root' })
export class HabitStore {
  private readonly habitService = inject(HabitService);
  private readonly destroyRef = inject(DestroyRef);

  readonly habits = signal<Habit[]>([]);
  readonly showArchived = signal(false);
  readonly hasArchived = signal(false);
  readonly hasLoadedHabits = signal(false);
  readonly loadError = signal('');

  load(includeArchived: boolean, onLoaded?: () => void): void {
    this.loadError.set('');
    forkJoin({
      habits: this.habitService
        .getHabits({ includeArchived })
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
          this.loadError.set('home.loadError');
        } else {
          this.habits.set(habits);
        }
        this.hasArchived.set(archived.count > 0);
        onLoaded?.();
      });
  }

  setShowArchived(value: boolean): void {
    this.showArchived.set(value);
  }
}
