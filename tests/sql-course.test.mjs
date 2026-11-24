// Курс SQL (35 уроків, діалект SQLite, див. Documentation/html-css-sql-courses.md): структура уроків і завдань + справжній запуск
// прикладів з уроків, заготовок і еталонів командою sqlite3 (урок «SQL у програмі» виконується Python).
// Запуск: node tests/sql-course.test.mjs  (потрібні команди sqlite3 і python3; без sqlite3 перевіряється лише структура)
// Одна глава: SQL_CH=02 node tests/sql-course.test.mjs
// Глава в роботі (уроки дописуються поступово): SQL_CH=02 SQL_PARTIAL=1 node tests/sql-course.test.mjs
// Без SQL_CH перевіряються лише глави, чиї файли вже існують; SQL_STRICT=1 вимагає всі глави плану (перед підключенням курсу).
// Маркери в прикладах (перші коментарі блока): «-- помилка: …» (скрипт має дати помилку SQLite), «-- фрагмент: …» (не запускається).
// Приклад мовою Python (урок «SQL у програмі») починається з коментаря «# …» і запускається python3; маркери там так само «# помилка:» і «# фрагмент:».
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalChecks } from "../src/runner/checks.ts";
import { SQL_CHAPTERS } from "../content/sql/chapters.js";
import { isRemote } from "../src/tasks/types.ts";

const only = process.env.SQL_CH, partial = !!process.env.SQL_PARTIAL, strict = !!process.env.SQL_STRICT;
const chapters = SQL_CHAPTERS.filter((c) => !only || c.id === only);
assert.ok(chapters.length, "немає такої глави: " + only);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

const root = new URL("../", import.meta.url);
const exists = (p) => existsSync(new URL(p, root));
const loaded = [];
for (const c of chapters) {
  const files = [`content/sql/ch${c.id}.js`, `content/tasks/sql/ch${c.id}.ts`, `tests/solutions/sql-ch${c.id}.mjs`];
  if (!files.every(exists)) {
    assert.ok(!strict && !only, `глава ${c.id}: немає файлів ${files.filter((f) => !exists(f)).join(", ")}`);
    console.log(`(глава ${c.id} «${c.name}» ще не написана, пропуск)`);
    continue;
  }
  loaded.push({
    c,
    lessons: (await import(`../content/sql/ch${c.id}.js`))[`LESSONS_${c.id}`],
    tasks: (await import(`../content/tasks/sql/ch${c.id}.ts`))[`TASKS_${c.id}`],
    solutions: (await import(`./solutions/sql-ch${c.id}.mjs`))[`SOLUTIONS_${c.id}`],
  });
}

