// Віддалений запуск завдань: /api/run, перевірки (checks), підпис proof і збереження результату.
// Зовнішній сервіс Go Playground підміняється, мережа не потрібна. Запуск: node tests/run.test.mjs  (Node 22+)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { createSession, sessionCookie } from "../lib/session.ts";
import { signProof, verifyProof } from "../lib/proof.ts";
import { onRequestPost as run } from "../functions/api/run.ts";
import { onRequestPost as complete } from "../functions/api/progress/complete.ts";
import { evalChecks, normalize } from "../src/runner/checks.ts";
import { taskById } from "../src/tasks/index.ts";
import { SOLUTIONS } from "./solutions.mjs";

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
  async batch(list) { const out = []; for (const s of list) out.push(isSelect(s.q) ? await s.all() : await s.run()); return out; },
};
const env = { DB, SESSION_SECRET: "s".repeat(40) };
const ORIGIN = "https://iteris-code.pages.dev";
const req = (path, { body, cookie, origin = ORIGIN, ip = "1.1.1.1" } = {}) =>
  new Request(ORIGIN + path, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", "CF-Connecting-IP": ip, ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
const call = async (fn, r) => { const res = await fn({ request: r, env }); return { status: res.status, data: await res.json() }; };
const login = async (id) => {
  sqlite.prepare("INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)").run(id, id + "@x.ua", id);
  return sessionCookie(await createSession(env, id, 30), 3600).split(";")[0];
};

// Підміна go.dev: що сказати наступним запитом і що було надіслано
let reply = { Events: [], Status: 0 };
let sent = null;
let down = false;
globalThis.fetch = async (url, init) => {
  sent = { url: String(url), method: init.method, form: new URLSearchParams(init.body) };
  if (down) throw new TypeError("fetch failed");
  return new Response(JSON.stringify(reply), { status: 200, headers: { "Content-Type": "application/json" } });
};
const out = (text, extra = {}) => { reply = { Errors: "", Events: [{ Message: text, Kind: "stdout", Delay: 0 }], Status: 0, ...extra }; };
const HELLO = "go-hello-module";
const helloCode = SOLUTIONS[HELLO];

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };

await test("checks: нормалізація виводу й типи перевірок", () => {
  assert.equal(normalize("a  \r\nb\t\n\n\n"), "a\nb");
  const r = evalChecks([
    { on: "stdout", name: "eq", equals: "x\ny" }, { on: "stdout", name: "has", has: "y" }, { on: "stdout", name: "re", matches: "^x\\ny$" },
    { on: "stdout", name: "not", has: "z", not: true }, { on: "source", name: "src", matches: "\\bfor\\b" }, { on: "source", name: "bad", has: "goto" },
  ], "for {}", { stdout: "x \ny\n\n", stderr: "" });
  assert.deepEqual(r.map((x) => x.passed), [true, true, true, true, true, false]);
  assert.match(r[5].error, /не знайдено/);
  const f = evalChecks([{ on: "stdout", name: "e", equals: "5" }], "", { stdout: "4", stderr: "" })[0];
  assert.match(f.error, /очікувалось: 5/); assert.match(f.error, /отримано:\s+4/);
});

await test("запит до Go Playground: адреса, метод, код у тілі форми", async () => {
  out("Привіт, Go!\nМодуль: example.com/hello\n");
  await call(run, req("/api/run", { body: { taskId: HELLO, code: helloCode } }));
  assert.equal(sent.url, "https://go.dev/_/compile");
  assert.equal(sent.method, "POST");
  assert.equal(sent.form.get("body"), helloCode);
  assert.equal(sent.form.get("version"), "2");
});

await test("правильне рішення: усі перевірки пройдено, гість без proof", async () => {
  out("Привіт, Go!\nМодуль: example.com/hello\n");
  const r = await call(run, req("/api/run", { body: { taskId: HELLO, code: helloCode } }));
  assert.equal(r.status, 200);
  assert.equal(r.data.passed, true);
  assert.ok(r.data.results.every((x) => x.passed));
  assert.match(r.data.stdout, /Привіт, Go!/);
  assert.equal(r.data.proof, undefined, "гостю підпис не видається");
});

await test("неправильний вивід: перевірка падає, є очікуване й отримане", async () => {
  out("Привіт!\n");
  const r = await call(run, req("/api/run", { body: { taskId: HELLO, code: helloCode } }));
  assert.equal(r.data.passed, false);
  const exact = r.data.results.find((x) => !x.passed && /очікувалось/.test(x.error ?? ""));
  assert.ok(exact, "потрібне пояснення «очікувалось / отримано»");
  assert.equal(r.data.proof, undefined);
});

await test("помилка компіляції: текст компілятора з main.go, перевірки не запускаються", async () => {
  reply = { Errors: "./prog.go:6:2: undefined: x\n\nGo build failed.", Events: [], Status: 0 };
  const r = await call(run, req("/api/run", { body: { taskId: HELLO, code: helloCode } }));
  assert.equal(r.data.passed, false);
  assert.match(r.data.error, /main\.go:6:2: undefined: x/);
  assert.doesNotMatch(r.data.error, /prog\.go/);
  assert.deepEqual(r.data.results, []);
});

await test("аварія (panic) завжди провал, навіть якщо потрібний вивід є", async () => {
  reply = { Errors: "", Events: [{ Message: "Привіт, Go!\nМодуль: example.com/hello\n", Kind: "stdout" }, { Message: "panic: boom\n", Kind: "stderr" }], Status: 2 };
  const r = await call(run, req("/api/run", { body: { taskId: HELLO, code: helloCode } }));
  assert.equal(r.data.passed, false);
  assert.equal(r.data.results[0].name, "Програма завершується без аварії");
  assert.match(r.data.results[0].error, /panic: boom/);
});

