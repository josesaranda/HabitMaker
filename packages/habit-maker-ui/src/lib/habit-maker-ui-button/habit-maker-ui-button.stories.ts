import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIButton } from './habit-maker-ui-button';

const meta: Meta<HabitMakerUIButton> = {
  title: 'Actions/Button',
  component: HabitMakerUIButton,
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
