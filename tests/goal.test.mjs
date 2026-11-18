// Денна ціль: підрахунок кроків за сьогодні, /api/goal, збереження цілі в онбордингу, дані в /api/dashboard. Запуск: node tests/goal.test.mjs (Node 22+)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { onRequestGet as dashboard } from "../functions/api/dashboard.ts";
import { onRequestGet as goalGet, onRequestPost as goalPost } from "../functions/api/goal.ts";
import { onRequestGet as onbGet, onRequestPost as onbPost } from "../functions/api/onboarding.ts";
import { goalInfo, loadGoal, stepsToday } from "../lib/goal.ts";
import { createSession, sessionCookie } from "../lib/session.ts";
import { DEFAULT_GOAL, GOALS, isGoal } from "../src/goal.ts";

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
const DB = { prepare: stmt, async batch(list) { const out = []; for (const s of list) out.push(isSelect(s.q) ? await s.all() : await s.run()); return out; } };
const env = { DB, SESSION_SECRET: "s".repeat(40) };
const ORIGIN = "https://iteris-code.pages.dev";
const req = (path, { body, cookie, origin = ORIGIN, method = body ? "POST" : "GET" } = {}) =>
  new Request(ORIGIN + path, { method, headers: { Origin: origin, "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
const call = async (fn, r) => { const res = await fn({ request: r, env }); return { status: res.status, data: await res.json() }; };
const login = async (id) => {
  sqlite.prepare("INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)").run(id, id + "@x.ua", id);
  return sessionCookie(await createSession(env, id, 30), 3600).split(";")[0];
};
const lesson = (u, id, when) => sqlite.prepare("INSERT INTO user_progress (user_id, lesson_id, completed_at) VALUES (?, ?, datetime('now', ?))").run(u, id, when);
let n = 0;
const submit = (u, task, passed, when) => sqlite.prepare("INSERT INTO task_submissions (id, user_id, task_id, code, is_passed, created_at) VALUES (?, ?, ?, 'x', ?, datetime('now', ?))").run("s" + ++n, u, task, passed ? 1 : 0, when);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

await test("значення цілі: 1, 2, 3, 5; за замовчуванням 1; чужі значення відхиляються", () => {
  assert.deepEqual([...GOALS], [1, 2, 3, 5]);
  assert.equal(DEFAULT_GOAL, 1);
  for (const v of [1, 2, 3, 5]) assert.equal(isGoal(v), true);
  for (const v of [0, 4, 6, -1, 2.5, "3", null, undefined, NaN]) assert.equal(isGoal(v), false, String(v));
});

await test("кроки за сьогодні: уроки, що пройдені сьогодні, і завдання, вперше розв'язані сьогодні", async () => {
  await login("a");
  lesson("a", "js/1", "+0 seconds"); lesson("a", "js/2", "+0 seconds"); lesson("a", "js/3", "-1 day");
  submit("a", "js-fizzbuzz", true, "+0 seconds");
  submit("a", "js-fizzbuzz", true, "+0 seconds");   // повторне розв'язання того самого не додає кроку
  submit("a", "js-type-of", false, "+0 seconds");   // невдала спроба не рахується
  assert.equal(await stepsToday(env, "a"), 3, "2 уроки + 1 завдання");
});

await test("завдання, вперше розв'язане вчора, при повторі сьогодні нового кроку не дає", async () => {
  await login("b");
  submit("b", "js-fizzbuzz", true, "-1 day");
  submit("b", "js-fizzbuzz", true, "+0 seconds");
  assert.equal(await stepsToday(env, "b"), 0);
});

await test("без активності: 0 кроків; чужі дані не потрапляють", async () => {
  await login("c");
  assert.equal(await stepsToday(env, "c"), 0);
  assert.deepEqual(await goalInfo(env, "c"), { target: 1, done: 0, custom: false });
});

await test("GET /api/goal: за замовчуванням ціль 1 і custom: false; без входу 401", async () => {
  const cookie = await login("g1");
  const r = await call(goalGet, req("/api/goal", { cookie }));
  assert.deepEqual(r.data.goal, { target: 1, done: 0, custom: false });
  assert.equal((await call(goalGet, req("/api/goal"))).status, 401);
});

await test("POST /api/goal: зберігає 3, потім змінюється на 5; кроки враховуються", async () => {
  const cookie = await login("g2");
  lesson("g2", "js/1", "+0 seconds");
  let r = await call(goalPost, req("/api/goal", { body: { goal: 3 }, cookie }));
  assert.deepEqual(r.data.goal, { target: 3, done: 1, custom: true });
  assert.equal(await loadGoal(env, "g2"), 3);
  r = await call(goalPost, req("/api/goal", { body: { goal: 5 }, cookie }));
  assert.equal(r.data.goal.target, 5);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM user_goals WHERE user_id = 'g2'").get().c, 1, "один рядок на людину");
});

await test("POST /api/goal: некоректне значення, чужий Origin, без входу", async () => {
  const cookie = await login("g3");
  for (const goal of [0, 4, 10, "3", null, 2.5]) assert.equal((await call(goalPost, req("/api/goal", { body: { goal }, cookie }))).status, 400, String(goal));
  assert.equal((await call(goalPost, req("/api/goal", { body: {}, cookie }))).status, 400);
  assert.equal((await call(goalPost, req("/api/goal", { body: { goal: 2 }, cookie, origin: "https://evil.example" }))).status, 403);
  assert.equal((await call(goalPost, req("/api/goal", { body: { goal: 2 } }))).status, 401);
  assert.equal(await loadGoal(env, "g3"), null, "нічого не збереглось");
});

await test("онбординг: ціль зберігається разом з вибором, GET її повертає", async () => {
  const cookie = await login("o1");
  const r = await call(onbPost, req("/api/onboarding", { body: { level: "beginner", courses: ["js"], dailyGoal: 2 }, cookie }));
  assert.equal(r.status, 200);
  assert.equal(await loadGoal(env, "o1"), 2);
  const g = await call(onbGet, req("/api/onboarding", { cookie }));
  assert.equal(g.data.goal, 2);
  assert.deepEqual(g.data.onboarding.courses, ["js"]);
});

await test("онбординг: ціль необов'язкова; некоректна відхиляється й нічого не змінює", async () => {
  const cookie = await login("o2");
  assert.equal((await call(onbPost, req("/api/onboarding", { body: { level: "beginner", courses: ["js"] }, cookie }))).status, 200);
  assert.equal(await loadGoal(env, "o2"), null, "без цілі рядка в user_goals немає");
  assert.equal((await call(onbGet, req("/api/onboarding", { cookie }))).data.goal, null);
  const bad = await call(onbPost, req("/api/onboarding", { body: { level: "advanced", courses: ["python"], dailyGoal: 7 }, cookie }));
  assert.equal(bad.status, 400);
  const still = await call(onbGet, req("/api/onboarding", { cookie }));
  assert.equal(still.data.onboarding.level, "beginner", "вибір не перезаписано");
});

await test("повторний онбординг без цілі не стирає раніше обрану ціль", async () => {
  const cookie = await login("o3");
  await call(onbPost, req("/api/onboarding", { body: { level: "beginner", courses: ["js"], dailyGoal: 5 }, cookie }));
  await call(onbPost, req("/api/onboarding", { body: { level: "advanced", courses: ["go"] }, cookie }));
  assert.equal(await loadGoal(env, "o3"), 5);
});

await test("/api/dashboard: містить goal з кроками за сьогодні", async () => {
  const cookie = await login("d1");
  lesson("d1", "js/1", "+0 seconds");
  await call(goalPost, req("/api/goal", { body: { goal: 2 }, cookie }));
  const r = await call(dashboard, req("/api/dashboard", { cookie }));
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.goal, { target: 2, done: 1, custom: true });
});

console.log(`\nУсі тести денної цілі пройдено: ${passed}`);
