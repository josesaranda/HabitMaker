import { Component } from '@angular/core';
import { HabitMakerUILink } from '@org/habit-maker-ui';

@Component({
  imports: [HabitMakerUILink],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'HabitMakerApp';
}
