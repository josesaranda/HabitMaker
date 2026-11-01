import { Component } from '@angular/core';
import { HabitMakerUIButton, HabitMakerUILink } from '@org/habit-maker-ui';

@Component({
  imports: [HabitMakerUIButton, HabitMakerUILink],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'HabitMakerApp';
}
