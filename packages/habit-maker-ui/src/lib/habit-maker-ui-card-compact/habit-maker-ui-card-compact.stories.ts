import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUICardCompact } from './habit-maker-ui-card-compact';

const meta: Meta<HabitMakerUICardCompact> = {
  title: 'Components/Card Compact',
  component: HabitMakerUICardCompact,
  decorators: [moduleMetadata({ imports: [HabitMakerUICardCompact] })],
};

export default meta;
type Story = StoryObj<HabitMakerUICardCompact>;

export const Playground: Story = {
  args: {
    emoji: '📚',
    selected: false,
    actionLabel: 'Toggle reading habit completion',
  },
  argTypes: {
    emoji: { control: 'text' },
    selected: { control: 'boolean' },
    actionLabel: { control: 'text' },
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <div style="max-width: 32rem; padding: 1.5rem;">
        <hm-card-compact
          [emoji]="emoji"
          [selected]="selected"
          [actionLabel]="actionLabel"
          (toggle)="selected = $event"
        >
          Read for twenty minutes
        </hm-card-compact>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; max-width: 32rem; gap: 1rem; padding: 1.5rem;">
        <hm-card-compact emoji="📚">
          Read for twenty minutes
        </hm-card-compact>
        <hm-card-compact emoji="🚶" selected>
          Take a morning walk
        </hm-card-compact>
        <hm-card-compact emoji="🧠">
          Practice a new language every day before breakfast
        </hm-card-compact>
        <hm-card-compact emoji="📓" selected>
          Write in my journal
        </hm-card-compact>
        <hm-card-compact>
          Build a new habit
        </hm-card-compact>
      </div>
    `,
  }),
};
