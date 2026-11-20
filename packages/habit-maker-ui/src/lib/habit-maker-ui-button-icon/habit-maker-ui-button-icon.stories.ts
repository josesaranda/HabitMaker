import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIButtonIcon } from './habit-maker-ui-button-icon';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

const meta: Meta<HabitMakerUIButtonIcon> = {
  title: 'Actions/Icon Button',
  component: HabitMakerUIButtonIcon,
  parameters: {
    docs: {
      description: {
        component: [
          'Apply `hmButtonIcon` to a native `<button>` or `<a>` when the action is represented by an icon rather than visible text.',
          '',
          'Always provide an accessible name with `aria-label`. Choose `primary` or `secondary`, and one of the `small`, `normal`, or `big` sizes. Render icon artwork through `HabitMakerUIIcon`.',
          '',
          '```html',
          '<button hmButtonIcon="primary" size="normal" type="button" aria-label="Add habit">',
          '  <hm-icon name="add" />',
          '</button>',
          '```',
        ].join('\n'),
      },
    },
  },
  decorators: [
    moduleMetadata({ imports: [HabitMakerUIButtonIcon, HabitMakerUIIcon] }),
  ],
};

export default meta;
type Story = StoryObj<HabitMakerUIButtonIcon>;

export const Playground: Story = {
  args: { hmButtonIcon: 'primary', size: 'normal', selected: false },
  argTypes: {
    hmButtonIcon: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'select', options: ['small', 'normal', 'big'] },
    selected: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template:
      '<button type="button" aria-label="Add habit" [hmButtonIcon]="hmButtonIcon" [size]="size" [selected]="selected"><hm-icon name="add" /></button>',
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, auto); gap: 1rem; align-items: center; justify-content: start;">
        <button hmButtonIcon="primary" size="small" aria-label="Add small"><hm-icon name="add" /></button>
        <button hmButtonIcon="primary" size="normal" aria-label="Add normal"><hm-icon name="add" /></button>
        <button hmButtonIcon="primary" size="big" aria-label="Add big"><hm-icon name="add" /></button>
        <button hmButtonIcon="secondary" size="small" aria-label="Settings small"><hm-icon name="settings" /></button>
        <button hmButtonIcon="secondary" size="normal" aria-label="Settings normal"><hm-icon name="settings" /></button>
        <button hmButtonIcon="secondary" size="big" aria-label="Settings big"><hm-icon name="settings" /></button>
        <button hmButtonIcon="secondary" size="normal" selected aria-label="Settings selected"><hm-icon name="settings" /></button>
        <button hmButtonIcon="primary" aria-label="Disabled" disabled><hm-icon name="add" /></button>
      </div>
    `,
  }),
};
