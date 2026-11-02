---
name: habitmaker-icons
description: Use when adding, changing, or reviewing icons, SVGs, or iconography in HabitMaker. Requires all app and UI icons to be registered in and rendered through the shared HabitMakerUIIcon (`hm-icon`) component.
---

# HabitMaker Icons

Use the shared `HabitMakerUIIcon` component for every icon in HabitMaker. This applies to icons in application templates, shared UI components, and new interface work.

## Required workflow

1. Inspect `HabitMakerUIIconName` and `ICON_PATHS` in `packages/habit-maker-ui/src/lib/habit-maker-ui-icon/habit-maker-ui-icon.ts` to see whether the required icon is already registered. Reuse an existing icon whenever it fits.
2. If the icon does not exist, add it to the shared icon sprite assets under `packages/habit-maker-ui/src/assets/icons/`. Each SVG asset must contain a `<symbol>` whose `id` matches the icon name and whose `viewBox` is `0 0 24 24`.
3. Add the name to `HabitMakerUIIconName` and map it to `assets/icons/<name>.svg#<name>` in `ICON_PATHS`.
4. Render the icon with `<hm-icon name="..." />`. In standalone Angular components, import `HabitMakerUIIcon` from `@habit-maker/habit-maker-ui` and add it to the component's `imports`.
5. Size and color the icon through the `hm-icon` host classes, for example `<hm-icon class="size-5" name="check" />`. The icon SVG uses `currentColor`.
6. Extend `habit-maker-ui-icon.spec.ts` to verify the new icon resolves to its shared SVG asset. Run the relevant Nx tests and build for the changed projects.

## Rules

- Do not add inline `<svg>` markup, hand-written icon paths in application templates, or one-off icon components. Register the icon in `HabitMakerUIIcon` instead.
- Do not use emoji or text glyphs as substitutes for interface icons.
- Keep icons decorative: `hm-icon` already renders its SVG with `aria-hidden="true"`. Provide accessible text or labels separately whenever an icon accompanies an action or communicates status.
- Keep icon artwork in the shared sprite assets; do not duplicate an existing symbol under another name without a clear visual distinction.
- When modifying a feature that already contains inline SVG or other one-off icon artwork, migrate that artwork to `hm-icon` as part of the change.
