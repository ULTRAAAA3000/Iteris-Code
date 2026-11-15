# Iteris Code

Платформа для вивчення мов програмування. Курси: Python, Go, Java, C++, Pascal, HTML, CSS, JavaScript, TypeScript, PHP, SQL, Git, Bash. Уроки згруповані по главах.
Кожен урок — це пояснення, приклад коду й завдання для самоперевірки.

Фронтенд на TypeScript (`src/`), збірка esbuild у `dist/`; тексти уроків — `src/data/lessons.js`.
Сторінки перемикаються через hash-роутер (`#/course/python`, `#/lesson/python/1`).

## Додати урок
Додайте об'єкт `{ t, p, code, note, tasks }` у відповідний масив у `src/data/lessons.js`.

## Практика в уроках
У уроков с практическим заданием под теорией (в той же колонке) идут постановка, редактор кода и терминал: JavaScript выполняется в браузере, Go запускается на сервере (`/api/run`, Go Playground), результат проверяется автоматически. Как это устроено и как добавить другой язык: [Documentation/task-runtime.md](Documentation/task-runtime.md).

## Деплой
Cloudflare Pages: Build command `npm run build`, output directory `dist`.

## Особистий кабінет
Вхід через Google, прогрес і дашборд працюють через Cloudflare Pages Functions та D1. Налаштування: [SETUP.md](SETUP.md).

## Документація
План розробки та опис платформи: [Documentation/main-plan.md](Documentation/main-plan.md), [Documentation/about.md](Documentation/about.md).
