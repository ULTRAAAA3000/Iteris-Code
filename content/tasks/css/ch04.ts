// Завдання курсу CSS, глава 04 «Кольори, одиниці й текст» (уроки 13–18). Розмітка готова (markup), користувач пише лише style.css. Еталони: tests/solutions/css-ch04.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_04: readonly PageTask[] = [
  {
    ...base, id: "css-colors-units", lesson: "css/13", xp: 20,
    title: "Палітра: hex, rgb і hsl",
    context: "Один і той самий колір можна записати трьома способами. Потренуємося читати їх і писати: hex для основних кольорів, rgb для прозорої накладки, hsl для темнішого відтінку тієї самої кнопки.",
    brief: [
      "Заголовку <code>h1</code> задайте колір <code>#1565c0</code>, а ціні <code>.price</code> колір <code>rgb(211, 47, 47)</code> (це <code>#d32f2f</code>).",
      "Кнопці <code>.btn</code> дайте фон <code>hsl(210, 80%, 40%)</code> і білий текст <code>#ffffff</code>. Накладці <code>.overlay</code> задайте напівпрозорий фон через <code>rgba(0, 0, 0, 0.5)</code> або <code>rgb(0 0 0 / 50%)</code>.",
    ],
    markup: `<h1>Товар</h1>
<p class="price">199 грн</p>
<button class="btn">Купити</button>
<div class="overlay">Накладка</div>`,
    starter: `/* TODO: h1: колір #1565c0 */

/* TODO: .price: колір rgb(211, 47, 47) */

/* TODO: .btn: фон hsl(210, 80%, 40%), текст білий */

/* TODO: .overlay: напівпрозорий чорний фон */
`,
    checks: [
      { name: "Заголовок h1 кольору #1565c0", selector: "h1", style: { color: "#1565c0" } },
      { name: "Ціна червона #d32f2f", selector: ".price", style: { color: "#d32f2f" }, hint: "rgb(211, 47, 47) це те саме, що #d32f2f." },
      { name: "Кнопка: фон hsl(210, 80%, 40%), тобто #1466b8", selector: ".btn", style: { "background-color": "#1466b8" }, hint: "background-color: hsl(210, 80%, 40%);" },
      { name: "Текст кнопки білий", selector: ".btn", style: { color: "#ffffff" } },
      { name: "Накладка має напівпрозорий чорний фон", selector: ".overlay", source: { matches: "\\.overlay\\s*\\{[^}]*background(?:-color)?\\s*:\\s*(?:rgba\\(\\s*0\\s*,\\s*0\\s*,\\s*0\\s*,\\s*0?\\.5\\s*\\)|rgb\\(\\s*0\\s+0\\s+0\\s*/\\s*50%\\s*\\)|rgba\\(\\s*0\\s+0\\s+0\\s*/\\s*0?\\.5\\s*\\)|#00000080)" } },
    ],
  },
  {
    ...base, id: "css-length-units", lesson: "css/14", xp: 20,
    title: "Одиниці: rem для тексту, px для ліній",
    context: "Розмір шрифту й відступи в rem масштабуються разом із налаштуваннями користувача, тонка рамка лишається в px, а відступи кнопки в em ростуть разом із її текстом. Підберіть одиницю до кожного значення.",
    brief: [
      "Заголовку <code>h1</code> задайте <code>font-size: 2.5rem</code>, а вступу <code>.lead</code> розмір <code>1.25rem</code>.",
      "Блоку <code>.box</code> дайте рамку <code>1px solid #b0bec5</code> і внутрішній відступ <code>1.5rem</code>.",
      "Кнопці <code>.btn</code> задайте <code>font-size: 1.5rem</code> і відступи в em: <code>padding: 0.5em 1em</code>. Банеру <code>.hero</code> мінімальну висоту <code>min-height: 60vh</code>.",
    ],
    markup: `<h1>Тариф</h1>
<p class="lead">Усе, що потрібно для старту</p>
<div class="box">Блок із рамкою</div>
<button class="btn">Замовити</button>
<section class="hero">Банер</section>`,
    starter: `/* TODO: h1: 2.5rem; .lead: 1.25rem */

/* TODO: .box: рамка 1px solid #b0bec5 і padding 1.5rem */

/* TODO: .btn: font-size 1.5rem і padding 0.5em 1em */

/* TODO: .hero: min-height 60vh */
`,
    checks: [
      { name: "Заголовок h1 має розмір 40px (2.5rem)", selector: "h1", style: { "font-size": "40px" } },
      { name: "Вступ .lead має розмір 20px (1.25rem)", selector: ".lead", style: { "font-size": "20px" } },
      { name: "Рамка блоку 1px", selector: ".box", style: { "border-top-width": "1px", "border-top-style": "solid", "border-top-color": "#b0bec5" } },
      { name: "Внутрішній відступ блоку 24px (1.5rem)", selector: ".box", style: { "padding-top": "24px", "padding-left": "24px" } },
      { name: "Кнопка має розмір шрифту 24px (1.5rem)", selector: ".btn", style: { "font-size": "24px" } },
      { name: "Відступи кнопки: 12px зверху й 24px з боків (в em)", selector: ".btn", style: { "padding-top": "12px", "padding-left": "24px" }, hint: "padding: 0.5em 1em при шрифті 24px." },
      { name: "Відступи кнопки задано в em", source: { matches: "padding[^;}]*\\d*\\.?\\d+em" } },
      { name: "Мінімальну висоту банера задано у vh", source: { matches: "min-height\\s*:\\s*60vh" } },
    ],
  },
  {
    ...base, id: "css-fonts", lesson: "css/15", xp: 25,
    title: "Шрифти: стеки й власний шрифт",
    context: "Шрифт задають списком від бажаного до запасного, а власний шрифт підключають через @font-face. Налаштуйте типографіку блогу: окремі стеки для тексту, заголовка й коду та накреслення курсиву й тонкого вступу.",
    brief: [
      "Для <code>body</code> задайте шрифт <code>font-family: system-ui, \"Segoe UI\", Arial, sans-serif</code>. Для <code>code</code> стек із <code>monospace</code> наприкінці.",
      "Оголосіть <code>@font-face</code> з <code>font-family: \"Brand\"</code>, <code>src</code> із <code>url(...)</code> і <code>font-display: swap</code>. Заголовку <code>h1</code> задайте стек <code>\"Brand\", Georgia, serif</code>.",
      "Вступу <code>.lead</code> задайте тонку товщину <code>font-weight: 300</code>, а цитаті <code>.quote</code> курсив <code>font-style: italic</code>.",
    ],
    markup: `<h1>Блог про CSS</h1>
<p class="lead">Короткий вступ до теми</p>
<p>Команда <code>npm install</code> ставить залежності.</p>
<p class="quote">Простота це вершина досконалості.</p>`,
    starter: `/* TODO: body: шрифт system-ui, "Segoe UI", Arial, sans-serif */

/* TODO: code: стек із monospace наприкінці */

/* TODO: @font-face "Brand": src із url(...) і font-display swap */

/* TODO: h1: стек "Brand", Georgia, serif */

/* TODO: .lead: font-weight 300; .quote: font-style italic */
`,
    checks: [
      { name: "Шрифт body: стек із sans-serif наприкінці", source: { matches: "body\\s*\\{[^}]*font-family\\s*:[^;}]*sans-serif\\s*;?\\s*[;}]" } },
      { name: "Стек для code завершується родовим monospace", source: { matches: "code\\s*\\{[^}]*font-family\\s*:[^;}]*monospace" } },
      { name: "Є @font-face з назвою Brand і шляхом src: url(...)", source: { matches: "@font-face\\s*\\{[^}]*font-family\\s*:\\s*[\"']Brand[\"'][^}]*src\\s*:[^;}]*url\\(" } },
      { name: "У @font-face є font-display: swap", source: { matches: "@font-face\\s*\\{[^}]*font-display\\s*:\\s*swap" } },
      { name: "Заголовок h1: стек \"Brand\", Georgia, serif", source: { matches: "h1\\s*\\{[^}]*font-family\\s*:\\s*[\"']Brand[\"']\\s*,[^;}]*serif" } },
      { name: "Вступ .lead тонкий (300)", selector: ".lead", style: { "font-weight": "300" } },
      { name: "Цитата .quote курсивом", selector: ".quote", style: { "font-style": "italic" } },
    ],
  },
  {
    ...base, id: "css-text-spacing", lesson: "css/16", xp: 25,
    title: "Типографіка: інтервали, вирівнювання, перенос",
    context: "Комфортний інтервал між рядками, обмежена ширина колонки й безпечний перенос довгих слів роблять статтю читабельною на будь-якому екрані. Налаштуйте текстовий блок і заголовок новини.",
    brief: [
      "Для <code>body</code> задайте <code>line-height: 1.6</code>. Заголовку <code>h1</code> великі літери (<code>text-transform: uppercase</code>), розрідження <code>letter-spacing: 2px</code> та вирівнювання по центру.",
      "Посиланню <code>a</code> приберіть підкреслення (<code>text-decoration: none</code>). Для <code>.comment</code> додайте <code>overflow-wrap: break-word</code>.",
      "Заголовок <code>.title</code> має обрізатись трьома крапками: <code>white-space: nowrap</code>, <code>overflow: hidden</code> і <code>text-overflow: ellipsis</code>.",
    ],
    markup: `<h1>Новини дня</h1>
<p><a href="#">Читати далі</a></p>
<p class="comment">https://example.com/дуже/довга/адреса/без/пробілів</p>
<div class="title">Дуже довгий заголовок статті, який не вміщається в один рядок</div>`,
    starter: `/* TODO: body: line-height 1.6 */

/* TODO: h1: великі літери, letter-spacing 2px, по центру */

/* TODO: a: без підкреслення */

/* TODO: .comment: overflow-wrap break-word */

/* TODO: .title: nowrap, overflow hidden, text-overflow ellipsis */
`,
    checks: [
      { name: "Міжрядковий інтервал 1.6 (25.6px при 16px)", selector: "p", style: { "line-height": "25.6px" }, hint: "line-height: 1.6 на body." },
      { name: "h1 великими літерами", selector: "h1", style: { "text-transform": "uppercase" } },
      { name: "h1 з розрідженням 2px і по центру", selector: "h1", style: { "letter-spacing": "2px", "text-align": "center" } },
      { name: "Посилання без підкреслення", selector: "a", style: { "text-decoration-line": "none" } },
      { name: "Коментар розриває довгі слова", selector: ".comment", style: { "overflow-wrap": "break-word" } },
      { name: "Заголовок не переноситься (nowrap)", selector: ".title", style: { "white-space": "nowrap" } },
      { name: "Заголовок обрізається з крапками (hidden і ellipsis)", selector: ".title", style: { overflow: "hidden", "text-overflow": "ellipsis" } },
    ],
  },
  {
    ...base, id: "css-text-backgrounds", lesson: "css/17", xp: 30,
    title: "Банер із фоном і градієнтами",
    context: "Фон може бути суцільним кольором, градієнтом або картинкою. Оформіть банер із запасним кольором і градієнтом, а мітці дайте радіальний градієнт. Для блока-фото налаштуйте розміщення фону.",
    brief: [
      "Для <code>.hero</code> задайте запасний <code>background-color: #0d47a1</code>, білий текст <code>#ffffff</code> і <code>background-image: linear-gradient(135deg, #0d47a1, #42a5f5)</code>.",
      "Для <code>.badge</code> задайте <code>background-image</code> з <code>radial-gradient(...)</code> від <code>#ffffff</code> до <code>#90caf9</code>.",
      "Для <code>.photo</code> задайте <code>background-size: cover</code>, <code>background-position: center</code> і <code>background-repeat: no-repeat</code>.",
    ],
    markup: `<div class="hero"><h1>Новий курс</h1><p>Старт у понеділок</p></div>
<span class="badge">NEW</span>
<div class="photo">Фото на тлі</div>`,
    starter: `/* TODO: .hero: запасний колір #0d47a1, білий текст, linear-gradient(135deg, ...) */

/* TODO: .badge: radial-gradient від #ffffff до #90caf9 */

/* TODO: .photo: background-size cover, position center, repeat no-repeat */
`,
    checks: [
      { name: "Банер: запасний фон #0d47a1", selector: ".hero", style: { "background-color": "#0d47a1" } },
      { name: "Банер: білий текст", selector: ".hero", style: { color: "#ffffff" } },
      { name: "Банер: лінійний градієнт з кутом", source: { matches: "linear-gradient\\s*\\(\\s*\\d+deg\\s*,[^;}]+,[^;}]+\\)" }, hint: "background-image: linear-gradient(135deg, #0d47a1, #42a5f5); кути й кольори розділяйте комами." },
      { name: "Мітка: радіальний градієнт", source: { matches: "\\.badge[^{]*\\{[^}]*radial-gradient\\s*\\([^;}]+,[^;}]+\\)" } },
      { name: "Фото: cover", selector: ".photo", style: { "background-size": "cover" } },
      { name: "Фото: без повторення", selector: ".photo", style: { "background-repeat": "no-repeat" } },
      { name: "Фото: по центру", selector: ".photo", style: { "background-position": "50% 50%" }, hint: "background-position: center;" },
    ],
  },
  {
    ...base, id: "css-borders-shadows", lesson: "css/18", xp: 35,
    title: "Картка: рамка, кути й тінь",
    context: "Рамка, заокруглення й тінь створюють знайомий вигляд картки. Зробіть картку, коло-аватар і кнопку-таблетку, не забувши про видимий фокус для клавіатури.",
    brief: [
      "Картці <code>.card</code> задайте рамку <code>2px solid #1a237e</code>, кути <code>12px</code> і м'яку тінь <code>box-shadow</code> із розмиттям.",
      "Аватару <code>.avatar</code> задайте <code>border-radius: 50%</code>, кнопці <code>.pill</code> задайте <code>border-radius: 999px</code>.",
      "Для <code>.pill:focus-visible</code> додайте контур <code>outline: 3px solid #ffb300</code> і <code>outline-offset: 2px</code>.",
    ],
    markup: `<div class="card">Картка товару</div>
<div class="avatar">AB</div>
<button class="pill">Купити</button>`,
    starter: `/* TODO: .card: border 2px solid #1a237e, border-radius 12px, box-shadow */

/* TODO: .avatar: border-radius 50% */

/* TODO: .pill: border-radius 999px */

/* TODO: .pill:focus-visible: outline 3px solid #ffb300, outline-offset 2px */
`,
    checks: [
      { name: "Картка: рамка 2px", selector: ".card", style: { "border-top-width": "2px" } },
      { name: "Картка: суцільна рамка", selector: ".card", style: { "border-top-style": "solid" }, hint: "Без стилю solid рамку не видно." },
      { name: "Картка: колір рамки #1a237e", selector: ".card", style: { "border-top-color": "#1a237e" } },
      { name: "Картка: кути 12px", selector: ".card", style: { "border-top-left-radius": "12px" } },
      { name: "Картка: тінь із розмиттям", source: { matches: "box-shadow\\s*:\\s*[^;}]*\\d+(?:px)?\\s+\\d+px\\s+\\d+px" } },
      { name: "Аватар: коло через 50%", source: { matches: "\\.avatar[^{]*\\{[^}]*border-radius\\s*:\\s*50%" } },
      { name: "Кнопка: таблетка 999px", selector: ".pill", style: { "border-top-left-radius": "999px" } },
      { name: "Кнопка: контур при фокусі", source: { matches: "\\.pill:focus-visible\\s*\\{[^}]*outline\\s*:\\s*3px\\s+solid\\s+#ffb300[^}]*outline-offset\\s*:\\s*2px" } },
    ],
  },
];
