// Чернетки проєктів за ТЗ (НЕ опубліковані): структура, «не підключено до сайту» і справжній запуск.
// Для кожної чернетки: заготовка не проходить усе, еталон проходить усі вимоги, а кожна вимога має мутацію, що її ламає.
// Запуск: npm i --no-save jsdom && node tests/drafts.test.mjs   Потрібні: g++ (C++), fpc (Pascal), jsdom (HTML). Без інструмента запуск курсу пропускається.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DRAFTS, draftToTask } from "../content/drafts/index.ts";
import { LESSONS } from "../content/lessons.js";
import { PROJECTS } from "../content/projects/index.ts";
import { TASKS } from "../content/tasks/index.ts";
import { buildPageDoc, evalPageChecks } from "../src/runner/page.ts";
import { evalChecks } from "../src/runner/checks.ts";
import { DRAFT_MUTATIONS, DRAFT_SOLUTIONS } from "./solutions/drafts.mjs";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { /* HTML-чернетки пропустимо */ }

let passed = 0, skipped = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

/* ---------- запуск ---------- */
const ENV = { ...process.env, LC_ALL: "C" };
const sh = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", timeout: 60000, env: ENV });
const TOOLS = {
  cpp: { file: "main.cpp", probe: ["g++", "--version"], run: (d) => { const c = sh("g++", ["-std=c++17", "-O0", "main.cpp", "-o", "prog"], d); return c.status !== 0 ? { error: c.stderr || c.stdout } : sh("./prog", [], d); } },
  pascal: { file: "main.pas", probe: ["fpc", "-iV"], run: (d) => { const c = sh("fpc", ["-vew", "main.pas"], d); return c.status !== 0 ? { error: c.stdout + c.stderr } : sh("./main", [], d); } },
};
const hasTool = (lang) => !spawnSync(TOOLS[lang].probe[0], TOOLS[lang].probe.slice(1)).error;
const dir = mkdtempSync(join(tmpdir(), "ic-drafts-"));

/** Запускає код чернетки й повертає, які вимоги виконано: { R1: true, … } і що вивела програма */
function evaluate(d, code) {
  const task = draftToTask(d);
  let results, info = {};
  if (d.runtime === "remote") {
    rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, TOOLS[d.lang].file), code);
    const r = TOOLS[d.lang].run(dir);
    if (r.error) return { compileError: r.error, ok: Object.fromEntries(d.requirements.map((q) => [q.id, false])) };
    const out = { stdout: r.stdout ?? "", stderr: r.stderr ?? "", exitCode: r.status ?? 1 };
    info = { stdout: out.stdout, exitCode: out.exitCode };
    results = evalChecks(task.checks, code, out);
  } else {
    const dom = new JSDOM(buildPageDoc(task, code));
    results = evalPageChecks(task.checks, dom.window.document, dom.window, code);
  }
  // Вимога виконана, коли пройшли всі її перевірки (їх у task.checks йде підряд, у порядку вимог)
  const ok = {}; let i = 0;
  for (const q of d.requirements) { const rs = q.checks.map(() => results[i++].passed); ok[q.id] = rs.every(Boolean); }   // не every(): він зупиняється на першій невдачі й збиває нумерацію
  return { ok, results, ...info };
}
const mutate = (code, replace) => replace.reduce((acc, [from, to, all]) => {
  const n = acc.split(from).length - 1;
  assert.ok(n >= 1 && (all || n === 1), `мутація: «${from.slice(0, 50)}» трапляється ${n} разів`);
  return all ? acc.split(from).join(to) : acc.replace(from, () => to);
}, code);

/* ---------- структура ---------- */
await test("чернетки: унікальні id, є всі потрібні поля, вимоги R1…Rn підряд, достатньо вимог і перевірок", () => {
  assert.ok(DRAFTS.length >= 3);
  assert.equal(new Set(DRAFTS.map((d) => d.id)).size, DRAFTS.length);
  for (const d of DRAFTS) {
    assert.ok(d.title && d.context && d.mockup.trim() && d.starter.trim(), d.id);
    assert.ok(d.brief.length >= 2 && d.contract.length >= 2 && d.needs.length >= 3, d.id + ": ТЗ, договір, потрібні теми");
    assert.ok(d.xp >= 40 && d.xp <= 60, d.id + ": xp 40–60");
    assert.equal(d.id.split("-")[0], d.course, d.id + ": id починається з курсу");
    const [c, n] = d.after.split("/");
    assert.equal(c, d.course); assert.ok(LESSONS[c] && LESSONS[c][+n - 1], `${d.id}: урок ${d.after} існує в поточному плані`);
    assert.deepEqual(d.requirements.map((q) => q.id), d.requirements.map((_, i) => "R" + (i + 1)), d.id);
    assert.ok(d.requirements.length >= 6 && d.requirements.length <= 10, `${d.id}: вимог ${d.requirements.length}`);
    for (const q of d.requirements) {
      assert.ok(q.short.length >= 8 && q.short.length <= 80 && !/[<>&]/.test(q.short), `${d.id} ${q.id}: короткий текст`);
      assert.ok(q.text && q.hint && q.checks.length >= 1, `${d.id} ${q.id}`);
    }
    const all = d.requirements.flatMap((q) => q.checks);
    assert.ok(all.length >= 6, d.id + ": перевірок мало");
    if (d.runtime === "remote") {
      assert.ok(all.some((c) => c.on === "stdout") && all.some((c) => c.equals !== undefined && c.on === "stdout"), d.id + ": потрібен повний збіг виводу");
      for (const c of all) assert.equal([c.equals, c.has, c.matches].filter((x) => x !== undefined).length, 1, `${d.id}: одна умова в перевірці`);
    } else {
      for (const c of all) assert.ok(c.selector || c.source, `${d.id}: перевірка без selector і source`);
    }
  }
});

