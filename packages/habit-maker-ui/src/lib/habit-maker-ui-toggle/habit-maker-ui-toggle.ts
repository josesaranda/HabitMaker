import { Directive } from '@angular/core';

@Directive({
  selector: 'input[type="checkbox"][hmToggle]',
  standalone: true,
  host: {
    class: 'hm-toggle',
  },
})
export class HabitMakerUIToggle {}
