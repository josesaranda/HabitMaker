import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitMakerUIBrand } from '@habit-maker/habit-maker-ui';
import { HabitCard } from '../habit-card/habit-card';

@Component({
  selector: 'app-auth-story',
  imports: [HabitMakerUIBrand, HabitCard, RouterLink],
  templateUrl: './auth-story.html',
})
export class AuthStory {}
