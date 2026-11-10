import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { HabitMakerUIButton } from '../habit-maker-ui-button/habit-maker-ui-button';
import { HabitMakerUILink } from '../habit-maker-ui-link/habit-maker-ui-link';
import { HabitMakerUINavbar } from './habit-maker-ui-navbar';

const meta: Meta<HabitMakerUINavbar> = {
  title: 'Navigation/Navbar',
  component: HabitMakerUINavbar,
  parameters: {
    docs: {
      description: {
        component: [
          'Use `habit-maker-ui-navbar` as a navigation landmark. It renders the brand link and an accessible `<nav>` containing the projected links and actions.',
          '',
          '`brandLink` sets the destination for the brand; `brandLabel` and `navigationLabel` provide accessible names. Import `RouterLink` for in-app destinations and the shared link/button directives for projected actions.',
          '',
          '```html',
          '<habit-maker-ui-navbar',
          '  brandLink="/home"',
          '  brandLabel="HabitMaker home"',
          '  navigationLabel="Main navigation"',
          '>',
          '  <a hmLink routerLink="/habits">My habits</a>',
          '  <button hmButton="primary" type="button">Sign in</button>',
          '</habit-maker-ui-navbar>',
          '```',
        ].join('\n'),
      },
    },
  },
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
