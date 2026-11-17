# Staging: закрытый сайт для тестов и порядок релизов

> **Черновик** (17.11.2026). План внедрения, **делаем после старта MVP**. Идея и причины: [launch-strategy.md](launch-strategy.md). Настройка основного сайта: [SETUP.md](../SETUP.md). Некоторые шаги нужно проверить на практике (отмечены ⚠).

## 1. Схема

| | Основной сайт | Staging |
|---|---|---|
| Ветка | `main` | `staging` |
| Адрес | `iteris-code.org`, `dashboard.iteris-code.org` | `staging.iteris-code.org` ⚠ |
| Доступ | всем | только команде (Cloudflare Access) |
| Поисковики | индексируют | закрыто (`noindex`) |
| База D1 | `iteris-code` | `iteris-code-staging` |
| Хостинг | Cloudflare Pages, Production | тот же проект Pages, Preview |

Один проект Pages, две среды: Production (ветка `main`) и Preview (остальные ветки, в том числе `staging`).

## 2. Настройка (чек-лист)

1. **Ветка.** Создать `staging` из `main`.
2. **База.** `npx wrangler d1 create iteris-code-staging`, затем `npx wrangler d1 execute iteris-code-staging --remote --file=schema.sql`.
3. **Pages → Settings → Functions → D1 bindings:** для **Preview** привязать `DB` к `iteris-code-staging` (для Production остаётся `iteris-code`).
4. **Переменные для Preview** (Settings → Variables and Secrets, среда Preview):
   - `SITE_URL` = `https://staging.iteris-code.org`;
   - `COOKIE_DOMAIN` = `staging.iteris-code.org` (**не** `iteris-code.org`, иначе cookie основного сайта попадёт на staging);
   - `SESSION_SECRET`: другое значение;
   - ключи Google/GitHub (см. п. 3), при необходимости `TURNSTILE_*`, `RESEND_API_KEY`, `MAIL_FROM` (тестовые);
   - `ROOT_DOMAIN`, если нужен кабинет на поддомене staging.
5. **Адрес.** ⚠ Custom domains в Pages привязываются к основной ветке, поэтому для ветки используется DNS: запись CNAME `staging` → `staging.<проект>.pages.dev`. Если не сработает, работаем по адресу `pages.dev` под защитой.
6. **Закрыть доступ.** Cloudflare Zero Trust → Access → Applications: приложение на `staging.iteris-code.org` (и на `staging.<проект>.pages.dev`), правило «разрешить почты команды». Бесплатно до 50 человек.
7. **Не индексировать.** Заголовок `X-Robots-Tag: noindex, nofollow` (в `_headers` для Preview или Cloudflare Transform Rules); `robots.txt` на staging с `Disallow: /`.
8. **Проверка:** без входа Access сайт не открывается; вход Google/GitHub возвращает на staging, а не на основной; запись в базу не попадает в основную.

## 3. Вход (OAuth)

- **Google:** в том же OAuth-клиенте добавить второй адрес возврата `https://staging.iteris-code.org/` (адрес возврата в проекте = корень сайта со слешем).
- **GitHub:** отдельная OAuth App для staging (в одном приложении адрес возврата только один), свои `GITHUB_CLIENT_ID/SECRET` в Preview.

## 4. Порядок релизов

1. Работа в ветке `feature-*`, PR в `staging`.
2. После слияния сайт обновляется на staging; команда проверяет на телефоне и компьютере.
3. Готовое попадает в основной сайт: PR в `main` и **Merge**; Cloudflare собирает и выкладывает сам (1–2 минуты).
4. **Миграции:** сначала на staging, затем на основную базу `npx wrangler d1 execute iteris-code --remote --file=migrations/NNNN_….sql` до или сразу после слияния.

**Частями.** Целиком `staging` в `main` не вливаем, если там есть сырое. Варианты:
- **Короткие ветки:** функция проверена на staging, затем той же веткой PR в `main`.
- **Флаг:** недоделанное вливается выключенным, включается переменной окружения (как GitHub-вход).

**Правила:**
- Не использовать `force push` в `main`.
- В `main` напрямую не коммитим, только PR.
- После каждого релиза запись в «Историю изменений» [about.md](about.md).
- Если `main` ушёл вперёд (срочная правка), влить `main` в `staging`, чтобы ветки не расходились.

## 5. Риски и открытое

- ⚠ Адрес `staging.iteris-code.org` на ветке через CNAME: проверить; запасной вариант: `pages.dev`.
- Две базы и два набора ключей: легко перепутать. Подписывать их в Cloudflare понятно («staging»).
- Тестовые письма (Resend): не слать реальным людям.
- Есть ли смысл в автотестах перед слиянием в `main` (GitHub Actions: `npm run check`, `npm test`)? Предложение: добавить, дёшево.
- Кто нажимает Merge в `main`: владелец или любой из команды.
