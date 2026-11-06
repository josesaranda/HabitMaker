import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { HabitMakerUISelect } from '../habit-maker-ui-select/habit-maker-ui-select';
import { HabitMakerUIOption } from './habit-maker-ui-option';

const meta: Meta<HabitMakerUIOption> = {
  title: 'Forms/Select/Option',
  component: HabitMakerUIOption,
  decorators: [
    moduleMetadata({
      imports: [FormsModule, HabitMakerUISelect, HabitMakerUIOption],
    }),
  ],
};
export default meta;

type Story = StoryObj<HabitMakerUIOption>;

export const Playground: Story = {
  args: { value: 'custom', label: 'Custom option', disabled: false },
  render: (args) => ({
    props: args,
    template: `
      <habit-maker-ui-select aria-label="Option playground" placeholder="Choose an option">
        <habit-maker-ui-option [value]="value" [label]="label" [disabled]="disabled">{{ label }}</habit-maker-ui-option>
        <habit-maker-ui-option value="another">Another option</habit-maker-ui-option>
      </habit-maker-ui-select>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <habit-maker-ui-select aria-label="Option states" [ngModel]="'daily'">
        <habit-maker-ui-option value="daily">Selected option</habit-maker-ui-option>
        <habit-maker-ui-option value="weekly">Available option</habit-maker-ui-option>
        <habit-maker-ui-option value="disabled" disabled>Disabled option</habit-maker-ui-option>
      </habit-maker-ui-select>
    `,
  }),
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>('[role="combobox"]')
      ?.click();
  },
};
