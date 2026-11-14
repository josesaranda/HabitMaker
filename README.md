# HabitMaker 🌿

[![CI](https://github.com/josesaranda/HabitMaker/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/josesaranda/HabitMaker/actions/workflows/ci.yml)

> **🚀 Project Website:** [habitmaker.josesaranda.es](https://habitmaker.josesaranda.es)
> Explore the live project, detailed screenshots, Docker setup guides, and contribution guidelines there.

HabitMaker is a feature-rich habit tracking web application built as an Nx monorepo. It combines a modern Angular frontend with a robust NestJS API, all managed within a shared UI component library.

---

## ✨ Features Overview
*   **Habit Management:** Create new habits and view them from a personalized home dashboard.
*   **Tracking & History:** Track daily completions easily and browse detailed completion history in an integrated habit calendar.
*   **Reminders:** Schedule per-habit daily web push reminders, respecting the user's local time zone.
*   **User Authentication:** Secure sign-up, login, and password recovery mechanisms.
*   **Security:** View active device sessions and revoke access from account settings.
*   **Internationalization (i18n):** Seamless interface switching between English and Spanish.
*   **Administration:** Comprehensive user management and application version checking for administrators.

---

## 🛠️ Tech Stack & Architecture
This project utilizes a modern, enterprise-grade stack orchestrated by Nx:

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Angular (22), TypeScript 6, Tailwind CSS 4 | The main client application. Provides a reactive and component-driven user interface. |
| **Backend/API** | NestJS (11), TypeScript | Handles business logic: authentication, habit data persistence, push notifications, and administration. |
| **Monorepo Tooling** | Nx (24) | Manages the entire workspace structure and task orchestration across multiple applications and packages. |
| **Data Layer** | TypeORM & PostgreSQL / sql.js | **Production:** PostgreSQL for reliable persistence. **Development Default:** In-memory `sql.js` for quick local iteration. |
| **Shared UI** | Angular Component Library | Reusable components (`@habit-maker/ui`) to ensure design consistency across all features. |

### 📂 Workspace Structure
```text
.
├── apps/
│   ├── habit-maker-landing/    # Astro project: Public marketing and landing page (Static content).
│   ├── habit-maker-app/       # Angular web application: The main user interface (Client-side logic).
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

*   **Cleanup:** To stop containers and remove data volumes, run `docker compose down --volumes`.

### B. Local CLI Setup (Development)
Use this method for quick local development against an in-memory database (`sql.js`). *Warning: Data will be lost if the API restarts.*

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Run Services:** Open two separate terminals and run these commands:

    **Terminal 1 (API):**
    ```bash
    npm run start:api
    ```
    *(The API will listen on `http://localhost:3000/api`)*

    **Terminal 2 (App):**
    ```bash
    npm run start:app
    ```
    *(The Angular frontend will be available at [http://localhost:4200](http://localhost:4200))*

---

## ⚙️ Configuration & Environment Variables

All configuration is managed via environment variables in the `.env` file. The API documentation provides detailed variable descriptions, but here are key groups:

**Authentication:**
*   `JWT_SECRET`: Must be a unique, strong secret.
*   `ADMIN_EMAIL`/`ADMIN_PASSWORD`: Set these together to seed the initial administrator account.

**Persistence (Database):**
*   **For PostgreSQL (Docker):** `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
*   **For Local Development:** Omit database variables; the API defaults to `sql.js` in-memory storage.

**External Services:**
*   **Email (SMTP):** Requires setting `SMTP_HOST`, `SMTP_PORT`, `SMTP_PROTOCOL`, and credentials (`SMTP_USER`/`SMTP_PASSWORD`) if authentication is required.
*   **Web Push Notifications (VAPID):** Use `npx web-push generate-vapid-keys`. Set the resulting `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`.

---

## 🧪 Running Tasks & Development Commands

Use `npm exec nx <target> [project]` to run tasks.

| Goal | Command Example | Notes |
| :--- | :--- | :--- |
| **Run All Tests** | `npm exec nx test HabitMakerApp` | Run tests for a specific application (e.g., API, App). |
| **Build Frontend** | `npm exec nx build HabitMakerApp` | Output written to `dist/apps/habit-maker-app`. |
| **Build Backend** | `npm exec nx build HabitMakerApi` | Output written to `dist/apps/habit-maker-api`. |
| **View Project Structure** | Use the `nx-workspace` skill. | Ideal for understanding dependencies and available targets. |

### 🔖 Release Management
Releases are automated via [`semantic-release`](https://www.conventionalcommits.org/) on pushes to `main`, provided that Nx reports changes in either `HabitMakerApp` or `HabitMakerApi`.

*   **Commit Convention:** Follow [Conventional Commits](https://www.conventionalcommits.org/):
    *   `fix:` $\rightarrow$ Patch Release (Minor version increment)
    *   `feat:` $\rightarrow$ Minor Release (Major version increment)
    *   `feat!:` or `BREAKING CHANGE:` $\rightarrow$ Major Release

---

## 🌐 Contributing
1.  **Setup:** Follow the "Getting Started" section above to get the project running locally.
2.  **Develop:** Use the appropriate agent/skill (e.g., `frontend` for UI, `backend` for API logic) when making changes.
3.  **Test:** Always run the relevant tests (`npm exec nx test <project>`) before submitting a pull request.

*Feel free to refer to the [OpenCode documentation](https://opencode.dev/) if you are working on our tooling or agent infrastructure.*