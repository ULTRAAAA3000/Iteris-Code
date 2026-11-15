// Завдання Go: структура + справжній запуск еталонів і заготовок локальним компілятором Go (якщо він встановлений).
// Запуск: node tests/go-tasks.test.mjs  (для запуску потрібна команда go; без неї виконується лише перевірка структури)
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { evalChecks } from "../src/runner/checks.ts";
import { LESSONS } from "../src/data/lessons.js";
import { TASKS } from "../src/tasks/index.ts";
import { isRemote } from "../src/tasks/types.ts";
import { SOLUTIONS } from "./solutions.mjs";

const goTasks = TASKS.filter((t) => isRemote(t) && t.lang === "go");
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

await test("Go: рівно по одному завданню на кожен із уроків курсу", () => {
  assert.equal(goTasks.length, LESSONS.go.length);
  goTasks.forEach((t, i) => assert.equal(t.lesson, `go/${i + 1}`, `завдання ${t.id} має бути прив'язане до go/${i + 1}`));
  assert.equal(new Set(TASKS.map((t) => t.id)).size, TASKS.length, "id завдань унікальні");
  for (const t of goTasks) {
    assert.ok(SOLUTIONS[t.id], `немає еталона для ${t.id}`);
    assert.ok(t.checks.length >= 3, `${t.id}: потрібно мінімум 3 перевірки`);
    assert.ok(t.checks.some((c) => c.on === "stdout"), `${t.id}: потрібна перевірка виводу`);
    assert.ok(t.xp > 0 && t.brief.length && t.context && t.title);
    for (const c of t.checks) assert.equal([c.equals, c.has, c.matches].filter((x) => x !== undefined).length, 1, `${t.id}: «${c.name}» має рівно одну умову`);
  }
});

const hasGo = spawnSync("go", ["version"]).status === 0;
if (!hasGo) {
  console.log("Go не знайдено: запуск еталонів пропущено (встановіть go, щоб перевіряти їх компілятором)");
} else {
  const dir = mkdtempSync(join(tmpdir(), "ic-go-"));
  const runGo = (code) => {
    writeFileSync(join(dir, "main.go"), code);
    const r = spawnSync("go", ["run", "main.go"], { cwd: dir, encoding: "utf8", timeout: 60000, env: { ...process.env, GOFLAGS: "-mod=mod", GO111MODULE: "off", GOCACHE: join(dir, ".cache") } });
    const stderr = r.stderr ?? "";
    const compile = r.status === 1 && /main\.go:\d+/.test(stderr);   // go run повертає 1 при помилці компіляції
    return compile ? { stdout: "", stderr, error: stderr } : { stdout: r.stdout ?? "", stderr, exitCode: r.status ?? 1 };
  };
  for (const t of goTasks) {
    await test(`${t.id}: заготовка не проходить, еталон проходить усі перевірки`, () => {
      const starter = runGo(t.starter);
      const starterResults = starter.error ? [] : evalChecks(t.checks, t.starter, starter);
      assert.ok(starter.error || starter.exitCode || starterResults.some((r) => !r.passed), "заготовка не повинна проходити всі перевірки");
      const solved = runGo(SOLUTIONS[t.id]);
      assert.ok(!solved.error, "еталон не компілюється:\n" + solved.error);
      assert.equal(solved.exitCode, 0, "еталон завершився аварійно:\n" + solved.stderr);
      const res = evalChecks(t.checks, SOLUTIONS[t.id], solved);
      assert.ok(res.every((r) => r.passed), "еталон має проходити все:\n" + res.map((r) => `${r.passed ? "+" : "-"} ${r.name} ${r.error ?? ""}`).join("\n") + "\nstdout:\n" + solved.stdout);
    });
  }
  rmSync(dir, { recursive: true, force: true });
}
console.log(`\nУсі перевірки пройдено: ${passed}`);
