// Демо-завдання лендингу (А3): еталони проходять, заготовки й типові помилки ні, і воно відділене від курсів. Запуск: node tests/demo.test.mjs
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

import { DEMO_HTML, DEMO_JS, DEMO_LANGS, demoHtml, demoTask } from "../src/demo.ts";
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

await test("демо відокремлене від курсів (D17): його немає серед завдань і проєктів, XP не дає", () => {
  for (const t of [DEMO_JS, DEMO_HTML]) {
    assert.equal(taskById(t.id), undefined, t.id);
    assert.ok(!TASKS.some((x) => x.id === t.id || x.title === t.title), t.title);
    assert.ok(!PROJECTS.some((p) => p.id === t.id));
    assert.equal(t.xp, 0); assert.equal(t.premium, false); assert.equal(t.lesson, "demo");
  }
  assert.ok(!TASKS.some((x) => x.starter === DEMO_JS.starter || x.tests === DEMO_JS.tests));
});

await test("розмітка секції: вкладки за шаблоном ARIA, перша мова вибрана, текст завдання й заготовка вже в HTML", () => {
  const h = demoHtml();
  assert.deepEqual(DEMO_LANGS, ["js", "html"]);
  assert.ok(h.includes('role="tablist"') && h.includes('id="dm-tab-js"') && h.includes('id="dm-tab-html"'));
  assert.ok(h.includes('data-dm="js" aria-selected="true" aria-controls="dm-panel" tabindex="0"'));
  assert.ok(h.includes('data-dm="html" aria-selected="false" aria-controls="dm-panel" tabindex="-1"'));
  assert.ok(h.includes('role="tabpanel"') && h.includes('aria-labelledby="dm-tab-js"'));
  assert.ok(h.includes("Подвоїти число") && h.includes("function double(n)"));
  assert.ok(h.includes('sandbox="allow-same-origin"'));                 // перегляд без скриптів
  assert.ok(h.includes('href="/register"') && h.includes('href="/courses"'));
  assert.equal((h.match(/<h2/g) || []).length, 1); assert.equal((h.match(/<h1/g) || []).length, 0);
  assert.ok(homeHtml(false).includes('id="try"') && homeHtml(true).includes('id="try"'));
  assert.deepEqual([demoTask("js"), demoTask("html")], [DEMO_JS, DEMO_HTML]);
});

await test("текст в textarea екранується (заготовка HTML не ламає розмітку)", () => {
  const dom = new JSDOM(demoHtml());
  assert.equal(dom.window.document.getElementById("dm-code").value.trim(), DEMO_JS.starter.trim());
  const html = new JSDOM(`<textarea id="t">${DEMO_HTML.starter.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</textarea>`);
  assert.equal(html.window.document.getElementById("t").value.trim(), DEMO_HTML.starter.trim());
});

console.log(`\nУсі тести демо-завдання пройдено: ${passed}`);
