---
name: habitmaker-component-stories
description: Use whenever creating or changing an Angular component or directive in packages/habit-maker-ui. Requires a colocated Storybook stories.ts with exactly Playground and All Variants stories.
---

# HabitMaker UI Component Stories

Every Angular component or directive created in `packages/habit-maker-ui/src/lib/` must be accompanied by a Storybook story file in the same directory. Use this skill for new components and when a component's inputs, variants, or behavior change.

## Required stories

For a component file named `<component>.ts`, create or update `<component>.stories.ts` beside it. The file must export exactly these two stories:

- `Playground`: an interactive example with Storybook controls for meaningful component inputs and variants. Provide useful default args and demonstrate content projection when relevant. Put control definitions on this story (or otherwise scope them to it), not on the shared meta.
- `AllVariants`: displays every supported visual variant and important state together. Storybook displays this export as **All Variants**. It must have no controls: don't give it interactive args or controls, and disable its Controls panel with `parameters: { controls: { disable: true } }`. For components without a formal variant input, show the meaningful states or common usage contexts instead.

Use Angular CSF with typed `Meta` and `StoryObj` from `@storybook/angular`. Add `moduleMetadata` imports for standalone components, directives, and projected child components used in custom templates. If a component requires a parent context, such as `HabitMakerUIOption` inside `HabitMakerUISelect`, render it in that context rather than as an isolated element.

Keep the examples accessible: use semantic elements, labels for controls, and the shared `HabitMakerUIIcon` for icon artwork. Use the existing design tokens and CSS instead of inventing component styles in stories.

## Workflow

1. Inspect the component's inputs, variants, template, styles, and nearby stories.
2. Create or update the colocated `*.stories.ts` in the same change as the component.
3. Keep the exports limited to `Playground` and `AllVariants`; don't leave generator sample stories such as `Primary` or `Heading` alongside them.
4. Check that the Storybook story glob includes the new file, and run the `HabitMakerUI` Storybook build and relevant typecheck/tests when practical.

Storybook for this library is configured in `packages/habit-maker-ui/.storybook/`; run it with `npm exec nx storybook HabitMakerUI` and build it with `npm exec nx build-storybook HabitMakerUI`.
