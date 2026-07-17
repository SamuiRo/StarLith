# Build & Deployment

## NPM Scripts

| Script | Command | Content tree | Notes |
|---|---|---|---|
| `npm run start` | `ng serve` | `assets/example/` | Dev server, http://localhost:4200 |
| `npm run start:prod` | `ng serve --configuration production` | `assets/prod/` | Preview real content locally |
| `npm run build` | `ng build` | `assets/example/` | Development build (no optimization) |
| `npm run build:prod` | `ng build --configuration production` | `assets/prod/` | Optimized, hashed output |
| `npm run watch` | `ng build --watch --configuration development` | `assets/example/` | Rebuild on change |
| `npm run test` | `ng test` | `assets/example/` | Karma + Jasmine |

## Build Configurations (`angular.json`)

- **development** (default): sourcemaps, no optimization.
- **production**: replaces `environment.ts` → `environment.prod.ts`
  (switches `dataPath` to `assets/prod/`), output hashing, budgets
  (initial bundle warn 500 kB / error 1 MB; component styles warn 10 kB /
  error 15 kB).
- **test**: replaces `environment.ts` → `environment.test.ts`, sourcemaps,
  no optimization.

Build output goes to `dist/StarLith/browser/`.

## Firebase Hosting

The site is hosted on Firebase Hosting (live at `starlithdev.web.app`).
`firebase.json` and `.firebaserc` are **gitignored**, so they exist only
locally. Current hosting config:

```json
{
  "hosting": {
    "public": "dist/StarLith/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

The catch-all rewrite makes deep links (`/projects`, `/skills`, …) work: every
URL serves `index.html` and the Angular router takes over.

## Deploy Procedure

```bash
# 1. Build with production content
npm run build:prod

# 2. Deploy to Firebase Hosting
firebase deploy --only hosting
```

Prerequisites: `firebase-tools` installed (`npm i -g firebase-tools`),
logged in (`firebase login`), and a local `.firebaserc` pointing at the
project.

## Version Bumps

The project uses simple manual versioning in `package.json` (`0.0.x`), with
matching commit messages like `v0.0.3 images optimization, ...`. Bump the
version when deploying a notable change.
