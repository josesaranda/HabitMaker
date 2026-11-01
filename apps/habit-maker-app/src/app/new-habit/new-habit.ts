import { Component, computed, inject, output, signal } from '@angular/core';
import {
  HabitMakerUIButton,
  HabitMakerUIInput,
} from '@habit-maker/habit-maker-ui';
import { finalize } from 'rxjs';
import { HabitService } from '../habits/habit.service';

@Component({
  selector: 'app-new-habit',
  imports: [HabitMakerUIButton, HabitMakerUIInput],
  templateUrl: './new-habit.html',
  styleUrl: './new-habit.css',
})
export class NewHabit {
  private readonly habitService = inject(HabitService);
  protected readonly habitName = signal('');
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  readonly habitCreated = output<void>();
  protected readonly canStartHabit = computed(
    () => this.habitName().trim().length > 0 && !this.isSubmitting(),
  );

  protected updateHabitName(event: Event): void {
    this.habitName.set((event.target as HTMLInputElement).value);
  }

  protected createHabit(event: Event): void {
    event.preventDefault();
    const name = this.habitName().trim();
    if (!name || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.habitService
      .createHabit(name)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.habitName.set('');
          this.habitCreated.emit();
        },
        error: () =>
          this.errorMessage.set(
            'No se pudo guardar el hábito. Inténtalo de nuevo.',
          ),
      });
  }
}
