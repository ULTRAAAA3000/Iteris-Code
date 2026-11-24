// Завдання курсу CSS, глава 02 «Селектори» (уроки 5–9). Користувач пише лише CSS до готової розмітки. Еталони: tests/solutions/css-ch02.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_02: readonly PageTask[] = [
  {
    ...base, id: "css-combinators", lesson: "css/5", xp: 20,
    title: "Комбінатори: нащадки, діти й сусіди",
    context: "Одні й ті самі теги мають виглядати по-різному залежно від місця в розмітці. Комбінатори дозволяють це зробити без жодного класу: вибрати нащадків, прямих дітей і сусіда після заголовка.",
    brief: [
      "Усім абзацам усередині <code>section</code> (на будь-якій глибині) задайте <code>font-size: 18px</code>. Лише <b>прямим</b> дітям <code>section</code> (<code>section &gt; p</code>) задайте колір <code>#1a237e</code>.",
      "Абзац, що стоїть <b>одразу після</b> заголовка <code>h2</code> (<code>h2 + p</code>), зробіть жирним: <code>font-weight: 700</code>.",
    ],
    markup: `<section>
  <h2>Новини</h2>
  <p>Перший абзац</p>
  <p>Другий абзац</p>
  <div><p>Вкладений абзац</p></div>
</section>
<p>Абзац поза секцією</p>`,
    starter: `/* TODO: section p (нащадки): розмір шрифту 18px */

/* TODO: section > p (лише діти): колір #1a237e */

/* TODO: h2 + p (перший сусід після заголовка): font-weight 700 */
`,
    checks: [
      { name: "Усі три абзаци в section мають розмір 18px", selector: "section p", style: { "font-size": "18px" }, count: 3, hint: "section p { font-size: 18px; }" },
      { name: "Абзац поза секцією не зачеплений", selector: "body > p", style: { "font-size": "18px" }, not: true },
      { name: "Прямі діти section кольору #1a237e", selector: "section > p", style: { color: "#1a237e" }, count: 2, hint: "section > p { color: #1a237e; }" },
      { name: "Вкладений абзац не отримав цей колір", selector: "section > div > p", style: { color: "#1a237e" }, not: true },
      { name: "Абзац одразу після h2 жирний", selector: "h2 + p", style: { "font-weight": "700" }, hint: "h2 + p { font-weight: 700; }" },
      { name: "Другий абзац не став жирним", selector: "section > p:nth-of-type(2)", style: { "font-weight": "700" }, not: true },
    ],
  },
  {
    ...base, id: "css-attr-selectors", lesson: "css/6", xp: 25,
    title: "Атрибутні селектори",
    context: "Посилання на сторонній сайт, на PDF та звичайні виглядають однаково, поки не дати їм різних стилів. Атрибутні селектори роблять це за значенням href, а поля форм розрізняють за type і disabled.",
    brief: [
      "Посилання, у яких <code>href</code> починається з <code>https</code>, зробіть кольору <code>#2e7d32</code>. Посилання, що закінчується на <code>.pdf</code>, зробіть жирним (<code>font-weight: 700</code>).",
      "Полю <code>type=\"email\"</code> задайте фон <code>#e8f0fe</code>, а заблокованому полю (<code>[disabled]</code>) фон <code>#eeeeee</code>. Звичайні поля й внутрішні посилання не чіпайте.",
    ],
    markup: `<a href="https://example.com">Зовнішнє</a>
<a href="/about">Внутрішнє</a>
<a href="guide.pdf">Посібник</a>
<input type="email" value="a@b.ua">
<input type="text" value="Ім'я">
<input type="text" value="Заблоковано" disabled>`,
    starter: `/* TODO: a[href^="https"]: колір #2e7d32 */

/* TODO: a[href$=".pdf"]: жирний */

/* TODO: input[type="email"]: фон #e8f0fe */

/* TODO: input[disabled]: фон #eeeeee */
`,
    checks: [
      { name: "Зовнішнє посилання кольору #2e7d32", selector: "a[href^=\"https\"]", style: { color: "#2e7d32" }, hint: "a[href^=\"https\"] { color: #2e7d32; }" },
      { name: "Внутрішні посилання не зелені", selector: "a[href=\"/about\"], a[href$=\".pdf\"]", style: { color: "#2e7d32" }, not: true },
      { name: "Посилання на PDF жирне", selector: "a[href$=\".pdf\"]", style: { "font-weight": "700" }, hint: "a[href$=\".pdf\"] { font-weight: 700; }" },
      { name: "Внутрішнє посилання не жирне", selector: "a[href=\"/about\"]", style: { "font-weight": "700" }, not: true },
      { name: "Поле email має фон #e8f0fe", selector: "input[type=\"email\"]", style: { "background-color": "#e8f0fe" } },
      { name: "Заблоковане поле має фон #eeeeee", selector: "input[disabled]", style: { "background-color": "#eeeeee" } },
      { name: "Звичайне текстове поле не отримало блакитного фону", selector: "input[type=\"text\"]:not([disabled])", style: { "background-color": "#e8f0fe" }, not: true },
    ],
  },
  {
    ...base, id: "css-pseudo", lesson: "css/7", xp: 30,
    title: "Псевдокласи: стани й позиція",
    context: "Живий інтерфейс реагує на дії людини: кнопка змінюється при наведенні, поле блокується, а останній пункт списку обходиться без зайвої межі. Усе це робиться псевдокласами без жодного скрипта.",
    brief: [
      "У списку <code>.list</code> кожному <code>li</code> задайте нижню межу <code>border-bottom: 1px solid #cccccc</code>, а останньому (<code>:last-child</code>) прибрайте межу: <code>border-bottom: none</code>. Першому пункту (<code>:first-child</code>) додайте <code>font-weight: 700</code>.",
      "Кнопці <code>.btn:hover</code> задайте <code>background-color: #283593</code>, а <code>.btn:focus-visible</code> обводку <code>outline: 2px solid #ff9800</code>. Заблокованим полям <code>input:disabled</code> задайте фон <code>#eeeeee</code>.",
    ],
    markup: `<ul class="list">
  <li>Перший</li>
  <li>Другий</li>
  <li>Третій</li>
</ul>
<a href="#" class="btn">Кнопка</a>
<input type="text" value="Звичайне">
<input type="text" value="Заблоковане" disabled>`,
    starter: `/* TODO: .list li: нижня межа 1px solid #cccccc; останній li без межі */

/* TODO: .list li:first-child: жирний */

/* TODO: .btn:hover: фон #283593; .btn:focus-visible: outline 2px solid #ff9800 */

/* TODO: input:disabled: фон #eeeeee */
`,
    checks: [
      { name: "Перший пункт списку жирний", selector: ".list li:first-child", style: { "font-weight": "700" }, hint: ".list li:first-child { font-weight: 700; }" },
      { name: "Другий і третій пункти не жирні", selector: ".list li:not(:first-child)", style: { "font-weight": "700" }, not: true },
      { name: "Пункти, крім останнього, мають нижню межу 1px", selector: ".list li:not(:last-child)", style: { "border-bottom-width": "1px" }, count: 2 },
      { name: "Є правило :last-child, що прибирає нижню межу", source: { matches: ":last-child[^{}]*\\{[^}]*border-bottom[^}]*(?:none|\\b0)" }, hint: ".list li:last-child { border-bottom: none; }" },
      { name: "Заблоковане поле має фон #eeeeee", selector: "input:disabled", style: { "background-color": "#eeeeee" } },
      { name: "Є .btn:hover із фоном #283593", source: { matches: "\\.btn:hover[^{}]*\\{[^}]*background-color\\s*:\\s*#283593" } },
      { name: "Є :focus-visible з обводкою (outline)", source: { matches: ":focus-visible[^{}]*\\{[^}]*outline\\s*:[^;}]*#ff9800" } },
    ],
  },
  {
    ...base, id: "css-pseudo-elements", lesson: "css/8", xp: 30,
    title: "Псевдоелементи ::before, ::after, ::first-letter",
    context: "Стрілки, зірочки й буквиці не потрібні в HTML: це оформлення. Псевдоелементи додають їх зі стилів. Вправа вчить записувати їх з двома двокрапками й не забувати про content.",
    brief: [
      "Кнопці <code>.btn</code> додайте стрілку: <code>.btn::after</code> із <code>content: \"→\"</code>. Підпису <code>.required</code> додайте зірочку <code>.required::before</code> з <code>content: \"*\"</code> і кольором <code>#d32f2f</code>.",
      "Першу літеру абзацу <code>.lead::first-letter</code> зробіть розміром <code>32px</code>, а підказку в полі <code>input::placeholder</code> кольору <code>#999999</code>.",
    ],
    markup: `<a class="btn" href="#">Далі</a>
<label class="required">Електронна пошта</label>
<input type="email" placeholder="you@example.com">
<p class="lead">Перший абзац статті.</p>`,
    starter: `/* TODO: .btn::after з content "→" */

/* TODO: .required::before з content "*" і кольором #d32f2f */

/* TODO: .lead::first-letter з розміром шрифту 32px */

/* TODO: input::placeholder кольору #999999 */
`,
    checks: [
      { name: "Стрілка: .btn::after із content \"→\"", source: { matches: "\\.btn::after[^{}]*\\{[^}]*content\\s*:\\s*[\"']→[\"']" }, hint: ".btn::after { content: \"→\"; }" },
      { name: "Зірочка: .required::before із content \"*\"", source: { matches: "\\.required::before[^{}]*\\{[^}]*content\\s*:\\s*[\"']\\*[\"']" } },
      { name: "Зірочка має колір #d32f2f", source: { matches: "\\.required::before[^{}]*\\{[^}]*color\\s*:\\s*#d32f2f" } },
      { name: "Перша літера: .lead::first-letter розміром 32px", source: { matches: "\\.lead::first-letter[^{}]*\\{[^}]*font-size\\s*:\\s*32px" } },
      { name: "Підказка в полі кольору #999999", source: { matches: "::placeholder[^{}]*\\{[^}]*color\\s*:\\s*#999999" } },
    ],
  },
  {
    ...base, id: "css-advanced-selectors", lesson: "css/9", xp: 40,
    title: "Розумні селектори: nth-child, is, not, has",
    context: "Зебра для рядків, спільний колір для заголовків і виняток «усім крім виконаних» можна записати без жодного допоміжного класу. Це покаже силу функціональних псевдокласів. Підтримка :has() не в усіх браузерах.",
    brief: [
      "У списку <code>.rows</code> непарним пунктам (<code>:nth-child(odd)</code>) задайте фон <code>#f0f4ff</code>. Заголовкам <code>h1</code> і <code>h2</code> одним правилом (наприклад, <code>:is(h1, h2)</code>) задайте колір <code>#1a237e</code>, а <code>h3</code> не чіпайте.",
      "У списку <code>.todo</code> усім пунктам, крім <code>.done</code> (<code>:not(.done)</code>), задайте <code>font-weight: 700</code>. Картці, у якій є зображення (<code>.card:has(img)</code>), задайте фон <code>#fff8e1</code>.",
    ],
    markup: `<ul class="rows"><li>Один</li><li>Два</li><li>Три</li><li>Чотири</li><li>П'ять</li><li>Шість</li></ul>
<h1>Заголовок 1</h1>
<h2>Заголовок 2</h2>
<h3>Заголовок 3</h3>
<ul class="todo"><li class="done">Зроблено</li><li>Ще ні</li><li>Теж ні</li></ul>
<div class="card"><img alt="Фото" width="20" height="20" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"></div>
<div class="card"><p>Картка без зображення</p></div>`,
    starter: `/* TODO: .rows li:nth-child(odd): фон #f0f4ff */

/* TODO: :is(h1, h2): колір #1a237e */

/* TODO: .todo li:not(.done): жирний */

/* TODO: .card:has(img): фон #fff8e1 */
`,
    checks: [
      { name: "Непарні пункти мають фон #f0f4ff", selector: ".rows li:nth-child(odd)", style: { "background-color": "#f0f4ff" }, count: 3, hint: ".rows li:nth-child(odd) { background-color: #f0f4ff; }" },
      { name: "Парні пункти без цього фону", selector: ".rows li:nth-child(even)", style: { "background-color": "#f0f4ff" }, not: true },
      { name: "h1 і h2 мають колір #1a237e", selector: "h1, h2", style: { color: "#1a237e" }, count: 2, hint: ":is(h1, h2) { color: #1a237e; }" },
      { name: "Заголовок h3 не зачеплений", selector: "h3", style: { color: "#1a237e" }, not: true },
      { name: "Невиконані пункти жирні", selector: ".todo li:not(.done)", style: { "font-weight": "700" }, count: 2 },
      { name: "Виконаний пункт не жирний", selector: ".todo li.done", style: { "font-weight": "700" }, not: true },
      { name: "Картка із зображенням має фон #fff8e1 (:has)", source: { matches: ":has\\(\\s*img\\s*\\)[^{}]*\\{[^}]*background-color\\s*:\\s*#fff8e1" }, hint: ".card:has(img) { background-color: #fff8e1; }" },
    ],
  },
];
