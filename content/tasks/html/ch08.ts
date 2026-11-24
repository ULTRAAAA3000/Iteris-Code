// Завдання курсу HTML, глава 08 «Практика» (урок 30). Виконуються в браузері (runtime: "page"), еталони: tests/solutions/html-ch08.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "html", runtime: "page", edit: "html", file: "index.html", editorLang: "html", premium: false } as const;

export const TASKS_08: readonly PageTask[] = [
  {
    ...base, id: "html-portfolio", lesson: "html/30", xp: 40,
    title: "Сторінка-портфоліо",
    context: "Підсумкове завдання: складіть повну сторінку з усього курсу. Скелет, семантичні блоки, навігація якорями, зображення з alt, форма зв'язку й підвал.",
    brief: [
      "Створіть сторінку-портфоліо: <code>header</code> з <code>h1</code> (ваше ім'я) і <code>nav</code> із трьома якірними посиланнями <code>#about</code>, <code>#projects</code>, <code>#contact</code>.",
      "У <code>main</code> три розділи <code>section</code> з відповідними <code>id</code>: «Про мене» (абзац і фото з <code>alt</code>), «Проєкти» (три <code>article</code> із заголовками <code>h3</code>) і «Контакти» (форма з email та кнопкою). Додайте <code>footer</code>, мову, кодування, <code>title</code> і <code>viewport</code>.",
    ],
    starter: `<!DOCTYPE html>
<html>
<head></head>
<body>
  <h1>Моє портфоліо</h1>
</body>
</html>
`,
    checks: [
      { name: "Мова, кодування і заголовок вкладки", selector: "html[lang] > head > meta[charset] ~ title" },
      { name: "Мета-тег viewport", selector: "meta[name=\"viewport\"]" },
      { name: "Шапка з заголовком h1", selector: "header h1" },
      { name: "Навігація з якорями #about, #projects, #contact", selector: "nav a[href=\"#about\"], nav a[href=\"#projects\"], nav a[href=\"#contact\"]", count: 3 },
      { name: "Три розділи з відповідними id", selector: "main > section#about, main > section#projects, main > section#contact", count: 3 },
      { name: "Фото з alt у розділі «Про мене»", selector: "#about img[alt]", attr: { name: "alt", matches: ".+" } },
      { name: "Три проєкти: article із h3", selector: "#projects article h3", count: 3 },
      { name: "Форма контактів з email і кнопкою", selector: "#contact form input[type=\"email\"], #contact form button", count: { min: 2 } },
      { name: "Підвал", selector: "footer" },
    ],
  },
];
