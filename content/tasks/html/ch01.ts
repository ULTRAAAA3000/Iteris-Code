// Завдання курсу HTML, глава 01 «Початок» (уроки 1–4). Виконуються в браузері (runtime: "page"), еталони: tests/solutions/html-ch01.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "html", runtime: "page", edit: "html", file: "index.html", editorLang: "html", premium: false } as const;

export const TASKS_01: readonly PageTask[] = [
  {
    ...base, id: "html-first-page", lesson: "html/1", xp: 15,
    title: "Перша сторінка-візитка",
    context: "Браузер отримує від сервера звичайний текст і сам визначає, що в ньому заголовок, а що абзац. Вашу першу сторінку він побудує з простої розмітки: так починається будь-який сайт.",
    brief: [
      "У редакторі лежить звичайний текст без розмітки. Перетворіть його на сторінку-візитку: заголовок «Візитка» зробіть елементом <code>&lt;h1&gt;</code>, а два рядки під ним двома абзацами <code>&lt;p&gt;</code>.",
      "Додайте в <code>&lt;head&gt;</code> заголовок вкладки <code>&lt;title&gt;Візитка&lt;/title&gt;</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
</head>
<body>
  Візитка
  Мене звати Олена.
  Я вчу HTML.
</body>
</html>
`,
    checks: [
      { name: "Заголовок вкладки «Візитка» у <head>", selector: "head > title", text: "Візитка", hint: "Додайте <title>Візитка</title> усередину <head>." },
      { name: "Головний заголовок <h1> «Візитка»", selector: "body > h1", text: "Візитка", count: 1, hint: "Оберніть слово «Візитка» у <h1>…</h1>." },
      { name: "Абзац <p> зі словами «Мене звати»", selector: "body > p", text: "Мене звати" },
      { name: "Абзац <p> зі словами «Я вчу HTML»", selector: "body > p", text: "Я вчу HTML" },
      { name: "Рівно два абзаци", selector: "body > p", count: 2 },
    ],
  },
  {
    ...base, id: "html-skeleton", lesson: "html/2", xp: 15,
    title: "Скелет HTML-документа",
    context: "Кожна сторінка в інтернеті починається з однакового скелета: тип документа, мова, кодування, масштаб на телефоні, заголовок вкладки. Без нього браузер вгадує все сам, і сторінка може показати кракозябри.",
    brief: [
      "Зберіть правильний документ: <code>&lt;!DOCTYPE html&gt;</code>, <code>&lt;html lang=\"uk\"&gt;</code>, у <code>&lt;head&gt;</code> кодування <code>&lt;meta charset=\"utf-8\"&gt;</code>, мета-тег <code>viewport</code> з вмістом <code>width=device-width, initial-scale=1</code> і <code>&lt;title&gt;Моя перша сторінка&lt;/title&gt;</code>, а в <code>&lt;body&gt;</code> заголовок <code>&lt;h1&gt;Привіт, веб!&lt;/h1&gt;</code>.",
    ],
    starter: `<p>Привіт, веб!</p>
`,
    checks: [
      { name: "Оголошено <!DOCTYPE html>", source: { matches: "<!(?:DOCTYPE|doctype) html>" } },
      { name: "Мова сторінки: lang=\"uk\"", selector: "html", attr: { name: "lang", equals: "uk" } },
      { name: "Кодування UTF-8 у <head>", selector: "head > meta[charset]", attr: { name: "charset", matches: "^[Uu][Tt][Ff]-8$" } },
      { name: "Мета-тег viewport із width=device-width", selector: "head > meta[name=\"viewport\"]", attr: { name: "content", has: "width=device-width" }, hint: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" },
      { name: "Заголовок вкладки «Моя перша сторінка»", selector: "head > title", text: "Моя перша сторінка" },
      { name: "У <body> є <h1> «Привіт, веб!»", selector: "body > h1", text: "Привіт, веб!" },
    ],
  },
  {
    ...base, id: "html-elements-attrs", lesson: "html/3", xp: 20,
    title: "Картка товару: елементи, атрибути, вкладеність",
    context: "Майже кожен інтернет-магазин складається з карток: контейнер, у ньому заголовок, ціна й кнопка. Щоб стилі й скрипти знаходили потрібні елементи, їм дають id і класи, а вкладення має бути правильним.",
    brief: [
      "Зберіть картку товару. Контейнер <code>&lt;div&gt;</code> з атрибутами <code>id=\"product\"</code> і <code>class=\"card\"</code>. Усередині: заголовок <code>&lt;h2&gt;Навушники&lt;/h2&gt;</code>, абзац <code>&lt;p&gt;</code> із текстом «Ціна: » і вкладеним <code>&lt;span class=\"price\"&gt;1200 грн&lt;/span&gt;</code>, а також кнопка <code>&lt;button&gt;</code> з булевим атрибутом <code>disabled</code> і написом «Немає в наявності».",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Товар</title></head>
<body>
  Навушники
  Ціна: 1200 грн
  Немає в наявності
</body>
</html>
`,
    checks: [
      { name: "Контейнер div з id=\"product\"", selector: "div#product" },
      { name: "У контейнера клас card", selector: "div#product.card", hint: "Атрибут class=\"card\" має бути на тому самому div." },
      { name: "Заголовок h2 «Навушники» всередині картки", selector: "div#product > h2", text: "Навушники" },
      { name: "Абзац із текстом «Ціна:» всередині картки", selector: "div#product > p", text: "Ціна:" },
      { name: "Ціна «1200 грн» у span.price всередині абзацу", selector: "div#product > p > span.price", text: "1200 грн", hint: "span вкладається в p: <p>Ціна: <span class=\"price\">…</span></p>." },
      { name: "Вимкнена кнопка (атрибут disabled) з написом", selector: "div#product > button[disabled]", text: "Немає в наявності" },
      { name: "id=\"product\" на сторінці один", selector: "[id=\"product\"]", count: 1 },
    ],
  },
  {
    ...base, id: "html-fix-errors", lesson: "html/4", xp: 20,
    title: "Знайдіть і виправте помилки в розмітці",
    context: "Браузер мовчки виправляє помилки розмітки, тому їх легко не помітити. Валідатор і уважне читання дерева допомагають знайти проблеми до того, як їх побачать користувачі й пошукові системи.",
    brief: [
      "У коді сторінки кілька помилок. Виправте їх: додайте мову сторінки <code>lang=\"uk\"</code> і кодування <code>&lt;meta charset=\"utf-8\"&gt;</code>; поправте перехрещене вкладання тегів <code>b</code> та <code>i</code> (спочатку закривається внутрішній); закрийте абзац тегом <code>&lt;/p&gt;</code>; додайте до зображення змістовний <code>alt</code>; зробіть ідентифікатори унікальними (другий <code>top</code> перейменуйте на <code>new</code>).",
    ],
    starter: `<!DOCTYPE html>
<html>
<head>
  <title>Каталог</title>
</head>
<body>
  <h1 id="top">Каталог</h1>
  <p>Тут <b>важливе <i>слово</b></i> у тексті.
  <img src="logo.png">
  <h2 id="top">Нове</h2>
</body>
</html>
`,
    checks: [
      { name: "Мова сторінки: lang=\"uk\"", selector: "html", attr: { name: "lang", equals: "uk" } },
      { name: "Кодування UTF-8 у <head>", selector: "head > meta[charset]" },
      { name: "Вкладення b та i виправлено: <b>…<i>слово</i></b>", selector: "p > b > i", text: "слово", hint: "Спочатку закривається <i>, потім <b>: <b>важливе <i>слово</i></b>." },
      { name: "Абзац закрито тегом </p>", source: { matches: "</p>" } },
      { name: "У зображення є непорожній alt", selector: "img[alt]", attr: { name: "alt", matches: "\\S" } },
      { name: "id=\"top\" лише в одного елемента", selector: "[id=\"top\"]", count: 1 },
      { name: "Другий заголовок має id=\"new\"", selector: "h2#new", text: "Нове" },
    ],
  },
];
