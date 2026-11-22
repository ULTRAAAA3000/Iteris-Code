// Публічне демо-завдання на лендингу («Спробуй одразу, без входу»), пункт А3 з Documentation/mvp.md.
// Це окрема вправа, а не завдання курсу: її немає в content/ і ніде не нараховується XP, тому закритий зміст уроків (D17) не страждає.
// Модуль чистий (без DOM і мережі): розмітку використовує і браузер, і збірка для пошуковиків; поведінка в demo-mount.ts.
import { l, tr } from "./i18n.ts";
import type { JsTask, PageTask, RemoteTask } from "./tasks/types.ts";

export type DemoLang = "js" | "html" | "css" | "python";
export const DEMO_LANGS: readonly DemoLang[] = ["js", "html", "css", "python"];
export const DEMO_LABEL: Record<DemoLang, string> = { js: "JavaScript", html: "HTML", css: "CSS", python: "Python" };

const base = { lesson: "demo", course: "demo", premium: false, xp: 0 } as const;

export const DEMO_JS: JsTask = {
  ...base, id: "demo-js", title: "Подвоїти число",
  context: "Функція, що приймає значення й повертає результат, це основа будь-якої програми.",
  brief: ["Напишіть функцію <code>double(n)</code>, що повертає число <code>n</code>, помножене на 2.", "Наприклад, <code>double(4)</code> має дати <code>8</code>."],
  starter: "function double(n) {\n  // поверніть n, помножене на 2\n}\n",
  tests: `describe("double", () => {
  it("подвоює додатне число", () => { expect(double(4)).toBe(8); });
  it("нуль лишається нулем", () => { expect(double(0)).toBe(0); });
  it("працює з від'ємними числами", () => { expect(double(-3)).toBe(-6); });
});`,
};

export const DEMO_HTML: PageTask = {
  ...base, id: "demo-html", title: "Заголовок і кнопка",
  context: "Будь-яка сторінка в інтернеті складається з тегів: заголовків, текстів, кнопок.",
  brief: ["Додайте на сторінку заголовок <code>&lt;h1&gt;</code> з текстом «Привіт» і кнопку <code>&lt;button&gt;</code>.", "Результат одразу з'явиться в попередньому перегляді."],
  runtime: "page", edit: "html", file: "index.html", editorLang: "html",
  starter: '<!doctype html>\n<html lang="uk">\n<head>\n  <meta charset="utf-8">\n  <title>Демо</title>\n</head>\n<body>\n  <!-- додайте заголовок h1 з текстом Привіт і кнопку button -->\n</body>\n</html>\n',
  checks: [
    { name: "На сторінці є заголовок <h1>", selector: "h1", hint: "Додайте <h1>Привіт</h1> між тегами <body> і </body>" },
    { name: "Заголовок містить слово «Привіт»", selector: "h1", text: "Привіт", hint: "Текст заголовка має бути «Привіт»" },
    { name: "На сторінці є кнопка <button>", selector: "button", hint: "Додайте <button>Натисни</button>" },
  ],
};

export const DEMO_CSS: PageTask = {
  ...base, id: "demo-css", title: "Колір і вирівнювання",
  context: "CSS перетворює голу сторінку на гарну: кольори, відступи, розташування.",
  brief: ["Розмітка вже готова: заголовок і кнопка. Напишіть стилі: заголовку <code>h1</code> колір <code>#2563eb</code> і вирівнювання по центру, кнопці <code>button</code> зелений фон <code>#16a34a</code>.", "Пишіть повні властивості: <code>color</code>, <code>text-align</code>, <code>background-color</code>."],
  runtime: "page", edit: "css", file: "style.css", editorLang: "css",
  markup: "<h1>Привіт</h1>\n<button>Натисни</button>",
  starter: "h1 {\n  /* колір і вирівнювання */\n}\n\nbutton {\n  /* фон кнопки */\n}\n",
  checks: [
    { name: "Заголовок синього кольору #2563eb", selector: "h1", style: { color: "#2563eb" }, hint: "У правилі h1 додайте: color: #2563eb;" },
    { name: "Заголовок по центру", selector: "h1", style: { "text-align": "center" }, hint: "У правилі h1 додайте: text-align: center;" },
    { name: "Кнопка із зеленим фоном #16a34a", selector: "button", style: { "background-color": "#16a34a" }, hint: "У правилі button додайте: background-color: #16a34a;" },
  ],
};

