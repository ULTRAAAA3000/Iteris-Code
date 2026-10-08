// Запуск: node tests/api.test.mjs  (Node 22+, использует node:sqlite как локальный D1)
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession, readSession, bumpStreak, effectiveStreak, isProActive } from "../lib/session.ts";
import { onRequestPost as google } from "../functions/api/auth/google.ts";
import { onRequestPost as logout } from "../functions/api/auth/logout.ts";
import { onRequestGet as me } from "../functions/api/me.ts";
import { onRequestGet as dashboard } from "../functions/api/dashboard.ts";
import { onRequestGet as progressGet, onRequestPost as progressPost } from "../functions/api/progress.ts";
import { onRequestPost as complete } from "../functions/api/progress/complete.ts";
import { onRequestPost as webhook } from "../functions/api/webhooks/payment.ts";
import { onRequestPost as checkout } from "../functions/api/billing/checkout.ts";
import { onRequestGet as portal } from "../functions/api/billing/portal.ts";
import { entitlementFor, verifySignature } from "../lib/billing.ts";

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
  async batch(list) {            // як D1: усі запити одним блоком, при помилці відкочується все
    sqlite.exec("BEGIN");
    try {
      const out = [];
      for (const s of list) out.push(isSelect(s.q) ? await s.all() : await s.run());
      sqlite.exec("COMMIT");
      return out;
    } catch (e) { sqlite.exec("ROLLBACK"); throw e; }
  },
};

const WH_SECRET = "whsec_test";
const CHECKOUT = "https://iteris.lemonsqueezy.com/checkout/buy/abc-123";
const env = { DB, SESSION_SECRET: "s".repeat(40), GOOGLE_CLIENT_ID: "cid", GOOGLE_CLIENT_SECRET: "sec",
  LEMONSQUEEZY_WEBHOOK_SECRET: WH_SECRET, LEMONSQUEEZY_CHECKOUT_URL: CHECKOUT, LEMONSQUEEZY_VARIANT_ID: "555" };
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
await test("завдання: авторизація, валідація, перевірка Pro на сервері", async () => {
  const C = (body, o = {}) => call(complete, req("/api/progress/complete", { method: "POST", body, cookie, ...o }));
  assert.equal((await call(complete, req("/api/progress/complete", { method: "POST", body: { taskId: "js-safe-city", code: "x", passed: true } }))).status, 401);
  assert.equal((await C({ taskId: "nope", code: "x", passed: true })).status, 400);
  assert.equal((await C({ taskId: "js-safe-city", code: "x".repeat(20001), passed: true })).status, 400);
  assert.equal((await C({ taskId: "js-safe-city", code: "x" })).status, 400);
  assert.equal((await C({ taskId: "js-safe-city", code: "x", passed: true }, { origin: "https://evil.example" })).status, 403);
  // преміум-завдання без підписки
  const denied = await C({ taskId: "js-cart-total", code: "x", passed: true });
  assert.equal(denied.status, 402);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM task_submissions WHERE task_id = 'js-cart-total'").get().c, 0);
  // безкоштовне завдання: перше розв'язання дає XP, повторне — ні
  const first = await C({ taskId: "js-safe-city", code: "ok", passed: true });
  assert.equal(first.status, 200);
  assert.equal(first.data.firstSolve, true); assert.equal(first.data.xp, 20); assert.equal(first.data.streak, 1);
  const again = await C({ taskId: "js-safe-city", code: "ok2", passed: true });
  assert.equal(again.data.firstSolve, false); assert.equal(again.data.xp, 0);
  // невдала спроба не дає XP і не рахується розв'язаною
  const fail = await C({ taskId: "js-counter-bug", code: "bad", passed: false });
  assert.equal(fail.data.firstSolve, false);
  // з активним Pro преміум відкривається
  sqlite.prepare("UPDATE users SET is_pro = 1, pro_until = '2999-01-01 00:00:00' WHERE id = 'g-123'").run();
  assert.equal((await C({ taskId: "js-cart-total", code: "ok", passed: true })).data.xp, 30);
  // термін Pro минув — знову 402
  sqlite.prepare("UPDATE users SET pro_until = '2020-01-01 00:00:00' WHERE id = 'g-123'").run();
  assert.equal((await C({ taskId: "js-group-by", code: "ok", passed: true })).status, 402);
  sqlite.prepare("UPDATE users SET is_pro = 0, pro_until = NULL WHERE id = 'g-123'").run();
});
await test("дашборд повертає розв'язані завдання", async () => {
  const r = await call(dashboard, req("/api/dashboard", { cookie }));
  assert.deepEqual(r.data.passedTasks.sort(), ["js-cart-total", "js-safe-city", "js-sum"]);
  assert.equal(r.data.tasksPassed, 3);
});
await test("ліміт відправок: не більше 20 за хвилину", async () => {
  const ins = sqlite.prepare("INSERT INTO task_submissions (id, user_id, task_id, code, is_passed) VALUES (?, 'g-123', 'rate', 'x', 0)");
  for (let i = 0; i < 20; i++) ins.run("r" + i);
  const r = await call(complete, req("/api/progress/complete", { method: "POST", body: { taskId: "js-safe-city", code: "x", passed: true }, cookie }));
  assert.equal(r.status, 429);
  sqlite.prepare("DELETE FROM task_submissions WHERE task_id = 'rate'").run();
});

