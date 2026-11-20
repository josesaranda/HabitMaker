import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

@Component({
  selector: 'hm-card',
  imports: [HabitMakerUIIcon, RouterLink],
  templateUrl: './habit-maker-ui-card.html',
  styleUrl: './habit-maker-ui-card.css',
  host: { class: 'hm-card__host' },
})
export class HabitMakerUICard {
  readonly since = input.required<string>();
  readonly emoji = input<string | null>(null);
  readonly locale = input('en-US');
  readonly link = input<string | null>(null);
  readonly linkLabel = input('View details');
  readonly streak = input<number | null>(null);
  readonly streakLabel = input<string | null>(null);

  protected readonly showStreak = computed(() => this.streak() !== null);

  protected readonly dateTime = computed(() => this.since().split('T', 1)[0]);
  protected readonly formattedSinceDate = computed(() => {
    const date = new Date(`${this.dateTime()}T00:00:00`);
    if (Number.isNaN(date.getTime())) return this.dateTime();

    return new Intl.DateTimeFormat(this.locale(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  });
}
