# DDD monorepo architecture (HabitMaker)

This document describes the Domain-Driven Design (DDD) structure adopted in the HabitMaker Nx monorepo and how it enables Nx caching/affected-task performance.

## Goals

- Split the codebase into small, cohesive, independently buildable/testable libraries.
- Make dependencies explicit so Nx can cache and rebuild only what is affected.
- Keep domain logic framework-agnostic where possible.
- Keep the Angular app (`HabitMakerApp`) and NestJS API (`HabitMakerApi`) as composition shells.

## Layering (per domain)

```
feature (UI/screens, routes, controllers)
  -> data-access (HTTP clients, stores, application services)
  -> domain (entities, value objects, ports)
```

Dependency rule: `domain` depends on nothing. `data-access` depends on `domain` and `shared-config`. `feature` depends on `data-access`, `domain`, and shared libraries. Apps compose features.

## Workspace layout

Libraries are flat under `libs/` using the `<domain>-<layer>` naming convention. This keeps Nx project names, `outDir`s and project references unambiguous.

```
apps/
  habit-maker-app/          # Angular shell: routing, app config, composition
  habit-maker-api/          # NestJS shell: module composition
  habit-maker-landing/      # Astro marketing site

libs/
  shared-config/            # API_BASE_URL, AUTH_TOKEN_PROVIDER ports
  shared-data-access/       # BrowserService, ConfettiService

  auth-domain/              # AuthSession, LogoutOptions, UserRole
  auth-data-access/         # AuthService, interceptor, guards

  habits-domain/            # Habit, HabitCompletionStatus, HabitReminder
  habits-data-access/       # HabitService, HabitStore
  habits-feature/           # NewHabit component

  i18n-data-access/         # LanguageService, TranslocoHttpLoader
  settings-domain/          # version types
  settings-data-access/     # SettingsService, AppVersionService
  admin-domain/             # admin user/config types
  admin-data-access/        # AdminService
  today-feature/            # Today screen

packages/
  habit-maker-ui/           # @habit-maker/habit-maker-ui shared UI primitives
```

## Nx project conventions

- Project names: `<domain>-<layer>` (e.g. `habit-domain`, `auth-data-access`).
- Tags:
  - `type:domain`, `type:data-access`, `type:feature`, `type:shared`
  - `scope:habits`, `scope:auth`, `scope:i18n`, `scope:settings`, `scope:admin`, `scope:today`, `scope:shared`
- `domain` libraries are non-buildable, pure TypeScript (`bundler: none`).
- Angular `data-access`/`feature` libraries are non-buildable and consumed by the app bundler.
- Each library has its own `outDir` (`dist/out-tsc/<lib>`) to avoid declaration/tsbuildinfo collisions.
- Apps declare project references to the libraries they consume.

## Ports and configuration

- `API_BASE_URL`: base URL for the API. Provided in `app.config.ts`; libraries fall back to `/api` when absent (useful in unit tests).
- `AUTH_TOKEN_PROVIDER`: minimal auth port `{ getAuthToken(): string | null }`. `AuthService` is registered via `useExisting`, so `habits-data-access` does not depend on `auth-data-access`.

## Completed migration (frontend)

- `habits`: domain + data-access + feature (`NewHabit`).
- `auth`: domain + data-access (service, token interceptor, route guards).
- `i18n`: data-access (language service, Transloco loader).
- `settings`: domain + data-access (settings, app version).
- `admin`: domain + data-access.
- `today`: feature library.
- `shared`: config ports and browser/confetti services.

The Angular app now imports these libraries via path aliases and no longer owns the migrated services.

## Next steps

1. Migrate the remaining frontend components (`HabitCard`, `HabitDetail`, `Home`, auth screens) into `feature` libraries.
2. Migrate the NestJS API to `libs/<domain>-{domain,application,infrastructure,api}`.
3. Add `@nx/enforce-module-boundaries` with the tags above to protect dependency direction.
4. Consider buildable libraries for stable domains if cache hits justify the extra build step.
5. Run `nx sync` after moving/adding libraries so TypeScript project references stay aligned.

## Caching benefits

Because each layer/domain is its own project with explicit inputs/outputs, Nx can:

- Cache typecheck/test/build per library.
- Rebuild only affected projects on change.
- Avoid recompiling the whole app when a single domain changes.
