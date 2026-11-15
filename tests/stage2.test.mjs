// Этап 2: XP, уровни, онбординг, путь. Запуск: node tests/stage2.test.mjs  (Node 22+, node:sqlite как локальный D1)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession, sessionCookie } from "../lib/session.ts";
import { onRequestPost as xpSync } from "../functions/api/xp/sync.ts";
import { onRequestGet as onbGet, onRequestPost as onbPost } from "../functions/api/onboarding.ts";
import { onRequestGet as dashboard } from "../functions/api/dashboard.ts";
import { LESSONS } from "../src/data/lessons.js";
import { chaptersOf, currentLesson, levelInfo, levelStep, startLesson, xpAtLevel, STREAK_BONUS } from "../src/xp.ts";
import { TASKS } from "../src/tasks/index.ts";

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
const addLesson = (uid, id, at = "") => sqlite.prepare(`INSERT OR IGNORE INTO user_progress (user_id, lesson_id${at ? ", completed_at" : ""}) VALUES (?, ?${at ? ", ?" : ""})`).run(...(at ? [uid, id, at] : [uid, id]));
const total = (uid) => sqlite.prepare("SELECT COALESCE(SUM(amount), 0) s FROM xp_events WHERE user_id = ?").get(uid).s;

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

await test("рівні: поріг росте, межі точні, рівень не падає зі зростанням XP", () => {
  assert.equal(xpAtLevel(1), 0); assert.equal(xpAtLevel(2), 60); assert.equal(xpAtLevel(3), 140);
  assert.equal(levelStep(1), 60); assert.ok(levelStep(10) > levelStep(2));
  assert.equal(levelInfo(0).level, 1); assert.equal(levelInfo(59).level, 1); assert.equal(levelInfo(60).level, 2); assert.equal(levelInfo(139).level, 2); assert.equal(levelInfo(140).level, 3);
  const i = levelInfo(100); assert.deepEqual([i.level, i.into, i.need, i.pct], [2, 40, 80, 50]);
  let last = 1; for (let x = 0; x < 20000; x += 7) { const l = levelInfo(x).level; assert.ok(l >= last); last = l; }
  assert.equal(levelInfo(-5).level, 1); assert.equal(levelInfo(NaN).total, 0);
});

await test("глави й старт за рівнем: для кожного курсу старт це початок глави, попередні глави лишаються", () => {
  for (const [k, list] of Object.entries(LESSONS)) {
    const chs = chaptersOf(list);
    assert.ok(chs.length >= 1, k);
    assert.equal(chs.reduce((s, c) => s + (c.to - c.from + 1), 0), list.length, k + ": глави покривають усі уроки без пропусків");
    const b = startLesson(list, "beginner"), m = startLesson(list, "intermediate"), a = startLesson(list, "advanced");
    assert.equal(b, 1, k); assert.ok(m >= b && a >= m, k);
    for (const s of [b, m, a]) assert.ok(chs.some((c) => c.from === s), k + ": старт на початку глави");
  }
  assert.ok(startLesson(LESSONS.python, "advanced") > 1);
});

await test("поточний урок: перший непройдений від старту, потім перший непройдений, 0 якщо все пройдено", () => {
  const d = new Set([1, 2, 5]);
  assert.equal(currentLesson(10, 1, (n) => d.has(n)), 3);
  assert.equal(currentLesson(10, 5, (n) => d.has(n)), 6);
  assert.equal(currentLesson(10, 9, (n) => n >= 9 && n <= 10 || d.has(n)), 3);
  assert.equal(currentLesson(3, 1, () => true), 0);
});

const cookieA = await login("ann");
await test("XP: без входу 401, чужий Origin 403", async () => {
  assert.equal((await call(xpSync, req("/api/xp/sync", { method: "POST" }))).status, 401);
  assert.equal((await call(xpSync, req("/api/xp/sync", { method: "POST", cookie: cookieA, origin: "https://evil.example" }))).status, 403);
});

