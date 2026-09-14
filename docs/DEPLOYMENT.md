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
  error 15 kB). `home.scss` currently sits at ~10.9 kB, so every production
  build prints one budget warning — harmless, tracked in
  [ISSUES.md](ISSUES.md), item 27.
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

Side effect: it also applies to **asset URLs that don't exist**. A request for
a missing file under `assets/` gets `200` + `index.html` instead of `404`
(verified on the live site 2026-09-13). Locally `ng serve` returns a real
`404`, so a broken content path can pass a local check and still break in
production — see [ISSUES.md](ISSUES.md), item 24.

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

**After changing `public/og_cover.jpg`** — the link-preview image — social
networks keep serving their cached copy for days. Force a re-scrape once
after the deploy:

- Facebook / Messenger — Sharing Debugger → *Scrape Again*
- LinkedIn — Post Inspector
- Telegram — send the URL to `@WebpageBot`

The file keeps a stable name on purpose (see
[ARCHITECTURE.md](ARCHITECTURE.md#static-assets-srcassetsimages-vs-public)),
which is exactly why these caches need a manual nudge.

## Version Bumps

The project uses simple manual versioning in `package.json` — `0.0.x`
before launch, `1.x` since `v1.0.0` — with matching commit messages like
`v1.0.1 update README, add footer, minor fix`. Bump the version when
deploying a notable change.