/** Python виконується на сервері (/api/demo-run, зовнішня пісочниця); для гостя лише це одне завдання */
export const DEMO_PY: RemoteTask = {
  ...base, id: "demo-py", title: "Привіт і множення",
  context: "Python часто використовують як калькулятор і швидкий скрипт: написав рядок, запустив, побачив результат.",
  brief: ["Виведіть два рядки: слово <code>Привіт</code> і результат виразу <code>3 * 4</code> (саме число).", "Для виводу є функція <code>print()</code>."],
  runtime: "remote", lang: "python", file: "main.py", editorLang: "python",
  starter: "# Виведіть: Привіт і результат 3 * 4\nprint()\n",
  checks: [
    { on: "stdout", name: "Виводить слово «Привіт»", has: "Привіт", hint: 'Додайте print("Привіт")' },
    { on: "stdout", name: "Виводить число 12", has: "12", hint: "Додайте print(3 * 4)" },
    { on: "stdout", name: "Два рядки: Привіт і 12", equals: "Привіт\n12", hint: "Спершу слово, потім число, кожне окремим print" },
  ],
};

/** Короткі підказки до кожного завдання: від м'якої до майже готової відповіді (показуються по одній) */
export const DEMO_HINTS: Record<DemoLang, readonly string[]> = {
  js: ["Функція має повернути значення, а не просто порахувати його: потрібне слово <code>return</code>.", "Помножити на 2 можна так: <code>n * 2</code>.", "Усе рішення: <code>return n * 2;</code> усередині функції."],
  html: ["Заголовок першого рівня це тег <code>h1</code>, у нього є початок і кінець.", "Кнопка це тег <code>button</code>. Обидва теги пишуться між <code>&lt;body&gt;</code> і <code>&lt;/body&gt;</code>.", "Приклад: <code>&lt;h1&gt;Привіт&lt;/h1&gt;</code> і <code>&lt;button&gt;Натисни&lt;/button&gt;</code>."],
  python: ["Щоб щось показати, потрібна функція <code>print()</code>: значення пишуть у дужках.", "Текст пишуть у лапках: <code>print(\"Привіт\")</code>, а вираз без лапок: <code>print(3 * 4)</code>.", "Усе рішення: два рядки, <code>print(\"Привіт\")</code> і <code>print(3 * 4)</code>."],
  css: ["Стиль пишеться всередині фігурних дужок правила: <code>властивість: значення;</code> з крапкою з комою.", "Колір тексту це <code>color</code>, вирівнювання тексту це <code>text-align</code>, фон це <code>background-color</code>.", "Приклад: <code>h1 { color: #2563eb; text-align: center; }</code> і <code>button { background-color: #16a34a; }</code>."],
};

/* ---------- English versions: the same tasks, same checks, different language ---------- */

export const DEMO_JS_EN: JsTask = {
  ...base, id: "demo-js", title: "Double a number",
  context: "A function that takes a value and returns a result is the foundation of any program.",
  brief: ["Write a function <code>double(n)</code> that returns the number <code>n</code> multiplied by 2.", "For example, <code>double(4)</code> should give <code>8</code>."],
  starter: "function double(n) {\n  // return n multiplied by 2\n}\n",
  tests: `describe("double", () => {
  it("doubles a positive number", () => { expect(double(4)).toBe(8); });
  it("zero stays zero", () => { expect(double(0)).toBe(0); });
  it("works with negative numbers", () => { expect(double(-3)).toBe(-6); });
});`,
};

export const DEMO_HTML_EN: PageTask = {
  ...base, id: "demo-html", title: "A heading and a button",
  context: "Every page on the internet is made of tags: headings, text, buttons.",
  brief: ["Add an <code>&lt;h1&gt;</code> heading with the text “Hello” and a <code>&lt;button&gt;</code> to the page.", "The result appears in the preview straight away."],
  runtime: "page", edit: "html", file: "index.html", editorLang: "html",
  starter: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>Demo</title>\n</head>\n<body>\n  <!-- add an h1 heading with the text Hello and a button -->\n</body>\n</html>\n',
  checks: [
    { name: "The page has an <h1> heading", selector: "h1", hint: "Add <h1>Hello</h1> between the <body> and </body> tags" },
    { name: "The heading contains the word “Hello”", selector: "h1", text: "Hello", hint: "The heading text must be “Hello”" },
    { name: "The page has a <button>", selector: "button", hint: "Add <button>Click me</button>" },
  ],
};

