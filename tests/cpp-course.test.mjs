// Курс C++: структура уроків і завдань + справжній запуск прикладів з уроків, заготовок і еталонів компілятором g++ (-std=c++17, як у пісочниці).
// Запуск: node tests/cpp-course.test.mjs  (потрібен g++; без нього перевіряється лише структура)
// Одна глава: CPP_CH=02 node tests/cpp-course.test.mjs
// Глава в роботі (уроки дописуються поступово): CPP_CH=02 CPP_PARTIAL=1 node tests/cpp-course.test.mjs
// Маркери намірених помилок у прикладах (перші рядки-коментарі блока): «// не компілюється: …» (помилка компіляції),
// «// аварія: …» (завершення з помилкою під час виконання: виняток, abort, ненульовий код), «// фрагмент: …» (не запускається: термінал, кілька файлів, C++20).
// Приклади й еталони мають збиратися БЕЗ попереджень (-Wall -Wextra): попередження вважаються помилкою курсу.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalChecks } from "../src/runner/checks.ts";
import { CPP_CHAPTERS } from "../content/cpp/chapters.js";
import { isRemote } from "../src/tasks/types.ts";

const only = process.env.CPP_CH, partial = !!process.env.CPP_PARTIAL;
const chapters = CPP_CHAPTERS.filter((c) => !only || c.id === only);
assert.ok(chapters.length, "немає такої глави: " + only);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

const loaded = await Promise.all(chapters.map(async (c) => ({
  c,
  lessons: (await import(`../content/cpp/ch${c.id}.js`))[`LESSONS_${c.id}`],
  tasks: (await import(`../content/tasks/cpp/ch${c.id}.ts`))[`TASKS_${c.id}`],
  solutions: (await import(`./solutions/cpp-ch${c.id}.mjs`))[`SOLUTIONS_${c.id}`],
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
      const o = (partial && c.lessons.find((x) => x.t === l.t)) || c.lessons[i], at = `cpp/${o.n} «${o.t}»`;
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
      if (!l.code.some((x) => mode(x) === "compile-error" || mode(x) === "crash")) console.warn(`попередження: cpp/${o.n} «${o.t}» не показує жодного збою (маркер «# не компілюється:» або «# аварія:»), а там, де в теми є пастки, він потрібен`);
    });
  });

  await test(`глава ${c.id}: по одному завданню на урок, з еталоном і коректними перевірками`, () => {
    assert.equal(tasks.length, partial ? lessons.length : c.lessons.length, "по одному завданню на кожен урок глави");
    tasks.forEach((t, i) => {
      const o = (partial && c.lessons.find((x) => `cpp/${x.n}` === t.lesson)) || c.lessons[i];
      assert.equal(t.lesson, `cpp/${o.n}`, `завдання ${t.id} має бути прив'язане до cpp/${o.n}`);
      if (o.keep) assert.equal(t.id, o.keep, `cpp/${o.n}: збережіть id старого завдання ${o.keep}`);
      assert.ok(isRemote(t) && t.lang === "cpp" && t.course === "cpp");
      assert.ok(solutions[t.id], `немає еталона для ${t.id}`);
      assert.ok(t.checks.length >= 3, `${t.id}: потрібно мінімум 3 перевірки`);
      assert.ok(t.checks.some((x) => x.on === "stdout"), `${t.id}: потрібна перевірка виводу`);
      assert.ok(t.checks.every((x) => x.hint), `${t.id}: кожна перевірка має hint`);
      assert.ok(t.xp >= 15 && t.xp <= 60 && t.brief.length && t.context && t.title, `${t.id}: xp 15–60, brief, context, title`);
      assert.ok(words(t.context) >= 15 && words(t.context) <= 46, `${t.id}: context має бути 15–46 слів (є ${words(t.context)})`);
      for (const x of t.checks) assert.equal([x.equals, x.has, x.matches].filter((v) => v !== undefined).length, 1, `${t.id}: «${x.name}» має рівно одну умову`);
    });
    assert.deepEqual(Object.keys(solutions).sort(), tasks.map((t) => t.id).sort(), "еталони лише для завдань цієї глави");
  });
}

