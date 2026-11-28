// Юридичні вимоги: вік 15+ при реєстрації, вигрузка даних, видалення акаунта, сторінки політики й умов
// Запуск: node tests/account.test.mjs (Node 22+, node:sqlite як локальний D1)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession } from "../lib/session.ts";
import { ensureSchema } from "../lib/schema.ts";
import { onRequestGet as exportData, onRequestPost as deleteAccount } from "../functions/api/account.ts";
import { onRequestPost as register } from "../functions/api/auth/register.ts";
import { findPage } from "../src/pages.ts";

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
const reg = (age) => call(register, req("/api/auth/register", { method: "POST", body: { email: "kid@example.com", password: "correct-horse", age } }));

await test("реєстрація: без віку, нечислом і до 15 років відмовляємо", async () => {
  assert.equal((await reg(undefined)).data.error, "invalid_age");
  assert.equal((await reg("abc")).data.error, "invalid_age");
  assert.equal((await reg(0)).data.error, "invalid_age");
  assert.equal((await reg(14)).data.error, "too_young");
  assert.equal((await reg(14)).status, 400);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM users").get().c, 0);
});
await test("реєстрація: 15 років і старше проходять, вік у базі не зберігається", async () => {
  const r = await reg(15);
  assert.equal(r.status, 200);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM users").get().c, 1);
  const cols = sqlite.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
  assert.ok(!cols.includes("age"));
});

const mk = (id) => sqlite.prepare("INSERT INTO users (id, email, name, password_hash) VALUES (?1, ?2, ?3, 'secret-hash')").run(id, id + "@example.com", id);
mk("a"); mk("b");
for (const u of ["a", "b"]) {
  sqlite.prepare("INSERT INTO user_progress (user_id, lesson_id) VALUES (?1, 'python/1')").run(u);
  sqlite.prepare("INSERT INTO xp_events (user_id, amount, reason, ref) VALUES (?1, 10, 'lesson', 'python/1')").run(u);
}
sqlite.prepare("UPDATE users SET nick = 'nick_a', email_verified = 1 WHERE id = 'a'").run();
sqlite.prepare("INSERT INTO user_goals (user_id, daily_goal) VALUES ('a', 2), ('b', 3)").run();
sqlite.prepare("INSERT INTO user_course_levels (user_id, course, level) VALUES ('a', 'go', 'adv'), ('b', 'go', 'base')").run();
const sup = sqlite.prepare("INSERT INTO support_messages (id, user_id, name, email, topic, message) VALUES (?1, ?2, 'n', ?3, 'bug', 'text')");
sup.run("s1", "a", "a@example.com"); sup.run("s2", null, "A@Example.com"); sup.run("s3", "b", "b@example.com");
const rep = sqlite.prepare("INSERT INTO reports (id, reporter_id, nick, reason) VALUES (?1, ?2, ?3, 'spam')");
rep.run("r1", "a", "other"); rep.run("r2", "b", "nick_a"); rep.run("r3", "b", "somebody");
const ca = "session=" + (await createSession(env, "a"));

// Повнота: кожна таблиця з user_id у schema.sql має бути в USER_TABLES або в явному списку нижче (вигрузка й видалення її не пропустять)
await test("повнота: усі таблиці з user_id із schema.sql покриті вигрузкою й видаленням", () => {
  const src = readFileSync(new URL("../functions/api/account.ts", import.meta.url), "utf8");
  const listed = new Set([...src.match(/USER_TABLES = \[([^\]]*)\]/)[1].matchAll(/"(\w+)"/g)].map((m) => m[1]));
  const own = new Set(["support_messages", "reports"]);   // свої запити (інша колонка або пошта): див. account.ts
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((t) => t.name);
  for (const t of tables) {
    const cols = sqlite.prepare(`PRAGMA table_info(${t})`).all().map((c) => c.name);
    if (!cols.includes("user_id") && !cols.includes("reporter_id")) continue;
    assert.ok(listed.has(t) || own.has(t), `таблиця ${t} має user_id, але не покрита в account.ts`);
    if (own.has(t)) assert.ok(src.includes(`FROM ${t}`) && src.includes(`DELETE FROM ${t}`), `${t}: немає вигрузки або видалення`);
  }
});

