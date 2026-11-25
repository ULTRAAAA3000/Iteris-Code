// Чернетки проєктів за ТЗ (Python, Java, Go, C++, Pascal, TypeScript, PHP, SQL): структура + справжній запуск еталонів і заготовок локальними інтерпретаторами/компіляторами.
// Еталон (tests/projects-draft/solutions-<мова>.mjs) має пройти всі вимоги, заготовка має компілюватись і не проходити жодної.
// Запуск: node tests/projects-draft.test.mjs [python|java|go|cpp|pascal|ts|php|sql]   (потрібні python3, javac/java, go, g++, fpc, node+tsc, php, sqlite3 у PATH; без інструмента мову пропущено)
// Якщо є tests/projects-draft/mutations-<мова>.mjs, перевіряється ще й що КОЖНА вимога має «поломку» еталона, яка її краснить (перевірки не «завжди зелені»).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FILE, assemble } from "../content/projects-draft/types.ts";

const only = process.argv[2];
const LANGS = ["python", "java", "go", "cpp", "pascal", "ts", "php", "sql"].filter((l) => !only || l === only);
const TOOL = { python: "python3", java: "javac", go: "go", cpp: "g++", pascal: "fpc", ts: "tsc", php: "php", sql: "sqlite3" };
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
    if (lang === "cpp") {
      const c = spawnSync("g++", ["-std=c++17", "-O0", "main.cpp", "-o", "prog"], opt);
      if (c.status !== 0) return { compiled: false, err: c.stderr, stdout: "", status: c.status };
      const r = spawnSync("./prog", [], opt);
      return { compiled: true, stdout: r.stdout, err: r.stderr, status: r.status };
    }
    if (lang === "pascal") {
      const c = spawnSync("fpc", ["-vew", "main.pas"], opt);
      if (c.status !== 0) return { compiled: false, err: c.stdout + c.stderr, stdout: "", status: c.status };
      const r = spawnSync("./main", [], opt);
      return { compiled: true, stdout: r.stdout, err: r.stderr, status: r.status };
    }
    if (lang === "ts") {
      // Типи перевіряє tsc (strict, як у курсі), виконує node зі стиранням типів: так само, як пісочниця з компілятором TypeScript
      const c = spawnSync("tsc", ["--noEmit", "--strict", "--target", "es2022", "--lib", "es2022,dom", "--module", "esnext", "--erasableSyntaxOnly", "main.ts"], opt);
      if (c.status !== 0) return { compiled: false, err: c.stdout + c.stderr, stdout: "", status: c.status };
      const r = spawnSync("node", ["--no-warnings", "main.ts"], opt);
      return { compiled: true, stdout: r.stdout, err: r.stderr, status: r.status };
    }
    if (lang === "php") {
      const c = spawnSync("php", ["-l", "main.php"], opt);
      if (c.status !== 0) return { compiled: false, err: c.stdout + c.stderr, stdout: "", status: c.status };
      const r = spawnSync("php", ["-d", "display_errors=stderr", "main.php"], opt);
      return { compiled: true, stdout: r.stdout, err: r.stderr, status: r.status };
    }
    if (lang === "sql") {
      // Скрипт виконується на порожній базі в пам'яті; помилки окремих операторів не зупиняють скрипт (вони йдуть у stderr)
      const r = spawnSync("sqlite3", [":memory:"], { ...opt, input: program });
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

for (const lang of LANGS) {
  const defPath = new URL(`../content/projects-draft/${lang}.ts`, import.meta.url);
  if (!existsSync(defPath)) { console.log(`(${lang}: чернеток ще немає, пропуск)`); continue; }
  if (!tool(TOOL[lang])) { console.log(`(${lang}: немає інструмента, пропуск)`); continue; }
  const { PROJECTS } = await import(defPath.href);
  const SOL = (await import(`./projects-draft/solutions-${lang}.mjs`)).default;
  test(`${lang}: 2–3 проєкти, унікальні id, структура заповнена`, () => {
    assert.ok(PROJECTS.length >= 2 && PROJECTS.length <= 3, "проєктів " + PROJECTS.length);
    assert.equal(new Set(PROJECTS.map((p) => p.id)).size, PROJECTS.length);
    for (const p of PROJECTS) {
      assert.equal(p.lang, lang); assert.match(p.id, /^[a-z0-9-]{3,30}$/); assert.match(p.lesson, new RegExp("^" + lang + "/\\d+$"));
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
      assert.ok(!/(https?:\/\/|os\.Open|open\(|FileReader|Scanner\(System\.in\)|input\(|std::cin|std::ifstream|readln|\bAssign\(|fopen|file_get_contents|curl_|fetch\(|require\(|readFileSync|process\.stdin|\.read\b|\.shell|\.system|ATTACH\s)/i.test(p.harness), "harness не має читати ввід, файли чи мережу");
    });
  }
  const mutPath = new URL(`./projects-draft/mutations-${lang}.mjs`, import.meta.url);
  if (existsSync(mutPath)) {
    const MUT = (await import(mutPath.href)).default;
    const mutate = (code, replace) => replace.reduce((acc, [from, to, all]) => {
      const c = acc.split(from).length - 1;
      assert.ok(c >= 1 && (all || c === 1), `мутація: «${from.slice(0, 50)}» трапляється ${c} разів`);
      return all ? acc.split(from).join(to) : acc.replace(from, () => to);
    }, code);
    for (const p of PROJECTS) {
      test(`${p.id}: кожна вимога має поломку еталона, що її краснить`, () => {
        const muts = MUT[p.id]; assert.ok(muts?.length, "немає мутацій");
        const covered = new Set();
        for (const m of muts) {
          const r = run(lang, assemble(p, mutate(SOL[p.id], m.replace)));
          assert.ok(r.compiled, `мутація ${JSON.stringify(m.fails)} не компілюється:\n${r.err}`);
          const v = verdicts(r.stdout);
          for (const id of m.fails) { assert.ok(v[id] && !v[id].pass, `мутація ${JSON.stringify(m.fails)}: ${id} не став FAIL`); covered.add(id); }
        }
        const missing = p.requirements.map((q) => q.id).filter((id) => !covered.has(id));
        assert.deepEqual(missing, [], "немає поломки для вимог: " + missing.join(", "));
      });
    }
  }
}
console.log(`\nУсі тести чернеток проєктів пройдено: ${n}`);
