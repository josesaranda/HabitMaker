import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIIcon } from './habit-maker-ui-icon';

const iconNames = [
  'add',
  'arrow-left',
  'arrow-right',
  'brand-mark',
  'check',
  'chevron-left',
  'chevron-right',
  'clock',
  'close',
  'edit',
  'eye',
  'eye-off',
  'logout',
  'settings',
  'sparkle',
  'sprout',
] as const;

const meta: Meta<HabitMakerUIIcon> = {
  title: 'Visuals/Icon',
  component: HabitMakerUIIcon,
  parameters: {
    docs: {
      description: {
        component: [
          'Render a registered HabitMaker icon with the required `name` input. Use this shared component for app and UI iconography instead of adding inline SVGs.',
          '',
          'Icons are marked `aria-hidden` because they are decorative. Put an icon-only control inside a button with an `aria-label`, or pair the icon with visible text.',
          '',
          '```html',
          '<habit-maker-ui-icon name="sprout" />',
          '',
          '<button type="button" aria-label="Add habit">',
          '  <habit-maker-ui-icon name="add" />',
          '</button>',
          '```',
          '',
          'Use the Playground control to browse the supported names.',
        ].join('\n'),
      },
    },
  },
};
export default meta;

type Story = StoryObj<HabitMakerUIIcon>;

export const Playground: Story = {
  args: { name: 'sprout' },
  argTypes: {
    name: { control: 'select', options: iconNames },
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { iconNames },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr)); gap: 1rem;">
        @for (iconName of iconNames; track iconName) {
          <div style="display: grid; justify-items: center; gap: .5rem; padding: 1rem; border: 1px solid var(--color-border); border-radius: .75rem; color: var(--color-text-primary);">
            <habit-maker-ui-icon [name]="iconName" style="width: 1.5rem; height: 1.5rem;" />
            <small>{{ iconName }}</small>
          </div>
        }
      </div>
    `,
  }),
};
