import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIInput } from './habit-maker-ui-input';

const meta: Meta<HabitMakerUIInput> = {
  title: 'Forms/Input',
  component: HabitMakerUIInput,
  parameters: {
    docs: {
      description: {
        component: [
          'Apply `hmInput` to a native `<input>` to use the shared field styling. Native input types, values, validation, and form behavior remain available.',
          '',
          'Choose the `default` variant (the default) or `error`. Pair every input with a visible label, and set `aria-invalid="true"` when its value is invalid.',
          '',
          '```html',
          '<label for="habit-name">Habit name</label>',
          '<input hmInput id="habit-name" name="habitName" type="text" />',
          '',
          '<input hmInput="error" aria-label="Habit name" aria-invalid="true" />',
          '```',
        ].join('\n'),
      },
    },
  },
  decorators: [moduleMetadata({ imports: [HabitMakerUIInput] })],
};

export default meta;
type Story = StoryObj<HabitMakerUIInput>;

export const Playground: Story = {
  args: { hmInput: 'default' },
  argTypes: {
    hmInput: { control: 'select', options: ['default', 'error'] },
  },
  render: (args) => ({
    props: args,
    template:
      '<input hmInput [hmInput]="hmInput" type="text" placeholder="Name your habit" aria-label="Habit name" style="max-width: 24rem;">',
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; max-width: 24rem; gap: 1rem;">
        <input hmInput type="text" placeholder="Default input" aria-label="Default input">
        <input hmInput="error" type="text" value="Invalid value" aria-label="Error input" aria-invalid="true">
        <input hmInput type="text" value="Read-only value" aria-label="Read-only input" readonly>
        <input hmInput type="text" placeholder="Disabled input" aria-label="Disabled input" disabled>
      </div>
    `,
  }),
};
