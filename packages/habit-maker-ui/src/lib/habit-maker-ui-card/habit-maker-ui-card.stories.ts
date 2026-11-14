import { applicationConfig, moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { HabitMakerUIDaySelector } from '../habit-maker-ui-day-selector/habit-maker-ui-day-selector';
import type { HabitMakerUIDaySelectorDay } from '../habit-maker-ui-day-selector/habit-maker-ui-day-selector';
import { HabitMakerUICard } from './habit-maker-ui-card';

const localeDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const days = createDays();

const meta: Meta<HabitMakerUICard> = {
  title: 'Components/Card',
  component: HabitMakerUICard,
  decorators: [
    moduleMetadata({ imports: [HabitMakerUICard, HabitMakerUIDaySelector] }),
    applicationConfig({ providers: [provideRouter([])] }),
  ],
};

export default meta;
type Story = StoryObj<HabitMakerUICard>;

export const Playground: Story = {
  args: {
    since: '2023-10-01',
    emoji: '📚',
    locale: 'en-US',
    link: '/habits/example',
    linkLabel: 'View habit details',
  },
  argTypes: {
    since: { control: 'text' },
    emoji: { control: 'text' },
    locale: { control: 'text' },
    link: { control: 'text' },
    linkLabel: { control: 'text' },
  },
  render: (args) => ({
    props: { ...args, days, localeDays },
    template: `
      <div class="max-w-xl rounded-xl bg-[#172f2b] p-6 text-white">
          <habit-maker-ui-card
            [since]="since"
          [emoji]="emoji"
          [locale]="locale"
          [link]="link"
          [linkLabel]="linkLabel"
        >
          <h2 hmCardTitle>Read for twenty minutes</h2>
          <habit-maker-ui-day-selector
            [days]="days"
            [localeDays]="localeDays"
            [showNavigation]="true"
          />
        </habit-maker-ui-card>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { days, localeDays },
    template: `
      <div class="grid max-w-xl gap-4 rounded-xl bg-[#172f2b] p-6 text-white">
        <habit-maker-ui-card since="2024-01-15" emoji="🚶">
          <h2 hmCardTitle>Take a morning walk</h2>
          <habit-maker-ui-day-selector
            [days]="days"
            [localeDays]="localeDays"
          />
        </habit-maker-ui-card>
        <habit-maker-ui-card since="2024-02-01" emoji="📓">
          <h2 hmCardTitle>Write in my journal</h2>
          <habit-maker-ui-day-selector
            [days]="days"
            [localeDays]="localeDays"
            [showNavigation]="true"
          />
        </habit-maker-ui-card>
        <habit-maker-ui-card
          since="2024-03-01"
          emoji="🧠"
          link="/habits/example"
          linkLabel="View habit details"
        >
          <h2 hmCardTitle>Practice a new language</h2>
          <habit-maker-ui-day-selector
            [days]="days"
            [localeDays]="localeDays"
          />
        </habit-maker-ui-card>
        <habit-maker-ui-card since="2024-04-01">
          <h2 hmCardTitle>Build a new habit</h2>
          <habit-maker-ui-day-selector
            [days]="days"
            [localeDays]="localeDays"
          />
        </habit-maker-ui-card>
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
