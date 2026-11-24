// Завдання курсу CSS, глава 01 «Початок» (уроки 1–4). Користувач пише лише CSS до готової розмітки. Еталони: tests/solutions/css-ch01.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_01: readonly PageTask[] = [
  {
    ...base, id: "css-first-styles", lesson: "css/1", xp: 15,
    title: "Перші стилі для сторінки",
    context: "Розмітка вже готова, але виглядає «голою». Один файл стилів перетворює її на охайну сторінку: фон, колір заголовка й шрифт підключаються без жодних змін у HTML.",
    brief: [
      "Для <code>body</code> задайте фон <code>#f5f7fb</code> і шрифт <code>font-family: Arial, sans-serif</code>.",
      "Заголовку <code>h1</code> дайте колір <code>#1a237e</code>, а абзацу <code>p</code> колір <code>#444444</code>.",
    ],
    markup: `<h1>Мій перший сайт</h1>
<p>Цей текст стилізує окремий файл CSS.</p>`,
    starter: `/* TODO: body: фон #f5f7fb і шрифт Arial з запасним sans-serif */

/* TODO: h1: колір #1a237e */

/* TODO: p: колір #444444 */
`,
    checks: [
      { name: "Фон сторінки #f5f7fb", selector: "body", style: { "background-color": "#f5f7fb" }, hint: "body { background-color: #f5f7fb; }" },
      { name: "Шрифт body: Arial із запасним sans-serif", selector: "body", source: { matches: "font-family\\s*:\\s*[^;}]*Arial[^;}]*sans-serif" } },
      { name: "Заголовок h1 кольору #1a237e", selector: "h1", style: { color: "#1a237e" } },
      { name: "Абзац p кольору #444444", selector: "p", style: { color: "#444444" } },
    ],
  },
  {
    ...base, id: "css-rules-syntax", lesson: "css/2", xp: 15,
    title: "Правило: селектор, властивість, значення",
    context: "Вміння записати правило без синтаксичних помилок це основа всього CSS. Одна забута крапка з комою мовчки зламає стилі, тому тренуємося писати точно.",
    brief: [
      "Напишіть правило для <code>h2</code>: колір <code>#c62828</code> і розмір шрифту <code>28px</code>.",
      "Одним правилом із селекторами через кому (<code>p, li</code>) задайте обом розмір шрифту <code>18px</code> і міжрядковий інтервал <code>line-height: 1.5</code>.",
      "Додайте будь-який коментар у стилі <code>/* … */</code>.",
    ],
    markup: `<h2>Новини дня</h2>
<p>Перший абзац новини.</p>
<ul><li>Пункт списку</li><li>Ще один пункт</li></ul>`,
    starter: `/* TODO: h2: колір #c62828 і розмір шрифту 28px */

/* TODO: p, li: font-size 18px і line-height 1.5 в одному правилі */
`,
    checks: [
      { name: "Заголовок h2 кольору #c62828", selector: "h2", style: { color: "#c62828" } },
      { name: "Заголовок h2 розміром 28px", selector: "h2", style: { "font-size": "28px" } },
      { name: "Абзац і пункт списку мають розмір 18px", selector: "p, li", style: { "font-size": "18px" }, count: 3 },
      { name: "Міжрядковий інтервал 1.5 (27px) в абзаці", selector: "p", style: { "line-height": "27px" } },
      { name: "Правило з кількома селекторами через кому", source: { matches: "(?:\\bp\\s*,\\s*li|\\bli\\s*,\\s*p)\\s*\\{" } },
      { name: "Є коментар /* … */", source: { matches: "/\\*[\\s\\S]*?\\*/" } },
    ],
  },
  {
    ...base, id: "css-selectors", lesson: "css/3", xp: 20,
    title: "Теги, класи й id",
    context: "Тег стилізує всі елементи одного виду, клас вибирає групу, а id єдиний елемент. Вправа вчить обирати правильний «адрес» для кожного стилю й не зачепити зайвого.",
    brief: [
      "Усім абзацам (селектор за тегом <code>p</code>) задайте колір <code>#333333</code>. Елементам із класом <code>.note</code> зробіть <code>font-style: italic</code>.",
      "Елементам із класом <code>.big</code> задайте <code>font-size: 24px</code>. Заголовку з id <code>#logo</code> задайте <code>text-transform: uppercase</code> і <code>letter-spacing: 2px</code>.",
    ],
    markup: `<h1 id="logo">Iteris</h1>
<p>Звичайний абзац</p>
<p class="note">Примітка</p>
<p class="note big">Велика примітка</p>
<p class="big">Просто великий абзац</p>`,
    starter: `/* TODO: p (за тегом): колір #333333 */

/* TODO: .note (клас): курсив */

/* TODO: .big (клас): розмір шрифту 24px */

/* TODO: #logo (id): великі літери й letter-spacing 2px */
`,
    checks: [
      { name: "Усі чотири абзаци кольору #333333", selector: "p", style: { color: "#333333" }, count: 4, hint: "p { color: #333333; }" },
      { name: "Елементи .note у курсиві", selector: ".note", style: { "font-style": "italic" }, count: 2, hint: ".note { font-style: italic; }" },
      { name: "Абзац без класу note не став курсивним", selector: "p:not(.note)", style: { "font-style": "italic" }, not: true },
      { name: "Елементи .big мають розмір 24px", selector: ".big", style: { "font-size": "24px" }, count: 2 },
      { name: "Заголовок #logo: великі літери", selector: "#logo", style: { "text-transform": "uppercase" }, hint: "#logo { text-transform: uppercase; }" },
      { name: "Заголовок #logo: letter-spacing 2px", selector: "#logo", style: { "letter-spacing": "2px" } },
    ],
  },
  {
    ...base, id: "css-devtools-fix", lesson: "css/4", xp: 25,
    title: "Знайди й виправ помилки в стилях",
    context: "У таблиці стилів картки є помилки: пропущена крапка з комою, помилка в назві властивості та неприпустиме значення. DevTools показав би їх викресленими, а ви знайдете їх уважним читанням.",
    brief: [
      "Виправте оголошення, які браузер відкидає: забута <code>;</code> після рамки, назва <code>colour</code> і значення <code>red</code> для розміру шрифту (потрібно <code>20px</code>).",
      "Додайте ціні <code>.price</code> жирність <code>font-weight: 700</code>. Після виправлень рамка картки має бути суцільною завтовшки <code>1px</code>, а внутрішній відступ <code>16px</code>.",
    ],
    markup: `<div class="card">
  <h2 class="title">Ноутбук</h2>
  <p class="price">32 999 грн</p>
</div>`,
    starter: `.card {
  background-color: #ffffff;
  border: 1px solid #cccccc
  padding: 16px;
}

.title {
  colour: #1a237e;
  font-size: 24px;
}

.price {
  color: #d32f2f;
  font-size: red;
  /* TODO: додайте font-weight: 700 */
}
`,
    checks: [
      { name: "Рамка картки суцільна", selector: ".card", style: { "border-top-style": "solid" }, hint: "Додайте крапку з комою після border" },
      { name: "Товщина рамки 1px", selector: ".card", style: { "border-top-width": "1px" } },
      { name: "Внутрішній відступ картки 16px", selector: ".card", style: { "padding-top": "16px" } },
      { name: "Заголовок кольору #1a237e", selector: ".title", style: { color: "#1a237e" }, hint: "Правильна властивість: color" },
      { name: "Розмір шрифту ціни 20px", selector: ".price", style: { "font-size": "20px" } },
      { name: "Ціна жирна", selector: ".price", style: { "font-weight": "700" } },
      { name: "Колір ціни лишився #d32f2f", selector: ".price", style: { color: "#d32f2f" } },
    ],
  },
];
