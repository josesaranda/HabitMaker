import { Component } from '@angular/core';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

@Component({
  selector: 'habit-maker-ui-brand',
  standalone: true,
  imports: [HabitMakerUIIcon],
  templateUrl: './habit-maker-ui-brand.html',
  styleUrl: './habit-maker-ui-brand.css',
})
export class HabitMakerUIBrand {}
