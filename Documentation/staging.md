# Staging: закрытый сайт для тестов и порядок релизов

> **Готовится** (28.11.2026). Репозиторная часть сделана (закрытый режим сборки, ветка `staging`, CI); шаги в Cloudflare выполняет владелец по чек-листу ниже (из песочницы разработки доступа к Cloudflare нет). Раньше это был черновик «после старта MVP». Идея и причины: [launch-strategy.md](launch-strategy.md). Настройка основного сайта: [SETUP.md](../SETUP.md). Некоторые шаги нужно проверить на практике (отмечены ⚠).

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

## 1.1 Что уже в репозитории

- **Закрытый режим сборки** (`build.mjs`): включается `STAGING=1` или автоматически в Cloudflare Pages на любой ветке, кроме `main` (`CF_PAGES_BRANCH`). Тогда `robots.txt` = `Disallow: /`, `sitemap.xml` пустой, все ответы с `X-Robots-Tag: noindex, nofollow, noarchive`, в углу страницы плашка **STAGING**. Основной сайт сборкой `main` не меняется. Пункт 7 чек-листа ниже этим закрыт, отдельных файлов не нужно. Тест: `tests/staging.test.mjs`.
- **Ветка `staging`** создана из `main`; CI (`.github/workflows/ci.yml`) гоняет сборку, типы и тесты на PR и на пуш в `main` и `staging`.
- **Что не знает репозиторий** (делает владелец, пункты 2–6 и 8 ниже): база D1, переменные Preview, DNS, Cloudflare Access, OAuth-адреса.

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
7. **Не индексировать.** Сделано в сборке (см. 1.1): на ветке `staging` отдаются `robots.txt` с `Disallow: /` и заголовок `X-Robots-Tag`. Проверить: `curl -sI https://staging.iteris-code.org/ | grep -i robots` (за Access сначала войти).
8. **Проверка:** без входа Access сайт не открывается; вход Google/GitHub возвращает на staging, а не на основной; запись в базу не попадает в основную.

## 3. Вход (OAuth)

- **Google:** в том же OAuth-клиенте добавить второй адрес возврата `https://staging.iteris-code.org/` (адрес возврата в проекте = корень сайта со слешем).
- **GitHub:** отдельная OAuth App для staging (в одном приложении адрес возврата только один), свои `GITHUB_CLIENT_ID/SECRET` в Preview.

## 3.1 Синхронизация курсов и наполнения в staging

Новые курсы пишутся ветками `feature-*`. Их сначала вливают в `staging` (PR в `staging`), проверяют там, затем та же ветка идёт PR в `main`. Если `main` ушёл вперёд (например, влиты курсы), `staging` подтягивают так:
```bash
git checkout staging && git merge origin/main && git push origin staging
```
Курсы, которые доделываются, вливают в `staging` по мере готовности; в `main` они уходят только после проверки.

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
