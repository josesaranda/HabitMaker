import { Directive } from '@angular/core';

@Directive({
  selector: 'input[type="checkbox"][hmCheckbox]',
  standalone: true,
  host: {
    class: 'hm-checkbox',
  },
})
export class HabitMakerUICheckbox {}
