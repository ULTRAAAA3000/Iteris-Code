// Курс Git: структура уроків і завдань + справжній запуск прикладів з уроків, заготовок і еталонів (скрипти Bash із командами git).
// Запуск: node tests/git-course.test.mjs  (потрібні команди bash і git; без них перевіряється лише структура)
// Одна глава: GIT_CH=02 node tests/git-course.test.mjs
// Глава в роботі (уроки дописуються поступово): GIT_CH=02 GIT_PARTIAL=1 node tests/git-course.test.mjs
// Без змінних перевіряються лише глави, які вже написані (є файл content/git/chNN.js); решта плану лише рахується.
// Маркери намірених збоїв у прикладах (коментарі на початку блока, одразу після shebang, якщо він є):
// «# не компілюється: …» (синтаксична помилка: bash -n), «# аварія: …» (ненульовий код завершення),
// «# фрагмент: …» (не запускається: команди терміналу, кілька файлів, потрібна мережа чи ввід).
// Запуск іде в порожній тимчасовій папці з LC_ALL=C: сортування й порядок глобів не залежать від локалі машини.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalChecks } from "../src/runner/checks.ts";
import { GIT_CHAPTERS } from "../content/git/chapters.js";
import { isRemote } from "../src/tasks/types.ts";

const only = process.env.GIT_CH, partial = !!process.env.GIT_PARTIAL;
const written = (c) => existsSync(new URL(`../content/git/ch${c.id}.js`, import.meta.url));
const chapters = GIT_CHAPTERS.filter((c) => (only ? c.id === only : written(c)));
assert.ok(chapters.length, only ? "немає такої глави: " + only : "ще не написано жодної глави");

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

const loaded = await Promise.all(chapters.map(async (c) => ({
  c,
  lessons: (await import(`../content/git/ch${c.id}.js`))[`LESSONS_${c.id}`],
  tasks: (await import(`../content/tasks/git/ch${c.id}.ts`))[`TASKS_${c.id}`],
  solutions: (await import(`./solutions/git-ch${c.id}.mjs`))[`SOLUTIONS_${c.id}`],
})));

/** Режим прикладу за коментарями на початку блока */
const mode = (code) => {
  const head = code.split("\n").filter((l, i, a) => a.slice(0, i + 1).every((x) => /^\s*#/.test(x) || !x.trim())).join("\n");
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
      const o = c.lessons[i], at = `git/${o.n} «${o.t}»`;
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
      assert.ok(Array.isArray(l.tasks) && l.tasks.length === 2 && l.tasks.every((x) => typeof x === "string" && x.length > 10), `${at}: рівно 2 питання для самоперевірки`);
      for (const [k, v] of [["easy", l.easy], ["note", l.note], ["work", l.work], ...l.p.map((x, j) => [`p[${j}]`, x]), ...l.tasks.map((x, j) => [`tasks[${j}]`, x])]) {
        assert.ok(!badMarkup(v), `${at}: у полі ${k} недозволена розмітка або неекранований символ < > &: «${badMarkup(v)?.input.slice(Math.max(0, badMarkup(v).index - 20), badMarkup(v).index + 20)}»`);
      }
      const total = words(l.easy) + l.p.reduce((s, x) => s + words(x), 0) + words(l.note) + words(l.work) + l.tasks.reduce((s, x) => s + words(x), 0);
      assert.ok(total >= 450 && total <= 1000, `${at}: ${total} слів теорії, норма 450–950`);
      if (!l.code.some((x) => mode(x) === "compile-error" || mode(x) === "crash")) console.warn(`попередження: git/${o.n} «${o.t}» не показує жодного збою (маркер «# не компілюється:» або «# аварія:»), а там, де в теми є пастки, він потрібен`);
    });
  });

  await test(`глава ${c.id}: по одному завданню на урок, з еталоном і коректними перевірками`, () => {
    assert.equal(tasks.length, partial ? lessons.length : c.lessons.length, "по одному завданню на кожен урок глави");
    tasks.forEach((t, i) => {
      const o = c.lessons[i];
      assert.equal(t.lesson, `git/${o.n}`, `завдання ${t.id} має бути прив'язане до git/${o.n}`);
      if (o.keep) assert.equal(t.id, o.keep, `git/${o.n}: збережіть id старого завдання ${o.keep}`);
      assert.ok(isRemote(t) && t.lang === "bash" && t.course === "git" && t.file === "main.sh");
      assert.ok(solutions[t.id], `немає еталона для ${t.id}`);
      assert.ok(t.checks.length >= 3, `${t.id}: потрібно мінімум 3 перевірки`);
      assert.ok(t.checks.some((x) => x.on === "stdout"), `${t.id}: потрібна перевірка виводу`);
      assert.ok(t.checks.every((x) => x.hint), `${t.id}: кожна перевірка має hint`);
      assert.ok(t.xp >= 15 && t.xp <= 60 && t.brief.length && t.context && t.title, `${t.id}: xp 15–60, brief, context, title`);
      assert.ok(words(t.context) >= 15 && words(t.context) <= 46, `${t.id}: context має бути 15–46 слів (є ${words(t.context)})`);
      for (const x of t.checks) assert.equal([x.equals, x.has, x.matches].filter((v) => v !== undefined).length, 1, `${t.id}: «${x.name}» має рівно одну умову`);
      for (const [k, v] of [["context", t.context], ...t.brief.map((x, j) => [`brief[${j}]`, x])]) assert.ok(!badMarkup(v), `${t.id}: у полі ${k} недозволена розмітка або неекранований символ < > &`);
    });
    assert.deepEqual(Object.keys(solutions).sort(), tasks.map((t) => t.id).sort(), "еталони лише для завдань цієї глави");
  });
}

