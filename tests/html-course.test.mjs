// Курс HTML (розширений до 30 уроків, див. Documentation/html-css-sql-courses.md): структура, норми, приклади коду й завдання.
// Запуск: npm i --no-save jsdom && node tests/html-course.test.mjs
// Одна глава: HTML_CH=02 node tests/html-course.test.mjs
// Глава в роботі (уроки дописуються поступово): HTML_CH=02 HTML_PARTIAL=1 node tests/html-course.test.mjs
// Без HTML_CH перевіряються лише глави, чиї файли вже існують; HTML_STRICT=1 вимагає всі глави плану (перед підключенням курсу).
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { HTML_CHAPTERS } from "../content/html/chapters.js";
import { buildPageDoc, evalPageChecks } from "../src/runner/page.ts";
import { isPage } from "../src/tasks/types.ts";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }

/** id завдань старого курсу з 12 уроків: нові уроки не повинні займати їх без keep */
const OLD_IDS = new Set(["html-skeleton", "html-headings-lists", "html-text-format", "html-media", "html-table-form", "html-form-fields", "html-semantic", "html-a11y", "html-seo-meta", "html-project-paths", "html-portfolio"]);
const only = process.env.HTML_CH, partial = !!process.env.HTML_PARTIAL, strict = !!process.env.HTML_STRICT;
const chapters = HTML_CHAPTERS.filter((c) => !only || c.id === only);
assert.ok(chapters.length, "немає такої глави: " + only);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

const root = new URL("../", import.meta.url);
const exists = (p) => existsSync(new URL(p, root));
const loaded = [];
for (const c of chapters) {
  const files = [`content/html/ch${c.id}.js`, `content/tasks/html/ch${c.id}.ts`, `tests/solutions/html-ch${c.id}.mjs`];
  if (!files.every(exists)) {
    assert.ok(!strict && !only, `глава ${c.id}: немає файлів ${files.filter((f) => !exists(f)).join(", ")}`);
    console.log(`(глава ${c.id} «${c.name}» ще не написана, пропуск)`);
    continue;
  }
  loaded.push({
    c,
    lessons: (await import(`../content/html/ch${c.id}.js`))[`LESSONS_${c.id}`],
    tasks: (await import(`../content/tasks/html/ch${c.id}.ts`))[`TASKS_${c.id}`],
    solutions: (await import(`./solutions/html-ch${c.id}.mjs`))[`SOLUTIONS_${c.id}`],
  });
}

/** У текстах уроків і завдань дозволені лише <code>, <b>, <i>, <br>, а символи < > & екрануються */
const badMarkup = (s) => !/^(?:[^<&]|<\/?(?:code|b|i|br)>|&(?:lt|gt|amp|nbsp|quot|mdash|laquo|raquo);)*$/.test(s);

// ---- Перевірка балансу тегів у прикладах коду ----
const VOID = new Set("area base br col embed hr img input link meta source track wbr".split(" "));
const OPTIONAL_END = new Set("p li dt dd tr td th thead tbody tfoot option optgroup colgroup html head body".split(" "));
const RAW = new Set(["script", "style", "textarea"]);
function balance(src) {
  const errs = [], stack = [];
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/gi;
  let m;
  while ((m = re.exec(src))) {
    if (!m[2]) continue;
    const name = m[2].toLowerCase();
    if (m[1] === "") {
      if (VOID.has(name) || /\/\s*$/.test(m[3])) continue;
      if (RAW.has(name)) {
        const end = src.toLowerCase().indexOf("</" + name, re.lastIndex);
        if (end === -1) { errs.push(`не закрито <${name}>`); break; }
        re.lastIndex = src.indexOf(">", end) + 1;
        continue;
      }
      stack.push(name);
    } else {
      if (VOID.has(name)) { errs.push(`закривальний тег для порожнього елемента </${name}>`); continue; }
      const at = stack.lastIndexOf(name);
      if (at === -1) { errs.push(`зайвий закривальний тег </${name}>`); continue; }
      for (let i = stack.length - 1; i > at; i--) {
        if (!OPTIONAL_END.has(stack[i])) errs.push(`<${stack[i]}> не закрито перед </${name}>`);
      }
      stack.length = at;
    }
  }
  for (const n of stack) if (!OPTIONAL_END.has(n)) errs.push(`не закрито <${n}>`);
  return errs;
}
const marked = (code) => /^\s*<!--\s*(?:не валідний|фрагмент):/.test(code);
const isError = (code) => /^\s*<!--\s*не валідний:/.test(code);