/* ---------- Оплата (Lemon Squeezy) ---------- */
const sign = (body, secret = WH_SECRET) => createHmac("sha256", secret).update(body).digest("hex");
let tick = 0;
const stamp = () => new Date(Date.now() + 1000 * ++tick).toISOString();
const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString();
const evBody = (name, o = {}) => JSON.stringify({
  meta: { event_name: name, custom_data: { user_id: o.user ?? "g-123" } },
  data: { type: "subscriptions", id: o.id ?? "sub1", attributes: {
    status: o.status ?? "active", renews_at: o.renews ?? inDays(30), ends_at: o.ends ?? null, updated_at: o.at ?? stamp(),
    variant_id: o.variant ?? 555, urls: { customer_portal: o.portal ?? "https://iteris.lemonsqueezy.com/billing?s=1" } } },
});
const hook = (body, o = {}) => call(webhook, new Request(ORIGIN + "/api/webhooks/payment", {
  method: "POST", body, headers: { "X-Signature": o.sig ?? sign(body), "X-Event-Name": o.name ?? "subscription_created" } }));
const userRow = () => sqlite.prepare("SELECT is_pro, pro_until, portal_url, subscription_id FROM users WHERE id = 'g-123'").get();
const meNow = async () => (await call(me, req("/api/me", { cookie }))).data.user;

