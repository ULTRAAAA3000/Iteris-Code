// Завдання курсу CSS, глава 10 «Змінні й анімації» (уроки 36–39). Еталони: tests/solutions/css-ch10.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_10: readonly PageTask[] = [
  {
    ...base, id: "css-variables-dark", lesson: "css/36", xp: 35,
    title: "Змінні CSS: одна палітра на всю сторінку",
    context: "Змінні (custom properties) збирають кольори й відступи в одному місці. Ви оголосите їх на :root, підключите через var(), додасте запасне значення й перевизначите змінну всередині картки.",
    brief: [
      "У <code>:root</code> оголосіть змінні <code>--bg: #ffffff</code>, <code>--text: #111111</code> і <code>--accent: #1976d2</code>. <code>body</code> бере з них фон і колір тексту через <code>var(--bg)</code> та <code>var(--text)</code>.",
      "Кнопка <code>.btn</code> має брати фон з <code>var(--accent)</code>. Підказці <code>.note</code> задайте колір <code>var(--muted, #607d8b)</code> із запасним значенням.",
      "У картці <code>.card</code> перевизначте <code>--accent</code> на <code>#d84315</code>: кнопки всередині стануть помаранчевими без нових правил.",
    ],
    markup: `<h1>Змінні</h1>
<p>Одна палітра для всієї сторінки.</p>
<a class="btn">Головна кнопка</a>
<div class="card"><a class="btn">Кнопка в картці</a></div>
<p class="note">Підказка дрібним шрифтом</p>`,
    starter: `/* TODO: змінні в :root, body і .btn через var(), .note із запасним значенням, .card зі своїм --accent */
.btn { padding: 8px 14px; color: #ffffff; }
`,
    checks: [
      { name: "У :root оголошено --bg", source: { matches: ":root\\s*\\{[^}]*--bg\\s*:\\s*#" }, hint: "Напишіть :root { --bg: #ffffff; }" },
      { name: "У :root оголошено --text", source: { matches: ":root\\s*\\{[^}]*--text\\s*:\\s*#" } },
      { name: "У :root оголошено --accent", source: { matches: ":root\\s*\\{[^}]*--accent\\s*:\\s*#" } },
      { name: "body бере фон із var(--bg)", source: { matches: "body\\s*\\{[^}]*background(-color)?\\s*:\\s*var\\(\\s*--bg\\s*\\)" } },
      { name: "body бере колір тексту з var(--text)", source: { matches: "body\\s*\\{[^}]*[^-]color\\s*:\\s*var\\(\\s*--text\\s*\\)" } },
      { name: "Кнопка бере фон із var(--accent)", source: { matches: "\\.btn\\s*\\{[^}]*background(-color)?\\s*:\\s*var\\(\\s*--accent\\s*\\)" } },
      { name: "Підказка: var(--muted, ...) із запасним значенням", source: { matches: "\\.note\\s*\\{[^}]*var\\(\\s*--muted\\s*,\\s*#[0-9a-fA-F]{3,8}\\s*\\)" } },
      { name: "Картка перевизначає --accent", source: { matches: "\\.card\\s*\\{[^}]*--accent\\s*:\\s*#d84315" } },
    ],
  },
  {
    ...base, id: "css-dark-theme", lesson: "css/37", xp: 40,
    title: "Темна тема через змінні",
    context: "Темна тема це друга палітра тих самих змінних. Ви ввімкнете color-scheme, опишете світлі кольори, а темні підставите в медіазапиті prefers-color-scheme: dark й додасте light-dark() для бейджа.",
    brief: [
      "У <code>:root</code> задайте <code>color-scheme: light dark</code>, а також <code>--bg: #ffffff</code> і <code>--text: #111111</code>. <code>body</code> бере їх через <code>var()</code>.",
      "Додайте <code>@media (prefers-color-scheme: dark)</code>, у якому на <code>:root</code> перевизначено <code>--bg: #14181f</code> і <code>--text: #e8eaed</code>.",
      "Бейджу <code>.badge</code> задайте колір через <code>light-dark(#0d47a1, #90caf9)</code>. Тему системи не перемикаємо, тому все перевіряється за кодом.",
    ],
    markup: `<h1>Темна тема</h1>
<p>Сторінка підлаштовується під систему.</p>
<span class="badge">Новинка</span>
<input type="text" value="Поле форми">`,
    starter: `/* TODO: color-scheme і змінні в :root, body через var(), темна тема в @media, .badge з light-dark() */
h1 { margin: 0 0 8px; }
`,
    checks: [
      { name: "У :root є color-scheme: light dark", source: { matches: ":root\\s*\\{[^}]*color-scheme\\s*:\\s*(light\\s+dark|dark\\s+light)\\s*[;}]" } },
      { name: "У :root оголошено --bg і --text", source: { matches: ":root\\s*\\{[^}]*--bg\\s*:[^}]*--text\\s*:|:root\\s*\\{[^}]*--text\\s*:[^}]*--bg\\s*:" } },
      { name: "body бере фон і колір через var()", source: { matches: "body\\s*\\{(?=[^}]*background(-color)?\\s*:\\s*var\\(\\s*--bg\\s*\\))(?=[^}]*[^-]color\\s*:\\s*var\\(\\s*--text\\s*\\))" } },
      { name: "Є медіазапит prefers-color-scheme: dark", source: { matches: "@media\\s*\\(\\s*prefers-color-scheme\\s*:\\s*dark\\s*\\)" } },
      { name: "У темній темі змінено --bg на #14181f", source: { matches: "prefers-color-scheme\\s*:\\s*dark\\s*\\)[\\s\\S]*--bg\\s*:\\s*#14181f" } },
      { name: "У темній темі змінено --text на #e8eaed", source: { matches: "prefers-color-scheme\\s*:\\s*dark\\s*\\)[\\s\\S]*--text\\s*:\\s*#e8eaed" } },
      { name: "Бейдж: light-dark() із двома кольорами", source: { matches: "\\.badge\\s*\\{[^}]*color\\s*:\\s*light-dark\\(\\s*#0d47a1\\s*,\\s*#90caf9\\s*\\)" } },
    ],
  },
  {
    ...base, id: "css-transitions", lesson: "css/38", xp: 40,
    title: "Плавні кнопка, картка й іконка",
    context: "Перехід (transition) пишуть на елементі, а в :hover змінюють значення. Ви зробите кнопку з плавним кольором, картку, що підіймається, й іконку, що повертається при наведенні.",
    brief: [
      "Кнопці <code>.btn</code> задайте <code>transition: background-color 0.3s ease</code>, а в <code>.btn:hover</code> фон має стати <code>#1565c0</code>.",
      "У <code>.btn:hover</code> додайте <code>transform: translateY(-2px)</code>. Для <code>.card</code> задайте <code>transition: transform 0.2s</code>, а в <code>.card:hover</code> <code>transform: scale(1.03)</code>.",
      "Іконка <code>.icon</code> при наведенні повертається: <code>.icon:hover</code> з <code>transform: rotate(45deg)</code>.",
    ],
    markup: `<button class="btn">Купити</button>
<div class="card">Картка товару</div>
<span class="icon">+</span>`,
    starter: `.btn { background: #1976d2; color: #fff; border: 0; padding: 10px 16px; }

/* TODO: transition для .btn і .card, стани :hover, .icon:hover */
`,
    checks: [
      { name: "Кнопка: перехід триває 0.3s", selector: ".btn", style: { "transition-duration": "0.3s" }, hint: "transition: background-color 0.3s ease;" },
      { name: "Кнопка: плавно змінюється фон", source: { matches: "\\.btn\\s*\\{[^}]*transition(-property)?\\s*:[^;}]*(background|all)" } },
      { name: "Кнопка при наведенні: фон #1565c0", source: { matches: "\\.btn:hover\\s*\\{[^}]*background(-color)?\\s*:\\s*#1565c0" } },
      { name: "Кнопка при наведенні підіймається", source: { matches: "\\.btn:hover\\s*\\{[^}]*transform\\s*:\\s*translateY\\(\\s*-2px\\s*\\)" } },
      { name: "Картка: перехід для transform", source: { matches: "\\.card\\s*\\{[^}]*transition(-property)?\\s*:[^;}]*(transform|all)" } },
      { name: "Картка при наведенні збільшується", source: { matches: "\\.card:hover\\s*\\{[^}]*transform\\s*:\\s*scale\\(\\s*1\\.03\\s*\\)" } },
      { name: "Іконка при наведенні повертається", source: { matches: "\\.icon:hover\\s*\\{[^}]*transform\\s*:\\s*rotate\\(\\s*45deg\\s*\\)" } },
    ],
  },
  {
    ...base, id: "css-keyframes", lesson: "css/39", xp: 45,
    title: "Анімації: пульс, спінер і поява",
    context: "Анімація описується кадрами в @keyframes і запускається властивістю animation. Ви зробите пульс, спінер, що крутиться, плавну появу блока й вимкнете рух для людей, яким він заважає.",
    brief: [
      "Опишіть <code>@keyframes pulse</code> (від <code>scale(1)</code> до <code>scale(1.1)</code>) і задайте <code>.pulse</code>: <code>animation: pulse 1.5s ease-in-out infinite</code>.",
      "<code>@keyframes spin</code> обертає до <code>rotate(360deg)</code>. <code>.spinner</code>: <code>animation: spin 1s linear infinite</code>.",
      "<code>@keyframes fade-in</code> піднімає прозорість від <code>0</code> до <code>1</code>. <code>.fade</code>: <code>animation: fade-in 0.6s ease-out both</code>.",
      "У <code>@media (prefers-reduced-motion: reduce)</code> вимкніть анімації: <code>animation: none</code>.",
    ],
    markup: `<span class="pulse">●</span>
<div class="spinner">⟳</div>
<p class="fade">Привіт! Я з'являюся плавно.</p>`,
    starter: `.pulse { color: #d32f2f; }
.spinner { display: inline-block; }

/* TODO: @keyframes pulse, spin, fade-in; animation для .pulse, .spinner і .fade; prefers-reduced-motion */
`,
    checks: [
      { name: "Пульс: animation-name pulse, 1.5s, безкінечно", selector: ".pulse", style: { "animation-name": "pulse", "animation-duration": "1.5s", "animation-iteration-count": "infinite" } },
      { name: "Описано @keyframes pulse із scale", source: { matches: "@keyframes\\s+pulse\\s*\\{[\\s\\S]*?scale\\(" } },
      { name: "Спінер: spin, лінійна крива, безкінечно", selector: ".spinner", style: { "animation-name": "spin", "animation-timing-function": "linear", "animation-iteration-count": "infinite" } },
      { name: "Описано @keyframes spin із rotate(360deg)", source: { matches: "@keyframes\\s+spin\\s*\\{[\\s\\S]*?rotate\\(\\s*360deg\\s*\\)" } },
      { name: "Поява: fade-in із заповненням both", selector: ".fade", style: { "animation-name": "fade-in", "animation-fill-mode": "both" } },
      { name: "Описано @keyframes fade-in з opacity", source: { matches: "@keyframes\\s+fade-in\\s*\\{[\\s\\S]*?opacity\\s*:" } },
      { name: "prefers-reduced-motion вимикає анімації", source: { matches: "@media\\s*\\(\\s*prefers-reduced-motion\\s*:\\s*reduce\\s*\\)[\\s\\S]*animation\\s*:\\s*none" } },
    ],
  },
];
