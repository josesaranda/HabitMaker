import { Component, computed, contentChild, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitMakerUIButton } from '../habit-maker-ui-button/habit-maker-ui-button';
import { HabitMakerUIButtonIcon } from '../habit-maker-ui-button-icon/habit-maker-ui-button-icon';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

@Component({
  selector: 'habit-maker-ui-header',
  standalone: true,
  imports: [HabitMakerUIIcon, RouterLink],
  templateUrl: './habit-maker-ui-header.html',
  styleUrl: './habit-maker-ui-header.css',
})
export class HabitMakerUIHeader {
  private readonly button = contentChild(HabitMakerUIButton);
  private readonly buttonIcon = contentChild(HabitMakerUIButtonIcon);

  backNavigation = input<string | undefined>();
  backLabel = input('Back to previous page');
  backTitle = input('Back');

  protected readonly hasActions = computed(
    () => this.button() !== undefined || this.buttonIcon() !== undefined,
  );
}
