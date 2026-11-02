import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitMakerUIBrand } from '../habit-maker-ui-brand/habit-maker-ui-brand';

@Component({
  selector: 'hm-navbar',
  standalone: true,
  imports: [HabitMakerUIBrand, RouterLink],
  templateUrl: './habit-maker-ui-navbar.html',
  styleUrl: './habit-maker-ui-navbar.css',
})
export class HabitMakerUINavbar {
  brandLink = input('/');
  brandLabel = input('HabitMaker, home');
  navigationLabel = input('Main navigation');
}
