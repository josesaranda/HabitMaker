import { Directive } from '@angular/core';

@Directive({
  selector: 'a[hmLink]',
  standalone: true,
  host: {
    class:
      'text-link underline-offset-4 transition-colors hover:text-link-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-focus',
  },
})
export class HabitMakerUILink {}
