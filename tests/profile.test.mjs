// Публічний профіль (Етап 4): правила нікнейма й біо, API налаштувань, відкриті дані, приватність, картка для месенджерів, герої.
// Запуск: node tests/profile.test.mjs (Node 22+, node:sqlite як локальний D1)
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession } from "../lib/session.ts";
import { checkBio, checkNick } from "../lib/profile.ts";
import { ensureSchema } from "../lib/schema.ts";
import { IDOLS, defaultIdol, idolById } from "../src/data/idols.ts";
import { onRequestGet as me } from "../functions/api/me.ts";
import { onRequestGet as getProfile, onRequestPost as postProfile } from "../functions/api/profile.ts";
import { onRequestGet as getPublic } from "../functions/api/u.ts";
import { onRequestGet as profilePage, retag } from "../functions/u/[nick].ts";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
const stmt = (q) => ({
  q, p: [],
  bind(...a) { this.p = a; return this; },
  async first() { return sqlite.prepare(q).get(...this.p) ?? null; },
  async all() { return { results: sqlite.prepare(q).all(...this.p) }; },
  async run() { const r = sqlite.prepare(q).run(...this.p); return { success: true, meta: { changes: Number(r.changes) } }; },
});
const DB = {
  prepare: stmt,
  async batch(list) { const out = []; for (const s of list) out.push(/^\s*select/i.test(s.q) ? await s.all() : await s.run()); return out; },
};
const ORIGIN = "https://iteris-code.pages.dev";
const INDEX = `<!doctype html><html><head><title>Iteris Code</title><meta name="description" content="Головна"><link rel="canonical" href="${ORIGIN}/"><meta property="og:title" content="Головна"><meta property="og:description" content="d"><meta property="og:url" content="${ORIGIN}/"><meta property="og:image" content="${ORIGIN}/og.png"><meta name="twitter:title" content="t"><meta name="twitter:description" content="d"><meta name="twitter:image" content="${ORIGIN}/og.png"></head><body></body></html>`;
const env = { DB, SESSION_SECRET: "s".repeat(40), ASSETS: { fetch: async () => new Response(INDEX, { headers: { "Content-Type": "text/html" } }) } };

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };
const mk = (id, name) => sqlite.prepare("INSERT INTO users (id, email, name, avatar_url) VALUES (?1, ?2, ?3, ?4)").run(id, id + "@secret.example", name, "https://lh3.example/photo-" + id + ".jpg");
const cookieOf = async (id) => "session=" + (await createSession(env, id));
const req = (path, { method = "GET", body, cookie } = {}) =>
  new Request(ORIGIN + path, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method === "POST" ? { Origin: ORIGIN, "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
const call = async (fn, r, extra = {}) => { const res = await fn({ request: r, env, params: {}, ...extra }); const t = await res.text(); let d = null; try { d = JSON.parse(t); } catch { /* html */ } return { status: res.status, data: d, text: t, headers: res.headers }; };

mk("u1", "Олена Коваль"); mk("u2", "Богдан Мельник"); mk("u3", "Гість");
const c1 = await cookieOf("u1"), c2 = await cookieOf("u2");

await test("нікнейм: правила й зарезервовані слова", () => {
  assert.deepEqual(checkNick(" Olena_Dev "), { ok: true, nick: "olena_dev" });
  for (const bad of ["ab", "1abc", "a-b-c", "олена", "a".repeat(21), "has space", "", null, 5]) assert.equal(checkNick(bad).error, "nick_invalid", String(bad));
  for (const r of ["admin", "api", "dashboard", "profile", "andrew", "iteris_fan", "IterisCode"]) assert.equal(checkNick(r).error, "nick_reserved", r);
});
await test("біо: довжина, посилання й службові символи", () => {
  assert.equal(checkBio("Вчу JavaScript і Python.\n\n\nЛюблю node.js").bio, "Вчу JavaScript і Python.\nЛюблю node.js");
  for (const l of ["https://x.ua", "мій сайт www.site", "site.com", "pro@mail.ru", "ось a.dev", "t.me/x not; ok.io"]) assert.equal(checkBio(l).error, "bio_links", l);
  assert.equal(checkBio("я".repeat(161)).error, "bio_too_long");
  assert.equal(checkBio("я".repeat(160)).ok, true);
  assert.equal(checkBio("a\u0000b‮c").bio, "abc");
  assert.equal(checkBio(undefined).bio, "");
});
await test("герої: 11 унікальних, картинки є, назва й колір заповнені", () => {
  assert.equal(IDOLS.length, 11);
  assert.equal(new Set(IDOLS.map((i) => i.id)).size, 11);
  assert.equal(new Set(IDOLS.map((i) => i.name)).size, 11);
  for (const i of IDOLS) {
    assert.match(i.id, /^[a-z]+$/);
    assert.match(i.color, /^#[0-9A-F]{6}$/);
    assert.ok(i.name && i.look, i.id);
    assert.ok(existsSync(new URL(`../static/idols/${i.id}.webp`, import.meta.url)), i.id + ".webp");
    assert.ok(existsSync(new URL(`../static/idols/${i.id}-og.jpg`, import.meta.url)), i.id + "-og.jpg");
    assert.equal(checkNick(i.id).error, i.id.length >= 3 ? "nick_reserved" : "nick_invalid", "імена героїв зарезервовано (або надто короткі)");
  }
  assert.equal(idolById("mo").name, "Мо");
  assert.equal(idolById("hacker"), undefined);
  assert.equal(defaultIdol("olena").id, defaultIdol("olena").id);
});

await test("API налаштувань: гість отримує 401, чужий Origin 403, зламане тіло 400", async () => {
  assert.equal((await call(getProfile, req("/api/profile"))).status, 401);
  assert.equal((await call(postProfile, req("/api/profile", { method: "POST", body: { bio: "x" } }))).status, 401);
  const bad = new Request(ORIGIN + "/api/profile", { method: "POST", headers: { Cookie: c1, Origin: "https://evil.example" }, body: "{}" });
  assert.equal((await call(postProfile, bad)).status, 403);
  const broken = new Request(ORIGIN + "/api/profile", { method: "POST", headers: { Cookie: c1, Origin: ORIGIN }, body: "{oops" });
  assert.equal((await call(postProfile, broken)).status, 400);
});
await test("новий користувач: ніка немає, профіль закритий, героя немає", async () => {
  const r = await call(getProfile, req("/api/profile", { cookie: c1 }));
  assert.deepEqual(r.data, { nick: null, avatarId: null, bio: "", public: false });
});
await test("відкрити профіль без ніка не можна", async () => {
  const r = await call(postProfile, req("/api/profile", { method: "POST", cookie: c1, body: { public: true } }));
  assert.equal(r.status, 409); assert.equal(r.data.error, "nick_required");
});
await test("нікнейм: помилки й успіх; зберігається малими літерами", async () => {
  const post = (nick, cookie = c1) => call(postProfile, req("/api/profile", { method: "POST", cookie, body: { nick } }));
  assert.equal((await post("ab")).data.error, "nick_invalid");
  assert.equal((await post("admin")).data.error, "nick_reserved");
  const ok = await post("Olena_Dev");
  assert.equal(ok.status, 200); assert.equal(ok.data.profile.nick, "olena_dev");
  const taken = await post("OLENA_dev", c2);
  assert.equal(taken.status, 409); assert.equal(taken.data.error, "nick_taken");
});
await test("нікнейм не змінюється: інший 409, той самий дозволений, у базі лишається перший", async () => {
  const post = (nick) => call(postProfile, req("/api/profile", { method: "POST", cookie: c1, body: { nick } }));
  const r = await post("new_name");
  assert.equal(r.status, 409); assert.equal(r.data.error, "nick_locked");
  assert.equal((await post("olena_dev")).status, 200);
  assert.equal(sqlite.prepare("SELECT nick FROM users WHERE id = 'u1'").get().nick, "olena_dev");
});
await test("при гонці два запити з нікнеймом не перезаписують перший (умова nick IS NULL у запиті)", async () => {
  mk("u9", "Гонка");
  const c9 = await cookieOf("u9");
  const [a, b] = await Promise.all(["race_one", "race_two"].map((nick) => call(postProfile, req("/api/profile", { method: "POST", cookie: c9, body: { nick } }))));
  assert.equal([a, b].filter((x) => x.status === 200).length >= 1, true);
  assert.match(sqlite.prepare("SELECT nick FROM users WHERE id = 'u9'").get().nick, /^race_(one|two)$/);
});
await test("герой-аватарка: невідомий id відхиляється, null скидає вибір", async () => {
  const post = (body) => call(postProfile, req("/api/profile", { method: "POST", cookie: c1, body }));
  assert.equal((await post({ avatarId: "../../etc" })).data.error, "avatar_invalid");
  assert.equal((await post({ avatarId: 7 })).data.error, "avatar_invalid");
  assert.equal((await post({ avatarId: "mo" })).data.profile.avatarId, "mo");
  assert.equal((await post({ avatarId: null })).data.profile.avatarId, null);
  await post({ avatarId: "andrew" });
});
await test("біо: посилання й задовге відхиляються; текст зберігається як є (екранує сайт)", async () => {
  const post = (bio) => call(postProfile, req("/api/profile", { method: "POST", cookie: c1, body: { bio } }));
  assert.equal((await post("https://evil.example")).data.error, "bio_links");
  assert.equal((await post("я".repeat(200))).data.error, "bio_too_long");
  const r = await post("Вчу <b>JS</b> і Python");
  assert.equal(r.data.profile.bio, "Вчу <b>JS</b> і Python");
});
await test("/api/me віддає нікнейм і героя для шапки", async () => {
  const r = await call(me, req("/api/me", { cookie: c1 }));
  assert.equal(r.data.user.nick, "olena_dev"); assert.equal(r.data.user.avatarId, "andrew");
});

await test("закритий профіль: гість і інший користувач бачать 404, власник бачить із ознакою own", async () => {
  const get = (cookie) => call(getPublic, req("/api/u?nick=olena_dev", { cookie }));
  assert.equal((await get()).status, 404);
  assert.equal((await get(c2)).status, 404);
  const own = await get(c1);
  assert.equal(own.status, 200); assert.equal(own.data.own, true); assert.equal(own.data.public, false);
  assert.equal((await call(getPublic, req("/api/u?nick=nobody"))).status, 404);
  assert.equal((await call(getPublic, req("/api/u?nick=a'%20OR%201=1"))).status, 404);
});
// Прогрес: 3 уроки js, 1 python, 1 неіснуючий урок, 2 дії за сьогодні, одне розв'язане завдання
sqlite.exec(`INSERT INTO user_progress (user_id, lesson_id) VALUES ('u1','js/1'),('u1','js/2'),('u1','js/3'),('u1','python/1'),('u1','python/9999'),('u1','nope/1');
  INSERT INTO task_submissions (id, user_id, task_id, code, is_passed) VALUES ('s1','u1','js-sum','x',1),('s2','u1','js-sum','x',0);
  INSERT INTO xp_events (user_id, amount, reason, ref) VALUES ('u1', 30, 'lesson', 'js/1'), ('u1', 20, 'lesson', 'js/2');`);
await test("відкриваємо профіль: дані без імені й пошти, прогрес рахується лише по існуючих уроках", async () => {
  assert.equal((await call(postProfile, req("/api/profile", { method: "POST", cookie: c1, body: { public: true } }))).status, 200);
  const r = await call(getPublic, req("/api/u?nick=OLENA_DEV"));
  assert.equal(r.status, 200); assert.equal(r.data.own, false);
  const p = r.data.profile;
  assert.equal(p.nick, "olena_dev"); assert.equal(p.avatarId, "andrew");
  assert.equal(p.lessons, 4); assert.equal(p.tasks, 1); assert.equal(p.xp, 50);
  assert.ok(p.level >= 1);
  assert.deepEqual(p.courses.map((c) => c.key).sort(), ["js", "python"]);
  const js = p.courses.find((c) => c.key === "js"); assert.equal(js.done, 3); assert.ok(js.total >= 3);
  const today = new Date().toISOString().slice(0, 10);
  assert.equal(p.activity[today], 6 + 2);   // як і в кабінеті: усі записи за день, уроків 6 рядків і 2 спроби
  assert.ok(Array.isArray(p.badges) && p.badges.includes("lesson1"), "badges у профілі");
  const raw = r.text;
  for (const secret of ["secret.example", "Олена", "Коваль", "photo-u1", "u1@", '"id"', "email"]) assert.ok(!raw.includes(secret), "витік: " + secret);
});
await test("закрили профіль назад: знову 404 для гостя", async () => {
  await call(postProfile, req("/api/profile", { method: "POST", cookie: c1, body: { public: false } }));
  assert.equal((await call(getPublic, req("/api/u?nick=olena_dev"))).status, 404);
  await call(postProfile, req("/api/profile", { method: "POST", cookie: c1, body: { public: true } }));
});

await test("сторінка /u/<нік>: відкритий профіль отримує заголовок, опис і картинку героя", async () => {
  const r = await call(profilePage, req("/u/Olena_Dev"), { params: { nick: "Olena_Dev" } });
  assert.equal(r.status, 200);
  assert.match(r.text, /<title>@olena_dev: профіль на Iteris Code<\/title>/);
  assert.ok(r.text.includes(`<link rel="canonical" href="${ORIGIN}/u/olena_dev">`));
  assert.ok(r.text.includes(`<meta property="og:image" content="${ORIGIN}/idols/andrew-og.jpg">`));
  assert.ok(r.text.includes(`<meta name="twitter:image" content="${ORIGIN}/idols/andrew-og.jpg">`));
  assert.ok(r.text.includes("Вчу &lt;b&gt;JS&lt;/b&gt; і Python"), "біо екранується в мета-тегах");
  assert.ok(!r.text.includes("<b>JS</b>"));
  assert.ok(!/secret\.example|Олена/.test(r.text));
});
await test("сторінка /u/<нік>: закритий або неіснуючий профіль дає 404 і noindex, без даних", async () => {
  sqlite.exec("UPDATE users SET profile_public = 0 WHERE id = 'u1'");
  for (const nick of ["olena_dev", "nobody"]) {
    const r = await call(profilePage, req("/u/" + nick), { params: { nick } });
    assert.equal(r.status, 404); assert.ok(r.text.includes('<meta name="robots" content="noindex">'));
    assert.ok(!r.text.includes("olena_dev"));
  }
  sqlite.exec("UPDATE users SET profile_public = 1 WHERE id = 'u1'");
});
await test("retag: підставляє всі теги й екранує лапки", () => {
  const out = retag(INDEX, { title: 'A "b"', desc: "<x>", url: ORIGIN + "/u/a", image: ORIGIN + "/i.jpg" });
  assert.ok(out.includes('<title>A &quot;b&quot;</title>') && out.includes('content="&lt;x&gt;"') && !out.includes('content="Головна"'));
});

await test("схема: стару базу без нових колонок дозаповнює ensureSchema, нік залишається унікальним", async () => {
  const old = new DatabaseSync(":memory:");
  old.exec("CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, avatar_url TEXT, is_pro INTEGER DEFAULT 0, pro_until DATETIME, streak_count INTEGER DEFAULT 0, last_active_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
  old.exec("INSERT INTO users (id, email) VALUES ('a','a@x'),('b','b@x')");
  const od = { prepare: (q) => ({ q, p: [], bind(...a) { this.p = a; return this; }, async all() { return { results: old.prepare(q).all(...this.p) }; }, async run() { old.prepare(q).run(...this.p); return { success: true }; } }), async batch(l) { for (const s of l) await s.run(); return []; } };
  // ensureSchema кешує готовність у модулі: імпортуємо свіжу копію
  const fresh = await import("../lib/schema.ts?old");
  await fresh.ensureSchema({ DB: od });
  const cols = old.prepare("SELECT name FROM pragma_table_info('users')").all().map((c) => c.name);
  for (const c of ["nick", "avatar_id", "bio", "profile_public"]) assert.ok(cols.includes(c), c);
  old.exec("UPDATE users SET nick = 'same' WHERE id = 'a'");
  assert.throws(() => old.exec("UPDATE users SET nick = 'same' WHERE id = 'b'"), /UNIQUE/);
  old.exec("UPDATE users SET nick = NULL WHERE id = 'a'; UPDATE users SET nick = NULL WHERE id = 'b'");   // без ніка може бути багато
});

console.log(`\nУсі перевірки публічного профілю пройдено: ${passed}`);
