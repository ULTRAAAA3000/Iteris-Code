// Запуск: node tests/api.test.mjs  (Node 22+, использует node:sqlite как локальный D1)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession, readSession, bumpStreak, effectiveStreak, isProActive } from "../lib/session.js";
import { onRequestPost as google } from "../functions/api/auth/google.js";
import { onRequestPost as logout } from "../functions/api/auth/logout.js";
import { onRequestGet as me } from "../functions/api/me.js";
import { onRequestGet as dashboard } from "../functions/api/dashboard.js";
import { onRequestGet as progressGet, onRequestPost as progressPost } from "../functions/api/progress.js";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
const stmt = (q) => ({
  p: [],
  bind(...a) { this.p = a; return this; },
  async first() { return sqlite.prepare(q).get(...this.p) ?? null; },
  async all() { return { results: sqlite.prepare(q).all(...this.p) }; },
  async run() { sqlite.prepare(q).run(...this.p); return { success: true }; },
});
const DB = { prepare: stmt, batch: (list) => Promise.all(list.map((s) => s.all())) };   // batch використовується лише для SELECT

const env = { DB, SESSION_SECRET: "s".repeat(40), GOOGLE_CLIENT_ID: "cid", GOOGLE_CLIENT_SECRET: "sec" };
const ORIGIN = "https://iteris-code.pages.dev";
const req = (path, { method = "GET", body, cookie, origin = ORIGIN } = {}) =>
  new Request(ORIGIN + path, {
    method,
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method === "POST" ? { Origin: origin, "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
const call = async (fn, r) => { const res = await fn({ request: r, env }); return { status: res.status, data: await res.json(), headers: res.headers }; };

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

// Підміна Google
globalThis.fetch = async (url, opts) => {
  if (String(url).includes("oauth2.googleapis.com/token")) {
    const b = opts.body;
    return b.get("code") === "good" && b.get("redirect_uri") === ORIGIN + "/" ? Response.json({ access_token: "tok" }) : new Response("{}", { status: 400 });
  }
  return Response.json({ sub: "g-123", email: "o@x.ua", name: "Олена", picture: "https://lh3.googleusercontent.com/a.jpg", email_verified: true });
};

let cookie;
await test("сесія: підпис, читання, підробка, строк дії", async () => {
  const c = await createSession(env, "u1");
  assert.equal(await readSession(req("/", { cookie: "session=" + c }), env), "u1");
  assert.equal(await readSession(req("/", { cookie: "session=" + c.slice(0, -2) + "xx" }), env), null);
  assert.equal(await readSession(req("/", { cookie: "session=" + c }), { ...env, SESSION_SECRET: "other".repeat(10) }), null);
  assert.equal(await readSession(req("/", { cookie: "a=1; session=" + c }), env), "u1");
  assert.equal(await readSession(req("/"), env), null);
  const expired = await createSession(env, "u1", -1);
  assert.equal(await readSession(req("/", { cookie: "session=" + expired }), env), null);
});
await test("вхід Google: відмова з чужого Origin та з поганим кодом", async () => {
  assert.equal((await call(google, req("/api/auth/google", { method: "POST", body: { code: "good" }, origin: "https://evil.example" }))).status, 403);
  assert.equal((await call(google, req("/api/auth/google", { method: "POST", body: { code: "bad" } }))).status, 401);
  assert.equal((await call(google, req("/api/auth/google", { method: "POST", body: {} }))).status, 400);
});
await test("вхід Google: створює користувача та cookie HttpOnly/Secure/SameSite", async () => {
  const r = await call(google, req("/api/auth/google", { method: "POST", body: { code: "good" } }));
  assert.equal(r.status, 200);
  const sc = r.headers.get("Set-Cookie");
  assert.match(sc, /HttpOnly/); assert.match(sc, /Secure/); assert.match(sc, /SameSite=Lax/);
  cookie = sc.split(";")[0];
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM users").get().c, 1);
  await call(google, req("/api/auth/google", { method: "POST", body: { code: "good" } }));   // повторний вхід — UPSERT
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM users").get().c, 1);
});
await test("/api/me: гість і користувач", async () => {
  assert.equal((await call(me, req("/api/me"))).data.user, null);
  const r = await call(me, req("/api/me", { cookie }));
  assert.equal(r.data.user.email, "o@x.ua"); assert.equal(r.data.user.isPro, false); assert.equal(r.data.user.streak, 0);
});
await test("/api/dashboard і /api/progress: без сесії 401", async () => {
  assert.equal((await call(dashboard, req("/api/dashboard"))).status, 401);
  assert.equal((await call(progressGet, req("/api/progress"))).status, 401);
  assert.equal((await call(progressPost, req("/api/progress", { method: "POST", body: { lessonIds: ["python/1"] } }))).status, 401);
});
await test("прогрес: валідація, відмітка, зняття відмітки, стрік", async () => {
  const P = (body, o = {}) => call(progressPost, req("/api/progress", { method: "POST", body, cookie, ...o }));
  assert.equal((await P({ lessonIds: ["../etc"] })).status, 400);
  assert.equal((await P({ lessonIds: [] })).status, 400);
  assert.equal((await P({ lessonIds: ["python/1"] }, { origin: "https://evil.example" })).status, 403);
  let r = await P({ lessonIds: ["python/1"], done: true });
  assert.equal(r.data.streak, 1);
  r = await P({ lessonIds: ["python/2", "python/1"], done: true });
  assert.equal(r.data.streak, 1, "у той самий день стрік не росте");
  assert.deepEqual((await call(progressGet, req("/api/progress", { cookie }))).data.lessonIds.sort(), ["python/1", "python/2"]);
  await P({ lessonIds: ["python/2"], done: false });
  assert.deepEqual((await call(progressGet, req("/api/progress", { cookie }))).data.lessonIds, ["python/1"]);
  await P({ lessonIds: ["js/1", "js/2", "js/3"], done: true, sync: true });
  assert.equal((await call(progressGet, req("/api/progress", { cookie }))).data.lessonIds.length, 4);
});
await test("стрік: вчора +1, пропуск скидає до 1, давня активність дає 0", async () => {
  const d = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 19).replace("T", " ");
  assert.equal(bumpStreak({ streak_count: 4, last_active_at: d(1) }), 5);
  assert.equal(bumpStreak({ streak_count: 4, last_active_at: d(3) }), 1);
  assert.equal(bumpStreak({ streak_count: 0, last_active_at: null }), 1);
  assert.equal(effectiveStreak({ streak_count: 4, last_active_at: d(1) }), 4);
  assert.equal(effectiveStreak({ streak_count: 4, last_active_at: d(2) }), 0);
});
await test("Pro: активний лише до pro_until", () => {
  assert.equal(isProActive({ is_pro: 1, pro_until: null }), true);
  assert.equal(isProActive({ is_pro: 1, pro_until: "2999-01-01 00:00:00" }), true);
  assert.equal(isProActive({ is_pro: 1, pro_until: "2020-01-01 00:00:00" }), false);
  assert.equal(isProActive({ is_pro: 0, pro_until: "2999-01-01" }), false);
});
await test("дашборд: уроки, остання активність, календар, сабміти", async () => {
  sqlite.prepare("INSERT INTO task_submissions (id, user_id, task_id, code, is_passed) VALUES ('s1','g-123','js-sum','x',1),('s2','g-123','js-sum','y',0)").run();
  const r = await call(dashboard, req("/api/dashboard", { cookie }));
  assert.equal(r.status, 200);
  assert.equal(r.data.completedLessons.length, 4);
  assert.match(r.data.lastLesson, /^(js|python)\/\d+$/);
  assert.equal(r.data.tasksPassed, 1);
  assert.equal(r.data.recentSubmissions.length, 2);
  const today = new Date().toISOString().slice(0, 10);
  assert.equal(r.data.activity[today], 4 + 2);
  assert.equal(r.data.user.streak, 1);
});
await test("вихід очищає cookie; видалення користувача каскадом чистить дані", async () => {
  const r = await call(logout, req("/api/auth/logout", { method: "POST" }));
  assert.match(r.headers.get("Set-Cookie"), /Max-Age=0/);
  assert.equal((await call(logout, req("/api/auth/logout", { method: "POST", origin: "https://evil.example" }))).status, 403);
  sqlite.exec("PRAGMA foreign_keys = ON; DELETE FROM users WHERE id = 'g-123';");
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM user_progress").get().c, 0);
});
console.log(`\nУсі тести пройдено: ${passed}`);
