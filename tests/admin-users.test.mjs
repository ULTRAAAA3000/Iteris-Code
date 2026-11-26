// Список акаунтів для власника у /admin: пошти й імена бачить лише адмін, пошук, сторінки, без хеша пароля
// Запуск: node tests/admin-users.test.mjs (Node 22+, node:sqlite як локальний D1)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession } from "../lib/session.ts";
import { ensureSchema } from "../lib/schema.ts";
import { listUsers } from "../lib/admin-users.ts";
import { onRequestGet as usersApi } from "../functions/api/admin/users.ts";

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
const env = { DB, SESSION_SECRET: "s".repeat(40), ADMIN_EMAILS: "Owner@x.example" };
await ensureSchema(env);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };
const ago = (n) => `datetime('now','-${n} day')`;
const user = (id, email, name, daysAgo, pass = null, verified = 1) =>
  sqlite.prepare(`INSERT INTO users (id, email, name, password_hash, email_verified, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ${ago(daysAgo)})`).run(id, email, name, pass, verified);

user("adm1", "owner@x.example", "Власник", 9);
user("u1", "anna@x.example", "Анна", 5);
user("u2", "bob@x.example", "Bob_100%", 3, "SECRET-HASH", 0);
user("u3", "carol@x.example", "<b>Carol</b>", 1, "SECRET-HASH", 1);
for (let i = 0; i < 60; i++) user("bulk" + i, `bulk${i}@x.example`, "Bulk", 20 + i);

await test("список: пошти й імена, найновіші першими, спосіб входу й підтвердження пошти", async () => {
  const p = await listUsers(DB, { limit: 4 });
  assert.equal(p.total, 64);
  assert.deepEqual(p.users.map((u) => u.email), ["carol@x.example", "bob@x.example", "anna@x.example", "owner@x.example"]);
  assert.equal(p.users[0].name, "<b>Carol</b>");
  assert.deepEqual([p.users[0].method, p.users[0].verified], ["password", true]);
  assert.deepEqual([p.users[1].method, p.users[1].verified], ["password", false]);
  assert.deepEqual([p.users[2].method, p.users[2].verified], ["social", true]);
});
await test("хеш пароля не потрапляє у відповідь", async () => {
  const p = await listUsers(DB, { limit: 100 });
  assert.ok(!JSON.stringify(p).includes("SECRET-HASH"));
  assert.ok(!JSON.stringify(p).toLowerCase().includes("password_hash"));
});
await test("сторінки: 50 за замовчуванням, offset, без дублів і пропусків", async () => {
  const a = await listUsers(DB), b = await listUsers(DB, { offset: 50 });
  assert.equal(a.users.length, 50);
  assert.equal(b.users.length, 14);
  assert.equal(new Set([...a.users, ...b.users].map((u) => u.email)).size, 64);
  assert.equal((await listUsers(DB, { limit: 9999 })).users.length, 64);   // стеля 100
});
await test("пошук: за поштою, ім'ям; регістр не важливий; % і _ шукаються як літери", async () => {
  assert.deepEqual((await listUsers(DB, { q: "ANNA" })).users.map((u) => u.email), ["anna@x.example"]);
  assert.deepEqual((await listUsers(DB, { q: "carol" })).users.map((u) => u.email), ["carol@x.example"]);
  assert.deepEqual((await listUsers(DB, { q: "_100%" })).users.map((u) => u.email), ["bob@x.example"]);
  assert.equal((await listUsers(DB, { q: "%" })).total, 1);            // лише Bob_100%, а не «усе»
  assert.equal((await listUsers(DB, { q: "nobody" })).total, 0);
  assert.equal((await listUsers(DB, { q: "'; DROP TABLE users;--" })).total, 0);
  assert.equal((await listUsers(DB)).total, 64);                         // таблиця на місці
});
await test("API: адмін бачить список, інші й гості отримують 404 без жодних даних", async () => {
  const call = async (cookie, qs = "") => { const r = await usersApi({ request: new Request("https://iteris-code.pages.dev/api/admin/users" + qs, { headers: cookie ? { Cookie: cookie } : {} }), env, params: {} }); return { status: r.status, cache: r.headers.get("Cache-Control"), body: await r.text() }; };
  const guest = await call(null), rnd = await call("session=" + (await createSession(env, "u1")));
  for (const r of [guest, rnd]) { assert.equal(r.status, 404); assert.ok(!r.body.includes("@")); }
  const ok = await call("session=" + (await createSession(env, "adm1")), "?q=anna");
  assert.equal(ok.status, 200);
  assert.equal(ok.cache, "no-store");
  assert.deepEqual(JSON.parse(ok.body).users.map((u) => u.email), ["anna@x.example"]);
  assert.equal(JSON.parse((await call("session=" + (await createSession(env, "adm1")), "?offset=60")).body).users.length, 4);
});

console.log(`\nУсі перевірки списку акаунтів пройдено: ${passed}`);
