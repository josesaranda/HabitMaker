# HabitMaker

[![CI](https://github.com/josesaranda/HabitMaker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/josesaranda/HabitMaker/actions/workflows/ci.yml)

> **Project website:** [habitmaker.josesaranda.es](https://habitmaker.josesaranda.es) — explore the project, screenshots, Docker setup, and contribution guide.

HabitMaker is a habit-tracking web application in an Nx monorepo. It includes an Angular frontend, a NestJS API, and a shared UI component library.

## Features

- Create habits and view them from a personal home page.
- Track daily completions and browse completion history in a habit calendar.
- Schedule per-habit daily web push reminders in the device's local time zone.
- Sign up, log in, and submit a password-recovery request.
- Review active device sessions and revoke sessions from account settings.
- Switch the interface between English and Spanish.
- View account settings; administrators can also view registered users and check the app version for updates.

## Tech stack

- **Angular 22** and **TypeScript 6** for the frontend.
- **NestJS 11** for the API.
- **Nx 24** for the monorepo and task orchestration.
- **Tailwind CSS 4** and CSS for styling.
- **TypeORM** with **PostgreSQL** or in-memory **sql.js** for the API data store.
- **RxJS 7** and **Vitest 4**.
- **npm workspaces** for package management.

## Workspace structure

```text
.
├── apps/
│   ├── habit-maker-landing/    # Astro project landing page
│   ├── habit-maker-app/       # Angular web application
│   │   └── src/app/           # Routes, screens, auth, habits, and localization
│   └── habit-maker-api/       # NestJS API (auth, habits, push, completions, admin, version)
├── packages/
│   └── habit-maker-ui/        # Shared Angular UI components
├── nx.json                   # Nx workspace configuration
├── package.json              # Workspace dependencies and npm scripts
└── tsconfig.base.json        # Shared TypeScript configuration
```

The frontend routes include `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/home`, `/habits/:id`, and `/settings`. The home, habit detail, and settings pages require authentication. The root route and unknown routes redirect to `/login`.

## Project landing page

The public project landing page is built with Astro and Tailwind CSS, and is available in [English and Spanish](https://habitmaker.josesaranda.es). Start its development server with:

```bash
npm exec nx serve HabitMakerLanding
```

The English page is available at [http://localhost:4321](http://localhost:4321), and the Spanish page at [http://localhost:4321/es/](http://localhost:4321/es/). Build it with `npm exec nx build HabitMakerLanding`.

## Requirements

- Node.js
- npm (the workspace specifies npm `12.2.1`)

## Getting started

Install dependencies from the repository root:

```bash
npm install
```

Run the API and frontend in separate terminals:

```bash
npm run start:api
```

```bash
npm run start:app
```

The frontend is available at [http://localhost:4200](http://localhost:4200). During local development, it connects to the API at `http://localhost:3000/api`.

## Environment variables

The following table lists the variables used by the Docker setup. Values are examples or defaults; configure secrets for your deployment. `JWT_SECRET` must be set to a unique, random value in deployed environments. PostgreSQL settings can be omitted when running the API directly to use in-memory sql.js; if PostgreSQL is configured, set the database variables together and use a strong `POSTGRES_PASSWORD`.

| Variable            | Example or possible value                         | Optional?                                                                           |
| ------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `APP_PORT`          | `8080`                                            | Yes; defaults to `8080`                                                             |
| `SERVER_PORT`       | `3000`                                            | Yes; defaults to `3000`                                                             |
| `CORS_ORIGIN`       | `http://localhost:8080`                           | Yes; defaults to the app URL                                                        |
| `APP_URL`           | `http://localhost:8080`                           | Yes; defaults to the app URL                                                        |
| `JWT_SECRET`        | A unique, long random secret                      | No in deployed environments; local development has a fallback                       |
| `VAPID_PUBLIC_KEY`  | Generated with `npx web-push generate-vapid-keys` | Yes; required to enable push, together with the private key                         |
| `VAPID_PRIVATE_KEY` | Generated VAPID private key                       | Yes; required to enable push, together with the public key                          |
| `VAPID_SUBJECT`     | `mailto:admin@habitmaker.local`                   | Yes; defaults to this example subject                                               |
| `POSTGRES_HOST`     | `db` in Docker                                    | Yes; configure the PostgreSQL variables together to use PostgreSQL                  |
| `POSTGRES_PORT`     | `5432`                                            | Yes; defaults to `5432`                                                             |
| `POSTGRES_USER`     | `habitmaker`                                      | Yes; defaults to `habitmaker`                                                       |
| `POSTGRES_PASSWORD` | A strong, unique password                         | Yes for local/in-memory use; set a strong value when using PostgreSQL in production |
| `POSTGRES_DB`       | `habitmaker`                                      | Yes; defaults to `habitmaker`                                                       |
| `ADMIN_EMAIL`       | `admin@habitmaker.local`                          | Yes; set together with `ADMIN_PASSWORD` to seed an admin account                    |
| `ADMIN_PASSWORD`    | A unique password of at least 8 characters        | Yes; set together with `ADMIN_EMAIL` to seed an admin account                       |
| `GITHUB_TOKEN`      | A GitHub personal access token                    | Yes; needed only when accessing a private GitHub repository                         |
| `SMTP_HOST`         | `smtp.example.com`                                | Yes; required to enable email delivery                                              |
| `SMTP_PORT`         | `587` (STARTTLS) or `465` (implicit TLS)          | Yes; defaults to `587`                                                              |
| `SMTP_PROTOCOL`     | `smtp` or `smtps`                                 | Yes; defaults to `smtp`                                                             |
| `SMTP_USER`         | SMTP username                                     | Yes; set with `SMTP_PASSWORD` when the server requires authentication               |
| `SMTP_PASSWORD`     | SMTP password                                     | Yes; set with `SMTP_USER` when the server requires authentication                   |
| `SMTP_FROM`         | `no-reply@example.com`                            | Yes; required to enable email delivery                                              |

Access tokens always expire: sessions last 24 hours by default, or 30 days when the user chooses “Remember me”. Signed-in users can review and revoke device sessions from Settings. Session records contain a device/browser label and activity timestamps; access tokens are not stored in the API database. Expired and revoked records are pruned when a new session is created. Existing tokens issued before session tracking is enabled will require users to sign in again. To create an initial administrator account, set both `ADMIN_EMAIL` and `ADMIN_PASSWORD`; the password must be at least eight characters long.

To enable email delivery, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_PROTOCOL` (`smtp` for STARTTLS or `smtps` for implicit TLS), `SMTP_FROM`, and, when authentication is required, both `SMTP_USER` and `SMTP_PASSWORD`. Set `APP_URL` to the public address of the frontend so password reset emails link to the correct site (it defaults to `http://localhost:4200` in local API development). Reset links expire after one hour and can only be used once. Administrators can view these settings and send a test email from the application settings page. SMTP passwords are never returned to the web application.

To enable web push reminders, generate a VAPID key pair with `npx web-push generate-vapid-keys` and set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and (optionally) `VAPID_SUBJECT` on the API. Keep the private key secret. Push requires HTTPS in deployed environments (localhost is allowed for development), a supported browser/service worker, and notification permission granted by the user when they enable a reminder. In Docker, set these variables in `.env`; reminders and subscriptions are persisted in PostgreSQL. The API checks due reminders every 15 seconds and records each habit/device/local-day delivery to prevent duplicate notifications. Reminders are skipped for a habit already completed that day.

To use PostgreSQL, configure `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`; `POSTGRES_PORT` is optional and defaults to `5432`. When these variables are omitted, the API uses its in-memory sql.js database. If PostgreSQL configuration is started but incomplete, the API reports the missing variables. See `.env.example` for a template.

> **Development data:** Without PostgreSQL configuration, sql.js stores data in memory. Users, sessions, habits, and completions are lost when the API process restarts; this setup is not suitable for production persistence.

## Run with Docker

Install [Docker](https://docs.docker.com/get-docker/) with Docker Compose, then run these commands from the repository root. The Compose setup builds the frontend and API images and starts them with PostgreSQL:

```bash
cp .env.example .env
```

Edit `.env` before starting the services. Set a unique, random `JWT_SECRET` and a strong `POSTGRES_PASSWORD`. To create an initial administrator account, set both `ADMIN_EMAIL` and `ADMIN_PASSWORD`; the password must be at least eight characters long. Configure the SMTP variables to enable email delivery. The example file uses `APP_PORT=8080` and `CORS_ORIGIN=http://localhost:8080`; if you change `APP_PORT`, update `CORS_ORIGIN` to match.

Build and start the containers:

```bash
docker compose up --build -d
```

Open [http://localhost:8080](http://localhost:8080). The frontend serves the app and forwards `/api` requests to the API container. To use a different host port, change `APP_PORT` in `.env` and restart the stack.

View service logs or stop the containers with:

```bash
docker compose logs -f app api db
docker compose down
```

PostgreSQL data is kept in the `postgres-data` Docker volume when the containers are stopped or removed. To delete the containers and the database volume, run `docker compose down --volumes`; this permanently removes the stored data.

## Nx commands

Run tests for each project:

```bash
npm exec nx test HabitMakerApp
npm exec nx test HabitMakerApi
npm exec nx test HabitMakerUI
```

Build the frontend or API:

```bash
npm exec nx build HabitMakerApp
npm exec nx build HabitMakerApi
```

The frontend build output is written to `dist/apps/habit-maker-app` and the API build output to `dist/apps/habit-maker-api`.

## Releases

Releases are managed by `semantic-release` on pushes to `main` when Nx reports `HabitMakerApp` and/or `HabitMakerApi` as affected. Landing-only changes do not trigger a version update. Use [Conventional Commits](https://www.conventionalcommits.org/): `fix:` creates a patch release, `feat:` a minor release, and breaking changes (for example, `feat!:` or a `BREAKING CHANGE:` footer) a major release. A release updates the root `package.json`, `package-lock.json`, and `CHANGELOG.md` and creates a GitHub Release; the package is not published to npm.
