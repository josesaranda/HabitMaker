---
name: habitmaker-project
description: "Use when changing, reviewing, or explaining HabitMaker application code, UI components, routes, styles, tests, or workspace structure. Provides project-specific architecture and implementation guardrails."
---

# HabitMaker Project Guide

Use this skill for work specific to the HabitMaker codebase. Follow the repository's `AGENTS.md` and existing code patterns as well; this guide complements rather than replaces them.

## Workspace at a glance

- This is an Nx monorepo managed with npm workspaces.
- `HabitMakerApp` is the Angular application in `apps/habit-maker-app`.
- `HabitMakerUI` is the shared UI library in `packages/habit-maker-ui`.
- The stack includes Angular 22, TypeScript 6, Nx 24, Tailwind CSS 4, RxJS 7, and Vitest 4. Check `package.json` for the exact dependency versions when needed.

## Where code belongs

- Add application screens and app-specific behavior under `apps/habit-maker-app/src/app/`.
- App routes live in `apps/habit-maker-app/src/app/app.routes.ts`; app-level providers are configured in `app.config.ts`.
- Reusable UI primitives belong in `packages/habit-maker-ui/src/lib/`. Existing components include button, checkbox, input, and link. Update the library's public exports in `packages/habit-maker-ui/src/index.ts` when adding a component intended for consumers.
- App-wide styles are in `apps/habit-maker-app/src/styles.css`. It imports Tailwind and the shared UI styles. Keep component-specific styles with their components and follow the established CSS conventions.
- When creating a component or directive that needs styles, create a corresponding `.css` file alongside its source and connect it using the project's Angular style conventions. Do not add an otherwise unnecessary stylesheet when no styles are needed.
- For pages, sections, and visual compositions in `HabitMakerApp`, Tailwind utility classes may be used instead of BEM.
- Components created in `HabitMakerUI` must use BEM class names (`block__element--modifier`) and the design tokens defined in CSS. Keep classes scoped to the component to avoid unintended style collisions.
- Keep tests near the code they cover, following the existing `*.spec.ts` patterns.

## Current application behavior

- The app currently defines `/login` and `/signup` routes.
- The root route and unknown routes redirect to `/login`.
- Do not assume that authentication, persistence, APIs, or a backend are implemented. Inspect the relevant code before describing or extending behavior, and avoid inventing integration details.

## Working practices

- Inspect neighboring components, templates, styles, and tests before making changes. Prefer established Angular patterns over introducing a new architecture or dependency without a clear need.
- **Zoneless/template reactivity is mandatory:** every dynamic value consumed by a component template (interpolation, conditionals, and property/class/style bindings) must be a signal or a `computed` signal, and templates must read it by calling it (for example, `state()` or `isInvalid()`). Update signals with `set` or `update`.
- Do not bind plain mutable fields, getters, or recalculating methods as template state. Derive values with `computed`; convert router state or RxJS streams with `toSignal`. Use signal inputs for reactive component inputs. Plain constants are fine only when they are truly static and do not represent template state.
- Keep reusable presentation components in `HabitMakerUI`; keep screen-specific composition and behavior in `HabitMakerApp`.
- Preserve accessibility, responsive behavior, and existing styling conventions when changing UI.
- Use Nx targets for workspace tasks and check the project's resolved configuration if a target is unclear. The repository instructions require prefixing Nx commands with the package manager.
- Verify changes with the narrowest relevant tests, and run a build when appropriate. Do not claim checks passed unless they were run.

## Common commands

Run these from the repository root:

```bash
# Install dependencies
npm install

# Start the application
npm run start:app

# Run tests
npm exec nx test HabitMakerApp
npm exec nx test HabitMakerUI

# Build the application
npm exec nx build HabitMakerApp
```

The development server is normally available at `http://localhost:4200`. Confirm the target configuration if server behavior or options are relevant.