if (!only) {
  const ids = chapters.flatMap((c) => c.lessons.map((l) => l.keep).filter(Boolean));
  await test("план: 110 уроків, з них 30 просунутих, 10 id зі старого курсу збережено", () => {
    const all = CPP_CHAPTERS.flatMap((c) => c.lessons);
    assert.equal(all.length, 110);
    assert.equal(all.filter((l) => l.adv).length, 30);
    assert.equal(CPP_CHAPTERS.length, 12);
    assert.equal(ids.length, 10);
    assert.equal(new Set(ids).size, 10);
  });
}

const hasGpp = spawnSync("g++", ["--version"]).status === 0;
if (!hasGpp) {
  console.log("g++ не знайдено: запуск прикладів і еталонів пропущено (встановіть g++, щоб перевіряти їх компілятором)");
} else {
  const sh = (cmd, args, cwd, ms) => new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd });
    let stdout = "", stderr = "";
    p.stdout.on("data", (d) => { stdout += d; });
    p.stderr.on("data", (d) => { stderr += d; });
    const timer = setTimeout(() => p.kill("SIGKILL"), ms);
    p.on("close", (code) => { clearTimeout(timer); resolve({ stdout, stderr, code: code ?? 1 }); });
  });
  /** Збирає й запускає програму. strict: попередження компілятора вважаємо помилкою (для прикладів і еталонів) */
  const runCpp = async (code, strict = false) => {
    const dir = mkdtempSync(join(tmpdir(), "ic-cpp-"));
    try {
      writeFileSync(join(dir, "main.cpp"), code);
      const c = await sh("g++", ["-std=c++17", "-O0", ...(strict ? ["-Wall", "-Wextra"] : []), "-pthread", "main.cpp", "-o", "prog"], dir, 90000);
      if (c.code !== 0) return { stdout: "", stderr: c.stderr, error: c.stderr || "збірку перервано" };
      const warn = strict && /warning:/.test(c.stderr) ? c.stderr : "";
      const r = await sh("./prog", [], dir, 20000);
      return { stdout: r.stdout, stderr: r.stderr, exitCode: r.code, warn };
    } finally { rmSync(dir, { recursive: true, force: true }); }
  };
  const pool = async (jobs, size = 2) => {
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
      const at = `cpp/${c.lessons[i].n} приклад ${j + 1}`;
      jobs.push(async () => {
        const r = await runCpp(code, true);
        const bad = m === "compile-error" ? !r.error : m === "crash" ? r.error || r.exitCode === 0 : r.error || r.exitCode !== 0 || r.warn;
        return bad ? `${at} (${m}): ${r.error || r.warn || r.stderr || "очікувалась аварія, а програма завершилась успішно"}` : "";
      });
    }));
    tasks.forEach((t) => jobs.push(async () => {
      const starter = await runCpp(t.starter);
      const starterResults = starter.error ? [] : evalChecks(t.checks, t.starter, starter);
      if (!(starter.error || starter.exitCode || starterResults.some((r) => !r.passed))) return `${t.id}: заготовка проходить усі перевірки`;
      const solved = await runCpp(solutions[t.id], true);
      if (solved.error) return `${t.id}: еталон не компілюється:\n${solved.error}`;
      if (solved.warn) return `${t.id}: еталон дає попередження компілятора:\n${solved.warn}`;
      if (solved.exitCode !== 0) return `${t.id}: еталон завершився аварійно:\n${solved.stderr}`;
      const res = evalChecks(t.checks, solutions[t.id], solved);
      return res.every((r) => r.passed) ? "" : `${t.id}: еталон не проходить перевірки:\n${res.map((r) => `${r.passed ? "+" : "-"} ${r.name} ${r.error ?? ""}`).join("\n")}\nstdout:\n${solved.stdout}`;
    }));
  }
  await test(`C++: ${jobs.length} прикладів, заготовок і еталонів поводяться як задумано`, async () => {
    const errors = (await pool(jobs)).filter(Boolean);
    assert.equal(errors.length, 0, "\n" + errors.join("\n\n"));
  });
}
console.log(`\nУсі перевірки пройдено: ${passed}`);
