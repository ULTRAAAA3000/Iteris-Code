// Плашка «Цікавий факт»: дані, вибір запису за часом, цикл без повторів, API кабінету. Запуск: node tests/facts.test.mjs  (Node 22+)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession, sessionCookie } from "../lib/session.ts";
import { onRequestGet as dashboard } from "../functions/api/dashboard.ts";
import { onRequestPost as onboarding } from "../functions/api/onboarding.ts";
import { LESSONS } from "../content/lessons.js";
import { FACTS } from "../content/facts.ts";
import { FACT_PERIOD_MS, factFor, factLangs, pool } from "../lib/facts.ts";

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
  async batch(list) {
    sqlite.exec("BEGIN");
    try { const out = []; for (const s of list) out.push(isSelect(s.q) ? await s.all() : await s.run()); sqlite.exec("COMMIT"); return out; }
    catch (e) { sqlite.exec("ROLLBACK"); throw e; }
  },
};
const env = { DB, SESSION_SECRET: "s".repeat(40) };
const ORIGIN = "https://iteris-code.pages.dev";
const req = (path, { method = "GET", body, cookie, origin = ORIGIN } = {}) =>
  new Request(ORIGIN + path, { method, headers: { ...(cookie ? { Cookie: cookie } : {}), ...(method === "POST" ? { Origin: origin, "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
const call = async (fn, r) => { const res = await fn({ request: r, env }); return { status: res.status, data: await res.json() }; };
const login = async (id) => {
  sqlite.prepare("INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)").run(id, id + "@x.ua", id);
  return sessionCookie(await createSession(env, id, 30), 3600).split(";")[0];
};
let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };
const H = FACT_PERIOD_MS;
const T0 = Date.UTC(2026, 10, 17, 12, 0, 0);   // довільний момент

await test("дані: факти є для кожного курсу й для «загальних»; у кожного не менше 20 фактів і 7 підказок", () => {
  assert.deepEqual(Object.keys(FACTS).sort(), [...Object.keys(LESSONS), "general"].sort());
  for (const [k, v] of Object.entries(FACTS)) {
    assert.ok(v.f.length >= 60, k + ": фактів " + v.f.length);
    assert.ok(v.t.length >= 20, k + ": підказок " + v.t.length);
  }
});

await test("дані: тексти 20–300 символів, парні зворотні лапки, без дублікатів між усіма записами, без HTML-тегів поза кодом", () => {
  const all = Object.values(FACTS).flatMap((v) => [...v.f, ...v.t]);
  assert.ok(all.length >= 1100, "усього записів " + all.length);
  assert.equal(new Set(all).size, all.length, "є повторювані тексти");
  for (const x of all) {
    assert.ok(x.length >= 20 && x.length <= 300, x.length + ": " + x);
    assert.equal(x.split("`").length % 2, 1, "непарні зворотні лапки: " + x);
    assert.ok(!/<[a-z/]/i.test(x.replace(/`[^`]*`/g, "")), "HTML поза зворотними лапками: " + x);
  }
});

await test("порція: пул напрямку містить усі факти й підказки, а після кожних трьох фактів іде підказка", () => {
  for (const k of Object.keys(FACTS)) {
    const p = pool(k);
    assert.equal(p.length, FACTS[k].f.length + FACTS[k].t.length, k);
    assert.deepEqual(p.slice(0, 4).map((e) => e.kind), ["fact", "fact", "fact", "tip"], k);
  }
});

await test("час: запис незмінний усередині п'ятигодинного вікна, змінюється на його межі, а nextAt = кінець вікна", () => {
  const a = factFor("u1", ["js"], T0), slot = Math.floor(T0 / H);
  assert.equal(a.id, String(slot));
  assert.equal(a.nextAt, new Date((slot + 1) * H).toISOString());
  const edgeStart = (slot + 1) * H;
  assert.deepEqual(factFor("u1", ["js"], edgeStart - 1), a);
  assert.deepEqual(factFor("u1", ["js"], slot * H), a);
  const b = factFor("u1", ["js"], edgeStart);
  assert.equal(b.id, String(slot + 1));
  assert.notEqual(b.text, a.text);
  assert.equal(factFor("u1", ["js"], T0).text, factFor("u1", ["js"], T0).text);
});

await test("напрямок: один курс дає факти лише про нього, порожній вибір, невідомі та «general» дають загальні", () => {
  for (let i = 0; i < 40; i++) assert.equal(factFor("u1", ["go"], T0 + i * H).lang, "go");
  for (const c of [[], null, undefined, ["nope"], ["general"], ["__proto__"], ["constructor"]]) assert.equal(factFor("u1", c, T0).lang, "general", String(c));
  assert.deepEqual(factLangs(["go", "go", "nope", "sql"]), ["go", "sql"]);
});

await test("напрямок: кілька курсів чергуються по вікнах і кожен показується однаково часто", () => {
  const langs = ["python", "go", "sql"], counts = {};
  const slot0 = Math.floor(T0 / H);
  for (let i = 0; i < 30; i++) {
    const f = factFor("u1", langs, (slot0 + i) * H);
    assert.equal(f.lang, langs[(slot0 + i) % 3]);
    counts[f.lang] = (counts[f.lang] || 0) + 1;
  }
  assert.deepEqual(Object.values(counts), [10, 10, 10]);
});

await test("цикл: для одного напрямку за n показів з'являються всі записи рівно по разу, потім усе повторюється", () => {
  for (const lang of ["python", "git", "general"]) {
    const n = pool(lang).length, slot0 = Math.floor(T0 / H);
    const seq = Array.from({ length: 2 * n }, (_, i) => factFor("u7", [lang], (slot0 + i) * H).text);
    assert.equal(new Set(seq.slice(0, n)).size, n, lang + ": у першому колі є повтори");
    assert.deepEqual(seq.slice(n), seq.slice(0, n), lang + ": друге коло відрізняється від першого");
  }
});

await test("цикл: для кількох курсів кожен проходить усі свої записи без повторів", () => {
  const langs = ["css", "html"], slot0 = Math.floor(T0 / H), seen = { css: [], html: [] };
  const total = Math.max(pool("css").length, pool("html").length) * 2;
  for (let i = 0; i < total; i++) { const f = factFor("u9", langs, (slot0 + i) * H); seen[f.lang].push(f.text); }
  for (const l of langs) {
    const n = pool(l).length;
    assert.equal(new Set(seen[l].slice(0, n)).size, n, l);
  }
});

await test("різні люди починають з різних записів і йдуть у різному порядку", () => {
  const first = new Set();
  for (let u = 0; u < 12; u++) first.add(factFor("user-" + u, ["python"], T0).text);
  assert.ok(first.size >= 6, "перші факти різних людей: " + first.size);
  const a = Array.from({ length: 8 }, (_, i) => factFor("A", ["js"], T0 + i * H).text).join("|");
  const b = Array.from({ length: 8 }, (_, i) => factFor("B", ["js"], T0 + i * H).text).join("|");
  assert.notEqual(a, b);
});

await test("вигляд запису: вид «fact» або «tip», id вікна, nextAt у майбутньому відносно now", () => {
  for (let i = 0; i < 50; i++) {
    const now = T0 + i * 3_700_000, f = factFor("u2", ["java", "php"], now);
    assert.ok(f.kind === "fact" || f.kind === "tip");
    assert.ok(Date.parse(f.nextAt) > now && Date.parse(f.nextAt) - now <= H);
    assert.ok(f.text.length > 10);
  }
});

/* ---- API кабінету ---- */
const get = (cookie) => call(dashboard, req("/api/dashboard", { cookie }));
const save = (cookie, courses) => call(onboarding, req("/api/onboarding", { method: "POST", cookie, body: { level: "beginner", courses } }));

await test("/api/dashboard: гостю 401, без вибору курсів приходить загальний факт, у відповіді є nextAt і id вікна", async () => {
  assert.equal((await get()).status, 401);
  const c = await login("fa1");
  const r = await get(c);
  assert.equal(r.status, 200);
  assert.equal(r.data.fact.lang, "general");
  assert.deepEqual(Object.keys(r.data.fact).sort(), ["id", "kind", "lang", "nextAt", "text"]);
  assert.ok(Date.parse(r.data.fact.nextAt) > Date.now());
});

await test("/api/dashboard: після вибору курсів факт про один із них, і відповідає тому, що рахує factFor", async () => {
  const c = await login("fa2");
  assert.equal((await save(c, ["go", "sql"])).status, 200);
  const before = Date.now(), r = await get(c), after = Date.now();
  assert.ok(["go", "sql"].includes(r.data.fact.lang));
  const ok = [before, after].some((t) => JSON.stringify(factFor("fa2", ["go", "sql"], t)) === JSON.stringify(r.data.fact));
  assert.ok(ok, "факт збігається з factFor");
});

console.log(`\nУсі тести плашки фактів пройдено: ${passed}`);
