import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

@Component({
  selector: 'habit-maker-ui-header',
  standalone: true,
  imports: [HabitMakerUIIcon, RouterLink],
  templateUrl: './habit-maker-ui-header.html',
  styleUrl: './habit-maker-ui-header.css',
})
export class HabitMakerUIHeader {
  backNavigation = input<string | undefined>();
  backLabel = input('Back to previous page');
  backTitle = input('Back');
}
