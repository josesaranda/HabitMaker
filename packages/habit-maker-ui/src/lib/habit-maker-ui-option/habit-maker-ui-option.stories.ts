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
          '`hm-option` is an option for `hm-select`; render it as a child of a select so it can use the select context and keyboard behavior.',
          '',
          'Provide a unique `value`. The option label comes from `label` when supplied, otherwise from its projected text. Set `disabled` to make an option unavailable.',
          '',
          '```html',
          '<hm-select aria-label="Choose a habit">',
          '  <hm-option value="read">Read</hm-option>',
          '  <hm-option value="walk" [disabled]="true">Walk</hm-option>',
          '</hm-select>',
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
      <hm-select aria-label="Option playground" placeholder="Choose an option">
        <hm-option [value]="value" [label]="label" [disabled]="disabled">{{ label }}</hm-option>
        <hm-option value="another">Another option</hm-option>
      </hm-select>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <hm-select aria-label="Option states" [ngModel]="'daily'">
        <hm-option value="daily">Selected option</hm-option>
        <hm-option value="weekly">Available option</hm-option>
        <hm-option value="disabled" disabled>Disabled option</hm-option>
      </hm-select>
    `,
  }),
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>('[role="combobox"]')
      ?.click();
  },
};
