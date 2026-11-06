import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIModal } from './habit-maker-ui-modal';

const meta: Meta<HabitMakerUIModal> = {
  title: 'Overlays/Modal',
  component: HabitMakerUIModal,
};
export default meta;

type Story = StoryObj<HabitMakerUIModal>;

export const Playground: Story = {
  args: { label: 'Habit details', closeLabel: 'Close habit details' },
  render: (args) => ({
    props: args,
    template: `
      <habit-maker-ui-modal #modal [label]="label" [closeLabel]="closeLabel">
        <h2 style="margin-top: 0;">Take a moment to check in</h2>
        <p>Review your progress and decide what comes next.</p>
      </habit-maker-ui-modal>
      <button type="button" (click)="modal.openFrom(trigger)" #trigger>Open modal</button>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <habit-maker-ui-modal #details label="Habit details">
          <h2 style="margin-top: 0;">Habit details</h2>
          <p>Review the details of your daily reading habit.</p>
        </habit-maker-ui-modal>
        <button type="button" (click)="details.openFrom(detailsTrigger)" #detailsTrigger>Details</button>

        <habit-maker-ui-modal #deleteDialog label="Delete habit confirmation">
          <h2 style="margin-top: 0;">Delete this habit?</h2>
          <p>This action cannot be undone.</p>
          <button type="button" (click)="deleteDialog.close()">Keep habit</button>
        </habit-maker-ui-modal>
        <button type="button" (click)="deleteDialog.openFrom(deleteTrigger)" #deleteTrigger>Confirmation</button>
      </div>
    `,
  }),
};
