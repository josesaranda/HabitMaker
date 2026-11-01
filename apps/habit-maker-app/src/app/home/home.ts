import { Component } from '@angular/core';
import {
  HabitMakerUIButton,
  HabitMakerUIModal,
} from '@habit-maker/habit-maker-ui';
import { NewHabit } from '../new-habit/new-habit';

@Component({
  imports: [HabitMakerUIButton, HabitMakerUIModal, NewHabit],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
