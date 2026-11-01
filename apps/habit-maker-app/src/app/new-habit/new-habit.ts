import { Component, computed, signal } from '@angular/core';
import {
  HabitMakerUIButton,
  HabitMakerUIInput,
} from '@habit-maker/habit-maker-ui';

@Component({
  selector: 'app-new-habit',
  imports: [HabitMakerUIButton, HabitMakerUIInput],
  templateUrl: './new-habit.html',
  styleUrl: './new-habit.css',
})
export class NewHabit {
  protected readonly habitName = signal('');
  protected readonly canStartHabit = computed(
    () => this.habitName().trim().length > 0,
  );

  protected updateHabitName(event: Event): void {
    this.habitName.set((event.target as HTMLInputElement).value);
  }
}
