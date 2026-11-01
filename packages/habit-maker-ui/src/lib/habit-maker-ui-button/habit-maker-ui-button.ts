import { Directive, input } from '@angular/core';

export type HabitMakerUIButtonVariant = 'primary' | 'secondary';

function normalizeButtonVariant(value: string): HabitMakerUIButtonVariant {
  return value === 'secondary' ? 'secondary' : 'primary';
}

@Directive({
  selector: 'button[hmButton], a[hmButton]',
  standalone: true,
  host: {
    class: 'hm-button',
    '[class.hm-button--primary]': 'hmButton() === "primary"',
    '[class.hm-button--secondary]': 'hmButton() === "secondary"',
  },
})
export class HabitMakerUIButton {
  hmButton = input<HabitMakerUIButtonVariant, string>('primary', {
    alias: 'hmButton',
    transform: normalizeButtonVariant,
  });
}
