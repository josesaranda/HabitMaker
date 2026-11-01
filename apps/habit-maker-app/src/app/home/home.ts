import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  HabitMakerUIButton,
  HabitMakerUIModal,
} from '@habit-maker/habit-maker-ui';
import { finalize } from 'rxjs';
import { HabitCard } from '../habit-card/habit-card';
import { Habit, HabitService } from '../habits/habit.service';
import { NewHabit } from '../new-habit/new-habit';

@Component({
  imports: [HabitMakerUIButton, HabitMakerUIModal, HabitCard, NewHabit],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly habitService = inject(HabitService);

  protected readonly habits = signal<Habit[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal('');
  protected readonly hasHabits = computed(() => this.habits().length > 0);

  ngOnInit(): void {
    this.loadHabits();
  }

  protected refreshHabits(): void {
    this.loadHabits();
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
