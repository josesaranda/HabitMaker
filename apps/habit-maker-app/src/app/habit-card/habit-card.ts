import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-habit-card',
  templateUrl: './habit-card.html',
  styleUrl: './habit-card.css',
})
export class HabitCard {
  name = input.required<string>();
  startedAt = input.required<string>();

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
