import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIBadge } from './habit-maker-ui-badge';

const meta: Meta<HabitMakerUIBadge> = {
  title: 'Data Display/Badge',
  component: HabitMakerUIBadge,
  parameters: {
    docs: {
      description: {
        component: [
          'Use a badge for a short, non-interactive status or category label.',
          '',
          'Pass one of `default`, `secondary`, `destructive`, `outline`, `ghost`, or `link` to `variant`. It defaults to `default`; the label is projected as content.',
          '',
          '```html',
          '<hm-badge variant="secondary">Current</hm-badge>',
          '```',
        ].join('\n'),
      },
    },
  },
};
export default meta;

type Story = StoryObj<HabitMakerUIBadge>;

export const Playground: Story = {
  args: { variant: 'default' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'destructive',
        'outline',
        'ghost',
        'link',
      ],
    },
  },
  render: (args) => ({
    props: args,
    template: '<hm-badge [variant]="variant">Este dispositivo</hm-badge>',
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: .75rem;">
        <hm-badge variant="default">Default</hm-badge>
        <hm-badge variant="secondary">Secondary</hm-badge>
        <hm-badge variant="destructive">Destructive</hm-badge>
        <hm-badge variant="outline">Outline</hm-badge>
        <hm-badge variant="ghost">Ghost</hm-badge>
        <hm-badge variant="link">Link</hm-badge>
      </div>
    `,
  }),
};
