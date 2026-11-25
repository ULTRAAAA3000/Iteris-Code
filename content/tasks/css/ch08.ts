// Завдання курсу CSS, глава 08 «Grid» (уроки 29–32). Еталони: tests/solutions/css-ch08.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_08: readonly PageTask[] = [
  {
    ...base, id: "css-grid", lesson: "css/29", xp: 30,
    title: "Галерея на CSS Grid",
    context: "Grid розкладає елементи у двох вимірах: рядки й колонки одночасно. Галерея з трьох рівних колонок і проміжками це кілька рядків CSS замість складних обчислень.",
    brief: [
      "Зробіть <code>.gallery</code> сіткою: <code>display: grid</code>, три рівні колонки (<code>grid-template-columns: repeat(3, 1fr)</code> або <code>1fr 1fr 1fr</code>) і проміжок <code>12px</code> (<code>gap</code>).",
      "Першій картинці <code>.wide</code> дайте розтягнутись на дві колонки: <code>grid-column: span 2</code>.",
    ],
    markup: `<div class="gallery"><div class="wide">1</div><div>2</div><div>3</div><div>4</div></div>`,
    starter: `/* TODO: .gallery і .wide */
`,
    checks: [
      { name: ".gallery це grid", selector: ".gallery", style: { display: "grid" } },
      { name: "Проміжок 12px", selector: ".gallery", style: { "column-gap": "12px", "row-gap": "12px" } },
      { name: "Три рівні колонки", source: { matches: "grid-template-columns\\s*:\\s*(?:repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)|1fr\\s+1fr\\s+1fr)" }, hint: "repeat(3, 1fr) або 1fr 1fr 1fr" },
      { name: ".wide на дві колонки: span 2", source: { matches: "\\.wide\\s*\\{[^}]*grid-column\\s*:\\s*span\\s*2" } },
    ],
  },
  {
    ...base, id: "css-grid-fr", lesson: "css/30", xp: 35,
    title: "Адаптивна сітка без медіазапитів",
    context: "Одиниця fr ділить вільне місце, repeat скорочує повтор, а minmax з auto-fit дозволяє сітці самій обирати кількість колонок. Так збирають каталоги, що працюють на будь-якій ширині.",
    brief: [
      "Зробіть <code>.page</code> сіткою з двох колонок: бічна <code>200px</code> і основна <code>1fr</code>. Для <code>.stats</code> задайте чотири рівні колонки через <code>repeat(4, 1fr)</code>.",
      "Для <code>.cards</code> створіть адаптивну сітку: <code>repeat(auto-fit, minmax(200px, 1fr))</code> і <code>gap: 16px</code>. Усі три контейнери мають бути <code>display: grid</code>.",
    ],
    markup: `<div class="page"><aside>Бічна</aside><main>Основна</main></div>
<div class="stats"><span>1</span><span>2</span><span>3</span><span>4</span></div>
<div class="cards"><div>А</div><div>Б</div><div>В</div></div>`,
    starter: `.page { display: grid; }
/* TODO: колонки .page, .stats і .cards */
`,
    checks: [
      { name: "Три grid-контейнери", selector: ".page, .stats, .cards", style: { display: "grid" }, count: 3 },
      { name: ".page: 200px і 1fr", source: { matches: "\\.page\\s*\\{[^}]*grid-template-columns\\s*:\\s*200px\\s+1fr" } },
      { name: ".stats: repeat(4, 1fr)", source: { matches: "\\.stats\\s*\\{[^}]*grid-template-columns\\s*:\\s*repeat\\(\\s*4\\s*,\\s*1fr\\s*\\)" } },
      { name: ".cards: auto-fit і minmax(200px, 1fr)", source: { matches: "\\.cards\\s*\\{[^}]*grid-template-columns\\s*:\\s*repeat\\(\\s*auto-fit\\s*,\\s*minmax\\(\\s*200px\\s*,\\s*1fr\\s*\\)\\s*\\)" } },
      { name: ".cards: проміжок 16px", selector: ".cards", style: { "column-gap": "16px", "row-gap": "16px" } },
    ],
  },
  {
    ...base, id: "css-grid-areas", lesson: "css/31", xp: 40,
    title: "Макет сторінки на grid-template-areas",
    context: "Схему сторінки можна записати словами через grid-template-areas, а кожному блоку дати ім'я через grid-area. Окремо вирівнюємо вміст клітинки: place-items: center центрує його по обох осях.",
    brief: [
      "Зробіть <code>.page</code> сіткою з колонками <code>200px 1fr</code> і схемою: рядок <code>\"header header\"</code>, рядок <code>\"sidebar main\"</code>, рядок <code>\"footer footer\"</code>. Додайте <code>gap: 16px</code>.",
      "Призначте областям <code>header</code>, <code>aside</code>, <code>main</code> і <code>footer</code> їхні імена через <code>grid-area</code> (<code>header</code>, <code>sidebar</code>, <code>main</code>, <code>footer</code>). Блок <code>.badge</code> зробіть сіткою й відцентруйте вміст: <code>place-items: center</code>.",
    ],
    markup: `<div class="page"><header>Шапка</header><aside>Меню</aside><main>Вміст</main><footer>Футер</footer></div>
<div class="badge"><span>Новинка</span></div>`,
    starter: `.page { display: grid; }
/* TODO: колонки, схема areas, gap і grid-area; .badge: grid і центр */
.badge { height: 80px; }
`,
    checks: [
      { name: ".page це grid із проміжком 16px", selector: ".page", style: { display: "grid", "column-gap": "16px", "row-gap": "16px" } },
      { name: "Схема з трьох рядків: header, sidebar main, footer", source: { matches: "grid-template-areas\\s*:\\s*[\"']header\\s+header[\"']\\s*[\"']sidebar\\s+main[\"']\\s*[\"']footer\\s+footer[\"']" } },
      { name: "Шапка: grid-area header", source: { matches: "header\\s*\\{[^}]*grid-area\\s*:\\s*header\\s*[;}]" } },
      { name: "Меню: grid-area sidebar", source: { matches: "aside\\s*\\{[^}]*grid-area\\s*:\\s*sidebar\\s*[;}]" } },
      { name: "Вміст: grid-area main", source: { matches: "main\\s*\\{[^}]*grid-area\\s*:\\s*main\\s*[;}]" } },
      { name: "Футер: grid-area footer", source: { matches: "footer\\s*\\{[^}]*grid-area\\s*:\\s*footer\\s*[;}]" } },
      { name: ".badge: grid із центруванням по обох осях", selector: ".badge", style: { display: "grid", "align-items": "center", "justify-items": "center" } },
    ],
  },
  {
    ...base, id: "css-grid-nested", lesson: "css/32", xp: 50,
    title: "Сітка в сітці: Grid, Flexbox і subgrid",
    context: "Каркас сторінки робимо на Grid, панель інструментів на Flexbox, а картки в сітці вирівнюємо через subgrid, щоб заголовки, описи й кнопки стояли на одних рівнях. Subgrid підтримують лише новіші браузери.",
    brief: [
      "Зробіть <code>.page</code> сіткою з колонками <code>1fr 3fr</code> і проміжком <code>24px</code>. Панель <code>.toolbar</code> зробіть flex-рядом: <code>display: flex</code>, <code>justify-content: space-between</code>, <code>align-items: center</code>.",
      "Для <code>.cards</code> задайте сітку <code>repeat(3, 1fr)</code> із проміжком <code>16px</code>. Кожна <code>.card</code> має бути <code>display: grid</code>, займати три рядки (<code>grid-row: span 3</code>) і брати їх у батька: <code>grid-template-rows: subgrid</code>.",
    ],
    markup: `<div class="page"><nav>Меню</nav><div class="toolbar"><span>Каталог</span><button>Фільтр</button></div></div>
<div class="cards"><article class="card"><h3>Один</h3><p>Опис</p><a>Купити</a></article><article class="card"><h3>Два</h3><p>Довший опис товару</p><a>Купити</a></article></div>`,
    starter: `.page { display: grid; }
/* TODO: колонки .page, flex для .toolbar, сітка .cards і subgrid у .card */
`,
    checks: [
      { name: ".page: grid із проміжком 24px", selector: ".page", style: { display: "grid", "column-gap": "24px" } },
      { name: ".page: колонки 1fr 3fr", source: { matches: "\\.page\\s*\\{[^}]*grid-template-columns\\s*:\\s*1fr\\s+3fr" } },
      { name: "Панель: flex, елементи по краях і по центру", selector: ".toolbar", style: { display: "flex", "justify-content": "space-between", "align-items": "center" } },
      { name: ".cards: три колонки й проміжок 16px", selector: ".cards", style: { display: "grid", "column-gap": "16px" } },
      { name: ".cards: repeat(3, 1fr)", source: { matches: "\\.cards\\s*\\{[^}]*grid-template-columns\\s*:\\s*repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)" } },
      { name: "Картка: grid і span 3 рядки", source: { matches: "\\.card\\s*\\{(?=[^}]*display\\s*:\\s*grid)(?=[^}]*grid-row\\s*:\\s*span\\s*3)[^}]*\\}" } },
      { name: "Картка бере рядки батька: subgrid", source: { matches: "\\.card\\s*\\{[^}]*grid-template-rows\\s*:\\s*subgrid" } },
    ],
  },
];
