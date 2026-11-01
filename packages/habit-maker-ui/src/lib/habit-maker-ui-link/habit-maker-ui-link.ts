import { Directive } from '@angular/core';

@Directive({
  selector: 'a[hmLink]',
  standalone: true,
  host: {
    class:
      'text-green-950 underline-offset-4 transition-colors hover:text-green-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600',
  },
})
export class HabitMakerUILink {}
