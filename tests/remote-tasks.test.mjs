// Віддалені завдання всіх мов: структура + справжній запуск заготовок і еталонів локальними компіляторами.
// Запуск: node tests/remote-tasks.test.mjs [мова ...]   наприклад: node tests/remote-tasks.test.mjs python java
// Потрібні інструменти: go, python3, javac+java, g++, php, fpc. Якщо інструмента немає, запуск цієї мови пропускається (структура перевіряється завжди).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalChecks } from "../src/runner/checks.ts";
import { LESSONS } from "../content/lessons.js";
import { TASKS } from "../content/tasks/index.ts";
import { isRemote } from "../src/tasks/types.ts";
import { SOLUTIONS } from "./solutions.mjs";

/** Уроки, до яких завдання не потрібне (правило D13: практика там, де матеріал дозволяє), із причиною */
const NO_TASK = {
  php: { 8: "у пісочниці немає бази даних, а PDO без неї не запустити" },
};

// Як запускати програму локально. LC_ALL=C навмисно: так видно, що вивід не залежить від кодування середовища
const ENV = { ...process.env, LC_ALL: "C", GO111MODULE: "off" };
const sh = (cmd, args, cwd, input) => spawnSync(cmd, args, { cwd, encoding: "utf8", timeout: 90000, env: ENV, input });
const LANGS = {
  go: { file: "main.go", probe: ["go", "version"], run: (d) => ({ r: sh("go", ["run", "main.go"], d), compileFailed: (r) => r.status === 1 && /main\.go:\d+/.test(r.stderr) }) },
  python: { file: "main.py", probe: ["python3", "--version"], run: (d) => ({ r: sh("python3", ["main.py"], d), compileFailed: (r) => /SyntaxError|IndentationError/.test(r.stderr) }) },
  java: {
    file: "Main.java", probe: ["javac", "-version"],
    run: (d) => { const c = sh("javac", ["-encoding", "UTF-8", "-d", "out", "Main.java"], d); return c.status !== 0 ? { r: c, compileFailed: () => true } : { r: sh("java", ["-cp", "out", "Main"], d), compileFailed: () => false }; },
  },
  cpp: {
    file: "main.cpp", probe: ["g++", "--version"],
    run: (d) => { const c = sh("g++", ["-std=c++17", "-O0", "main.cpp", "-o", "prog"], d); return c.status !== 0 ? { r: c, compileFailed: () => true } : { r: sh("./prog", [], d), compileFailed: () => false }; },
  },
  php: { file: "main.php", probe: ["php", "--version"], run: (d) => ({ r: sh("php", ["main.php"], d), compileFailed: (r) => /Parse error/.test(r.stdout + r.stderr) }) },
  pascal: {
    file: "main.pas", probe: ["fpc", "-iV"],
    run: (d) => { const c = sh("fpc", ["-vew", "main.pas"], d); return c.status !== 0 ? { r: { ...c, stderr: c.stdout + c.stderr }, compileFailed: () => true } : { r: sh("./main", [], d), compileFailed: () => false }; },
  },
};

const want = process.argv.slice(2);
const langs = want.length ? want : Object.keys(LANGS);
let passed = 0, skipped = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

await test("id завдань унікальні, кожна мова відома тесту", () => {
  assert.equal(new Set(TASKS.map((t) => t.id)).size, TASKS.length);
  for (const t of TASKS.filter(isRemote)) assert.ok(LANGS[t.lang], `невідома мова ${t.lang} у ${t.id}`);
});

for (const lang of langs) {
  const tasks = TASKS.filter((t) => isRemote(t) && t.lang === lang);
  const skip = NO_TASK[lang] ?? {};
  await test(`${lang}: рівно одне завдання на кожен урок (крім відомих винятків), структура завдань`, () => {
    const expected = LESSONS[lang].map((_, i) => i + 1).filter((n) => !skip[n]);
    assert.deepEqual(tasks.map((t) => t.lesson), expected.map((n) => `${lang}/${n}`), "завдання мають іти по порядку уроків");
    for (const t of tasks) {
      assert.equal(t.file, LANGS[lang].file, `${t.id}: ім'я файла`);
      assert.ok(SOLUTIONS[t.id], `немає еталона для ${t.id}`);
      assert.ok(t.checks.length >= 3, `${t.id}: потрібно мінімум 3 перевірки`);
      assert.ok(t.checks.some((c) => c.on === "stdout"), `${t.id}: потрібна перевірка виводу`);
      assert.ok(t.xp > 0 && t.brief.length && t.context && t.title && t.starter.trim());
      assert.ok(!t.premium);
      for (const c of t.checks) assert.equal([c.equals, c.has, c.matches].filter((x) => x !== undefined).length, 1, `${t.id}: «${c.name}» має рівно одну умову`);
    }
  });

  if (spawnSync(LANGS[lang].probe[0], LANGS[lang].probe.slice(1)).error) {
    console.log(`    ${lang}: інструмента немає, запуск пропущено`); skipped++; continue;
  }
  const dir = mkdtempSync(join(tmpdir(), `ic-${lang}-`));
  const exec = (code) => {
    rmSync(dir, { recursive: true, force: true });   // чисте середовище для кожного запуску
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, LANGS[lang].file), code);
    const { r, compileFailed } = LANGS[lang].run(dir);
    if (compileFailed(r)) return { stdout: "", stderr: r.stderr, error: (r.stderr || r.stdout) || "помилка компіляції" };
    return { stdout: r.stdout ?? "", stderr: r.stderr ?? "", exitCode: r.status ?? 1 };
  };
  for (const t of tasks) {
    await test(`${t.id}: заготовка не проходить, еталон проходить усі перевірки`, () => {
      const starter = exec(t.starter);
      const starterResults = starter.error ? [] : evalChecks(t.checks, t.starter, starter);
      assert.ok(starter.error || starter.exitCode || starterResults.some((r) => !r.passed), "заготовка не повинна проходити всі перевірки");
      const solved = exec(SOLUTIONS[t.id]);
      assert.ok(!solved.error, "еталон не компілюється:\n" + solved.error);
      assert.equal(solved.exitCode, 0, "еталон завершився аварійно:\n" + solved.stderr);
      const res = evalChecks(t.checks, SOLUTIONS[t.id], solved);
      assert.ok(res.every((r) => r.passed), "еталон має проходити все:\n" + res.map((r) => `${r.passed ? "+" : "-"} ${r.name} ${r.error ?? ""}`).join("\n") + "\nstdout:\n" + solved.stdout);
    });
  }
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\nУсі перевірки пройдено: ${passed}${skipped ? `, мов без інструмента: ${skipped}` : ""}`);
