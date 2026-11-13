import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output } from '@angular/core';
import confetti from '@hiseb/confetti';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

export type HabitMakerUIButtonDayState =
  'default' | 'hover' | 'focus' | 'active' | 'selected' | 'disabled' | 'today';

@Component({
  selector: 'habit-maker-ui-button-day',
  imports: [HabitMakerUIIcon, NgTemplateOutlet],
  templateUrl: './habit-maker-ui-button-day.html',
  styleUrl: './habit-maker-ui-button-day.css',
  host: { class: 'hm-button-day__host' },
})
export class HabitMakerUIButtonDay {
  readonly weekday = input.required<string>();
  readonly dayOfMonth = input.required<number | string>();
  readonly ariaLabel = input('');
  readonly state = input<HabitMakerUIButtonDayState>('default');
  readonly selected = input(false);
  readonly today = input(false);
  readonly disabled = input(false);
  readonly interactive = input(true);
  readonly pressed = output<MouseEvent>();

  protected readonly isDisabled = () =>
    this.disabled() || this.state() === 'disabled';

  protected readonly isSelected = () =>
    this.selected() || this.state() === 'selected';

  protected readonly isToday = () => this.today() || this.state() === 'today';

  protected readonly forcedState = (state: HabitMakerUIButtonDayState) =>
    this.state() === state;

  protected emitPressed(event: MouseEvent): void {
    if (!this.isSelected()) {
      const { left, top, width, height } = (
        event.currentTarget as HTMLButtonElement
      ).getBoundingClientRect();
      confetti({
        position: { x: left + width / 2, y: top + height / 2 },
        color: ['#a8c5ad', '#e6b875', '#ffffff'],
      });
    }

    this.pressed.emit(event);
  }
}
