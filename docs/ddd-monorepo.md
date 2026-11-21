# DDD monorepo architecture (HabitMaker)

This document describes the Domain-Driven Design (DDD) structure adopted in the HabitMaker Nx monorepo and how it enables Nx caching/affected-task performance.

## Goals

- Split the codebase into small, cohesive, independently buildable/testable libraries.
- Make dependencies explicit so Nx can cache and rebuild only what is affected.
- Keep domain logic framework-agnostic where possible.
- Keep the Angular app (`HabitMakerApp`) and NestJS API (`HabitMakerApi`) as composition shells.

## Layering

```
Frontend:
  feature -> data-access -> domain

Backend:
  api -> application -> domain
                  \-> infrastructure -> domain
```

Frontend `domain` is framework-free; data-access owns HTTP and state; features own screens and route-level behavior. Backend `domain` owns framework-free contracts, `application` owns use cases, `infrastructure` owns persistence/external integrations, and `api` owns Nest controllers, guards, and modules. The Nx boundary rule enforces the allowed project dependencies. Backend application services still use TypeORM entities/repositories directly in places; extracting repository ports/adapters is a follow-up rather than a completed claim.

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
  test-support/             # Shared frontend Transloco test providers/fixtures

  auth-domain/              # AuthSession, LogoutOptions, UserRole
  auth-data-access/         # AuthService, interceptor, guards
  auth-feature/             # login/signup/password-recovery screens + auth story

  habits-domain/            # Habit, HabitCompletionStatus, HabitReminder
  habits-data-access/       # HabitService, HabitStore
  habits-feature/           # NewHabit, HabitCard, HabitDetail, Home

  i18n-data-access/         # LanguageService, TranslocoHttpLoader
  settings-domain/          # version types
  settings-data-access/     # SettingsService, AppVersionService
  settings-feature/         # settings screen + user/admin settings
  admin-domain/             # admin user/config types
  admin-data-access/        # AdminService
  today-feature/            # Today screen

  api-auth-{domain,application,infrastructure,api}/
  api-habits-{domain,application,infrastructure,api}/
  api-admin-{domain,application,infrastructure,api}/
  api-push-{domain,application,infrastructure,api}/
  api-version-{domain,application,infrastructure,api}/
  api-platform-infrastructure/ # database config and TypeORM composition

packages/
  habit-maker-ui/           # @habit-maker/habit-maker-ui shared UI primitives
```

## Nx project conventions

- Frontend project names use `<domain>-<layer>` (e.g. `habit-domain`, `auth-data-access`).
- Backend projects use `api-<domain>-<layer>` to avoid collisions with frontend projects (e.g. `api-auth-application`).
- Tags:
  - `type:domain`, `type:data-access`, `type:feature`, `type:shared`
  - backend adds `type:application`, `type:infrastructure`, `type:api`
  - `platform:frontend` and `platform:backend` keep the two applications isolated
  - frontend scopes: `scope:habits`, `scope:auth`, `scope:i18n`, `scope:settings`, `scope:admin`, `scope:today`, `scope:shared`
  - backend scopes: `scope:api-auth`, `scope:api-habits`, `scope:api-admin`, `scope:api-push`, `scope:api-version`, `scope:api-platform`
- `domain` libraries are non-buildable, pure TypeScript (`bundler: none`).
- Angular `data-access`/`feature` libraries are non-buildable and consumed by the app bundler.
- Each library has its own `outDir` (`dist/out-tsc/<lib>`) to avoid declaration/tsbuildinfo collisions.
- Each library has a unique `dist/out-tsc/<project>` output and explicit TypeScript project references.
- The Nx ESLint plugin runs `@nx/enforce-module-boundaries` through inferred `lint` targets. Its constraints enforce platform separation and the frontend/backend layer directions.

## Ports and configuration

- `API_BASE_URL`: base URL for the API. Provided in `app.config.ts`; libraries fall back to `/api` when absent (useful in unit tests).
- `AUTH_TOKEN_PROVIDER`: minimal auth port `{ getAuthToken(): string | null }`. `AuthService` is registered via `useExisting`, so `habits-data-access` does not depend on `auth-data-access`.

## Completed migration

- Frontend `habits`: domain + data-access + feature (`NewHabit`, `HabitCard`, `HabitDetail`, `Home`).
- Frontend `auth`: domain + data-access + feature (service, interceptor, guards, auth screens/story).
- Frontend `settings`: domain + data-access + feature (settings screen, user/admin settings, app updates).
- `i18n`: data-access (language service, Transloco loader).
- `admin`: domain + data-access.
- `today`: feature library.
- `shared`: config ports and browser/confetti services.
- Backend `auth`, `habits`, `admin`, `push`, and `version`: libraries split across domain, application, infrastructure, and API layers.
- Backend database configuration is in `api-platform-infrastructure`; `HabitMakerApi` composes the Nest modules.

The apps retain composition responsibilities (providers, routes, root Nest module). Feature and backend source now live in independently addressable Nx projects and are imported through workspace aliases.
Unit specs for migrated screens, services, guards, and modules now live beside their implementations and run through their owning Nx projects. App projects retain only shell/composition tests (`HabitMakerApp`; `HabitMakerApi`, root controller/service).

## Next steps

1. Extract repository ports from backend application services and implement them in infrastructure so application no longer imports TypeORM entities directly.
2. Consider buildable/publishable libraries only where measured cache hits justify the extra build step.
3. Run `nx sync` after moving/adding libraries so TypeScript project references stay aligned.

## Caching benefits

Because each layer/domain is its own project with explicit inputs/outputs, Nx can:

- Cache typecheck/test/build per library.
- Rebuild only affected projects on change.
- Avoid recompiling the whole app when a single domain changes.
