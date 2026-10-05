# Iteris Code

Платформа для вивчення мов програмування. Курси: Python, Go, Java, C++, Pascal, HTML, CSS, JavaScript, TypeScript, PHP, SQL, Git, Bash. Уроки згруповані по главах.
Кожен урок — це пояснення, приклад коду й завдання для самоперевірки.

Фронтенд на TypeScript (`src/`), збірка esbuild у `dist/`; тексти уроків — `src/data/lessons.js`.
Сторінки перемикаються через hash-роутер (`#/course/python`, `#/lesson/python/1`).

## Додати урок
Додайте об'єкт `{ t, p, code, note, tasks }` у відповідний масив у `src/data/lessons.js`.

## Деплой
Cloudflare Pages: Build command `npm run build`, output directory `dist`.

## Особистий кабінет
Вхід через Google, прогрес і дашборд працюють через Cloudflare Pages Functions та D1. Налаштування: [SETUP.md](SETUP.md).
