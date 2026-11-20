import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUINotification } from './habit-maker-ui-notification';

const meta: Meta<HabitMakerUINotification> = {
  title: 'Overlays/Notification',
  component: HabitMakerUINotification,
  parameters: {
    docs: {
      description: {
        component: [
          'Place `hm-notification` in the view that owns its content. Supply the required accessible `label`, optionally set `type`, `position`, and `duration`, and project the notification body inside it.',
          '',
          'Open it from a user action with `openFrom(triggerElement)`. The notification closes itself after `duration` milliseconds (3000 by default).',
          '',
          '```html',
          '<hm-notification #notification type="success" [label]="label" [position]="position" [duration]="duration">',
          '  Congratulations! You have completed a habit. Keep up the good work!',
          '</hm-notification>',
          '<button type="button" (click)="notification.openFrom(trigger)" #trigger>Open notification</button>',
          '```',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'success', 'warning', 'info', 'danger'],
    },
    duration: {
      control: 'number',
    },
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-right',
        'top-center',
        'bottom-left',
        'bottom-right',
        'bottom-center',
      ],
    },
  },
};
export default meta;

type Story = StoryObj<HabitMakerUINotification>;

export const Playground: Story = {
  args: {
    type: 'success',
    label: 'Habit completed',
    position: 'top-right',
    duration: 3000,
  },
  render: (args) => ({
    props: args,
    template: `
      <hm-notification #notification [type]="type" [label]="label" [position]="position" [duration]="duration">
        Congratulations! You have completed a habit. Keep up the good work!
      </hm-notification>
      <button type="button" (click)="notification.openFrom(trigger)" #trigger>Open notification</button>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <hm-notification #defaultNotification type="default" label="Default notification" position="top-right">
          This is a default notification without an icon.
        </hm-notification>
        <button type="button" (click)="defaultNotification.openFrom(defaultTrigger)" #defaultTrigger>Default</button>

        <hm-notification #successNotification type="success" label="Success notification" position="top-right">
          Congratulations! You have completed a habit.
        </hm-notification>
        <button type="button" (click)="successNotification.openFrom(successTrigger)" #successTrigger>Success</button>

        <hm-notification #warningNotification type="warning" label="Warning notification" position="top-right">
          Remember to complete your habit today.
        </hm-notification>
        <button type="button" (click)="warningNotification.openFrom(warningTrigger)" #warningTrigger>Warning</button>

        <hm-notification #infoNotification type="info" label="Info notification" position="top-right">
          Here is some helpful information.
        </hm-notification>
        <button type="button" (click)="infoNotification.openFrom(infoTrigger)" #infoTrigger>Info</button>

        <hm-notification #dangerNotification type="danger" label="Danger notification" position="top-right">
          Something went wrong. Please try again.
        </hm-notification>
        <button type="button" (click)="dangerNotification.openFrom(dangerTrigger)" #dangerTrigger>Danger</button>
      </div>
    `,
  }),
};
