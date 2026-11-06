import { Component, input } from '@angular/core';

export type HabitMakerUIBadgeVariant =
  'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

function normalizeBadgeVariant(value: string): HabitMakerUIBadgeVariant {
  switch (value) {
    case 'secondary':
    case 'destructive':
    case 'outline':
    case 'ghost':
    case 'link':
      return value;
    default:
      return 'default';
  }
}

@Component({
  selector: 'habit-maker-ui-badge',
  host: {
    class: 'hm-badge',
    '[class.hm-badge--default]': 'variant() === "default"',
    '[class.hm-badge--secondary]': 'variant() === "secondary"',
    '[class.hm-badge--destructive]': 'variant() === "destructive"',
    '[class.hm-badge--outline]': 'variant() === "outline"',
    '[class.hm-badge--ghost]': 'variant() === "ghost"',
    '[class.hm-badge--link]': 'variant() === "link"',
  },
  templateUrl: './habit-maker-ui-badge.html',
  styleUrl: './habit-maker-ui-badge.css',
})
export class HabitMakerUIBadge {
  readonly variant = input<HabitMakerUIBadgeVariant, string>('default', {
    transform: normalizeBadgeVariant,
  });
}
