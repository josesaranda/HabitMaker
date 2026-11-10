import { Component, input } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { HabitMakerUIButton } from '../habit-maker-ui-button/habit-maker-ui-button';
import { HabitMakerUIButtonIcon } from '../habit-maker-ui-button-icon/habit-maker-ui-button-icon';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';
import { HabitMakerUIHeaderOutlet } from './habit-maker-ui-header-outlet';
import { HabitMakerUIHeaderPortalService } from './habit-maker-ui-header-portal.service';
import { HabitMakerUIHeader } from './habit-maker-ui-header';

@Component({
  selector: 'habit-maker-ui-header-story-variant',
  standalone: true,
  imports: [
    HabitMakerUIButton,
    HabitMakerUIButtonIcon,
    HabitMakerUIHeader,
    HabitMakerUIHeaderOutlet,
    HabitMakerUIIcon,
  ],
  providers: [HabitMakerUIHeaderPortalService],
  template: `
    <habit-maker-ui-header [backNavigation]="backNavigation()">
      {{ title() }}
      <button
        hmButton
        type="button"
        [style.display]="showActions() ? null : 'none'"
      >
        Create habit
      </button>
      <button
        hmButtonIcon="secondary"
        aria-label="Settings"
        type="button"
        [style.display]="showActions() ? null : 'none'"
      >
        <habit-maker-ui-icon name="settings" />
      </button>
    </habit-maker-ui-header>
    <habit-maker-ui-header-outlet />
  `,
})
class HeaderStoryVariant {
  readonly title = input.required<string>();
  readonly backNavigation = input<string | undefined>();
  readonly showActions = input(false);
}

const meta: Meta<HabitMakerUIHeader> = {
  title: 'Navigation/Header',
  component: HabitMakerUIHeader,
  parameters: {
    docs: {
      description: {
        component: [
          'Declare the page title and optional back link or actions directly inside `habit-maker-ui-header`. Its content is projected into the shared root header outlet when the route becomes active.',
          '',
          'Add one `HabitMakerUIHeaderOutlet` to the application root, outside the router outlet. See the **Header Outlet** documentation for the root setup.',
          '',
          '`backNavigation` configures the back link. Use `backLabel` and `backTitle` to provide accessible text; `titleId` assigns an ID to the rendered heading for relationships such as `aria-labelledby`.',
          '',
          'Actions are projected from buttons or links using `hmButton` or `hmButtonIcon`:',
          '',
          '```html',
          '<habit-maker-ui-header',
          '  backNavigation="/home"',
          '  backLabel="Back to habits"',
          '  titleId="settings-title"',
          '>',
          '  Account settings',
          '  <button hmButton="primary" type="button">Save changes</button>',
          '</habit-maker-ui-header>',
          '```',
        ].join('\n'),
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        HabitMakerUIButton,
        HabitMakerUIButtonIcon,
        HabitMakerUIHeaderOutlet,
        HabitMakerUIIcon,
        HeaderStoryVariant,
      ],
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
    titleId: 'header-title',
  },
  render: (args) => ({
    props: args,
    template: `
      <habit-maker-ui-header
        [backNavigation]="backNavigation"
        [backLabel]="backLabel"
        [backTitle]="backTitle"
        [titleId]="titleId"
      >
        Weekly overview
        <button hmButton type="button">New habit</button>
      </habit-maker-ui-header>
      <habit-maker-ui-header-outlet />
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; gap: 1.5rem;">
        <habit-maker-ui-header-story-variant title="Overview" />
        <habit-maker-ui-header-story-variant title="Habit details" backNavigation="/habits" />
        <habit-maker-ui-header-story-variant title="With actions" [showActions]="true" />
        <habit-maker-ui-header-story-variant title="Back and actions" backNavigation="/habits" [showActions]="true" />
      </div>
    `,
  }),
};
