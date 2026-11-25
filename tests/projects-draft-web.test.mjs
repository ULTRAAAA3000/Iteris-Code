// Чернетки веб-проєктів за ТЗ (HTML): структура, «не опубліковано» і справжнє виконання рушієм проєктів у jsdom.
// Кожна чернетка: заготовка не виконує всі вимоги, еталон виконує всі, а кожна вимога має поломку еталона, що її краснить.
// Запуск: npm i --no-save jsdom && node tests/projects-draft-web.test.mjs
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { LESSONS } from "../content/lessons.js";
import { PROJECTS as PUBLISHED } from "../content/projects/index.ts";
import { PROJECTS } from "../content/projects-draft/html.ts";
import { TASKS } from "../content/tasks/index.ts";
import { buildSrcdoc, REPORT_TYPE, scoreReport } from "../src/projects/sandbox.ts";
import SOL from "./projects-draft/solutions-html.mjs";
import MUT from "./projects-draft/mutations-html.mjs";

let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = await import("jsdom")); } catch { console.log("(html: немає jsdom, запуск пропущено)\nУсі тести веб-чернеток пройдено: 0"); process.exit(0); }

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

/** Запускає сторінку з перевірками в jsdom так само, як це робить браузер, і повертає підсумок */
async function run(project, html) {
  const nonce = "n" + Math.random().toString(36).slice(2);
  const dom = new JSDOM(buildSrcdoc(html, project.requirements, nonce), { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  const report = await new Promise((resolve) => {
    const timer = setTimeout(() => { dom.window.close(); resolve(null); }, 15000);
    dom.window.addEventListener("message", (ev) => {
      if (ev.data?.type === REPORT_TYPE && ev.data.nonce === nonce) { clearTimeout(timer); dom.window.close(); resolve(ev.data); }
    });
  });
  assert.ok(report, "звіт не прийшов");
  return scoreReport(project, report);
}
const failedIds = (s) => s.items.filter((i) => !i.ok).map((i) => i.req.id);
const mutate = (code, replace) => replace.reduce((acc, [from, to, all]) => {
  const c = acc.split(from).length - 1;
  assert.ok(c >= 1 && (all || c === 1), `мутація: «${from.slice(0, 50)}» трапляється ${c} разів`);
  return all ? acc.split(from).join(to) : acc.replace(from, () => to);
}, code);

await test("html: 2–3 проєкти, унікальні id, структура й тексти заповнені, вимоги R1…Rn підряд", () => {
  assert.ok(PROJECTS.length >= 2 && PROJECTS.length <= 3);
  assert.equal(new Set(PROJECTS.map((p) => p.id)).size, PROJECTS.length);
  const tag = (s) => assert.ok(!/<(?!\/?(?:code|b|i|br)\b)[a-z]/i.test(s) && !/&(?!(?:lt|gt|amp|nbsp|quot|mdash);)/.test(s), "HTML у тексті: " + s.slice(0, 80));
  for (const p of PROJECTS) {
    assert.match(p.id, /^html-[a-z0-9-]{3,30}$/);
    const [c, n] = p.lesson.split("/");
    assert.equal(c, "html"); assert.ok(LESSONS.html[+n - 1], `${p.id}: урок ${p.lesson} існує в поточному плані`);
    assert.ok(p.xp >= 40 && p.xp <= 60 && p.premium === false && p.course === "html", p.id);
    assert.ok(p.title && p.context && p.mockup.trim() && p.starter.trim() && p.brief.length >= 2 && p.contract.length >= 2, p.id);
    assert.deepEqual(p.requirements.map((r) => r.id), p.requirements.map((_, i) => "R" + (i + 1)), p.id);
    assert.ok(p.requirements.length >= 6 && p.requirements.length <= 10, `${p.id}: вимог ${p.requirements.length}`);
    [p.context, ...p.brief, ...p.contract].forEach(tag);
    for (const r of p.requirements) { assert.ok(r.text.length > 15 && r.hint.length > 10 && r.check.includes("return bad"), `${p.id} ${r.id}`); tag(r.text); tag(r.hint); }
  }
});

await test("НЕ опубліковано: id чернеток немає серед завдань і проєктів, а код сайту їх не підключає", () => {
  const ids = new Set(PROJECTS.map((p) => p.id));
  for (const t of TASKS) assert.ok(!ids.has(t.id), t.id);
  for (const p of PUBLISHED) assert.ok(!ids.has(p.id), p.id);
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? (f === "node_modules" ? [] : walk(p)) : /\.(ts|js|mjs)$/.test(f) ? [p] : []; });
  const root = new URL("../", import.meta.url).pathname;
  for (const f of [...walk(join(root, "src")), ...walk(join(root, "lib")), ...walk(join(root, "functions")), ...walk(join(root, "content")).filter((x) => !x.includes("/content/projects-draft/")), join(root, "build.mjs")]) {
    assert.ok(!/projects-draft/.test(readFileSync(f, "utf8")), `${f} підключає чернетки`);
  }
});

for (const p of PROJECTS) {
  await test(`${p.id}: заготовка не виконує всі вимоги, еталон виконує всі ${p.requirements.length}`, async () => {
    assert.ok(SOL[p.id], "немає еталона");
    const s = await run(p, p.starter);
    assert.ok(!s.all && s.passed < s.total, "заготовка не повинна проходити всі вимоги");
    const r = await run(p, SOL[p.id]);
    assert.deepEqual(failedIds(r), [], "еталон не виконує вимоги:\n" + r.items.filter((i) => !i.ok).map((i) => `- ${i.req.id}: ${i.msg}`).join("\n"));
    assert.ok(r.all);
  });
  await test(`${p.id}: кожна вимога має поломку еталона, що її краснить`, async () => {
    const muts = MUT[p.id]; assert.ok(muts?.length, "немає мутацій");
    const covered = new Set();
    for (const m of muts) {
      const r = await run(p, mutate(SOL[p.id], m.replace));
      for (const id of m.fails) { assert.ok(failedIds(r).includes(id), `поломка ${JSON.stringify(m.fails)}: ${id} не став невиконаним`); covered.add(id); }
    }
    const missing = p.requirements.map((q) => q.id).filter((id) => !covered.has(id));
    assert.deepEqual(missing, [], "немає поломки для вимог: " + missing.join(", "));
  });
}
console.log(`\nУсі тести веб-чернеток пройдено: ${passed}`);