await test("нескінченний цикл: повідомлення про тайм-аут", async () => {
  reply = { Errors: "timeout running program", Events: [], Status: 0 };
  const r = await call(run, req("/api/run", { body: { taskId: HELLO, code: helloCode } }));
  assert.equal(r.data.timedOut, true);
  assert.match(r.data.error, /нескінченний цикл/);
});

await test("сервіс Go недоступний: 503 з зрозумілим кодом, а не порожня відповідь", async () => {
  down = true;
  const r = await call(run, req("/api/run", { body: { taskId: HELLO, code: helloCode }, ip: "2.2.2.2" }));
  down = false;
  assert.equal(r.status, 503);
  assert.equal(r.data.error, "runner_unavailable");
});

await test("некоректні запити: чужий Origin, невідоме й JS-завдання, порожній і завеликий код", async () => {
  const bad = (body, extra) => call(run, req("/api/run", { body, ip: "3.3.3.3", ...extra }));
  assert.equal((await bad({ taskId: HELLO, code: "x" }, { origin: "https://evil.example" })).status, 403);
  assert.equal((await bad({ taskId: "nope", code: "x" })).status, 400);
  assert.equal((await bad({ taskId: "js-safe-city", code: "x" })).status, 400, "JS-завдання запускаються в браузері");
  assert.equal((await bad({ taskId: HELLO, code: "   " })).status, 400);
  assert.equal((await bad({ taskId: HELLO, code: "x".repeat(8001) })).status, 400);
  assert.equal((await bad({ taskId: HELLO })).status, 400);
});

await test("ліміт запусків: після 12 за хвилину 429, інший користувач не страждає", async () => {
  out("x");
  const codes = [];
  for (let i = 0; i < 14; i++) codes.push((await call(run, req("/api/run", { body: { taskId: HELLO, code: helloCode }, ip: "9.9.9.9" }))).status);
  assert.equal(codes.filter((c) => c === 200).length, 12);
  assert.equal(codes.at(-1), 429);
  assert.equal((await call(run, req("/api/run", { body: { taskId: HELLO, code: helloCode }, ip: "8.8.8.8" }))).status, 200);
});

await test("користувач отримує proof, а збереження без нього не дає XP", async () => {
  const cookie = await login("u1");
  out("Привіт, Go!\nМодуль: example.com/hello\n");
  const r = await call(run, req("/api/run", { body: { taskId: HELLO, code: helloCode }, cookie, ip: "4.4.4.4" }));
  assert.equal(r.data.passed, true);
  assert.equal(typeof r.data.proof, "string");

  // «пройдено» від браузера без підпису не приймається
  const forged = await call(complete, req("/api/progress/complete", { body: { taskId: HELLO, code: helloCode, passed: true }, cookie }));
  assert.equal(forged.data.firstSolve, false);
  assert.equal(forged.data.xp, 0);
  assert.equal(sqlite.prepare("SELECT COUNT(*) c FROM task_submissions WHERE user_id = 'u1' AND is_passed = 1").get().c, 0);

  // підпис від іншого коду відхиляється
  const other = await call(complete, req("/api/progress/complete", { body: { taskId: HELLO, code: helloCode + "\n// інше", passed: true, proof: r.data.proof }, cookie }));
  assert.equal(other.data.firstSolve, false);

  // правильний підпис: XP й перемога
  const ok = await call(complete, req("/api/progress/complete", { body: { taskId: HELLO, code: helloCode, passed: true, proof: r.data.proof }, cookie }));
  assert.equal(ok.data.firstSolve, true);
  assert.equal(ok.data.xp, taskById(HELLO).xp);

  // повторно XP не нараховується
  const again = await call(complete, req("/api/progress/complete", { body: { taskId: HELLO, code: helloCode, passed: true, proof: r.data.proof }, cookie }));
  assert.equal(again.data.firstSolve, false);
});

await test("proof: прив'язаний до користувача, завдання й коду, має термін дії", async () => {
  const p = await signProof(env, "uA", HELLO, "код");
  assert.equal(await verifyProof(env, p, "uA", HELLO, "код"), true);
  assert.equal(await verifyProof(env, p, "uB", HELLO, "код"), false);
  assert.equal(await verifyProof(env, p, "uA", "go-first-program", "код"), false);
  assert.equal(await verifyProof(env, p, "uA", HELLO, "код2"), false);
  assert.equal(await verifyProof(env, p + "x", "uA", HELLO, "код"), false);
  assert.equal(await verifyProof({ SESSION_SECRET: "інший".repeat(10) }, p, "uA", HELLO, "код"), false);
  const realNow = Date.now;
  Date.now = () => realNow() + 16 * 60 * 1000;
  try { assert.equal(await verifyProof(env, p, "uA", HELLO, "код"), false, "через 15 хвилин підпис недійсний"); } finally { Date.now = realNow; }
});

await test("JS-завдання зберігаються як раніше (без proof)", async () => {
  const cookie = await login("u2");
  const r = await call(complete, req("/api/progress/complete", { body: { taskId: "js-safe-city", code: "x", passed: true }, cookie }));
  assert.equal(r.data.firstSolve, true);
});

console.log(`\nУсі перевірки віддаленого запуску пройдено: ${passed}`);
