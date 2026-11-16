// Самовосстановление схемы, обёртка ошибок API и диагностика входа. Запуск: node tests/schema.test.mjs (Node 22+)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { ensureSchema, resetSchemaCache } from "../lib/schema.ts";
import { failureCode, onRequest as middleware } from "../functions/api/_middleware.ts";
import { onRequestGet as health } from "../functions/api/auth/health.ts";
import { onRequestPost as register } from "../functions/api/auth/register.ts";
import { onRequestPost as login } from "../functions/api/auth/login.ts";

const wrap = (sqlite) => {
  const isSelect = (q) => /^\s*select/i.test(q);
  const stmt = (q) => ({
    q, p: [],
    bind(...a) { this.p = a; return this; },
    async first() { return sqlite.prepare(q).get(...this.p) ?? null; },
    async all() { return { results: sqlite.prepare(q).all(...this.p) }; },
    async run() { const r = sqlite.prepare(q).run(...this.p); return { success: true, meta: { changes: Number(r.changes) } }; },
  });
  return {
    prepare: stmt,
    async batch(list) {
      sqlite.exec("BEGIN");
      try { const out = []; for (const s of list) out.push(isSelect(s.q) ? await s.all() : await s.run()); sqlite.exec("COMMIT"); return out; }
      catch (e) { sqlite.exec("ROLLBACK"); throw e; }
    },
  };
};
const cols = (db, t) => db.prepare(`SELECT name FROM pragma_table_info('${t}')`).all().map((r) => r.name).sort();
const tables = (db) => db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all().map((r) => r.name).sort();
const indexes = (db) => db.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%'").all().map((r) => r.name).sort();

let passed = 0;
const test = async (name, fn) => { resetSchemaCache(); await fn(); passed++; console.log("ok  -", name); };

await test("порожня база: ensureSchema створює те саме, що schema.sql (таблиці, колонки, індекси)", async () => {
  const ref = new DatabaseSync(":memory:"); ref.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
  const fresh = new DatabaseSync(":memory:"); await ensureSchema({ DB: wrap(fresh) });
  // Таблиці етапу 2 (XP, онбординг) можуть бути в ensureSchema раніше, ніж у schema.sql: це єдині допустимі «зайві» об'єкти
  const STAGE2 = ["xp_events", "user_onboarding", "idx_xp_user_time"];
  const extra = (got, want) => got.filter((x) => !want.includes(x));
  assert.deepEqual(extra(tables(ref), tables(fresh)), []);
  assert.deepEqual(extra(tables(fresh), tables(ref)).filter((x) => !STAGE2.includes(x)), []);
  for (const t of tables(ref)) assert.deepEqual(cols(fresh, t), cols(ref, t), "колонки " + t);
  assert.deepEqual(extra(indexes(ref), indexes(fresh)), []);
  assert.deepEqual(extra(indexes(fresh), indexes(ref)).filter((x) => !STAGE2.includes(x)), []);
});

await test("стара база без колонок і таблиць: додаються, дані користувачів зберігаються, Google-акаунти лишаються підтвердженими", async () => {
  const old = new DatabaseSync(":memory:");
  old.exec(`CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, avatar_url TEXT, is_pro INTEGER DEFAULT 0, pro_until DATETIME,
    streak_count INTEGER DEFAULT 0, last_active_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE user_progress (user_id TEXT, lesson_id TEXT, completed_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, lesson_id));
    INSERT INTO users (id, email, name) VALUES ('g1', 'old@x.ua', 'Old');
    INSERT INTO user_progress (user_id, lesson_id) VALUES ('g1', 'js/1');`);
  await ensureSchema({ DB: wrap(old) });
  const c = cols(old, "users");
  for (const n of ["password_hash", "email_verified", "portal_url", "subscription_id", "billing_updated_at"]) assert.ok(c.includes(n), n);
  assert.ok(tables(old).includes("email_tokens") && tables(old).includes("auth_throttle") && tables(old).includes("xp_events") && tables(old).includes("user_onboarding"));
  const u = old.prepare("SELECT email, email_verified, password_hash FROM users WHERE id = 'g1'").get();
  assert.equal(u.email, "old@x.ua"); assert.equal(u.email_verified, 1); assert.equal(u.password_hash, null);
  assert.equal(old.prepare("SELECT COUNT(*) c FROM user_progress").get().c, 1);
});

await test("міграція, що зупинилась посередині (є password_hash, немає email_verified), добудовується", async () => {
  const half = new DatabaseSync(":memory:");
  half.exec("CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, avatar_url TEXT, is_pro INTEGER DEFAULT 0, pro_until DATETIME, streak_count INTEGER DEFAULT 0, last_active_at DATETIME, created_at DATETIME, password_hash TEXT)");
  await ensureSchema({ DB: wrap(half) });
  assert.ok(cols(half, "users").includes("email_verified"));
});

await test("ідемпотентність і гонка: повторні й паралельні виклики не падають, дубльована колонка ігнорується", async () => {
  const db = new DatabaseSync(":memory:");
  await Promise.all([ensureSchema({ DB: wrap(db) }), ensureSchema({ DB: wrap(db) })]);
  resetSchemaCache(); await ensureSchema({ DB: wrap(db) });
  // «паралельний запит додав колонку між перевіркою й ALTER»: перша перевірка бачить старий стан, ALTER дає duplicate column
  const racy = new DatabaseSync(":memory:"); await ensureSchema({ DB: wrap(racy) });
  resetSchemaCache();
  const w = wrap(racy), realPrepare = w.prepare;
  w.prepare = (q) => /pragma_table_info/.test(q) ? { all: async () => ({ results: [{ name: "id" }] }), bind() { return this; } } : realPrepare(q);
  await ensureSchema({ DB: w });
  assert.equal(cols(racy, "users").filter((n) => n === "email_verified").length, 1);
});

