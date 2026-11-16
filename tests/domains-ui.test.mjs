// Кабінет на піддомені: dashboard.iteris-code.org показує кабінет на «/», решта сайту веде на основний домен.
// Запуск: npm run build && npm i --no-save jsdom && node tests/domains-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { contentReply } from "./content-mock.mjs";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }
const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const rawHtml = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const html = rawHtml.replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const user = { id: "g1", email: "o@x.ua", name: "Олена", avatarUrl: null, isPro: false, proUntil: null, streak: 3 };
const dash = { user, completedLessons: [], lastLesson: null, passedTasks: [], tasksPassed: 0, recentSubmissions: [], activity: {} };

async function page(url, { me = user } = {}) {
  const left = [];
  const dom = new JSDOM(html, { url, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true; w.scrollTo = () => {}; w.__IC_LEAVE = (u) => left.push(u);
  const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });
  w.fetch = async (u) => {
    if (u === "/api/me") return reply(200, { user: me });
    const cr = contentReply(u, me);
    if (cr) return reply(cr[0], cr[1]);
    if (u === "/api/dashboard") return reply(200, dash);
    if (u === "/api/auth/config") return reply(200, { clientId: "cid", turnstileSiteKey: null, mail: false });
    if (u === "/api/onboarding") return reply(200, { onboarding: null });
    if (u === "/api/progress") return reply(200, { lessonIds: [] });
    return reply(404, {});
  };
  try { Object.defineProperty(w, "crypto", { value: globalThis.crypto, configurable: true }); } catch {}
  w.eval(bundle);
  await sleep(120);
  const $ = (s) => w.document.querySelector(s);
  return { w, left, $, $$: (s) => Array.from(w.document.querySelectorAll(s)), path: () => w.location.pathname + w.location.hash, app: () => w.document.getElementById("app").innerHTML };
}

let ok = 0;
const t = (name, cond) => { if (!cond) { console.log("FAIL -", name); process.exitCode = 1; } else { ok++; console.log("ok  -", name); } };
const DASH = "https://dashboard.iteris-code.org/", MAIN = "https://iteris-code.org";

/* ---- кабінетний піддомен ---- */
const d = await page(DASH);
t("dashboard.iteris-code.org: на «/» показано кабінет, а не головну", !!d.$(".dash") && !d.$(".dash-guest") && d.path() === "/" && !d.app().includes("hero-home"));
d.$(".brand").click();
t("логотип на кабінетному домені веде на основний сайт, а не лишає в кабінеті", d.left.at(-1) === MAIN + "/" && d.path() === "/");
const dl = await page(DASH);
dl.$("#nav a[href=\"/courses\"]")?.click();
t("пункт меню на кабінетному домені веде на основний домен (/courses)", dl.left.at(-1) === MAIN + "/courses");
const dd = await page("https://dashboard.iteris-code.org/dashboard");
t("/dashboard на кабінетному домені стає просто «/» і показує кабінет", dd.path() === "/" && !!dd.$(".dash"));
const dx = await page("https://dashboard.iteris-code.org/lesson/js/1");
t("чужа сторінка на кабінетному домені відправляє на основний домен із тим самим шляхом", dx.left.at(-1) === MAIN + "/lesson/js/1");
const dg = await page(DASH, { me: null });
t("гість на кабінетному домені бачить запрошення увійти", !!dg.$(".dash-guest"));
dg.$("[data-act=login]").click();
t("«Увійти» веде на основний домен (OAuth і форма входу живуть лише там)", dg.left.at(-1) === MAIN + "/login");

/* ---- основний домен ---- */
const r = await page("https://iteris-code.org/");
r.$(".brand").click();
t("основний домен: логотип лишає на «/» без решітки", r.path() === "/" && r.left.length === 0 && r.$(".brand").getAttribute("href") === "/");
r.$(".acct-user")?.click();
t("основний домен: посилання на кабінет відкриває dashboard.iteris-code.org", r.left.at(-1) === DASH);
const rd = await page("https://iteris-code.org/dashboard");
t("основний домен: стара адреса /dashboard переносить на піддомен", rd.left.at(-1) === DASH);
const rw = await page("https://www.iteris-code.org/dashboard");
t("www так само переноситься на піддомен кабінету", rw.left.at(-1) === DASH);

/* ---- інші адреси (pages.dev, превʼю): старий порядок ---- */
const p = await page("https://iteris-code.pages.dev/dashboard");
t("pages.dev: кабінет лишається на /dashboard, домени не чіпаються", p.left.length === 0 && p.path() === "/dashboard" && !!p.$(".dash"));
p.$(".brand").click();
t("pages.dev: логотип веде на «/» без решітки", p.left.length === 0 && p.path() === "/");

/* ---- скрипт у <head> спрацьовує до завантаження застосунку ---- */
t("у <head> є мгновенний перехід: /dashboard на основному домені й чужі сторінки на кабінетному", rawHtml.includes('d="dashboard."+r') && rawHtml.includes('r="iteris-code.org"') && /location\.replace\("https:\/\/"\+r\+location\.pathname/.test(rawHtml));

console.log(`\nПройдено перевірок (піддомени): ${ok}`);
