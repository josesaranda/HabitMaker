# HabitMaker Desktop

Tauri 2 shell for HabitMaker. It packages the Angular application from
`apps/habit-maker-app` as a native desktop app, so there is a single frontend
codebase shared by the web and desktop clients.

## Prerequisites

- Node.js and the workspace dependencies (`npm install`).
- Rust (stable) installed with [rustup](https://rustup.rs/). Verify with
  `cargo --version`.
- Platform build tools:
  - macOS: Xcode Command Line Tools (`xcode-select --install`).
  - Windows: Microsoft C++ Build Tools and WebView2.
  - Linux: the WebKitGTK and related packages listed in the
    [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

## Commands

```bash
# Start the Angular app and open it in a Tauri window (hot reload)
npm run start:desktop

# Build the desktop installers/bundles
npm run build:desktop

# Debug build (faster to compile, no bundling)
npm exec nx run HabitMakerDesktop:build-debug
```

`tauri dev` starts `nx run HabitMakerApp:serve` automatically, and
`tauri build` runs `nx run HabitMakerApp:build:desktop`. The production Tauri
build does not include the Angular service worker.

Build artifacts are written to `apps/habit-maker-desktop/src-tauri/target/`.
On macOS, the app bundle is under
`src-tauri/target/release/bundle/macos/HabitMaker.app`.

## API connection

The web build keeps using the relative `/api` path served by Nginx. A desktop
build has no origin to proxy through, so on first launch the app asks for the
HabitMaker server address (for example `https://habits.example.com` or
`http://localhost:8080/api`). The address is saved in the webview local storage
and can be changed later from **Settings → Server**.

When only an origin is entered, `/api` is appended automatically. The app
checks `<API URL>/health` before saving.

The API allows the Tauri webview origins (`tauri://localhost`,
`http://tauri.localhost` and `https://tauri.localhost`) in addition to the
origins listed in `CORS_ORIGIN`, so the desktop client can connect to the same
Docker Compose deployment as the web client.

## Docker

Docker Compose still runs the full web deployment (web frontend + API +
PostgreSQL). The desktop app is a separate client that points at that
deployment, or at any other reachable HabitMaker server, through the address
configured on first launch.
