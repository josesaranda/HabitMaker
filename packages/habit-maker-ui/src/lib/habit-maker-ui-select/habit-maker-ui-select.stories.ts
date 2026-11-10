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
          'Use `habit-maker-ui-select` with one or more nested `habit-maker-ui-option` elements. Give the select an accessible name with `aria-label` or `aria-labelledby`.',
          '',
          'The control implements Angular `ControlValueAccessor`, so it works with `[(ngModel)]` or reactive forms. Import `FormsModule` for `ngModel`. `placeholder`, `required`, and `disabled` configure the control.',
          '',
          '```html',
          '<habit-maker-ui-select',
          '  name="habit"',
          '  aria-label="Choose a habit"',
          '  placeholder="Select a habit"',
          '  [(ngModel)]="selectedHabit"',
          '>',
          '  <habit-maker-ui-option value="read">Reading</habit-maker-ui-option>',
          '  <habit-maker-ui-option value="walk">Walking</habit-maker-ui-option>',
          '</habit-maker-ui-select>',
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
      <habit-maker-ui-select
        [placeholder]="placeholder"
        [required]="required"
        [disabled]="disabled"
        aria-label="Choose a habit"
      >
        <habit-maker-ui-option value="reading">Read for 10 minutes</habit-maker-ui-option>
        <habit-maker-ui-option value="walk">Take a short walk</habit-maker-ui-option>
        <habit-maker-ui-option value="journal">Write in a journal</habit-maker-ui-option>
      </habit-maker-ui-select>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; max-width: 22rem; gap: 1rem;">
        <habit-maker-ui-select aria-label="Choose a habit" placeholder="Select a habit">
          <habit-maker-ui-option value="read">Reading</habit-maker-ui-option>
          <habit-maker-ui-option value="walk">Walking</habit-maker-ui-option>
        </habit-maker-ui-select>
        <habit-maker-ui-select aria-label="Required habit" placeholder="Required selection" required>
          <habit-maker-ui-option value="journal">Journaling</habit-maker-ui-option>
          <habit-maker-ui-option value="stretch">Stretching</habit-maker-ui-option>
        </habit-maker-ui-select>
        <habit-maker-ui-select aria-label="Disabled habit" placeholder="Unavailable" disabled>
          <habit-maker-ui-option value="water">Drink water</habit-maker-ui-option>
        </habit-maker-ui-select>
      </div>
    `,
  }),
};
