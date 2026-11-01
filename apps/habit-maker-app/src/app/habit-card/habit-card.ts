import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-habit-card',
  imports: [],
  templateUrl: './habit-card.html',
  styleUrl: './habit-card.css',
})
export class HabitCard {
  name = input.required<string>();
  startedAt = input.required<string>();

  protected readonly startedAtLabel = computed(() => {
    const rawDate = this.startedAt();
    const date = new Date(`${rawDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) return rawDate;

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  });
}
