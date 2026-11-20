import { Component, booleanAttribute, input, output } from '@angular/core';
import { HabitMakerUIButtonDay } from '../habit-maker-ui-button-day/habit-maker-ui-button-day';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';
import { HabitMakerUIText } from '../habit-maker-ui-text/habit-maker-ui-text';

@Component({
  selector: 'hm-card-compact',
  imports: [HabitMakerUIButtonDay, HabitMakerUIIcon, HabitMakerUIText],
  templateUrl: './habit-maker-ui-card-compact.html',
  styleUrl: './habit-maker-ui-card-compact.css',
  host: {
    class: 'hm-card-compact',
    '[class.hm-card-compact--selected]': 'selected()',
  },
})
export class HabitMakerUICardCompact {
  readonly emoji = input<string | null>(null);
  readonly selected = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly actionLabel = input('Toggle habit completion');
  readonly toggle = output<boolean>();

  protected emitToggle(): void {
    this.toggle.emit(!this.selected());
  }
}
