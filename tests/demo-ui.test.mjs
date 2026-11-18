// Демо-завдання на лендингу, інтерфейс. Запуск: npm run build && npm i --no-save jsdom && node tests/demo-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { runSuite } from "../src/runner/core.ts";
import { DEMO_CSS, DEMO_HINTS, DEMO_HTML, DEMO_JS, DEMO_PY } from "../src/demo.ts";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }
const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, (m) => (m.includes("__IC_WORKER__") ? "" : m));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page({ delay = 0 } = {}) {
  const calls = [];
  const dom = new JSDOM(html, { url: "https://iteris-code.pages.dev/", runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true; w.scrollTo = () => {};
  const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });
  w.fetch = async (u, o = {}) => { calls.push({ method: o.method || "GET", url: u }); if (u === "/api/demo-run") { const code = JSON.parse(o.body).code; const ok = code.includes("3 * 4") && code.includes("Привіт"); return reply(200, { passed: ok, results: [{ name: "Виводить слово «Привіт»", passed: code.includes("Привіт") }, { name: "Виводить число 12", passed: code.includes("3 * 4") }, { name: "Два рядки: Привіт і 12", passed: ok, error: ok ? undefined : "Додайте обидва print" }], stdout: "", stderr: "" }); } if (u === "/api/me") return reply(200, { user: null }); if (u === "/api/auth/config") return reply(200, { clientId: null, turnstileSiteKey: null, mail: false }); return reply(404, {}); };
  w.Worker = class {   // у jsdom воркера немає: підміняємо тим самим ядром тестів
    postMessage(m) {
      runSuite(m.code, m.tests, () => {}).then(async (r) => { if (delay) await sleep(delay); this.onmessage({ data: { nonce: m.nonce, type: "done", ...r } }); });
    }
    terminate() {}
  };
  try { Object.defineProperty(w, "crypto", { value: globalThis.crypto, configurable: true }); } catch {}
  w.eval(bundle);
  await sleep(120);
  const $ = (s) => w.document.querySelector(s), $$ = (s) => Array.from(w.document.querySelectorAll(s));
  const type = (v) => { $("#dm-code").value = v; $("#dm-code").dispatchEvent(new w.Event("input", { bubbles: true })); };
  const run = async () => { $("#dm-run").click(); await sleep(60 + delay); };
  return { w, calls, $, $$, type, run };
}
let ok = 0;
const t = (name, cond) => { if (!cond) { console.log("FAIL -", name); process.exitCode = 1; } else { ok++; console.log("ok  -", name); } };
const GOOD_JS = "function double(n) { return n * 2; }";
const GOOD_HTML = DEMO_HTML.starter.replace("<!-- додайте заголовок h1 з текстом Привіт і кнопку button -->", "<h1>Привіт</h1><button>Ok</button>");

const p = await page();
t("лендинг: секція «Спробуй одразу, без входу» з вкладками JavaScript, HTML, CSS і Python", p.$("#try h2").textContent.includes("без входу") && p.$$("#try [role=tab]").length === 4 && p.$("#dm-tab-js").getAttribute("aria-selected") === "true");
t("JS за замовчуванням: завдання, заготовка в редакторі, перегляду й результатів немає", p.$("#dm-title").textContent === "Подвоїти число" && p.$("#dm-code").value.includes("function double(n)") && p.$("#dm-preview-wrap").hidden && p.$$("#dm-results li").length === 0 && p.$("#dm-win").hidden);

await p.run();
const sum = p.$(".dm-sum");
t("перевірка заготовки: «Виконано 0 з 3», три ✗ з підказками, перемоги немає", sum.textContent.includes("Виконано 0 з 3") && p.$$(".dm-res.no").length === 3 && p.$$(".dm-res.ok").length === 0 && p.$("#dm-win").hidden && !p.$("#try").classList.contains("done"));
t("після перевірки кнопка знову активна, без aria-busy і спінера", !p.$("#dm-run").disabled && !p.$("#dm-run").hasAttribute("aria-busy") && !p.$("#dm-run").classList.contains("is-loading"));

p.type("function double(n) { return n * 3; }");
await p.run();
t("помилкове рішення: частково пройдено, перемоги немає", p.$(".dm-sum").textContent.includes("Виконано 1 з 3") && p.$("#dm-win").hidden);

