import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIButtonDay } from './habit-maker-ui-button-day';

const meta: Meta<HabitMakerUIButtonDay> = {
  title: 'Components/Button Day',
  component: HabitMakerUIButtonDay,
  decorators: [moduleMetadata({ imports: [HabitMakerUIButtonDay] })],
};

export default meta;
type Story = StoryObj<HabitMakerUIButtonDay>;

export const Playground: Story = {
  args: {
    weekday: 'M',
    dayOfMonth: 13,
    ariaLabel: 'Mark Monday, October 13 as complete',
    state: 'default',
    selected: false,
    today: false,
    disabled: false,
    interactive: true,
  },
  argTypes: {
    state: {
      control: 'select',
      options: [
        'default',
        'hover',
        'focus',
        'active',
        'selected',
        'disabled',
        'today',
      ],
    },
    weekday: { control: 'text' },
    dayOfMonth: { control: 'text' },
    selected: { control: 'boolean' },
    today: { control: 'boolean' },
    disabled: { control: 'boolean' },
    interactive: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-36 rounded-xl bg-[#172f2b] p-8 text-white">
        <habit-maker-ui-button-day
          [weekday]="weekday"
          [dayOfMonth]="dayOfMonth"
          [ariaLabel]="ariaLabel"
          [state]="state"
          [selected]="selected"
          [today]="today"
          [disabled]="disabled"
          [interactive]="interactive"
        />
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div class="flex flex-wrap items-start gap-6 rounded-xl bg-[#172f2b] p-8 text-white">
        <habit-maker-ui-button-day weekday="M" [dayOfMonth]="10" state="default" ariaLabel="Monday, day 10" />
        <habit-maker-ui-button-day weekday="T" [dayOfMonth]="11" state="hover" ariaLabel="Tuesday, day 11" />
        <habit-maker-ui-button-day weekday="W" [dayOfMonth]="12" state="focus" ariaLabel="Wednesday, day 12" />
        <habit-maker-ui-button-day weekday="T" [dayOfMonth]="13" state="active" ariaLabel="Thursday, day 13" />
        <habit-maker-ui-button-day weekday="F" [dayOfMonth]="14" state="selected" ariaLabel="Friday, day 14, complete" />
        <habit-maker-ui-button-day weekday="S" [dayOfMonth]="15" state="disabled" ariaLabel="Saturday, day 15, unavailable" />
        <habit-maker-ui-button-day weekday="S" [dayOfMonth]="16" state="today" ariaLabel="Today, Sunday, day 16" />
      </div>
    `,
  }),
};
