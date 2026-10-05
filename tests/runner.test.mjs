// Запуск: node tests/runner.test.mjs
import assert from "node:assert/strict";
import { runSuite, deepEqual } from "../src/runner/core.ts";
import { TASKS, taskById, taskForLesson } from "../src/tasks/index.ts";
import { LESSONS } from "../src/data/lessons.js";
import { SOLUTIONS } from "./solutions.mjs";

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };
const summary = (r) => r.results.map((x) => `${x.passed ? "+" : "-"} ${x.name}${x.error ? " (" + x.error + ")" : ""}`).join("\n");

await test("expect: toBe, toEqual, not, toThrow, toContain, toHaveLength", async () => {
  const r = await runSuite("const f = () => { throw new TypeError('x'); };", `
    it("a", () => { expect(1).toBe(1); expect({a:[1]}).toEqual({a:[1]}); expect(1).not.toBe(2); });
    it("b", () => { expect(f).toThrow(TypeError); expect(f).toThrow("x"); expect([1,2]).toContain(2); expect("ab").toHaveLength(2); });
    it("c", () => { expect(1).toBe(2); });
    it("d", () => { expect(() => 1).toThrow(); });
  `);
  assert.deepEqual(r.results.map((x) => x.passed), [true, true, false, false]);
  assert.match(r.results[2].error, /очікувалось 2, отримано 1/);
  assert.match(r.results[3].error, /не кинула/);
});
await test("deepEqual розрізняє масиви, об'єкти та порядок ключів не важливий", () => {
  assert.equal(deepEqual({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 }), true);
  assert.equal(deepEqual([1], { 0: 1 }), false);
  assert.equal(deepEqual({ a: undefined }, {}), false);
});
await test("describe: вкладені назви, async-тести та rejects", async () => {
  const r = await runSuite("", `describe("A", () => { describe("B", () => { it("c", async () => { await expect(Promise.reject(new RangeError("r"))).rejects.toThrow(RangeError); }); }); });`);
  assert.equal(r.results[0].name, "A › B › c");
  assert.equal(r.results[0].passed, true);
});
await test("помилки: синтаксис і виняток верхнього рівня не валять раннер", async () => {
  assert.match((await runSuite("function (", "")).error, /Синтаксична/);
  assert.match((await runSuite("throw new Error('boom')", "")).error, /boom/);
  assert.match((await runSuite("x.y.z", "")).error, /ReferenceError/);
});
await test("console.log користувача потрапляє в лог", async () => {
  const lines = [];
  await runSuite('console.log("привіт", {a: 1});', "", (l) => lines.push(l));
  assert.deepEqual(lines, ['привіт {"a":1}']);
});
await test("тест, що не завершується, отримує тайм-аут", async () => {
  const r = await runSuite("", `it("зависає", () => new Promise(() => {}));`, () => {}, 50);
  assert.equal(r.results[0].passed, false);
  assert.match(r.results[0].error, /не завершився/);
});
await test("кожне завдання прив'язане до наявного уроку, id унікальні", () => {
  assert.equal(new Set(TASKS.map((t) => t.id)).size, TASKS.length);
  for (const t of TASKS) {
    const [course, n] = t.lesson.split("/");
    assert.ok(LESSONS[course]?.[Number(n) - 1], `урок ${t.lesson} не існує`);
    assert.equal(taskForLesson(t.lesson).id, t.id, "на один урок — одне завдання");
    assert.ok(SOLUTIONS[t.id], `немає еталонного рішення для ${t.id}`);
    assert.ok(t.xp > 0 && t.brief.length && t.context);
  }
  assert.ok(TASKS.some((t) => !t.premium) && TASKS.some((t) => t.premium), "потрібні і безкоштовні, і Pro-завдання");
});
for (const t of TASKS) {
  await test(`завдання ${t.id}: заготовка не проходить, еталон проходить`, async () => {
    const starter = await runSuite(t.starter, t.tests);
    assert.ok(!starter.error, "тести мають запускатись із заготовкою: " + starter.error);
    assert.ok(starter.results.some((r) => !r.passed), "заготовка не повинна проходити всі тести");
    const solved = await runSuite(SOLUTIONS[t.id], t.tests);
    assert.ok(!solved.error, solved.error);
    assert.ok(solved.results.length >= 4, "потрібно мінімум 4 тести");
    assert.ok(solved.results.every((r) => r.passed), "еталон має проходити все:\n" + summary(solved));
  });
}
await test("великий вивід у консоль не ламає раннер", async () => {
  const r = await runSuite("for (let i = 0; i < 500; i++) console.log(i);", "");
  assert.equal(r.results.length, 0);
});
console.log(`\nУсі перевірки пройдено: ${passed}`);
