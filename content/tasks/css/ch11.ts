// Завдання курсу CSS, глава 11 «Практика» (урок 40). Еталони: tests/solutions/css-ch11.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_11: readonly PageTask[] = [
  {
    ...base, id: "css-portfolio-practice", lesson: "css/40", xp: 60,
    title: "Оформіть сторінку-портфоліо",
    context: "Підсумок курсу: змінні й темна тема, Flexbox для меню, Grid для карток проєктів, відступи з тінню, перехід при наведенні й адаптивність для телефона. Усе разом на одній сторінці.",
    brief: [
      "У <code>:root</code> оголосіть <code>--bg</code>, <code>--text</code> і <code>--accent</code>. <code>body</code> бере фон і колір через <code>var()</code>. Додайте <code>@media (prefers-color-scheme: dark)</code>, що перевизначає <code>--bg</code>.",
      "<code>header</code>: фон <code>#1a237e</code>, білий текст, відступ <code>16px</code>. Меню <code>nav</code> це flex із проміжком <code>16px</code>.",
      "<code>.projects</code>: сітка <code>repeat(3, 1fr)</code> із проміжком <code>16px</code>. <code>.card</code>: фон <code>#ffffff</code>, відступ <code>16px</code>, кути <code>8px</code>, <code>box-shadow</code>, <code>transition: transform 0.2s</code> і підйом <code>translateY(-4px)</code> у <code>:hover</code>.",
      "<code>footer</code>: текст по центру. У <code>@media (max-width: 600px)</code> сітка <code>.projects</code> стає в одну колонку (<code>grid-template-columns: 1fr</code>).",
    ],
    markup: `<header><h1>Олена Коваль</h1><nav><a href="#">Про мене</a><a href="#">Проєкти</a><a href="#">Контакти</a></nav></header>
<main><div class="projects"><div class="card">Лендінг</div><div class="card">Калькулятор</div><div class="card">Блог</div></div></main>
<footer>© 2026</footer>`,
    starter: `/* TODO: змінні, body, header, nav, .projects, .card, footer, медіазапити */
`,
    checks: [
      { name: "У :root оголошено --bg, --text і --accent", source: { matches: ":root\\s*\\{(?=[^}]*--bg\\s*:)(?=[^}]*--text\\s*:)(?=[^}]*--accent\\s*:)" } },
      { name: "body бере фон і колір із var()", source: { matches: "body\\s*\\{(?=[^}]*background(-color)?\\s*:\\s*var\\(\\s*--bg\\s*\\))(?=[^}]*[^-]color\\s*:\\s*var\\(\\s*--text\\s*\\))" } },
      { name: "Шапка: фон #1a237e, білий текст, відступ 16px", selector: "header", style: { "background-color": "#1a237e", color: "#ffffff", "padding-top": "16px" } },
      { name: "Меню: flex із проміжком 16px", selector: "nav", style: { display: "flex", "column-gap": "16px" } },
      { name: "Проєкти: сітка з проміжком 16px", selector: ".projects", style: { display: "grid", "column-gap": "16px" } },
      { name: "Сітка з трьох колонок", source: { matches: "\\.projects\\s*\\{[^}]*grid-template-columns\\s*:\\s*repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)" } },
      { name: "Картка: білий фон, відступ 16px, кути 8px", selector: ".card", style: { "background-color": "#ffffff", "padding-top": "16px", "border-top-left-radius": "8px" }, count: 3 },
      { name: "Картка з тінню", source: { matches: "\\.card\\s*\\{[^}]*box-shadow\\s*:\\s*[^;}]*\\d" } },
      { name: "Картка: плавний перехід 0.2s для transform", source: { matches: "\\.card\\s*\\{[^}]*transition\\s*:[^;}]*transform[^;}]*0?\\.2s" } },
      { name: "Картка при наведенні підіймається", source: { matches: "\\.card:hover\\s*\\{[^}]*transform\\s*:\\s*translateY\\(\\s*-4px\\s*\\)" } },
      { name: "Підвал по центру", selector: "footer", style: { "text-align": "center" } },
      { name: "Медіазапит: одна колонка на вузькому екрані", source: { matches: "@media\\s*\\(\\s*max-width\\s*:\\s*600px\\s*\\)[\\s\\S]*grid-template-columns\\s*:\\s*1fr\\s*[;}]" } },
      { name: "Темна тема: у prefers-color-scheme: dark змінено --bg", source: { matches: "@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*dark\\s*\\)[\\s\\S]*--bg\\s*:" } },
    ],
  },
];