export const DEMO_CSS_EN: PageTask = {
  ...base, id: "demo-css", title: "Colour and alignment",
  context: "CSS turns a bare page into a nice one: colours, spacing, layout.",
  brief: ["The markup is ready: a heading and a button. Write the styles: give the <code>h1</code> heading the colour <code>#2563eb</code> and centre alignment, and give the <code>button</code> a green background <code>#16a34a</code>.", "Write the full properties: <code>color</code>, <code>text-align</code>, <code>background-color</code>."],
  runtime: "page", edit: "css", file: "style.css", editorLang: "css",
  markup: "<h1>Hello</h1>\n<button>Click me</button>",
  starter: "h1 {\n  /* colour and alignment */\n}\n\nbutton {\n  /* button background */\n}\n",
  checks: [
    { name: "The heading is blue #2563eb", selector: "h1", style: { color: "#2563eb" }, hint: "In the h1 rule add: color: #2563eb;" },
    { name: "The heading is centred", selector: "h1", style: { "text-align": "center" }, hint: "In the h1 rule add: text-align: center;" },
    { name: "The button has a green background #16a34a", selector: "button", style: { "background-color": "#16a34a" }, hint: "In the button rule add: background-color: #16a34a;" },
  ],
};

export const DEMO_PY_EN: RemoteTask = {
  ...base, id: "demo-py", title: "Hello and multiplication",
  context: "Python is often used as a calculator and a quick script: write a line, run it, see the result.",
  brief: ["Print two lines: the word <code>Hello</code> and the result of the expression <code>3 * 4</code> (just the number).", "Use the <code>print()</code> function for output."],
  runtime: "remote", lang: "python", file: "main.py", editorLang: "python",
  starter: "# Print: Hello and the result of 3 * 4\nprint()\n",
  checks: [
    { on: "stdout", name: "Prints the word “Hello”", has: "Hello", hint: 'Add print("Hello")' },
    { on: "stdout", name: "Prints the number 12", has: "12", hint: "Add print(3 * 4)" },
    { on: "stdout", name: "Two lines: Hello and 12", equals: "Hello\n12", hint: "First the word, then the number, each with its own print" },
  ],
};

export const DEMO_HINTS_EN: Record<DemoLang, readonly string[]> = {
  js: ["The function must return the value, not just compute it: you need the word <code>return</code>.", "You can multiply by 2 like this: <code>n * 2</code>.", "The whole solution: <code>return n * 2;</code> inside the function."],
  html: ["A first-level heading is the <code>h1</code> tag; it has an opening and a closing part.", "A button is the <code>button</code> tag. Write both tags between <code>&lt;body&gt;</code> and <code>&lt;/body&gt;</code>.", "Example: <code>&lt;h1&gt;Hello&lt;/h1&gt;</code> and <code>&lt;button&gt;Click me&lt;/button&gt;</code>."],
  python: ["To show something you need the <code>print()</code> function: write the value in the brackets.", "Text goes in quotes: <code>print(\"Hello\")</code>, and an expression goes without quotes: <code>print(3 * 4)</code>.", "The whole solution: two lines, <code>print(\"Hello\")</code> and <code>print(3 * 4)</code>."],
  css: ["A style is written inside the curly braces of a rule: <code>property: value;</code> with a semicolon.", "Text colour is <code>color</code>, text alignment is <code>text-align</code>, background is <code>background-color</code>.", "Example: <code>h1 { color: #2563eb; text-align: center; }</code> and <code>button { background-color: #16a34a; }</code>."],
};

/** Завдання й підказки демо для поточної мови сторінки */
export const demoTask = (lg: DemoLang): JsTask | PageTask | RemoteTask =>
  lg === "js" ? tr(DEMO_JS, DEMO_JS_EN) : lg === "html" ? tr(DEMO_HTML, DEMO_HTML_EN) : lg === "css" ? tr(DEMO_CSS, DEMO_CSS_EN) : tr(DEMO_PY, DEMO_PY_EN);