p.type(GOOD_JS);
await p.run();
t("правильне рішення: «Виконано 3 з 3», усі ✓, показано перемогу з кнопками реєстрації й курсів", p.$(".dm-sum").textContent.includes("3 з 3") && p.$$(".dm-res.ok").length === 3 && !p.$("#dm-win").hidden && !!p.$('#dm-win a[href="/register"]') && !!p.$('#dm-win a[href="/courses"]') && p.$("#try").classList.contains("done"));
t("перемога: фокус на заголовку для екранних читачів, смуга 100%", p.w.document.activeElement === p.$("#dm-win-h") && p.$(".dm-bar i").getAttribute("style").includes("100%"));
t("демо працює без входу й без мережі: запитів до /api/run чи /api/progress немає", !p.calls.some((c) => /^\/api\/(run|progress|xp|dashboard)/.test(c.url)));

p.$("#dm-tab-html").click();
t("перемикання на HTML: вкладка, tabindex, заголовок, заготовка, перегляд видно, результати й перемога прибрано", p.$("#dm-tab-html").getAttribute("aria-selected") === "true" && p.$("#dm-tab-js").getAttribute("aria-selected") === "false" && p.$("#dm-tab-html").tabIndex === 0 && p.$("#dm-tab-js").tabIndex === -1
  && p.$("#dm-title").textContent === "Заголовок і кнопка" && p.$("#dm-code").value.includes("<!doctype html>") && !p.$("#dm-preview-wrap").hidden && p.$$("#dm-results li").length === 0 && p.$("#dm-win").hidden && p.$("#dm-panel").getAttribute("aria-labelledby") === "dm-tab-html");
t("перегляд ізольований: sandbox без скриптів", p.$("#dm-preview").getAttribute("sandbox") === "allow-same-origin");
await p.run();
t("HTML заготовка: «Виконано 0 з 3» з підказками", p.$(".dm-sum").textContent.includes("0 з 3") && p.$$(".dm-res.no small").length === 3);
p.type("<h1>Пока</h1><button>x</button>");
t("живий перегляд: текст з редактора одразу в iframe", p.$("#dm-preview").contentDocument.querySelector("h1")?.textContent === "Пока");
await p.run();
t("частково: заголовок є, але без «Привіт»: 2 з 3", p.$(".dm-sum").textContent.includes("2 з 3") && p.$("#dm-win").hidden);
p.type(GOOD_HTML);
await p.run();
t("HTML правильно: 3 з 3 і перемога", p.$(".dm-sum").textContent.includes("3 з 3") && !p.$("#dm-win").hidden);

p.$("#dm-tab-js").click();
t("чернетка JS збережена при поверненні на вкладку, результати свіжі", p.$("#dm-code").value === GOOD_JS && p.$$("#dm-results li").length === 0 && p.$("#dm-win").hidden && p.$("#dm-preview-wrap").hidden);
p.$("#dm-reset").click();
t("«Почати спочатку»: заготовка повернулась, результатів немає", p.$("#dm-code").value === DEMO_JS.starter && p.$$("#dm-results li").length === 0);
p.$("#dm-tab-html").click();
t("«Почати спочатку» чіпає лише поточну мову: HTML-чернетка не скинута", p.$("#dm-code").value === GOOD_HTML);
p.$("#dm-reset").click();
t("скидання HTML повертає заготовку й перегляд", p.$("#dm-code").value === DEMO_HTML.starter && p.$("#dm-preview").contentDocument.querySelector("h1") === null);

