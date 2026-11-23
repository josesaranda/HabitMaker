# HabitMaker 🌿

[![CI](https://github.com/josesaranda/HabitMaker/actions/workflows/ci.yml/badge.svg?branch=next)](https://github.com/josesaranda/HabitMaker/actions/workflows/ci.yml)

> **🚀 Project Website:** [habitmaker.josesaranda.es](https://habitmaker.josesaranda.es)
> Explore the live project, detailed screenshots, Docker setup guides, and contribution guidelines there.

HabitMaker is a feature-rich habit tracking web application built as an Nx monorepo. It combines a modern Angular frontend with a robust NestJS API, all managed within a shared UI component library.

---

## ✨ Features Overview

- **Habit Management:** Create new habits and view them from a personalized home dashboard.
- **Tracking & History:** Track daily completions easily and browse detailed completion history in an integrated habit calendar.
- **Reminders:** Schedule per-habit daily web push reminders, respecting the user's local time zone.
- **User Authentication:** Secure sign-up, login, and password recovery mechanisms.
- **Security:** View active device sessions and revoke access from account settings.
- **Internationalization (i18n):** Seamless interface switching between English and Spanish.
- **Administration:** Comprehensive user management and application version checking for administrators.
- **Desktop Client:** Native desktop application (Tauri) that reuses the web frontend and connects to any HabitMaker server.
---

## 🛠️ Tech Stack & Architecture

This project utilizes a modern, enterprise-grade stack orchestrated by Nx:

| Layer                | Technology                                 | Description                                                                                                                 |
| :------------------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**         | Angular (22), TypeScript 6, Tailwind CSS 4 | The main client application. Provides a reactive and component-driven user interface.                                       |
| **Backend/API**      | NestJS (11), TypeScript                    | Handles business logic: authentication, habit data persistence, push notifications, and administration.                     |
| **Monorepo Tooling** | Nx (24)                                    | Manages the entire workspace structure and task orchestration across multiple applications and packages.                    |
| **Data Layer**       | TypeORM & PostgreSQL / sql.js              | **Production:** PostgreSQL for reliable persistence. **Development Default:** In-memory `sql.js` for quick local iteration. |
| **Shared UI**        | Angular Component Library                  | Reusable components (`@habit-maker/ui`) to ensure design consistency across all features.                                   |
| **Desktop**          | Tauri 2 (Rust)                             | Packages the Angular web app as a native desktop client, sharing the same frontend codebase.                                |
### 📂 Workspace Structure

```text
.
├── apps/
│   ├── habit-maker-landing/    # Astro project: Public marketing and landing page (Static content).
│   ├── habit-maker-app/       # Angular web application: The main user interface (Client-side logic).
│   ├── habit-maker-desktop/   # Tauri 2 shell: Packages the Angular app as a native desktop client.
│   └── habit-maker-api/       # NestJS API: Core backend services.
├── packages/
│   └── habit-maker-ui/        # Shared Angular UI components library.
├── nx.json                   # Nx workspace configuration files.
├── package.json              # Workspace dependencies and root npm scripts.
└── tsconfig.base.json        # Shared TypeScript compiler options.
```

---

## 🚀 Getting Started

Please choose the setup method that best fits your environment: **Docker** (Recommended for Production) or **Local CLI**.

### A. Using Docker Compose (Recommended)

This is the easiest way to run the full stack with a persistent PostgreSQL database.

> Cloning the repository checks out `main`, which always mirrors the latest release — so this setup runs exactly the released code, not work-in-progress from `next`.

1.  **Prerequisites:** Install [Docker](https://docs.docker.com/get-docker/) and Docker Compose.
2.  **Setup Environment Variables:**
    ```bash
    cp .env.example .env
    # IMPORTANT: Edit the .env file! Set a unique, random JWT_SECRET
    # and a strong POSTGRES_PASSWORD. Configure SMTP details for emails.
    ```
3.  **Build and Run Services:**
    ```bash
    docker compose up --build -d
    ```
4.  **Access:** The frontend will be available at [http://localhost:8080](http://localhost:8080).

- **Cleanup:** To stop containers and remove data volumes, run `docker compose down --volumes`.

### B. Local CLI Setup (Development)

Use this method for quick local development against an in-memory database (`sql.js`). _Warning: Data will be lost if the API restarts._

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run Services:** Open two separate terminals and run these commands:

    **Terminal 1 (API):**

    ```bash
    npm run start:api
    ```

    _(The API will listen on `http://localhost:3000/api`)_

    **Terminal 2 (App):**

    ```bash
    npm run start:app
    ```

    _(The Angular frontend will be available at [http://localhost:4200](http://localhost:4200))_

### C. Desktop App (Tauri)

The desktop client reuses the Angular web app and is built with Tauri 2. See
[`apps/habit-maker-desktop/README.md`](apps/habit-maker-desktop/README.md) for
full prerequisites (Rust toolchain, platform build tools) and details.

1.  **Install Dependencies:** `npm install` (workspace root).
2.  **Run in Development:**
    ```bash
    npm run start:desktop
    ```
    _(Starts the Angular app and opens it in a Tauri window with hot reload.)_
3.  **Build Installers/Bundles:**
    ```bash
    npm run build:desktop
    ```
    _(Build artifacts are written to `apps/habit-maker-desktop/src-tauri/target/`.)_

On first launch the app asks for the HabitMaker server address; it can be
changed later from **Settings → Server**.

---

## ⚙️ Configuration & Environment Variables

All configuration is managed via environment variables in the `.env` file. The API documentation provides detailed variable descriptions, but here are key groups:

**Authentication:**

- `JWT_SECRET`: Must be a unique, strong secret.
- `ADMIN_EMAIL`/`ADMIN_PASSWORD`: Set these together to seed the initial administrator account.

**Persistence (Database):**

- **For PostgreSQL (Docker):** `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
- **For Local Development:** Omit database variables; the API defaults to `sql.js` in-memory storage.

**Settings encryption:**

- `SETTINGS_ENCRYPTION_KEY`: 32-byte key used to encrypt secrets stored in the database (SMTP password and VAPID private key). Generate one with `openssl rand -base64 32`. It must be identical across API instances and must not be stored in the database.

**External Services:**

- **Email (SMTP)** and **Web Push Notifications (VAPID):** administrators can configure these from the administration panel. The values are stored in the database and their secrets are encrypted with `SETTINGS_ENCRYPTION_KEY`.
- The `SMTP_*` and `VAPID_*` environment variables remain supported as a fallback for existing deployments. Once an administrator saves the configuration in the panel, the database becomes the source of truth.

---

## 🧪 Running Tasks & Development Commands

Use `npm exec nx <target> [project]` to run tasks.

| Goal                       | Command Example                   | Notes                                                       |
| :------------------------- | :-------------------------------- | :---------------------------------------------------------- |
| **Run All Tests**          | `npm exec nx test HabitMakerApp`  | Run tests for a specific application (e.g., API, App).      |
| **Build Frontend**         | `npm exec nx build HabitMakerApp` | Output written to `dist/apps/habit-maker-app`.              |
| **Build Backend**          | `npm exec nx build HabitMakerApi` | Output written to `dist/apps/habit-maker-api`.              |
| **Build Desktop**          | `npm run build:desktop`          | Tauri bundles written to `apps/habit-maker-desktop/src-tauri/target/`. |
| **View Project Structure** | Use the `nx-workspace` skill.     | Ideal for understanding dependencies and available targets. |
### 🔖 Release Management

Releases are published with [`semantic-release`](https://github.com/semantic-release/semantic-release) when the **Release** workflow is manually dispatched on `next`, after CI has passed for that commit.

- **`main`** (the default branch) mirrors the latest release: after each release it is fast-forwarded to the release commit. This is what users clone and run with `docker compose up`. Never commit to it directly, and never open pull requests against it.
- **`next`** is the base branch: all new work starts from `next`, and pull requests target it (CI rejects PRs aimed at `main`).
- **Commit Convention:** Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `fix:` $\rightarrow$ Patch Release (`x.y.Z`)
  - `feat:` $\rightarrow$ Minor Release (`x.Y.0`)
  - `feat!:` or `BREAKING CHANGE:` $\rightarrow$ Major Release (`X.0.0`)

---

## 🌐 Contributing

1.  **Setup:** Follow the "Getting Started" section above to get the project running locally.
2.  **Branch:** Create feature branches from `next` and open pull requests against `next` (never `main` — CI rejects those). Both `next` and `main` are protected — never commit to them directly.
3.  **Develop:** Use the appropriate agent/skill (e.g., `frontend` for UI, `backend` for API logic) when making changes.
4.  **Test:** Always run the relevant tests (`npm exec nx test <project>`) before submitting a pull request.

_Feel free to refer to the [OpenCode documentation](https://opencode.dev/) if you are working on our tooling or agent infrastructure._
