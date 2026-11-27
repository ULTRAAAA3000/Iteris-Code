// Проєкти за ТЗ: закритий контент (D17). Потрапляє лише в серверний код, браузер отримує проєкт після входу через /api/project.
import type { Project } from "../../src/projects/types.ts";
import type { Task } from "../../src/tasks/types.ts";
import type { ProgramProject as ProgramDraft } from "./program-types.ts";
import { PROJECTS as GO_PROJECTS } from "./go.ts";
import { PROJECTS as PY_PROJECTS } from "./python.ts";
import { PROJECTS as JAVA_PROJECTS } from "./java.ts";
import type { ProgramProject } from "../../src/projects/types.ts";

export type { Project, Requirement } from "../../src/projects/types.ts";

const todoStarter = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Список справ</title>
  <style>
    body { font-family: sans-serif; max-width: 420px; margin: 24px auto; padding: 0 16px; }
    /* TODO: оформіть список і виконані справи */
  </style>
</head>
<body>
  <h1>Список справ</h1>
  <input id="task-input" type="text" placeholder="Нова справа">
  <button id="add-btn">Додати</button>
  <ul id="task-list"></ul>
  <p id="counter">Залишилось: 0</p>
  <script>
    // TODO: додавання справ, позначка «виконано», видалення, лічильник
  </script>
</body>
</html>
`;

// Допоміжні вирази в перевірках: додати справу з текстом й знайти її в списку
const ADD = `type($("#task-input"), TEXT); await click($("#add-btn"));
const li = $$("#task-list li").find((x) => text(x).includes(TEXT));`;
const withText = (t: string, rest: string): string => `const TEXT = ${JSON.stringify(t)};\n${ADD}\n${rest}`;

export const PROJECTS: readonly Project[] = [
  {
    id: "js-todo",
    lesson: "js/97",
    course: "js",
    title: "Проєкт: список справ",
    premium: false,
    xp: 60,
    context:
      "Список справ — найпростіший справжній інтерфейс: у ньому є форма, список, що змінюється, стан елементів і підсумок. На такому прикладі вчать роботу з DOM, подіями й станом, а той самий шаблон потім зустрічається в кошиках, чатах і адмінках.",
    brief: [
      "Замовник просить маленьку сторінку «Список справ» в одному файлі <code>index.html</code>. Розмітка вже є. Вам потрібно написати поведінку (JavaScript) та оформлення (CSS).",
      "Нижче вимоги R1–R8. Натискайте «Перевірити проєкт»: ми запустимо вашу сторінку, виконаємо дії на ній (введемо текст, клікнемо кнопки) й покажемо, які вимоги виконано.",
    ],
    contract: [
      "поле вводу <code>#task-input</code>, кнопка <code>#add-btn</code>, список <code>ul#task-list</code>, абзац <code>#counter</code> (вони вже є у заготовці, не перейменовуйте);",
      "кожна справа це <code>&lt;li&gt;</code> із текстом у <code>&lt;span&gt;</code> та кнопкою <code>&lt;button class=\"del\"&gt;×&lt;/button&gt;</code>;",
      "виконана справа має клас <code>done</code> на <code>&lt;li&gt;</code>;",
      "лічильник має вигляд «Залишилось: N», де N — кількість невиконаних справ.",
    ],
    mockup: `┌────────────────────────────────┐
│ Список справ                   │
│ [ Нова справа ........ ][Додати]│
│ • Купити молоко            [×] │
│ • ~~Полити квіти~~         [×] │
│ Залишилось: 1                  │
└────────────────────────────────┘`,
    requirements: [
      {
        id: "R1",
        text: "На сторінці є поле <code>#task-input</code>, кнопка <code>#add-btn</code>, список <code>ul#task-list</code> і абзац <code>#counter</code>.",
        hint: "Не видаляйте й не перейменовуйте елементи із заготовки: перевірки шукають їх за цими id.",
        check: `const miss = ["#task-input", "#add-btn", "#task-list", "#counter"].filter((s) => !$(s));
if (miss.length) return "Не знайдено: " + miss.join(", ");
return $("#task-list").tagName === "UL" || "#task-list має бути списком ul";`,
      },
      {
        id: "R2",
        text: "Після введення тексту й кліку «Додати» у списку з'являється пункт <code>li</code> з цим текстом.",
        hint: "У обробнику кліку створіть li (document.createElement), покладіть у нього текст справи й додайте у список (append).",
        check: withText("Купити молоко", `return !!li || "Після кліку у списку немає пункту з текстом справи";`),
      },
      {
        id: "R3",
        text: "Після додавання поле вводу очищується.",
        hint: "Після створення пункту присвойте input.value = \"\".",
        check: `type($("#task-input"), "Полити квіти");