await test("вигрузка даних: потрібен вхід, лише свої дані, без хеша пароля", async () => {
  assert.equal((await call(exportData, req("/api/account"))).status, 401);
  const r = await call(exportData, req("/api/account", { cookie: ca }));
  assert.equal(r.status, 200);
  assert.match(r.headers.get("Content-Disposition"), /attachment/);
  assert.equal(r.data.account.id, "a");
  assert.ok(!("password_hash" in r.data.account));
  assert.equal(r.data.user_progress.length, 1);
  assert.equal(r.data.xp_events.length, 1);
  assert.equal(r.data.user_goals.length, 1);
  assert.equal(r.data.user_course_levels.length, 1);
  assert.deepEqual(r.data.support_messages.map((m) => m.id).sort(), ["s1", "s2"]);   // своє й гостьове з тією самою поштою, чужого немає
  assert.deepEqual(r.data.reports.map((m) => m.id), ["r1"]);                         // лише подані ним, без жалоби на нього
  assert.ok(!JSON.stringify(r.data).includes("b@example.com"));
});
await test("видалення: потрібні вхід, свій Origin і підтвердження", async () => {
  assert.equal((await call(deleteAccount, req("/api/account", { method: "POST", body: { confirm: "delete" } }))).status, 401);
  assert.equal((await call(deleteAccount, req("/api/account", { method: "POST", cookie: ca, body: {} }))).data.error, "confirm_required");
  const evil = new Request(ORIGIN + "/api/account", { method: "POST", headers: { Cookie: ca, Origin: "https://evil.example", "Content-Type": "application/json" }, body: JSON.stringify({ confirm: "delete" }) });
  assert.equal((await call(deleteAccount, evil)).status, 403);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM users WHERE id='a'").get().c, 1);
});
await test("видалення: стирає акаунт і всі його дані, чужі не чіпає, cookie скидається", async () => {
  const r = await call(deleteAccount, req("/api/account", { method: "POST", cookie: ca, body: { confirm: "delete" } }));
  assert.equal(r.status, 200);
  assert.match(r.headers.get("Set-Cookie") ?? "", /Max-Age=0/);
  for (const t of ["user_progress", "xp_events"]) assert.equal(sqlite.prepare(`SELECT COUNT(*) c FROM ${t} WHERE user_id='a'`).get().c, 0);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM users WHERE id='a'").get().c, 0);
  for (const t of ["user_goals", "user_course_levels"]) assert.equal(sqlite.prepare(`SELECT COUNT(*) c FROM ${t} WHERE user_id='a'`).get().c, 0, t);
  assert.deepEqual(sqlite.prepare("SELECT id FROM support_messages ORDER BY id").all().map((m) => m.id), ["s3"]);
  assert.deepEqual(sqlite.prepare("SELECT id FROM reports ORDER BY id").all().map((m) => m.id), ["r3"]);   // подані ним і подані на його нік стерто
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM user_progress WHERE user_id='b'").get().c, 1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM user_goals WHERE user_id='b'").get().c, 1);
  assert.equal((await call(exportData, req("/api/account", { cookie: ca }))).status, 401);
});
await test("сторінки /privacy і /terms: є в реєстрі, мають компанію й адресу", () => {
  for (const path of ["/privacy", "/terms"]) {
    const p = findPage(path);
    assert.ok(p, path);
    const html = p.html(false);
    assert.ok(html.includes("AKERR-SHY s.r.o.") && html.includes("04346360") && html.includes("Kněžmost"));
    assert.ok(!/\[[^\]/]+\]/.test(html.replace(/<[^>]+>/g, "")), "у тексті лишились порожні поля [..]");
  }
});

console.log(`\nУсі перевірки облікового запису й юридичних сторінок пройдено: ${passed}`);
