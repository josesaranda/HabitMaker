import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HabitMakerUIBrand } from '@habit-maker/habit-maker-ui';

@Component({
  selector: 'app-auth-story',
  imports: [HabitMakerUIBrand, RouterLink],
  templateUrl: './auth-story.html',
})
export class AuthStory {}
