// Завдання HTML/CSS: структура + перевірка еталонів і заготовок у jsdom (той самий evalPageChecks, що працює в браузері).
// Запуск: npm i --no-save jsdom && node tests/page-tasks.test.mjs
// Обмеження: jsdom не робить верстку, тому перевірки за розмірами й позиціями тут неможливі; для таких властивостей
// завдання використовують перевірки коду (source). Кольори в перевірках пишемо в hex.
import assert from "node:assert/strict";
import { LESSONS } from "../content/lessons.js";
import { TASKS } from "../content/tasks/index.ts";
import { buildPageDoc, evalPageChecks, normCss } from "../src/runner/page.ts";
import { isPage } from "../src/tasks/types.ts";
import { SOLUTIONS } from "./solutions.mjs";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }

/** Уроки без завдання із причиною (правило D13) */
const NO_TASK = { html: { 1: "інструменти веброзробника: це робота в браузері, а не код" } };

const run = (task, code) => {
  const dom = new JSDOM(buildPageDoc(task, code));
  return evalPageChecks(task.checks, dom.window.document, dom.window, code);
};

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("ok  -", name); };

test("normCss: hex, rgb, прозорість, нуль, жирність", () => {
  assert.equal(normCss("color", "#F00"), "rgb(255, 0, 0)");
  assert.equal(normCss("color", "#ff0000"), "rgb(255, 0, 0)");
  assert.equal(normCss("color", "rgb(255,0,0)"), "rgb(255, 0, 0)");
  assert.equal(normCss("color", "rgba(255, 0, 0, 1)"), "rgb(255, 0, 0)");
  assert.equal(normCss("background-color", "transparent"), "rgba(0, 0, 0, 0)");
  assert.equal(normCss("margin-top", "0"), "0px");
  assert.equal(normCss("font-weight", "bold"), "700");
});

test("evalPageChecks: селектор, count, text, attr, style, source, not", () => {
  const html = '<!doctype html><html><head><style>h1{color:#ff0000}</style></head><body><h1 id="t">Привіт  світе</h1><a href="/a">A</a><a>B</a></body></html>';
  const dom = new JSDOM(html);
  const r = (c) => evalPageChecks([c], dom.window.document, dom.window, html)[0];
  assert.equal(r({ name: "є h1", selector: "h1" }).passed, true);
  assert.equal(r({ name: "немає h2", selector: "h2" }).passed, false);
  assert.match(r({ name: "немає h2", selector: "h2" }).error, /не знайдено/);
  assert.equal(r({ name: "рівно два a", selector: "a", count: 2 }).passed, true);
  assert.equal(r({ name: "a з href", selector: "a", attr: { name: "href" }, count: 1 }).passed, true);
  assert.equal(r({ name: "текст (пробіли нормалізуються)", selector: "h1", text: "Привіт світе" }).passed, true);
  assert.equal(r({ name: "колір", selector: "h1", style: { color: "#f00" } }).passed, true);
  const bad = r({ name: "інший колір", selector: "h1", style: { color: "#00f" } });
  assert.equal(bad.passed, false);
  assert.match(bad.error, /color: потрібно #00f/);
  assert.equal(r({ name: "not", selector: "h2", not: true }).passed, true);
  assert.equal(r({ name: "source", source: { matches: "<h1[^>]*>" } }).passed, true);
  assert.equal(r({ name: "source немає", source: { has: "<canvas" } }).passed, false);
  assert.equal(r({ name: "поганий селектор", selector: "[[" }).passed, false);
});

const tasks = TASKS.filter(isPage);
for (const course of ["html", "css"]) {
  const list = tasks.filter((t) => t.course === course);
  test(`${course}: одне завдання на кожен урок (крім винятків), структура`, () => {
    const skip = NO_TASK[course] ?? {};
    const expected = LESSONS[course].map((_, i) => i + 1).filter((n) => !skip[n]).map((n) => `${course}/${n}`);
    assert.deepEqual(list.map((t) => t.lesson), expected);
    for (const t of list) {
      assert.equal(t.edit, course, `${t.id}: edit`);
      assert.equal(t.file, course === "html" ? "index.html" : "style.css");
      assert.equal(t.editorLang, course);
      assert.ok(SOLUTIONS[t.id], `немає еталона для ${t.id}`);
      assert.ok(t.checks.length >= 3, `${t.id}: потрібно мінімум 3 перевірки`);
      assert.ok(t.xp > 0 && t.brief.length && t.context && t.title && t.starter.trim() && !t.premium);
      if (course === "css") assert.ok(t.markup && t.markup.includes("<"), `${t.id}: потрібна розмітка`);
    }
  });
  for (const t of list) {
    test(`${t.id}: заготовка не проходить, еталон проходить усі перевірки`, () => {
      assert.ok(run(t, t.starter).some((r) => !r.passed), "заготовка не повинна проходити всі перевірки");
      const res = run(t, SOLUTIONS[t.id]);
      assert.ok(res.every((r) => r.passed), "еталон має проходити все:\n" + res.map((r) => `${r.passed ? "+" : "-"} ${r.name} ${r.error ?? ""}`).join("\n"));
    });
  }
}
console.log(`\nУсі перевірки сторінок пройдено: ${passed}`);
