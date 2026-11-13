import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { HabitMakerUIBrand } from '@habit-maker/habit-maker-ui';
import { HabitCard } from '../habit-card';

@Component({
  selector: 'app-auth-story',
  imports: [HabitMakerUIBrand, HabitCard, RouterLink, TranslocoPipe],
  templateUrl: './auth-story.html',
})
export class AuthStory {
  protected readonly previewCompletedDayOffsets = signal([-5, -3, -2, -1]);
}
