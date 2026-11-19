// Проєкти за ТЗ для Python, Java і Go: структура + справжній запуск еталонів і заготовок локальними python3, javac/java, go (немає інструмента: мова пропускається).
// Запуск: node tests/go-projects.test.mjs   (потрібен go у PATH; без нього тест пропускається)
import { LESSONS } from "../content/lessons.js";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FILE, assemble } from "../content/projects/program-types.ts";

const only = process.argv[2];
const LANGS = ["python", "java", "go"].filter((l) => !only || l === only);
const tool = (c) => spawnSync("which", [c]).status === 0;

function run(lang, program) {
  const dir = mkdtempSync(join(tmpdir(), "proj-"));
  try {
    writeFileSync(join(dir, FILE[lang]), program);
    const opt = { cwd: dir, encoding: "utf8", timeout: 60000 };
    if (lang === "java") {
      const c = spawnSync("javac", ["-encoding", "UTF-8", "Main.java"], opt);
      if (c.status !== 0) return { compiled: false, err: c.stderr, stdout: "", status: c.status };
      const r = spawnSync("java", ["-Dfile.encoding=UTF-8", "-cp", dir, "Main"], opt);
      return { compiled: true, stdout: r.stdout, err: r.stderr, status: r.status };
    }
    const r = lang === "go" ? spawnSync("go", ["run", "main.go"], { ...opt, env: { ...process.env, GOFLAGS: "-mod=mod", GOCACHE: join(tmpdir(), "gocache") } }) : spawnSync("python3", ["-I", "main.py"], opt);
    const bad = lang === "go" && r.status !== 0 && /\.go:\d+:\d+/.test(r.stderr);
    return { compiled: !bad, stdout: r.stdout, err: r.stderr, status: r.status };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const verdicts = (out) => { const m = {}; for (const l of out.split("\n")) { const x = l.match(/^(R\d+) (PASS|FAIL)(?:: (.*))?$/); if (x) m[x[1]] = { pass: x[2] === "PASS", msg: x[3] ?? "" }; } return m; };

let n = 0;
const test = (name, fn) => { fn(); n++; console.log("ok  -", name); };

const tool2 = (l) => (l === "python" ? "python3" : l === "java" ? "javac" : "go");
for (const lang of LANGS) {
  const defPath = new URL(`../content/projects/${lang}.ts`, import.meta.url);
  if (!existsSync(defPath)) { console.log(`(${lang}: чернеток ще немає, пропуск)`); continue; }
  if (!tool(lang === "python" ? "python3" : lang === "java" ? "javac" : "go")) { console.log(`(${lang}: немає інструмента, пропуск)`); continue; }
  const { PROJECTS } = await import(defPath.href);
  const SOL = (await import(`./solutions/${lang}-projects.mjs`)).default;
  test(`${lang}: 2–3 проєкти, унікальні id, структура заповнена`, () => {
    assert.ok(PROJECTS.length >= 2 && PROJECTS.length <= 3, "проєктів " + PROJECTS.length);
    assert.equal(new Set(PROJECTS.map((p) => p.id)).size, PROJECTS.length);
    for (const p of PROJECTS) {
      assert.equal(p.lang, lang); assert.match(p.id, /^[a-z0-9-]{3,30}$/); assert.match(p.lesson, new RegExp("^" + lang + "/\\d+$")); assert.ok(LESSONS[lang][Number(p.lesson.split("/")[1]) - 1] && !LESSONS[lang][Number(p.lesson.split("/")[1]) - 1].adv, p.id + ": урок має бути базовим");
      assert.ok(p.title && p.context.length > 40 && p.brief.length >= 2 && p.contract.length >= 2, p.id);
      assert.ok(p.requirements.length >= 6 && p.requirements.length <= 10, p.id + ": вимог " + p.requirements.length);
      p.requirements.forEach((r, i) => { assert.equal(r.id, "R" + (i + 1)); assert.ok(r.text.length > 15 && r.hint.length > 10, p.id + " " + r.id); });
      assert.ok(p.starter.trim() && p.harness.trim() && p.xp >= 40, p.id);
      assert.ok(SOL[p.id], p.id + ": немає еталона");
    }
  });
  for (const p of PROJECTS) {
    test(`${p.id}: еталон проходить усі ${p.requirements.length} вимог, код завершення 0`, () => {
      const r = run(lang, assemble(p, SOL[p.id]));
      assert.ok(r.compiled, "не компілюється:\n" + r.err);
      const v = verdicts(r.stdout);
      for (const q of p.requirements) assert.ok(v[q.id]?.pass, `${q.id}: ${v[q.id] ? "FAIL " + v[q.id].msg : "немає у виводі"}\n${r.stdout}\n${r.err}`);
      assert.equal(r.status, 0, "код завершення " + r.status + "\n" + r.err);
    });
    test(`${p.id}: заготовка компілюється і не проходить жодної вимоги, harness не падає`, () => {
      const r = run(lang, assemble(p, p.starter));
      assert.ok(r.compiled, "заготовка не компілюється:\n" + r.err);
      const v = verdicts(r.stdout);
      for (const q of p.requirements) assert.ok(v[q.id] && !v[q.id].pass, `${q.id} має бути FAIL у заготовці: ${JSON.stringify(v[q.id])}\n${r.stdout}\n${r.err}`);
    });
    test(`${p.id}: harness не пускає в вивід службових слів і не залежить від мережі/файлів`, () => {
      assert.ok(!/(https?:\/\/|os\.Open|open\(|FileReader|Scanner\(System\.in\)|input\()/.test(p.harness), "harness не має читати ввід, файли чи мережу");
    });
  }
}
console.log(`\nУсі тести чернеток проєктів пройдено: ${n}`);
