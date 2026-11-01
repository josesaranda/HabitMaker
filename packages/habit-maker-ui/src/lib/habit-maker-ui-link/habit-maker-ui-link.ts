import { Directive } from '@angular/core';

@Directive({
  selector: 'a[hmLink]',
  standalone: true,
  host: {
    class: 'hm-link',
  },
})
export class HabitMakerUILink {}
