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
          '<habit-maker-ui-badge variant="secondary">Current</habit-maker-ui-badge>',
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
    template:
      '<habit-maker-ui-badge [variant]="variant">Este dispositivo</habit-maker-ui-badge>',
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: .75rem;">
        <habit-maker-ui-badge variant="default">Default</habit-maker-ui-badge>
        <habit-maker-ui-badge variant="secondary">Secondary</habit-maker-ui-badge>
        <habit-maker-ui-badge variant="destructive">Destructive</habit-maker-ui-badge>
        <habit-maker-ui-badge variant="outline">Outline</habit-maker-ui-badge>
        <habit-maker-ui-badge variant="ghost">Ghost</habit-maker-ui-badge>
        <habit-maker-ui-badge variant="link">Link</habit-maker-ui-badge>
      </div>
    `,
  }),
};
