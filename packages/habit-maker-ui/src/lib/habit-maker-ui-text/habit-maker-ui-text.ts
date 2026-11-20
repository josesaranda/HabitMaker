import { Directive, input } from '@angular/core';

export type HabitMakerUITextVariant =
  | 'body'
  | 'body-xs'
  | 'body-sm'
  | 'body-md'
  | 'body-lg'
  | 'body-xl'
  | 'body-fluid'
  | 'heading'
  | 'heading-xs'
  | 'heading-sm'
  | 'heading-md'
  | 'heading-lg'
  | 'heading-xl'
  | 'heading-fluid'
  | 'caption'
  | 'overline'
  | 'code';

const TEXT_VARIANTS: readonly HabitMakerUITextVariant[] = [
  'body',
  'body-xs',
  'body-sm',
  'body-md',
  'body-lg',
  'body-xl',
  'body-fluid',
  'heading',
  'heading-xs',
  'heading-sm',
  'heading-md',
  'heading-lg',
  'heading-xl',
  'heading-fluid',
  'caption',
  'overline',
  'code',
];

function normalizeTextVariant(value: string): HabitMakerUITextVariant {
  return (TEXT_VARIANTS as readonly string[]).includes(value)
    ? (value as HabitMakerUITextVariant)
    : 'body';
}

@Directive({
  selector: '[hmText]',
  standalone: true,
  host: {
    class: 'hm-text',
    '[class.hm-text--body]': 'hmText() === "body"',
    '[class.hm-text--body-xs]': 'hmText() === "body-xs"',
    '[class.hm-text--body-sm]': 'hmText() === "body-sm"',
    '[class.hm-text--body-md]': 'hmText() === "body-md"',
    '[class.hm-text--body-lg]': 'hmText() === "body-lg"',
    '[class.hm-text--body-xl]': 'hmText() === "body-xl"',
    '[class.hm-text--body-fluid]': 'hmText() === "body-fluid"',
    '[class.hm-text--heading]': 'hmText() === "heading"',
    '[class.hm-text--heading-xs]': 'hmText() === "heading-xs"',
    '[class.hm-text--heading-sm]': 'hmText() === "heading-sm"',
    '[class.hm-text--heading-md]': 'hmText() === "heading-md"',
    '[class.hm-text--heading-lg]': 'hmText() === "heading-lg"',
    '[class.hm-text--heading-xl]': 'hmText() === "heading-xl"',
    '[class.hm-text--heading-fluid]': 'hmText() === "heading-fluid"',
    '[class.hm-text--caption]': 'hmText() === "caption"',
    '[class.hm-text--overline]': 'hmText() === "overline"',
    '[class.hm-text--code]': 'hmText() === "code"',
  },
})
export class HabitMakerUIText {
  hmText = input<HabitMakerUITextVariant, string>('body', {
    alias: 'hmText',
    transform: normalizeTextVariant,
  });
}
