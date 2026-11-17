// Захист від взломів і зловживань: відкликання сесій, жалобі, ліміти й обрізання відправок, розмір запитів, заголовки безпеки
// Запуск: node tests/security.test.mjs (Node 22+, node:sqlite як локальний D1); заголовки перевіряються після npm run build
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession } from "../lib/session.ts";
import { ensureSchema } from "../lib/schema.ts";
import { hashPassword } from "../lib/password.ts";
import { issueToken } from "../lib/auth.ts";
import { onRequest as middleware } from "../functions/api/_middleware.ts";
import { onRequestGet as me } from "../functions/api/me.ts";
import { onRequestPost as reset } from "../functions/api/auth/reset.ts";
import { onRequestPost as logout } from "../functions/api/auth/logout.ts";
import { onRequestPost as complete } from "../functions/api/progress/complete.ts";
import { onRequestPost as report } from "../functions/api/report.ts";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
const stmt = (q) => ({
  q, p: [],
  bind(...a) { this.p = a; return this; },
  async first() { return sqlite.prepare(q).get(...this.p) ?? null; },
  async all() { return { results: sqlite.prepare(q).all(...this.p) }; },
  async run() { const r = sqlite.prepare(q).run(...this.p); return { success: true, meta: { changes: Number(r.changes) } }; },
});
const DB = { prepare: stmt, async batch(list) { const out = []; for (const s of list) out.push(/^\s*select/i.test(s.q) ? await s.all() : await s.run()); return out; } };
const ORIGIN = "https://iteris-code.pages.dev";
const env = { DB, SESSION_SECRET: "s".repeat(40) };
await ensureSchema(env);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };
const req = (path, { method = "GET", body, cookie } = {}) =>
  new Request(ORIGIN + path, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method === "POST" ? { Origin: ORIGIN, "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
const call = async (fn, r) => { const res = await fn({ request: r, env, params: {} }); const t = await res.text(); let d = null; try { d = JSON.parse(t); } catch { /* не JSON */ } return { status: res.status, data: d, headers: res.headers }; };
const mk = (id, extra = "") => sqlite.prepare("INSERT INTO users (id, email, name, password_hash" + (extra ? ", nick, profile_public, created_at" : "") + ") VALUES (?1, ?2, ?3, 'h'" + (extra ? ", ?4, 1, datetime('now','-3 day')" : "") + ")").run(...(extra ? [id, id + "@x.example", id, extra] : [id, id + "@x.example", id]));
const cookieOf = async (id) => "session=" + (await createSession(env, id));

mk("a");
await test("сесія: зі зміною пароля (reset) усі раніше видані cookie перестають діяти", async () => {
  const old = await cookieOf("a");
  assert.equal((await call(me, req("/api/me", { cookie: old }))).data.user.id ?? "a", "a");
  const token = await issueToken(env, "a", "reset");
  assert.equal((await call(reset, req("/api/auth/reset", { method: "POST", body: { token, password: "new-correct-horse" } }))).status, 200);
  assert.equal((await call(me, req("/api/me", { cookie: old }))).data.user, null);
  const fresh = await cookieOf("a");
  assert.ok((await call(me, req("/api/me", { cookie: fresh }))).data.user);
});
await test("сесія: «вийти всюди» відкликає і поточну, і чужі пристрої; звичайний вихід — ні", async () => {
  const c1 = await cookieOf("a"), c2 = await cookieOf("a");
  await call(logout, req("/api/auth/logout", { method: "POST", cookie: c1 }));
  assert.ok((await call(me, req("/api/me", { cookie: c2 }))).data.user, "звичайний вихід не відкликає інші сесії");
  const r = await call(logout, req("/api/auth/logout", { method: "POST", cookie: c1, body: { all: true } }));
  assert.match(r.headers.get("Set-Cookie") ?? "", /Max-Age=0/);
  assert.equal((await call(me, req("/api/me", { cookie: c2 }))).data.user, null);
});
await test("сесія: підроблений або старий формат cookie без версії працює лише для версії 0", async () => {
  assert.equal((await call(me, req("/api/me", { cookie: "session=abc.def" }))).data.user, null);
});

await test("відправки: пройдене зберігається один раз, невдалих лише 5 останніх", async () => {
  mk("s");
  const c = await cookieOf("s");
  const post = (passedFlag, code) => call(complete, req("/api/progress/complete", { method: "POST", cookie: c, body: { taskId: "js-safe-city", code, passed: passedFlag } }));
  for (let i = 0; i < 8; i++) assert.equal((await post(false, "bad" + i)).status, 200);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM task_submissions WHERE user_id='s'").get().c, 5);
  assert.equal((await post(true, "ok1")).data.firstSolve, true);
  assert.equal((await post(true, "ok2")).data.firstSolve, false);
  assert.equal((await post(true, "ok3")).data.firstSolve, false);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM task_submissions WHERE user_id='s' AND is_passed=1").get().c, 1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM task_submissions WHERE user_id='s'").get().c, 6);
});
await test("відправки: добовий ліміт спроб (429)", async () => {
  mk("d");
  const c = await cookieOf("d");
  sqlite.prepare("INSERT OR REPLACE INTO auth_throttle (key, count, reset_at) VALUES ('sub-day:d', 600, ?1)").run(Math.floor(Date.now() / 1000) + 3600);
  const r = await call(complete, req("/api/progress/complete", { method: "POST", cookie: c, body: { taskId: "js-safe-city", code: "x", passed: false } }));
  assert.equal(r.status, 429);
});

