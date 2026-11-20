import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { HabitMakerUIOption } from '../habit-maker-ui-option/habit-maker-ui-option';
import { HabitMakerUISelect } from './habit-maker-ui-select';

const meta: Meta<HabitMakerUISelect> = {
  title: 'Forms/Select',
  component: HabitMakerUISelect,
  parameters: {
    docs: {
      description: {
        component: [
          'Use `hm-select` with one or more nested `hm-option` elements. Give the select an accessible name with `aria-label` or `aria-labelledby`.',
          '',
          'The control implements Angular `ControlValueAccessor`, so it works with `[(ngModel)]` or reactive forms. Import `FormsModule` for `ngModel`. `placeholder`, `required`, and `disabled` configure the control.',
          '',
          '```html',
          '<hm-select',
          '  name="habit"',
          '  aria-label="Choose a habit"',
          '  placeholder="Select a habit"',
          '  [(ngModel)]="selectedHabit"',
          '>',
          '  <hm-option value="read">Reading</hm-option>',
          '  <hm-option value="walk">Walking</hm-option>',
          '</hm-select>',
          '```',
        ].join('\n'),
      },
    },
  },
  decorators: [moduleMetadata({ imports: [FormsModule, HabitMakerUIOption] })],
};
export default meta;

type Story = StoryObj<HabitMakerUISelect>;

export const Playground: Story = {
  args: { placeholder: 'Choose a habit', required: false, disabled: false },
  render: (args) => ({
    props: args,
    template: `
      <hm-select
        [placeholder]="placeholder"
        [required]="required"
        [disabled]="disabled"
        aria-label="Choose a habit"
      >
        <hm-option value="reading">Read for 10 minutes</hm-option>
        <hm-option value="walk">Take a short walk</hm-option>
        <hm-option value="journal">Write in a journal</hm-option>
      </hm-select>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; max-width: 22rem; gap: 1rem;">
        <hm-select aria-label="Choose a habit" placeholder="Select a habit">
          <hm-option value="read">Reading</hm-option>
          <hm-option value="walk">Walking</hm-option>
        </hm-select>
        <hm-select aria-label="Required habit" placeholder="Required selection" required>
          <hm-option value="journal">Journaling</hm-option>
          <hm-option value="stretch">Stretching</hm-option>
        </hm-select>
        <hm-select aria-label="Disabled habit" placeholder="Unavailable" disabled>
          <hm-option value="water">Drink water</hm-option>
        </hm-select>
      </div>
    `,
  }),
};
