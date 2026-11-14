import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIToggle } from './habit-maker-ui-toggle';

const meta: Meta<HabitMakerUIToggle> = {
  title: 'Forms/Toggle',
  component: HabitMakerUIToggle,
  parameters: {
    docs: {
      description: {
        component: [
          'Apply `hmToggle` to a native checkbox input to render it as a slide toggle, styled after the Material 3 switch. It retains native checked, disabled, keyboard, and form behavior.',
          '',
          'Associate it with a visible `<label>` so users can identify the setting and toggle it by clicking the label.',
          '',
          '```html',
          '<label>',
          '  <input hmToggle type="checkbox" name="reminderEnabled" />',
          '  Enable daily reminders',
          '</label>',
          '```',
        ].join('\n'),
      },
    },
  },
  decorators: [moduleMetadata({ imports: [HabitMakerUIToggle] })],
};

export default meta;
type Story = StoryObj<HabitMakerUIToggle>;

export const Playground: Story = {
  render: () => ({
    template:
      '<label style="display: inline-flex; gap: .75rem; align-items: center;"><input hmToggle type="checkbox" aria-label="Enable daily reminders" /> Enable daily reminders</label>',
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; gap: 1rem;">
        <label style="display: inline-flex; gap: .75rem; align-items: center;"><input hmToggle type="checkbox" aria-label="Off" /> Off</label>
        <label style="display: inline-flex; gap: .75rem; align-items: center;"><input hmToggle type="checkbox" aria-label="On" checked /> On</label>
        <label style="display: inline-flex; gap: .75rem; align-items: center;"><input hmToggle type="checkbox" aria-label="Disabled" disabled /> Disabled</label>
        <label style="display: inline-flex; gap: .75rem; align-items: center;"><input hmToggle type="checkbox" aria-label="On and disabled" checked disabled /> On and disabled</label>
      </div>
    `,
  }),
};
