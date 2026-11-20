import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import {
  HabitMakerUIText,
  type HabitMakerUITextVariant,
} from './habit-maker-ui-text';

const meta: Meta<HabitMakerUIText> = {
  title: 'Typography/Text',
  component: HabitMakerUIText,
  parameters: {
    docs: {
      description: {
        component: [
          'Apply `hmText` to any element to use the shared typography styles.',
          '',
          '```html',
          '<p hmText="body">Body text</p>',
          '<h1 hmText="heading">Heading text</h1>',
          '```',
        ].join('\n'),
      },
    },
  },
  decorators: [moduleMetadata({ imports: [HabitMakerUIText] })],
};

export default meta;
type Story = StoryObj<HabitMakerUIText>;

const variants: HabitMakerUITextVariant[] = [
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
  'heading-fluid-sm',
  'caption',
  'caption-xs',
  'caption-2xs',
  'overline',
  'code',
];

export const Playground: Story = {
  args: { hmText: 'body' },
  argTypes: {
    hmText: {
      control: 'select',
      options: variants,
    },
  },
  render: (args) => ({
    props: args,
    template:
      '<p [hmText]="hmText">The quick brown fox jumps over the lazy dog.</p>',
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; gap: 1.25rem;">
        ${variants
          .map(
            (variant) =>
              `<div style="display: grid; gap: 0.25rem;"><span style="font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary);">${variant}:</span><p hmText="${variant}">The quick brown fox jumps over the lazy dog.</p></div>`,
          )
          .join('\n        ')}
      </div>
    `,
  }),
};
