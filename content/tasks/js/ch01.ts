import type { JsTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_01: readonly JsTask[] = [
  {
    ...base, id: "js-hello-default", lesson: "js/1", xp: 15,
    title: "Привітання зі значенням за замовчуванням",
    context: "Перша функція, яку пише кожен: приймає ім'я й повертає привітання. Значення за замовчуванням рятує, коли ім'я не передали: замість «Привіт, undefined!» буде нормальний текст.",
    brief: [
      "Напишіть функцію <code>hello(name)</code>, що повертає рядок <code>Привіт, &lt;name&gt;!</code>.",
      "Якщо ім'я не передали, використайте <code>світе</code>: <code>hello()</code> дає <code>Привіт, світе!</code>. Підказка: параметр за замовчуванням <code>name = \"світе\"</code>.",
    ],
    starter: raw`function hello(name) {
  return "Привіт!";
}
`,
    tests: raw`describe("hello", () => {
  it("вітає за іменем", () => {
    expect(hello("Оля")).toBe("Привіт, Оля!");
  });
  it("без імені: світе", () => {
    expect(hello()).toBe("Привіт, світе!");
  });
  it("порожній рядок це теж ім'я", () => {
    expect(hello("")).toBe("Привіт, !");
  });
  it("інше ім'я", () => {
    expect(hello("Іван")).toBe("Привіт, Іван!");
  });
});`,
  },
  {
    ...base, id: "js-join-log", lesson: "js/2", xp: 15,
    title: "Свій console.log: склеювання аргументів",
    context: "console.log приймає скільки завгодно значень і друкує їх через пробіл. Схожу склейку пишуть, коли формують рядок для журналу чи повідомлення про помилку з частин різного типу.",
    brief: [
      "Напишіть функцію <code>joinLog(...parts)</code>, яка повертає один рядок: усі аргументи, перетворені на текст і розділені одним пробілом. Без аргументів результат порожній рядок.",
      "<code>null</code> і <code>undefined</code> мають стати словами <code>null</code> і <code>undefined</code>, як у справжньому <code>console.log</code>. Підказка: <code>String(значення)</code> перетворює будь-що на рядок.",
    ],
    starter: raw`function joinLog(...parts) {
  return parts.join(",");
}
`,
    tests: raw`describe("joinLog", () => {
  it("склеює рядки через пробіл", () => {
    expect(joinLog("Привіт,", "світе")).toBe("Привіт, світе");
  });
  it("числа й булеві значення стають текстом", () => {
    expect(joinLog("Сума:", 2 + 3)).toBe("Сума: 5");
    expect(joinLog("Готово:", true)).toBe("Готово: true");
  });
  it("один аргумент", () => {
    expect(joinLog("лише так")).toBe("лише так");
    expect(joinLog(42)).toBe("42");
  });
  it("без аргументів: порожній рядок", () => {
    expect(joinLog()).toBe("");
  });
  it("null і undefined теж стають текстом", () => {
    expect(joinLog(null, undefined)).toBe("null undefined");
  });
});`,
  },
  {
    ...base, id: "js-parse-import", lesson: "js/3", xp: 20,
    title: "Розбір рядка import",
    context: "Збирачі проєктів і лінтери читають рядки import, щоб побудувати граф залежностей. Розібрати один такий рядок самому означає по-справжньому зрозуміти, з чого складається імпорт.",
    brief: [
      "Напишіть <code>parseImport(line)</code> для рядків виду <code>import { a, b } from \"./m.js\";</code>. Функція повертає об'єкт <code>{ source, names }</code>: <code>source</code> це шлях модуля, <code>names</code> це масив імен, які беруть із модуля.",
      "Для <code>import { sum as add } from \"./m.js\"</code> в <code>names</code> потрапляє початкове ім'я <code>sum</code>. Лапки можуть бути одинарні або подвійні, крапка з комою необов'язкова. Усе, що не є іменованим імпортом (наприклад, <code>import * as x</code>), дає <code>null</code>.",
    ],
    starter: raw`function parseImport(line) {
  // Підказка: регулярний вираз /^import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/
  return null;
}
`,
    tests: raw`describe("parseImport", () => {
  it("кілька імен", () => {
    expect(parseImport('import { sum, mul } from "./math.js";')).toEqual({ source: "./math.js", names: ["sum", "mul"] });
  });
  it("одне ім'я й одинарні лапки без крапки з комою", () => {
    expect(parseImport("import { basename } from 'node:path'")).toEqual({ source: "node:path", names: ["basename"] });
  });
  it("as: береться початкове ім'я", () => {
    expect(parseImport('import { sum as add, mul } from "./m.js";')).toEqual({ source: "./m.js", names: ["sum", "mul"] });
  });
  it("зайві пробіли", () => {
    expect(parseImport('  import {  a ,b  }   from   "./x.js" ;  ')).toEqual({ source: "./x.js", names: ["a", "b"] });
  });
  it("інші види імпорту й не import дають null", () => {
    expect(parseImport('import * as m from "./m.js";')).toBe(null);
    expect(parseImport('import def from "./m.js";')).toBe(null);
    expect(parseImport("const a = 1;")).toBe(null);
  });
});`,
  },
  {
    ...base, id: "js-parse-stack", lesson: "js/4", xp: 20,
    title: "Розбір рядка стека викликів",
    context: "Системи моніторингу помилок розбирають стек викликів на частини, щоб показати розробникові файл і рядок, де все зламалося. Спробуйте зробити це для одного рядка самі.",
    brief: [
      "Напишіть <code>parseStackLine(line)</code> для рядків стека Node. Для <code>\"    at calc (/app/src/math.js:12:7)\"</code> результат <code>{ fn: \"calc\", file: \"/app/src/math.js\", line: 12, col: 7 }</code>, де номери це числа.",
      "Якщо в рядку немає імені функції (<code>\"at /app/index.js:3:1\"</code>), то <code>fn</code> дорівнює <code>null</code>. Рядок, що не схожий на запис стека, дає <code>null</code>.",
    ],
    starter: raw`function parseStackLine(line) {
  // Підказка: /^\s*at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?\s*$/
  return null;
}
`,
    tests: raw`describe("parseStackLine", () => {
  it("рядок з ім'ям функції", () => {
    expect(parseStackLine("    at calc (/app/src/math.js:12:7)")).toEqual({ fn: "calc", file: "/app/src/math.js", line: 12, col: 7 });
  });
  it("рядок без імені функції", () => {
    expect(parseStackLine("    at /app/index.js:3:1")).toEqual({ fn: null, file: "/app/index.js", line: 3, col: 1 });
  });
  it("шлях Windows з двокрапкою", () => {
    expect(parseStackLine("at run (C:\\app\\main.js:5:12)")).toEqual({ fn: "run", file: "C:\\app\\main.js", line: 5, col: 12 });
  });
  it("номери рядка й символу це числа", () => {
    const r = parseStackLine("at f (a.js:10:20)");
    expect(typeof r.line).toBe("number");
    expect(typeof r.col).toBe("number");
  });
  it("не стек: null", () => {
    expect(parseStackLine("TypeError: x is not a function")).toBe(null);
    expect(parseStackLine("")).toBe(null);
  });
});`,
  },
];
