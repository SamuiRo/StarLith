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

Project files follow this structure (see `content/projects/*.md`):

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