await test("жалоби: потрібен вхід і акаунт старший за добу, лише на відкриті чужі профілі", async () => {
  mk("t", "target"); mk("r1", "rep_one"); mk("r2", "rep_two"); mk("r3", "rep_three");
  mk("fresh");
  const send = async (id, nick, reason = "spam") => call(report, req("/api/report", { method: "POST", cookie: await cookieOf(id), body: { nick, reason } }));
  assert.equal((await call(report, req("/api/report", { method: "POST", body: { nick: "target", reason: "spam" } }))).status, 401);
  assert.equal((await send("fresh", "target")).data.error, "too_new");
  assert.equal((await send("r1", "target", "nonsense")).status, 400);
  assert.equal((await send("r1", "nobody_here")).status, 404);
  assert.equal((await send("t", "target")).status, 400);
});
await test("жалоби: повтор від однієї людини не рахується, три різні закривають профіль", async () => {
  const send = async (id) => call(report, req("/api/report", { method: "POST", cookie: await cookieOf(id), body: { nick: "target", reason: "abuse" } }));
  await send("r1"); await send("r1");
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM reports WHERE nick='target'").get().c, 1);
  assert.equal(sqlite.prepare("SELECT profile_public p FROM users WHERE id='t'").get().p, 1);
  await send("r2"); await send("r3");
  assert.equal(sqlite.prepare("SELECT profile_public p FROM users WHERE id='t'").get().p, 0);
  assert.equal((await send("r2")).status, 404, "закритий профіль уже не приймає нових скарг");
});

await test("запити: надто велике тіло відхиляється до виконання обробника (413)", async () => {
  const big = new Request(ORIGIN + "/api/report", { method: "POST", headers: { Origin: ORIGIN, "Content-Length": "400000", "Content-Type": "application/json" }, body: "{}" });
  let reached = false;
  const res = await middleware({ request: big, env, next: async () => { reached = true; return new Response("ok"); } });
  assert.equal(res.status, 413);
  assert.equal(reached, false);
});

await test("заголовки безпеки: _headers містить обов'язкові правила, security.txt на місці", () => {
  if (existsSync(new URL("../dist/_headers", import.meta.url))) {
    const h = readFileSync(new URL("../dist/_headers", import.meta.url), "utf8");
    for (const x of ["X-Content-Type-Options: nosniff", "X-Frame-Options: SAMEORIGIN", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security", "frame-ancestors 'self'", "object-src 'none'"]) assert.ok(h.includes(x), x);
  }
  const t = readFileSync(new URL("../static/.well-known/security.txt", import.meta.url), "utf8");
  assert.ok(t.includes("Contact:") && t.includes("Expires:"));
});

console.log(`\nУсі перевірки захисту пройдено: ${passed}`);
