import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIDaySelector } from './habit-maker-ui-day-selector';
import type { HabitMakerUIDaySelectorDay } from './habit-maker-ui-day-selector';

const localeDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const days = createDays();

const meta: Meta<HabitMakerUIDaySelector> = {
  title: 'Components/Day Selector',
  component: HabitMakerUIDaySelector,
  decorators: [moduleMetadata({ imports: [HabitMakerUIDaySelector] })],
};

export default meta;
type Story = StoryObj<HabitMakerUIDaySelector>;

export const Playground: Story = {
  args: {
    days,
    localeDays,
    showNavigation: true,
    dayToggleEnabled: true,
    dayToggleDisabled: false,
    canNavigateNext: true,
    previousLabel: 'Show previous days',
    nextLabel: 'Show next days',
  },
  argTypes: {
    localeDays: { control: 'object' },
    showNavigation: { control: 'boolean' },
    dayToggleEnabled: { control: 'boolean' },
    dayToggleDisabled: { control: 'boolean' },
    canNavigateNext: { control: 'boolean' },
    previousLabel: { control: 'text' },
    nextLabel: { control: 'text' },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-36 rounded-xl bg-[#172f2b] p-6 text-white">
        <habit-maker-ui-day-selector
          [days]="days"
          [localeDays]="localeDays"
          [showNavigation]="showNavigation"
          [dayToggleEnabled]="dayToggleEnabled"
          [dayToggleDisabled]="dayToggleDisabled"
          [canNavigateNext]="canNavigateNext"
          [previousLabel]="previousLabel"
          [nextLabel]="nextLabel"
        />
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { days, localeDays },
    template: `
      <div class="grid max-w-xl gap-6 rounded-xl bg-[#172f2b] p-6 text-white">
        <habit-maker-ui-day-selector
          [days]="days"
          [localeDays]="localeDays"
        />
        <habit-maker-ui-day-selector
          [days]="days"
          [localeDays]="localeDays"
          [showNavigation]="true"
          [dayToggleDisabled]="true"
          previousLabel="Previous week"
          nextLabel="Next week"
        />
      </div>
    `,
  }),
};

function createDays(): HabitMakerUIDaySelectorDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 13 }, (_, index) => {
    const offset = index - 9;
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dateString = toLocalDate(date);
    return {
      date: dateString,
      dayOfMonth: date.getDate(),
      completed: [-8, -6, -4, -1].includes(offset),
      offset,
      buffer: index < 3 || index > 9,
      entering: false,
      disabled: offset > 0,
      ariaLabel: `Toggle completion for ${date.toDateString()}`,
    };
  });
}

function toLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
