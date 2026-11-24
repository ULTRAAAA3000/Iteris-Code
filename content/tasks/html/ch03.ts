// Завдання курсу HTML, глава 03 «Посилання й шляхи» (уроки 10–13). Виконуються в браузері (runtime: "page"), еталони: tests/solutions/html-ch03.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "html", runtime: "page", edit: "html", file: "index.html", editorLang: "html", premium: false } as const;

export const TASKS_03: readonly PageTask[] = [
  {
    ...base, id: "html-links", lesson: "html/10", xp: 20,
    title: "Посилання: внутрішні, зовнішні й файл для завантаження",
    context: "Добре оформлені посилання зрозумілі за текстом, а зовнішні відкриваються безпечно. Типова сторінка містить і внутрішні переходи, і зовнішні сайти, і файли для завантаження.",
    brief: [
      "Створіть три посилання. Внутрішнє на <code>about.html</code> з текстом «Про нас». Зовнішнє на <code>https://example.com</code> з текстом «Приклад на іншому сайті»: воно має відкриватися в новій вкладці (<code>target=\"_blank\"</code>) і мати <code>rel=\"noopener noreferrer\"</code>. І посилання на файл <code>price.pdf</code> з текстом «Завантажити прайс-лист» та атрибутом <code>download</code>.",
      "Не використовуйте тексти на кшталт «натисніть тут».",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Посилання</title></head>
<body>
  <h1>Вебстарт</h1>
  <p>Про нас</p>
  <p>Приклад на іншому сайті</p>
  <p>Завантажити прайс-лист</p>
</body>
</html>
`,
    checks: [
      { name: "Внутрішнє посилання на about.html", selector: "a[href=\"about.html\"]", text: "Про нас" },
      { name: "Зовнішнє посилання на https://example.com", selector: "a[href=\"https://example.com\"]", text: "Приклад на іншому сайті" },
      { name: "Зовнішнє посилання відкривається в новій вкладці", selector: "a[href=\"https://example.com\"][target=\"_blank\"]" },
      { name: "rel містить noopener і noreferrer", selector: "a[href=\"https://example.com\"]", attr: { name: "rel", matches: "(?=.*noopener)(?=.*noreferrer)" } },
      { name: "Посилання для завантаження price.pdf з атрибутом download", selector: "a[href=\"price.pdf\"][download]", text: "Завантажити прайс-лист" },
      { name: "Немає посилань із текстом «натисніть тут»", selector: "a", text: "натисніть тут", not: true },
    ],
  },
  {
    ...base, id: "html-project-paths", lesson: "html/11", xp: 35,
    title: "Шляхи до файлів проєкту",
    context: "Сайт це папка з файлами: css/, js/, images/, pages/. Шлях має бути відносним до місця, де лежить сторінка. Шлях на кшталт C:\\Users\\... працює лише на вашому комп'ютері й ламається на сервері.",
    brief: [
      "Структура проєкту: <code>index.html</code>, <code>css/style.css</code>, <code>js/app.js</code>, <code>images/logo.png</code>, <code>pages/about.html</code>, <code>favicon.ico</code>. У заготовці шляхи вказані неправильно (абсолютні, зі шляхом диска).",
      "Підключіть <code>css/style.css</code> (<code>link rel=\"stylesheet\"</code>), <code>js/app.js</code> (<code>script</code> з <code>defer</code>), додайте логотип <code>images/logo.png</code>, посилання на <code>pages/about.html</code> та іконку <code>favicon.ico</code>. Усі шляхи відносні, без жодного слеша на початку.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Мій сайт</title>
  <link rel="stylesheet" href="C:\\Users\\me\\site\\style.css">
  <script src="/js/app.js"></script>
</head>
<body>
  <img src="C:\\Users\\me\\site\\logo.png" alt="Логотип">
  <a href="about.html">Про мене</a>
</body>
</html>
`,
    checks: [
      { name: "Стилі: css/style.css", selector: "link[rel=\"stylesheet\"][href=\"css/style.css\"]" },
      { name: "Скрипт js/app.js із defer", selector: "script[src=\"js/app.js\"][defer]" },
      { name: "Логотип images/logo.png з alt", selector: "img[src=\"images/logo.png\"]", attr: { name: "alt", matches: ".+" } },
      { name: "Посилання pages/about.html", selector: "a[href=\"pages/about.html\"]" },
      { name: "Іконка favicon.ico", selector: "link[rel~=\"icon\"][href=\"favicon.ico\"]" },
      { name: "Немає шляхів зі слеша або диска", selector: "[src^=\"/\"], [href^=\"/\"], [src*=\":\\\\\"], [href*=\":\\\\\"]", not: true },
    ],
  },
  {
    ...base, id: "html-anchors", lesson: "html/12", xp: 25,
    title: "Зміст сторінки на якорях, пошта й телефон",
    context: "На довгих сторінках зміст із якорями економить прокручування, а посилання mailto: і tel: ставлять у шапку майже кожного сайту компанії.",
    brief: [
      "Зробіть зміст: три посилання <code>#intro</code>, <code>#usage</code>, <code>#faq</code> з текстами «Вступ», «Використання», «Запитання». Три розділи <code>&lt;h2&gt;</code> повинні мати відповідні <code>id</code>. У кінці додайте посилання «Нагору» на <code>#top</code>, а на заголовок <code>&lt;h1&gt;</code> повісьте <code>id=\"top\"</code>.",
      "У підвалі додайте <code>mailto:info@example.com</code> із темою листа (параметр <code>subject</code>) і <code>tel:+380441234567</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Довідка</title></head>
<body>
  <h1>Довідка</h1>
  <p>Вступ | Використання | Запитання</p>
  <h2>Вступ</h2>
  <p>Текст вступу.</p>
  <h2>Використання</h2>
  <p>Текст про використання.</p>
  <h2>Запитання</h2>
  <p>Текст запитань.</p>
  <p>Нагору</p>
  <footer>info@example.com, 044 123 45 67</footer>
</body>
</html>
`,
    checks: [
      { name: "Три посилання змісту на якорі", selector: "a[href=\"#intro\"], a[href=\"#usage\"], a[href=\"#faq\"]", count: 3 },
      { name: "Розділи мають id intro, usage, faq", selector: "h2#intro, h2#usage, h2#faq", count: 3 },
      { name: "Заголовок h1 має id=\"top\"", selector: "h1#top" },
      { name: "Посилання «Нагору» на #top", selector: "a[href=\"#top\"]", text: "Нагору" },
      { name: "Посилання mailto: із темою листа", selector: "a[href^=\"mailto:info@example.com\"]", attr: { name: "href", matches: "subject=" } },
      { name: "Посилання tel: у міжнародному форматі", selector: "a[href=\"tel:+380441234567\"]" },
    ],
  },
  {
    ...base, id: "html-nav-menu", lesson: "html/13", xp: 30,
    title: "Меню сайту й хлібні крихти",
    context: "Навігацію читають і люди, і програми читання з екрана. Список посилань у nav, відмітка поточної сторінки й підписи блоків дозволяють орієнтуватися, не бачачи сторінки.",
    brief: [
      "Зробіть головне меню: <code>&lt;nav aria-label=\"Головне меню\"&gt;</code> з маркованим списком із чотирьох посилань (Головна, Каталог, Про нас, Контакти). Поточна сторінка «Каталог» має атрибут <code>aria-current=\"page\"</code>, і лише вона.",
      "Нижче додайте хлібні крихти: другий <code>&lt;nav aria-label=\"Хлібні крихти\"&gt;</code> із нумерованим списком <code>ol</code> із трьох пунктів (Головна, Каталог, Навушники); перші два пункти посилання.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Каталог</title></head>
<body>
  <div class="menu">
    <a href="index.html">Головна</a>
    <a href="catalog.html">Каталог</a>
    <a href="about.html">Про нас</a>
    <a href="contacts.html">Контакти</a>
  </div>
  <div>Головна / Каталог / Навушники</div>
</body>
</html>
`,
    checks: [
      { name: "Головне меню в nav із aria-label", selector: "nav[aria-label=\"Головне меню\"]" },
      { name: "Чотири пункти меню в ul > li > a", selector: "nav[aria-label=\"Головне меню\"] > ul > li > a", count: 4 },
      { name: "Поточна сторінка «Каталог» має aria-current=\"page\"", selector: "nav[aria-label=\"Головне меню\"] a[aria-current=\"page\"]", text: "Каталог" },
      { name: "aria-current лише в одного пункту меню", selector: "nav[aria-label=\"Головне меню\"] [aria-current]", count: 1 },
      { name: "Хлібні крихти в окремому nav із нумерованим списком із трьох пунктів", selector: "nav[aria-label=\"Хлібні крихти\"] > ol > li", count: 3 },
      { name: "Перші два пункти крихт посилання", selector: "nav[aria-label=\"Хлібні крихти\"] ol li a", count: { min: 2 } },
    ],
  },
];
