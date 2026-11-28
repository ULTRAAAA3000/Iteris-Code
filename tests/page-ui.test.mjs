// Екран практичного завдання HTML/CSS в інтерфейсі (jsdom): редактор, попередній перегляд у iframe, перевірка в браузері, перемога.
// Запуск: npm run build && npm i --no-save jsdom && node tests/page-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { contentReply } from "./content-mock.mjs";
import { SOLUTIONS } from "./solutions.mjs";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }

const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, (m) => (m.includes("__IC_WORKER__") ? "" : m));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const user = { id: "g1", email: "o@x.ua", name: "Олена", avatarUrl: null, isPro: false, proUntil: null, streak: 1 };

async function page({ me = user, hash = "#/lesson/html/2" } = {}) {
  const calls = [];
  const dom = new JSDOM(html, { url: "https://iteris-code.pages.dev/" + hash, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true;
  const reply = (st, body) => ({ ok: st < 400, status: st, json: async () => body });
  w.fetch = async (url, o = {}) => {
    calls.push({ url, body: o.body ? JSON.parse(o.body) : null });
    if (url === "/api/me") return reply(200, { user: me });
    const cr = contentReply(url, me);
    if (cr) return reply(cr[0], cr[1]);
    if (url === "/api/auth/config") return reply(200, { clientId: null, turnstileSiteKey: null, mail: false });
    if (url === "/api/progress/complete") return reply(200, { ok: true, streak: 2, firstSolve: true, xp: 15 });
    if (url === "/api/progress") return reply(200, { lessonIds: [] });
    return reply(404, {});
  };
  try { Object.defineProperty(w, "crypto", { value: globalThis.crypto, configurable: true }); } catch {}
  w.eval(bundle);
  await sleep(80);
  const $ = (s) => w.document.querySelector(s);
  return { w, calls, $, term: () => $("#ws-term").textContent, setCode: (c) => { const ta = $(".ws-plain"); ta.value = c; ta.dispatchEvent(new w.Event("input", { bubbles: true })); }, run: async () => { $("[data-ws=run]").click(); await sleep(150); } };
}

let ok = 0;
const t = (name, cond) => { if (!cond) { console.log("FAIL -", name); process.exitCode = 1; } else { ok++; console.log("ok  -", name); } };

const h = await page();
t("урок HTML: вкладка index.html, кнопка «Перевірити», сторінка під редактором", h.$(".ws-tab")?.textContent === "index.html" && h.$("#ws-run")?.textContent === "▶ Перевірити" && !!h.$("#ws-preview"));
t("попередній перегляд ізольований: sandbox без скриптів", h.$("#ws-preview").getAttribute("sandbox") === "allow-same-origin");
t("у редакторі заготовка, у перегляді її сторінка", h.$(".ws-plain")?.value.includes("<p>Привіт, веб!</p>") && h.$("#ws-preview").contentDocument.body.textContent.includes("Привіт, веб!"));
t("до перевірки пояснення про перегляд і кнопку", h.term().includes("попередній перегляд"));

await h.run();
t("заготовка: перевірки не пройдені, є ✗ і пояснення", h.term().includes("✗") && h.term().includes("не знайдено") && !h.$(".ws-win") && !h.$(".ws-term-ok"));

h.setCode(SOLUTIONS["html-skeleton"]);
await h.run();
t("правильне рішення: усі перевірки ✓", h.term().includes("✓") && !h.term().includes("✗") && /Пройдено (\d+) з \1\b/.test(h.term()));   // кількість перевірок береться із завдання, а не з тексту
t("перемога: вікно, свічення терміналу, конфетті", !!h.$(".ws-win") && !!h.$(".ws-term-ok") && !!h.$(".ws-win .confetti i"));
const done = h.calls.find((c) => c.url === "/api/progress/complete");
t("результат зберігається без proof (перевірка в браузері)", done?.body?.taskId === "html-skeleton" && done.body.passed === true && done.body.proof === undefined);
t("у перегляді намальовано сторінку з рішення", h.$("#ws-preview").contentDocument.title === "Моя перша сторінка");

const c = await page({ hash: "#/lesson/css/10" });
t("урок CSS: вкладка style.css, готова розмітка в перегляді", c.$(".ws-tab")?.textContent === "style.css" && !!c.$("#ws-preview").contentDocument.querySelector("h1"));
c.setCode(SOLUTIONS["css-cascade"]);
await sleep(450);
t("живий перегляд: стилі з редактора застосовуються до сторінки", c.$("#ws-preview").contentDocument.querySelector("h1").ownerDocument.defaultView.getComputedStyle(c.$("#ws-preview").contentDocument.querySelector("h1")).color === "rgb(46, 125, 50)");
await c.run();
t("CSS: рішення проходить усі перевірки", c.term().includes("Пройдено 5 з 5") && !!c.$(".ws-win"));

const reset = await page();
reset.setCode("<p>інше</p>");
reset.$("[data-ws=reset]").click();
await sleep(50);
t("«Скинути» повертає заготовку і в редактор, і в перегляд", reset.$(".ws-plain").value.includes("Привіт, веб!") && reset.$("#ws-preview").contentDocument.body.textContent.includes("Привіт, веб!"));

console.log(`\nПройдено перевірок сторінок (інтерфейс): ${ok}`);
