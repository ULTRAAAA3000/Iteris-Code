// Демо-завдання лендингу (А3): еталони проходять, заготовки й типові помилки ні, і воно відділене від курсів. Запуск: node tests/demo.test.mjs
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

import { DEMO_CSS, DEMO_HINTS, DEMO_HTML, DEMO_JS, DEMO_LANGS, demoHtml, demoTask } from "../src/demo.ts";
import { runSuite } from "../src/runner/core.ts";
import { buildPageDoc, evalPageChecks } from "../src/runner/page.ts";
import { TASKS, taskById } from "../content/tasks/index.ts";
import { PROJECTS } from "../content/projects/index.ts";
import { homeHtml } from "../src/pages.ts";

let passed = 0;
const test = async (name, fn) => { await fn(); passed++; console.log("ok  -", name); };
const js = async (code) => runSuite(code, DEMO_JS.tests);
const page = (code) => {
  const dom = new JSDOM(buildPageDoc(DEMO_HTML, code));
  return evalPageChecks(DEMO_HTML.checks, dom.window.document, dom.window, code);
};
const allPass = (r) => r.length > 0 && r.every((x) => x.passed);

await test("JS: еталон проходить усі тести", async () => {
  const r = await js("function double(n) { return n * 2; }");
  assert.equal(r.error, undefined); assert.equal(r.results.length, 3); assert.ok(allPass(r.results));
  assert.ok(allPass((await js("const double = (n) => n + n;")).results));
});

await test("JS: заготовка й типові помилки не проходять", async () => {
  for (const wrong of [DEMO_JS.starter, "function double(n) { return n * 3; }", "function double(n) { return n + 2; }", "function double(n) { return Math.abs(n) * 2; }", "function double(n) { return 8; }"]) {
    const r = await js(wrong);
    assert.ok(!allPass(r.results) || r.error, wrong);
  }
  const syntax = await js("function double(n) {");
  assert.ok(syntax.error);                                            // синтаксична помилка дає зрозумілу помилку, а не падіння
});

await test("HTML: еталон проходить, заготовка й типові помилки ні", () => {
  const good = DEMO_HTML.starter.replace("<!-- додайте заголовок h1 з текстом Привіт і кнопку button -->", "<h1>Привіт</h1>\n  <button>Натисни</button>");
  assert.ok(allPass(page(good)));
  assert.ok(allPass(page('<h1 class="x">Привіт, світе</h1><button type="button">Ok</button>')));   // текст містить слово, атрибути не заважають
  const r = page(DEMO_HTML.starter);
  assert.deepEqual(r.map((x) => x.passed), [false, false, false]);
  assert.deepEqual(page("<h1>Пока</h1><button>x</button>").map((x) => x.passed), [true, false, true]);
  assert.deepEqual(page("<h1>Привіт</h1>").map((x) => x.passed), [true, true, false]);
  assert.deepEqual(page("<h2>Привіт</h2><button>x</button>").map((x) => x.passed), [false, false, true]);
  for (const x of page(DEMO_HTML.starter)) assert.ok(x.error && x.error.length > 5);                   // у кожної невдалої перевірки є підказка
});

const cssPage = (code) => {
  const dom = new JSDOM(buildPageDoc(DEMO_CSS, code));
  return evalPageChecks(DEMO_CSS.checks, dom.window.document, dom.window, code);
};
await test("CSS: еталон проходить, заготовка й часткові рішення ні", () => {
  assert.ok(allPass(cssPage("h1 { color: #2563eb; text-align: center; }\nbutton { background-color: #16a34a; }")));
  assert.deepEqual(cssPage(DEMO_CSS.starter).map((x) => x.passed), [false, false, false]);
  assert.deepEqual(cssPage("h1 { color: #2563eb; }").map((x) => x.passed), [true, false, false]);
  assert.deepEqual(cssPage("h1 { color: red; text-align: center; } button { background-color: #16a34a; }").map((x) => x.passed), [false, true, true]);
  for (const x of cssPage(DEMO_CSS.starter)) assert.ok(x.error && x.error.length > 5);
});

await test("підказки: для кожної мови 3 підказки, від м'якої до відповіді, без службових слів", () => {
  for (const l of DEMO_LANGS) {
    assert.equal(DEMO_HINTS[l].length, 3, l);
    for (const h of DEMO_HINTS[l]) assert.ok(h.length > 20 && h.length < 220, h);
  }
  assert.ok(DEMO_HINTS.js[2].includes("return n * 2"));
});

await test("демо відокремлене від курсів (D17): його немає серед завдань і проєктів, XP не дає", () => {
  for (const t of [DEMO_JS, DEMO_HTML, DEMO_CSS]) {
    assert.equal(taskById(t.id), undefined, t.id);
    assert.ok(!TASKS.some((x) => x.id === t.id || x.title === t.title), t.title);
    assert.ok(!PROJECTS.some((p) => p.id === t.id));
    assert.equal(t.xp, 0); assert.equal(t.premium, false); assert.equal(t.lesson, "demo");
  }
  assert.ok(!TASKS.some((x) => x.starter === DEMO_JS.starter || x.tests === DEMO_JS.tests));
});

await test("розмітка секції: вкладки за шаблоном ARIA, перша мова вибрана, текст завдання й заготовка вже в HTML", () => {
  const h = demoHtml();
  assert.deepEqual(DEMO_LANGS, ["js", "html", "css"]);
  assert.ok(h.includes('id="dm-tab-css"') && h.includes('id="dm-tip"') && h.includes('id="dm-tips"'));
  assert.ok(h.includes('role="tablist"') && h.includes('id="dm-tab-js"') && h.includes('id="dm-tab-html"'));
  assert.ok(h.includes('data-dm="js" aria-selected="true" aria-controls="dm-panel" tabindex="0"'));
  assert.ok(h.includes('data-dm="html" aria-selected="false" aria-controls="dm-panel" tabindex="-1"'));
  assert.ok(h.includes('role="tabpanel"') && h.includes('aria-labelledby="dm-tab-js"'));
  assert.ok(h.includes("Подвоїти число") && h.includes("function double(n)"));
  assert.ok(h.includes('sandbox="allow-same-origin"'));                 // перегляд без скриптів
  assert.ok(h.includes('href="/register"') && h.includes('href="/courses"'));
  assert.equal((h.match(/<h2/g) || []).length, 1); assert.equal((h.match(/<h1/g) || []).length, 0);
  assert.ok(homeHtml(false).includes('id="try"') && homeHtml(true).includes('id="try"'));
  assert.deepEqual([demoTask("js"), demoTask("html"), demoTask("css")], [DEMO_JS, DEMO_HTML, DEMO_CSS]);
});

await test("текст в textarea екранується (заготовка HTML не ламає розмітку)", () => {
  const dom = new JSDOM(demoHtml());
  assert.equal(dom.window.document.getElementById("dm-code").value.trim(), DEMO_JS.starter.trim());
  const html = new JSDOM(`<textarea id="t">${DEMO_HTML.starter.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</textarea>`);
  assert.equal(html.window.document.getElementById("t").value.trim(), DEMO_HTML.starter.trim());
});

console.log(`\nУсі тести демо-завдання пройдено: ${passed}`);
