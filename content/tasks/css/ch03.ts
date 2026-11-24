// Завдання курсу CSS, глава 03 «Каскад» (уроки 10–12). Розмітка готова (markup), користувач пише лише style.css. Еталони: tests/solutions/css-ch03.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "css", runtime: "page", edit: "css", file: "style.css", editorLang: "css", premium: false } as const;

export const TASKS_03: readonly PageTask[] = [
  {
    ...base, id: "css-cascade", lesson: "css/10", xp: 15,
    title: "Порядок правил: хто пізніше, той і виграє",
    context: "Коли два правила мають однакову вагу, перемагає те, що записане пізніше. Помилки порядку це половина випадків «чому мій стиль не працює», тому вмійте керувати ним без зайвих селекторів.",
    brief: [
      "У заготовці абзац <code>.warn</code> лишається синім, бо правило <code>.note</code> записане нижче й перекриває його. Змініть <b>порядок</b> правил так, щоб <code>.warn</code> став червоним <code>#c62828</code>, а решта абзаців <code>.note</code> лишилися синіми.",
      "Додайте для <code>.note</code> розмір шрифту <code>20px</code>. Заголовку <code>h1</code> задайте колір <code>#2e7d32</code> окремим правилом <b>нижче</b> за наявне, без <code>!important</code>.",
    ],
    markup: `<h1>Привіт, CSS</h1>
<p class="note">Звичайна нотатка</p>
<p class="note warn">Попередження</p>`,
    starter: `h1 { color: #1565c0; }

.warn { color: #c62828; }
.note { color: #1565c0; }

/* TODO 1: поміняйте порядок .warn і .note, щоб попередження стало червоним */

/* TODO 2: .note: розмір шрифту 20px */

/* TODO 3: нове правило h1 нижче за наявне: колір #2e7d32 */
`,
    checks: [
      { name: "Попередження .warn червоне (#c62828)", selector: ".note.warn", style: { color: "#c62828" }, hint: "Обидва селектори мають однакову вагу: правило .warn має стояти нижче за .note." },
      { name: "Звичайна нотатка лишилась синьою (#1565c0)", selector: ".note:not(.warn)", style: { color: "#1565c0" } },
      { name: "Нотатки мають розмір шрифту 20px", selector: ".note", style: { "font-size": "20px" } },
      { name: "Заголовок h1 зелений (#2e7d32)", selector: "h1", style: { color: "#2e7d32" } },
      { name: "Без !important", source: { has: "!important" }, not: true, hint: "Достатньо порядку правил." },
    ],
  },
  {
    ...base, id: "css-specificity", lesson: "css/11", xp: 20,
    title: "Специфічність: id, класи й теги",
    context: "Селектор з id сильніший за клас, а клас сильніший за тег, незалежно від порядку. Навчіться перемагати точним селектором, а не силою, адже !important швидко перетворює файл на хаос.",
    brief: [
      "У заготовці заголовок <code>#title</code> лишається червоним, бо <code>.big</code> специфічніше за <code>h1</code>. Зробіть його зеленим <code>#2e7d32</code> правилом із селектором <code>#title</code>, <b>без</b> <code>!important</code>.",
      "Абзац <code>.lead</code> усередині <code>.card</code> має бути кольору <code>#6a1b9a</code>. Селектор має бути сильнішим за <code>.card p</code>, але без id. Другий абзац лишається сірим.",
    ],
    markup: `<h1 id="title" class="big">Привіт, CSS</h1>
<div class="card">
  <p class="lead">Головний абзац</p>
  <p>Другий абзац</p>
</div>`,
    starter: `h1 { color: #1565c0; }
.big { color: #c62828; }
.card p { color: #424242; }

/* TODO 1: #title зелений (#2e7d32) без !important */

/* TODO 2: .lead усередині .card: колір #6a1b9a (селектор сильніший за .card p) */
`,
    checks: [
      { name: "Заголовок #title зелений (#2e7d32)", selector: "#title", style: { color: "#2e7d32" } },
      { name: "Абзац .lead фіолетовий (#6a1b9a)", selector: ".card .lead", style: { color: "#6a1b9a" }, hint: "Спробуйте селектор .card p.lead: у ньому два класи й тег." },
      { name: "Другий абзац лишився сірим (#424242)", selector: ".card p:not(.lead)", style: { color: "#424242" } },
      { name: "Правило з селектором #title є в коді", source: { matches: "#title\\s*\\{" } },
      { name: "Без !important", source: { has: "!important" }, not: true, hint: "Використайте специфічніший селектор, а не !important." },
    ],
  },
  {
    ...base, id: "css-inherit-layers", lesson: "css/12", xp: 30,
    title: "Успадкування й шари каскаду",
    context: "Колір і шрифт достатньо задати один раз на body, а складні конфлікти селекторів зручно вирішувати шарами @layer, не вдаючись до !important. Поєднаємо обидва прийоми в одній сторінці.",
    brief: [
      "Для <code>body</code> задайте колір <code>#263238</code> і розмір шрифту <code>18px</code>: абзац має успадкувати обидва значення, тож самому <code>p</code> нічого не пишіть. Посилання <code>a</code> змусьте взяти колір батька через <code>color: inherit</code>.",
      "Оголосіть порядок шарів рядком <code>@layer base, theme;</code>. У шарі <code>base</code> запишіть <code>button.btn</code> із фоном <code>#1565c0</code>, а в шарі <code>theme</code> правило <code>.btn</code> із фоном <code>#2e7d32</code>. Без <code>!important</code>.",
    ],
    markup: `<article class="post">
  <h2>Огляд</h2>
  <p>Цей абзац має успадкувати колір і розмір від body.</p>
  <p><a href="#">Читати далі</a></p>
  <button class="btn">Підписатись</button>
</article>`,
    starter: `/* TODO 1: body: колір #263238 і розмір шрифту 18px */

/* TODO 2: a: колір inherit (бере колір батька) */

/* TODO 3: оголосіть порядок шарів: base, потім theme */

/* TODO 4: у шарі base: button.btn із фоном #1565c0 */

/* TODO 5: у шарі theme: .btn із фоном #2e7d32 */
`,
    checks: [
      { name: "Абзац успадкував колір #263238", selector: "article p", style: { color: "#263238" }, hint: "Задайте color на body, а не на p." },
      { name: "Абзац успадкував розмір шрифту 18px", selector: "article p", style: { "font-size": "18px" } },
      { name: "Посилання має колір батька (#263238)", selector: "article a", style: { color: "#263238" }, hint: "a { color: inherit; }" },
      { name: "Порядок шарів оголошено: base, потім theme", source: { matches: "@layer\\s+base\\s*,\\s*theme\\s*;" } },
      { name: "Правила розкладено по шарах base і theme", source: { matches: "@layer\\s+base\\s*\\{[\\s\\S]*@layer\\s+theme\\s*\\{" } },
      { name: "Кнопка зелена (#2e7d32): шар theme сильніший за base", selector: "button.btn", style: { "background-color": "#2e7d32" }, hint: "Пізніший шар виграє незалежно від специфічності." },
      { name: "Без !important", source: { has: "!important" }, not: true },
    ],
  },
];
