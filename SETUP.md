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

## Тесты бэкенда
`npm test` (нужен Node 22+). Проверяют подпись сессии, вход, прогресс, стрик, дашборд и защиту от подмены Origin на реальной SQLite-схеме.

## Как это устроено
- Сессия: подписанная HMAC-SHA256 cookie `session` (`HttpOnly; Secure; SameSite=Lax`, 30 дней), таблицы сессий не нужны.
- `lesson_id` в `user_progress` имеет вид `python/3` (курс/номер урока).
- Стрик считается по **UTC**-датам и растёт, когда пользователь отмечает урок пройденным. Первичная синхронизация локального прогресса после входа стрик не увеличивает.
- POST-запросы проверяют заголовок `Origin` (защита от CSRF).

## Ещё не сделано
Оплата и вебхук (шаг 6), редактор кода и автопроверка (шаги 4–5), сквозные проекты в портфолио. Кнопки Pro в кабинете пока показывают сообщение «скоро».
