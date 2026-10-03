# Iteris Code

Платформа для вивчення мов програмування. Курси: Python, C++, Pascal, HTML, CSS, JavaScript, SQL.
Кожен урок — це пояснення, приклад коду й завдання для самоперевірки.

Статичний сайт без збірки: `index.html` + `lessons.js` (уроки) + `app.js` (логіка).
Сторінки перемикаються через hash-роутер (`#/course/python`, `#/lesson/python/1`).

## Додати урок
Додайте об'єкт `{ t, p, code, note, tasks }` у відповідний масив у `lessons.js`.

## Деплой
Netlify: Add new site → Import from Git, Build command порожня, Publish directory `.`
