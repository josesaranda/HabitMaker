import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { HabitMakerUIButton } from '../habit-maker-ui-button/habit-maker-ui-button';
import { HabitMakerUIButtonIcon } from '../habit-maker-ui-button-icon/habit-maker-ui-button-icon';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';
import { HabitMakerUIHeader } from './habit-maker-ui-header';
import { HabitMakerUIHeaderOutlet } from './habit-maker-ui-header-outlet';

const meta: Meta<HabitMakerUIHeaderOutlet> = {
  title: 'Navigation/Header Outlet',
  component: HabitMakerUIHeaderOutlet,
  decorators: [
    moduleMetadata({
      imports: [
        HabitMakerUIButton,
        HabitMakerUIButtonIcon,
        HabitMakerUIHeader,
        HabitMakerUIIcon,
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj<HabitMakerUIHeaderOutlet>;

export const Playground: Story = {
  args: {
    title: 'Your habits',
    backNavigation: '/home',
  },
  argTypes: {
    title: { control: 'text' },
    backNavigation: { control: 'text' },
  },
  render: (args) => ({
    props: args,
    template: `
      <habit-maker-ui-header [backNavigation]="backNavigation" titleId="story-title">
        {{ title }}
      </habit-maker-ui-header>
      <habit-maker-ui-header-outlet />
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <habit-maker-ui-header backNavigation="/home" titleId="settings-title">
        Account settings
        <button hmButton type="button">Save changes</button>
        <button hmButtonIcon="secondary" aria-label="Settings" type="button">
          <habit-maker-ui-icon name="settings" />
        </button>
      </habit-maker-ui-header>
      <habit-maker-ui-header-outlet />
    `,
  }),
};
