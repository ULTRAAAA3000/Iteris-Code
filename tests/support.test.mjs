// Форма підтримки /api/contact. Запуск: node tests/support.test.mjs (Node 22+, node:sqlite як локальний D1)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession, sessionCookie } from "../lib/session.ts";
import { onRequestPost as contact } from "../functions/api/contact.ts";
import { TOPICS, MSG_MAX } from "../src/support.ts";

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
const ORIGIN = "https://iteris-code.pages.dev";
const base = { DB, SESSION_SECRET: "s".repeat(40) };
const OK = "ok-token";
const mails = [];
let mailDown = false;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.includes("challenges.cloudflare.com")) return Response.json({ success: opts.body.get("response") === OK });
  if (u.includes("api.resend.com")) { if (mailDown) return new Response("{}", { status: 500 }); mails.push(JSON.parse(opts.body)); return Response.json({ id: "m" }); }
  return Response.json({});
};
let ipN = 0;
const send = async (body, { env = base, cookie, origin = ORIGIN, ip } = {}) => {
  const res = await contact({ env, request: new Request(ORIGIN + "/api/contact", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", "CF-Connecting-IP": ip ?? "10.0.0." + ++ipN, ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) }) });
  return { status: res.status, data: await res.json() };
};
const msg = (over = {}) => ({ topic: "visual", email: "ann@example.com", name: "Ann", message: "Анімація кнопки мерехтить на телефоні, дивіться на сторінці входу.", ...over });
const rows = () => sqlite.prepare("SELECT * FROM support_messages ORDER BY created_at, rowid").all();

let passed = 0;
const test = async (name, fn) => { sqlite.exec("DELETE FROM auth_throttle; DELETE FROM support_messages"); mails.length = 0; mailDown = false; await fn(); passed++; console.log("ok  -", name); };

await test("тема, пошта й текст зберігаються; гість без user_id; пошта нормалізується; теми з довідника", async () => {
  assert.deepEqual(Object.keys(TOPICS), ["visual", "bug", "idea", "other"]);
  const r = await send(msg({ email: " Ann@Example.com ", page: "/path", vp: "390x844", ua: "TestBrowser/1.0", motion: "reduce" }));
  assert.equal(r.status, 200); assert.deepEqual(r.data, { ok: true });
  const [row] = rows();
  assert.equal(rows().length, 1);
  assert.deepEqual([row.email, row.topic, row.name, row.user_id, row.emailed], ["ann@example.com", "visual", "Ann", null, 0]);
  assert.deepEqual(JSON.parse(row.meta), { page: "/path", vp: "390x844", ua: "TestBrowser/1.0", motion: "reduce" });
});

await test("перевірки: Origin, тема, пошта, довжина тексту (межі включно), керівні символи в метаданих", async () => {
  assert.equal((await send(msg(), { origin: "https://evil.example" })).status, 403);
  assert.equal((await send(msg({ topic: "hack" }))).data.error, "invalid_topic");
  assert.equal((await send(msg({ topic: undefined }))).data.error, "invalid_topic");
  assert.equal((await send(msg({ topic: "__proto__" }))).data.error, "invalid_topic");
  for (const email of ["", "nope", undefined, 5]) assert.equal((await send(msg({ email }))).data.error, "invalid_email");
  assert.equal((await send(msg({ message: "коротко" }))).data.error, "invalid_message");
  assert.equal((await send(msg({ message: "   " + "x".repeat(9) + "   " }))).data.error, "invalid_message");
  assert.equal((await send(msg({ message: "x".repeat(MSG_MAX + 1) }))).data.error, "invalid_message");
  assert.equal((await send(msg({ message: 42 }))).data.error, "invalid_message");
  assert.equal(rows().length, 0);
  assert.equal((await send(msg({ message: "x".repeat(10) }))).status, 200);
  assert.equal((await send(msg({ email: "b@example.com", message: "y".repeat(MSG_MAX) }))).status, 200);
  const r = await send(msg({ email: "c@example.com", message: "ще одне повідомлення для перевірки", page: "/a\n\u0000b", ua: "x".repeat(900) }));
  const meta = JSON.parse(rows().at(-1).meta);
  assert.equal(r.status, 200); assert.equal(meta.page, "/a b"); assert.equal(meta.ua.length, 300);
});

await test("приманка для ботів (поле website): відповідь «ок», але нічого не зберігається і лист не йде", async () => {
  const r = await send(msg({ website: "http://spam.example" }), { env: { ...base, RESEND_API_KEY: "k", MAIL_FROM: "a@b.ua", SUPPORT_EMAIL: "me@x.ua" } });
  assert.deepEqual(r.data, { ok: true }); assert.equal(rows().length, 0); assert.equal(mails.length, 0);
});

await test("користувач, що увійшов: user_id і ім'я беруться з акаунта, пошту можна не вказувати", async () => {
  sqlite.prepare("INSERT INTO users (id, email, name) VALUES ('u1', 'olena@example.com', 'Олена')").run();
  const cookie = sessionCookie(await createSession(base, "u1", 30), 3600).split(";")[0];
  const r = await send({ topic: "bug", message: "Не зберігається прогрес після уроку 3", website: "" }, { cookie });
  assert.equal(r.status, 200);
  const [row] = rows();
  assert.deepEqual([row.user_id, row.email, row.name, row.topic], ["u1", "olena@example.com", "Олена", "bug"]);
  // user_id з тіла запиту ігнорується
  await send(msg({ user_id: "u1", message: "підміна ідентифікатора користувача" }));
  assert.equal(rows().at(-1).user_id, null);
});

await test("ліміти: 3 звернення на пошту й 5 з одного IP за годину; повторний текст не дублюється", async () => {
  for (let i = 0; i < 3; i++) assert.equal((await send(msg({ message: "повідомлення номер " + i + " з тестового набору" }))).status, 200);
  assert.equal((await send(msg({ message: "четверте повідомлення від тієї ж пошти" }))).status, 429);
  sqlite.exec("DELETE FROM auth_throttle");
  for (let i = 0; i < 5; i++) assert.equal((await send(msg({ email: `u${i}@x.ua`, message: "повідомлення з однієї адреси " + i }), { ip: "9.9.9.9" })).status, 200);
  assert.equal((await send(msg({ email: "u9@x.ua", message: "шосте повідомлення з тієї ж адреси" }), { ip: "9.9.9.9" })).status, 429);
  sqlite.exec("DELETE FROM auth_throttle; DELETE FROM support_messages");
  await send(msg()); await send(msg());
  assert.equal(rows().length, 1);                                       // подвійне натискання
});

await test("Turnstile: без ключів форма працює без токена, з обома ключами токен обов'язковий", async () => {
  assert.equal((await send(msg())).status, 200);
  const env = { ...base, TURNSTILE_SITE_KEY: "site", TURNSTILE_SECRET_KEY: "secret" };
  assert.equal((await send(msg({ message: "без токена перевірки на ботів" }), { env })).data.error, "captcha_failed");
  assert.equal((await send(msg({ message: "з поганим токеном перевірки", turnstile: "bad" }), { env })).data.error, "captcha_failed");
  assert.equal((await send(msg({ message: "з правильним токеном перевірки", turnstile: OK }), { env })).status, 200);
});

await test("лист власнику: тема, автор, технічні дані, Reply-To; збій пошти не втрачає звернення", async () => {
  const env = { ...base, RESEND_API_KEY: "re_k", MAIL_FROM: "Iteris <noreply@x.ua>", SUPPORT_EMAIL: "owner@x.ua" };
  const r = await send(msg({ page: "/path", vp: "390x844", motion: "reduce" }), { env });
  assert.equal(r.status, 200); assert.equal(mails.length, 1);
  const m = mails[0];
  assert.deepEqual([m.to, m.reply_to, m.subject], [["owner@x.ua"], "ann@example.com", "[Iteris Code] Ефекти та візуал"]);
  for (const part of ["Ann <ann@example.com>", "(гість)", "/path", "390x844", "reduce", "мерехтить"]) assert.ok(m.text.includes(part), part);
  assert.equal(rows()[0].emailed, 1);
  mailDown = true;
  assert.equal((await send(msg({ email: "b@x.ua", message: "лист не відправиться, але звернення збережеться" }), { env })).status, 200);
  assert.deepEqual([rows().length, rows().at(-1).emailed], [2, 0]);
  const noTo = await send(msg({ email: "c@x.ua", message: "SUPPORT_EMAIL не задано, лист не йде" }), { env: { ...env, SUPPORT_EMAIL: undefined } });
  assert.equal(noTo.status, 200); assert.equal(mails.length, 1);
});

console.log(`\nУсі тести підтримки пройдено: ${passed}`);
