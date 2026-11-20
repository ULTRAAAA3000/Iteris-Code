// Етап 3 (частина A): проєкти за ТЗ. Дані, рушій перевірки, сервер. Запуск: node tests/stage3.test.mjs  (Node 22+)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession, sessionCookie } from "../lib/session.ts";
import { onRequestPost as complete } from "../functions/api/progress/complete.ts";
import { onRequestPost as xpSync } from "../functions/api/xp/sync.ts";
import { onRequestGet as dashboard } from "../functions/api/dashboard.ts";
import { LESSONS } from "../content/lessons.js";
import { practiceById } from "../lib/practice.ts";
import { onRequestGet as coursesApi } from "../functions/api/courses.ts";
import { onRequestGet as projectApi } from "../functions/api/project.ts";
import { PROJECTS, projectById, projectForLesson } from "../content/projects/index.ts";
import { buildSrcdoc, scoreReport } from "../src/projects/sandbox.ts";
import { TASKS } from "../content/tasks/index.ts";
import { PROJECT_SOLUTIONS } from "./solutions.mjs";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
const isSelect = (q) => /^\s*select/i.test(q);
const stmt = (q) => ({
  q, p: [],
  bind(...a) { this.p = a; return this; },
  async first() { return sqlite.prepare(q).get(...this.p) ?? null; },
  async all() { return { results: sqlite.prepare(q).all(...this.p) }; },
  async run() { const r = sqlite.prepare(q).run(...this.p); return { success: true, meta: { changes: Number(r.changes) } }; },
});
const DB = {
  prepare: stmt,
  async batch(list) {
    sqlite.exec("BEGIN");
    try { const out = []; for (const s of list) out.push(isSelect(s.q) ? await s.all() : await s.run()); sqlite.exec("COMMIT"); return out; }
    catch (e) { sqlite.exec("ROLLBACK"); throw e; }
  },
};
const env = { DB, SESSION_SECRET: "s".repeat(40) };
const ORIGIN = "https://iteris-code.pages.dev";
const req = (path, { method = "GET", body, cookie, origin = ORIGIN } = {}) =>
  new Request(ORIGIN + path, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method === "POST" ? { Origin: origin, "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
const call = async (fn, r) => { const res = await fn({ request: r, env }); return { status: res.status, data: await res.json() }; };
const login = async (id) => {
  sqlite.prepare("INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)").run(id, id + "@x.ua", id);
  return sessionCookie(await createSession(env, id, 30), 3600).split(";")[0];
};
const sync = (cookie) => call(xpSync, req("/api/xp/sync", { method: "POST", cookie }));
const post = (cookie, body, extra = {}) => call(complete, req("/api/progress/complete", { method: "POST", body, cookie, ...extra }));

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

await test("дані проєктів: унікальні id, урок і курс існують, вимоги R1…Rn підряд, у кожної є підказка й перевірка", () => {
  assert.ok(PROJECTS.length >= 1);
  assert.equal(new Set(PROJECTS.map((p) => p.id)).size, PROJECTS.length);
  for (const p of PROJECTS) {
    const [k, n] = p.lesson.split("/");
    assert.ok(LESSONS[k] && LESSONS[k][+n - 1], p.id + ": урок " + p.lesson);
    assert.equal(p.course, k);
    assert.ok(p.xp > 0 && p.starter.length > 0 && p.brief.length > 0 && p.contract.length > 0 && p.mockup.length > 0);
    assert.deepEqual(p.requirements.map((r) => r.id), p.requirements.map((_, i) => "R" + (i + 1)));
    for (const r of p.requirements) assert.ok(r.text && r.hint && r.check, p.id + " " + r.id);
    assert.ok(!TASKS.some((t) => t.id === p.id), "id проєкту не збігається з id завдання");
  }
});

await test("пошук: projectById, projectForLesson, practiceById знаходять і проєкти, і завдання", () => {
  assert.equal(projectById("js-todo")?.lesson, "js/17");
  assert.equal(projectForLesson("js/17")?.id, "js-todo");
  assert.equal(projectById("nope"), undefined);
  assert.equal(practiceById("js-todo")?.xp, 60);
  assert.equal(practiceById("js-safe-city")?.xp, 20);
  assert.equal(practiceById("nope"), undefined);
});

await test("рушій: документ містить сторінку користувача, одноразовий код і вимоги, а «<» у вимогах екрановано", () => {
  const reqs = [{ id: "R1", text: "t", hint: "h", check: 'return "</script><b>" || true;' }];
  const doc = buildSrcdoc("<!DOCTYPE html><p>hi</p>", reqs, "nonce-123");
  assert.ok(doc.startsWith("<!DOCTYPE html><p>hi</p>"));
  assert.ok(doc.includes('"nonce-123"') && doc.includes("ic-project-report"));
  assert.equal(doc.split("</script>").length, 2, "тег script закривається лише один раз");
  assert.ok(doc.includes("\\u003c/script>"));
});

await test("підсумок: порахує виконані вимоги, відсутній результат = невиконано, помилка звіту не дає «усе виконано»", () => {
  const p = projectById("js-todo");
  const all = { results: p.requirements.map((r) => ({ id: r.id, ok: true })) };
  assert.deepEqual([scoreReport(p, all).passed, scoreReport(p, all).total, scoreReport(p, all).all], [8, 8, true]);
  const part = scoreReport(p, { results: [{ id: "R1", ok: true }, { id: "R2", ok: false, msg: "нема" }] });
  assert.deepEqual([part.passed, part.all, part.items[1].msg, part.items[2].ok], [1, false, "нема", false]);
  assert.equal(scoreReport(p, { ...all, error: "збій" }).all, false);
  assert.equal(scoreReport({ requirements: [] }, { results: [] }).all, false);
});

await test("еталонне рішення є для кожного проєкту й підходить під обмеження розміру", () => {
  for (const p of PROJECTS) { assert.ok(PROJECT_SOLUTIONS[p.id], p.id); assert.ok(PROJECT_SOLUTIONS[p.id].length < 60000); }
});

/* ---- сервер: XP за проєкт ---- */
await test("complete: проєкт приймається, XP 60 лише за перше проходження, повторне нічого не нараховує", async () => {
  const c = await login("pj1");
  assert.equal((await post(undefined, { taskId: "js-todo", code: "x", passed: true })).status, 401);
  assert.equal((await post(c, { taskId: "js-todo", code: "x", passed: true }, { origin: "https://evil.example" })).status, 403);
  const a = await post(c, { taskId: "js-todo", code: PROJECT_SOLUTIONS["js-todo"], passed: true });
  assert.deepEqual([a.status, a.data.firstSolve, a.data.xp], [200, true, 60]);
  const b = await post(c, { taskId: "js-todo", code: PROJECT_SOLUTIONS["js-todo"], passed: true });
  assert.deepEqual([b.data.firstSolve, b.data.xp], [false, 0]);
});

await test("ліміти розміру: проєкт до 60000 символів, завдання з тестами як і раніше до 20000", async () => {
  const c = await login("pj2");
  assert.equal((await post(c, { taskId: "js-todo", code: "x".repeat(60001), passed: true })).status, 400);
  assert.equal((await post(c, { taskId: "js-todo", code: "x".repeat(25000), passed: false })).status, 200);
  assert.equal((await post(c, { taskId: "js-safe-city", code: "x".repeat(20001), passed: true })).status, 400);
  assert.equal((await post(c, { taskId: "js-todo", code: "x", passed: "yes" })).status, 400);
  assert.equal((await post(c, { taskId: "js-todo-nope", code: "x", passed: true })).status, 400);
});

await test("непройдений проєкт не дає XP; sync нараховує XP за проєкт один раз і не дублює", async () => {
  const c = await login("pj3"), id = "pj3";
  await post(c, { taskId: "js-todo", code: "bad", passed: false });
  assert.equal((await sync(c)).data.xp, 0);
  await post(c, { taskId: "js-todo", code: "ok", passed: true });
  const s1 = await sync(c);
  assert.equal(s1.data.xp, 60);
  assert.deepEqual(s1.data.gained.map((e) => [e.reason, e.ref, e.amount]), [["task", "js-todo", 60]]);
  const s2 = await sync(c);
  assert.deepEqual([s2.data.xp, s2.data.gained.length], [60, 0]);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM xp_events WHERE user_id = ? AND ref = 'js-todo'").get(id).c, 1);
});

await test("кабінет: пройдений проєкт видно в passedTasks", async () => {
  const c = await login("pj4");
  await post(c, { taskId: "js-todo", code: "ok", passed: true });
  const d = await call(dashboard, req("/api/dashboard", { cookie: c }));
  assert.ok(d.data.passedTasks.includes("js-todo"));
});

/* ---- закритий контент: проєкти лише після входу ---- */
await test("/api/project: гостю 401, вошедшему повний проєкт (вимоги з перевірками, заготовка), неіснуючий або некоректний id 404", async () => {
  const c = await login("pj5");
  assert.equal((await call(projectApi, req("/api/project?id=js-todo"))).status, 401);
  const ok = await call(projectApi, req("/api/project?id=js-todo", { cookie: c }));
  assert.equal(ok.status, 200);
  assert.deepEqual([ok.data.id, ok.data.requirements.length, typeof ok.data.requirements[0].check, ok.data.starter.includes("task-input")], ["js-todo", 8, "string", true]);
  for (const id of ["nope", "", "JS-TODO", "../x", "x".repeat(60)]) assert.equal((await call(projectApi, req("/api/project?id=" + encodeURIComponent(id), { cookie: c }))).status, 404, id);
});

await test("/api/courses: у структурі є список проєктів і позначка проєкту біля уроку js/17; гостю 401", async () => {
  const c = await login("pj6");
  assert.equal((await call(coursesApi, req("/api/courses"))).status, 401);
  const r = await call(coursesApi, req("/api/courses", { cookie: c }));
  assert.deepEqual(r.data.projects.filter((p) => p.course === "js"), [{ id: "js-todo", title: "Проєкт: список справ", xp: 60, course: "js", lesson: "js/17" }]);
  assert.equal(r.data.courses.js[16].project, "js-todo");
  assert.equal(r.data.courses.js[15].project, undefined);
  assert.ok(!JSON.stringify(r.data).includes("task-input"), "структура курсів не містить умов і перевірок проєкту");
});

console.log(`\nУсі тести проєктів пройдено: ${passed}`);
