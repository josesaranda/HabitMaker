import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIModal } from './habit-maker-ui-modal';
import { HabitMakerUIModalTitle } from './habit-maker-ui-modal-title';

const meta: Meta<HabitMakerUIModal> = {
  title: 'Overlays/Modal',
  component: HabitMakerUIModal,
  parameters: {
    docs: {
      description: {
        component: [
          'Place `habit-maker-ui-modal` in the view that owns the dialog content. Supply the required accessible `label`, optionally set `closeLabel`, and project the dialog body inside it.',
          '',
          'Open it from a user action with `openFrom(triggerElement)`. Call `close()` from dialog controls; the component animates the dialog and restores focus to its trigger.',
          '',
          'Optionally mark a heading with the `hmModalTitle` directive to lift it into the dialog header row, aligned with the close button.',
          '',
          '```html',
          '<habit-maker-ui-modal #details label="Habit details" closeLabel="Close details">',
          '  <h2 hmModalTitle>Habit details</h2>',
          '  <button type="button" (click)="details.close()">Done</button>',
          '</habit-maker-ui-modal>',
          '<button #trigger type="button" (click)="details.openFrom(trigger)">',
          '  Open details',
          '</button>',
          '```',
        ].join('\n'),
      },
    },
  },
};
export default meta;

type Story = StoryObj<HabitMakerUIModal>;

export const Playground: Story = {
  args: { label: 'Habit details', closeLabel: 'Close habit details' },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [HabitMakerUIModalTitle] },
    template: `
      <habit-maker-ui-modal #modal [label]="label" [closeLabel]="closeLabel">
        <h2 hmModalTitle>Take a moment to check in</h2>
        <p>Review your progress and decide what comes next.</p>
      </habit-maker-ui-modal>
      <button type="button" (click)="modal.openFrom(trigger)" #trigger>Open modal</button>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    moduleMetadata: { imports: [HabitMakerUIModalTitle] },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <habit-maker-ui-modal #details label="Habit details">
          <h2 hmModalTitle>Habit details</h2>
          <p>Review the details of your daily reading habit.</p>
        </habit-maker-ui-modal>
        <button type="button" (click)="details.openFrom(detailsTrigger)" #detailsTrigger>With title</button>

        <habit-maker-ui-modal #deleteDialog label="Delete habit confirmation">
          <h2 style="margin-top: 0;">Delete this habit?</h2>
          <p>This action cannot be undone.</p>
          <button type="button" (click)="deleteDialog.close()">Keep habit</button>
        </habit-maker-ui-modal>
        <button type="button" (click)="deleteDialog.openFrom(deleteTrigger)" #deleteTrigger>Without title</button>
      </div>
    `,
  }),
};
