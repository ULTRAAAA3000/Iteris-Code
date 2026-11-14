// Запуск: node tests/password-auth.test.mjs  (Node 22+, node:sqlite як локальний D1)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { hashPassword, verifyPassword } from "../lib/password.ts";
import { onRequestPost as register } from "../functions/api/auth/register.ts";
import { onRequestPost as login } from "../functions/api/auth/login.ts";
import { onRequestPost as forgot } from "../functions/api/auth/forgot.ts";
import { onRequestPost as reset } from "../functions/api/auth/reset.ts";
import { onRequestPost as verify } from "../functions/api/auth/verify.ts";
import { onRequestPost as google } from "../functions/api/auth/google.ts";
import { onRequestGet as config } from "../functions/api/auth/config.ts";
import { onRequestGet as me } from "../functions/api/me.ts";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
const stmt = (q) => ({
  q, p: [],
  bind(...a) { this.p = a; return this; },
  async first() { return sqlite.prepare(q).get(...this.p) ?? null; },
  async all() { return { results: sqlite.prepare(q).all(...this.p) }; },
  async run() { const r = sqlite.prepare(q).run(...this.p); return { success: true, meta: { changes: Number(r.changes) } }; },
});
const DB = { prepare: stmt };

const env = { DB, SESSION_SECRET: "s".repeat(40), GOOGLE_CLIENT_ID: "cid", GOOGLE_CLIENT_SECRET: "sec",
  TURNSTILE_SITE_KEY: "site-key", TURNSTILE_SECRET_KEY: "ts-secret", RESEND_API_KEY: "re_test", MAIL_FROM: "Iteris <noreply@iteris.ua>" };
