// Плашка «Цікавий факт» у кабінеті, інтерфейс. Запуск: npm run build && npm i --no-save jsdom && node tests/facts-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { contentReply } from "./content-mock.mjs";
import { FACTS } from "../content/facts.ts";

let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }
const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

async function page(opts = {}) {
  const { me = null, dash = null, hash = "#/dashboard", done = null, onboarding, syncReply = null, saveOk = true, courseHtml = false, completeReply = null, seen = null } = opts;
  const calls = [];
  const dom = new JSDOM(html, { url: "https://iteris-code.pages.dev/" + hash, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true;
  w.scrollTo = () => {};
  if (done) w.localStorage.setItem("ic-done", JSON.stringify(done));
  if (seen) w.localStorage.setItem("ic-fact-seen", JSON.stringify(seen));
  const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });
  w.fetch = async (url, o = {}) => {
    calls.push({ method: o.method || "GET", url, body: o.body ? JSON.parse(o.body) : null });
    if (url === "/api/me") return reply(200, { user: me });
    const cr = contentReply(url, me);
    if (cr) return reply(cr[0], cr[1]);
    if (url === "/api/dashboard") return dash ? reply(200, dash) : reply(500, {});
    if (url === "/api/auth/config") return reply(200, { clientId: "cid", turnstileSiteKey: null, mail: false });
    if (url === "/api/onboarding" && !o.method) return reply(200, { onboarding: onboarding ?? null });
    if (url === "/api/onboarding") return saveOk ? reply(200, { ok: true }) : reply(500, {});
    if (url === "/api/xp/sync") return syncReply ? reply(200, syncReply) : reply(200, { xp: 10, gained: [], level: 1, prevLevel: 1, leveledUp: false });
    if (url === "/api/progress/complete") return completeReply ? reply(200, completeReply) : reply(500, {});
    if (url === "/api/progress" && !o.method) return reply(200, { lessonIds: [] });
    if (url === "/api/progress") return reply(200, { ok: true, streak: 2 });
    return reply(404, {});
  };
  try { Object.defineProperty(w, "crypto", { value: globalThis.crypto, configurable: true }); } catch {}
  w.eval(bundle);
  await sleep(90);
  const $ = (s) => w.document.querySelector(s), $$ = (s) => Array.from(w.document.querySelectorAll(s));
  return { w, calls, $, $$, html: () => w.document.getElementById("app").innerHTML };
}



let ok = 0;
const t = (name, cond) => { if (!cond) { console.log("FAIL -", name); process.exitCode = 1; } else { ok++; console.log("ok  -", name); } };
const user = { id: "g1", email: "o@x.ua", name: "Олена", avatarUrl: null, isPro: false, proUntil: null, streak: 3 };
const inH = (h) => new Date(Date.now() + h * 3600_000).toISOString();
const fact = (o = {}) => ({ id: "200", lang: "python", kind: "fact", text: "Рядок можна помножити на число: `'ha' * 3` дає `'hahaha'`.", nextAt: inH(3.5), ...o });
const base = { user, completedLessons: [], lastLesson: null, passedTasks: [], tasksPassed: 0, recentSubmissions: [], activity: {}, xp: 10 };
const dash = (f, extra = {}) => page({ me: user, dash: { ...base, fact: f }, hash: "#/dashboard", ...extra });

const a = await dash(fact());
await sleep(120);
t("кабінет: плашка «Цікавий факт» є, з назвою напрямку й текстом факту", !!a.$(".fact-card") && a.$(".fact-kind").textContent === "Цікавий факт" && a.$(".fact-lang").textContent === "Python" && a.$(".fact-text").textContent.includes("помножити на число"));
t("кабінет: текст у зворотних лапках показано як код, без самих лапок", a.$(".fact-text code")?.textContent === "'ha' * 3" && !a.$(".fact-text").textContent.includes("`"));
t("кабінет: показано, за скільки з'явиться наступний факт", /Наступний за 3 год 30 хв|Наступний за 3 год 29 хв/.test(a.$(".fact-foot").textContent));
t("кабінет: плашка стоїть одразу під вітанням, перед сіткою карток", a.$(".dash-hero").nextElementSibling === a.$(".fact-card") && a.$(".fact-card").nextElementSibling.classList.contains("dash-grid"));
t("кабінет: колір плашки береться від курсу", a.$(".fact-card").getAttribute("style").includes("--fc:"));

a.$("[data-fact-ok]").click();
t("«Зрозуміло» прибирає плашку й запам'ятовує, який саме факт прочитано", !a.$(".fact-card") && JSON.parse(a.w.localStorage.getItem("ic-fact-seen")) === "200");
a.w.dispatchEvent(new a.w.Event("hashchange"));
await sleep(60);
t("після перемальовування прочитаний факт не повертається", !a.$(".fact-card"));

const seen = await dash(fact(), { seen: "200" });
await sleep(120);
t("прочитаний факт не показується й після перезавантаження сторінки", !seen.$(".fact-card"));
const next = await dash(fact({ id: "201", text: "Інший факт з нового вікна" }), { seen: "200" });
await sleep(120);
t("через п'ять годин (новий id вікна) плашка з'являється знову, навіть якщо попередню прочитано", !!next.$(".fact-card") && next.$(".fact-text").textContent === "Інший факт з нового вікна");

const tip = await dash(fact({ id: "300", kind: "tip", lang: "git", text: "Комітьте часто й невеликими порціями." }));
await sleep(120);
t("підказка має назву «Корисна порада» й напрям Git", tip.$(".fact-kind").textContent === "Корисна порада" && tip.$(".fact-lang").textContent === "Git");
const gen = await dash(fact({ id: "400", lang: "general", text: "Загальний факт." }));
await sleep(120);
t("загальний факт (курс не обрано) підписано «Програмування»", gen.$(".fact-lang").textContent === "Програмування");
const none = await dash(null);
await sleep(120);
t("без факту в відповіді сервера плашки немає, кабінет працює", !none.$(".fact-card") && !!none.$(".dash-hero"));
const xss = await dash(fact({ id: "500", text: "<img src=x onerror=alert(1)> та `<b>код</b>`" }));
await sleep(120);
t("текст факту екранується: розмітка з відповіді не виконується", !xss.$(".fact-card img") && !xss.$(".fact-card b") && xss.$(".fact-text").textContent.includes("<img src=x"));
const soon = await dash(fact({ id: "600", nextAt: new Date(Date.now() + 25 * 60000).toISOString() }));
await sleep(120);
t("за менше години показано хвилини", /Наступний за (2[45]) хв/.test(soon.$(".fact-foot").textContent));
const guest = await page({ me: null, hash: "#/" });
t("на публічних сторінках плашки немає", !guest.$(".fact-card"));

const bundle2 = readFileSync(new URL("../dist/" + readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f)), import.meta.url), "utf8");
const sample = [FACTS.python.f[4], FACTS.go.f[5], FACTS.general.t[0]];
t("факти не потрапляють у публічну збірку (закритий контент)", sample.every((x) => !bundle2.includes(x.slice(0, 40))) && !bundle2.includes("Дзен Python"));

console.log(`\nПройдено перевірок плашки фактів (інтерфейс): ${ok}`);
