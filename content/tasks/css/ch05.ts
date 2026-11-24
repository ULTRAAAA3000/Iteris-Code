// Завдання курсу CSS, глава 05 «Блочна модель» (уроки 19–21). Еталони: tests/solutions/css-ch05.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_05: readonly PageTask[] = [
  {
    ...base, id: "css-box-model", lesson: "css/19", xp: 25,
    title: "Блочна модель: картка",
    context: "Кожен елемент це коробка: вміст, внутрішній відступ (padding), рамка (border), зовнішній відступ (margin). З box-sizing: border-box ширина коробки включає відступи й рамку, і розрахунки стають передбачуваними.",
    brief: [
      "Оформіть <code>.card</code>: ширина <code>300px</code>, <code>box-sizing: border-box</code>, внутрішній відступ <code>16px</code>, рамка <code>2px solid #1a237e</code>, зовнішній відступ зверху <code>24px</code>.",
      "Другій картці <code>.card.wide</code> дайте <code>width: 100%</code> із тим самим <code>border-box</code> (щоб вона не вилазила за сторінку): достатньо потрібного правила для <code>.wide</code>.",
    ],
    markup: `<div class="card">Картка товару</div>
<div class="card wide">Широка картка</div>`,
    starter: `.card {
  /* TODO: width 300px, box-sizing border-box, padding 16px, border 2px solid #1a237e, margin-top 24px */
}

/* TODO: .wide: width 100% */
`,
    checks: [
      { name: "Ширина першої картки 300px", selector: ".card:not(.wide)", style: { width: "300px" } },
      { name: "box-sizing: border-box", selector: ".card", style: { "box-sizing": "border-box" }, count: 2 },
      { name: "Внутрішній відступ 16px", selector: ".card", style: { "padding-top": "16px", "padding-left": "16px" } },
      { name: "Рамка 2px solid #1a237e", selector: ".card", style: { "border-top-width": "2px", "border-top-style": "solid", "border-top-color": "#1a237e" } },
      { name: "Відступ зверху 24px", selector: ".card", style: { "margin-top": "24px" } },
      { name: "Для .wide задано width: 100%", source: { matches: "\\.wide\\s*\\{[^}]*width\\s*:\\s*100%" }, hint: "Додайте окреме правило .wide { width: 100%; }" },
    ],
  },
  {
    ...base, id: "css-spacing", lesson: "css/20", xp: 25,
    title: "Відступи: padding, margin і центрування",
    context: "Скорочений запис відступів і правило «проміжок між сусідами задає один бік» це щоденна робота верстальника. Автоматичний margin по горизонталі ставить блок по центру контейнера.",
    brief: [
      "Кожному <code>.item</code> задайте внутрішній відступ <code>12px</code> зверху й знизу та <code>20px</code> праворуч і ліворуч (один скорочений запис).",
      "Лише другому й наступним пунктам (<code>.item + .item</code>) додайте <code>margin-top: 16px</code>. Блоку <code>.note</code> дайте <code>width: 200px</code> і центруйте його через <code>margin-inline: auto</code> (або <code>margin: 0 auto</code>).",
    ],
    markup: `<div class="item">Перший</div>
<div class="item">Другий</div>
<div class="item">Третій</div>
<div class="note">Примітка по центру</div>`,
    starter: `.item {
  /* TODO: padding 12px 20px */
}

/* TODO: .item + .item: margin-top 16px */

.note {
  /* TODO: width 200px і центрування */
}
`,
    checks: [
      { name: "Padding .item: 12px зверху/знизу, 20px з боків", selector: ".item", style: { "padding-top": "12px", "padding-bottom": "12px", "padding-left": "20px", "padding-right": "20px" }, count: 3 },
      { name: "Другий пункт має margin-top 16px", selector: ".item:nth-child(2)", style: { "margin-top": "16px" } },
      { name: "Третій пункт має margin-top 16px", selector: ".item:nth-child(3)", style: { "margin-top": "16px" } },
      { name: "Перший пункт без верхнього відступу", selector: ".item:first-child", style: { "margin-top": "0px" } },
      { name: "Ширина .note 200px", selector: ".note", style: { width: "200px" } },
      { name: "Горизонтальний auto-відступ у .note", source: { matches: "\\.note\\s*\\{[^}]*margin(?:-inline|-left)?\\s*:[^;}]*auto" }, hint: "Використайте margin-inline: auto або margin: 0 auto" },
    ],
  },
  {
    ...base, id: "css-sizing", lesson: "css/21", xp: 30,
    title: "Розміри: контейнер, прокрутка й пропорції",
    context: "Сучасна верстка обмежує розмір, а не фіксує його: max-width для контейнера, max-height з прокруткою для довгих списків і aspect-ratio для рівних обкладинок. Так блоки гнучко живуть на екранах різної ширини.",
    brief: [
      "Контейнеру <code>.container</code> задайте <code>max-width: 600px</code> і центруйте його через <code>margin-inline: auto</code> (або <code>margin: 0 auto</code>). Зображенню <code>img</code> дайте <code>max-width: 100%</code>.",
      "Списку <code>.list</code> задайте <code>max-height: 120px</code> та <code>overflow-y: auto</code>. Обкладинці <code>.cover</code> задайте пропорції <code>aspect-ratio: 16 / 9</code>.",
    ],
    markup: `<div class="container">
  <img alt="" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
  <div class="cover">Обкладинка</div>
  <div class="list">
    <p>Перший пункт</p><p>Другий пункт</p><p>Третій пункт</p><p>Четвертий пункт</p><p>П'ятий пункт</p><p>Шостий пункт</p>
  </div>
</div>`,
    starter: `.container {
  /* TODO: max-width 600px і центрування */
}

img {
  /* TODO: max-width 100% */
}

.list {
  /* TODO: max-height 120px і overflow-y: auto */
}

.cover {
  /* TODO: aspect-ratio 16 / 9 */
}
`,
    checks: [
      { name: "Контейнер: max-width 600px", selector: ".container", style: { "max-width": "600px" }, hint: "Додайте max-width: 600px" },
      { name: "Контейнер центрується автоматичними відступами", source: { matches: "\\.container\\s*\\{[^}]*margin(?:-inline|-left)?\\s*:[^;}]*auto" }, hint: "Використайте margin-inline: auto або margin: 0 auto" },
      { name: "Зображення не ширше за батька", selector: "img", style: { "max-width": "100%" } },
      { name: "Список: max-height 120px", selector: ".list", style: { "max-height": "120px" } },
      { name: "Список: вертикальна прокрутка за потреби", selector: ".list", style: { "overflow-y": "auto" } },
      { name: "Обкладинка: aspect-ratio 16 / 9", source: { matches: "\\.cover\\s*\\{[^}]*aspect-ratio\\s*:\\s*16\\s*/\\s*9" }, hint: "aspect-ratio: 16 / 9" },
    ],
  },
];
