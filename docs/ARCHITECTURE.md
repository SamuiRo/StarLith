# Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 20 (standalone components, no NgModules) |
| Language | TypeScript 5.8 |
| Styling | SCSS (per-component styles + global `src/styles.scss`) |
| Animations | animejs 3.x |
| Markdown rendering | ngx-markdown 20 (marked 16 under the hood) |
| HTTP | Angular HttpClient (loads content from static assets) |
| Testing | Karma + Jasmine (default Angular setup) |
| Hosting | Firebase Hosting (static SPA) |

## High-Level Overview

StarLith is a fully static single-page application. There is no backend: all
content lives as static assets (JSON configs + markdown files) that the app
fetches over HTTP at runtime and renders with ngx-markdown.

```mermaid
flowchart LR
    A["/ (redirect)"] --> B[/loading/]
    B -- "typing animation finishes" --> C[/home/]
    C --> D[/aboutme/]
    C --> E[/projects/]
    C --> F[/skills/]
    C --> G[/contact/]
    D & E & F & G -- "Esc" --> C

    subgraph assets ["Static assets (environment.dataPath)"]
        H["data/&lt;section&gt;.config.json"]
        I["content/&lt;section&gt;/*.md"]
    end

    D & E & F & G -- "HttpClient GET" --> H
    H -- "contentFile list" --> I
```

## Directory Structure

```
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── app/                    # Root component (<app-root>, router outlet)
│   │   │   ├── loading/                # Boot screen: typing console animation → /home
│   │   │   ├── home/                   # Main menu, keyboard + mouse navigation
│   │   │   ├── aboutme/                # Content section (config-driven)
│   │   │   ├── projects/               # Content section (config-driven)
│   │   │   ├── skills/                 # Content section (config-driven)
│   │   │   ├── contact/                # Content section (config-driven)
│   │   │   ├── main-menu-button/       # Reusable menu button (particles, ornamental lines)
│   │   │   ├── scan-line-effect/       # CRT scan-line visual effect
│   │   │   └── chromatic-aberration/   # SVG-filter chromatic aberration effect
│   │   ├── services/
│   │   │   ├── typing-animation/       # Terminal-style typing animation (animejs)
│   │   │   └── scan-line/              # ⚠ unused duplicate of scan-line-effect component
│   │   ├── app.config.ts               # Providers: router, http, markdown, zone
│   │   └── app.routes.ts               # Route table
│   ├── assets/
│   │   ├── example/                    # Demo content (committed to git)
│   │   └── prod/                       # Personal content (gitignored)
│   ├── environments/                   # dataPath switch: example vs prod
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── public/                             # Static files copied to build root (favicon, images)
├── angular.json                        # Build configurations (development / production / test)
└── firebase.json                       # Firebase Hosting config (gitignored)
```

## Routing

Defined in [`src/app/app.routes.ts`](../src/app/app.routes.ts):

| Path | Component | Note |
|---|---|---|
| `/` | — | Redirects to `/loading` |
| `/loading` | `Loading` | Boot animation, auto-navigates to `/home` when done |
| `/home` | `Home` | Main menu |
| `/aboutme` | `Aboutme` | Config-driven content section |
| `/projects` | `Projects` | Config-driven content section |
| `/skills` | `Skills` | Config-driven content section |
| `/contact` | `Contact` | Config-driven content section |
| `**` | — | Redirects to `/loading` |

Every route sets a static `title`. Firebase rewrites all URLs to `index.html`,
so deep links work in production.

## Content Section Components

`Aboutme`, `Projects`, `Skills`, and `Contact` share the same design (currently
as four near-identical copies — see [ISSUES.md](ISSUES.md#дублювання-секційних-компонентів)):

1. On `ngOnInit`, fetch `<dataPath>/data/<section>.config.json` — an array of
   `{ id, title, contentFile }` entries that defines the submenu.
2. Fetch every referenced markdown file from `<dataPath>/content/<section>/` in
   parallel (`forkJoin`).
3. Render the selected file with `<markdown [data]>`.
4. On any HTTP error, fall back to hardcoded `# No Data` placeholders.

Keyboard handling is implemented with a `window:keydown` `@HostListener`:
`W`/`S`/arrows move the selection, `Esc` returns to `/home`.

## Visual Effects

- **`TypingAnimation` service** — drives the loading screen: types each console
  line character-by-character with a blinking cursor (animejs-based).
- **`ScanLineEffect` component** — renders randomized horizontal CRT scan
  lines, looping opacity animation.
- **`ChromaticAberration` component** — SVG filter offsetting red/blue
  channels with a "breathing" animation; intensity configurable via `@Input`.
- **`MainMenuButton` component** — home menu button with activation timeline
  (ornamental lines, dots) and looping particle animation.

## Environments & Content Switching

The only environment difference is which content folder is served:

| File | `production` | `dataPath` |
|---|---|---|
| `environment.ts` (default / development) | `false` | `assets/example/` |
| `environment.prod.ts` (production build) | `true` | `assets/prod/` |
| `environment.test.ts` (test config) | `false` | `assets/example/` |

`angular.json` swaps the file via `fileReplacements` in the `production` and
`test` build configurations. See [DEPLOYMENT.md](DEPLOYMENT.md).
