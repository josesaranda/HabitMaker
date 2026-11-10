import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUICheckbox } from './habit-maker-ui-checkbox';

const meta: Meta<HabitMakerUICheckbox> = {
  title: 'Forms/Checkbox',
  component: HabitMakerUICheckbox,
  parameters: {
    docs: {
      description: {
        component: [
          'Apply `hmCheckbox` to a native checkbox input. It retains native checked, disabled, keyboard, and form behavior.',
          '',
          'Associate it with a visible `<label>` so users can identify the setting and toggle it by clicking the label.',
          '',
          '```html',
          '<label>',
          '  <input hmCheckbox type="checkbox" name="reminderEnabled" />',
          '  Enable daily reminders',
          '</label>',
          '```',
        ].join('\n'),
      },
    },
  },
  decorators: [moduleMetadata({ imports: [HabitMakerUICheckbox] })],
};

export default meta;
type Story = StoryObj<HabitMakerUICheckbox>;

export const Playground: Story = {
  render: () => ({
    template:
      '<label style="display: inline-flex; gap: .6rem; align-items: center;"><input hmCheckbox type="checkbox" aria-label="Mark habit complete" /> Mark habit complete</label>',
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; gap: 1rem;">
        <label style="display: inline-flex; gap: .6rem; align-items: center;"><input hmCheckbox type="checkbox" aria-label="Not completed" /> Not completed</label>
        <label style="display: inline-flex; gap: .6rem; align-items: center;"><input hmCheckbox type="checkbox" aria-label="Completed" checked /> Completed</label>
        <label style="display: inline-flex; gap: .6rem; align-items: center;"><input hmCheckbox type="checkbox" aria-label="Disabled" disabled /> Disabled</label>
        <label style="display: inline-flex; gap: .6rem; align-items: center;"><input hmCheckbox type="checkbox" aria-label="Completed and disabled" checked disabled /> Completed and disabled</label>
      </div>
    `,
  }),
};
