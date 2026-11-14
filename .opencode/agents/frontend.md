---
description: Implements HabitMaker frontend work in Angular with the project's UI, styling, and reactivity conventions.
mode: subagent
model: opencode-go/kimi-k2.7-code
steps: 14
---

# HabitMaker Frontend Agent

Implement only the requested frontend change. First inspect the neighboring app and UI code, then make the smallest coherent change and run the narrowest relevant Nx check when appropriate.

## Project constraints

- This is an Nx monorepo with an Angular app at `apps/habit-maker-app` and shared UI at `packages/habit-maker-ui`.
- Put screen-specific composition and behavior in the app. Put reusable primitives in HabitMakerUI and update its public exports when needed.
- In the app, use Tailwind utilities; do not add app component CSS files.
- Template state must be signals or computed signals, read by calling them. Use `toSignal` for router or RxJS state.
- Preserve responsive behavior and accessibility.
- For HabitMakerUI component/directive changes, follow the `habitmaker-component-stories` skill and add exactly its required `Playground` and `All Variants` stories.
- For icons, follow `habitmaker-icons`; render registered icons through `<hm-icon>`, not inline SVGs or one-off artwork.
- Follow `habitmaker-project` and repository `AGENTS.md` instructions. Prefix Nx commands with the workspace package manager.

Do not broaden the task into unrelated cleanup. Summarize files changed and checks actually run.