await click($("#add-btn"));
return $("#task-input").value === "" || "Поле вводу має очищатися після додавання";`,
      },
      {
        id: "R4",
        text: "Порожня справа (порожній рядок або самі пробіли) не додається.",
        hint: "Перед додаванням обріжте пробіли (trim) і вийдіть із функції, якщо рядок порожній.",
        check: `const before = $$("#task-list li").length;
type($("#task-input"), "Справа для R4");
await click($("#add-btn"));
const n = $$("#task-list li").length;
if (n === before) return "Спершу має працювати додавання (див. R2)";
type($("#task-input"), "   ");
await click($("#add-btn"));
type($("#task-input"), "");
await click($("#add-btn"));
return $$("#task-list li").length === n || "Порожній рядок не має додаватися до списку";`,
      },
      {
        id: "R5",
        text: "Клік по тексту справи додає li клас <code>done</code>, повторний клік знімає його.",
        hint: "Повісьте обробник click на список (делегування подій) і перемикайте li.classList.toggle(\"done\"). Текст справи має бути в span.",
        check: withText("Зробити звіт", `if (!li) return "Справу не додано (див. R2)";
const target = li.querySelector("span") || li;
await click(target);
const on = li.classList.contains("done");
await click(target);
const off = !li.classList.contains("done");
return (on && off) || "Клік має додавати клас done, а повторний клік знімати";`),
      },
      {
        id: "R6",
        text: "Виконана справа виглядає закресленою (CSS <code>text-decoration: line-through</code>).",
        hint: "Додайте в стилі правило для li.done span (або li.done) із text-decoration: line-through.",
        check: withText("Закреслити мене", `if (!li) return "Справу не додано (див. R2)";
const span = li.querySelector("span") || li;
await click(span);
const line = (e) => { const s = getComputedStyle(e); return (s.textDecorationLine || s.textDecoration || ""); };
return /line-through/.test(line(span)) || /line-through/.test(line(li)) || "Виконана справа не закреслена";`),
      },
      {
        id: "R7",
        text: "Кнопка <code>.del</code> біля справи видаляє її зі списку.",
        hint: "У кожного li має бути button із класом del. У обробнику кліку по ньому викличте li.remove().",
        check: withText("Видалити мене", `if (!li) return "Справу не додано (див. R2)";
const del = li.querySelector("button.del");
if (!del) return "У кожної справи має бути кнопка з класом del";
await click(del);
return !$$("#task-list li").some((x) => text(x).includes(TEXT)) || "Після кліку по кнопці del справа має зникати зі списку";`),
      },
      {
        id: "R8",
        text: "Лічильник «Залишилось: N» показує кількість невиконаних справ і оновлюється при додаванні, відмітці й видаленні.",
        hint: "Зробіть функцію update(), що рахує li:not(.done), і викликайте її після кожної зміни списку.",
        check: `const num = () => { const m = text($("#counter")).match(/\\d+/); return m ? +m[0] : NaN; };
const start = num();
if (Number.isNaN(start)) return "У #counter має бути число, наприклад «Залишилось: 0»";
const TEXT = "Лічильник A";
${ADD}
const a = num();
if (!li) return "Справу не додано (див. R2)";
await click(li.querySelector("span") || li);
const b = num();
const del = li.querySelector("button.del");
if (del) await click(del);
const c = num();
return (a === start + 1 && b === start && c === start) || "Очікувалось " + (start + 1) + ", " + start + ", " + start + " (додано, виконано, видалено), отримано " + a + ", " + b + ", " + c;`,
      },
    ],
    starter: todoStarter,
  },
];

/** Проєкти за ТЗ із серверним запуском (Go): з harness, лише для сервера */
export const PROGRAM_PROJECTS: readonly (ProgramProject & { harness: string })[] = ([...PY_PROJECTS, ...JAVA_PROJECTS, ...GO_PROJECTS] as readonly ProgramDraft[]).map((p) => ({ ...p, kind: "program" as const, course: p.lang, premium: false }));
/** Усі проєкти: веб (перевірки в браузері) і програмні (запуск на сервері) */
export const ALL_PROJECTS: readonly (Project | ProgramProject)[] = [...PROJECTS, ...PROGRAM_PROJECTS];
export const projectById = (id: string): Project | (ProgramProject & { harness: string }) | undefined => PROJECTS.find((p) => p.id === id) ?? PROGRAM_PROJECTS.find((p) => p.id === id);
export const programProjectById = (id: string) => PROGRAM_PROJECTS.find((p) => p.id === id);
export const projectForLesson = (lessonId: string): Project | ProgramProject | undefined => ALL_PROJECTS.find((p) => p.lesson === lessonId);

/** Усе, за що нараховується XP як за практику: завдання з тестами й проєкти за ТЗ */
export type Practice = Pick<Task, "id" | "lesson" | "course" | "title" | "premium" | "xp">;
// practiceById (завдання або проєкт) живе у lib/practice.ts
