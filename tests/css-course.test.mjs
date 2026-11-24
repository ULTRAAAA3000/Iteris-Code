// Курс CSS (40 уроків, див. Documentation/html-css-sql-courses.md): структура, норми, приклади коду й завдання.
// Запуск: node tests/css-course.test.mjs   (jsdom, якщо встановлено; інакше реальний Chromium через Playwright)
// Одна глава: CSS_CH=02 node tests/css-course.test.mjs; глава в роботі: CSS_CH=02 CSS_PARTIAL=1 node tests/css-course.test.mjs
// CSS_STRICT=1 вимагає всі глави плану (перед підключенням курсу)
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { CSS_CHAPTERS } from "../content/css/chapters.js";
import { TASKS as OLD_TASKS } from "../content/tasks/index.ts";
import { buildPageDoc } from "../src/runner/page.ts";
import { stripTypeScriptTypes } from "node:module";
import { readFileSync } from "node:fs";
import { isPage } from "../src/tasks/types.ts";


const only = process.env.CSS_CH, partial = !!process.env.CSS_PARTIAL, strict = !!process.env.CSS_STRICT;
const chapters = CSS_CHAPTERS.filter((c) => !only || c.id === only);
assert.ok(chapters.length, "немає такої глави: " + only);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

const root = new URL("../", import.meta.url);
const exists = (p) => existsSync(new URL(p, root));
const loaded = [];
for (const c of chapters) {
  const files = [`content/css/ch${c.id}.js`, `content/tasks/css/ch${c.id}.ts`, `tests/solutions/css-ch${c.id}.mjs`];
  if (!files.every(exists)) {
    assert.ok(!strict && !only, `глава ${c.id}: немає файлів ${files.filter((f) => !exists(f)).join(", ")}`);
    console.log(`(глава ${c.id} «${c.name}» ще не написана, пропуск)`);
    continue;
  }
  loaded.push({
    c,
    lessons: (await import(`../content/css/ch${c.id}.js`))[`LESSONS_${c.id}`],
    tasks: (await import(`../content/tasks/css/ch${c.id}.ts`))[`TASKS_${c.id}`],
    solutions: (await import(`./solutions/css-ch${c.id}.mjs`))[`SOLUTIONS_${c.id}`],
  });
}

/** У текстах уроків і завдань дозволені лише <code>, <b>, <i>, <br>, а символи < > & екрануються */
const badMarkup = (s) => !/^(?:[^<&]|<\/?(?:code|b|i|br)>|&(?:lt|gt|amp|nbsp|quot|mdash|laquo|raquo);)*$/.test(s);

// ---- Приклади коду: баланс дужок, маркери навмисних помилок і фрагментів ----
const MARK = /^\s*\/\*\s*(не працює|фрагмент):/;
const marked = (code) => MARK.test(code);
const isError = (code) => /^\s*\/\*\s*не працює:/.test(code);
function balance(src) {
  const errs = [];
  const x = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, '""');
  let d = 0;
  for (const ch of x) { if (ch === "{") d++; else if (ch === "}") { d--; if (d < 0) { errs.push("зайва закривна дужка }"); d = 0; } } }
  if (d > 0) errs.push(`не закрито ${d} дужок {`);
  let p = 0;
  for (const ch of x) { if (ch === "(") p++; else if (ch === ")") p--; }
  if (p !== 0) errs.push("круглі дужки не збалансовані");
  return errs;
}

await test("balance: перевірка дужок у CSS ловить помилки", async () => {
  assert.deepEqual(balance("a { color: red; } /* } */ b::after { content: \"}\"; }"), []);
  assert.ok(balance("a { color: red;").length > 0);
  assert.ok(balance("a { } }").length > 0);
  assert.ok(balance("a { width: calc(1px + 2px; }").length > 0);
});

// ---- Виконання перевірок: jsdom, якщо є, інакше справжній Chromium ----
let JSDOM = null, browser = null;
try { ({ JSDOM } = await import("jsdom")); } catch {}
let evalSrc = null;
if (!JSDOM) {
  const { chromium } = (await import("node:module")).createRequire(import.meta.url)("playwright");
  browser = await chromium.launch();
  evalSrc = stripTypeScriptTypes(readFileSync(new URL("../src/runner/page.ts", import.meta.url), "utf8"))
    .replace(/^import .*$/gm, "").replace(/export function /g, "function ").replace(/export const /g, "const ");
  console.log("(jsdom не знайдено: перевірки виконуються в Chromium)");
}
const pageCache = new Map();
const run = async (task, code) => {
  if (JSDOM) {
    const { evalPageChecks } = await import("../src/runner/page.ts");
    const dom = new JSDOM(buildPageDoc(task, code));
    return evalPageChecks(task.checks, dom.window.document, dom.window, code);
  }
  const page = await browser.newPage();
  try {
    await page.setContent(buildPageDoc(task, code));
    await page.evaluate(evalSrc + "\nwindow.__ev = evalPageChecks;");
    return await page.evaluate(([checks, src]) => window.__ev(checks, document, window, src), [task.checks, code]);
  } finally { await page.close(); }
};

