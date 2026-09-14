# Known Issues & Technical Debt

Code review results from 2026-07-17, follow-up review 2026-09-13 (items
22–28). Status: ⬜ open · ✅ resolved.

This document covers everything related to code and configuration (content
planning notes that originally lived in `site_update/` have since been
applied and removed by the owner).

> 📁 **Paths in entries before 2026-07-18** reference
> `src/assets/{example,prod}/…` — that was the old content location. After
> item 17, content lives in `content/{example,prod}/` (outside `src/`); the
> runtime URL (`assets/example/`, `assets/prod/`) didn't change. Entries
> below are intentionally not rewritten after the fact — this is a
> chronological changelog of fixes, not a living spec; for the current
> structure see [CONTENT.md](CONTENT.md).

---

## 🔴 Critical — new content wasn't showing on the site

### ✅ 1. `projects.config.json` wasn't updated for new content

**File:** `src/assets/prod/data/projects.config.json`

- `project_008.md` (Instagram Order Automation) existed in `content/projects/`
  but wasn't wired into the config.
- Menu titles were generic: `Project_001.MD` … `Project_007.MD`.
- Order wasn't date-based.

**Resolved 2026-07-17:** config updated — project_008 added first, all 8
projects given meaningful terminal-style `title`s (`Instagram_Order_Automation.MD`
etc.), order aligned to descending dates (from the content owner's period
table): Instagram (Mar 2026) → Social Media Aggregator + Discord/Telegram
Bots (Sep 2025 – Feb 2026) → DeFi Yield (Nov 2024 – May 2025) → Auto
Dealership (Jan–Oct 2024) → Breast Cancer Clinic (2023) → Restaurant Chain
(2022) → Dental Network AU (2021–2022). Verified locally
(`npm run start:prod`) — all 8 menu items render, project_008 opens first
correctly.

### ✅ 2. `skills.config.json` was missing the new AI section

**File:** `src/assets/prod/data/skills.config.json`

`content/skills/ai.md` (AI-Assisted Development) existed but was missing
from the config.

**Resolved 2026-07-17:** added entry `{ "id": "ai", "title": "AI",
"contentFile": "ai.md" }` at the end of the list (after Automation).
Verified locally — the "AI" item appears in the Skills menu and renders its
content correctly.

---

## 🟠 High priority — recruiter-facing functionality

### ✅ 3. No Download CV button

`CV.pdf` didn't exist in the project.

