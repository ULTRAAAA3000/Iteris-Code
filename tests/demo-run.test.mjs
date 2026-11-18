// Python в демо лендингу: /api/demo-run для гостів (одне фіксоване завдання, жорсткі ліміти). Зовнішній Wandbox підміняється.
// Запуск: node tests/demo-run.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

import { resetWandboxCache } from "../lib/runners.ts";
import { onRequestPost as demoRun } from "../functions/api/demo-run.ts";
import { DEMO_PY } from "../src/demo.ts";
import { evalChecks } from "../src/runner/checks.ts";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
const stmt = (q) => ({
  q, p: [],
  bind(...a) { this.p = a; return this; },
  async first() { return sqlite.prepare(q).get(...this.p) ?? null; },
  async all() { return { results: sqlite.prepare(q).all(...this.p) }; },
  async run() { const r = sqlite.prepare(q).run(...this.p); return { success: true, meta: { changes: Number(r.changes) } }; },
});
const env = { DB: { prepare: stmt, async batch(l) { const o = []; for (const s of l) o.push(/^\s*select/i.test(s.q) ? await s.all() : await s.run()); return o; } } };
const ORIGIN = "https://iteris-code.pages.dev";
const req = (body, { origin = ORIGIN, ip = "2.2.2.2", raw } = {}) =>
  new Request(ORIGIN + "/api/demo-run", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json", "CF-Connecting-IP": ip }, body: raw ?? JSON.stringify(body) });
const call = async (r) => { const res = await demoRun({ request: r, env }); return { status: res.status, data: await res.json() }; };

let reply = { status: "0", program_output: "", program_error: "" };
let down = false, compiles = 0;
globalThis.fetch = async (url) => {
  if (down) throw new TypeError("fetch failed");
  if (String(url).endsWith("/list.json")) return new Response(JSON.stringify([{ name: "cpython-3.13.0", language: "Python" }]));
  compiles++;
  return new Response(JSON.stringify(reply));
};
let passed = 0;
const test = async (name, fn) => { resetWandboxCache(); await fn(); passed++; console.log("ok  -", name); };

await test("еталон: усі перевірки пройдено, гість без входу", async () => {
  reply = { status: "0", program_output: "Привіт\n12\n", program_error: "" };
  const r = await call(req({ code: 'print("Привіт")\nprint(3 * 4)' }));
  assert.equal(r.status, 200); assert.equal(r.data.passed, true); assert.equal(r.data.results.length, 3);
  assert.equal(r.data.proof, undefined, "підпису для збереження результату немає");
});
await test("заготовка й часткове рішення не проходять", async () => {
  reply = { status: "0", program_output: "\n", program_error: "" };
  assert.equal((await call(req({ code: DEMO_PY.starter }))).data.passed, false);
  reply = { status: "0", program_output: "Привіт\n", program_error: "" };
  const r = await call(req({ code: 'print("Привіт")' }, { ip: "2.2.2.3" }));
  assert.deepEqual(r.data.results.map((x) => x.passed), [true, false, false]);
});
await test("аварія програми — провал з поясненням", async () => {
  reply = { status: "1", program_output: "Привіт\n12\n", program_error: "Traceback: boom" };
  const r = await call(req({ code: "raise Exception()" }, { ip: "2.2.2.4" }));
  assert.equal(r.data.passed, false); assert.ok(r.data.results[0].error.includes("Traceback"));
});
await test("валідація: чужий origin, порожній і завеликий код, не-JSON", async () => {
  assert.equal((await call(req({ code: "x" }, { origin: "https://evil.example" }))).status, 403);
  assert.equal((await call(req({ code: "   " }))).status, 400);
  assert.equal((await call(req({ code: "x".repeat(1501) }))).status, 400);
  assert.equal((await call(req(null, { raw: "не json" }))).status, 400);
  assert.equal((await call(req({ code: 5 }))).status, 400);
});
await test("ліміт за IP: 8 запусків на 10 хвилин, інший IP не страждає", async () => {
  reply = { status: "0", program_output: "x", program_error: "" };
  const ip = "9.9.9.9", codes = [];
  for (let i = 0; i < 9; i++) codes.push((await call(req({ code: "print(1)" }, { ip }))).status);
  assert.deepEqual(codes, [200, 200, 200, 200, 200, 200, 200, 200, 429]);
  assert.equal((await call(req({ code: "print(1)" }, { ip: "8.8.8.8" }))).status, 200);
});
await test("сервіс недоступний: 503, а не падіння", async () => {
  down = true;
  assert.equal((await call(req({ code: "print(1)" }, { ip: "7.7.7.7" }))).status, 503);
  down = false;
});
await test("перевірки завдання: еталонний вивід проходить, інший ні", () => {
  assert.ok(evalChecks(DEMO_PY.checks, "", { stdout: "Привіт\n12\n", stderr: "" }).every((r) => r.passed));
  assert.ok(!evalChecks(DEMO_PY.checks, "", { stdout: "12\nПривіт\n", stderr: "" }).every((r) => r.passed));
});
console.log(`\nУсі тести демо-запуску Python пройдено: ${passed}`);
