// Адаптер Wandbox (Python, Java, C++, PHP, Pascal): вибір компілятора, розбір відповіді, помилки. Мережа підміняється.
// Запуск: node tests/wandbox.test.mjs
import assert from "node:assert/strict";
import { RUNNERS, RunnerUnavailable, pickCompiler, resetWandboxCache } from "../lib/runners.ts";

const LIST = [
  { name: "cpython-head", language: "Python" }, { name: "cpython-3.9.19", language: "Python" }, { name: "cpython-3.13.0", language: "Python" }, { name: "cpython-3.12.7", language: "Python" }, { name: "cpython-2.7.18", language: "Python" },
  { name: "openjdk-jdk-21+35", language: "Java" }, { name: "openjdk-jdk-22+36", language: "Java" }, { name: "openjdk-head", language: "Java" },
  { name: "gcc-head-c", language: "C" }, { name: "gcc-13.2.0-c", language: "C" }, { name: "clang-18.1.0-c", language: "C" }, { name: "gcc-head", language: "C++" }, { name: "gcc-13.2.0", language: "C++" }, { name: "gcc-9.5.0", language: "C++" }, { name: "clang-18.1.0", language: "C++" },
  { name: "php-8.3.12", language: "PHP" }, { name: "php-8.4.1", language: "PHP" }, { name: "php-head", language: "PHP" },
  { name: "fpc-3.0.2", language: "Pascal" }, { name: "fpc-3.2.2", language: "Pascal" },
  { name: "sqlite-3.45.1", language: "SQL" }, { name: "sqlite-3.46.0", language: "SQL" }, { name: "sqlite-head", language: "SQL" }, { name: "bash", language: "Bash script" },
  { name: "typescript-5.5.4", language: "TypeScript" }, { name: "typescript-5.6.2", language: "TypeScript" }, { name: "typescript-head", language: "TypeScript" },
];

let calls = [];
let reply = {};
let listOk = true;
globalThis.fetch = async (url, init = {}) => {
  calls.push({ url: String(url), body: init.body ? JSON.parse(init.body) : null });
  if (String(url).endsWith("/list.json")) return listOk ? new Response(JSON.stringify(LIST)) : new Response("x", { status: 500 });
  return new Response(JSON.stringify(reply));
};

let passed = 0;
const test = async (name, fn) => { resetWandboxCache(); calls = []; listOk = true; await fn(); passed++; console.log("ok  -", name); };

await test("вибір компілятора: найновіший стабільний, без head і чужих компіляторів", () => {
  assert.equal(pickCompiler(LIST, "Python", /^cpython-3\./), "cpython-3.13.0");
  assert.equal(pickCompiler(LIST, "Java", /^openjdk-/), "openjdk-jdk-22+36");
  assert.equal(pickCompiler(LIST, "C++", /^gcc-\d/), "gcc-13.2.0");
  assert.equal(pickCompiler(LIST, "C", /^gcc-\d/), "gcc-13.2.0-c", "C не змішується з C++ і без head");
  assert.equal(pickCompiler(LIST, "PHP", /^php-\d/), "php-8.4.1");
  assert.equal(pickCompiler(LIST, "Pascal", /^fpc-/), "fpc-3.2.2");
  assert.equal(pickCompiler(LIST, "TypeScript", /^typescript/), "typescript-5.6.2");
  assert.equal(pickCompiler(LIST, "SQL", /^sqlite/), "sqlite-3.46.0");
  assert.equal(pickCompiler(LIST, "Bash", /^bash/), "bash", "назва мови порівнюється за початком, без урахування регістру");
  assert.equal(pickCompiler(LIST, "Go", /^go/), undefined);
});

await test("запит: компілятор з кешованого списку, код у тілі, список береться один раз", async () => {
  reply = { status: "0", program_output: "Привіт\n", program_error: "" };
  const out = await RUNNERS.python.run("print('Привіт')");
  assert.deepEqual([out.stdout, out.exitCode], ["Привіт\n", 0]);
  await RUNNERS.python.run("print(1)");
  const compile = calls.filter((c) => c.url.endsWith("/compile.json"));
  assert.equal(compile[0].body.compiler, "cpython-3.13.0");
  assert.equal(compile[0].body.code, "print('Привіт')");
  assert.equal(calls.filter((c) => c.url.endsWith("/list.json")).length, 1, "список компіляторів кешується");
});

await test("кожна мова шле запит своєму компілятору", async () => {
  reply = { status: "0", program_output: "" };
  const expected = { python: "cpython-3.13.0", java: "openjdk-jdk-22+36", c: "gcc-13.2.0-c", cpp: "gcc-13.2.0", php: "php-8.4.1", pascal: "fpc-3.2.2", ts: "typescript-5.6.2", sql: "sqlite-3.46.0", bash: "bash" };
  for (const [lang, compiler] of Object.entries(expected)) {
    calls = [];
    await RUNNERS[lang].run("x");
    assert.equal(calls.find((c) => c.url.endsWith("/compile.json")).body.compiler, compiler, lang);
  }
});

await test("помилка компіляції: текст компілятора, prog.* замінено на ім'я файла в редакторі", async () => {
  reply = { status: "1", compiler_error: "prog.cc:3:5: error: 'x' was not declared", program_output: "", program_error: "" };
  const out = await RUNNERS.cpp.run("x");
  assert.match(out.error, /^main\.cpp:3:5: error/);
  reply = { status: "1", compiler_error: "prog.java:2: error: ';' expected", program_output: "" };
  assert.match((await RUNNERS.java.run("x")).error, /^Main\.java:2/);
});

await test("попередження компілятора без помилки не ламають запуск", async () => {
  reply = { status: "0", compiler_error: "prog.cc:1: warning: unused", program_output: "ok\n" };
  const out = await RUNNERS.cpp.run("x");
  assert.equal(out.error, undefined);
  assert.equal(out.stdout, "ok\n");
});

await test("помилка виконання: stdout, stderr і код завершення, без помилки компіляції", async () => {
  reply = { status: "1", program_output: "до збою\n", program_error: "Traceback...\nValueError: x\n" };
  const out = await RUNNERS.python.run("x");
  assert.equal(out.error, undefined);
  assert.equal(out.exitCode, 1);
  assert.match(out.stderr, /ValueError/);
  assert.equal(out.stdout, "до збою\n");
});

await test("нескінченний цикл: тайм-аут", async () => {
  reply = { status: "1", signal: "Killed", program_output: "" };
  const out = await RUNNERS.php.run("x");
  assert.equal(out.timedOut, true);
  assert.match(out.error, /нескінченний цикл/);
});

await test("сервіс недоступний: RunnerUnavailable (а не збій із порожньою відповіддю)", async () => {
  listOk = false;
  await assert.rejects(() => RUNNERS.pascal.run("x"), RunnerUnavailable);
  resetWandboxCache(); listOk = true;
  globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
  await assert.rejects(() => RUNNERS.java.run("x"), RunnerUnavailable);
});

console.log(`\nУсі перевірки Wandbox пройдено: ${passed}`);
