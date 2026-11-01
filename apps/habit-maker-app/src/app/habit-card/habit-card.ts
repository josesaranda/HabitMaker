import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitCompletionStatus, HabitService } from '../habits/habit.service';

@Component({
  imports: [RouterLink],
  selector: 'app-habit-card',
  templateUrl: './habit-card.html',
  host: { class: 'block w-full' },
})
export class HabitCard {
  private readonly habitService = inject(HabitService);
  id = input.required<string>();
  name = input.required<string>();
  startedAt = input.required<string>();
  private readonly today = signal(new Date());
  private readonly completions = signal<Record<string, boolean>>({});
  protected readonly completionError = signal(false);

  private readonly calendarDays = computed(() => {
    const weekdayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const today = new Date(this.today());
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const offset = index - 3;
      const date = new Date(today);
      date.setDate(today.getDate() + offset);

      return {
        label: weekdayLabels[date.getDay()],
        dayOfMonth: date.getDate(),
        date: this.toLocalDate(date),
        offset,
      };
    });
  });

  protected readonly days = computed(() =>
    this.calendarDays().map((day) => ({
      ...day,
      completed: this.completions()[day.date] ?? false,
    })),
  );

  protected readonly startedAtLabel = computed(() => {
    const rawDate = this.startedAt().split('T', 1)[0];
    const date = new Date(`${rawDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) return rawDate;

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  });

  constructor() {
    effect((onCleanup) => {
      const habitId = this.id();
      const dates = this.calendarDays().map(({ date }) => date);
      this.completions.set({});
      this.completionError.set(false);

      const subscription = this.habitService
        .getCompletionsForDates(habitId, dates)
        .subscribe({
          next: (completions) => this.setCompletions(completions),
          error: () => this.completionError.set(true),
        });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  private setCompletions(completions: HabitCompletionStatus[]): void {
    this.completions.set(
      Object.fromEntries(
        completions.map(({ date, completed }) => [date, completed]),
      ),
    );
  }

  private toLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
