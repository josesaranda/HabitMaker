import { Directive, input } from '@angular/core';

@Directive({
  selector: 'button[hmButtonIcon], a[hmButtonIcon]',
  standalone: true,
  host: {
    class: 'hm-button-icon',
    '[class.hm-button-icon--primary]': 'hmButtonIcon() === "primary"',
    '[class.hm-button-icon--secondary]': 'hmButtonIcon() === "secondary"',
    '[class.hm-button-icon--small]': 'size() === "small"',
    '[class.hm-button-icon--normal]': 'size() === "normal"',
    '[class.hm-button-icon--big]': 'size() === "big"',
  },
})
export class HabitMakerUIButtonIcon {
  hmButtonIcon = input<HabitMakerUIButtonIconVariant, string>('primary', {
    alias: 'hmButtonIcon',
    transform: normalizeVariant,
  });
  size = input<HabitMakerUIButtonIconSize, string>('normal', {
    transform: normalizeSize,
  });
}

export type HabitMakerUIButtonIconVariant = 'primary' | 'secondary';
export type HabitMakerUIButtonIconSize = 'small' | 'normal' | 'big';

function normalizeVariant(value: string): HabitMakerUIButtonIconVariant {
  return value === 'secondary' ? 'secondary' : 'primary';
}

function normalizeSize(value: string): HabitMakerUIButtonIconSize {
  if (value === 'small' || value === 'big') return value;
  return 'normal';
}
