import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

@Component({
  selector: 'habit-maker-header',
  standalone: true,
  imports: [HabitMakerUIIcon, RouterLink],
  templateUrl: './habit-maker-header.html',
  styleUrl: './habit-maker-header.css',
})
export class HabitMakerHeader {
  backNavigation = input<string | undefined>();
}
