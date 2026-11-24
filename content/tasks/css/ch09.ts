// Завдання курсу CSS, глава 09 «Адаптивність» (уроки 33–35). Еталони: tests/solutions/css-ch09.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_09: readonly PageTask[] = [
  {
    ...base, id: "css-responsive", lesson: "css/33", xp: 30,
    title: "Адаптивна розкладка і медіазапит",
    context: "Сайт має зручно виглядати і на телефоні, і на широкому моніторі. У мобільному підході базові стилі пишуть для вузького екрана, а медіазапит із min-width перебудовує розкладку для великих.",
    brief: [
      "Зробіть <code>.layout</code> flex-контейнером із проміжком <code>16px</code> і напрямом <code>flex-direction: column</code> (колонка, базовий стиль для телефона). Кожній <code>.box</code> дайте <code>padding: 16px</code>.",
      "Додайте медіазапит <code>@media (min-width: 600px)</code>, у якому <code>.layout</code> стає рядом (<code>flex-direction: row</code>). Змініть ширину вікна, щоб побачити перебудову у попередньому перегляді.",
    ],
    markup: `<div class="layout"><div class="box">Один</div><div class="box">Два</div><div class="box">Три</div></div>`,
    starter: `/* TODO: .layout: flex, gap 16px, колонка; .box: padding; media min-width 600px: ряд */
`,
    checks: [
      { name: ".layout це flex із проміжком 16px", selector: ".layout", style: { display: "flex", "column-gap": "16px" } },
      { name: "Картки мають padding 16px", selector: ".box", style: { "padding-top": "16px", "padding-left": "16px" }, count: 3 },
      { name: "Базово розкладка колонкою (до медіазапиту)", source: { matches: "^[^@]*\\.layout\\s*\\{[^}]*flex-direction\\s*:\\s*column" }, hint: "Правило з flex-direction: column має стояти вище за @media" },
      { name: "Є медіазапит min-width: 600px", source: { matches: "@media\\s*\\(\\s*min-width\\s*:\\s*600px\\s*\\)" } },
      { name: "У медіазапиті розкладка стає рядом", source: { matches: "@media[^{]*\\{[\\s\\S]*\\.layout\\s*\\{[^}]*flex-direction\\s*:\\s*row" } },
    ],
  },
  {
    ...base, id: "css-fluid-sizes", lesson: "css/34", xp: 35,
    title: "Плавні розміри через clamp, min і max",
    context: "Замість стрибків на межах медіазапитів розміри можна зробити плавними. Шрифт і відступи беремо через clamp, ширину контейнера через min, а мінімальну ширину колонки через max.",
    brief: [
      "Заголовку <code>.title</code> задайте плавний шрифт: <code>font-size: clamp(1.5rem, 4vw, 3rem)</code>. Секції <code>.section</code> дайте відступ <code>padding: clamp(16px, 4vw, 48px)</code>.",
      "Контейнер <code>.container</code> має займати <code>width: min(100%, 720px)</code> і центруватись (<code>margin: 0 auto</code>), а бічна колонка <code>.sidebar</code> мати <code>width: max(200px, 25%)</code>.",
    ],
    markup: `<div class="container"><h1 class="title">Заголовок</h1><section class="section">Секція</section><aside class="sidebar">Бічна</aside></div>`,
    starter: `.title { font-size: 2rem; }
/* TODO: .section, .container і .sidebar */
`,
    checks: [
      { name: "Шрифт заголовка: clamp(1.5rem, 4vw, 3rem)", source: { matches: "\\.title\\s*\\{[^}]*font-size\\s*:\\s*clamp\\(\\s*1\\.5rem\\s*,\\s*4vw\\s*,\\s*3rem\\s*\\)" } },
      { name: "Відступ секції: clamp(16px, 4vw, 48px)", source: { matches: "\\.section\\s*\\{[^}]*padding\\s*:\\s*clamp\\(\\s*16px\\s*,\\s*4vw\\s*,\\s*48px\\s*\\)" } },
      { name: "Ширина контейнера: min(100%, 720px)", source: { matches: "\\.container\\s*\\{[^}]*width\\s*:\\s*min\\(\\s*100%\\s*,\\s*720px\\s*\\)" } },
      { name: "Контейнер по центру: margin 0 auto", source: { matches: "\\.container\\s*\\{[^}]*margin\\s*:\\s*0(?:px)?\\s+auto" } },
      { name: "Колонка: max(200px, 25%)", source: { matches: "\\.sidebar\\s*\\{[^}]*width\\s*:\\s*max\\(\\s*200px\\s*,\\s*25%\\s*\\)" } },
    ],
  },
  {
    ...base, id: "css-container-queries", lesson: "css/35", xp: 45,
    title: "Картка, що реагує на свій контейнер",
    context: "Картка живе в обгортці різної ширини. Обгортка стає контейнером, а контейнерний запит перебудовує картку: у вузькій вона стовпчиком, а від 400px картинка зліва й текст справа. Працює в сучасних браузерах.",
    brief: [
      "Зробіть <code>.card-wrap</code> контейнером: <code>container-type: inline-size</code> і <code>container-name: card</code>.",
      "Картці <code>.card</code> задайте <code>display: grid</code> і <code>gap: 12px</code>. Додайте <code>@container card (min-width: 400px)</code>, у якому <code>.card</code> отримує <code>grid-template-columns: 120px 1fr</code>.",
    ],
    markup: `<div class="card-wrap"><article class="card"><div class="pic">Фото</div><p>Текст картки</p></article></div>`,
    starter: `.card-wrap { width: 100%; }
/* TODO: контейнер, .card і @container */
`,
    checks: [
      { name: "Обгортка: container-type inline-size", selector: ".card-wrap", style: { "container-type": "inline-size" } },
      { name: "Обгортка має ім'я card", source: { matches: "container-name\\s*:\\s*card\\b|container\\s*:\\s*card\\s*/" } },
      { name: "Картка: grid із проміжком 12px", selector: ".card", style: { display: "grid", "column-gap": "12px", "row-gap": "12px" } },
      { name: "Є @container card (min-width: 400px)", source: { matches: "@container\\s+card\\s*\\(\\s*min-width\\s*:\\s*400px\\s*\\)" } },
      { name: "У запиті картка в дві колонки", source: { matches: "@container[^{]*\\{[\\s\\S]*\\.card\\s*\\{[^}]*grid-template-columns\\s*:\\s*120px\\s+1fr" } },
    ],
  },
];