**Resolved 2026-07-17:** added a "Download CV" button on Home (under the
main menu) and on Contact (in the header next to the title), both styled to
match the page theme and responsive on mobile. The button links to
`${environment.dataPath}files/CV.pdf` — a path with zero hardcoded personal
data in the code (the filename is intentionally generic, `CV.pdf`, details
in [CONTENT.md](CONTENT.md#downloadable-files-cv)). The owner drops the file
in `content/prod/files/CV.pdf` (gitignored). Verified locally — the link
renders with the correct href on both Home and Contact, desktop and mobile
widths.

> 🔄 **Updated by item 14 (2026-07-17):** the Home button's appearance
> changed — instead of a standalone button "under the main menu" it became
> the 5th item of the menu itself (the same `MainMenuButton`). The logic
> (file path, `download` attribute) didn't change, only how it renders on
> Home. See item 14 below for details.

### ✅ 4. SEO: the site was invisible to search engines and parsers

Before: `<title>StarLith</title>`, no `meta description`, no OG tags; route
titles were generic ("Home", "Loading"); all content renders via JS + HTTP.

**Resolved 2026-07-17:**
- `src/index.html`: title, meta description, `meta robots`, `canonical`,
  `theme-color`, a full set of Open Graph (title/description/url/image
  1344×768) and Twitter Card tags, JSON-LD `Person` schema (name, job title,
  LinkedIn/GitHub via `sameAs`, email), `<noscript>` fallback with text
  description and contacts for non-JS parsers.
- `src/app/app.routes.ts`: meaningful, unique titles per route
  (`About Me — Serhii Vasiliev | StarLith` etc.) — Angular Router sets these
  on `document.title` automatically, no extra code needed.
- `public/robots.txt` and `public/sitemap.xml` — added for indexing
  (copied to the build root via the existing `public` asset entry in
  `angular.json`, no config changes needed).

Verified locally: all meta tags, JSON-LD, and titles are correctly present
in the DOM on every route.

> 🔄 **Updated by item 21 (2026-09-01):** the Open Graph / Twitter image is
> no longer `assets/images/home_background.png` (1344×768) but a dedicated
> `public/og_cover.jpg` (1300×630).

**Deliberately not done:** prerender/SSG. Since content loads via HttpClient
at runtime rather than being bundled, full SSR/SSG would require a separate
architectural change (Angular Universal + build-time fetch). Crawlers that
don't execute JS will only see the static meta tags from `index.html`
(already enough for link-preview and baseline SEO); Google and most modern
crawlers execute JS and will see the full content.

---

## 🟡 Code-level technical debt

### ⬜ 5. Section components — 4 copies of the same code

**Files:** `src/app/components/{aboutme,projects,skills,contact}/*.ts`

`Aboutme`, `Projects`, `Skills`, `Contact` are the same component (~170
lines), copy-pasted 4 times. They only differ in: section name in the config
URL and content path. A side effect of the copy-paste — `Projects`,
`Skills`, `Contact` kept Aboutme's fallback data (`Profile / Story /
Qualities / Tech`), which doesn't match their actual sections.

**Fix:** one generic `SectionComponent` that gets its section name via route
`data` (`{ path: 'projects', component: Section, data: { section:
'projects' } }`). Cuts ~500 lines; the four templates and stylesheets also
collapse into one. This closes out "Component Optimization" from Planned
Features in the README.

### ✅ 6. Dead code: duplicate scan-line service

**File:** `src/app/services/scan-line/scan-line.ts`

An `@Injectable` class `ScanLineEffect` — an exact copy of the *component*
of the same name at
`src/app/components/scan-line-effect/scan-line-effect.ts`. Never imported
anywhere (verified with grep). Also: the service's `ngOnInit` was never
called (Angular doesn't call `OnInit` on injectables), so the code wouldn't
have worked even if used.

**Resolved 2026-07-17:** `src/app/services/scan-line/` (along with its
spec) deleted. `npx ng build` passes with no errors after removal.

### ✅ 7. Listener leak in Home

**File:** `src/app/components/home/home.ts`

`window.addEventListener('resize', ...)` in `ngOnInit` with no cleanup —
every return to `/home` added a new listener.

**Resolved 2026-07-17:** replaced with `@HostListener('window:resize')` on
the `checkIfMobile()` method — symmetric to the existing `@HostListener` for
keydown; Angular removes the listener automatically on component
destruction. Verified locally: `window.dispatchEvent(new Event('resize'))`
correctly toggles `isMobile`/`selectedIndex` (the MCP tool's viewport-resize
itself doesn't dispatch a native `resize` event at the CDP level, so this
was verified via direct dispatch instead — a limitation of the test tooling,
not the code).

### ✅ 8. Pseudo-`@Input` on routed components

**Files:** `aboutme.ts`, `projects.ts`, `skills.ts`, `contact.ts` (`text`,
`hints`)

`@Input() text` / `@Input() hints` on components instantiated by the
router — the inputs were never actually passed from outside; they're
effectively constants.

**Resolved 2026-07-17:** removed the `@Input` decorator and the unused
`Input` import from `@angular/core` in all four components; the fields
became `readonly`. Also normalized indentation along the way (in
`projects.ts`, `skills.ts`, `contact.ts` it was off by one space from
copy-paste). Verified: `npx ng build` passes, footer hints (`Navigation.` /
`Select` / `Confirm` / `Back`) render unchanged in the DOM on `/aboutme`.

### ⬜ 9. Enter handling in sections is a no-op

**Files:** section components, `handleKeyboardEvent`

The footer hint promises `Enter — Confirm`, but the `Enter` case just calls
`preventDefault()` and does nothing. Either drop the hint or wire up an
action (e.g. focus the content panel for keyboard scrolling).

### ⬜ 10. Tests — default CLI stubs, not run in CI

Spec files are CLI-generated and unmaintained; there's no CI. Not critical
for a portfolio site, but after the refactor in item 5, a smoke test for
config loading + the fallback branch would be worthwhile.

---

## 🔵 UI / structure (owner feedback, 2026-07-17)

### ✅ 14. Download CV button on Home broke the visual style

**Files:** `src/app/components/home/{home.ts,home.html,home.scss}`

Before: a standalone `<a class="cv-download">` with a border, uppercase,
small font — looked out of place next to the large borderless menu text
items.

**Resolved 2026-07-17 (option B — chosen by the owner):** CV became the
fifth item of `menuItems`, the same `<app-main-menu-button>` as the rest —
identical font/size/line animation out of the box. Technically:
- `MenuItem` got an optional `download?: boolean` field; for the CV item,
  `route` = `cvPath` (`${environment.dataPath}files/CV.pdf`).
- `[routerLink]` on the buttons was removed, replaced with `(buttonClick)`
  (an output `MainMenuButton` already emitted, but nothing was listening to
  it before) → `onMenuItemClick(item)` → a private `activateItem(item)`:
  for regular items it calls `router.navigate()`, for CV it creates a
  temporary `<a href download>` and clicks it programmatically (a native
  browser download, no SPA route change).
- The same `activateItem()` is used in `confirmSelection()` — keyboard
  Enter and mouse click go through one code path, behaving identically for
  all 5 items.
- `RouterModule` removed from the component's `imports` (no longer needed —
  only the `Router` service remains), the old `.cv-download` style removed
  from `home.scss`.

Verified live on the dev server: keyboard navigation (`S` ×5) reaches
"Download CV", the button gets `.active` with the correct activation
animation (line under the text, same as the rest); `Enter` creates
`<a href="…/files/CV.pdf" download="CV.pdf">` and clicks it, **without**
triggering Angular navigation (URL stays on `/home`); mouse click on any
regular item (tested on "Projects") still navigates correctly as before.
`npx ng build` — no errors.

### ✅ 15. Broken decorative animation on main menu buttons

**Files:** `src/app/components/main-menu-button/main-menu-button.scss`,
`main-menu-button.ts`

Defects visible in the owner's screenshots of the active button:

1. **Dots at random positions, different per button.** Cause:
   `.dot.left { left: 185px }` / `.dot.right { right: 185px }` were
   hardcoded pixels, while `.button-container` is `inline-block`, its width
   depending on text length (measured: 174–224px). For any button narrower
   than ~370px the dots overshot past center and effectively swapped sides,
   ending up at a different distance from the text depending on the menu
   item.
2. **The line ran behind the text instead of underneath it.** Cause:
   `.ornamental-line { top: 50%; transform: translateY(-50%) }` — the line
   was vertically centered, so the center segment (opacity 0.6) cut across
   the text.
3. (Incidentally) `.dot` was centered via `transform: translateY(-50%)`
   while anime.js animates `scale` on that same transform property — a
   conflict, with a possible vertical jump of the dot.

**Resolved 2026-07-17:**
- `.ornamental-line`: `top: 50% + translateY(-50%)` → `bottom: 6px` — the
  whole decoration now sits under the text.
- `.dot`: taken out of absolute positioning into the line's flex flow (the
  template's element order was already correct: segment → dot → center →
  dot → segment). Dots now always sit exactly at the segment joints
  regardless of button width, and travel along with the expansion
  animation; removed the hardcoded 185px and the translateY (also removing
  the transform conflict).
- `LINE_WIDTH` in `main-menu-button.ts`: 80 → 60, so the narrowest button
  ("Skills", 174px) keeps a visible center gap between the dots (~44px),
  while wide buttons get dots landing near the text edges.

Verified live on the dev server (`getBoundingClientRect` measurements +
screenshot): on all 4 buttons the line sits exactly 8px under the text;
final activated state (Projects, 206px): segments 60/60, dots 60px from
both edges (symmetric, at the joints), center 76px, line/dot opacity 1.
During the animation the dots correctly travel with the segments
(intermediate measurement: segment 36px — dot at 38px).

### ✅ 18. Long sidebar titles broke the layout and clipped with no ellipsis

**Files:** `src/app/components/{aboutme,projects,skills,contact}/*.{html,scss,ts}`,
new `src/app/directives/marquee-text/marquee-text.ts`

Screenshot from the owner (mobile width, Projects): long items like
`INSTAGRAM_ORDER_AUTOMATION.MD` blew straight through `.side-menu-button` —
there was no `overflow`/`white-space`/`min-width:0` on the button text at
all, so the flex container `.content` stretched to fit the content, which
in turn caused **the entire page to scroll horizontally** (visible at the
bottom of the screenshot) instead of clipping locally within the sidebar.
The second screenshot showed the page scrolled sideways with the text still
not fitting.

**Resolved 2026-07-18:**

1. **Fixed the actual layout bug** (the root cause): `min-width: 0` added to
   `.content` and `.side-menu-button`, `overflow-x: hidden` on
   `.sidebar-menu`, `overflow: hidden` on `.label`. Long text can no longer
   stretch the page; at worst it's clipped within the button.
2. **"Spotify-style" scroll for the active/hovered item** (owner's request):
   built a standalone `MarqueeText` directive (`ResizeObserver` + comparing
   `scrollWidth`/`clientWidth`), which tags an element with
   `.marquee-overflowing` **only when the text genuinely doesn't fit**, and
   sets the exact overflow distance as a CSS variable
   `--marquee-distance`. One directive, wired into all 4 components — no
   duplicated JS logic, unlike the rest of the section code (see item 5).
3. **Default state** (not active, not hovered): `text-overflow: ellipsis` —
   clean truncation with "…", no movement at all.
4. **Active/hovered + genuine overflow**: a CSS animation `marquee-scroll`
   (originally 7s ease-in-out with a symmetric return — **refined
   2026-07-18**, see below). Short titles (that fit) — **don't move and
   have no animation at all**, even on active/hover (verified:
   `Restaurant_Chain.MD` → `overflowing: false`, `animationName: none`).

Verified live on the dev server (375px and 1280px):
`document.body.scrollWidth === document.body.clientWidth` (375=375, no
horizontal scroll); for each of the 8 Projects items, `--marquee-distance`
and the `marquee-overflowing` class were checked individually (values
differ correctly per item, from 0px to 104px); inactive items —
`animationName: none`, `text-overflow: ellipsis`. `npx ng build`
(development and production) — no errors.

#### Refinement 2026-07-18: removed the animated return slide

The owner asked for a better animation rhythm: movement should start
instantly (no pause at the start), and after the end pause, it should
**snap** back to the start position instead of sliding back smoothly.

Before: `0%,15%` — pause at the start → `15-50%` — slides left → `50%,65%`
— pause at the end → `65-100%` — **slides back smoothly** (the part the
owner asked to remove).

After (renamed `marquee-bounce` → `marquee-scroll`, `ease-in-out` →
`linear`):

```css
@keyframes marquee-scroll {
  0%     { transform: translateX(0); }
  72%    { transform: translateX(calc(-1 * var(--marquee-distance, 0px))); }
  88%    { transform: translateX(calc(-1 * var(--marquee-distance, 0px))); }
  88.3%  { transform: translateX(0); }
  100%   { transform: translateX(0); }
}
```

- `0%→72%` (0–5.04s of 7s): moves left at constant speed (`linear`, no
  `ease-in` ramp-up) — starts with no delay.
- `72%→88%` (~1.12s): pause, the end of the title is fully revealed.
- `88%→88.3%` (~0.02s, 0.3% of the duration): a **snap**, not an
  animation — the gap is deliberately microscopic so the browser has no
  time to interpolate a visible distance; reads as an instant cut, not a
  slide-back.
- `88.3%→100%` (~0.82s): a short pause at the start position before the
  next cycle.

**Verified 2026-07-18:** real-time sampling via `requestAnimationFrame` in
this browser tool turned out to be unreliable (rAF gets throttled when the
tab isn't OS-focused — `document.hasFocus() === false`, even though
`visibilityState: "visible"`), so instead I verified directly via the
CSSOM: `document.styleSheets` → found the `CSSKeyframesRule` matching the
element's `animationName`, read all keyframe stops — they exactly match
the code above (confirming the browser parsed the intended timeline,
including the tiny 0.3% snap gap). Also found and fixed a **stale-CSS HMR
issue** on an external dev server (not mine — it was left running from
earlier steps in the session): after several consecutive `@keyframes`
edits, the Vite dev server's HMR loaded an inconsistent state
(`animationName` present with no matching `getAnimations()`) — fixed with
a full `location.reload()` (not an SPA navigation). If you see similar
behavior (animation "frozen") — do a full page reload (Ctrl+Shift+R), not
just an in-app navigation.

### ⬜ 16. Unstable MainMenuButton animation logic (found while fixing item 15)

**File:** `src/app/components/main-menu-button/main-menu-button.ts`
(+ template)

While verifying item 15 on the dev server, four related issues surfaced
that occasionally make the activation animation not play or freeze halfway
(segments at a partial width, dots never appearing). Mostly works in
production, but it's the source of "flickering"/incomplete animations:

1. **NG0100 (ExpressionChangedAfterItHasBeenCheckedError) in dev mode:**
   `initializeParticles()` runs in `ngAfterViewInit` and populates
   `particles`, which render via `[style.left.px]="particle.x"` — a state
   change after the check. Shows as an ERROR in the dev server console on
   every home load. Fix: generate particles in `ngOnInit` (the DOM isn't
   needed for that).
2. **Double ownership of particle styles:** the Angular bindings
   `[style.left.px]` / `[style.top.px]` and anime.js (`animateParticles`
   writes to `particleEl.style.left/top` directly) both control the same
   inline styles — each change-detection cycle can yank particles back.
   Fix: give ownership of positioning to one source (remove the bindings,
   initialize positions inside `animateParticles`).
3. **Race condition on rapid switching:** the particle deactivation
   animation has `complete: () => this.stopAllAnimations()` — if a new
   activation starts within its 300ms duration, the callback pauses the
   **new** activation timeline (`this.currentAnimation`). Symptom:
   segments freeze at a partial width with no dots. Fix: in `complete`,
   only pause the particle animations captured in a local variable, not
   everything.
4. **Conflict between `@Input isActive` and local mutation:** `onHover`/
   `onLeave` write to `this.isActive` (an input property), while the
   parent binds `[isActive]="isSelected(i)"` — the next change-detection
   cycle overwrites the local value, so hover state and keyboard-selection
   state fight each other. Fix: split into internal state
   (`isActive = input || hovered`).

Medium priority: users experience this as "sometimes the line doesn't
appear/freezes." Best fixed in one pass, verifying hover + keyboard +
switching between buttons together.

### ✅ 17. Content files were buried too deep

**Before:** editable markdown/JSON lived under
`src/assets/{example,prod}/{data,content/<section>}/…` — changing site text
meant digging 5 levels deep inside `src/`, right next to the code.

**Resolved 2026-07-17 (approved by the owner):** content moved to a
top-level `content/` folder, entirely outside `src/`:

```
content/
├── example/        # committed (demo for repo clones)
│   ├── data/       # *.config.json
│   └── content/    # markdown per section
└── prod/           # gitignored (personal)
    ├── data/
    ├── content/
    └── image/
```

Implementation:
- `angular.json` (top-level `build.options.assets`, shared by all build
  configurations): added two mappings —
  `{ "glob": "**/*", "input": "content/example", "output": "/assets/example" }`
  and the same for `content/prod` → `/assets/prod`. `environment.dataPath`
  (`assets/example/` / `assets/prod/`) **didn't change** — it's a runtime
  URL, not a disk path, so no TS/HTML file needed touching.
- `.gitignore`: `/src/assets/prod/` → `/content/prod/`.
- `src/assets/example/` was moved via `git mv` (rename preserved in git
  history); `src/assets/prod/` — via `cp` + verify (`diff -rq`, identical)
  + `rm` (plain `mv`/`git mv` failed with "Permission denied" — likely a
  file lock from an unrelated process on port 4200; copy+verify+remove
  worked fine).
- `src/assets/` now only holds code-adjacent things: `fonts/`, `images/`,
  `styles/` — no content at all.
- Updated [CONTENT.md](CONTENT.md), [ARCHITECTURE.md](ARCHITECTURE.md), and
  the root [README.md](../README.md) for the new paths.

**Verified:**
- `npx ng build --configuration development` **with `content/prod/`
  temporarily removed** (simulating a fresh clone with no personal
  content) — the build succeeds with no errors, `dist/.../assets/example/`
  is present, `assets/prod/` is absent (expected).
- `npx ng build --configuration production` with `content/prod/` restored —
  `dist/.../assets/prod/` is byte-identical (`diff -rq`) to the source
  `content/prod/`.

⚠️ If you have `ng serve` running from **before** this change — restart
it: the dev server only picks up the asset mapping in `angular.json` at
startup, there's no hot config reload here.

---

## 🟢 Minor

### ✅ 11. README drifted from reality

- ~~Structure: README showed `src/components/`, actual path is
  `src/app/components/`~~ — fixed incidentally during the content migration
  (item 17): the tree now shows `content/` and `src/app/components/`.
  `services/` and the effect components still aren't mentioned — a minor
  remaining gap, not critical.
- ~~The NPM Scripts section showed `"lint": "ng lint"` — no such script
  exists in `package.json`~~ — **resolved 2026-07-18:** the line was
  removed from README, leaving only the scripts that actually exist.

### ⬜ 12. Typos / minor details

- `content/prod/content/aboutme/profile.md:1` — `heigth` → `height` in the
  `<img>` attribute.
- `package.json` → `"name": "star-lith"`, while the `angular.json` project
  is `StarLith`; not a problem, just an inconsistency.

---

## 🟣 Fan tribute & licensing (2026-09-01)

### ✅ 19. Third-party IP: disclaimer, license wording, original text only

Following a review of the site's position as an unofficial fan tribute, a
handful of low-cost changes separate "inspired by" from "copied from".

**Resolved 2026-09-01:**
- **Story** (`content/prod/content/aboutme/story.md`): removed a verbatim
  in-game quote and its attribution line — the only literal third-party text
  on the site. An HTML-comment placeholder marks the slot for the owner's own
  closing line (invisible on the page, but readable by anyone who opens the
  raw `.md` URL).
- **FAQ** (`content/prod/content/aboutme/faq.md`): "Are you a NieR series
  fan?" now states the site is an unofficial fan tribute, not affiliated with,
  endorsed by or sponsored by Square Enix, and uses no original game assets.
  "Can I use this portfolio design for myself?" became "Can I use this code
  for your own portfolio?" — it invites forking the **code** under GPL v3 and
  says the license covers only what the author can license. The old "fork the
  design, make it your own" wording is gone.
- **README**: title `NieR: Automata Style Resume` → `StarLith — Interactive
  Portfolio`; the game name left the title, feature list and loading-screen
  description; added a disclaimer note under the intro and a `Disclaimer`
  section. The **License** section said `MIT` while the repository's
  `LICENSE` file is **GNU GPL v3** — fixed, with a scope note that the GPL
  grants no rights to third-party trademarks or copyrighted works.
- **Home**: a thin disclaimer strip below the fold (see item 20 for the
  layout consequence).
- **docs/**: `docs/README.md` no longer describes the site as
  "NieR: Automata-styled"; the unscheduled-ideas note moved to the gitignored
  `docs/ideas/` (the `.gitignore` entry already existed).
- Rules for future content edits are written down in
  [CONTENT.md → Third-Party IP Guardrails](CONTENT.md#third-party-ip-guardrails).

**Verified 2026-09-13 on the live site:** `faq.md` contains the
non-affiliation text, `story.md` no longer contains the quote, the deployed
bundle contains `.site-disclaimer`. In tracked files the game name remains
only in the README (intentionally, next to the disclaimer) and in two SCSS
comments in `variables.scss`.

### ✅ 20. Keyboard hint dropped below the first screen

**Files:** `src/app/components/home/{home.html,home.scss}`

Adding the disclaimer strip made `.home-component` taller than the viewport
(`min-height: 100vh` + ~54 px). The hint was `position: fixed; bottom: 2rem`,
yet it rendered cut off at the very bottom of the screen. Cause:
`.home-component` has `content-visibility: auto`, whose **layout
containment** makes the element the containing block for `fixed`
descendants. While the component was exactly `100vh` that coincided with
the viewport, so nobody noticed; once it grew, `bottom: 2rem` was measured
from the bottom of the whole component — below the fold.

**Resolved 2026-09-01:** the hint moved inside `.content` (exactly `100vh`),
which got `position: relative`; the hint itself became `position: absolute`.
It now belongs to the first screen: scrolling down moves it away with the
menu and reveals the strip without overlap. The existing
`translate(-50%, …)` keyframes kept working unchanged.

Verified on the dev server at 1280×720: hint `646–700 px`, strip starts at
`720 px` (no overlap); after scrolling, `elementFromPoint` inside the strip
returns `.disclaimer-text`.

### ✅ 21. Link-preview image and background refresh

**Files:** `src/index.html`, `angular.json`, `public/og_cover.jpg`,
`src/assets/images/home_background*`

- All five home background variants were replaced with new artwork
  (`home_background.{webp,png}`, `home_background_mobile.{webp,png}`,
  `home_background_small.webp`). The desktop pair is now 1535×1024 instead of
  1344×768; `background-size: cover` handles the different aspect ratio.
- `og:image` / `twitter:image` pointed at `assets/images/home_background.png`,
  which `angular.json` copied into the build through a one-off asset glob.
  That PNG is now ~2.1 MB — too heavy for a preview image. **Resolved:** a
  dedicated `public/og_cover.jpg` (1300×630, ~650 KB), meta tags updated
  including `og:image:width/height`, one-off glob removed.
- Backgrounds deliberately **stayed** in `src/assets/images/` rather than
  moving to `public/`: SCSS-referenced files ship with a content hash, which
  gives cache-busting for free — exactly what a background swap needs. Only
  files that require a stable URL live in `public/`. Written up in
  [ARCHITECTURE.md](ARCHITECTURE.md#static-assets-srcassetsimages-vs-public).

Verified with `npm run build:prod`: `og_cover.jpg` at the build root,
`assets/images/` absent from the output, background hash changed
(`YSN764UJ` → `3H6YBCUZ`). Live on `starlithdev.web.app` since `v1.0.1`.

---

## 🔍 Follow-up review (2026-09-13)

Full pass over components, services, routing and hosting. **No bug breaks
the site today:** all four sections load every configured file from the
production content tree (19 markdown files, plus CV, photo and OG image —
all `200`), zero console errors across routes, unknown routes redirect
correctly. The items below are ranked by user impact.

### ✅ 22. Back button loops through the boot screen — 🟠 high

**File:** `src/app/components/loading/loading.ts:59`

`router.navigate(['/home'])` pushes a new history entry, so the stack after
a normal visit is `[referrer, /loading, /home]`. Pressing **Back** on
`/home` returns to `/loading`, which replays the whole boot sequence
(~6 s) and then pushes `/home` again. A recruiter arriving from LinkedIn has
to press Back twice within the animation to leave; one press just restarts
the intro. The sequence also isn't cancelled when the component is
destroyed, so an in-app navigation during the animation gets overridden by
the final `navigate`.

**Fix:** `this.router.navigate(['/home'], { replaceUrl: true })`, plus a
`destroyed` flag checked before navigating.

Confirmed by reading the code; a live repro in the tooling browser wasn't
possible (the hidden preview pane throttles `requestAnimationFrame`, so the
animejs sequence never finishes there).

**Resolved 2026-09-14:** `navigate(['/home'], { replaceUrl: true })`, and a
`destroyed` flag set in `ngOnDestroy` is checked before the sequence starts
and again right before navigating, so a sequence that outlives the component
can't override a later navigation.

Verified on the dev server (`start:prod`): opened `/robots.txt` as a stand-in
referrer, then `/`; the sequence ran to `/home` with `history.length`
unchanged (3 → 3, i.e. `/loading` was replaced rather than `/home` pushed on
top); **Back** from `/home` went straight to `/robots.txt`, no boot screen.
(This time the animation did complete in the throttled pane — slowly, ~45 s.)

### ⬜ 23. Keyboard navigation disabled on touch-capable desktops — 🟡 medium

**File:** `src/app/components/home/home.ts` → `checkIfMobile()`

`isMobile` is true when `'ontouchstart' in window` **or**
`navigator.maxTouchPoints > 0`. Touchscreen laptops and many Windows
convertibles report touch points even when used with a keyboard and mouse,
so for them the home menu silently loses keyboard navigation, the
preselected item and the hint — the core interaction of the site. Section
pages don't check this at all, so behaviour differs between screens.

**Fix:** decide by input capability, not touch presence:
`matchMedia('(hover: none) and (pointer: coarse)')`, keeping the
`≤ 768px` width check.

### ⬜ 24. Missing markdown file renders `index.html` in production — 🟡 medium

**Files:** section components → `loadFromMarkdown()`; `firebase.json`

Firebase's catch-all rewrite answers requests for non-existent files with
`200` + `index.html` (verified on the live site:
`/assets/prod/content/projects/does_not_exist.md` → `200 text/html`).
`HttpClient` therefore never errors, the `# No Data` fallback never runs,
and the section panel renders the app shell's HTML as markdown. The local
dev server returns a real `404`, so `npm run start:prod` doesn't reproduce
it. Latent — every configured file exists today — but one typo in a
`contentFile` would ship unnoticed.

**Fix (either):** reject responses that look like HTML in
`loadFromMarkdown()` (e.g. the trimmed body starts with `<!doctype`), or
restrict the rewrite so `/assets/**` is never rewritten. The code-side check
is more robust, since `firebase.json` is gitignored and exists only on one
machine.

### ⬜ 25. Every route declares the homepage as canonical — 🟡 medium (SEO)

**File:** `src/index.html`

`<link rel="canonical" href="https://starlithdev.web.app/">` is static, so
`/aboutme`, `/projects`, `/skills` and `/contact` all tell search engines
"the real page is `/`" — contradicting `sitemap.xml`, which lists them as
separate URLs. Search engines usually honour the canonical and drop the
subpages.

**Fix:** update the canonical on `NavigationEnd` (one small service using
`DOCUMENT`), or remove the tag.

### ⬜ 26. Disclaimer strip polish — 🟢 low

**File:** `src/app/components/home/home.scss`

1. **Contrast 3.66:1** — text is `rgba(#efefe4, 0.42)` on `#0b0b0b` at
   `0.7rem`; WCAG AA for small text needs 4.5:1. Alpha `0.55` gives 5.55:1,
   `0.6` gives 6.43:1 — still quiet, but readable, which is the point of a
   disclaimer.
2. **Scrollbar offset** — the page now scrolls, so browsers with classic
   (non-overlay) scrollbars show a permanent vertical scrollbar on Home.
   `.home-component` and `.content` use `width: 100vw`, which *includes* the
   scrollbar, so the menu sits about half a scrollbar right of centre (the
   horizontal overflow is hidden by `body { overflow-x: hidden }`). Fix:
   `width: 100%`. Not measurable in the tooling browser (overlay
   scrollbars); the scrollbar itself is visible in the owner's screenshot.

### ⬜ 27. Housekeeping — 🟢 low

- **Unused images committed in `v1.0.1`:** `src/assets/images/og_cover.jpg`
  (650 KB, a duplicate of `public/og_cover.jpg`) and
  `src/assets/images/home_background.jpg` (231 KB). Nothing references
  either, so they don't ship — but they bloat the public repository, the
  same class of problem as commit `f464f7d`.
- **Budget warning:** `home.scss` is 10.87 kB against the 10 kB warning
  threshold (error at 15 kB) since the disclaimer styles were added. Either
  raise `maximumWarning` to `12kB` or accept the warning.
- **Typo** from item 12 is still present: `heigth="300px"` in
  `content/prod/content/aboutme/profile.md`.

### ⬜ 28. Menu items aren't links — 🟢 low (a11y / crawlability)

**Files:** `main-menu-button.html`, section templates

Home menu entries are `<div (click)>` inside `MainMenuButton`: not
reachable with Tab, announced as plain text by screen readers, and not
followable by crawlers (`sitemap.xml` compensates for discovery). Keyboard
users are covered by the custom W/S/Enter handling on desktop only — see
item 23 for when even that switches off. Worth doing together with item 16,
which already needs a pass over this component.

---

## ✅ Resolved

### ✅ 0. Commented-out aboutme template in the working copy

Uncommitted changes in `aboutme.html` (commented-out `<h1>`, `<main>`,
footer nav) left the page empty. **Resolved 2026-07-17:** the changes were
discarded (`git checkout`), the component is back to master's working
state.

### ✅ 13. Period/company missing from project headers

**Files:** `src/assets/prod/content/projects/project_00{1..8}.md`

Each project's metadata block didn't show the work period or (where
possible) the company name — recruiters couldn't line up projects against
the LinkedIn/CV timeline.

**Resolved 2026-07-17:** added `**Period:** <dates> · <employment type>` to
every file, per the owner's period table; where specified, also added
`**Company:**` (Cryptonergy for project_001, Univisia for project_002),
the rest were left without a company name (confidential client).

Incidentally found and fixed an adjacent bug: in `project_008.md`, the
metadata lines (`Type` / `Industry` / `Role` / `Status`) had no trailing
spaces for a markdown hard-break and rendered **merged into a single
paragraph** instead of separate lines (unlike the other project_*.md files,
which had the line break). The file also had LF line endings instead of
CRLF like the other project files — left as LF, since the edit script
preserved each file's original EOL. Verified locally
(`npm run start:prod`): all 8 projects show Period (and Company where
present) on separate lines.

---

## Risks outside the code

- **Prod content backup:** `content/prod/` and `firebase.json`/`.firebaserc`
  are gitignored — they exist only on this machine. Keep a private backup.

## Recommended order of work

1. ~~Items 1–2 (configs)~~ — ✅ done.
2. ~~Periods in project_*.md~~ — ✅ done.
3. ~~Item 4 SEO + item 3 CV button~~ — ✅ done. **Action for you:** drop
   `CV.pdf` into `content/prod/files/` (see
   [CONTENT.md](CONTENT.md#downloadable-files-cv)).
4. ~~Items 6, 7, 8 — quick code cleanups~~ — ✅ done.
5. ~~Item 14 (CV button on Home) + item 15 (menu button animation)~~ — ✅
   done 2026-07-17.
6. ~~Item 17 (move content folders to top level)~~ — ✅ done 2026-07-17.
   **Action for you:** if you have `ng serve` running from before this
   change — restart it.
7. ~~Item 18 (long titles breaking layout / marquee scroll)~~ — ✅ done
   2026-07-18.
8. Item 16 (unstable MainMenuButton animation logic) — backlog, medium
   priority, found incidentally while fixing item 15.
9. Item 5 (refactor into a generic SectionComponent) — **deferred
   2026-07-17** by the owner's decision: the code duplication isn't causing
   real problems right now, lower priority than everything else. Stays in
   the backlog, revisit when there's time or the next section forces
   synchronized edits across all four copies.
10. ~~Items 19–21 (fan-tribute disclaimer, licensing, OG image)~~ — ✅ done
    2026-09-01, deployed in `v1.0.1`.
11. ~~Item 22 (Back-button loop)~~ — ✅ done 2026-09-14.
12. Items 27 + 26 — housekeeping and strip polish, one small commit.
13. Items 24, 23, 25 — each a small, independent change.
14. Item 28 — together with item 16.