export const demoHints = (lg: DemoLang): readonly string[] => tr(DEMO_HINTS, DEMO_HINTS_EN)[lg];

/** Розмітка секції на лендингу; текст завдання для JavaScript вже всередині, щоб його бачили й пошуковики, і браузер без скриптів */
export function demoHtml(): string {
  const t = demoTask("js") as JsTask;
  return `<section id="try" class="demo" aria-labelledby="try-h">
    <h2 class="section-title" id="try-h">${tr("Спробуй одразу, без входу", "Try it right away, no sign-in")}</h2>
    <p class="section-sub">${tr("Обери мову, виконай маленьке завдання й одразу побачиш автоматичну перевірку. Це окрема демо-вправа: основні уроки й завдання відкриваються після реєстрації.", "Choose a language, complete a small task and see the automatic check right away. This is a separate demo exercise: the main lessons and tasks open after you register.")}</p>
    <div class="card dm-card">
      <div class="dm-tabs" role="tablist" aria-label="${tr("Мова завдання", "Task language")}">
        ${DEMO_LANGS.map((lg, i) => `<button type="button" role="tab" id="dm-tab-${lg}" class="dm-tab" data-dm="${lg}" aria-selected="${i === 0}" aria-controls="dm-panel" tabindex="${i === 0 ? 0 : -1}">${DEMO_LABEL[lg]}</button>`).join("")}
      </div>
      <div class="dm-panel" id="dm-panel" role="tabpanel" aria-labelledby="dm-tab-js">
        <h3 class="dm-title" id="dm-title">${t.title}</h3>
        <div class="dm-brief" id="dm-brief">${t.brief.map((p) => `<p>${p}</p>`).join("")}</div>
        <label class="dm-label" for="dm-code">${tr("Ваш код", "Your code")}</label>
        <textarea id="dm-code" class="dm-editor" rows="7" spellcheck="false" autocomplete="off" autocapitalize="off" aria-describedby="dm-hint">${t.starter.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</textarea>
        <p class="dm-hint" id="dm-hint">${tr("Ctrl+Enter, щоб перевірити", "Ctrl+Enter to check")}</p>
        <p class="dm-hint" id="dm-note" hidden>${tr("Python виконується на зовнішньому сервері, тому перевірка триває трохи довше. Не вставляйте в код паролі й особисті дані.", "Python runs on an external server, so checking takes a little longer. Do not paste passwords or personal data into the code.")}</p>
        <div class="dm-tipbox"><button type="button" class="btn small" id="dm-tip">${tr("Підказка", "Hint")}</button><div class="dm-tips" id="dm-tips" aria-live="polite"></div></div>
        <div class="dm-actions"><button type="button" class="btn primary" id="dm-run">${tr("Перевірити", "Check")}</button><button type="button" class="btn" id="dm-reset">${tr("Почати спочатку", "Start over")}</button></div>
        <div class="dm-preview" id="dm-preview-wrap" hidden><div class="dm-preview-label">${tr("Попередній перегляд", "Preview")}</div><iframe id="dm-preview" class="dm-preview-frame" sandbox="allow-same-origin" title="${tr("Попередній перегляд сторінки", "Page preview")}"></iframe></div>
        <ul class="dm-results" id="dm-results" aria-live="polite"></ul>
        <div class="dm-win" id="dm-win" hidden>
          <div class="dm-confetti" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
          <svg class="dm-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l8 8 15-17"/></svg>
          <h3 tabindex="-1" id="dm-win-h">${tr("Готово, усе працює!", "Done, everything works!")}</h3>
          <p>${tr("Саме так виглядає навчання на платформі: коротке завдання й миттєва перевірка. Уроків і завдань у курсах значно більше.", "This is how learning on the platform looks: a short task and an instant check. There are many more lessons and tasks in the courses.")}</p>
          <div class="dm-win-actions"><a class="btn primary" href="/register">${tr("Створити акаунт безкоштовно", "Create a free account")}</a><a class="btn" href="${l("/courses")}">${tr("Дивитись курси", "Browse courses")}</a></div>
        </div>
      </div>
    </div>
  </section>`;
}