await test("XP: пройдені уроки дають по 10, неіснуючі уроки ігноруються, повтор нічого не додає", async () => {
  for (const id of ["js/1", "js/2", "zzz/9", "js/999", "python/1"]) addLesson("ann", id);
  const r = await sync(cookieA);
  assert.equal(r.status, 200); assert.equal(r.data.xp, 30); assert.equal(r.data.gained.length, 3);
  assert.deepEqual(r.data.gained.map((e) => e.reason), ["lesson", "lesson", "lesson"]);
  assert.equal((await sync(cookieA)).data.gained.length, 0);
  assert.equal(total("ann"), 30);
});

await test("XP не накручується: зняття відмітки й повторна відмітка не дають нового XP, зняття не забирає XP", async () => {
  sqlite.prepare("DELETE FROM user_progress WHERE user_id = 'ann' AND lesson_id = 'js/1'").run();
  assert.equal((await sync(cookieA)).data.xp, 30);
  addLesson("ann", "js/1");
  const r = await sync(cookieA);
  assert.equal(r.data.xp, 30); assert.equal(r.data.gained.length, 0);
});

await test("XP за завдання: лише розв'язані, один раз, у розмірі xp завдання", async () => {
  const t = TASKS[0];
  sqlite.prepare("INSERT INTO task_submissions (id, user_id, task_id, code, is_passed) VALUES ('s1', 'ann', ?, 'x', 0)").run(t.id);
  assert.equal((await sync(cookieA)).data.xp, 30);                              // невдала спроба нічого не дає
  sqlite.prepare("INSERT INTO task_submissions (id, user_id, task_id, code, is_passed) VALUES ('s2', 'ann', ?, 'x', 1)").run(t.id);
  sqlite.prepare("INSERT INTO task_submissions (id, user_id, task_id, code, is_passed) VALUES ('s3', 'ann', ?, 'x', 1)").run(t.id);
  const r = await sync(cookieA);
  assert.equal(r.data.xp, 30 + t.xp); assert.deepEqual(r.data.gained.map((e) => [e.reason, e.ref, e.amount]), [["task", t.id, t.xp]]);
  sqlite.prepare("INSERT INTO task_submissions (id, user_id, task_id, code, is_passed) VALUES ('s4', 'ann', 'no-such-task', 'x', 1)").run();
  assert.equal((await sync(cookieA)).data.xp, 30 + t.xp);                       // невідоме завдання ігнорується
});

await test("XP за серію: позначки 3 і 7 дають бонус один раз; рівень підвищується й це видно у відповіді", async () => {
  const before = (await sync(cookieA)).data;
  sqlite.prepare("UPDATE users SET streak_count = 3, last_active_at = CURRENT_TIMESTAMP WHERE id = 'ann'").run();
  const r3 = await sync(cookieA);
  assert.deepEqual(r3.data.gained.map((e) => [e.reason, e.ref, e.amount]), [["streak", "3", STREAK_BONUS[3]]]);
  assert.equal(r3.data.xp, before.xp + STREAK_BONUS[3]);
  assert.equal((await sync(cookieA)).data.gained.length, 0);
  sqlite.prepare("UPDATE users SET streak_count = 7 WHERE id = 'ann'").run();
  const r7 = await sync(cookieA);
  assert.deepEqual(r7.data.gained.map((e) => e.ref), ["7"]);
  const t = total("ann"), lv = levelInfo(t).level;
  assert.equal(r7.data.level, lv);
  // серія згасла (остання активність давно) бонус не нараховується
  const cookieB = await login("bob");
  sqlite.prepare("UPDATE users SET streak_count = 30, last_active_at = '2020-01-01 00:00:00' WHERE id = 'bob'").run();
  assert.equal((await sync(cookieB)).data.gained.length, 0);
});

await test("підвищення рівня: leveledUp і prevLevel у відповіді", async () => {
  const c = await login("cy");
  for (let n = 1; n <= 7; n++) addLesson("cy", "python/" + n);                  // 70 XP, рівень 2 (поріг 60)
  const r = await sync(c);
  assert.deepEqual([r.data.xp, r.data.prevLevel, r.data.level, r.data.leveledUp], [70, 1, 2, true]);
  addLesson("cy", "python/8");
  assert.equal((await sync(c)).data.leveledUp, false);
});

