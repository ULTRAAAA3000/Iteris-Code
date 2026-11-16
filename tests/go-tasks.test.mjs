// Курс Go: структура уроків і завдань + справжній запуск прикладів з уроків, заготовок і еталонів компілятором Go.
// Запуск: node tests/go-tasks.test.mjs  (потрібна команда go; без неї перевіряється лише структура)
// Одна глава: GO_CH=05 node tests/go-tasks.test.mjs
// Глава в роботі (уроки дописуються поступово): GO_CH=05 GO_PARTIAL=1 node tests/go-tasks.test.mjs
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalChecks } from "../src/runner/checks.ts";
import { GO_CHAPTERS } from "../content/go/chapters.js";
import { isRemote } from "../src/tasks/types.ts";

const only = process.env.GO_CH, partial = !!process.env.GO_PARTIAL;
const chapters = GO_CHAPTERS.filter((c) => !only || c.id === only);
assert.ok(chapters.length, "немає такої глави: " + only);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

const loaded = await Promise.all(chapters.map(async (c) => ({
  c,
  lessons: (await import(`../content/go/ch${c.id}.js`))[`LESSONS_${c.id}`],
  tasks: (await import(`../content/tasks/go/ch${c.id}.ts`))[`TASKS_${c.id}`],
  solutions: (await import(`./solutions/go-ch${c.id}.mjs`))[`SOLUTIONS_${c.id}`],
})));

const PROGRAM = /^(\s*\/\/[^\n]*\n)*\s*package main\b/;
const mode = (code) => {
  const head = code.slice(0, code.indexOf("package main"));
  return /не компілюється/.test(head) ? "compile-error" : /аварія/.test(head) ? "crash" : /лише компіляція/.test(head) ? "build" : "ok";
};

for (const { c, lessons, tasks, solutions } of loaded) {
  await test(`глава ${c.id} «${c.name}»: уроки відповідають плану й мають змістовну структуру`, () => {
    if (partial) assert.ok(lessons.length <= c.lessons.length, "уроків більше, ніж у плані");
    else assert.equal(lessons.length, c.lessons.length, `має бути ${c.lessons.length} уроків, є ${lessons.length}`);
    lessons.forEach((l, i) => {
      const o = c.lessons[i], at = `go/${o.n} «${o.t}»`;
      assert.equal(l.t, o.t, `${at}: назва не збігається з планом`);
      assert.equal(l.ch, c.name, `${at}: глава`);
      assert.equal(!!l.adv, o.adv, `${at}: прапорець adv має бути ${o.adv}`);
      assert.ok(Array.isArray(l.p) && l.p.length >= 5, `${at}: потрібно мінімум 5 абзаців теорії`);
      assert.ok(l.p.join("").length >= 1800, `${at}: теорія надто коротка (потрібно від 1800 символів)`);
      assert.ok(Array.isArray(l.code) && l.code.length >= 2 && l.code.every((x) => typeof x === "string" && x.trim()), `${at}: потрібно мінімум 2 приклади коду`);
      for (const k of ["note", "easy", "work"]) assert.ok(typeof l[k] === "string" && l[k].length >= 40, `${at}: поле ${k}`);
      assert.ok(Array.isArray(l.tasks) && l.tasks.length === 2 && l.tasks.every((x) => typeof x === "string" && x.length > 10), `${at}: рівно 2 завдання для самоперевірки`);
    });
  });

  await test(`глава ${c.id}: по одному завданню на урок, з еталоном і коректними перевірками`, () => {
    assert.equal(tasks.length, partial ? lessons.length : c.lessons.length, "по одному завданню на кожен урок глави");
    tasks.forEach((t, i) => {
      const o = c.lessons[i];
      assert.equal(t.lesson, `go/${o.n}`, `завдання ${t.id} має бути прив'язане до go/${o.n}`);
      if (o.keep) assert.equal(t.id, o.keep, `go/${o.n}: збережіть id старого завдання ${o.keep}`);
      assert.ok(isRemote(t) && t.lang === "go" && t.course === "go");
      assert.ok(solutions[t.id], `немає еталона для ${t.id}`);
      assert.ok(t.checks.length >= 3, `${t.id}: потрібно мінімум 3 перевірки`);
      assert.ok(t.checks.some((x) => x.on === "stdout"), `${t.id}: потрібна перевірка виводу`);
      assert.ok(t.xp >= 15 && t.xp <= 60 && t.brief.length && t.context && t.title, `${t.id}: xp 15–60, brief, context, title`);
      for (const x of t.checks) assert.equal([x.equals, x.has, x.matches].filter((v) => v !== undefined).length, 1, `${t.id}: «${x.name}» має рівно одну умову`);
    });
    assert.deepEqual(Object.keys(solutions).sort(), tasks.map((t) => t.id).sort(), "еталони лише для завдань цієї глави");
  });
}

