import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';
import { HabitMakerUIInput } from '../habit-maker-ui-input/habit-maker-ui-input';
import {
  HabitMakerUIFormFieldError,
  HabitMakerUIFormFieldHint,
  HabitMakerUIFormFieldIconRight,
  HabitMakerUIFormField,
  HabitMakerUIFormFieldLabel,
} from './habit-maker-ui-form-field';

type StoryArgs = { inputType: 'text' | 'password' };

const meta: Meta<HabitMakerUIFormField> = {
  title: 'Forms/Form Field',
  component: HabitMakerUIFormField,
  decorators: [
    moduleMetadata({
      imports: [
        HabitMakerUIFormField,
        HabitMakerUIFormFieldError,
        HabitMakerUIFormFieldHint,
        HabitMakerUIFormFieldIconRight,
        HabitMakerUIFormFieldLabel,
        HabitMakerUIIcon,
        HabitMakerUIInput,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Playground: Story = {
  args: { inputType: 'text' },
  argTypes: {
    inputType: { control: 'select', options: ['text', 'password'] },
  },
  render: ({ inputType }) => ({
    template: `
      <hm-form-field style="max-width: 24rem;">
        <label hmLabel for="playground-input">Account password</label>
        <input
          hmInput
          id="playground-input"
          name="playground"
          [type]="inputType"
          value="habitmaker"
        >
        <button
          hmIconRight
          type="button"
          aria-label="Toggle password visibility"
        >
          <habit-maker-ui-icon name="eye" />
        </button>
        <p hmHint>Use at least 8 characters.</p>
      </hm-form-field>
    `,
    props: { inputType },
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; max-width: 24rem; gap: 1.25rem;">
        <hm-form-field>
          <label hmLabel for="form-field-text">Email address</label>
          <input
            hmInput
            id="form-field-text"
            type="email"
            placeholder="you@example.com"
          >
        </hm-form-field>
        <hm-form-field>
          <label hmLabel for="form-field-password">Password</label>
          <input
            hmInput
            id="form-field-password"
            type="password"
            value="habitmaker"
            aria-describedby="form-field-help"
          >
          <button
            hmIconRight
            type="button"
            aria-label="Show password"
          >
            <habit-maker-ui-icon name="eye" />
          </button>
          <p id="form-field-help" hmHint>Use at least 8 characters.</p>
        </hm-form-field>
        <hm-form-field>
          <label hmLabel for="form-field-error">Invalid field</label>
          <input
            hmInput="error"
            id="form-field-error"
            type="text"
            value="Invalid value"
            aria-invalid="true"
          >
          <p hmError>Invalid email or password</p>
        </hm-form-field>
        <hm-form-field>
          <label hmLabel for="form-field-notes">Notes</label>
          <textarea
            hmInput
            id="form-field-notes"
            rows="3"
            placeholder="Add a note"
          ></textarea>
        </hm-form-field>
      </div>
    `,
  }),
};