await test("паралельні запити не подвоюють XP (унікальність user_id + reason + ref)", async () => {
  const c = await login("dan");
  for (let n = 1; n <= 5; n++) addLesson("dan", "html/" + n);
  await Promise.all([sync(c), sync(c), sync(c)]);
  assert.equal(total("dan"), 50);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM xp_events WHERE user_id = 'dan'").get().c, 5);
  assert.throws(() => sqlite.prepare("INSERT INTO xp_events (user_id, amount, reason, ref) VALUES ('dan', 10, 'lesson', 'html/1')").run());
});

await test("онбординг: до вибору null, валідація відхиляє сміття, вибір зберігається й оновлюється", async () => {
  const c = await login("eva");
  assert.equal((await call(onbGet, req("/api/onboarding"))).status, 401);
  assert.equal((await call(onbGet, req("/api/onboarding", { cookie: c }))).data.onboarding, null);
  const post = (body, over = {}) => call(onbPost, req("/api/onboarding", { method: "POST", cookie: c, body, ...over }));
  for (const bad of [{}, { level: "pro", courses: ["js"] }, { level: "beginner", courses: [] }, { level: "beginner", courses: ["zzz"] }, { level: "beginner", courses: "js" },
    { level: "beginner", courses: ["js", "py"] }, { level: "beginner", courses: ["html", "css", "js", "ts", "python", "go"] }, { level: "beginner", courses: [1] }, { level: "beginner", courses: ["__proto__"] }, { level: "beginner", courses: ["constructor"] }]) {
    assert.equal((await post(bad)).status, 400, JSON.stringify(bad));
  }
  assert.equal((await post({ level: "beginner", courses: ["js"] }, { origin: "https://evil.example" })).status, 403);
  assert.equal((await call(onbPost, req("/api/onboarding", { method: "POST", body: { level: "beginner", courses: ["js"] } }))).status, 401);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM user_onboarding WHERE user_id = 'eva'").get().c, 0);
  assert.equal((await post({ level: "beginner", courses: ["js", "js", "python"] })).status, 200);
  assert.deepEqual((await call(onbGet, req("/api/onboarding", { cookie: c }))).data.onboarding, { level: "beginner", courses: ["js", "python"] });
  assert.equal((await post({ level: "advanced", courses: ["sql"] })).status, 200);
  assert.deepEqual((await call(onbGet, req("/api/onboarding", { cookie: c }))).data.onboarding, { level: "advanced", courses: ["sql"] });
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM user_onboarding WHERE user_id = 'eva'").get().c, 1);
});

await test("кабінет: xp, онбординг і дні календаря (уроки й розв'язані завдання за UTC-днями)", async () => {
  const c = await login("fay");
  const today = new Date().toISOString().slice(0, 10), t = TASKS[0];
  addLesson("fay", "js/1"); addLesson("fay", "js/2");
  sqlite.prepare("INSERT INTO task_submissions (id, user_id, task_id, code, is_passed) VALUES ('f1', 'fay', ?, 'x', 1), ('f2', 'fay', ?, 'x', 1), ('f3', 'fay', ?, 'x', 0)").run(t.id, t.id, t.id);
  const d = (await call(dashboard, req("/api/dashboard", { cookie: c }))).data;
  assert.equal(d.xp, 20 + t.xp);
  assert.equal(d.onboarding, null);
  assert.deepEqual(d.days[today].l.sort(), ["js/1", "js/2"]);
  assert.deepEqual(d.days[today].t, [t.id]);                                    // однакові розв'язки одного завдання за день не дублюються
  assert.ok(d.activity[today] >= 2);                                            // старе поле activity лишилось
  await call(onbPost, req("/api/onboarding", { method: "POST", cookie: c, body: { level: "intermediate", courses: ["js"] } }));
  assert.deepEqual((await call(dashboard, req("/api/dashboard", { cookie: c }))).data.onboarding, { level: "intermediate", courses: ["js"] });
});

await test("кабінет: старі дні потрапляють у календар, що старше пів року ні", async () => {
  const c = await login("gus");
  addLesson("gus", "js/1", "2020-01-01 10:00:00");
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  addLesson("gus", "js/2", yesterday + " 23:59:59");
  const d = (await call(dashboard, req("/api/dashboard", { cookie: c }))).data;
  assert.deepEqual(Object.keys(d.days), [yesterday]);
  assert.equal(d.xp, 20);                                                       // але XP за давній урок нараховано
});

console.log(`\nУсі тести Етапу 2 пройдено: ${passed}`);
