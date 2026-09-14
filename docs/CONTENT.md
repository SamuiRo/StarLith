# Content Management

All site content is data: JSON configs define the menus, markdown files hold
the text. No code changes are needed to edit content.

## Two Content Trees

Content lives in a top-level `content/` folder, **outside `src/`** — it's
data, not application code, so it's kept separate from the Angular app.

| Folder (on disk) | Committed? | Used by | Purpose |
|---|---|---|---|
| `content/example/` | ✅ yes | `npm run start`, `npm run build` | Demo/template content for anyone cloning the repo |
| `content/prod/` | ❌ gitignored | `npm run start:prod`, `npm run build:prod` | Real personal content |

> ⚠️ Because `content/prod/` is gitignored, it exists **only on this
> machine**. Keep a private backup (private repo, archive, or cloud copy) —
> losing the disk means losing all real site content.

At build time, `angular.json` maps each folder into the app's static assets
(`content/example/` → served at `assets/example/`, `content/prod/` → served
at `assets/prod/`) — this is why every runtime path below (in configs,
markdown `<img>` tags, `environment.dataPath`) still starts with `assets/`
rather than `content/`. If `content/prod/` doesn't exist (e.g. a fresh clone
before anyone has added personal content), the build simply skips it —
`npm run build`/`npm run start` (example content) work fine either way.

Both trees have the same layout:

```
<tree>/
├── data/
│   ├── aboutme.config.json
│   ├── projects.config.json
│   ├── skills.config.json
│   └── contact.config.json
├── content/
│   ├── aboutme/*.md
│   ├── projects/*.md
│   ├── skills/*.md
│   └── contact/*.md
├── image/          # optional, referenced from markdown via <img>
└── files/          # optional, downloadable files (e.g. CV.pdf)
```

## Config Format

Each `data/<section>.config.json` is an ordered array. **Array order = menu
order** — this is how you control what appears first.

```json
[
  {
    "id": "unique-id",          // internal id, must be unique within the section
    "title": "Display Title",   // what the visitor sees in the submenu
    "contentFile": "file.md"    // file inside content/<section>/
  }
]
```

Rules:

- A markdown file that exists on disk but is **not listed in the config is
  invisible** on the site. Adding a new `.md` file always requires adding a
  config entry.
- `title` is free text — the filename does not need to match it (e.g. the file
  can stay `project_008.md` while the title reads `Instagram_Automation.MD`).
- If the config or any listed file fails to load, the whole section falls back
  to `# No Data` placeholders (one bad path breaks the section — check the
  browser console for the failing URL).
- ⚠️ **In production a misspelled `contentFile` does not fall back.** Firebase
  answers a missing file with `200` + `index.html`, so the section shows
  garbage instead of `# No Data`, and `npm run start:prod` won't reproduce it
  (the dev server returns a real `404`). After adding or renaming a file,
  open that exact URL on the deployed site once. See
  [ISSUES.md](ISSUES.md), item 24.

## Markdown Files

Standard markdown rendered by ngx-markdown. Raw HTML also works, e.g. the
profile photo:

```html
<img src="assets/prod/image/photo.webp" alt="photo" width="300" height="300"/>
```

Note: image paths are runtime URLs, not disk paths — relative to the site
root and must include the served content tree (`assets/prod/...` or
`assets/example/...`), so an `<img>` in prod content must point into
`assets/prod/` even though the file itself lives on disk under
`content/prod/`.

### Project File Convention

Project files follow this structure (see `content/<tree>/content/projects/*.md`):

```markdown
# Project Title

**Type:** ...
**Role:** ...

## Challenge
## Solution
## Responsibilities
## Impact
## Tech Stack
```

## Common Tasks

**Add a project:**
1. Create `content/projects/project_XXX.md` (or a descriptive filename).
2. Add an entry to `data/projects.config.json` at the position where it should
   appear in the menu.

**Reorder projects:** reorder the entries in `projects.config.json`.

**Add a skills category:** create the `.md` file, add an entry to
`skills.config.json`.

**Rename a menu item:** change `title` in the config — no file rename needed.

**Preview prod content locally:** `npm run start:prod` (serves with
`assets/prod/` as the data path).

## Third-Party IP Guardrails

The site is an unofficial fan tribute to the visual language of the NieR
series. That position holds only while the content stays original, so these
rules apply to every markdown file and image:

- **Own words and own images only.** No game quotes, screenshots, logos,
  character art, textures, UI sprites or music — not even attributed.
  Recreating a *style* is fine; copying *material* is not.
- **The non-affiliation statement lives in three places — keep them in
  sync** when rewording:
  1. `content/prod/content/aboutme/faq.md` — "Are you a NieR series fan?"
     (the long version);
  2. the disclaimer strip below the fold on Home
     (`src/app/components/home/home.html`);
  3. the root `README.md` — the note under the intro and the `Disclaimer`
     section.
- **License wording:** the FAQ may invite people to fork the *code* (GPL
  v3), never "the design" — the license can only cover what the author has
  the right to license. The README spells out that it grants no rights to
  third-party IP.
- **No commercial calls to action here** — no pricing, "Hire me" or "Get a
  quote" blocks. Stating availability for full-time or contract work (the
  "Are you available for hire?" FAQ entry) is fine; selling services through
  the tribute interface is not.

## Downloadable Files (CV)

The "Download CV" button on Home (5th menu item) and Contact links to
`<dataPath>files/CV.pdf` (a runtime URL — resolves to `assets/prod/files/CV.pdf`
in production).

- **Location on disk:** `content/prod/files/CV.pdf` (create the `files/`
  folder if it doesn't exist yet — it's gitignored along with the rest of
  `prod/`).
- **Filename must be exactly `CV.pdf`.** The name is intentionally generic
  (not `CV_FirstName_LastName.pdf`) so the button code has zero hardcoded
  personal data — anyone reusing this template just drops their own
  `CV.pdf` in place, no code changes needed. The browser's Save-As dialog
  still shows a clean `CV.pdf` to the visitor regardless of the source
  filename.
