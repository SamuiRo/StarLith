# StarLith Documentation

Documentation for the StarLith portfolio site — a NieR: Automata-styled resume built with Angular 20.

## Contents

| Document | Description |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Tech stack, project structure, components, services, data flow |
| [CONTENT.md](CONTENT.md) | Content management: configs, markdown files, example vs prod content |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Build configurations and Firebase Hosting deployment |
| [ISSUES.md](ISSUES.md) | Known issues and technical debt from the code review |
| [IDEAS.md](IDEAS.md) | Unscheduled future ideas (e.g. a NieR-style mini-game) |

## Quick Orientation

- **App code:** `src/app/` — standalone components, no NgModules
- **Content:** `content/example/` (committed, demo data) and `content/prod/` (gitignored, personal data) — outside `src/`, mapped to `assets/` at build time
- **Which content is served** is decided at build time via `src/environments/` file replacement
- **Hosting:** Firebase Hosting, SPA rewrite of all routes to `index.html`

For setup and quick start, see the root [README.md](../README.md).
