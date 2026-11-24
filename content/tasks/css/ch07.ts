// Завдання курсу CSS, глава 07 «Flexbox» (уроки 25–28). Еталони: tests/solutions/css-ch07.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_07: readonly PageTask[] = [
  {
    ...base, id: "css-flexbox", lesson: "css/25", xp: 25,
    title: "Flexbox: ряд, колонка й перенос",
    context: "Flexbox вмикається на батькові: display: flex вишиковує дітей у ряд. Напрям задає flex-direction, а flex-wrap дозволяє переносити елементи на наступний рядок, коли місця не вистачає.",
    brief: [
      "Шапку <code>.header</code> зробіть flex-контейнером (<code>display: flex</code>), а бічну панель <code>.sidebar</code> колонкою: <code>display: flex</code> і <code>flex-direction: column</code>.",
      "Меню <code>.menu</code> зробіть flex-рядом у зворотному порядку (<code>flex-direction: row-reverse</code>). Для тегів <code>.tags</code> увімкніть flex із переносом: <code>flex-wrap: wrap</code>.",
    ],
    markup: `<div class="header"><span>Логотип</span><nav>Меню</nav></div>
<div class="sidebar"><a>Один</a><a>Два</a></div>
<div class="menu"><span>Перший</span><span>Другий</span></div>
<div class="tags"><span>html</span><span>css</span><span>flex</span></div>`,
    starter: `/* TODO: .header, .sidebar, .menu і .tags */
.tags { color: #37474f; }
`,
    checks: [
      { name: "Шапка: display flex", selector: ".header", style: { display: "flex" } },
      { name: "Бічна панель: flex-колонка", selector: ".sidebar", style: { display: "flex", "flex-direction": "column" } },
      { name: "Меню: ряд у зворотному порядку", selector: ".menu", style: { display: "flex", "flex-direction": "row-reverse" } },
      { name: "Теги: перенос на новий рядок", selector: ".tags", style: { display: "flex", "flex-wrap": "wrap" } },
    ],
  },
  {
    ...base, id: "css-flex-align", lesson: "css/26", xp: 30,
    title: "Вирівнювання й gap",
    context: "Шапка з логотипом ліворуч і меню праворуч, блок із вмістом по центру, ряд кнопок з рівними проміжками: це justify-content, align-items і gap. Проміжки через gap не додають зайвого відступу по краях.",
    brief: [
      "Шапці <code>.header</code> задайте <code>display: flex</code>, <code>justify-content: space-between</code>, <code>align-items: center</code> і <code>gap: 16px</code>.",
      "Блок <code>.hero</code> центруйте по обох осях: <code>display: flex</code>, <code>justify-content: center</code>, <code>align-items: center</code>. Останню кнопку <code>.btn.last</code> притисніть донизу через <code>align-self: flex-end</code>, а у <code>.buttons</code> задайте <code>display: flex</code> і <code>gap: 8px</code>.",
    ],
    markup: `<div class="header"><span>Логотип</span><nav>Меню</nav></div>
<div class="hero">Привіт</div>
<div class="buttons"><a class="btn">Один</a><a class="btn">Два</a><a class="btn last">Три</a></div>`,
    starter: `/* TODO: .header, .hero, .buttons і .btn.last */
.hero { height: 120px; }
`,
    checks: [
      { name: "Шапка: flex з елементами по краях", selector: ".header", style: { display: "flex", "justify-content": "space-between" } },
      { name: "Шапка: центр по вертикалі", selector: ".header", style: { "align-items": "center" } },
      { name: "Шапка: проміжок 16px", selector: ".header", style: { "column-gap": "16px" } },
      { name: "Hero: центр по обох осях", selector: ".hero", style: { display: "flex", "justify-content": "center", "align-items": "center" } },
      { name: "Ряд кнопок: gap 8px", selector: ".buttons", style: { display: "flex", "column-gap": "8px" } },
      { name: "Остання кнопка притиснута донизу", selector: ".btn.last", style: { "align-self": "flex-end" } },
    ],
  },
  {
    ...base, id: "css-flex-sizing", lesson: "css/27", xp: 35,
    title: "Бічна панель і гнучкий вміст",
    context: "У flex-ряді фіксована панель не повинна стискатися, а основний вміст має забирати весь залишок. Для цього є flex-basis, flex-shrink і flex-grow, а для рівних колонок скорочення flex: 1.",
    brief: [
      "Рядові <code>.layout</code> задайте <code>display: flex</code>. Панелі <code>.sidebar</code> дайте <code>flex-basis: 240px</code> і <code>flex-shrink: 0</code>, а вмісту <code>.content</code> <code>flex-grow: 1</code>.",
      "У ряді <code>.cols</code> (теж flex) кожна колонка <code>.col</code> має отримати <code>flex: 1</code>: достатньо одного правила для <code>.col</code>.",
    ],
    markup: `<div class="layout"><div class="sidebar">Панель</div><div class="content">Вміст</div></div>
<div class="cols"><div class="col">А</div><div class="col">Б</div><div class="col">В</div></div>`,
    starter: `/* TODO: .layout, .sidebar, .content */

.cols { display: flex; }
/* TODO: .col: flex 1 */
`,
    checks: [
      { name: "Ряд: display flex", selector: ".layout", style: { display: "flex" } },
      { name: "Панель: flex-basis 240px", selector: ".sidebar", style: { "flex-basis": "240px" } },
      { name: "Панель не стискається", selector: ".sidebar", style: { "flex-shrink": "0" } },
      { name: "Вміст росте", selector: ".content", style: { "flex-grow": "1" } },
      { name: "Колонки ростуть однаково", selector: ".col", style: { "flex-grow": "1" }, count: 3 },
      { name: "Колонки записані скороченням flex: 1", source: { matches: "\\.col\\s*\\{[^}]*flex\\s*:\\s*1(?:\\s+1)?(?:\\s+0(?:%|px)?)?\\s*[;}]" }, hint: "Використайте flex: 1" },
    ],
  },
  {
    ...base, id: "css-flex-layouts", lesson: "css/28", xp: 40,
    title: "Рецепти: футер унизу, меню й картки",
    context: "Чотири розкладки повторюються в кожному проєкті: футер унизу екрана, пункт меню біля правого краю, картки з переносом і центрований блок. Усі вони збираються з уже відомих властивостей Flexbox.",
    brief: [
      "Зробіть <code>body</code> flex-колонкою (<code>display: flex</code>, <code>flex-direction: column</code>) з <code>min-height: 100vh</code>, а <code>main</code> дайте <code>flex: 1</code> (достатньо <code>flex-grow: 1</code>). Кнопку <code>.logout</code> відсуньте праворуч через <code>margin-left: auto</code>.",
      "Контейнеру <code>.cards</code> задайте <code>display: flex</code>, <code>flex-wrap: wrap</code>, <code>gap: 16px</code>, а кожній <code>.card</code> <code>flex: 1 1 200px</code> (достатньо <code>flex-basis: 200px</code> і <code>flex-grow: 1</code>).",
    ],
    markup: `<nav class="nav"><a>Головна</a><a>Каталог</a><a class="logout">Вийти</a></nav>
<main><div class="cards"><div class="card">Один</div><div class="card">Два</div><div class="card">Три</div></div></main>
<footer>Футер</footer>`,
    starter: `.nav { display: flex; gap: 12px; }
/* TODO: body, main, .logout, .cards, .card */
`,
    checks: [
      { name: "body: flex-колонка", selector: "body", style: { display: "flex", "flex-direction": "column" } },
      { name: "body: min-height 100vh", source: { matches: "body\\s*\\{[^}]*min-height\\s*:\\s*100(?:vh|dvh|svh)" }, hint: "min-height: 100vh" },
      { name: "main займає вільне місце", selector: "main", style: { "flex-grow": "1" } },
      { name: "Кнопка виходу праворуч через margin-left: auto", source: { matches: "\\.logout\\s*\\{[^}]*margin-left\\s*:\\s*auto" }, hint: "margin-left: auto" },
      { name: "Картки: flex із переносом і проміжком 16px", selector: ".cards", style: { display: "flex", "flex-wrap": "wrap", "column-gap": "16px" } },
      { name: "Картка: basis 200px і ріст", selector: ".card", style: { "flex-basis": "200px", "flex-grow": "1" }, count: 3 },
    ],
  },
];
