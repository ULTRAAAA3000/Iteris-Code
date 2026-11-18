# Iteris Code

Платформа для вивчення мов програмування. Курси: Python, Go, Java, C++, Pascal, HTML, CSS, JavaScript, TypeScript, PHP, SQL, Git, Bash. Уроки згруповані по главах.
Кожен урок — це пояснення, приклад коду й завдання для самоперевірки.

**Публічно** (без входу) лише довідник по мовах, розбитий за напрямами: `/ref/python` тощо.
**Уроки й практичні завдання** відкриваються лише після входу: їх тексти лежать у `content/`, потрапляють лише в серверний код і віддаються браузеру через `/api/courses` та `/api/lesson` (див. `lib/content.ts`). У публічну збірку `dist/` вони не входять.

Фронтенд на TypeScript (`src/`), збірка esbuild у `dist/`; тексти уроків — `content/lessons.js`, довідник — `src/data/reference/<мова>.ts`.
Сторінки перемикаються через History API (`/ref/python`, `/course/python`, `/lesson/python/1`); старі адреси з `#/` перетворюються на звичайні. Готові сторінки для пошуковиків створює збірка (`src/seo.ts`).

## Додати урок
Додайте об'єкт `{ t, p, code, note, tasks }` у відповідний масив у `content/lessons.js`.

## Додати факти для плашки в кабінеті
Допишіть рядок у список `f` (факти) або `t` (підказки) потрібного курсу в `content/facts.ts`. Деталі: розділ «Факты в кабинете» у `SETUP.md`.

## Додати проєкт за ТЗ
Опишіть його в `content/projects/index.ts` за зразком `js-todo` (ТЗ, вимоги R1…Rn з перевірками, заготовка) і додайте еталонне рішення в `tests/solutions.mjs`. Деталі: розділ «Проекты по ТЗ» у `SETUP.md`.

## SEO та видимість в ІІ
Усе генерується під час `npm run build` у `src/seo.ts`: метадані, JSON-LD, `sitemap.xml`, `robots.txt` з правилами для ІІ-ботів, `llms.txt`, `llms-full.txt`, Markdown-довідники `/ref/<мова>.md`, іконки й маніфест. Ручні кроки (Cloudflare, Google Search Console, Bing): розділ «SEO и видимость в ИИ» у `SETUP.md`.

## Додати розділ довідника
Додайте `{ t, items: [{ t, code, note }] }` у `src/data/reference/<мова>.ts`. У `note` текст у зворотних апострофах стає `<code>`.

## Практика в уроках
У уроков с практическим заданием под теорией (в той же колонке) идут постановка, редактор кода и терминал: JavaScript выполняется в браузере, Go запускается на сервере (`/api/run`, Go Playground), результат проверяется автоматически. Как это устроено и как добавить другой язык: [Documentation/task-runtime.md](Documentation/task-runtime.md).

## Деплой
Cloudflare Pages: Build command `npm run build`, output directory `dist`.

## Особистий кабінет
Вхід через Google, прогрес і дашборд працюють через Cloudflare Pages Functions та D1. Налаштування: [SETUP.md](SETUP.md).

## Документація
План розробки та опис платформи: [Documentation/main-plan.md](Documentation/main-plan.md), [Documentation/about.md](Documentation/about.md).