const k = await page();
k.type(GOOD_JS);
k.$("#dm-code").dispatchEvent(new k.w.KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true }));
await sleep(100);
t("Ctrl+Enter у редакторі запускає перевірку", k.$(".dm-sum")?.textContent.includes("3 з 3"));
k.$("#dm-tab-js").dispatchEvent(new k.w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
t("стрілка вправо переходить на наступну вкладку (ARIA tabs)", k.$("#dm-tab-html").getAttribute("aria-selected") === "true" && k.w.document.activeElement === k.$("#dm-tab-html"));
k.$("#dm-tab-html").dispatchEvent(new k.w.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
t("стрілка вліво повертає назад", k.$("#dm-tab-js").getAttribute("aria-selected") === "true");

/* ---- CSS і підказки ---- */
const GOOD_CSS = "h1 { color: #2563eb; text-align: center; }\nbutton { background-color: #16a34a; }";
const c = await page();
c.$("#dm-tab-css").click();
t("CSS: вкладка, заголовок, заготовка стилів, перегляд видно", c.$("#dm-tab-css").getAttribute("aria-selected") === "true" && c.$("#dm-title").textContent === DEMO_CSS.title && c.$("#dm-code").value === DEMO_CSS.starter && !c.$("#dm-preview-wrap").hidden && c.$("#dm-preview").contentDocument.querySelector("h1")?.textContent === "Привіт");
await c.run();
t("CSS заготовка: «Виконано 0 з 3» з підказками", c.$(".dm-sum").textContent.includes("0 з 3") && c.$$(".dm-res.no small").length === 3);
c.type(GOOD_CSS);
await c.run();
t("CSS правильно: 3 з 3 і перемога", c.$(".dm-sum").textContent.includes("3 з 3") && !c.$("#dm-win").hidden);
c.$("#dm-tab-python").click();
t("Python: вкладка, заготовка, без перегляду, видно примітку про зовнішній сервер", c.$("#dm-title").textContent === DEMO_PY.title && c.$("#dm-code").value === DEMO_PY.starter && c.$("#dm-preview-wrap").hidden && !c.$("#dm-note").hidden);
await c.run();
t("Python заготовка: запит на /api/demo-run, 1 з 3 і без перемоги", c.calls.some((x) => x.url === "/api/demo-run" && x.method === "POST") && c.$(".dm-sum").textContent.includes("0 з 3") && c.$("#dm-win").hidden);
c.type('print("Привіт")\nprint(3 * 4)');
await c.run();
t("Python правильно: 3 з 3 і перемога", c.$(".dm-sum").textContent.includes("3 з 3") && !c.$("#dm-win").hidden);
c.$("#dm-tab-js").click();
t("примітка про сервер лише на вкладці Python", c.$("#dm-note").hidden);
c.$("#dm-tab-python").dispatchEvent(new c.w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
t("стрілка вправо з останньої вкладки переходить на першу", c.$("#dm-tab-js").getAttribute("aria-selected") === "true");
const h = await page();
t("підказки: спочатку не показані, кнопка «Підказка»", h.$$(".dm-tip").length === 0 && h.$("#dm-tip").textContent === "Підказка" && !h.$("#dm-tip").disabled);
h.$("#dm-tip").click();
t("перша підказка з'являється, кнопка пропонує наступну", h.$$(".dm-tip").length === 1 && h.$("#dm-tip").textContent.includes("1/3"));
h.$("#dm-tip").click(); h.$("#dm-tip").click();
t("усі 3 підказки показані, кнопка вимикається", h.$$(".dm-tip").length === 3 && h.$("#dm-tip").disabled && h.$(".dm-tips").textContent.includes("return n * 2"));
h.$("#dm-tab-html").click();
t("в іншої мови свої підказки, лічильник окремий", h.$$(".dm-tip").length === 0 && !h.$("#dm-tip").disabled);
h.$("#dm-tab-js").click();
t("повернення на мову зберігає показані підказки", h.$$(".dm-tip").length === 3);
h.$("#dm-reset").click();
t("«Почати спочатку» ховає підказки цієї мови", h.$$(".dm-tip").length === 0 && h.$("#dm-tip").textContent === "Підказка");
t("тексти підказок з констант (HTML-теги коду екрановані)", DEMO_HINTS.html[2].includes("&lt;h1&gt;"));

const s = await page();
s.type("function double(n) {");
await s.run();
t("синтаксична помилка: пояснення «Не вдалося перевірити», без падіння й без перемоги", s.$(".dm-res.no b").textContent.includes("Не вдалося перевірити") && s.$("#dm-win").hidden && !s.$("#dm-run").disabled);
s.type('throw new Error("<img src=x onerror=alert(1)>");');
await s.run();
t("повідомлення про помилку екрануються (жодного тегу img у результатах)", s.$$("#dm-results img").length === 0 && s.$("#dm-results").textContent.includes("<img"));

const d = await page({ delay: 150 });
d.type(GOOD_JS);
d.$("#dm-run").click();
await sleep(20);
t("під час перевірки кнопка блокується, є спінер і aria-busy", d.$("#dm-run").disabled && d.$("#dm-run").classList.contains("is-loading") && d.$("#dm-run").getAttribute("aria-busy") === "true");
d.$("#dm-tab-html").click();
await sleep(300);
t("запізнілий результат попередньої мови після перемикання ігнорується", d.$$("#dm-results li").length === 0 && d.$("#dm-win").hidden && !d.$("#dm-run").disabled);

const nav = await page();
nav.w.history.pushState({}, "", "/courses"); nav.w.dispatchEvent(new nav.w.PopStateEvent("popstate"));
await sleep(80);
nav.w.history.pushState({}, "", "/"); nav.w.dispatchEvent(new nav.w.PopStateEvent("popstate"));
await sleep(120);
nav.type(GOOD_JS);
await nav.run();
t("після переходу на інші сторінки й назад демо знову працює", nav.$(".dm-sum")?.textContent.includes("3 з 3"));

console.log(`\nПройдено перевірок демо (інтерфейс): ${ok}`);