await test("тексти: у постановці, вимогах і підказках лише теги <code>, <b>, <i>; спецсимволи екрановані", () => {
  const html = (s) => assert.ok(!/<(?!\/?(?:code|b|i|br)\b)[a-z]/i.test(s) && !/&(?!(?:lt|gt|amp|nbsp|quot|mdash);)/.test(s), "HTML: " + s.slice(0, 80));
  for (const d of DRAFTS) {
    [d.context, ...d.brief, ...d.contract].forEach(html);
    for (const q of d.requirements) { html(q.text); html(q.hint); }
  }
});

await test("НЕ опубліковано: id чернеток немає серед завдань і проєктів, а код сайту їх не підключає", () => {
  const ids = new Set(DRAFTS.map((d) => d.id));
  for (const t of TASKS) assert.ok(!ids.has(t.id), "чернетка вже серед завдань: " + t.id);
  for (const p of PROJECTS) assert.ok(!ids.has(p.id), "чернетка вже серед проєктів: " + p.id);
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? (f === "node_modules" ? [] : walk(p)) : /\.(ts|js|mjs)$/.test(f) ? [p] : []; });
  const root = new URL("../", import.meta.url).pathname;
  for (const f of [...walk(join(root, "src")), ...walk(join(root, "lib")), ...walk(join(root, "functions")), ...walk(join(root, "content")).filter((x) => !x.includes("/content/drafts/")), join(root, "build.mjs")]) {
    const text = readFileSync(f, "utf8");
    assert.ok(!/content\/drafts|\.\/drafts\//.test(text), `${f} підключає чернетки`);
  }
});

await test("перетворення: draftToTask дає коректне завдання (мова, файл, перевірки з іменами R1…, постановка з вимогами)", () => {
  for (const d of DRAFTS) {
    const t = draftToTask(d);
    assert.equal(t.runtime, d.runtime); assert.equal(t.id, d.id); assert.equal(t.lesson, d.after); assert.equal(t.premium, false);
    assert.equal(t.checks.length, d.requirements.flatMap((q) => q.checks).length);
    assert.ok(t.checks.every((c) => /^R\d+(\.\d+)? /.test(c.name) || /^R\d+\. /.test(c.name)) && t.checks.every((c) => c.hint));
    assert.ok(t.brief.some((p) => p.startsWith("<b>Вимоги:</b>")) && t.brief.some((p) => p.startsWith("<b>Договір:</b>")));
    if (d.runtime === "remote") { assert.equal(t.lang, d.lang); assert.equal(t.file, TOOLS[d.lang].file); }
    else { assert.equal(t.file, "index.html"); assert.equal(t.edit, "html"); }
  }
});

/* ---------- справжній запуск ---------- */
for (const d of DRAFTS) {
  const lang = d.runtime === "remote" ? d.lang : "html";
  if (lang !== "html" && !hasTool(lang)) { console.log(`    ${d.id}: інструмента ${lang} немає, запуск пропущено`); skipped++; continue; }
  if (lang === "html" && !JSDOM) { console.log(`    ${d.id}: немає jsdom, запуск пропущено`); skipped++; continue; }
  const solution = DRAFT_SOLUTIONS[d.id], muts = DRAFT_MUTATIONS[d.id];
  await test(`${d.id}: заготовка не проходить усе, еталон виконує всі ${d.requirements.length} вимог і працює стабільно`, () => {
    assert.ok(solution, "немає еталона");
    const s = evaluate(d, d.starter);
    assert.ok(s.compileError || Object.values(s.ok).some((v) => !v), "заготовка не повинна проходити всі вимоги");
    const r = evaluate(d, solution);
    assert.ok(!r.compileError, "еталон не компілюється:\n" + r.compileError);
    if (d.runtime === "remote") assert.equal(r.exitCode, 0, "аварійне завершення еталона");
    const failed = Object.entries(r.ok).filter(([, v]) => !v).map(([k]) => k);
    assert.deepEqual(failed, [], "еталон не виконує вимоги: " + failed.join(", ") + "\n" + (r.results ?? []).filter((x) => !x.passed).map((x) => `- ${x.name}: ${x.error}`).join("\n") + (r.stdout ? "\nstdout:\n" + r.stdout : ""));
    if (d.runtime === "remote") assert.equal(evaluate(d, solution).stdout, r.stdout, "вивід нестабільний між запусками");
  });
  await test(`${d.id}: кожна вимога має мутацію, що її ламає (проверки справжні, а не «завжди зелені»)`, () => {
    assert.ok(muts && muts.length, "немає мутацій");
    const covered = new Set();
    for (const m of muts) {
      const r = evaluate(d, mutate(solution, m.replace));
      assert.ok(!r.compileError, `мутація ${m.fails} не компілюється:\n${r.compileError}`);
      for (const id of m.fails) { assert.equal(r.ok[id], false, `мутація ${JSON.stringify(m.fails)}: вимога ${id} не впала`); covered.add(id); }
    }
    const missing = d.requirements.map((q) => q.id).filter((id) => !covered.has(id));
    assert.deepEqual(missing, [], "немає мутації для вимог: " + missing.join(", "));
  });
}
rmSync(dir, { recursive: true, force: true });
console.log(`\nУсі перевірки чернеток пройдено: ${passed}${skipped ? `, запусків пропущено: ${skipped}` : ""}`);
