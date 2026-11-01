import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'app-habit-card',
  templateUrl: './habit-card.html',
  host: { class: 'block w-full' },
})
export class HabitCard {
  name = input.required<string>();
  startedAt = input.required<string>();
  private readonly today = signal(new Date());

  protected readonly days = computed(() => {
    const weekdayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const today = new Date(this.today());
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const offset = index - 3;
      const date = new Date(today);
      date.setDate(today.getDate() + offset);

      return {
        label: weekdayLabels[date.getDay()],
        offset,
      };
    });
  });

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
}
