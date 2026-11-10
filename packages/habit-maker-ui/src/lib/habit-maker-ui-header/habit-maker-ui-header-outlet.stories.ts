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
  parameters: {
    docs: {
      description: {
        component: [
          'Projects the content of the active `HabitMakerUIHeader` outside the routed view.',
          '',
          '### 1. Add the outlet to the application root',
          '',
          'Import and render one outlet above the router outlet. The header outlet stays mounted while routes change.',
          '',
          '```ts',
          "import { Component } from '@angular/core';",
          "import { RouterOutlet } from '@angular/router';",
          "import { HabitMakerUIHeaderOutlet } from '@habit-maker/habit-maker-ui';",
          '',
          '@Component({',
          '  imports: [HabitMakerUIHeaderOutlet, RouterOutlet],',
          '  template: `',
          '    <habit-maker-ui-header-outlet />',
          '    <router-outlet />',
          '  `,',
          '})',
          'export class App {}',
          '```',
          '',
          '### 2. Declare a header in a routed page',
          '',
          'Import `HabitMakerUIHeader` in the page and write the title and optional actions directly in its content. The component registers and clears itself as routes activate and deactivate.',
          '',
          '```html',
          '<habit-maker-ui-header backNavigation="/home">',
          '  Account settings',
          '  <button hmButton="primary" type="button">Save changes</button>',
          '</habit-maker-ui-header>',
          '```',
          '',
          'The outlet is required once in the root layout; do not add an outlet to each page. The header component and outlet share the library portal service automatically.',
        ].join('\n'),
      },
    },
  },
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
