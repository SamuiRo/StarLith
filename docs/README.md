# StarLith Documentation

Documentation for the StarLith portfolio site — a NieR: Automata-styled resume built with Angular 20.

## Contents

| Document | Description |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Tech stack, project structure, components, services, data flow |
| [CONTENT.md](CONTENT.md) | Content management: configs, markdown files, example vs prod content |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Build configurations and Firebase Hosting deployment |
| [ISSUES.md](ISSUES.md) | Known issues and technical debt from the code review (Ukrainian) |
| [site_update/](site_update/) | Working notes for the current content update (Ukrainian) |

## Quick Orientation

- **App code:** `src/app/` — standalone components, no NgModules
- **Content:** `src/assets/example/` (committed, demo data) and `src/assets/prod/` (gitignored, personal data)
- **Which content is served** is decided at build time via `src/environments/` file replacement
- **Hosting:** Firebase Hosting, SPA rewrite of all routes to `index.html`

For setup and quick start, see the root [README.md](../README.md).
