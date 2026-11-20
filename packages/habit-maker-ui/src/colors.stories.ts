import type { Meta, StoryObj } from '@storybook/angular';

interface ColorToken {
  name: string;
  group: string;
}

const tokens: ColorToken[] = [
  // Primitive tokens
  { name: 'green-950', group: 'Primitive' },
  { name: 'green-800', group: 'Primitive' },
  { name: 'green-600', group: 'Primitive' },
  { name: 'green-300', group: 'Primitive' },
  { name: 'neutral-50', group: 'Primitive' },
  { name: 'neutral-0', group: 'Primitive' },
  { name: 'neutral-200', group: 'Primitive' },
  { name: 'neutral-500', group: 'Primitive' },
  { name: 'neutral-800', group: 'Primitive' },
  { name: 'amber-400', group: 'Primitive' },
  { name: 'coral-400', group: 'Primitive' },
  { name: 'red-600', group: 'Primitive' },
  { name: 'text-white', group: 'Primitive' },
  // Semantic tokens - Brand
  { name: 'primary', group: 'Brand' },
  { name: 'primary-hover', group: 'Brand' },
  { name: 'primary-soft', group: 'Brand' },
  { name: 'accent', group: 'Brand' },
  // Semantic tokens - Backgrounds
  { name: 'background', group: 'Backgrounds' },
  { name: 'surface', group: 'Backgrounds' },
  { name: 'surface-secondary', group: 'Backgrounds' },
  { name: 'surface-hover', group: 'Backgrounds' },
  // Semantic tokens - Text
  { name: 'text-primary', group: 'Text' },
  { name: 'text-secondary', group: 'Text' },
  { name: 'text-inverse', group: 'Text' },
  { name: 'text-disabled', group: 'Text' },
  // Semantic tokens - Borders
  { name: 'border', group: 'Borders' },
  { name: 'border-strong', group: 'Borders' },
  // Semantic tokens - Habit states
  { name: 'habit-completed', group: 'Habit states' },
  { name: 'habit-pending', group: 'Habit states' },
  { name: 'habit-skipped', group: 'Habit states' },
  // Semantic tokens - Progress
  { name: 'progress-track', group: 'Progress' },
  { name: 'progress-fill', group: 'Progress' },
  { name: 'progress-highlight', group: 'Progress' },
  // Semantic tokens - Feedback
  { name: 'success', group: 'Feedback' },
  { name: 'warning', group: 'Feedback' },
  { name: 'error', group: 'Feedback' },
  { name: 'info', group: 'Feedback' },
  // Component tokens - Link
  { name: 'link', group: 'Link' },
  { name: 'link-hover', group: 'Link' },
  { name: 'link-focus', group: 'Link' },
  // Component tokens - Button
  { name: 'button-primary', group: 'Button' },
  { name: 'button-primary-hover', group: 'Button' },
  { name: 'button-primary-focus', group: 'Button' },
  { name: 'button-primary-text', group: 'Button' },
  { name: 'button-secondary', group: 'Button' },
  { name: 'button-secondary-hover', group: 'Button' },
  { name: 'button-secondary-focus', group: 'Button' },
  { name: 'button-secondary-text', group: 'Button' },
  { name: 'button-secondary-border', group: 'Button' },
];

// Tailwind safelist (ensures dynamically built utility classes are generated):
// bg-green-950 bg-green-800 bg-green-600 bg-green-300 bg-neutral-50 bg-neutral-0 bg-neutral-200 bg-neutral-500 bg-neutral-800 bg-amber-400 bg-coral-400 bg-red-600 bg-text-white bg-primary bg-primary-hover bg-primary-soft bg-accent bg-background bg-surface bg-surface-secondary bg-surface-hover bg-text-primary bg-text-secondary bg-text-inverse bg-text-disabled bg-border bg-border-strong bg-habit-completed bg-habit-pending bg-habit-skipped bg-progress-track bg-progress-fill bg-progress-highlight bg-success bg-warning bg-error bg-info bg-link bg-link-hover bg-link-focus bg-button-primary bg-button-primary-hover bg-button-primary-focus bg-button-primary-text bg-button-secondary bg-button-secondary-hover bg-button-secondary-focus bg-button-secondary-text bg-button-secondary-border

function swatchTemplate() {
  const groups = [...new Set(tokens.map((t) => t.group))];
  return groups
    .map((group) => {
      const items = tokens.filter((t) => t.group === group);
      return `
        <section class="mb-8">
          <h2 class="mb-3 text-lg font-semibold">${group}</h2>
          <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            ${items
              .map(
                (t) => `
              <div>
                <div class="h-16 rounded-lg border border-border bg-${t.name}"></div>
                <div class="mt-2 font-mono text-xs">--color-${t.name}</div>
              </div>`,
              )
              .join('')}
          </div>
        </section>`;
    })
    .join('');
}

const meta: Meta = {
  title: 'Foundations/Colors',
};

export default meta;

type Story = StoryObj;

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: swatchTemplate(),
  }),
};
