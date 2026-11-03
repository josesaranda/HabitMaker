# HabitMaker

HabitMaker is a habit-tracking web application in an Nx monorepo. It includes an Angular frontend, a NestJS API, and a shared UI component library.

## Features

- Create habits and view them from a personal home page.
- Track daily completions and browse completion history in a habit calendar.
- Sign up, log in, and submit a password-recovery request.
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
│   ├── habit-maker-app/       # Angular web application
│   │   └── src/app/           # Routes, screens, auth, habits, and localization
│   └── habit-maker-api/       # NestJS API (auth, habits, completions, admin, version)
├── packages/
│   └── habit-maker-ui/        # Shared Angular UI components
├── nx.json                   # Nx workspace configuration
├── package.json              # Workspace dependencies and npm scripts
└── tsconfig.base.json        # Shared TypeScript configuration
```

The frontend routes include `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/home`, `/habits/:id`, and `/settings`. The home, habit detail, and settings pages require authentication. The root route and unknown routes redirect to `/login`.

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

The API accepts `SERVER_PORT` and `CORS_ORIGIN` environment variables; by default it listens on port `3000` and allows requests from `http://localhost:4200`. To create an initial administrator account, set both `ADMIN_EMAIL` and `ADMIN_PASSWORD` before starting the API. The password must be at least eight characters long.

To enable email delivery, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_PROTOCOL` (`smtp` for STARTTLS or `smtps` for implicit TLS), `SMTP_FROM`, and, when authentication is required, both `SMTP_USER` and `SMTP_PASSWORD`. Set `APP_URL` to the public address of the frontend so password reset emails link to the correct site (it defaults to `http://localhost:4200` in local API development). Reset links expire after one hour and can only be used once. Administrators can view these settings and send a test email from the application settings page. SMTP passwords are never returned to the web application.

To use PostgreSQL, configure `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`; `POSTGRES_PORT` is optional and defaults to `5432`. When these variables are omitted, the API uses its in-memory sql.js database. If PostgreSQL configuration is started but incomplete, the API reports the missing variables. See `.env.example` for a template.

> **Development data:** Without PostgreSQL configuration, sql.js stores data in memory. Users, habits, and completions are lost when the API process restarts; this setup is not suitable for production persistence.

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

Releases are managed by `semantic-release` on the `main` branch. Use [Conventional Commits](https://www.conventionalcommits.org/): `fix:` creates a patch release, `feat:` a minor release, and breaking changes (for example, `feat!:` or a `BREAKING CHANGE:` footer) a major release. A release updates the root `package.json`, `package-lock.json`, and `CHANGELOG.md` and creates a GitHub Release; the package is not published to npm.
