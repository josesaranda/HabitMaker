import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUIBrand } from './habit-maker-ui-brand';

const meta: Meta<HabitMakerUIBrand> = {
  title: 'Brand/Brand',
  component: HabitMakerUIBrand,
  parameters: {
    docs: {
      description: {
        component: [
          'Render the HabitMaker mark and wordmark in a brand area such as a sign-in panel or application header.',
          '',
          'The component has no inputs. Its mark is decorative, so provide an accessible name on the surrounding link when the brand is clickable.',
          '',
          '```html',
          '<a routerLink="/home" aria-label="HabitMaker home">',
          '  <habit-maker-ui-brand />',
          '</a>',
          '```',
          '',
          'The brand can be placed on light or dark surfaces; the Storybook variants demonstrate the available color contexts.',
        ].join('\n'),
      },
    },
  },
};
export default meta;

type Story = StoryObj<HabitMakerUIBrand>;

export const Playground: Story = {};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
        <div style="padding: 1.25rem; border-radius: 1rem; background: var(--color-background); color: var(--color-text-primary);">
          <habit-maker-ui-brand />
        </div>
        <div style="padding: 1.25rem; border-radius: 1rem; background: var(--color-primary); color: var(--color-text-inverse); --hm-brand-mark-border: rgb(255 255 255 / 20%); --hm-brand-mark-background: rgb(255 255 255 / 9%); --hm-brand-mark-color: #c0d8b9; --hm-brand-light-color: #c0d8b9;">
          <habit-maker-ui-brand />
        </div>
      </div>
    `,
  }),
};
