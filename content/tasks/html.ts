// Практичні завдання курсу HTML: по одному на кожен урок, крім першого (інструменти веброзробника, це робота в браузері).
// Виконуються в браузері: сторінка малюється в ізольованому iframe, а перевірки (PageCheck) дивляться в її DOM.
// Еталони: tests/solutions/html.mjs. Формат і правила: Documentation/task-runtime.md
import type { PageTask } from "../../src/tasks/types.ts";

const base = { course: "html", runtime: "page", edit: "html", file: "index.html", editorLang: "html", premium: false } as const;

export const HTML_TASKS: readonly PageTask[] = [
  {
    ...base, id: "html-skeleton", lesson: "html/2", xp: 15,
    title: "Скелет HTML-документа",
    context: "Кожна сторінка в інтернеті починається з однакового скелета: тип документа, мова, кодування, заголовок вкладки. Без нього браузер вгадує все сам, і сторінка може показати кракозябри.",
    brief: [
      "Зберіть правильний документ: <code>&lt;!DOCTYPE html&gt;</code>, <code>&lt;html lang=\"uk\"&gt;</code>, у <code>&lt;head&gt;</code> кодування <code>&lt;meta charset=\"utf-8\"&gt;</code> і <code>&lt;title&gt;Моя перша сторінка&lt;/title&gt;</code>, а в <code>&lt;body&gt;</code> заголовок <code>&lt;h1&gt;Привіт, веб!&lt;/h1&gt;</code>.",
    ],
    starter: `<p>Привіт, веб!</p>
`,
    checks: [
      { name: "Оголошено <!DOCTYPE html>", source: { matches: "<!(?:DOCTYPE|doctype) html>" } },
      { name: "Мова сторінки: lang=\"uk\"", selector: "html", attr: { name: "lang", equals: "uk" } },
      { name: "Кодування UTF-8 у <head>", selector: "head > meta[charset]", attr: { name: "charset", matches: "^[Uu][Tt][Ff]-8$" } },
      { name: "Заголовок вкладки «Моя перша сторінка»", selector: "head > title", text: "Моя перша сторінка" },
      { name: "У <body> є <h1> «Привіт, веб!»", selector: "body > h1", text: "Привіт, веб!" },
    ],
  },
  {
    ...base, id: "html-headings-lists", lesson: "html/3", xp: 15,
    title: "Заголовки, списки і посилання",
    context: "Заголовки задають структуру сторінки (за ними читають і люди, і пошукові системи), списки групують однорідне, а посилання роблять мережу мережею.",
    brief: [
      "Розмітьте сторінку блогу: <code>h1</code> «Мій блог», <code>h2</code> «Теми», маркований список <code>ul</code> із трьох пунктів <code>li</code>, нумерований <code>ol</code> із двох кроків і посилання <code>&lt;a href=\"https://example.com\"&gt;Читати далі&lt;/a&gt;</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Блог</title></head>
<body>
  Мій блог
  Теми
  HTML
  CSS
  JavaScript
  Читати далі
</body>
</html>
`,
    checks: [
      { name: "Заголовок h1 «Мій блог»", selector: "h1", text: "Мій блог" },
      { name: "Підзаголовок h2 «Теми»", selector: "h2", text: "Теми" },
      { name: "Маркований список із трьох пунктів", selector: "ul > li", count: 3 },
      { name: "Нумерований список із двох кроків", selector: "ol > li", count: 2 },
      { name: "Посилання на https://example.com з текстом", selector: "a", text: "Читати далі", attr: { name: "href", equals: "https://example.com" } },
    ],
  },
  {
    ...base, id: "html-text-format", lesson: "html/4", xp: 20,
    title: "Смислове форматування тексту",
    context: "Теги форматування несуть сенс, а не лише вигляд: strong це важливе, em це наголос, code це код. Їх розуміють і програми для читання з екрана, і пошукові системи.",
    brief: [
      "Розмітьте речення: слово «Важливо» зробіть <code>&lt;strong&gt;</code>, фразу «не забудьте» <code>&lt;em&gt;</code>, команду «npm install» <code>&lt;code&gt;</code>.",
      "Цитату оберніть у <code>&lt;blockquote&gt;</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Підказка</title></head>
<body>
  <p>Важливо: не забудьте виконати команду npm install перед запуском.</p>
  Код пишуть для людей, а не для машин.
</body>
</html>
`,
    checks: [
      { name: "«Важливо» у <strong>", selector: "strong", text: "Важливо" },
      { name: "«не забудьте» у <em>", selector: "em", text: "не забудьте" },
      { name: "«npm install» у <code>", selector: "code", text: "npm install" },
      { name: "Цитата у <blockquote>", selector: "blockquote", text: "Код пишуть для людей" },
    ],
  },
  {
    ...base, id: "html-media", lesson: "html/5", xp: 20,
    title: "Зображення, аудіо та відео",
    context: "Зображення без alt недоступне незрячим користувачам і порожнє, коли картинка не завантажилась. Аудіо й відео вбудовуються без сторонніх плагінів, їм достатньо атрибута controls.",
    brief: [
      "Додайте зображення <code>photo.jpg</code> з описом у <code>alt</code>, обгорніть його у <code>&lt;figure&gt;</code> з підписом <code>&lt;figcaption&gt;</code>.",
      "Додайте <code>&lt;audio controls&gt;</code> з джерелом <code>song.mp3</code> та <code>&lt;video controls&gt;</code> із джерелом <code>clip.mp4</code> (через <code>&lt;source&gt;</code> або <code>src</code>).",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Медіа</title></head>
<body>
  <img src="photo.jpg">
</body>
</html>
`,
    checks: [
      { name: "Зображення photo.jpg з непорожнім alt", selector: "img[src=\"photo.jpg\"]", attr: { name: "alt", matches: ".+" } },
      { name: "Зображення в <figure> із підписом", selector: "figure > img + figcaption, figure > figcaption" },
      { name: "Аудіо з елементами керування", selector: "audio[controls]" },
      { name: "Відео з елементами керування", selector: "video[controls]" },
      { name: "Джерела song.mp3 і clip.mp4", selector: "audio[src$=\"song.mp3\"], audio source[src$=\"song.mp3\"], video[src$=\"clip.mp4\"], video source[src$=\"clip.mp4\"]", count: { min: 2 } },
    ],
  },
  {
    ...base, id: "html-table-form", lesson: "html/6", xp: 25,
    title: "Таблиця товарів і проста форма",
    context: "Таблиця потрібна для табличних даних (не для верстки сторінки!), а форма це спосіб отримати дані від користувача. thead, tbody і th допомагають і доступності, і стилізації.",
    brief: [
      "Зробіть таблицю з шапкою <code>thead</code> (стовпці «Товар», «Ціна», «Кількість») і тілом <code>tbody</code> із двох рядків товарів.",
      "Під таблицею додайте форму <code>&lt;form action=\"/search\" method=\"get\"&gt;</code> із текстовим полем <code>input</code> і кнопкою <code>&lt;button type=\"submit\"&gt;</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Каталог</title></head>
<body>
  <h1>Каталог</h1>
</body>
</html>
`,
    checks: [
      { name: "У шапці три заголовки стовпців (th)", selector: "table > thead th", count: 3 },
      { name: "Заголовки «Товар», «Ціна», «Кількість»", selector: "thead th", text: "Ціна" },
      { name: "У тілі таблиці два рядки", selector: "table > tbody > tr", count: 2 },
      { name: "Форма з action і method", selector: "form[action=\"/search\"][method=\"get\"]" },
      { name: "У формі є текстове поле і кнопка відправки", selector: "form input[type=\"text\"], form input:not([type]), form button[type=\"submit\"]", count: { min: 2 } },
    ],
  },
  {
    ...base, id: "html-form-fields", lesson: "html/7", xp: 30,
    title: "Форма реєстрації з валідацією",
    context: "Правильні типи полів і атрибути валідації дають безкоштовну перевірку в браузері: email без @ не пройде, вік поза межами теж. Мітка label, пов'язана з полем, ще й збільшує область натискання.",
    brief: [
      "Зробіть форму з полями: email (<code>type=\"email\"</code>, <code>required</code>, <code>id=\"email\"</code>), вік (<code>type=\"number\"</code>, <code>min=\"18\"</code>, <code>max=\"99\"</code>), вибір міста <code>select</code> щонайменше з трьома <code>option</code>, примітка <code>textarea</code>, прапорець згоди <code>type=\"checkbox\"</code> і кнопка <code>type=\"submit\"</code>.",
      "До email додайте мітку <code>&lt;label for=\"email\"&gt;</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Реєстрація</title></head>
<body>
  <form>
    <input type="text">
  </form>
</body>
</html>
`,
    checks: [
      { name: "Поле email обов'язкове", selector: "input#email[type=\"email\"][required]" },
      { name: "Мітка label зв'язана з полем email", selector: "label[for=\"email\"]" },
      { name: "Вік: число від 18 до 99", selector: "input[type=\"number\"][min=\"18\"][max=\"99\"]" },
      { name: "Список міст не менше ніж із трьох варіантів", selector: "select option", count: { min: 3 } },
      { name: "Поле textarea", selector: "textarea" },
      { name: "Прапорець згоди", selector: "input[type=\"checkbox\"]" },
      { name: "Кнопка відправки", selector: "button[type=\"submit\"]" },
    ],
  },
  {
    ...base, id: "html-semantic", lesson: "html/8", xp: 30,
    title: "Семантична розмітка замість div",
    context: "header, nav, main, article, aside і footer розповідають браузеру, пошуковикам і програмам для читання з екрана, що де лежить. Сторінка з одних div німа.",
    brief: [
      "Замініть універсальні <code>div</code> на семантичні теги: шапка це <code>header</code>, меню <code>nav</code> (зі списком посилань), основний вміст <code>main</code>, стаття <code>article</code>, бічна колонка <code>aside</code>, підвал <code>footer</code>.",
      "У результаті <code>div</code> не лишається. На сторінці має бути рівно один <code>main</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Новини</title></head>
<body>
  <div class="header"><h1>Новини</h1></div>
  <div class="menu"><a href="/">Головна</a> <a href="/about">Про нас</a></div>
  <div class="main">
    <div class="post"><h2>Перша новина</h2><p>Текст новини.</p></div>
    <div class="side">Реклама</div>
  </div>
  <div class="footer">© 2026</div>
</body>
</html>
`,
    checks: [
      { name: "Шапка в <header>", selector: "header", text: "Новини" },
      { name: "Меню в <nav> із посиланнями", selector: "nav a", count: { min: 2 } },
      { name: "Рівно один <main>", selector: "main", count: 1 },
      { name: "Новина в <article>", selector: "article", text: "Перша новина" },
      { name: "Бічна колонка в <aside>", selector: "aside" },
      { name: "Підвал у <footer>", selector: "footer", text: "2026" },
      { name: "Універсальних <div> не лишилось", selector: "div", not: true },
    ],
  },
  {
    ...base, id: "html-a11y", lesson: "html/9", xp: 30,
    title: "Виправте проблеми доступності",
    context: "Сторінка має бути зрозумілою без миші й без зору. Типові помилки: зображення без alt, поле без мітки, кнопка без тексту, відсутня мова документа. Їх виправлення займає хвилини.",
    brief: [
      "У сторінці п'ять проблем доступності. Виправте їх: вкажіть мову документа (<code>lang</code>), додайте <code>alt</code> зображенню, зв'яжіть поле пошуку з міткою <code>label</code>, дайте кнопці текст або <code>aria-label</code>, а головний заголовок зробіть <code>h1</code>, а не <code>h3</code>.",
    ],
    starter: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Магазин</title></head>
<body>
  <h3>Магазин книг</h3>
  <img src="cover.jpg">
  <input type="search" id="q">
  <button></button>
</body>
</html>
`,
    checks: [
      { name: "Мова документа вказана", selector: "html", attr: { name: "lang", matches: ".+" } },
      { name: "Головний заголовок це h1", selector: "h1", text: "Магазин книг" },
      { name: "Усі зображення мають непорожній alt", selector: "img:not([alt]), img[alt=\"\"]", not: true },
      { name: "Поле пошуку має мітку", selector: "label[for=\"q\"]" },
      { name: "Кнопка має доступну назву", selector: "button", count: 1, source: { matches: "<button[^>]*aria-label=\"[^\"]+\"|<button[^>]*>\\s*[^<\\s][^<]*</button>" } },
    ],
  },
  {
    ...base, id: "html-seo-meta", lesson: "html/10", xp: 35,
    title: "Мета-теги для пошуку і соцмереж",
    context: "Пошукова система показує title і description у видачі, а соцмережі беруть картинку й заголовок із Open Graph. Правильні мета-теги це безкоштовний трафік.",
    brief: [
      "У <code>&lt;head&gt;</code> додайте: <code>&lt;title&gt;</code>, <code>meta name=\"description\"</code> (від 50 до 160 символів), <code>meta name=\"viewport\"</code>, Open Graph теги <code>og:title</code>, <code>og:description</code> і <code>og:image</code> (через <code>property</code>) та канонічне посилання <code>&lt;link rel=\"canonical\" href=\"https://example.com/\"&gt;</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
</head>
<body>
  <h1>Курси програмування</h1>
</body>
</html>
`,
    checks: [
      { name: "Є заголовок сторінки", selector: "head > title", text: "" },
      { name: "Опис сторінки від 50 до 160 символів", selector: "meta[name=\"description\"]", attr: { name: "content", matches: "^.{50,160}$" } },
      { name: "Мета-тег viewport", selector: "meta[name=\"viewport\"][content*=\"width=device-width\"]" },
      { name: "Open Graph: og:title", selector: "meta[property=\"og:title\"][content]" },
      { name: "Open Graph: og:description", selector: "meta[property=\"og:description\"][content]" },
      { name: "Open Graph: og:image", selector: "meta[property=\"og:image\"][content]" },
      { name: "Канонічне посилання", selector: "link[rel=\"canonical\"][href=\"https://example.com/\"]" },
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
    ...base, id: "html-portfolio", lesson: "html/12", xp: 40,
    title: "Сторінка-портфоліо",
    context: "Підсумкове завдання: складіть повну сторінку з усього курсу. Скелет, семантичні блоки, навігація якорями, зображення з alt, форма зв'язку і підвал.",
    brief: [
      "Створіть сторінку-портфоліо: <code>header</code> з <code>h1</code> (ваше ім'я) і <code>nav</code> із трьома якірними посиланнями <code>#about</code>, <code>#projects</code>, <code>#contact</code>.",
      "У <code>main</code> три розділи <code>section</code> з відповідними <code>id</code>: «Про мене» (абзац і фото з <code>alt</code>), «Проєкти» (три <code>article</code> із заголовками <code>h3</code>) і «Контакти» (форма з email та кнопкою). Додайте <code>footer</code>, мову, кодування, <code>title</code> і viewport.",
    ],
    starter: `<!DOCTYPE html>
<html>
<head></head>
<body>
  <h1>Моє портфоліо</h1>
</body>
</html>
`,
    checks: [
      { name: "Мова, кодування і заголовок вкладки", selector: "html[lang] > head > meta[charset] ~ title" },
      { name: "Мета-тег viewport", selector: "meta[name=\"viewport\"]" },
      { name: "Шапка з заголовком h1", selector: "header h1" },
      { name: "Навігація з якорями #about, #projects, #contact", selector: "nav a[href=\"#about\"], nav a[href=\"#projects\"], nav a[href=\"#contact\"]", count: 3 },
      { name: "Три розділи з відповідними id", selector: "main > section#about, main > section#projects, main > section#contact", count: 3 },
      { name: "Фото з alt у розділі «Про мене»", selector: "#about img[alt]", attr: { name: "alt", matches: ".+" } },
      { name: "Три проєкти: article із h3", selector: "#projects article h3", count: 3 },
      { name: "Форма контактів з email і кнопкою", selector: "#contact form input[type=\"email\"], #contact form button", count: { min: 2 } },
      { name: "Підвал", selector: "footer" },
    ],
  },
];