const seen = new Set();
for (const { c, lessons, tasks, solutions } of loaded) {
  await test(`глава ${c.id} «${c.name}»: уроки відповідають плану й мають змістовну структуру`, async () => {
    if (partial) assert.ok(lessons.length <= c.lessons.length, "уроків більше, ніж у плані");
    else assert.equal(lessons.length, c.lessons.length, `має бути ${c.lessons.length} уроків, є ${lessons.length}`);
    lessons.forEach((l, i) => {
      const o = c.lessons[i], at = `css/${o.n} «${o.t}»`;
      assert.equal(l.t, o.t, `${at}: назва не збігається з планом`);
      assert.equal(l.ch, c.name, `${at}: глава`);
      assert.equal(!!l.adv, o.adv, `${at}: прапорець adv має бути ${o.adv}`);
      assert.ok(Array.isArray(l.p) && l.p.length >= 6, `${at}: потрібно мінімум 6 абзаців теорії`);
      assert.ok(l.p.join("").length >= 1800, `${at}: теорія надто коротка (потрібно від 1800 символів)`);
      assert.ok(Array.isArray(l.code) && l.code.length >= 3 && l.code.every((x) => typeof x === "string" && x.trim()), `${at}: потрібно мінімум 3 приклади коду`);
      for (const k of ["note", "easy", "work"]) assert.ok(typeof l[k] === "string" && l[k].length >= 40, `${at}: поле ${k}`);
      assert.ok(Array.isArray(l.tasks) && l.tasks.length === 2 && l.tasks.every((x) => typeof x === "string" && x.length > 10 && !/[<>]/.test(x)), `${at}: рівно 2 запитання для самоперевірки (звичайний текст)`);
      for (const k of ["easy", "note", "work", ...l.p.map((_, j) => j)]) {
        const s = typeof k === "number" ? l.p[k] : l[k];
        assert.ok(!badMarkup(s), `${at}: недозволена розмітка в тексті «${String(s).slice(0, 60)}…»`);
      }
    });
  });

  await test(`глава ${c.id}: приклади коду мають збалансовані дужки, навмисні помилки позначені маркером`, async () => {
    lessons.forEach((l, i) => {
      const at = `css/${c.lessons[i].n} «${l.t}»`;
      l.code.forEach((code, j) => {
        if (!marked(code) && /^\s*\/\*\s*[а-яіїєґ]+:/i.test(code)) assert.fail(`${at}, приклад ${j + 1}: невідомий маркер`);
        if (marked(code) && !isError(code)) assert.ok(balance(code).length === 0, `${at}, приклад ${j + 1} (фрагмент): ${balance(code).join("; ")}`);
        if (!marked(code)) assert.ok(balance(code).length === 0, `${at}, приклад ${j + 1}: ${balance(code).join("; ")}`);
      });
      assert.ok(l.code.some((x) => !isError(x)), `${at}: потрібен хоч один правильний приклад`);
    });
  });

  await test(`глава ${c.id}: по одному завданню на урок, прив'язка, keep, еталон і норми перевірок`, async () => {
    assert.equal(tasks.length, partial ? lessons.length : c.lessons.length, "по одному завданню на кожен урок глави");
    tasks.forEach((t, i) => {
      const o = c.lessons[i];
      assert.equal(t.lesson, `css/${o.n}`, `завдання ${t.id} має бути прив'язане до css/${o.n}`);
      if (o.keep) assert.equal(t.id, o.keep, `css/${o.n}: збережіть id старого завдання ${o.keep}`);
      else assert.ok(!OLD_TASKS.some((x) => x.id === t.id), `${t.id}: новий урок не повинен забирати id старого завдання`);
      assert.ok(!seen.has(t.id), `повторний id ${t.id}`); seen.add(t.id);
      assert.ok(isPage(t) && t.course === "css" && t.edit === "css" && t.file === "style.css" && t.markup && t.markup.trim(), t.id);
      assert.ok(solutions[t.id], `немає еталона для ${t.id}`);
      assert.ok(t.checks.length >= 3, `${t.id}: потрібно мінімум 3 перевірки`);
      assert.ok(t.checks.every((x) => x.name && (x.selector || x.source)), `${t.id}: кожна перевірка має name і selector або source`);
      assert.ok(t.context.length >= 60 && t.brief.length >= 1 && t.starter.trim(), t.id);
      assert.ok(t.xp >= 15 && t.xp <= 60, `${t.id}: xp`);
      // hint і name виводяться в терміналі як звичайний текст, тому там можна писати теги як є
      for (const s of [t.context, ...t.brief]) assert.ok(!badMarkup(s), `${t.id}: недозволена розмітка «${s.slice(0, 60)}…»`);
    });
    for (const id of Object.keys(solutions)) assert.ok(tasks.some((t) => t.id === id), `еталон ${id} без завдання`);
  });

  for (const t of tasks) {
    await test(`${t.id}: заготовка не проходить усі перевірки, еталон проходить усі ${t.checks.length}`, async () => {
      const s = await run(t, t.starter);
      assert.ok(s.some((r) => !r.passed), "заготовка не повинна проходити всі перевірки");
      const r = await run(t, solutions[t.id]);
      const bad = r.filter((x) => !x.passed);
      assert.deepEqual(bad, [], "еталон не проходить:\n" + bad.map((x) => `- ${x.name}: ${x.error ?? ""}`).join("\n"));
    });
    await test(`${t.id}: кожна перевірка важлива: заготовка не проходить хоча б половину`, async () => {
      const s = await run(t, t.starter);
      const red = s.filter((r) => !r.passed).length;
      assert.ok(red >= Math.ceil(t.checks.length / 2), `заготовка проходить забагато перевірок (червоних ${red} з ${t.checks.length}): завдання надто легке`);
    });
  }
}
await browser?.close();
console.log(`\nУсі тести курсу CSS пройдено: ${passed}`);
