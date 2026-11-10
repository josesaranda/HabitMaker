import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { HabitMakerUISelect } from '../habit-maker-ui-select/habit-maker-ui-select';
import { HabitMakerUIOption } from './habit-maker-ui-option';

const meta: Meta<HabitMakerUIOption> = {
  title: 'Forms/Select/Option',
  component: HabitMakerUIOption,
  parameters: {
    docs: {
      description: {
        component: [
          '`habit-maker-ui-option` is an option for `habit-maker-ui-select`; render it as a child of a select so it can use the select context and keyboard behavior.',
          '',
          'Provide a unique `value`. The option label comes from `label` when supplied, otherwise from its projected text. Set `disabled` to make an option unavailable.',
          '',
          '```html',
          '<habit-maker-ui-select aria-label="Choose a habit">',
          '  <habit-maker-ui-option value="read">Read</habit-maker-ui-option>',
          '  <habit-maker-ui-option value="walk" [disabled]="true">Walk</habit-maker-ui-option>',
          '</habit-maker-ui-select>',
          '```',
        ].join('\n'),
      },
    },
  },
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
