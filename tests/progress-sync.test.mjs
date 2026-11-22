// Урок і завдання не розходяться: розв'язане завдання робить свій урок пройденим (на шляху, в кабінеті й між пристроями).
// Запуск: node tests/progress-sync.test.mjs
import assert from "node:assert/strict";

const mem = new Map();
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
const P = await import("../src/progress.ts");

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("ok  -", name); };
const tasks = [{ id: "go-hello", lesson: "go/2" }, { id: "go-pkg", lesson: "go/3" }, { id: "go-tools", lesson: "go/4" }, { id: "py-print", lesson: "python/2" }];
const valid = (k, n) => (k === "go" || k === "python") && n >= 1 && n <= 110;

test("розв'язане завдання без відмітки уроку: урок потрапляє в список «має бути пройденим»", () => {
  P.toggle("go", 2);                                   // урок 2 відмічено вручну, його завдання теж розв'язане
  P.markTaskPassed("go-hello"); P.markTaskPassed("go-pkg"); P.markTaskPassed("go-tools");
  assert.deepEqual(P.lessonsOfPassedTasks(tasks, P.isTaskPassed, valid).sort(), ["go/3", "go/4"]);   // як на знімку: 3 і 4 розв'язані, але не пройдені
});

test("нерозв'язані завдання й уроки поза курсом не додаються", () => {
  assert.ok(!P.lessonsOfPassedTasks(tasks, P.isTaskPassed, valid).includes("python/2"));
  assert.deepEqual(P.lessonsOfPassedTasks([{ id: "go-pkg", lesson: "go/999" }, { id: "go-pkg", lesson: "rust/3" }], P.isTaskPassed, valid), []);
});

test("completeLessonOf відмічає урок один раз, зберігає й повідомляє сервер лише при зміні", () => {
  const calls = [];
  P.hooks.onToggle = (k, n, d) => calls.push([k, n, d]);
  assert.equal(P.completeLessonOf("go/3"), true);
  assert.equal(P.completeLessonOf("go/3"), false);     // повторно нічого не змінює
  assert.equal(P.completeLessonOf("go/2"), false);     // вже відмічено вручну
  assert.deepEqual(calls, [["go", 3, true]]);
  assert.deepEqual(JSON.parse(mem.get("ic-done")).go, [2, 3]);
  assert.deepEqual(P.lessonsOfPassedTasks(tasks, P.isTaskPassed, valid), ["go/4"]);
});

test("неправильний id уроку не ламає прогрес", () => {
  assert.equal(P.completeLessonOf(""), false);
  assert.equal(P.completeLessonOf("go/abc"), false);
  assert.equal(P.completeLessonOf("go/0"), false);
});

console.log(`\nУсі перевірки пройдено: ${passed}`);
