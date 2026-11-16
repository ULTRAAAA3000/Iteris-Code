// Практичні завдання курсу CSS: по одному на кожен урок. Розмітка готова (markup), користувач пише лише стилі.
// Виконуються в браузері: сторінка малюється в ізольованому iframe, перевірки дивляться на обчислені стилі та код.
// Еталони: tests/solutions/css.mjs. Правила цього набору: перевіряємо лише те, що однаково обчислюється в усіх браузерах
// (кольори в hex, довжини в px); для сітки, медіазапитів, змінних і переходів перевіряємо код (source), бо їх значення залежать від ширини екрана й теми.
import type { PageTask } from "../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const CSS_TASKS: readonly PageTask[] = [
  {
    ...base, id: "css-cascade", lesson: "css/1", xp: 15,
    title: "Каскад, специфічність і успадкування",
    context: "Коли два правила б'ються за один елемент, перемагає те, що специфічніше (id сильніший за клас, клас сильніший за тег), а за рівної специфічності те, що написано пізніше. Помилки каскаду це половина «чому мій стиль не працює».",
    brief: [
      "У заготовці заголовок <code>#title</code> залишається червоним, бо правило <code>.big</code> специфічніше за <code>h1</code>. Зробіть його зеленим <code>#2e7d32</code> через правило з <code>#title</code>, <b>без</b> <code>!important</code>.",
      "Абзацу <code>.note</code> задайте колір <code>#c62828</code>. Розмір шрифту <code>18px</code> задайте <b>лише</b> для <code>body</code>: абзац успадкує його сам.",
    ],
    markup: `<h1 id="title" class="big">Привіт, CSS</h1>
<p class="note">Нотатка</p>`,
    starter: `h1 { color: #1565c0; }
.big { color: #c62828; }

/* TODO: #title зелений (#2e7d32) без !important */

/* TODO: .note: колір #c62828; розмір 18px задайте для body, не для .note */
`,
    checks: [
      { name: "Заголовок #title зелений (#2e7d32)", selector: "#title", style: { color: "#2e7d32" } },
      { name: "Абзац .note має колір #c62828", selector: ".note", style: { color: "#c62828" } },
      { name: "Абзац успадкував розмір шрифту 18px", selector: ".note", style: { "font-size": "18px" } },
      { name: "Розмір шрифту задано для body", source: { matches: "body\\s*\\{[^}]*font-size\\s*:\\s*18px" } },
      { name: "Без !important", source: { has: "!important" }, not: true, hint: "Використайте селектор специфічніший, ніж .big" },
    ],
  },
  {
    ...base, id: "css-selectors", lesson: "css/2", xp: 15,
    title: "Селектори: вкладені, класи, дочірні",
    context: "Селектор вирішує, до яких елементів застосується правило. Вміння точно вказати «лише посилання в меню» чи «лише прямі абзаци секції» рятує від зайвих класів у розмітці.",
    brief: [
      "Покажіть, що вмієте точно вибирати елементи: усі посилання всередині <code>nav</code> зробіть кольору <code>#1a237e</code>, посилання з класом <code>active</code> зробіть жирним (<code>font-weight: bold</code>), а лише <b>прямі</b> абзаци секції (<code>section &gt; p</code>) заберіть верхній відступ (<code>margin-top: 0</code>).",
    ],
    markup: `<nav><a href="#">Головна</a> <a href="#" class="active">Курси</a></nav>
<section><p>Прямий абзац</p><div><p>Вкладений абзац</p></div></section>
<a href="#" class="out">Посилання поза меню</a>`,
    starter: `/* TODO: посилання в nav: колір #1a237e */

/* TODO: посилання з класом active: жирне */

/* TODO: лише прямі абзаци section: margin-top: 0 */
`,
    checks: [
      { name: "Посилання в nav мають колір #1a237e", selector: "nav a", style: { color: "#1a237e" }, count: 2 },
      { name: "Посилання поза меню не зачеплені", selector: "a.out", style: { color: "#1a237e" }, not: true },
      { name: "Активне посилання жирне", selector: "nav a.active", style: { "font-weight": "700" } },
      { name: "Звичайне посилання не жирне", selector: "nav a:not(.active)", style: { "font-weight": "700" }, not: true },
      { name: "Прямий абзац секції без верхнього відступу", selector: "section > p", style: { "margin-top": "0px" } },
      { name: "Вкладений абзац лишився зі стандартним відступом", selector: "section > div > p", style: { "margin-top": "0px" }, not: true },
    ],
  },
  {
    ...base, id: "css-pseudo", lesson: "css/3", xp: 20,
    title: "Псевдокласи і псевдоелементи",
    context: "Псевдоклас описує стан або позицію елемента (при наведенні, перший, непарний), а псевдоелемент додає вміст, якого немає в розмітці (стрілка після кнопки). Без зайвих класів і JavaScript.",
    brief: [
      "Зробіть «зебру»: непарні пункти списку (<code>li:nth-child(odd)</code>) із фоном <code>#f0f4ff</code>.",
      "Посилання при наведенні (<code>a:hover</code>) підкресліть (<code>text-decoration: underline</code>), а без наведення прибрана підкреслення (<code>none</code>). Кнопці <code>.btn</code> додайте стрілку через <code>.btn::after</code> із <code>content: \"→\"</code>.",
    ],
    markup: `<ul><li>Перший</li><li>Другий</li><li>Третій</li><li>Четвертий</li></ul>
<a href="#">Посилання</a> <button class="btn">Далі</button>`,
    starter: `/* TODO: зебра для непарних li (#f0f4ff) */

/* TODO: a без підкреслення, a:hover з підкресленням */

/* TODO: .btn::after з content: "→" */
`,
    checks: [
      { name: "Перший пункт із фоном #f0f4ff", selector: "li:nth-child(1)", style: { "background-color": "#f0f4ff" } },
      { name: "Третій пункт із фоном #f0f4ff", selector: "li:nth-child(3)", style: { "background-color": "#f0f4ff" } },
      { name: "Парні пункти без фону", selector: "li:nth-child(2), li:nth-child(4)", style: { "background-color": "#f0f4ff" }, not: true },
      { name: "Посилання без підкреслення", selector: "a", style: { "text-decoration-line": "none" } },
      { name: "Є правило a:hover із підкресленням", source: { matches: "a:hover\\s*\\{[^}]*text-decoration[^}]*underline" } },
      { name: "Є .btn::after із content", source: { matches: "\\.btn::after\\s*\\{[^}]*content\\s*:" } },
    ],
  },
  {
    ...base, id: "css-colors-units", lesson: "css/4", xp: 20,
    title: "Кольори, одиниці та шрифти",
    context: "rem і em масштабуються разом із шрифтом, тому інтерфейс зручно збільшувати; px підходять для рамок і тонких ліній. Колір задають у hex або rgb, а шрифт завжди з запасним родовим варіантом.",
    brief: [
      "Заголовку <code>h1</code> задайте розмір <code>2rem</code> (це <code>32px</code> за стандартного розміру), а підпису <code>.note</code> розмір <code>0.875rem</code> (<code>14px</code>).",
      "Колір ціни <code>.price</code> зробіть <code>#d32f2f</code>. Для <code>body</code> задайте шрифт <code>font-family: Arial, sans-serif</code>.",
    ],
    markup: `<h1>Товар</h1>
<p class="price">199 грн</p>
<p class="note">Доставка безкоштовна</p>`,
    starter: `/* TODO: body: шрифт Arial з запасним sans-serif */

/* TODO: h1: 2rem; .note: 0.875rem */

/* TODO: .price: колір #d32f2f */
`,
    checks: [
      { name: "h1 має розмір 32px (2rem)", selector: "h1", style: { "font-size": "32px" } },
      { name: ".note має розмір 14px (0.875rem)", selector: ".note", style: { "font-size": "14px" } },
      { name: "Ціна червона #d32f2f", selector: ".price", style: { color: "#d32f2f" } },
      { name: "Шрифт body: Arial із запасним sans-serif", source: { matches: "body\\s*\\{[^}]*font-family\\s*:[^;}]*Arial[^;}]*sans-serif" } },
      { name: "Розміри задано в rem", source: { matches: "2rem[\\s\\S]*0\\.875rem|0\\.875rem[\\s\\S]*2rem" } },
    ],
  },
  {
    ...base, id: "css-box-model", lesson: "css/5", xp: 25,
    title: "Блочна модель: картка",
    context: "Кожен елемент це коробка: вміст, внутрішній відступ (padding), рамка (border), зовнішній відступ (margin). З box-sizing: border-box ширина коробки включає відступи й рамку, і розрахунки стають передбачуваними.",
    brief: [
      "Оформіть <code>.card</code>: ширина <code>300px</code>, <code>box-sizing: border-box</code>, внутрішній відступ <code>16px</code>, рамка <code>2px solid #1a237e</code>, зовнішній відступ зверху <code>24px</code>.",
    ],
    markup: `<div class="card">Картка товару</div>`,
    starter: `.card {
  /* TODO: width 300px, box-sizing border-box, padding 16px, border 2px solid #1a237e, margin-top 24px */
}
`,
    checks: [
      { name: "Ширина 300px", selector: ".card", style: { width: "300px" } },
      { name: "box-sizing: border-box", selector: ".card", style: { "box-sizing": "border-box" } },
      { name: "Внутрішній відступ 16px", selector: ".card", style: { "padding-top": "16px", "padding-left": "16px" } },
      { name: "Рамка 2px solid #1a237e", selector: ".card", style: { "border-top-width": "2px", "border-top-style": "solid", "border-top-color": "#1a237e" } },
      { name: "Відступ зверху 24px", selector: ".card", style: { "margin-top": "24px" } },
    ],
  },
  {
    ...base, id: "css-text-backgrounds", lesson: "css/6", xp: 25,
    title: "Банер: текст, фон, рамки та тіні",
    context: "Фон, колір тексту, вирівнювання, закруглені кути й тінь це базовий набір оформлення будь-якої картки чи банера. Тінь додає глибини й відокремлює блок від фону.",
    brief: [
      "Оформіть <code>.hero</code>: фон <code>#0d47a1</code>, білий текст <code>#ffffff</code>, вирівнювання по центру, кути <code>12px</code>, внутрішній відступ <code>24px</code> та тінь <code>box-shadow</code>.",
      "Заголовок <code>.hero h1</code> зробіть великими літерами (<code>text-transform: uppercase</code>) з розрідженням літер <code>letter-spacing: 2px</code>.",
    ],
    markup: `<div class="hero"><h1>Новий курс</h1><p>Старт у понеділок</p></div>`,
    starter: `.hero {
  /* TODO: фон, колір тексту, text-align, border-radius, padding, box-shadow */
}

.hero h1 {
  /* TODO: великі літери і розрідження */
}
`,
    checks: [
      { name: "Фон #0d47a1", selector: ".hero", style: { "background-color": "#0d47a1" } },
      { name: "Білий текст", selector: ".hero", style: { color: "#ffffff" } },
      { name: "Текст по центру", selector: ".hero", style: { "text-align": "center" } },
      { name: "Закруглені кути 12px", selector: ".hero", style: { "border-top-left-radius": "12px" } },
      { name: "Внутрішній відступ 24px", selector: ".hero", style: { "padding-top": "24px" } },
      { name: "Є тінь box-shadow", source: { matches: "box-shadow\\s*:\\s*[^;}]*\\d" } },
      { name: "Заголовок великими літерами з розрідженням 2px", selector: ".hero h1", style: { "text-transform": "uppercase", "letter-spacing": "2px" } },
    ],
  },
  {
    ...base, id: "css-display-position", lesson: "css/7", xp: 25,
    title: "Значок на картці: position і display",
    context: "position: absolute виймає елемент із потоку й ставить його щодо найближчого батька з position: relative. Так роблять значки, лічильники, випадні меню. А display: none ховає елемент зовсім.",
    brief: [
      "Картці <code>.card</code> задайте <code>position: relative</code>. Значок <code>.badge</code> прикріпіть до правого верхнього кута: <code>position: absolute</code>, <code>top: 8px</code>, <code>right: 8px</code>.",
      "Службовий блок <code>.hidden</code> сховайте через <code>display: none</code>, а мітку <code>.tag</code> зробіть рядково-блоковою (<code>display: inline-block</code>).",
    ],
    markup: `<div class="card">Товар <span class="badge">NEW</span> <span class="tag">акція</span></div>
<div class="hidden">Службова інформація</div>`,
    starter: `/* TODO: .card, .badge, .hidden, .tag */
`,
    checks: [
      { name: "Картка: position relative", selector: ".card", style: { position: "relative" } },
      { name: "Значок: position absolute", selector: ".badge", style: { position: "absolute" } },
      { name: "Значок: 8px зверху і справа", selector: ".badge", style: { top: "8px", right: "8px" } },
      { name: "Службовий блок прихований", selector: ".hidden", style: { display: "none" } },
      { name: "Мітка inline-block", selector: ".tag", style: { display: "inline-block" } },
    ],
  },
  {
    ...base, id: "css-flexbox", lesson: "css/8", xp: 30,
    title: "Шапка та колонки на Flexbox",
    context: "Flexbox розкладає елементи в рядок чи колонку й керує вирівнюванням та проміжками без хитрих хаків. Шапка сайту з логотипом ліворуч і меню праворуч це один display: flex.",
    brief: [
      "Зробіть шапку <code>.header</code> flex-контейнером: <code>display: flex</code>, елементи по краях (<code>justify-content: space-between</code>), по центру по вертикалі (<code>align-items: center</code>) із проміжком <code>gap: 16px</code>.",
      "Блок <code>.sidebar</code> зробіть колонкою: <code>display: flex</code> і <code>flex-direction: column</code>. Основному вмісту <code>.content</code> задайте <code>flex: 1</code>, щоб він займав вільне місце.",
    ],
    markup: `<div class="header"><span>Логотип</span><nav>Меню</nav></div>
<div class="layout"><div class="sidebar"><a>Один</a><a>Два</a></div><div class="content">Вміст</div></div>`,
    starter: `/* TODO: .header, .sidebar і .content */
.layout { display: flex; }
`,
    checks: [
      { name: "Шапка: display flex", selector: ".header", style: { display: "flex" } },
      { name: "Шапка: елементи по краях, по центру вертикально", selector: ".header", style: { "justify-content": "space-between", "align-items": "center" } },
      { name: "Шапка: проміжок 16px", selector: ".header", style: { "column-gap": "16px" } },
      { name: "Бічна панель: колонка", selector: ".sidebar", style: { display: "flex", "flex-direction": "column" } },
      { name: "Вміст займає вільне місце (flex-grow: 1)", selector: ".content", style: { "flex-grow": "1" } },
    ],
  },
  {
    ...base, id: "css-grid", lesson: "css/9", xp: 30,
    title: "Галерея на CSS Grid",
    context: "Grid розкладає елементи у двох вимірах: рядки й колонки одночасно. Галерея з трьох рівних колонок і проміжками це чотири рядки CSS замість складних обчислень.",
    brief: [
      "Зробіть <code>.gallery</code> сіткою: <code>display: grid</code>, три рівні колонки (<code>grid-template-columns: repeat(3, 1fr)</code>) і проміжок <code>12px</code> (<code>gap</code>).",
      "Першій картинці <code>.wide</code> дайте розтягнутись на дві колонки: <code>grid-column: span 2</code>.",
    ],
    markup: `<div class="gallery"><div class="wide">1</div><div>2</div><div>3</div><div>4</div></div>`,
    starter: `/* TODO: .gallery і .wide */
`,
    checks: [
      { name: ".gallery це grid", selector: ".gallery", style: { display: "grid" } },
      { name: "Проміжок 12px", selector: ".gallery", style: { "column-gap": "12px", "row-gap": "12px" } },
      { name: "Три рівні колонки: repeat(3, 1fr)", source: { matches: "grid-template-columns\\s*:\\s*repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)" } },
      { name: ".wide на дві колонки: span 2", source: { matches: "\\.wide\\s*\\{[^}]*grid-column\\s*:\\s*span\\s*2" } },
    ],
  },
  {
    ...base, id: "css-responsive", lesson: "css/10", xp: 30,
    title: "Адаптивна розкладка і медіазапит",
    context: "Сайт має зручно виглядати і на широкому моніторі, і на телефоні. Спільні стилі пишуть для великих екранів, а для вузьких додають медіазапит, який перебудовує розкладку.",
    brief: [
      "Зробіть <code>.layout</code> flex-контейнером із проміжком <code>16px</code> (рядок на широкому екрані).",
      "Додайте медіазапит <code>@media (max-width: 600px)</code>, у якому <code>.layout</code> стає колонкою (<code>flex-direction: column</code>). Змініть ширину вікна, щоб побачити перебудову у попередньому перегляді.",
    ],
    markup: `<div class="layout"><div class="box">Один</div><div class="box">Два</div><div class="box">Три</div></div>`,
    starter: `/* TODO: .layout: flex і gap 16px; media max-width 600px: колонка */
`,
    checks: [
      { name: ".layout це flex із проміжком 16px", selector: ".layout", style: { display: "flex", "column-gap": "16px" } },
      { name: "Є медіазапит max-width до 600px", source: { matches: "@media\\s*\\(\\s*max-width\\s*:\\s*600px\\s*\\)" } },
      { name: "У медіазапиті розкладка стає колонкою", source: { matches: "@media[^{]*\\{[\\s\\S]*\\.layout\\s*\\{[^}]*flex-direction\\s*:\\s*column" } },
    ],
  },
  {
    ...base, id: "css-variables-dark", lesson: "css/11", xp: 35,
    title: "Змінні CSS і темна тема",
    context: "Змінні (custom properties) збирають кольори теми в одному місці. Щоб додати темну тему, перевизначають кілька змінних в @media (prefers-color-scheme: dark), а решта стилів не чіпається.",
    brief: [
      "У <code>:root</code> оголосіть змінні <code>--bg: #ffffff</code> і <code>--text: #111111</code>. <code>body</code> має брати з них фон і колір через <code>var(--bg)</code> та <code>var(--text)</code>.",
      "Додайте блок <code>@media (prefers-color-scheme: dark)</code>, що перевизначає ці змінні на темні (<code>--bg: #111111</code>, <code>--text: #eeeeee</code>). Кольори поточної теми перевіряємо за кодом: вони залежать від налаштувань вашої системи.",
    ],
    markup: `<h1>Тема</h1><p>Текст сторінки</p>`,
    starter: `/* TODO: змінні в :root, body через var(), темна тема в @media */
`,
    checks: [
      { name: "У :root оголошено --bg і --text", source: { matches: ":root\\s*\\{[^}]*--bg\\s*:[^}]*--text\\s*:|:root\\s*\\{[^}]*--text\\s*:[^}]*--bg\\s*:" } },
      { name: "body використовує var(--bg)", source: { matches: "body\\s*\\{[^}]*var\\(\\s*--bg\\s*\\)" } },
      { name: "body використовує var(--text)", source: { matches: "body\\s*\\{[^}]*var\\(\\s*--text\\s*\\)" } },
      { name: "Є темна тема через prefers-color-scheme: dark", source: { matches: "@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*dark\\s*\\)" } },
      { name: "У темній темі змінні перевизначено", source: { matches: "prefers-color-scheme\\s*:\\s*dark\\s*\\)[\\s\\S]*--bg\\s*:" } },
    ],
  },
  {
    ...base, id: "css-transitions", lesson: "css/12", xp: 35,
    title: "Плавна кнопка та анімація пульсу",
    context: "Перехід (transition) робить зміну стилю плавною, наприклад, колір кнопки при наведенні. Анімація (@keyframes) повторюється сама й привертає увагу до елемента.",
    brief: [
      "Кнопці <code>.btn</code> задайте плавну зміну фону за <code>0.3s</code> (<code>transition</code>), а при наведенні (<code>.btn:hover</code>) фон має стати <code>#1565c0</code>.",
      "Опишіть анімацію <code>@keyframes pulse</code> (від <code>transform: scale(1)</code> до <code>scale(1.1)</code>) і застосуйте її до <code>.pulse</code> безкінечно: <code>animation: pulse 1.5s infinite</code>.",
    ],
    markup: `<button class="btn">Купити</button> <span class="pulse">●</span>`,
    starter: `.btn { background: #1976d2; color: #fff; border: 0; padding: 10px 16px; }

/* TODO: transition для .btn, .btn:hover, @keyframes pulse і .pulse */
`,
    checks: [
      { name: "У кнопки є плавний перехід 0.3s", selector: ".btn", style: { "transition-duration": "0.3s" } },
      { name: "Є правило .btn:hover із фоном #1565c0", source: { matches: "\\.btn:hover\\s*\\{[^}]*background(-color)?\\s*:\\s*#1565c0" } },
      { name: "Описано @keyframes pulse із scale", source: { matches: "@keyframes\\s+pulse\\s*\\{[\\s\\S]*scale\\(" } },
      { name: "Анімацію застосовано до .pulse безкінечно", source: { matches: "\\.pulse\\s*\\{[^}]*animation\\s*:[^;}]*pulse[^;}]*infinite" } },
    ],
  },
  {
    ...base, id: "css-portfolio-practice", lesson: "css/13", xp: 40,
    title: "Оформіть сторінку-портфоліо",
    context: "Підсумок курсу: застосуйте все разом. Шапка з flex-меню, сітка карток проєктів, акуратні картки з відступами й тінню, адаптивність для телефона.",
    brief: [
      "<code>header</code>: фон <code>#1a237e</code>, білий текст, внутрішній відступ <code>16px</code>. Меню <code>nav</code> це flex із проміжком <code>16px</code>.",
      "<code>.projects</code>: сітка з трьох колонок (<code>grid-template-columns: repeat(3, 1fr)</code>) і проміжком <code>16px</code>. <code>.card</code>: білий фон <code>#ffffff</code>, відступ <code>16px</code>, кути <code>8px</code>, <code>box-shadow</code>.",
      "<code>footer</code>: текст по центру. Додайте <code>@media (max-width: 600px)</code>, у якому <code>.projects</code> стає в одну колонку (<code>grid-template-columns: 1fr</code>).",
    ],
    markup: `<header><h1>Олена Коваль</h1><nav><a href="#">Про мене</a><a href="#">Проєкти</a><a href="#">Контакти</a></nav></header>
<main><div class="projects"><div class="card">Лендінг</div><div class="card">Калькулятор</div><div class="card">Блог</div></div></main>
<footer>© 2026</footer>`,
    starter: `/* TODO: header, nav, .projects, .card, footer і медіазапит */
`,
    checks: [
      { name: "Шапка: фон #1a237e, білий текст, відступ 16px", selector: "header", style: { "background-color": "#1a237e", color: "#ffffff", "padding-top": "16px" } },
      { name: "Меню: flex із проміжком 16px", selector: "nav", style: { display: "flex", "column-gap": "16px" } },
      { name: "Проєкти: сітка з проміжком 16px", selector: ".projects", style: { display: "grid", "column-gap": "16px" } },
      { name: "Сітка з трьох колонок", source: { matches: "\\.projects\\s*\\{[^}]*grid-template-columns\\s*:\\s*repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)" } },
      { name: "Картка: білий фон, відступ 16px, кути 8px", selector: ".card", style: { "background-color": "#ffffff", "padding-top": "16px", "border-top-left-radius": "8px" }, count: 3 },
      { name: "Картка з тінню", source: { matches: "\\.card\\s*\\{[^}]*box-shadow\\s*:\\s*[^;}]*\\d" } },
      { name: "Підвал по центру", selector: "footer", style: { "text-align": "center" } },
      { name: "Медіазапит: одна колонка на вузькому екрані", source: { matches: "@media\\s*\\(\\s*max-width\\s*:\\s*600px\\s*\\)[\\s\\S]*grid-template-columns\\s*:\\s*1fr" } },
    ],
  },
];
