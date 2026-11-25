import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUICalendar } from './habit-maker-ui-calendar';

function toLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createCompletedDates(): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates: string[] = [];

  for (let offset = -16; offset <= -1; offset += 2) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    dates.push(toLocalDate(date));
  }

  return dates;
}

const completedDates = createCompletedDates();

const meta: Meta<HabitMakerUICalendar> = {
  title: 'Components/Calendar',
  component: HabitMakerUICalendar,
  decorators: [moduleMetadata({ imports: [HabitMakerUICalendar] })],
};

export default meta;
type Story = StoryObj<HabitMakerUICalendar>;

export const Playground: Story = {
  args: {
    completedDates,
    locale: 'en',
    localeDays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    dayToggleEnabled: true,
    dayToggleDisabled: false,
    canNavigateNext: true,
    canNavigatePrevious: true,
    previousLabel: 'Show previous month',
    nextLabel: 'Show next month',
  },
  argTypes: {
    locale: { control: 'text' },
    localeDays: { control: 'object' },
    dayToggleEnabled: { control: 'boolean' },
    dayToggleDisabled: { control: 'boolean' },
    canNavigateNext: { control: 'boolean' },
    canNavigatePrevious: { control: 'boolean' },
    previousLabel: { control: 'text' },
    nextLabel: { control: 'text' },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="min-h-96 rounded-xl bg-[#172f2b] p-6 text-white">
        <hm-calendar
          [completedDates]="completedDates"
          [locale]="locale"
          [localeDays]="localeDays"
          [dayToggleEnabled]="dayToggleEnabled"
          [dayToggleDisabled]="dayToggleDisabled"
          [canNavigateNext]="canNavigateNext"
          [canNavigatePrevious]="canNavigatePrevious"
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
    props: { completedDates },
    template: `
      <div class="grid max-w-xl gap-6 rounded-xl bg-[#172f2b] p-6 text-white">
        <hm-calendar [completedDates]="completedDates" />
        <hm-calendar [completedDates]="completedDates" [dayToggleDisabled]="true" />
      </div>
    `,
  }),
};
