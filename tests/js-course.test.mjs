// Курс JavaScript: структура уроків і завдань + справжній запуск прикладів з уроків у Node, а заготовок і еталонів завдань тим самим ядром тестів, що й у браузері (src/runner/core.ts).
// Запуск: node tests/js-course.test.mjs  (Node 22+)
// Одна глава: JS_CH=02 node tests/js-course.test.mjs
// Глава в роботі (уроки дописуються поступово): JS_CH=02 JS_PARTIAL=1 node tests/js-course.test.mjs
// Маркери намірених помилок у прикладах (перший коментар блока): «// не компілюється: …» (SyntaxError), «// аварія: …» (виняток під час виконання),
// «// фрагмент: …» (не запускається: DOM, кілька файлів, команди термінала, API, яких немає в Node).
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runSuite } from "../src/runner/core.ts";
import { JS_CHAPTERS } from "../content/js/chapters.js";

const only = process.env.JS_CH, partial = !!process.env.JS_PARTIAL;
const chapters = JS_CHAPTERS.filter((c) => !only || c.id === only);
assert.ok(chapters.length, "немає такої глави: " + only);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

const loaded = await Promise.all(chapters.map(async (c) => ({
  c,
  lessons: (await import(`../content/js/ch${c.id}.js`))[`LESSONS_${c.id}`],
  tasks: (await import(`../content/tasks/js/ch${c.id}.ts`))[`TASKS_${c.id}`],
  solutions: (await import(`./solutions/js-ch${c.id}.mjs`))[`SOLUTIONS_${c.id}`],
})));