/** Режим прикладу за коментарями `--` на початку блока */
const mode = (code) => {
  const head = code.split("\n").filter((l, i, a) => a.slice(0, i + 1).every((x) => /^\s*(--|#)/.test(x) || !x.trim())).join("\n");
  return /фрагмент/.test(head) ? "fragment" : /помилка/.test(head) ? "error" : "ok";
};
/** У текстових полях дозволені лише теги code, b, i; решту символів < > & треба екранувати */
const badMarkup = (s) => s.replace(/<\/?(code|b|i)>/g, "").replace(/&(lt|gt|amp);/g, "").match(/[<>&]/);
const words = (s) => (s.replace(/<[^>]+>/g, " ").match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;

for (const { c, lessons, tasks, solutions } of loaded) {
  await test(`глава ${c.id} «${c.name}»: уроки відповідають плану й мають змістовну структуру`, () => {
    if (partial) assert.ok(lessons.length <= c.lessons.length, "уроків більше, ніж у плані");
    else assert.equal(lessons.length, c.lessons.length, `має бути ${c.lessons.length} уроків, є ${lessons.length}`);
    lessons.forEach((l, i) => {
      const o = c.lessons[i], at = `sql/${o.n} «${o.t}»`;
      assert.equal(l.t, o.t, `${at}: назва не збігається з планом`);
      assert.equal(l.ch, c.name, `${at}: глава`);
      assert.equal(!!l.adv, o.adv, `${at}: прапорець adv має бути ${o.adv}`);
      assert.ok(Array.isArray(l.p) && l.p.length >= 6 && l.p.length <= 8, `${at}: теорія має бути з 6–7 абзаців (є ${l.p?.length})`);
      assert.ok(l.p.join("").length >= 1800, `${at}: теорія надто коротка (потрібно від 1800 символів, є ${l.p.join("").length})`);
      assert.ok(Array.isArray(l.code) && l.code.length >= 3 && l.code.length <= 5 && l.code.every((x) => typeof x === "string" && x.trim()), `${at}: потрібно 3–5 прикладів коду`);
      const w = (k) => words(l[k]);
      assert.ok(typeof l.easy === "string" && w("easy") >= 20 && w("easy") <= 50, `${at}: easy має бути 20–50 слів (є ${l.easy && w("easy")})`);
      assert.ok(typeof l.note === "string" && w("note") >= 18 && w("note") <= 60, `${at}: note має бути 18–60 слів (є ${l.note && w("note")})`);
      assert.ok(typeof l.work === "string" && w("work") >= 28 && w("work") <= 60, `${at}: work має бути 28–60 слів (є ${l.work && w("work")})`);
      assert.ok(Array.isArray(l.tasks) && l.tasks.length === 2 && l.tasks.every((x) => typeof x === "string" && x.length > 10), `${at}: рівно 2 запитання для самоперевірки`);
      for (const [k, v] of [["easy", l.easy], ["note", l.note], ["work", l.work], ...l.p.map((x, j) => [`p[${j}]`, x]), ...l.tasks.map((x, j) => [`tasks[${j}]`, x])]) {
        assert.ok(!badMarkup(v), `${at}: у полі ${k} недозволена розмітка або неекранований символ < > &: «${badMarkup(v)?.input.slice(Math.max(0, badMarkup(v).index - 20), badMarkup(v).index + 20)}»`);
      }
      const total = words(l.easy) + l.p.reduce((s, x) => s + words(x), 0) + words(l.note) + words(l.work) + l.tasks.reduce((s, x) => s + words(x), 0);
      assert.ok(total >= 450 && total <= 1000, `${at}: ${total} слів теорії, норма 450–950`);
      if (!l.code.some((x) => mode(x) === "error")) console.warn(`попередження: sql/${o.n} «${o.t}» не показує жодної помилки (маркер «-- помилка:»), а там, де в теми є пастки, він потрібен`);
    });
  });

  await test(`глава ${c.id}: по одному завданню на урок, з еталоном і коректними перевірками`, () => {
    assert.equal(tasks.length, partial ? lessons.length : c.lessons.length, "по одному завданню на кожен урок глави");
    tasks.forEach((t, i) => {
      const o = c.lessons[i];
      assert.equal(t.lesson, `sql/${o.n}`, `завдання ${t.id} має бути прив'язане до sql/${o.n}`);
      if (o.keep) assert.equal(t.id, o.keep, `sql/${o.n}: збережіть id старого завдання ${o.keep}`);
      assert.ok(isRemote(t) && t.course === "sql" && (t.lang === "sql" || t.lang === "python"), `${t.id}: завдання курсу sql мовою sql або python`);
      assert.ok(solutions[t.id], `немає еталона для ${t.id}`);
      assert.ok(t.checks.length >= 3, `${t.id}: потрібно мінімум 3 перевірки`);
      assert.ok(t.checks.some((x) => x.on === "stdout"), `${t.id}: потрібна перевірка виводу`);
      assert.ok(t.checks.every((x) => x.hint), `${t.id}: кожна перевірка має hint`);
      assert.ok(t.xp >= 15 && t.xp <= 60 && t.brief.length && t.context && t.title, `${t.id}: xp 15–60, brief, context, title`);
      assert.ok(words(t.context) >= 15 && words(t.context) <= 46, `${t.id}: context має бути 15–46 слів (є ${words(t.context)})`);
      for (const x of t.checks) assert.equal([x.equals, x.has, x.matches].filter((v) => v !== undefined).length, 1, `${t.id}: «${x.name}» має рівно одну умову`);
      for (const x of t.checks) if (t.lang === "sql" && x.on === "stdout" && x.equals !== undefined) assert.fail(`${t.id}: «${x.name}» використовує equals; для SQL перевіряємо вивід через has (режим заголовків)`);
    });
    assert.deepEqual(Object.keys(solutions).sort(), tasks.map((t) => t.id).sort(), "еталони лише для завдань цієї глави");
  });
}

if (!only && strict) {
  await test("план: 35 уроків, з них 5 просунутих, 10 глав, 15 id зі старого курсу збережено", () => {
    const all = SQL_CHAPTERS.flatMap((c) => c.lessons);
    const ids = all.map((l) => l.keep).filter(Boolean);
    assert.equal(all.length, 35);
    assert.equal(all.filter((l) => l.adv).length, 5);
    assert.equal(SQL_CHAPTERS.length, 10);
    assert.equal(ids.length, 15);
    assert.equal(new Set(ids).size, 15);
  });
}

const hasSqlite = spawnSync("sqlite3", ["--version"]).status === 0;
const hasPy = spawnSync("python3", ["--version"]).status === 0;
if (!hasSqlite) {
  console.log("sqlite3 не знайдено: запуск прикладів і еталонів пропущено (встановіть sqlite3, щоб перевіряти їх справжнім рушієм)");
} else {
  const exec = (cmd, args, file, code, input) => new Promise((resolve) => {
    const dir = mkdtempSync(join(tmpdir(), "ic-sql-"));
    writeFileSync(join(dir, file), code);
    const p = spawn(cmd, args, { cwd: dir, env: { ...process.env, PYTHONIOENCODING: "utf-8", LC_ALL: "C.UTF-8" } });
    let stdout = "", stderr = "";
    p.stdout.on("data", (d) => { stdout += d; });
    p.stderr.on("data", (d) => { stderr += d; });
    if (input !== undefined) p.stdin.end(input); else p.stdin.end();
    const timer = setTimeout(() => p.kill("SIGKILL"), 20000);
    p.on("close", (exitCode) => { clearTimeout(timer); rmSync(dir, { recursive: true, force: true }); resolve({ stdout, stderr, exitCode: exitCode ?? 1 }); });
  });
  /** Скрипт SQL виконується на порожній базі в пам'яті, як у пісочниці. Помилка SQLite (Parse error, Runtime error) = помилка скрипта */
  const runSql = async (code) => {
    const r = await exec("sqlite3", [":memory:"], "main.sql", code, code);
    const failed = /(Parse error|Runtime error|Error near line|Error:)/.test(r.stderr);
    return failed ? { stdout: r.stdout, stderr: r.stderr, error: r.stderr } : { stdout: r.stdout, stderr: r.stderr, exitCode: r.exitCode };
  };
  const runPy = async (code) => {
    const r = await exec("python3", ["-B", "main.py"], "main.py", code);
    const syntax = /^\s*(SyntaxError|IndentationError|TabError)\b/m.test(r.stderr);
    return syntax ? { stdout: "", stderr: r.stderr, error: r.stderr } : r;
  };
  const run = (lang, code) => (lang === "python" ? runPy(code) : runSql(code));
  const pool = async (jobs, size = 4) => {
    const out = new Array(jobs.length);
    let next = 0;
    await Promise.all(Array.from({ length: size }, async () => { for (let i = next++; i < jobs.length; i = next++) out[i] = await jobs[i](); }));
    return out;
  };

  const jobs = [];
  for (const { c, lessons, tasks, solutions } of loaded) {
    lessons.forEach((l, i) => l.code.forEach((code, j) => {
      const m = mode(code);
      if (m === "fragment") return;
      const at = `sql/${c.lessons[i].n} приклад ${j + 1}`;
      jobs.push(async () => {
        const py = /^\s*#/.test(code.trimStart());
        if (py && !hasPy) return "";
        const r = py ? await runPy(code) : await runSql(code);
        const failed = r.error || (py && r.exitCode !== 0);
        const bad = m === "error" ? !failed : failed || r.exitCode !== 0;
        return bad ? `${at} (${m}): ${r.error || r.stderr || "очікувалась помилка, а скрипт виконався успішно"}` : "";
      });
    }));
    tasks.forEach((t) => jobs.push(async () => {
      if (t.lang === "python" && !hasPy) return "";
      const starter = await run(t.lang, t.starter);
      const starterResults = starter.error ? [] : evalChecks(t.checks, t.starter, starter);
      if (!(starter.error || starter.exitCode || starterResults.some((r) => !r.passed))) return `${t.id}: заготовка проходить усі перевірки`;
      const solved = await run(t.lang, solutions[t.id]);
      if (solved.error) return `${t.id}: еталон дає помилку:\n${solved.error}`;
      if (solved.exitCode !== 0) return `${t.id}: еталон завершився аварійно:\n${solved.stderr}`;
      if (t.lang === "sql" && solved.stderr.trim()) return `${t.id}: еталон пише в stderr:\n${solved.stderr}`;
      const res = evalChecks(t.checks, solutions[t.id], solved);
      return res.every((r) => r.passed) ? "" : `${t.id}: еталон не проходить перевірки:\n${res.map((r) => `${r.passed ? "+" : "-"} ${r.name} ${r.error ?? ""}`).join("\n")}\nstdout:\n${solved.stdout}`;
    }));
  }
  await test(`SQL: ${jobs.length} прикладів, заготовок і еталонів поводяться як задумано`, async () => {
    const errors = (await pool(jobs)).filter(Boolean);
    assert.equal(errors.length, 0, "\n" + errors.join("\n\n"));
  });
}
{
  const { LESSONS } = await import("../content/lessons.js");
  const { TASKS } = await import("../content/tasks/index.ts");
  const { readFileSync } = await import("node:fs");
  const { SQL_OUTLINE } = await import("../content/sql/chapters.js");
  await test("підключення: LESSONS.sql і TASKS збігаються з планом (35 уроків, 5 просунутих, по завданню на урок)", () => {
    assert.equal(LESSONS.sql.length, SQL_OUTLINE.length);
    LESSONS.sql.forEach((l, i) => { assert.equal(l.t, SQL_OUTLINE[i].t); assert.equal(!!l.adv, !!SQL_OUTLINE[i].adv); assert.equal(l.ch, SQL_OUTLINE[i].ch); });
    assert.equal(LESSONS.sql.filter((l) => l.adv).length, 5);
    const tasks = TASKS.filter((t) => t.course === "sql");
    assert.equal(tasks.length, SQL_OUTLINE.length);
    SQL_OUTLINE.forEach((o, i) => assert.equal(tasks.filter((t) => t.lesson === `sql/${i + 1}`).length, 1, `sql/${i + 1}: рівно одне завдання`));
  });
  await test("підключення: лічильники лендингу в src/data.ts (35 уроків, 30 базових), старих 15 id завдань збережено", () => {
    assert.match(readFileSync(new URL("../src/data.ts", import.meta.url), "utf8"), /sql: \{ lessons: 35, base: 30,/);
    const ids = new Set(TASKS.filter((t) => t.course === "sql").map((t) => t.id));
    for (const id of ["sql-hello", "sql-select-columns"]) assert.ok(ids.has(id), `старе завдання ${id} має лишитися`);
  });
}
console.log(`\nУсі перевірки пройдено: ${passed}`);
