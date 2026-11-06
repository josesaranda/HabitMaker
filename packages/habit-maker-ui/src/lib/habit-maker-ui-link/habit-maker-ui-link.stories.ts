import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import { HabitMakerUILink } from './habit-maker-ui-link';

const meta: Meta<HabitMakerUILink> = {
  title: 'Navigation/Link',
  component: HabitMakerUILink,
  decorators: [moduleMetadata({ imports: [HabitMakerUILink] })],
};

export default meta;
type Story = StoryObj<HabitMakerUILink>;

export const Playground: Story = {
  render: () => ({
    template: '<a hmLink href="https://example.com">View habit details</a>',
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display: grid; justify-items: start; gap: .75rem;">
        <a hmLink href="#details">Standalone link</a>
        <p style="margin: 0; color: var(--color-text-primary);">Keep going with your <a hmLink href="#habits">habit plan</a> today.</p>
        <a hmLink href="#disabled" aria-disabled="true" tabindex="-1">Unavailable link</a>
      </div>
    `,
  }),
};