const ORIGIN = "https://iteris-code.pages.dev";
const OK = "ok-token";   // токен Turnstile, який приймає підміна
const req = (path, { method = "POST", body, cookie, origin = ORIGIN } = {}) =>
  new Request(ORIGIN + path, {
    method,
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method === "POST" ? { Origin: origin, "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
const call = async (fn, r, e = env) => { const res = await fn({ request: r, env: e }); return { status: res.status, data: await res.json(), headers: res.headers }; };

// Підміна зовнішніх сервісів: Turnstile, Resend, Google
const mails = [];
let gProfile = { sub: "g-1", email: "g@x.ua", name: "Гість", email_verified: true };
let mailDown = false;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.includes("challenges.cloudflare.com")) {
    const b = opts.body;
    return Response.json({ success: b.get("response") === OK && b.get("secret") === "ts-secret" });
  }
  if (u.includes("api.resend.com")) {
    if (mailDown) return new Response("{}", { status: 500 });
    assert.equal(opts.headers.Authorization, "Bearer re_test");
    mails.push(JSON.parse(opts.body));
    return Response.json({ id: "m1" });
  }
  if (u.includes("oauth2.googleapis.com/token")) return Response.json({ access_token: "tok" });
  return Response.json(gProfile);
};
const tokenFrom = (mail, kind) => mail.text.match(new RegExp("#/" + kind + "/([A-Za-z0-9_-]+)"))[1];
const lastMail = () => mails[mails.length - 1];
const reg = (over = {}) => call(register, req("/api/auth/register", { body: { email: "Ann@Example.com", password: "correct-horse", name: "Ann", turnstile: OK, ...over } }));
const log = (over = {}, e = env) => call(login, req("/api/auth/login", { body: { email: "ann@example.com", password: "correct-horse", turnstile: OK, ...over } }), e);

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

await test("пароль: формат PBKDF2, різна сіль, перевірка, сміттєві записи", async () => {
  const a = await hashPassword("secret123"), b = await hashPassword("secret123");
  assert.match(a, /^pbkdf2\$sha256\$100000\$[\w-]+\$[\w-]+$/);
  assert.notEqual(a, b);
  assert.ok(!a.includes("secret123"));
  assert.equal(await verifyPassword("secret123", a), true);
  assert.equal(await verifyPassword("secret124", a), false);
  for (const bad of ["", "plain", "pbkdf2$sha256$0$a$b", "pbkdf2$sha256$999999999$a$b", "bcrypt$x$1$a$b"]) assert.equal(await verifyPassword("x", bad), false);
});

await test("конфіг: Google, Turnstile і пошта з'являються лише коли налаштовані", async () => {
  const cfg = async (e) => (await call(config, req("/api/auth/config", { method: "GET" }), e)).data;
  assert.deepEqual(await cfg(env), { clientId: "cid", turnstileSiteKey: "site-key", mail: true });
  for (const k of ["TURNSTILE_SECRET_KEY", "TURNSTILE_SITE_KEY"]) assert.equal((await cfg({ ...env, [k]: undefined })).turnstileSiteKey, null, k);
  for (const k of ["RESEND_API_KEY", "MAIL_FROM"]) assert.equal((await cfg({ ...env, [k]: undefined })).mail, false, k);
  assert.equal((await cfg({ ...env, GOOGLE_CLIENT_ID: undefined })).clientId, null);
});

await test("реєстрація: відмови (Origin, пошта, слабкий пароль, Turnstile, конфіг)", async () => {
  assert.equal((await call(register, req("/api/auth/register", { body: {}, origin: "https://evil.example" }))).status, 403);
  assert.equal((await reg({ email: "not-an-email" })).data.error, "invalid_email");
  assert.equal((await reg({ password: "short" })).data.error, "weak_password");
  assert.equal((await reg({ password: "x".repeat(129) })).data.error, "weak_password");
  assert.equal((await reg({ turnstile: "bad" })).data.error, "captcha_failed");
  assert.equal((await reg({ turnstile: undefined })).data.error, "captcha_failed");
  assert.equal((await call(register, req("/api/auth/register", { body: { email: "a@b.ua", password: "correct-horse", turnstile: OK } }), { ...env, SESSION_SECRET: undefined })).status, 503);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM users").get().c, 0);
});

await test("реєстрація: пароль хешується, пошта нормалізується, токен лише як SHA-256", async () => {
  const r = await reg();
  assert.equal(r.status, 200);
  const u = sqlite.prepare("SELECT * FROM users WHERE email = 'ann@example.com'").get();
  assert.ok(u && u.id.startsWith("u_") && u.email_verified === 0 && u.name === "Ann");
  assert.match(u.password_hash, /^pbkdf2\$/); assert.ok(!u.password_hash.includes("correct-horse"));
  assert.equal(mails.length, 1);
  assert.equal(lastMail().to[0], "ann@example.com");
  const tok = tokenFrom(lastMail(), "verify");
  assert.ok(lastMail().text.includes(ORIGIN + "/#/verify/" + tok));
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM email_tokens WHERE token_hash = ?").get(tok).c, 0);   // у базі не сам токен
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM email_tokens WHERE kind = 'verify'").get().c, 1);
});

await test("вхід до підтвердження пошти: 403, неправильний пароль і невідомий email: однакова 401", async () => {
  assert.equal((await log()).data.error, "email_not_verified");
  const wrong = await log({ password: "wrong-password" }), unknown = await log({ email: "nobody@example.com" });
  assert.equal(wrong.status, 401); assert.equal(unknown.status, 401);
  assert.deepEqual(wrong.data, unknown.data);
  assert.equal((await log({ turnstile: "bad" })).data.error, "captcha_failed");
  assert.equal((await call(login, req("/api/auth/login", { body: { email: "ann@example.com", password: "correct-horse", turnstile: OK }, origin: "https://evil.example" }))).status, 403);
});

let cookie;
await test("підтвердження пошти: токен одноразовий, відкриває сесію", async () => {
  assert.equal((await call(verify, req("/api/auth/verify", { body: { token: "nonexistent-token-nonexistent" } }))).data.error, "invalid_token");
  const tok = tokenFrom(lastMail(), "verify");
  const r = await call(verify, req("/api/auth/verify", { body: { token: tok } }));
  assert.equal(r.status, 200);
  cookie = r.headers.get("Set-Cookie").split(";")[0];
  assert.match(r.headers.get("Set-Cookie"), /HttpOnly/);
  assert.equal((await call(me, req("/api/me", { method: "GET", cookie }))).data.user.email, "ann@example.com");
  assert.equal((await call(verify, req("/api/auth/verify", { body: { token: tok } }))).data.error, "invalid_token");
});

await test("вхід: без урахування регістру пошти, cookie HttpOnly/Secure/SameSite", async () => {
  const r = await log({ email: " ANN@example.com " });
  assert.equal(r.status, 200);
  const sc = r.headers.get("Set-Cookie");
  assert.match(sc, /HttpOnly/); assert.match(sc, /Secure/); assert.match(sc, /SameSite=Lax/);
});

await test("вхід: після 10 хибних спроб 429, навіть із правильним паролем", async () => {
  for (let i = 0; i < 9; i++) assert.equal((await log({ password: "wrong-" + i })).status, 401);   // 1 успішний вхід вище скинув лічильник
  assert.equal((await log({ password: "wrong-last" })).status, 401);
  assert.equal((await log()).data.error, "too_many_requests");
  sqlite.exec("DELETE FROM auth_throttle");
});

await test("повторна реєстрація: підтверджена пошта нічого не змінює й не розкривається", async () => {
  const before = sqlite.prepare("SELECT password_hash FROM users WHERE email = 'ann@example.com'").get().password_hash;
  const n = mails.length;
  const r = await reg({ password: "attacker-password" });
  assert.equal(r.status, 200); assert.deepEqual(r.data, { ok: true });
  assert.equal(mails.length, n);
  assert.equal(sqlite.prepare("SELECT password_hash FROM users WHERE email = 'ann@example.com'").get().password_hash, before);
});

await test("повторна реєстрація до підтвердження: нове посилання, старе недійсне", async () => {
  await reg({ email: "bob@example.com", password: "first-password" });
  const t1 = tokenFrom(lastMail(), "verify");
  await reg({ email: "bob@example.com", password: "second-password" });
  const t2 = tokenFrom(lastMail(), "verify");
  assert.notEqual(t1, t2);
  assert.equal((await call(verify, req("/api/auth/verify", { body: { token: t1 } }))).data.error, "invalid_token");
  assert.equal((await call(verify, req("/api/auth/verify", { body: { token: t2 } }))).status, 200);
  assert.equal((await log({ email: "bob@example.com", password: "first-password" })).status, 401);
  assert.equal((await log({ email: "bob@example.com", password: "second-password" })).status, 200);
});

await test("збій пошти: 502, акаунт не залишається недоступним (можна повторити)", async () => {
  mailDown = true;
  assert.equal((await reg({ email: "carl@example.com" })).data.error, "mail_failed");
  mailDown = false;
  assert.equal((await reg({ email: "carl@example.com" })).status, 200);
});

await test("відновлення: однакова відповідь, лист лише існуючому акаунту", async () => {
  const f = (email, over = {}) => call(forgot, req("/api/auth/forgot", { body: { email, turnstile: OK, ...over } }));
  const n = mails.length;
  const none = await f("ghost@example.com");
  assert.equal(none.status, 200); assert.deepEqual(none.data, { ok: true }); assert.equal(mails.length, n);
  assert.equal((await f("not-an-email")).data.error, "invalid_email");
  assert.equal((await f("ann@example.com", { turnstile: "bad" })).data.error, "captcha_failed");
  assert.deepEqual((await f("ann@example.com")).data, { ok: true });
  assert.equal(mails.length, n + 1);
  assert.ok(lastMail().text.includes("#/reset/"));
});

await test("скидання пароля: слабкий пароль не палить токен, токен одноразовий, старий пароль не працює", async () => {
  const tok = tokenFrom(lastMail(), "reset");
  const r = (body) => call(reset, req("/api/auth/reset", { body: { turnstile: OK, ...body } }));
  assert.equal((await r({ token: tok, password: "short" })).data.error, "weak_password");
  assert.equal((await r({ token: tok, password: "brand-new-password", turnstile: "bad" })).data.error, "captcha_failed");
  assert.equal((await r({ token: "x".repeat(40), password: "brand-new-password" })).data.error, "invalid_token");
  assert.equal((await r({ token: tok, password: "brand-new-password" })).status, 200);
  assert.equal((await r({ token: tok, password: "another-password-1" })).data.error, "invalid_token");
  assert.equal((await log()).status, 401);
  assert.equal((await log({ password: "brand-new-password" })).status, 200);
});

await test("скидання пароля: прострочений токен недійсний; токен verify не підходить для reset", async () => {
  await call(forgot, req("/api/auth/forgot", { body: { email: "ann@example.com", turnstile: OK } }));
  const tok = tokenFrom(lastMail(), "reset");
  sqlite.exec("UPDATE email_tokens SET expires_at = 1 WHERE kind = 'reset'");
  assert.equal((await call(reset, req("/api/auth/reset", { body: { token: tok, password: "brand-new-password-2", turnstile: OK } }))).data.error, "invalid_token");
  await reg({ email: "dan@example.com" });
  const v = tokenFrom(lastMail(), "verify");
  assert.equal((await call(reset, req("/api/auth/reset", { body: { token: v, password: "brand-new-password-3", turnstile: OK } }))).data.error, "invalid_token");
});

await test("скидання підтверджує пошту непідтвердженого акаунта", async () => {
  await call(forgot, req("/api/auth/forgot", { body: { email: "dan@example.com", turnstile: OK } }));
  const tok = tokenFrom(lastMail(), "reset");
  assert.equal((await call(reset, req("/api/auth/reset", { body: { token: tok, password: "dan-new-password", turnstile: OK } }))).status, 200);
  assert.equal(sqlite.prepare("SELECT email_verified v FROM users WHERE email = 'dan@example.com'").get().v, 1);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM email_tokens WHERE user_id IN (SELECT id FROM users WHERE email = 'dan@example.com')").get().c, 0);
  assert.equal((await log({ email: "dan@example.com", password: "dan-new-password" })).status, 200);
});

await test("ліміт листів: не більше 5 на пошту за годину", async () => {
  sqlite.exec("DELETE FROM auth_throttle");
  let last;
  for (let i = 0; i < 6; i++) last = await call(forgot, req("/api/auth/forgot", { body: { email: "spam@example.com", turnstile: OK } }));
  assert.equal(last.status, 429);
});

await test("Google і пошта: акаунт за паролем прив'язується до Google з тією ж поштою", async () => {
  const gcall = () => call(google, req("/api/auth/google", { body: { code: "good" } }));
  // 1) підтверджений акаунт за паролем зберігає пароль, Google входить у нього
  gProfile = { sub: "g-ann", email: "Ann@example.com", name: "Ann G", email_verified: true };
  const annId = sqlite.prepare("SELECT id FROM users WHERE email = 'ann@example.com'").get().id;
  const r1 = await gcall();
  assert.equal(r1.status, 200);
  const c1 = r1.headers.get("Set-Cookie").split(";")[0];
  assert.equal((await call(me, req("/api/me", { method: "GET", cookie: c1 }))).data.user.id, annId);
  assert.equal((await log({ password: "brand-new-password" })).status, 200);
  // 2) непідтверджений акаунт (міг створити зловмисник): пароль скидається
  await reg({ email: "victim@example.com", password: "attacker-knows-this" });
  gProfile = { sub: "g-victim", email: "victim@example.com", name: "Victim", email_verified: true };
  assert.equal((await gcall()).status, 200);
  const v = sqlite.prepare("SELECT password_hash, email_verified FROM users WHERE email = 'victim@example.com'").get();
  assert.equal(v.password_hash, null); assert.equal(v.email_verified, 1);
  assert.equal((await log({ email: "victim@example.com", password: "attacker-knows-this" })).status, 401);
  // 3) новий Google-користувач: пошта в нижньому регістрі, підтверджена
  gProfile = { sub: "g-new", email: "New@Example.com", name: "New", email_verified: true };
  assert.equal((await gcall()).status, 200);
  const gn = sqlite.prepare("SELECT email, email_verified v FROM users WHERE id = 'g-new'").get();
  assert.equal(gn.email, "new@example.com"); assert.equal(gn.v, 1);
  // Google-акаунт без пароля не пускає за паролем
  assert.equal((await log({ email: "new@example.com", password: "anything-here" })).status, 401);
});

await test("без Turnstile форми працюють без токена (захист вмикається лише з обома ключами)", async () => {
  const open = { ...env, TURNSTILE_SITE_KEY: undefined, TURNSTILE_SECRET_KEY: undefined };
  const justSecret = { ...env, TURNSTILE_SITE_KEY: undefined };
  const r = await call(register, req("/api/auth/register", { body: { email: "free@example.com", password: "correct-horse" } }), open);
  assert.equal(r.status, 200);
  const v = tokenFrom(lastMail(), "verify");
  assert.equal((await call(verify, req("/api/auth/verify", { body: { token: v } }), open)).status, 200);
  assert.equal((await call(login, req("/api/auth/login", { body: { email: "free@example.com", password: "correct-horse" } }), open)).status, 200);
  assert.equal((await call(login, req("/api/auth/login", { body: { email: "free@example.com", password: "correct-horse" } }), justSecret)).status, 200);
  assert.equal((await call(login, req("/api/auth/login", { body: { email: "free@example.com", password: "correct-horse" } }))).data.error, "captcha_failed");   // з обома ключами токен обов'язковий
});

await test("без пошти: реєстрація одразу відкриває сесію, дубль 409, відновлення вимкнено", async () => {
  const nomail = { ...env, RESEND_API_KEY: undefined };
  const n = mails.length;
  const r = await call(register, req("/api/auth/register", { body: { email: "nomail@example.com", password: "correct-horse", turnstile: OK } }), nomail);
  assert.equal(r.status, 200); assert.equal(r.data.signedIn, true);
  const c = r.headers.get("Set-Cookie").split(";")[0];
  assert.equal((await call(me, req("/api/me", { method: "GET", cookie: c }))).data.user.email, "nomail@example.com");
  assert.equal(mails.length, n);
  const row = () => sqlite.prepare("SELECT password_hash, email_verified v FROM users WHERE email = 'nomail@example.com'").get();
  const before = row();
  assert.equal(before.v, 0);
  assert.equal((await log({ email: "nomail@example.com" }, nomail)).status, 200);   // без пошти підтвердження не вимагається
  const dup = await call(register, req("/api/auth/register", { body: { email: "nomail@example.com", password: "attacker-password", turnstile: OK } }), nomail);
  assert.equal(dup.status, 409); assert.equal(dup.data.error, "email_taken");
  assert.equal(row().password_hash, before.password_hash);
  assert.equal((await call(forgot, req("/api/auth/forgot", { body: { email: "nomail@example.com", turnstile: OK } }), nomail)).status, 503);
  // коли пошту ввімкнуть, такий акаунт має підтвердити адресу (через «забули пароль»)
  assert.equal((await log({ email: "nomail@example.com" })).data.error, "email_not_verified");
});

console.log(`\nУсі тести пароля пройдено: ${passed}`);
