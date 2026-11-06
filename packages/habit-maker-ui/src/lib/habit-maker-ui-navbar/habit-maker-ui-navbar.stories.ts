import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { HabitMakerUIButton } from '../habit-maker-ui-button/habit-maker-ui-button';
import { HabitMakerUILink } from '../habit-maker-ui-link/habit-maker-ui-link';
import { HabitMakerUINavbar } from './habit-maker-ui-navbar';

const meta: Meta<HabitMakerUINavbar> = {
  title: 'Navigation/Navbar',
  component: HabitMakerUINavbar,
  decorators: [
    moduleMetadata({ imports: [HabitMakerUIButton, HabitMakerUILink] }),
  ],
};
export default meta;

type Story = StoryObj<HabitMakerUINavbar>;

export const Playground: Story = {
  args: {
    brandLink: '/',
    brandLabel: 'HabitMaker home',
    navigationLabel: 'Main navigation',
  },
  render: (args) => ({
    props: args,
    template: `
      <habit-maker-ui-navbar
        [brandLink]="brandLink"
        [brandLabel]="brandLabel"
        [navigationLabel]="navigationLabel"
      >
        <a hmLink routerLink="/habits">Habits</a>
        <button hmButton type="button">Sign in</button>
      </habit-maker-ui-navbar>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; gap: 1.5rem;">
        <habit-maker-ui-navbar>
          <a hmLink routerLink="/habits">My habits</a>
          <a hmLink routerLink="/about">About</a>
        </habit-maker-ui-navbar>
        <habit-maker-ui-navbar class="app-navbar" brandLabel="Compact HabitMaker navigation">
          <button hmButton type="button">Create account</button>
        </habit-maker-ui-navbar>
      </div>
    `,
  }),
};
