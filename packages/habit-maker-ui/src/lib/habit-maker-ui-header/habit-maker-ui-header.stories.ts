import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { HabitMakerUIButton } from '../habit-maker-ui-button/habit-maker-ui-button';
import { HabitMakerUIButtonIcon } from '../habit-maker-ui-button-icon/habit-maker-ui-button-icon';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';
import { HabitMakerUIHeader } from './habit-maker-ui-header';

const meta: Meta<HabitMakerUIHeader> = {
  title: 'Navigation/Header',
  component: HabitMakerUIHeader,
  decorators: [
    moduleMetadata({
      imports: [HabitMakerUIButton, HabitMakerUIButtonIcon, HabitMakerUIIcon],
    }),
  ],
};
export default meta;

type Story = StoryObj<HabitMakerUIHeader>;

export const Playground: Story = {
  args: {
    backNavigation: '/habits',
    backLabel: 'Back to habits',
    backTitle: 'Back',
  },
  render: (args) => ({
    props: args,
    template: `
      <habit-maker-ui-header
        [backNavigation]="backNavigation"
        [backLabel]="backLabel"
        [backTitle]="backTitle"
      >
        Weekly overview
        <button hmButton type="button">New habit</button>
      </habit-maker-ui-header>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; gap: 1.5rem;">
        <habit-maker-ui-header>Overview</habit-maker-ui-header>
        <habit-maker-ui-header backNavigation="/habits">Habit details</habit-maker-ui-header>
        <habit-maker-ui-header>
          With actions
          <button hmButton type="button">Create</button>
        </habit-maker-ui-header>
        <habit-maker-ui-header backNavigation="/habits">
          Back and actions
          <button hmButtonIcon="secondary" aria-label="Settings" type="button"><habit-maker-ui-icon name="settings" /></button>
        </habit-maker-ui-header>
      </div>
    `,
  }),
};