/** Режим прикладу за коментарями на початку блока */
const mode = (code) => {
  const head = code.split("\n").filter((l, i, a) => a.slice(0, i + 1).every((x) => /^\s*\/\//.test(x) || !x.trim())).join("\n");
  return /фрагмент/.test(head) ? "fragment" : /не компілюється/.test(head) ? "compile-error" : /аварія/.test(head) ? "crash" : "ok";
};
/** У текстових полях дозволені лише теги code, b, i; решту символів < > & треба екранувати */
const badMarkup = (s) => s.replace(/<\/?(code|b|i)>/g, "").replace(/&(lt|gt|amp);/g, "").match(/[<>&]/);
const words = (s) => (s.replace(/<[^>]+>/g, " ").match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;

for (const { c, lessons, tasks, solutions } of loaded) {
  await test(`глава ${c.id} «${c.name}»: уроки відповідають плану й мають змістовну структуру`, () => {
    if (partial) assert.ok(lessons.length <= c.lessons.length, "уроків більше, ніж у плані");
    else assert.equal(lessons.length, c.lessons.length, `має бути ${c.lessons.length} уроків, є ${lessons.length}`);
    lessons.forEach((l, i) => {
      const o = c.lessons[i], at = `js/${o.n} «${o.t}»`;
      assert.equal(l.t, o.t, `${at}: назва не збігається з планом`);
      assert.equal(l.ch, c.name, `${at}: глава`);
      assert.equal(!!l.adv, o.adv, `${at}: прапорець adv має бути ${o.adv}`);
      assert.ok(Array.isArray(l.p) && l.p.length >= 6 && l.p.length <= 8, `${at}: теорія має бути з 6–7 абзаців (є ${l.p?.length})`);
      assert.ok(l.p.join("").length >= 1800, `${at}: теорія надто коротка (потрібно від 1800 символів)`);
      assert.ok(Array.isArray(l.code) && l.code.length >= 3 && l.code.length <= 5 && l.code.every((x) => typeof x === "string" && x.trim()), `${at}: потрібно 3–5 прикладів коду`);
      const w = (k) => words(l[k]);
      assert.ok(typeof l.easy === "string" && w("easy") >= 20 && w("easy") <= 50, `${at}: easy має бути 20–50 слів (є ${l.easy && w("easy")})`);
      assert.ok(typeof l.note === "string" && w("note") >= 18 && w("note") <= 60, `${at}: note має бути 18–60 слів (є ${l.note && w("note")})`);
      assert.ok(typeof l.work === "string" && w("work") >= 28 && w("work") <= 60, `${at}: work має бути 28–60 слів (є ${l.work && w("work")})`);
      assert.ok(Array.isArray(l.tasks) && l.tasks.length === 2 && l.tasks.every((x) => typeof x === "string" && x.length > 10), `${at}: рівно 2 завдання для самоперевірки`);
      for (const [k, v] of [["easy", l.easy], ["note", l.note], ["work", l.work], ...l.p.map((x, j) => [`p[${j}]`, x]), ...l.tasks.map((x, j) => [`tasks[${j}]`, x])]) {
        assert.ok(!badMarkup(v), `${at}: у полі ${k} недозволена розмітка або неекранований символ < > &: «${badMarkup(v)?.input.slice(Math.max(0, badMarkup(v).index - 20), badMarkup(v).index + 20)}»`);
      }
      const total = words(l.easy) + l.p.reduce((s, x) => s + words(x), 0) + words(l.note) + words(l.work) + l.tasks.reduce((s, x) => s + words(x), 0);
      assert.ok(total >= 450 && total <= 1000, `${at}: ${total} слів теорії, норма 450–950`);
      if (!l.code.some((x) => mode(x) === "compile-error" || mode(x) === "crash")) console.warn(`попередження: js/${o.n} «${o.t}» не показує жодного збою (маркер «// не компілюється:» або «// аварія:»), а там, де в теми є пастки, він потрібен`);
    });
  });

  await test(`глава ${c.id}: по одному завданню на урок, з еталоном і коректними тестами`, () => {
    assert.equal(tasks.length, partial ? lessons.length : c.lessons.length, "по одному завданню на кожен урок глави");
    tasks.forEach((t, i) => {
      const o = c.lessons[i];
      assert.equal(t.lesson, `js/${o.n}`, `завдання ${t.id} має бути прив'язане до js/${o.n}`);
      if (o.keep) assert.equal(t.id, o.keep, `js/${o.n}: збережіть id старого завдання ${o.keep}`);
      assert.ok(t.course === "js" && !t.runtime && typeof t.tests === "string" && typeof t.starter === "string", `${t.id}: це завдання JS із полями tests і starter`);
      assert.ok(solutions[t.id], `немає еталона для ${t.id}`);
      assert.ok((t.tests.match(/\bit\(/g) ?? []).length >= 3, `${t.id}: потрібно мінімум 3 тести it(...)`);
      assert.ok(!t.tests.includes("`"), `${t.id}: у тестах не має бути зворотних апострофів`);
      assert.ok(t.xp >= 15 && t.xp <= 60 && t.brief.length && t.context && t.title, `${t.id}: xp 15–60, brief, context, title`);
      assert.ok(words(t.context) >= 15 && words(t.context) <= 46, `${t.id}: context має бути 15–46 слів (є ${words(t.context)})`);
      for (const [k, v] of [["context", t.context], ["title", t.title], ...t.brief.map((x, j) => [`brief[${j}]`, x])]) assert.ok(!badMarkup(v), `${t.id}: у полі ${k} недозволена розмітка або неекранований символ < > &`);
    });
    assert.deepEqual(Object.keys(solutions).sort(), tasks.map((t) => t.id).sort(), "еталони лише для завдань цієї глави");
  });
}

if (!only) {
  const ids = chapters.flatMap((c) => c.lessons.map((l) => l.keep).filter(Boolean));
  await test("план: 110 уроків, з них 30 просунутих, id старих завдань збережено", () => {
    const all = JS_CHAPTERS.flatMap((c) => c.lessons);
    assert.equal(all.length, 110);
    assert.equal(all.filter((l) => l.adv).length, 30);
    assert.equal(JS_CHAPTERS.length, 12);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(ids.length, 19);
  });
}

const runNode = (code) => new Promise((resolve) => {
  const dir = mkdtempSync(join(tmpdir(), "ic-js-"));
  writeFileSync(join(dir, "main.mjs"), code);
  const p = spawn(process.execPath, ["--no-warnings", "main.mjs"], { cwd: dir });
  let stdout = "", stderr = "";
  p.stdout.on("data", (d) => { stdout += d; });
  p.stderr.on("data", (d) => { stderr += d; });
  const timer = setTimeout(() => p.kill("SIGKILL"), 15000);
  p.on("close", (exitCode) => {
    clearTimeout(timer);
    rmSync(dir, { recursive: true, force: true });
    // помилка компіляції: SyntaxError без кадрів стека з main.mjs (у SyntaxError від JSON.parse під час виконання такі кадри є)
    const syntax = /^\s*SyntaxError\b/m.test(stderr) && !/^\s+at .*main\.mjs/m.test(stderr);
    resolve(syntax ? { stdout: "", stderr, error: stderr } : { stdout, stderr, exitCode: exitCode ?? 1 });
  });
});
const pool = async (jobs, size = 4) => {
  const out = new Array(jobs.length);
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => { for (let i = next++; i < jobs.length; i = next++) out[i] = await jobs[i](); }));
  return out;
};
const failed = (r) => r.error || r.results.some((x) => !x.passed);

const jobs = [];
for (const { c, lessons, tasks, solutions } of loaded) {
  lessons.forEach((l, i) => l.code.forEach((code, j) => {
    const m = mode(code);
    if (m === "fragment") return;
    const at = `js/${c.lessons[i].n} приклад ${j + 1}`;
    jobs.push(async () => {
      const r = await runNode(code);
      const bad = m === "compile-error" ? !r.error : m === "crash" ? r.error || r.exitCode === 0 : r.error || r.exitCode !== 0;
      return bad ? `${at} (${m}): ${r.error || r.stderr || "очікувалась аварія, а програма завершилась успішно"}` : "";
    });
  }));
  tasks.forEach((t) => jobs.push(async () => {
    const starter = await runSuite(t.starter, t.tests);
    if (!failed(starter)) return `${t.id}: заготовка проходить усі тести`;
    const solved = await runSuite(solutions[t.id], t.tests);
    if (solved.error) return `${t.id}: еталон не виконується: ${solved.error}`;
    if (!solved.results.length) return `${t.id}: у тестах немає жодного it(...)`;
    const bad = solved.results.filter((x) => !x.passed);
    return bad.length ? `${t.id}: еталон не проходить тести:\n${bad.map((x) => `- ${x.name}: ${x.error}`).join("\n")}` : "";
  }));
}
await test(`JavaScript: ${jobs.length} прикладів, заготовок і еталонів поводяться як задумано`, async () => {
  const errors = (await pool(jobs)).filter(Boolean);
  assert.equal(errors.length, 0, "\n" + errors.join("\n\n"));
});
console.log(`\nУсі перевірки пройдено: ${passed}`);
