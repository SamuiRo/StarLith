# Знайдені проблеми та технічний борг

Результати код-рев'ю від 2026-07-17. Статуси: ⬜ відкрито · ✅ вирішено.

Пов'язаний документ: [site_update/site_improvements.md](site_update/site_improvements.md)
(контентні покращення). Тут — усе, що стосується коду і конфігурації.

---

## 🔴 Критичні — новий контент не відображається на сайті

### ✅ 1. `projects.config.json` не оновлений під новий контент

**Файл:** `src/assets/prod/data/projects.config.json`

- `project_008.md` (Instagram Order Automation) лежав у `content/projects/`,
  але не був підключений у конфігу.
- Назви в меню були generic: `Project_001.MD` … `Project_007.MD`.
- Порядок був не за датами.

**Вирішено 2026-07-17:** конфіг оновлено — project_008 додано першим,
усім 8 проєктам дано змістовні `title` у стилі термінала
(`Instagram_Order_Automation.MD` тощо), порядок вирівняно за спаданням дат
згідно з таблицею періодів у
[site_improvements.md](site_update/site_improvements.md#2-період--тип-роботи-в-шапці-кожного-проєкту--високий):
Instagram (Mar 2026) → Social Media Aggregator + Discord/Telegram Bots
(Sep 2025 – Feb 2026) → DeFi Yield (Nov 2024 – May 2025) → Auto Dealership
(Jan–Oct 2024) → Breast Cancer Clinic (2023) → Restaurant Chain (2022) →
Dental Network AU (2021–2022). Перевірено локально (`npm run start:prod`) —
усі 8 пунктів меню відображаються, project_008 відкривається першим коректно.

### ✅ 2. `skills.config.json` не містить нової секції AI

**Файл:** `src/assets/prod/data/skills.config.json`

`content/skills/ai.md` (AI-Assisted Development) був створений, але в
конфігу був відсутній.

**Вирішено 2026-07-17:** додано entry `{ "id": "ai", "title": "AI",
"contentFile": "ai.md" }` в кінець списку (після Automation). Перевірено
локально — пункт "AI" з'являється в меню Skills і рендерить контент
коректно.

---

## 🟠 Високий пріоритет — функціональність для рекрутера

### ✅ 3. Немає кнопки Download CV

Файлу `CV.pdf` у проекті не було.

**Вирішено 2026-07-17:** додано кнопку "Download CV" на Home (під головним
меню) і на Contact (у шапці поруч із заголовком), обидві стилізовані під
тему сторінки й адаптивні на мобільних. Кнопка посилається на
`${environment.dataPath}files/CV.pdf` — шлях без жодних хардкод-персональних
даних у коді (назва файлу навмисно generic `CV.pdf`, деталі — в
[CONTENT.md](CONTENT.md#downloadable-files-cv)). Файл сам користувач кладе в
`src/assets/prod/files/CV.pdf` (gitignored). Перевірено локально — посилання
рендериться з коректним href на Home і Contact, десктоп і мобільна ширина.

### ✅ 4. SEO: сайт невидимий для пошуковиків і парсерів

Було: `<title>StarLith</title>`, немає `meta description`, OG-тегів; роутові
title generic ("Home", "Loading"); весь контент рендериться через JS + HTTP.

**Вирішено 2026-07-17:**
- `src/index.html`: title, meta description, `meta robots`, `canonical`,
  `theme-color`, повний набір Open Graph (title/description/url/image
  1344×768) і Twitter Card тегів, JSON-LD `Person` schema (ім'я, посада,
  LinkedIn/GitHub через `sameAs`, email), `<noscript>` fallback з текстовим
  описом і контактами для безJS-парсерів.
- `src/app/app.routes.ts`: осмислені, унікальні title на кожен роут
  (`About Me — Serhii Vasiliev | StarLith` тощо) — Angular Router
  автоматично виставляє їх у `document.title` без додаткового коду.
- `public/robots.txt` і `public/sitemap.xml` — додані для індексації
  (копіюються в корінь білда через існуючий `public`-asset у `angular.json`,
  працюють без змін конфігурації).

Перевірено локально: усі мета-теги, JSON-LD і title коректно присутні в DOM
на кожному роуті.

**Не зроблено навмисно:** prerender/SSG. Оскільки контент вантажиться через
HttpClient у runtime, а не входить у бандл, повноцінний SSR/SSG вимагав би
окремої архітектурної зміни (Angular Universal + build-time fetch). Краулери,
що не виконують JS, побачать лише статичні мета-теги з `index.html` (уже
достатньо для link-preview і базового SEO); Google та більшість сучасних
краулерів JS виконують і побачать повний контент.

---

## 🟡 Технічний борг у коді

### ⬜ 5. Секційні компоненти — 4 копії одного коду

**Файли:** `src/app/components/{aboutme,projects,skills,contact}/*.ts`

`Aboutme`, `Projects`, `Skills`, `Contact` — це той самий компонент (~170
рядків), скопійований 4 рази. Відрізняються лише: назва секції в URL конфігу
та шлях до контенту. Побічний ефект копіювання — у `Projects`, `Skills`,
`Contact` fallback-дані лишилися від Aboutme (`Profile / Story / Qualities /
Tech`), що не відповідає їхнім секціям.

**Фікс:** один generic `SectionComponent`, який отримує назву секції через
route `data` (`{ path: 'projects', component: Section, data: { section:
'projects' } }`). Мінус ~500 рядків, чотири шаблони й стилі теж зводяться до
одного. Це закриває "Component Optimization" з Planned Features у README.

### ✅ 6. Мертвий код: сервіс-дублікат scan-line

**Файл:** `src/app/services/scan-line/scan-line.ts`

`@Injectable` клас `ScanLineEffect` — точна копія однойменного *компонента*
`src/app/components/scan-line-effect/scan-line-effect.ts`. Ніде не
імпортувався (перевірено grep-ом). Додатково: у сервіса `ngOnInit` ніколи не
викликався (Angular не викликає `OnInit` на injectable), тобто код і не
запрацював би.

**Вирішено 2026-07-17:** `src/app/services/scan-line/` (разом зі spec)
видалено. `npx ng build` без помилок після видалення.

### ✅ 7. Витік listener-а у Home

**Файл:** `src/app/components/home/home.ts`

`window.addEventListener('resize', ...)` у `ngOnInit` без відписки — кожне
повернення на `/home` додавало новий listener.

**Вирішено 2026-07-17:** замінено на `@HostListener('window:resize')` на
методі `checkIfMobile()` — симетрично до вже наявного `@HostListener` для
keydown; Angular сам знімає listener при знищенні компонента. Перевірено
локально: `window.dispatchEvent(new Event('resize'))` коректно перемикає
`isMobile`/`selectedIndex` (сам MCP-інструмент зміни viewport CDP-рівня не
шле нативну `resize`-подію, тому перевіряв прямим dispatch — це обмеження
тест-інструменту, не коду).

### ✅ 8. Псевдо-`@Input` на роутованих компонентах

**Файли:** `aboutme.ts`, `projects.ts`, `skills.ts`, `contact.ts` (`text`,
`hints`)

`@Input() text` / `@Input() hints` на компонентах, які створюються роутером —
inputs ніколи не передавались ззовні, це константи.

**Вирішено 2026-07-17:** прибрано декоратор `@Input` і невикористаний імпорт
`Input` з `@angular/core` у всіх чотирьох компонентах, поля стали `readonly`.
Попутно вирівняно відступи (в `projects.ts`, `skills.ts`, `contact.ts` вони
були зсунуті на 1 пробіл через copy-paste). Перевірено: `npx ng build`
проходить, footer-хінти (`Navigation.` / `Select` / `Confirm` / `Back`)
рендеряться на `/aboutme` без змін у DOM.

### ⬜ 9. Обробка Enter у секціях — порожня

**Файли:** секційні компоненти, `handleKeyboardEvent`

Хінт унизу екрана обіцяє `Enter — Confirm`, але case `Enter` лише робить
`preventDefault()` і нічого не виконує. Або прибрати хінт, або повісити дію
(наприклад, фокус на контент-панель для скролу з клавіатури).

### ⬜ 10. Тести — дефолтні заглушки, не запускаються в CI

Spec-файли згенеровані CLI і не підтримувалися; CI немає. Не критично для
портфоліо, але після рефакторингу (п. 5) варто мати хоча б смоук-тест
завантаження конфігу + fallback-гілки.

---

## 🟢 Дрібниці

### ⬜ 11. README розходиться з реальністю

- Структура: у README `src/components/`, фактично `src/app/components/`;
  не згадані `services/`, ефект-компоненти, `public/`.
- Розділ NPM Scripts показує `"lint": "ng lint"` — такого скрипта в
  `package.json` немає.
- README каже "create this" про `src/assets/prod/` — тепер можна послатися на
  [CONTENT.md](CONTENT.md).

### ⬜ 12. Типографіка/дрібне

- `src/assets/prod/content/aboutme/profile.md:1` — `heigth` → `height` в
  атрибуті `<img>`.
- `package.json` → `"name": "star-lith"`, а `angular.json` проект —
  `StarLith`; не проблема, просто неконсистентність.

---

## ✅ Вирішені

### ✅ 0. Закоментований шаблон aboutme у робочій копії

Незакомічені зміни в `aboutme.html` (закоментовані `<h1>`, `<main>`,
footer-nav) робили сторінку порожньою. **Вирішено 2026-07-17:** зміни
відкинуті (`git checkout`), компонент у робочому стані з master.

### ✅ 13. Період/компанія відсутні в шапках проєктів

**Файли:** `src/assets/prod/content/projects/project_00{1..8}.md`

Метадата-блок кожного проєкту не показував період роботи й (де можна) назву
компанії — рекрутер не міг зіставити проєкти з таймлайном на LinkedIn/CV.

**Вирішено 2026-07-17:** додано `**Period:** <дати> · <тип зайнятості>` в
кожен файл за таблицею з
[site_improvements.md](site_update/site_improvements.md#2-період--тип-роботи-в-шапці-кожного-проєкту--високий);
де вказано в плані — додано також `**Company:**` (Cryptonergy для
project_001, Univisia для project_002), решта лишились без назви компанії
(конфіденційний клієнт).

Попутно знайдено й виправлено суміжний баг: у `project_008.md` рядки
метаданих (`Type` / `Industry` / `Role` / `Status`) не мали трейлінг-пробілів
для markdown hard-break і рендерились **злитими в один абзац** замість
окремих рядків (на відміну від інших project_*.md, де перенос був). Файл
також мав LF-закінчення рядків замість CRLF, як в інших project-файлах —
залишено LF, оскільки Edit-скрипт зберігав оригінальний eol кожного файлу.
Перевірено локально (`npm run start:prod`): усі 8 проєктів показують Period
(і Company де є) окремими рядками.

---

## Ризики поза кодом

- **Бекап prod-контенту:** `src/assets/prod/` і `firebase.json`/`.firebaserc`
  гітігноряться — існують лише на цій машині. Тримати приватний бекап.

## Рекомендований порядок робіт

1. ~~П. 1–2 (конфіги)~~ — ✅ зроблено.
2. ~~Періоди в project_*.md (див. site_improvements п. 2)~~ — ✅ зроблено.
3. ~~П. 4 SEO + п. 3 кнопка CV~~ — ✅ зроблено. **Дія для вас:** покладіть
   `CV.pdf` у `src/assets/prod/files/` (див.
   [CONTENT.md](CONTENT.md#downloadable-files-cv)).
4. ~~П. 6, 7, 8 — швидкі чистки коду~~ — ✅ зроблено.
5. П. 5 (рефакторинг у generic SectionComponent) — **відкладено 2026-07-17**
   за рішенням власника: дублювання коду не створює реальних проблем зараз,
   пріоритет нижчий за інші пункти. Лишається в бэклозі, повернутись коли
   з'явиться час або наступна секція, що вимагатиме синхронних правок у
   всіх чотирьох копіях.
