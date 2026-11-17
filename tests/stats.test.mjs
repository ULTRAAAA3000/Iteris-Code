// Аналітика для власника: воронка, реєстрації, активність, утримання D1/D7 і доступ лише адміну
// Запуск: node tests/stats.test.mjs (Node 22+, node:sqlite як локальний D1)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession } from "../lib/session.ts";
import { ensureSchema } from "../lib/schema.ts";
import { computeStats } from "../lib/stats.ts";
import { isAdmin } from "../lib/admin.ts";
import { onRequestGet as statsApi } from "../functions/api/admin/stats.ts";

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
const env = { DB, SESSION_SECRET: "s".repeat(40), ADMIN_EMAILS: "Owner@x.example, other@x.example" };
await ensureSchema(env);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };
const ago = (n) => `datetime('now','-${n} day')`;
const user = (id, email, daysAgo, pass = null, verified = 1) =>
  sqlite.prepare(`INSERT INTO users (id, email, name, password_hash, email_verified, created_at) VALUES (?1, ?2, ?1, ?3, ?4, ${ago(daysAgo)})`).run(id, email, pass, verified);
const lesson = (u, l, d) => sqlite.prepare(`INSERT INTO user_progress (user_id, lesson_id, completed_at) VALUES (?1, ?2, ${ago(d)})`).run(u, l);
const xp = (u, reason, ref, d) => sqlite.prepare(`INSERT INTO xp_events (user_id, amount, reason, ref, created_at) VALUES (?1, 10, ?2, ?3, ${ago(d)})`).run(u, reason, ref);
const onb = (u) => sqlite.prepare("INSERT INTO user_onboarding (user_id, level, courses) VALUES (?1, 'beginner', '[]')").run(u);

user("u1", "u1@x.example", 10); onb("u1"); lesson("u1", "js/1", 10); lesson("u1", "js/2", 9); lesson("u1", "js/3", 3);   // вернувся на D1 і D7
user("u2", "u2@x.example", 10); onb("u2"); lesson("u2", "js/1", 10);                                                       // лише день реєстрації
user("u3", "u3@x.example", 0);                                                                                              // щойно зареєструвався
user("u4", "u4@x.example", 3); xp("u4", "task", "t1", 3); xp("u4", "task", "t2", 2);                                        // вернувся на D1

const s = await computeStats(DB);
await test("воронка: кожен крок рахується правильно", () => {
  assert.deepEqual(s.funnel, { registered: 4, onboarded: 2, firstLesson: 2, firstTask: 1, returned: 2, habit: 0 });
  assert.equal(s.totals.users, 4);
});
await test("утримання: D1 і D7 рахуються лише по тих, хто вже міг повернутись", () => {
  assert.deepEqual(s.retention.d1, { cohort: 3, returned: 2 });
  assert.deepEqual(s.retention.d7, { cohort: 2, returned: 1 });
});
await test("реєстрації й активність за днями: порожні дні заповнені нулями", () => {
  assert.equal(s.signups.length, 30);
  assert.equal(s.signups.reduce((a, r) => a + r.count, 0), 4);
  assert.equal(s.dau.length, 14);
  assert.equal(s.dau.reduce((a, r) => a + r.count, 0), 6);
  assert.ok(s.signups.every((r, i, a) => !i || a[i - 1].day < r.day), "дні йдуть по порядку");
});
await test("без пошт: зведення не містить персональних даних", () => {
  assert.ok(!JSON.stringify(s).includes("@"));
});

await test("доступ: лише пошти зі списку; пароль без підтвердженої пошти не рахується", async () => {
  user("adm1", "owner@x.example", 1);                       // вхід Google/GitHub (без пароля)
  user("adm2", "other@x.example", 1, "hash", 1);            // пароль, листи не налаштовані
  user("rnd", "random@x.example", 1);
  assert.equal(await isAdmin(env, "adm1"), true);
  assert.equal(await isAdmin(env, "adm2"), false);
  assert.equal(await isAdmin({ ...env, RESEND_API_KEY: "k", MAIL_FROM: "a@b.c" }, "adm2"), true);
  sqlite.prepare("UPDATE users SET email_verified = 0 WHERE id = 'adm2'").run();
  assert.equal(await isAdmin({ ...env, RESEND_API_KEY: "k", MAIL_FROM: "a@b.c" }, "adm2"), false);
  assert.equal(await isAdmin(env, "rnd"), false);
  assert.equal(await isAdmin({ ...env, ADMIN_EMAILS: "" }, "adm1"), false);
});
await test("API: адмін бачить зведення, інші й гості отримують 404", async () => {
  const call = async (cookie) => { const r = await statsApi({ request: new Request("https://iteris-code.pages.dev/api/admin/stats", { headers: cookie ? { Cookie: cookie } : {} }), env, params: {} }); return { status: r.status, body: await r.text() }; };
  assert.equal((await call(null)).status, 404);
  assert.equal((await call("session=" + (await createSession(env, "rnd")))).status, 404);
  const ok = await call("session=" + (await createSession(env, "adm1")));
  assert.equal(ok.status, 200);
  assert.equal(JSON.parse(ok.body).funnel.registered, 7);
});

console.log(`\nУсі перевірки аналітики пройдено: ${passed}`);
