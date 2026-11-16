// Уроки й завдання лише для користувача, що увійшов; довідник публічний. Запуск: node tests/content.test.mjs  (Node 22+, node:sqlite як локальний D1)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession, sessionCookie } from "../lib/session.ts";
import { onRequestGet as courses } from "../functions/api/courses.ts";
import { onRequestGet as lessonApi } from "../functions/api/lesson.ts";
import { LESSONS } from "../content/lessons.js";
import { TASKS } from "../content/tasks/index.ts";
import { REF } from "../src/data/reference/index.ts";
import { isRemote } from "../src/tasks/types.ts";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
const stmt = (q) => ({
  q, p: [],
  bind(...a) { this.p = a; return this; },
  async first() { return sqlite.prepare(q).get(...this.p) ?? null; },
  async all() { return { results: sqlite.prepare(q).all(...this.p) }; },
  async run() { const r = sqlite.prepare(q).run(...this.p); return { success: true, meta: { changes: Number(r.changes) } }; },
});
const env = { DB: { prepare: stmt }, SESSION_SECRET: "s".repeat(40) };
const ORIGIN = "https://iteris-code.pages.dev";
const get = async (fn, path, cookie) => {
  const res = await fn({ request: new Request(ORIGIN + path, { headers: cookie ? { Cookie: cookie } : {} }), env });
  return { status: res.status, data: await res.json() };
};
sqlite.prepare("INSERT INTO users (id, email, name) VALUES (?, ?, ?)").run("c1", "c1@x.ua", "c1");
const cookie = sessionCookie(await createSession(env, "c1", 30), 3600).split(";")[0];

let ok = 0;
const t = async (name, fn) => { try { await fn(); ok++; console.log("ok  -", name); } catch (e) { console.log("FAIL -", name, "\n", e.message); process.exitCode = 1; } };

await t("/api/courses без входу: 401 і жодного тексту уроків", async () => {
  const r = await get(courses, "/api/courses");
  assert.equal(r.status, 401);
  assert.deepEqual(r.data, { error: "unauthorized" });
});

await t("/api/lesson без входу: 401", async () => {
  const r = await get(lessonApi, "/api/lesson?k=python&n=1");
  assert.equal(r.status, 401);
  assert.equal(r.data.lesson, undefined);
});

await t("/api/courses після входу: усі курси й завдання, без текстів уроків", async () => {
  const r = await get(courses, "/api/courses", cookie);
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.data.courses).sort(), Object.keys(LESSONS).sort());
  for (const [k, list] of Object.entries(LESSONS)) {
    assert.equal(r.data.courses[k].length, list.length, k);
    assert.deepEqual(r.data.courses[k].map((l) => l.t), list.map((l) => l.t));
    assert.deepEqual(r.data.courses[k].map((l) => l.ch), list.map((l) => l.ch));
  }
  assert.equal(r.data.tasks.length, TASKS.length);
  const text = JSON.stringify(r.data);
  assert.ok(!text.includes('"p":') && !text.includes('"code":') && !text.includes('"tests":') && !text.includes('"starter":'), "тексти й тести не передаються");
});

await t("структура: кожне завдання прив'язане до свого уроку", async () => {
  const r = await get(courses, "/api/courses", cookie);
  for (const x of TASKS) { const [k, n] = x.lesson.split("/"); assert.equal(r.data.courses[k][+n - 1].task, x.id, x.id); }
});

await t("кожен із 162 уроків віддається ідентично файлу, як є", async () => {
  let n = 0;
  for (const [k, list] of Object.entries(LESSONS)) for (let i = 1; i <= list.length; i++) {
    const r = await get(lessonApi, `/api/lesson?k=${k}&n=${i}`, cookie);
    assert.equal(r.status, 200, k + "/" + i);
    assert.deepEqual(r.data.lesson, list[i - 1], k + "/" + i);
    n++;
  }
  assert.equal(n, Object.values(LESSONS).reduce((s, l) => s + l.length, 0));
});

await t("урок із JS-завданням: завдання віддається повністю (тести потрібні браузеру)", async () => {
  const r = await get(lessonApi, "/api/lesson?k=js&n=3", cookie);
  assert.equal(r.data.task.id, "js-safe-city");
  assert.ok(r.data.task.tests.includes("getCity") && r.data.task.starter.length > 0);
});

await t("урок із Go-завданням: очікувані перевірки (checks) браузеру не віддаються", async () => {
  const task = TASKS.find((x) => isRemote(x));
  const [k, n] = task.lesson.split("/");
  const r = await get(lessonApi, `/api/lesson?k=${k}&n=${n}`, cookie);
  assert.equal(r.data.task.id, task.id);
  assert.deepEqual(r.data.task.checks, []);
  assert.ok(task.checks.length > 0, "на сервері перевірки лишились");
  assert.ok(r.data.task.starter.length > 0);
});

await t("урок без завдання: task = null", async () => {
  const r = await get(lessonApi, "/api/lesson?k=python&n=1", cookie);
  assert.equal(r.data.task, null);
});

await t("некоректні параметри: 404", async () => {
  for (const q of ["k=nope&n=1", "k=python&n=0", "k=python&n=999", "k=python&n=abc", "k=python", "n=1", "k=__proto__&n=1", "k=constructor&n=1", "k=python&n=1.5"]) {
    assert.equal((await get(lessonApi, "/api/lesson?" + q, cookie)).status, 404, q);
  }
});

await t("довідник: 13 мов, у кожної розділи з прикладами коду", async () => {
  assert.deepEqual(Object.keys(REF).sort(), Object.keys(LESSONS).sort());
  for (const [k, secs] of Object.entries(REF)) {
    assert.ok(secs.length >= 5, k + ": мало розділів");
    for (const s of secs) {
      assert.ok(s.t && s.items.length, k + ": порожній розділ");
      for (const x of s.items) assert.ok(x.t && x.code.trim().length > 5, k + ": порожній приклад " + x.t);
    }
  }
});

await t("довідник не копіює уроки: жоден приклад не збігається з кодом уроку", async () => {
  const lessonCode = new Set(Object.values(LESSONS).flatMap((l) => l.flatMap((x) => x.code.map((c) => c.trim()))));
  for (const [k, secs] of Object.entries(REF)) for (const s of secs) for (const x of s.items) assert.ok(!lessonCode.has(x.code.trim()), k + ": " + x.t);
});

console.log(`\nУсі тести змісту пройдено: ${ok}`);
