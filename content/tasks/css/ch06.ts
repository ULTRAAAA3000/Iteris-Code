// Завдання курсу CSS, глава 06 «Потік і позиціонування» (уроки 22–24). Еталони: tests/solutions/css-ch06.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_06: readonly PageTask[] = [
  {
    ...base, id: "css-display-position", lesson: "css/22", xp: 20,
    title: "display: блок, рядок і inline-block",
    context: "Властивість display визначає, як елемент стоїть у потоці. Мітка стає inline-block, щоб мати відступи, посилання блоком, пункти меню в рядок, а службовий блок зникає зовсім через display: none.",
    brief: [
      "Мітці <code>.tag</code> задайте <code>display: inline-block</code>, а посиланню <code>.button</code> <code>display: block</code>.",
      "Пунктам меню <code>.menu li</code> задайте <code>display: inline-block</code>, службовий блок <code>.hidden</code> сховайте через <code>display: none</code>, а <code>.note</code> зробіть рядковим (<code>display: inline</code>).",
    ],
    markup: `<p>Товар <span class="tag">акція</span></p>
<a class="button" href="#">Купити</a>
<ul class="menu"><li>Головна</li><li>Каталог</li><li>Контакти</li></ul>
<div class="hidden">Службова інформація</div>
<div class="note">Примітка</div>`,
    starter: `.tag {
  /* TODO: inline-block */
}

.button {
  /* TODO: block */
}

/* TODO: .menu li: inline-block */

/* TODO: .hidden: сховати; .note: рядковий */
`,
    checks: [
      { name: "Мітка: inline-block", selector: ".tag", style: { display: "inline-block" } },
      { name: "Посилання-кнопка: block", selector: ".button", style: { display: "block" } },
      { name: "Пункти меню: inline-block", selector: ".menu li", style: { display: "inline-block" }, count: 3 },
      { name: "Службовий блок прихований", selector: ".hidden", style: { display: "none" } },
      { name: "Примітка рядкова", selector: ".note", style: { display: "inline" } },
    ],
  },
  {
    ...base, id: "css-position", lesson: "css/23", xp: 30,
    title: "Значок, липка шапка й кнопка «нагору»",
    context: "Зв'язка relative плюс absolute ставить значок у кут картки, sticky тримає шапку під час прокручування, а fixed закріплює кнопку у вікні. Ці три прийоми покривають більшість потреб у позиціонуванні.",
    brief: [
      "Картці <code>.card</code> задайте <code>position: relative</code>, а значку <code>.badge</code> <code>position: absolute</code>, <code>top: 8px</code> і <code>right: 8px</code>.",
      "Шапку <code>.header</code> зробіть липкою: <code>position: sticky</code> і <code>top: 0</code>. Кнопку <code>.to-top</code> закріпіть у вікні: <code>position: fixed</code>, <code>bottom: 16px</code>, <code>right: 16px</code>.",
    ],
    markup: `<div class="header">Шапка сайту</div>
<div class="card">Товар <span class="badge">NEW</span></div>
<a class="to-top" href="#">Нагору</a>`,
    starter: `/* TODO: .card, .badge, .header, .to-top */
`,
    checks: [
      { name: "Картка: position relative", selector: ".card", style: { position: "relative" } },
      { name: "Значок: position absolute", selector: ".badge", style: { position: "absolute" } },
      { name: "Значок: 8px зверху і справа", selector: ".badge", style: { top: "8px", right: "8px" } },
      { name: "Шапка: sticky зверху", selector: ".header", style: { position: "sticky", top: "0px" } },
      { name: "Кнопка: fixed", selector: ".to-top", style: { position: "fixed" } },
      { name: "Кнопка: 16px знизу і справа", selector: ".to-top", style: { bottom: "16px", right: "16px" } },
    ],
  },
  {
    ...base, id: "css-z-index", lesson: "css/24", xp: 40,
    title: "Шари: підсвітка, модальне вікно й підказка",
    context: "Модальне вікно має лежати над затемненням, а затемнення над сторінкою. Для цього позиціоновані елементи отримують z-index, а компонент, який не має впливати на решту шарів, ізолюється через isolation.",
    brief: [
      "Затемнення <code>.backdrop</code> зробіть <code>position: fixed</code> із <code>z-index: 10</code>, а вікно <code>.modal</code> теж <code>position: fixed</code>, але з <code>z-index: 20</code>.",
      "Підказці <code>.tooltip</code> задайте <code>position: absolute</code> і <code>z-index: 5</code>. Картці <code>.card</code> створіть власний контекст накладання через <code>isolation: isolate</code>.",
    ],
    markup: `<div class="card">Картка <span class="tooltip">Підказка</span></div>
<div class="backdrop"></div>
<div class="modal">Вікно</div>`,
    starter: `/* TODO: .backdrop (fixed, z-index 10) */

/* TODO: .modal (fixed, z-index 20) */

/* TODO: .tooltip (absolute, z-index 5) і .card (isolation: isolate) */
`,
    checks: [
      { name: "Затемнення: position fixed", selector: ".backdrop", style: { position: "fixed" } },
      { name: "Затемнення: z-index 10", selector: ".backdrop", style: { "z-index": "10" } },
      { name: "Вікно: position fixed", selector: ".modal", style: { position: "fixed" } },
      { name: "Вікно: z-index 20", selector: ".modal", style: { "z-index": "20" } },
      { name: "Підказка: absolute і z-index 5", selector: ".tooltip", style: { position: "absolute", "z-index": "5" } },
      { name: "Картка створює власний контекст накладання", selector: ".card", style: { isolation: "isolate" } },
    ],
  },
];