await test("вебхук: підпис перевіряється (відсутній, чужий, підроблене тіло)", async () => {
  const body = evBody("subscription_created");
  assert.equal((await call(webhook, new Request(ORIGIN + "/api/webhooks/payment", { method: "POST", body }))).status, 401);
  assert.equal((await hook(body, { sig: sign(body, "інший-секрет") })).status, 401);
  assert.equal((await hook(body, { sig: "zz" })).status, 401);
  assert.equal((await hook(body.replace('"active"', '"expired"'), { sig: sign(body) })).status, 401);
  assert.equal(await verifySignature("k", "x", sign("x", "k")), true);
  assert.equal(await verifySignature("k", "x", null), false);
  const noSecret = await webhook({ request: new Request(ORIGIN + "/", { method: "POST", body }), env: { ...env, LEMONSQUEEZY_WEBHOOK_SECRET: undefined } });
  assert.equal(noSecret.status, 500);
  assert.equal(userRow().is_pro, 0, "без правильного підпису Pro не видається");
});
await test("вебхук: нова підписка видає Pro до кінця оплаченого періоду", async () => {
  const renews = inDays(30);
  const r = await hook(evBody("subscription_created", { renews }));
  assert.equal(r.status, 200); assert.equal(r.data.isPro, true);
  const row = userRow();
  assert.equal(row.is_pro, 1);
  assert.equal(row.pro_until, renews.slice(0, 19).replace("T", " "));
  assert.equal(row.portal_url, "https://iteris.lemonsqueezy.com/billing?s=1");
  assert.equal((await meNow()).isPro, true);
});
await test("вебхук: Pro-завдання тепер доступне через сервер", async () => {
  const r = await call(complete, req("/api/progress/complete", { method: "POST", body: { taskId: "js-group-by", code: "ok", passed: true }, cookie }));
  assert.equal(r.status, 200);
});
await test("вебхук: повторна доставка тієї самої події не змінює нічого", async () => {
  const body = evBody("subscription_updated", { renews: inDays(60) });
  assert.equal((await hook(body, { name: "subscription_updated" })).data.isPro, true);
  const before = userRow().pro_until;
  const again = await hook(body, { name: "subscription_updated" });
  assert.equal(again.data.duplicate, true);
  assert.equal(userRow().pro_until, before);
});
await test("вебхук: запізніла стара подія не скасовує новішу", async () => {
  const old = await hook(evBody("subscription_expired", { status: "expired", at: "2001-01-01T00:00:00.000Z" }), { name: "subscription_expired" });
  assert.equal(old.data.ignored, "stale");
  assert.equal(userRow().is_pro, 1);
});
await test("вебхук: скасування зберігає доступ до кінця періоду, потім знімає", async () => {
  await hook(evBody("subscription_cancelled", { status: "cancelled", ends: inDays(10), renews: null }), { name: "subscription_cancelled" });
  assert.equal((await meNow()).isPro, true, "користувач оплатив період і ще має доступ");
  await hook(evBody("subscription_cancelled", { status: "cancelled", ends: inDays(-1), renews: null }), { name: "subscription_cancelled" });
  assert.equal(userRow().is_pro, 0);
  assert.equal((await meNow()).isPro, false);
  assert.equal((await call(complete, req("/api/progress/complete", { method: "POST", body: { taskId: "js-retry", code: "ok", passed: true }, cookie }))).status, 402);
});
await test("вебхук: відновлення, пауза і закінчення", async () => {
  assert.equal((await hook(evBody("subscription_resumed"), { name: "subscription_resumed" })).data.isPro, true);
  await hook(evBody("subscription_paused", { status: "paused" }), { name: "subscription_paused" });
  assert.equal(userRow().is_pro, 0);
  await hook(evBody("subscription_unpaused"), { name: "subscription_unpaused" });
  assert.equal(userRow().is_pro, 1);
  await hook(evBody("subscription_expired", { status: "expired", ends: inDays(-2) }), { name: "subscription_expired" });
  assert.equal(userRow().is_pro, 0);
});
await test("вебхук: невідомий користувач, чужий товар, інші події та сміття не ламають нічого", async () => {
  assert.equal((await hook(evBody("subscription_created", { user: "нема" }))).data.ignored, "unknown_user");
  assert.equal((await hook(evBody("subscription_created", { variant: 999 }))).data.ignored, "variant");
  assert.equal((await hook(evBody("subscription_created", { status: "дивний" }))).data.ignored, "status");
  const order = JSON.stringify({ meta: { event_name: "order_created" }, data: {} });
  assert.equal((await hook(order, { name: "order_created" })).data.ignored, "event");
  assert.equal((await hook("{не json", { name: "subscription_created" })).status, 400);
  assert.equal((await hook(JSON.stringify({ meta: { event_name: "subscription_created" }, data: { id: 1, attributes: {} } }))).status, 400);
  assert.equal(userRow().is_pro, 0);
});
await test("тарифи: перетворення статусів на доступ", () => {
  const now = Date.parse("2026-10-10T00:00:00Z");
  assert.deepEqual(entitlementFor("active", "2026-11-10T00:00:00Z", null, now), { isPro: true, proUntil: "2026-11-10 00:00:00" });
  assert.equal(entitlementFor("on_trial", "2026-10-17T00:00:00Z", null, now).isPro, true);
  assert.equal(entitlementFor("past_due", "2026-10-10T00:00:00Z", null, now).proUntil, "2026-10-13 00:00:00");
  assert.equal(entitlementFor("cancelled", null, "2026-10-20T00:00:00Z", now).isPro, true);
  assert.equal(entitlementFor("cancelled", null, "2026-10-01T00:00:00Z", now).isPro, false);
  assert.equal(entitlementFor("unpaid", null, null, now).isPro, false);
  assert.equal(entitlementFor("щось", null, null, now), null);
});
await test("оплата: посилання на checkout (авторизація, CSRF, налаштування, домен)", async () => {
  const C = (o = {}, e = env) => checkout({ request: req("/api/billing/checkout", { method: "POST", cookie: o.cookie, origin: o.origin }), env: e }).then(async (r) => ({ status: r.status, data: await r.json() }));
  assert.equal((await C({})).status, 401);
  assert.equal((await C({ cookie, origin: "https://evil.example" })).status, 403);
  assert.equal((await C({ cookie }, { ...env, LEMONSQUEEZY_CHECKOUT_URL: undefined })).status, 503);
  assert.equal((await C({ cookie }, { ...env, LEMONSQUEEZY_CHECKOUT_URL: "https://evil.example/checkout" })).status, 503);
  assert.equal((await C({ cookie }, { ...env, LEMONSQUEEZY_CHECKOUT_URL: "http://iteris.lemonsqueezy.com/x" })).status, 503);
  const ok = await C({ cookie });
  assert.equal(ok.status, 200);
  const u = new URL(ok.data.url);
  assert.equal(u.origin + u.pathname, CHECKOUT);
  assert.equal(u.searchParams.get("checkout[custom][user_id]"), "g-123");
  assert.equal(u.searchParams.get("checkout[email]"), "o@x.ua");
});
await test("оплата: посилання на керування підпискою", async () => {
  assert.equal((await call(portal, req("/api/billing/portal"))).status, 401);
  assert.equal((await call(portal, req("/api/billing/portal", { cookie }))).data.url, "https://iteris.lemonsqueezy.com/billing?s=1");
  sqlite.prepare("UPDATE users SET portal_url = 'https://evil.example/x' WHERE id = 'g-123'").run();
  assert.equal((await call(portal, req("/api/billing/portal", { cookie }))).status, 404, "чужі домени не віддаємо");
  sqlite.prepare("UPDATE users SET portal_url = NULL, subscription_id = NULL, billing_updated_at = NULL WHERE id = 'g-123'").run();
});
await test("міграція 0002 оновлює стару базу й не ламає дані", () => {
  const old = new DatabaseSync(":memory:");
  old.exec("CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, avatar_url TEXT, is_pro INTEGER DEFAULT 0, pro_until DATETIME, streak_count INTEGER DEFAULT 0, last_active_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP); INSERT INTO users (id, email) VALUES ('a', 'a@x.ua');");
  old.exec(readFileSync(new URL("../migrations/0002_payments.sql", import.meta.url), "utf8"));
  const cols = old.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
  for (const c of ["portal_url", "subscription_id", "billing_updated_at"]) assert.ok(cols.includes(c), c);
  assert.equal(old.prepare("SELECT email FROM users").get().email, "a@x.ua");
  old.prepare("INSERT INTO payment_events (id, provider) VALUES ('e1', 'x')").run();
  assert.throws(() => old.prepare("INSERT INTO payment_events (id, provider) VALUES ('e1', 'x')").run(), /UNIQUE/);
});
await test("вихід очищає cookie; видалення користувача каскадом чистить дані", async () => {
  const r = await call(logout, req("/api/auth/logout", { method: "POST" }));
  assert.match(r.headers.get("Set-Cookie"), /Max-Age=0/);
  assert.equal((await call(logout, req("/api/auth/logout", { method: "POST", origin: "https://evil.example" }))).status, 403);
  sqlite.exec("PRAGMA foreign_keys = ON; DELETE FROM users WHERE id = 'g-123';");
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM user_progress").get().c, 0);
});
console.log(`\nУсі тести пройдено: ${passed}`);
