import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  HabitMakerUIButton,
  HabitMakerUIModal,
} from '@habit-maker/habit-maker-ui';
import { finalize } from 'rxjs';
import { HabitCard } from '../habit-card/habit-card';
import { BrowserService } from '../browser/browser.service';
import { Habit, HabitService } from '../habits/habit.service';
import { NewHabit } from '../new-habit/new-habit';
import { HomeHabitsResolveResult } from './home.resolver';

@Component({
  imports: [HabitMakerUIButton, HabitMakerUIModal, HabitCard, NewHabit],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly browserService = inject(BrowserService);
  private readonly route = inject(ActivatedRoute);
  private readonly habitService = inject(HabitService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly habits = signal<Habit[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly hasHabits = computed(() => this.habits().length > 0);

  ngOnInit(): void {
    this.browserService.setTitle('Mis hábitos');
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        const result = data['habitsResult'] as
          | HomeHabitsResolveResult
          | undefined;
        if (!result) return;

        this.habits.set(result.habits);
        this.loadError.set(
          result.hasError ? 'No se pudieron cargar tus hábitos.' : '',
        );
        this.isLoading.set(false);
      });
    this.habitService.habitCreated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadHabits());
  }

  private loadHabits(): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.habitService
      .getHabits()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (habits) => this.habits.set(habits),
        error: () => {
          this.habits.set([]);
          this.loadError.set('No se pudieron cargar tus hábitos.');
        },
      });
  }
}
