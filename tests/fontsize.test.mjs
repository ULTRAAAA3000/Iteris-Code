// Розмір тексту уроку: кроки A− / A+, збереження, межі. Запуск: node tests/fontsize.test.mjs
import assert from "node:assert/strict";

const mem = new Map(), style = new Map(), btns = [{ dataset: { fs: "-1" }, disabled: false }, { dataset: { fs: "1" }, disabled: false }];
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
globalThis.document = { documentElement: { style: { setProperty: (k, v) => style.set(k, v) } }, querySelectorAll: () => btns };
const F = await import("../src/fontsize.ts");

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("ok  -", name); };

test("за замовчуванням звичайний розмір, обидві кнопки активні", () => {
  F.applyFontStep();
  assert.equal(style.get("--l-fs"), "1");
  assert.deepEqual(btns.map((b) => b.disabled), [false, false]);
});
test("A+ збільшує, A− зменшує, вибір зберігається", () => {
  F.stepFont(1); assert.equal(style.get("--l-fs"), "1.12");
  F.stepFont(-1); F.stepFont(-1); assert.equal(style.get("--l-fs"), "0.9");
  assert.equal(JSON.parse(mem.get("ic-fs")), 0);
});
test("на краях кнопка вимикається, далі розмір не росте й не падає", () => {
  assert.equal(btns[0].disabled, true);
  F.stepFont(-1); assert.equal(style.get("--l-fs"), "0.9");
  for (let i = 0; i < 10; i++) F.stepFont(1);
  assert.equal(style.get("--l-fs"), "1.25"); assert.equal(btns[1].disabled, true); assert.equal(btns[0].disabled, false);
});
test("зіпсоване значення в сховищі не ламає: береться звичайний розмір", () => {
  mem.set("ic-fs", "99"); assert.equal(F.fontStep(), 1);
  mem.set("ic-fs", "\"abc\""); assert.equal(F.fontStep(), 1);
});
console.log(`\nУсі перевірки пройдено: ${passed}`);
