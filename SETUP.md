# Настройка аккаунтов и личного кабинета (Cloudflare Pages + D1 + Google OAuth)

Код уже в репозитории. Чтобы вход и кабинет заработали на `iteris-code.pages.dev`, нужно один раз настроить три вещи.

## 1. Google OAuth
1. Откройте [Google Cloud Console](https://console.cloud.google.com/) → создайте проект → **APIs & Services → OAuth consent screen** (тип External, scopes: `openid`, `email`, `profile`).
2. **Credentials → Create credentials → OAuth client ID → Web application**.
3. В **Authorized redirect URIs** добавьте адреса сайта **точно с косой чертой в конце**:
   - `https://iteris-code.pages.dev/`
   - `http://localhost:8788/` (для локальной разработки)
   - свой домен, когда подключите его (`https://ваш-домен/`)
4. Сохраните **Client ID** и **Client secret**.

## 2. База данных D1
```bash
npx wrangler login
npx wrangler d1 create iteris-code
npx wrangler d1 execute iteris-code --remote --file=schema.sql
```

## 3. Cloudflare Pages
В проекте Pages → **Settings**:
- **Functions → D1 database bindings**: имя переменной `DB`, база `iteris-code` (для Production и Preview).
- **Variables and Secrets** (Production и Preview):
  - `GOOGLE_CLIENT_ID` (обычная переменная)
  - `GOOGLE_CLIENT_SECRET` (**Secret**)
  - `SESSION_SECRET` (**Secret**, случайная строка: `openssl rand -base64 48`)
- Build command `npm run build`, output directory `dist` (как сейчас). Папка `functions/` подхватывается автоматически.

После этого сделайте новый деплой. Кнопка «Увійти» в шапке должна открывать окно Google.

## Локальная разработка
Создайте файл `.dev.vars` (он в `.gitignore`):
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
SESSION_SECRET=любая-длинная-строка
```
```bash
npm run build
npx wrangler d1 execute iteris-code --local --file=schema.sql
npx wrangler pages dev dist --d1=DB --port 8788
```

## Разработка на TypeScript
Весь код на TypeScript со строгими типами (`strict`, `erasableSyntaxOnly`):

| Папка | Что внутри |
|---|---|
| `src/` | фронтенд: `main.ts` (роутер), `views.ts`, `auth.ts` (вход и кабинет), `workspace.ts` + `editor.ts` (экран задания), `runner/` (запуск тестов в Web Worker), `tasks/` (практические задания) |
| `src/data/lessons.js` | тексты уроков (данные), типы в `lessons.d.ts` |
| `functions/`, `lib/` | Cloudflare Pages Functions (API) и общие помощники |
| `tests/` | автотесты |

Команды:
```bash
npm install                 # один раз
npm run check               # проверка типов (фронтенд + Functions)
npm run build               # сборка в dist/ (esbuild): app.js, runner.worker.js, index.html
npm test                    # тесты API и раннера (Node 22.18+)
npm i --no-save jsdom && npm run test:ui    # тесты интерфейса (нужна предварительная сборка)
```
Cloudflare Pages сам выполнит `npm install` и `npm run build`; версия Node берётся из `.node-version`.

## Практические задания
Задания лежат в `src/tasks/index.ts`: условие, бизнес-контекст, заготовка кода, тесты (API как у Vitest: `describe`, `it`, `expect`) и флаг `premium`. Чтобы добавить задание:
1. Описать его в `TASKS` и привязать к уроку (`lesson: "js/8"`).
2. Добавить эталонное решение в `tests/solutions.mjs` (в сборку оно не попадает).
3. Запустить `npm test`: он проверяет, что заготовка **не** проходит тесты, а эталон проходит все.

Как работает проверка: код пользователя и тесты запускаются в отдельном Web Worker (без доступа к DOM, сеть отключена, жёсткий тайм-аут 4 с против бесконечных циклов). Pro-задания проверяются **и на клиенте** (кнопка заблокирована), **и на сервере** (`/api/progress/complete` отвечает 402 без активной подписки).

## Как это устроено

- Сессия: подписанная HMAC-SHA256 cookie `session` (`HttpOnly; Secure; SameSite=Lax`, 30 дней), таблицы сессий не нужны.
- `lesson_id` в `user_progress` имеет вид `python/3` (курс/номер урока).
- Стрик считается по **UTC**-датам и растёт, когда пользователь отмечает урок пройденным или решает практическое задание. Первичная синхронизация локального прогресса после входа стрик не увеличивает.
- POST-запросы проверяют заголовок `Origin` (защита от CSRF).

## Ограничения и что ещё не сделано
- **Оплата и вебхук** (шаг 6): нужно выбрать платёжку. Кнопки Pro пока показывают «скоро».
- Автопроверка выполняется в браузере, поэтому технически её можно обойти (подделать запрос). Для учебных очков это допустимо, но результат не является доказательством знаний.
- Пока есть только JavaScript-задания. Для TypeScript потребуется транспиляция в браузере, для SQL — WebAssembly-база (DuckDB или sql.js).
- Монако подгружается с CDN jsDelivr (версия закреплена). Если CDN недоступен, включается простой редактор. При желании его можно разместить на своём домене.
- XP показывается после решения, но не хранится в базе (нет колонки): при необходимости считаем из решённых заданий.
- Один файл на задание (`solution.js`); выбор нескольких файлов — следующий этап.
- Наскрізні проекты в портфолио.