if (!only) {
  const { GO_LESSONS } = await import("../content/go/index.js");
  const { GO_TASKS } = await import("../content/tasks/go/index.ts");
  const { LESSONS } = await import("../content/lessons.js");
  const { TASKS } = await import("../content/tasks/index.ts");
  await test("курс Go: 110 уроків, з них 80 базових і 30 просунутих", () => {
    assert.equal(GO_LESSONS.length, 110);
    assert.equal(GO_LESSONS.filter((l) => !l.adv).length, 80);
    assert.equal(LESSONS.go.length, 110);
    assert.deepEqual(LESSONS.go.map((l) => l.t), GO_LESSONS.map((l) => l.t));
  });
  await test("завдання Go підключені до платформи, id унікальні", () => {
    assert.equal(GO_TASKS.length, 110);
    assert.equal(TASKS.filter((t) => t.course === "go").length, 110);
    assert.equal(new Set(TASKS.map((t) => t.id)).size, TASKS.length);
  });
}

const hasGo = spawnSync("go", ["version"]).status === 0;
if (!hasGo) {
  console.log("Go не знайдено: запуск прикладів і еталонів пропущено (встановіть go, щоб перевіряти їх компілятором)");
} else {
  const cache = join(tmpdir(), "ic-go-cache");
  const runGo = (code, buildOnly = false) => new Promise((resolve) => {
    const dir = mkdtempSync(join(tmpdir(), "ic-go-"));
    writeFileSync(join(dir, "main.go"), code);
    const p = spawn("go", buildOnly ? ["build", "-o", "out", "main.go"] : ["run", "main.go"], { cwd: dir, env: { ...process.env, GO111MODULE: "off", GOFLAGS: "", GOCACHE: cache } });
    let stdout = "", stderr = "";
    p.stdout.on("data", (d) => { stdout += d; });
    p.stderr.on("data", (d) => { stderr += d; });
    const timer = setTimeout(() => p.kill("SIGKILL"), 60000);
    p.on("close", (exitCode) => {
      clearTimeout(timer);
      rmSync(dir, { recursive: true, force: true });
      const compile = exitCode === 1 && /^# command-line-arguments/m.test(stderr);
      resolve(compile ? { stdout: "", stderr, error: stderr } : { stdout, stderr, exitCode: exitCode ?? 1 });
    });
  });
  const pool = async (jobs, size = 6) => {
    const out = new Array(jobs.length);
    let next = 0;
    await Promise.all(Array.from({ length: size }, async () => { for (let i = next++; i < jobs.length; i = next++) out[i] = await jobs[i](); }));
    return out;
  };

  const jobs = [];
  for (const { c, lessons, tasks, solutions } of loaded) {
    lessons.forEach((l, i) => l.code.forEach((code, j) => {
      if (!PROGRAM.test(code)) return;
      const at = `go/${c.lessons[i].n} приклад ${j + 1}`, m = mode(code);
      jobs.push(async () => {
        const r = await runGo(code, m === "build");
        const bad = m === "compile-error" ? !r.error : m === "crash" ? r.error || r.exitCode === 0 : r.error || r.exitCode !== 0;
        return bad ? `${at} (${m}): ${r.error || r.stderr || "очікувалась аварія, а програма завершилась успішно"}` : "";
      });
    }));
    tasks.forEach((t) => jobs.push(async () => {
      const starter = await runGo(t.starter);
      const starterResults = starter.error ? [] : evalChecks(t.checks, t.starter, starter);
      if (!(starter.error || starter.exitCode || starterResults.some((r) => !r.passed))) return `${t.id}: заготовка проходить усі перевірки`;
      const solved = await runGo(solutions[t.id]);
      if (solved.error) return `${t.id}: еталон не компілюється:\n${solved.error}`;
      if (solved.exitCode !== 0) return `${t.id}: еталон завершився аварійно:\n${solved.stderr}`;
      const res = evalChecks(t.checks, solutions[t.id], solved);
      return res.every((r) => r.passed) ? "" : `${t.id}: еталон не проходить перевірки:\n${res.map((r) => `${r.passed ? "+" : "-"} ${r.name} ${r.error ?? ""}`).join("\n")}\nstdout:\n${solved.stdout}`;
    }));
  }
  await test(`компілятор Go: ${jobs.length} прикладів, заготовок і еталонів поводяться як задумано`, async () => {
    const errors = (await pool(jobs)).filter(Boolean);
    assert.equal(errors.length, 0, "\n" + errors.join("\n\n"));
  });
}
console.log(`\nУсі перевірки пройдено: ${passed}`);
