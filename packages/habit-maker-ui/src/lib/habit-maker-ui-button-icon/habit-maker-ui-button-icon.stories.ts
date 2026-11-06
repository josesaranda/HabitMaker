import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIButtonIcon } from './habit-maker-ui-button-icon';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

const meta: Meta<HabitMakerUIButtonIcon> = {
  title: 'Actions/Icon Button',
  component: HabitMakerUIButtonIcon,
  decorators: [
    moduleMetadata({ imports: [HabitMakerUIButtonIcon, HabitMakerUIIcon] }),
  ],
};

export default meta;
type Story = StoryObj<HabitMakerUIButtonIcon>;

export const Playground: Story = {
  args: { hmButtonIcon: 'primary', size: 'normal' },
  argTypes: {
    hmButtonIcon: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'select', options: ['small', 'normal', 'big'] },
  },
  render: (args) => ({
    props: args,
    template:
      '<button type="button" aria-label="Add habit" [hmButtonIcon]="hmButtonIcon" [size]="size"><habit-maker-ui-icon name="add" /></button>',
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, auto); gap: 1rem; align-items: center; justify-content: start;">
        <button hmButtonIcon="primary" size="small" aria-label="Add small"><habit-maker-ui-icon name="add" /></button>
        <button hmButtonIcon="primary" size="normal" aria-label="Add normal"><habit-maker-ui-icon name="add" /></button>
        <button hmButtonIcon="primary" size="big" aria-label="Add big"><habit-maker-ui-icon name="add" /></button>
        <button hmButtonIcon="secondary" size="small" aria-label="Settings small"><habit-maker-ui-icon name="settings" /></button>
        <button hmButtonIcon="secondary" size="normal" aria-label="Settings normal"><habit-maker-ui-icon name="settings" /></button>
        <button hmButtonIcon="secondary" size="big" aria-label="Settings big"><habit-maker-ui-icon name="settings" /></button>
        <button hmButtonIcon="primary" aria-label="Disabled" disabled><habit-maker-ui-icon name="add" /></button>
      </div>
    `,
  }),
};