if (!only) {
  await test("план: 110 уроків, з них 30 просунутих, 12 глав" + (chapters.length === GIT_CHAPTERS.length ? "" : " (курс ще пишеться)"), () => {
    const all = GIT_CHAPTERS.flatMap((c) => c.lessons);
    assert.equal(all.length, 110);
    assert.equal(all.filter((l) => l.adv).length, 30);
    assert.equal(GIT_CHAPTERS.length, 12);
    assert.deepEqual(GIT_CHAPTERS.map((c) => c.lessons.length), [6, 10, 8, 10, 9, 10, 10, 10, 9, 8, 12, 8]);
    assert.deepEqual(GIT_CHAPTERS.map((c) => c.lessons.filter((l) => l.adv).length), [0, 2, 2, 3, 3, 3, 3, 4, 3, 2, 3, 2]);
  });
}

const hasTools = spawnSync("bash", ["--version"]).status === 0 && spawnSync("git", ["--version"]).status === 0;
if (!hasTools) {
  console.log("bash або git не знайдено: запуск прикладів і еталонів пропущено (встановіть їх, щоб перевіряти курс справжнім git)");
} else {
  const bashVersion = spawnSync("bash", ["-c", "echo $BASH_VERSION"]).stdout.toString().trim();
  console.log("bash", bashVersion, spawnSync("git", ["--version"]).stdout.toString().trim());
  const runBash = (code) => new Promise((resolve) => {
    const dir = mkdtempSync(join(tmpdir(), "ic-sh-"));
    writeFileSync(join(dir, "main.sh"), code);
    const env = { PATH: process.env.PATH, HOME: dir, LC_ALL: "C", LANG: "C", GIT_CONFIG_NOSYSTEM: "1", GIT_TERMINAL_PROMPT: "0" };
    const syntax = spawnSync("bash", ["-n", "main.sh"], { cwd: dir, env });
    if (syntax.status !== 0) { rmSync(dir, { recursive: true, force: true }); return resolve({ stdout: "", stderr: String(syntax.stderr), error: String(syntax.stderr) }); }
    const p = spawn("bash", ["main.sh"], { cwd: dir, env, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    p.stdout.on("data", (d) => { stdout += d; });
    p.stderr.on("data", (d) => { stderr += d; });
    const timer = setTimeout(() => p.kill("SIGKILL"), 20000);
    p.on("close", (exitCode) => {
      clearTimeout(timer);
      rmSync(dir, { recursive: true, force: true });
      resolve({ stdout, stderr, exitCode: exitCode ?? 1 });
    });
  });
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
      const at = `git/${c.lessons[i].n} приклад ${j + 1}`;
      jobs.push(async () => {
        const r = await runBash(code);
        const bad = m === "compile-error" ? !r.error : m === "crash" ? r.error || r.exitCode === 0 : r.error || r.exitCode !== 0;
        return bad ? `${at} (${m}): ${r.error || r.stderr || "очікувалась аварія, а скрипт завершився успішно"}` : "";
      });
    }));
    tasks.forEach((t) => jobs.push(async () => {
      const starter = await runBash(t.starter);
      const starterResults = starter.error ? [] : evalChecks(t.checks, t.starter, starter);
      if (!(starter.error || starter.exitCode || starterResults.some((r) => !r.passed))) return `${t.id}: заготовка проходить усі перевірки`;
      const solved = await runBash(solutions[t.id]);
      if (solved.error) return `${t.id}: еталон має синтаксичну помилку:\n${solved.error}`;
      if (solved.exitCode !== 0) return `${t.id}: еталон завершився з кодом ${solved.exitCode}:\n${solved.stderr}`;
      const res = evalChecks(t.checks, solutions[t.id], solved);
      return res.every((r) => r.passed) ? "" : `${t.id}: еталон не проходить перевірки:\n${res.map((r) => `${r.passed ? "+" : "-"} ${r.name} ${r.error ?? ""}`).join("\n")}\nstdout:\n${solved.stdout}`;
    }));
  }
  await test(`Git: ${jobs.length} прикладів, заготовок і еталонів поводяться як задумано`, async () => {
    const errors = (await pool(jobs)).filter(Boolean);
    assert.equal(errors.length, 0, "\n" + errors.join("\n\n"));
  });
}
console.log(`\nУсі перевірки пройдено: ${passed}`);
