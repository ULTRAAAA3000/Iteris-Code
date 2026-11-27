// Курс PHP: структура уроків і завдань + справжній запуск прикладів з уроків, заготовок і еталонів інтерпретатором php
// Запуск: node tests/php-course.test.mjs  (потрібен php 8.1+; без нього перевіряється лише структура)
// Одна глава: PHP_CH=02 node tests/php-course.test.mjs
// Глава в роботі: PHP_CH=02 PHP_PARTIAL=1 node tests/php-course.test.mjs
// Маркери намірених збоїв (перші рядки-коментарі `//` блока після `<?php`): «// не компілюється: …» (синтаксична помилка, `php -l` її ловить),
// «// аварія: …» (необроблене виключення або фатальна помилка, ненульовий код виходу), «// фрагмент: …» (не запускається: термінал, кілька файлів, PHP 8.4).
// Приклади й еталони мають працювати БЕЗ попереджень, сповіщень і deprecated (error_reporting=E_ALL): це помилка курсу.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalChecks } from "../src/runner/checks.ts";
import { PHP_CHAPTERS } from "../content/php/chapters.js";
import { isRemote } from "../src/tasks/types.ts";

const only = process.env.PHP_CH, partial = !!process.env.PHP_PARTIAL;
const chapters = PHP_CHAPTERS.filter((c) => !only || c.id === only);
assert.ok(chapters.length, "немає такої глави: " + only);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

const loaded = await Promise.all(chapters.map(async (c) => ({
  c,
  lessons: (await import(`../content/php/ch${c.id}.js`))[`LESSONS_${c.id}`],
  tasks: (await import(`../content/tasks/php/ch${c.id}.ts`))[`TASKS_${c.id}`],
  solutions: (await import(`./solutions/php-ch${c.id}.mjs`))[`SOLUTIONS_${c.id}`],
})));

