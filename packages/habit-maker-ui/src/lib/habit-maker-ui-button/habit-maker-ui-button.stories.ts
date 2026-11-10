import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIButton } from './habit-maker-ui-button';

const meta: Meta<HabitMakerUIButton> = {
  title: 'Actions/Button',
  component: HabitMakerUIButton,
  parameters: {
    docs: {
      description: {
        component: [
          'Apply `hmButton` to a native `<button>` or `<a>` to style a primary or secondary action. The directive preserves the native element behavior.',
          '',
          'Use `type="button"` for buttons that should not submit a form, and use the native `disabled` attribute when an action is unavailable.',
          '',
          '```html',
          '<button hmButton="primary" type="button">Save changes</button>',
          '<a hmButton="secondary" routerLink="/settings">Cancel</a>',
          '```',
        ].join('\n'),
      },
    },
  },
  decorators: [moduleMetadata({ imports: [HabitMakerUIButton] })],
};

export default meta;
type Story = StoryObj<HabitMakerUIButton>;

export const Playground: Story = {
  args: { hmButton: 'primary' },
  argTypes: {
    hmButton: { control: 'select', options: ['primary', 'secondary'] },
  },
  render: (args) => ({
    props: args,
    template:
      '<button type="button" [hmButton]="hmButton">Save changes</button>',
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
        <button hmButton="primary" type="button">Primary</button>
        <button hmButton="secondary" type="button">Secondary</button>
        <button hmButton="primary" type="button" disabled>Primary disabled</button>
        <button hmButton="secondary" type="button" disabled>Secondary disabled</button>
      </div>
    `,
  }),
};