await test("balance: перевірка балансу тегів ловить помилки й не лякається необов'язкових закриттів", () => {
  assert.deepEqual(balance("<ul><li>a<li>b</ul>"), []);
  assert.deepEqual(balance('<p>Привіт<br><img src="a.png" alt=""></p>'), []);
  assert.deepEqual(balance("<script>if (a < b) { x = '</p>'; }</script><p>ok</p>"), []);
  assert.ok(balance("<b><i>x</b></i>").length > 0);
  assert.ok(balance("<div><p>x</div>").length === 0, "p має необов'язкове закриття");
  assert.ok(balance("<div><span>x</div>").length > 0);
  assert.ok(balance("<p>x</p></div>").length > 0);
  assert.ok(balance("<br></br>").length > 0);
  assert.deepEqual(balance("<!-- <b> у коментарі --><p>x</p>"), []);
});

const run = (task, code) => {
  const dom = new JSDOM(buildPageDoc(task, code));
  return evalPageChecks(task.checks, dom.window.document, dom.window, code);
};

const seen = new Set();
for (const { c, lessons, tasks, solutions } of loaded) {
  await test(`глава ${c.id} «${c.name}»: уроки відповідають плану й мають змістовну структуру`, () => {
    if (partial) assert.ok(lessons.length <= c.lessons.length, "уроків більше, ніж у плані");
    else assert.equal(lessons.length, c.lessons.length, `має бути ${c.lessons.length} уроків, є ${lessons.length}`);
    lessons.forEach((l, i) => {
      const o = c.lessons[i], at = `html/${o.n} «${o.t}»`;
      assert.equal(l.t, o.t, `${at}: назва не збігається з планом`);
      assert.equal(l.ch, c.name, `${at}: глава`);
      assert.equal(!!l.adv, o.adv, `${at}: прапорець adv має бути ${o.adv}`);
      assert.ok(Array.isArray(l.p) && l.p.length >= 5, `${at}: потрібно мінімум 5 абзаців теорії`);
      assert.ok(l.p.join("").length >= 1800, `${at}: теорія надто коротка (потрібно від 1800 символів)`);
      assert.ok(Array.isArray(l.code) && l.code.length >= 2 && l.code.every((x) => typeof x === "string" && x.trim()), `${at}: потрібно мінімум 2 приклади коду`);
      for (const k of ["note", "easy", "work"]) assert.ok(typeof l[k] === "string" && l[k].length >= 40, `${at}: поле ${k}`);
      assert.ok(Array.isArray(l.tasks) && l.tasks.length === 2 && l.tasks.every((x) => typeof x === "string" && x.length > 10 && !/[<>]/.test(x)), `${at}: рівно 2 запитання для самоперевірки (звичайний текст)`);
      for (const k of ["easy", "note", "work", ...l.p.map((_, j) => j)]) {
        const s = typeof k === "number" ? l.p[k] : l[k];
        assert.ok(!badMarkup(s), `${at}: недозволена розмітка в тексті «${String(s).slice(0, 60)}…»`);
      }
    });
  });

  await test(`глава ${c.id}: приклади коду мають збалансовані теги, навмисні помилки позначені маркером`, () => {
    lessons.forEach((l, i) => {
      const at = `html/${c.lessons[i].n} «${l.t}»`;
      l.code.forEach((code, j) => {
        if (!marked(code) && /^\s*<!--/.test(code)) assert.fail(`${at}, приклад ${j + 1}: невідомий маркер`);
        if (marked(code) && !isError(code)) assert.ok(balance(code).length === 0, `${at}, приклад ${j + 1} (фрагмент): ${balance(code).join("; ")}`);
        if (!marked(code)) assert.ok(balance(code).length === 0, `${at}, приклад ${j + 1}: ${balance(code).join("; ")}`);
      });
      assert.ok(l.code.some((x) => !isError(x)), `${at}: потрібен хоч один правильний приклад`);
    });
  });

  await test(`глава ${c.id}: по одному завданню на урок, прив'язка, keep, еталон і норми перевірок`, () => {
    assert.equal(tasks.length, partial ? lessons.length : c.lessons.length, "по одному завданню на кожен урок глави");
    tasks.forEach((t, i) => {
      const o = c.lessons[i];
      assert.equal(t.lesson, `html/${o.n}`, `завдання ${t.id} має бути прив'язане до html/${o.n}`);
      if (o.keep) assert.equal(t.id, o.keep, `html/${o.n}: збережіть id старого завдання ${o.keep}`);
      else assert.ok(!OLD_IDS.has(t.id), `${t.id}: новий урок не повинен забирати id старого завдання`);
      assert.ok(!seen.has(t.id), `повторний id ${t.id}`); seen.add(t.id);
      assert.ok(isPage(t) && t.course === "html" && t.edit === "html" && t.file === "index.html", t.id);
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
    await test(`${t.id}: заготовка не проходить усі перевірки, еталон проходить усі ${t.checks.length}`, () => {
      const s = run(t, t.starter);
      assert.ok(s.some((r) => !r.passed), "заготовка не повинна проходити всі перевірки");
      const r = run(t, solutions[t.id]);
      const bad = r.filter((x) => !x.passed);
      assert.deepEqual(bad, [], "еталон не проходить:\n" + bad.map((x) => `- ${x.name}: ${x.error ?? ""}`).join("\n"));
    });
    await test(`${t.id}: кожна перевірка важлива: заготовка не проходить хоча б половину`, () => {
      const s = run(t, t.starter);
      const red = s.filter((r) => !r.passed).length;
      assert.ok(red >= Math.ceil(t.checks.length / 2), `заготовка проходить забагато перевірок (червоних ${red} з ${t.checks.length}): завдання надто легке`);
    });
  }
}

// ---- Підключення до сайту: курс у LESSONS, завдання в TASKS, лічильники на лендингу ----
if (!only && loaded.length === HTML_CHAPTERS.length) {
  const { LESSONS } = await import("../content/lessons.js");
  const { TASKS } = await import("../content/tasks/index.ts");
  const { readFileSync } = await import("node:fs");
  const { HTML_OUTLINE } = await import("../content/html/chapters.js");
  await test("підключення: LESSONS.html і TASKS збігаються з планом (30 уроків, 7 просунутих, по завданню на урок)", () => {
    assert.equal(LESSONS.html.length, HTML_OUTLINE.length);
    LESSONS.html.forEach((l, i) => { assert.equal(l.t, HTML_OUTLINE[i].t); assert.equal(!!l.adv, HTML_OUTLINE[i].adv); });
    assert.equal(LESSONS.html.filter((l) => l.adv).length, 7);
    const tasks = TASKS.filter((t) => t.course === "html");
    assert.equal(tasks.length, HTML_OUTLINE.length);
    HTML_OUTLINE.forEach((o) => assert.equal(tasks.filter((t) => t.lesson === `html/${o.n}`).length, 1, `html/${o.n}: рівно одне завдання`));
  });
  await test("підключення: лічильники лендингу в src/data.ts (30 уроків, 23 базових)", () => {
    const data = readFileSync(new URL("../src/data.ts", import.meta.url), "utf8");
    assert.match(data, /html: \{ lessons: 30, base: 23,/);
  });
}
console.log(`\nУсі тести курсу HTML пройдено: ${passed}`);