/** Режим прикладу за коментарями `//` на початку блока (після рядка <?php) */
const mode = (code) => {
  const lines = code.split("\n");
  let i = 0;
  while (i < lines.length && (!lines[i].trim() || /^\s*<\?php\b/.test(lines[i]))) i++;
  const head = [];
  for (; i < lines.length && /^\s*\/\//.test(lines[i]); i++) head.push(lines[i]);
  const h = head.join("\n");
  return /фрагмент/.test(h) ? "fragment" : /не компілюється/.test(h) ? "compile-error" : /аварія/.test(h) ? "crash" : "ok";
};
/** У текстових полях дозволені лише теги code, b, i; решту символів < > & треба екранувати */
const badMarkup = (s) => s.replace(/<\/?(code|b|i)>/g, "").replace(/&(lt|gt|amp);/g, "").match(/[<>&]/);
const words = (s) => (s.replace(/<[^>]+>/g, " ").match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;

for (const { c, lessons, tasks, solutions } of loaded) {
  await test(`глава ${c.id} «${c.name}»: уроки відповідають плану й мають змістовну структуру`, () => {
    if (partial) assert.ok(lessons.length <= c.lessons.length, "уроків більше, ніж у плані");
    else assert.equal(lessons.length, c.lessons.length, `має бути ${c.lessons.length} уроків, є ${lessons.length}`);
    lessons.forEach((l, i) => {
      const o = (partial && c.lessons.find((x) => x.t === l.t)) || c.lessons[i], at = `php/${o.n} «${o.t}»`;
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
      if (!l.code.some((x) => mode(x) === "compile-error" || mode(x) === "crash")) console.warn(`попередження: php/${o.n} «${o.t}» не показує жодного збою (маркер «# не компілюється:» або «# аварія:»), а там, де в теми є пастки, він потрібен`);
    });
  });

  await test(`глава ${c.id}: по одному завданню на урок, з еталоном і коректними перевірками`, () => {
    const expected = partial ? lessons.filter((l) => !c.lessons.find((x) => x.t === l.t)?.noTask).length : c.lessons.filter((x) => !x.noTask).length;
    assert.equal(tasks.length, expected, "по одному завданню на кожен урок глави (крім noTask)");
    tasks.forEach((t, i) => {
      const o = (partial && c.lessons.find((x) => `php/${x.n}` === t.lesson)) || c.lessons.filter((x) => !x.noTask)[i];
      assert.equal(t.lesson, `php/${o.n}`, `завдання ${t.id} має бути прив'язане до php/${o.n}`);
      if (o.keep) assert.equal(t.id, o.keep, `php/${o.n}: збережіть id старого завдання ${o.keep}`);
      assert.ok(isRemote(t) && t.lang === "php" && t.course === "php");
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
  await test("id завдань унікальні в усьому курсі", () => {
    const all = loaded.flatMap((x) => x.tasks.map((t) => t.id));
    assert.equal(all.length, new Set(all).size, "дублікати id: " + all.filter((id, i) => all.indexOf(id) !== i).join(", "));
  });
  const ids = chapters.flatMap((c) => c.lessons.map((l) => l.keep).filter(Boolean));
  await test("план: 110 уроків, з них 30 просунутих, 9 id зі старого курсу збережено", () => {
    const all = PHP_CHAPTERS.flatMap((c) => c.lessons);
    assert.equal(all.length, 110);
    assert.equal(all.filter((l) => l.adv).length, 30);
    assert.equal(PHP_CHAPTERS.length, 12);
    assert.equal(ids.length, 9);
    assert.equal(new Set(ids).size, 9);
  });
}

const hasPhp = spawnSync("php", ["--version"]).status === 0;
if (!hasPhp) {
  console.log("php не знайдено: запуск прикладів і еталонів пропущено");
} else {
  const sh = (cmd, args, cwd, ms) => new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd });
    let stdout = "", stderr = "";
    p.stdout.on("data", (d) => { stdout += d; });
    p.stderr.on("data", (d) => { stderr += d; });
    const timer = setTimeout(() => p.kill("SIGKILL"), ms);
    p.on("close", (code) => { clearTimeout(timer); resolve({ stdout, stderr, code: code ?? 1 }); });
  });
  /** Запускає програму; strict: будь-яке попередження чи deprecated у stderr вважаємо помилкою (для прикладів і еталонів).
      Синтаксична помилка (php -l) повертається як error. */
  const runPhp = async (code, strict = false) => {
    const dir = mkdtempSync(join(tmpdir(), "ic-php-"));
    try {
      writeFileSync(join(dir, "main.php"), code);
      const l = await sh("php", ["-l", "main.php"], dir, 20000);
      if (l.code !== 0) return { stdout: "", stderr: l.stdout + l.stderr, error: l.stdout + l.stderr || "синтаксична помилка" };
      const r = await sh("php", ["-d", "display_errors=stderr", "-d", "error_reporting=-1", "-d", "zend.assertions=1", "-d", "assert.exception=1", "main.php"], dir, 20000);
      const warn = strict && /(Warning|Notice|Deprecated):/.test(r.stderr) ? r.stderr : "";
      return { stdout: r.stdout, stderr: r.stderr, exitCode: r.code, warn };
    } finally { rmSync(dir, { recursive: true, force: true }); }
  };
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
      const at = `php/${(c.lessons.find((x) => x.t === l.t) ?? c.lessons[i]).n} приклад ${j + 1}`;
      jobs.push(async () => {
        const r = await runPhp(code, true);
        const bad = m === "compile-error" ? !r.error : m === "crash" ? r.error || r.exitCode === 0 : r.error || r.exitCode !== 0 || r.warn;
        return bad ? `${at} (${m}): ${r.error || r.warn || r.stderr || "очікувалась аварія, а програма завершилась успішно"}` : "";
      });
    }));
    tasks.forEach((t) => jobs.push(async () => {
      const starter = await runPhp(t.starter);
      const starterResults = starter.error ? [] : evalChecks(t.checks, t.starter, starter);
      if (!(starter.error || starter.exitCode || starterResults.some((r) => !r.passed))) return `${t.id}: заготовка проходить усі перевірки`;
      const solved = await runPhp(solutions[t.id], true);
      if (solved.error) return `${t.id}: еталон має синтаксичну помилку:\n${solved.error}`;
      if (solved.warn) return `${t.id}: еталон дає попередження PHP:\n${solved.warn}`;
      if (solved.exitCode !== 0) return `${t.id}: еталон завершився аварійно:\n${solved.stderr}`;
      const res = evalChecks(t.checks, solutions[t.id], solved);
      return res.every((r) => r.passed) ? "" : `${t.id}: еталон не проходить перевірки:\n${res.map((r) => `${r.passed ? "+" : "-"} ${r.name} ${r.error ?? ""}`).join("\n")}\nstdout:\n${solved.stdout}`;
    }));
  }
  await test(`PHP: ${jobs.length} прикладів, заготовок і еталонів поводяться як задумано`, async () => {
    const errors = (await pool(jobs)).filter(Boolean);
    assert.equal(errors.length, 0, "\n" + errors.join("\n\n"));
  });
}
console.log(`\nУсі перевірки пройдено: ${passed}`);