await test("збій бази не кешується: наступний запит пробує знову", async () => {
  const db = new DatabaseSync(":memory:"); const w = wrap(db); let fail = true; const real = w.batch;
  w.batch = async (l) => { if (fail) throw new Error("D1_ERROR: temporarily down"); return real(l); };
  await assert.rejects(ensureSchema({ DB: w }), /temporarily down/);
  fail = false; await ensureSchema({ DB: w });
  assert.ok(tables(db).includes("users"));
});

const ctx = (env, next, path = "/api/auth/login") => ({ env, request: new Request("https://iteris-code.pages.dev" + path, { method: "POST" }), next });
await test("middleware: виняток обробника стає JSON 500 з кодом, а не порожньою сторінкою", async () => {
  const env = { DB: wrap(new DatabaseSync(":memory:")) };
  const logs = []; const orig = console.error; console.error = (...a) => logs.push(a.join(" "));
  try {
    const bad = await middleware(ctx(env, async () => { throw new Error("D1_ERROR: no such column: email_verified"); }));
    assert.equal(bad.status, 500); assert.deepEqual(await bad.json(), { error: "server_error", code: "db_schema" });
    const other = await middleware(ctx(env, async () => { throw new Error("boom"); }));
    assert.deepEqual(await other.json(), { error: "server_error", code: "server_error" });
    assert.ok(logs.some((l) => l.includes("/api/auth/login") && l.includes("boom")));        // подробности лишь в логах
    const ok = await middleware(ctx(env, async () => Response.json({ fine: true })));
    assert.equal(ok.status, 200);
  } finally { console.error = orig; }
  const noDb = await middleware(ctx({}, async () => Response.json({})));
  assert.equal(noDb.status, 500); assert.equal((await noDb.json()).code, "db_binding_missing");
  assert.equal(failureCode(new Error("UNIQUE constraint failed: users.email")), "db_error");
});

await test("реєстрація й вхід працюють на старій базі завдяки middleware (було 500 через відсутню колонку)", async () => {
  const old = new DatabaseSync(":memory:");
  old.exec("CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, avatar_url TEXT, is_pro INTEGER DEFAULT 0, pro_until DATETIME, streak_count INTEGER DEFAULT 0, last_active_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, password_hash TEXT)");
  const env = { DB: wrap(old), SESSION_SECRET: "s".repeat(40) };          // без листів і Turnstile: реєстрація одразу відкриває сесію
  const ORIGIN = "https://iteris-code.pages.dev";
  const post = (path, body) => new Request(ORIGIN + path, { method: "POST", headers: { Origin: ORIGIN, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const via = async (fn, path, body) => (await middleware({ env, request: post(path, body), next: () => fn({ env, request: post(path, body) }) }));
  const reg = await via(register, "/api/auth/register", { email: "new@x.ua", password: "correct-horse", name: "Нова" });
  assert.equal(reg.status, 200); assert.equal((await reg.json()).signedIn, true);
  const lg = await via(login, "/api/auth/login", { email: "NEW@x.ua", password: "correct-horse" });
  assert.equal(lg.status, 200);
  assert.ok(lg.headers.get("Set-Cookie").includes("HttpOnly"));
});

await test("діагностика: порожні налаштування дають список проблем, повні дають ok, секретів у відповіді немає", async () => {
  const db = new DatabaseSync(":memory:"); await ensureSchema({ DB: wrap(db) });
  const get = async (env, q = "") => (await health({ env: { DB: wrap(db), ...env }, request: new Request("https://x.ua/api/auth/health" + q) })).json();
  const none = await get({});
  assert.equal(none.ok, false); assert.ok(none.problems.some((p) => p.includes("SESSION_SECRET")));
  assert.equal((await get({ SESSION_SECRET: "short" })).problems.some((p) => p.includes("короткая")), true);
  const half = await get({ SESSION_SECRET: "s".repeat(40), TURNSTILE_SITE_KEY: "k" });
  assert.ok(half.problems.some((p) => p.includes("Turnstile")));
  const full = await get({ SESSION_SECRET: "s".repeat(40), GOOGLE_CLIENT_ID: "cid", GOOGLE_CLIENT_SECRET: "gsec", TURNSTILE_SITE_KEY: "site", TURNSTILE_SECRET_KEY: "tsec", RESEND_API_KEY: "re_secret", MAIL_FROM: "a@b.ua" }, "?hash=1");
  assert.equal(full.ok, true); assert.deepEqual(full.features, { google: true, github: false, turnstile: true, mail: true }); assert.ok(full.hashMs >= 0);
  const text = JSON.stringify(full);
  for (const secret of ["gsec", "tsec", "re_secret", "s".repeat(40)]) assert.ok(!text.includes(secret));
  const broken = new DatabaseSync(":memory:"); broken.exec("CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT)");
  const bad = await (await health({ env: { DB: wrap(broken), SESSION_SECRET: "s".repeat(40) }, request: new Request("https://x.ua/api/auth/health") })).json();
  assert.ok(bad.problems.some((p) => p.includes("email_tokens")) && bad.problems.some((p) => p.includes("email_verified")));
});

console.log(`\nУсі тести схеми й діагностики пройдено: ${passed}`);
