import { Directive, input } from '@angular/core';

export type HabitMakerUIInputVariant = 'default' | 'error';

function normalizeInputVariant(value: string): HabitMakerUIInputVariant {
  return value === 'error' ? 'error' : 'default';
}

@Directive({
  selector: 'input[hmInput]',
  standalone: true,
  host: {
    class: 'hm-input',
    '[class.hm-input--error]': 'hmInput() === "error"',
  },
})
export class HabitMakerUIInput {
  hmInput = input<HabitMakerUIInputVariant, string>('default', {
    alias: 'hmInput',
    transform: normalizeInputVariant,
  });
}
