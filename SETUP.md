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
- **Build command** `npm run build`, **Build output directory** `dist` (рекомендуется). Если там стоит `/`, сайт тоже заработает: при сборке в Cloudflare готовые файлы дублируются в корень. Папка `functions/` подхватывается автоматически.

После этого сделайте новый деплой. Кнопка «Увійти» в шапке должна открывать окно Google.

## 4. Оплата Pro (Lemon Squeezy)
Подписка $5/месяц оформляется через [Lemon Squeezy](https://www.lemonsqueezy.com/) (он выступает продавцом и сам собирает налоги). Начните с **Test mode**.

1. Создайте магазин и товар **Iteris Pro** с типом *Subscription*, цена $5 в месяц.
2. **Ссылка на оплату**: у товара нажмите *Share* и скопируйте ссылку вида `https://<магазин>.lemonsqueezy.com/checkout/buy/<id>`. Это значение `LEMONSQUEEZY_CHECKOUT_URL`.
3. **Вебхук**: *Settings → Webhooks → +*:
   - URL: `https://iteris-code.pages.dev/api/webhooks/payment`
   - придумайте **Signing secret** (длинная случайная строка) и сохраните его как `LEMONSQUEEZY_WEBHOOK_SECRET` (**Secret**);
   - события: `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_resumed`, `subscription_expired`, `subscription_paused`, `subscription_unpaused` (остальные сайт всё равно игнорирует).
4. По желанию `LEMONSQUEEZY_VARIANT_ID`: ID варианта товара. Тогда сайт принимает события только для него.
5. В настройках товара укажите адрес возврата после оплаты: `https://iteris-code.pages.dev/#/dashboard`.
6. Если база уже создана, один раз выполните миграцию (для новой базы достаточно `schema.sql`):
   ```bash
   npx wrangler d1 execute iteris-code --remote --file=migrations/0002_payments.sql
   ```
7. Новый деплой. Проверка в Test mode: «Перейти на Pro за $5» → тестовая карта `4242 4242 4242 4242` → в кабинете должен появиться бейдж Pro (если нет, нажмите «Оновити статус»).

Как это работает: `user_id` передаётся в оплату как `checkout[custom][user_id]` и возвращается в вебхуке, поэтому отдельная таблица клиентов не нужна. Подпись вебхука (HMAC-SHA256) проверяется на сервере. Дубли доставки игнорируются (таблица `payment_events`), запоздавшие старые события тоже. После `subscription_cancelled` доступ сохраняется до конца оплаченного периода, при неудачном платеже действует льготный период 3 дня.

> Перед запуском проверьте, что Lemon Squeezy выплачивает деньги в вашу страну, и посмотрите актуальные тарифы: фиксированная часть комиссии на платеже в $5 заметна. Другую платёжку (Stripe, Monobank) можно подключить по аналогии, логика лежит в `lib/billing.ts` и `functions/api/webhooks/`.

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
- **Оплата**: реализован Lemon Squeezy (см. раздел 4); не проверена на реальной платёжке: проверьте в Test mode.
- Автопроверка выполняется в браузере, поэтому технически её можно обойти (подделать запрос). Для учебных очков это допустимо, но результат не является доказательством знаний.
- Пока есть только JavaScript-задания. Для TypeScript потребуется транспиляция в браузере, для SQL — WebAssembly-база (DuckDB или sql.js).
- Монако подгружается с CDN jsDelivr (версия закреплена). Если CDN недоступен, включается простой редактор. При желании его можно разместить на своём домене.
- XP показывается после решения, но не хранится в базе (нет колонки): при необходимости считаем из решённых заданий.
- Один файл на задание (`solution.js`); выбор нескольких файлов — следующий этап.
- Наскрізні проекты в портфолио.
