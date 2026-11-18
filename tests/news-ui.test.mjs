// «Що нового» у браузері: сторінка малюється, посилання з підвалу веде на неї, «Скоро» і випуски на місці, робить і гість, і користувач у кабінеті.
// Запуск: npm run build && npm i --no-save jsdom && node tests/news-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { contentReply } from "./content-mock.mjs";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }
const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(url, me = null) {
  const dom = new JSDOM(html, { url: "https://iteris-code.pages.dev" + url, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true; w.scrollTo = () => {};
  const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });
  w.fetch = async (u) => {
    if (u === "/api/me") return reply(200, { user: me });
    const cr = contentReply(u, me);
    if (cr) return reply(cr[0], cr[1]);
    if (u === "/api/auth/config") return reply(200, { clientId: "cid", turnstileSiteKey: null, mail: false });
    return reply(404, {});
  };
  try { Object.defineProperty(w, "crypto", { value: globalThis.crypto, configurable: true }); } catch {}
  w.eval(bundle);
  await sleep(120);
  const $ = (s) => w.document.querySelector(s);
  return { w, $, $$: (s) => Array.from(w.document.querySelectorAll(s)), path: () => w.location.pathname };
}
let ok = 0;
const t = (name, cond) => { if (!cond) { console.log("FAIL -", name); process.exitCode = 1; } else { ok++; console.log("ok  -", name); } };
const user = { id: "g1", email: "o@x.ua", name: "Олена", avatarUrl: null, isPro: false, proUntil: null, streak: 1 };

const g = await page("/whats-new");
t("гість: /whats-new показує заголовок, три картки «Скоро» (монети, магазин, напарник) і випуски без входу", g.$("h1").textContent === "Що нового і що скоро" && g.$$(".nw-card").length === 3 && g.$$(".nw-card h3").map((h) => h.textContent.replace(/\s*Скоро$/, "")).join(",") === "Монети,Магазин,Напарник" && g.$$(".nw-rel").length >= 4 && !g.$(".dash"));
t("картки мають картинки героїв із розмірами (без стрибків верстки) і порожнім alt (декор)", g.$$(".nw-hero").length === 3 && g.$$(".nw-hero").every((i) => i.getAttribute("alt") === "" && i.getAttribute("width") === "72" && /\/idols\/.+\.webp/.test(i.getAttribute("src"))));
t("вкладка називається «Що нового…», у хлібних крихтах: Головна / Що нового (поточна сторінка)", g.w.document.title.startsWith("Що нового") && g.$(".crumbs a").getAttribute("href") === "/" && g.$(".crumbs [aria-current=page]")?.textContent === "Що нового");
t("у підвалі є посилання «Що нового», яке веде на сторінку без решітки", (() => { const a = g.$$("footer a").find((x) => x.textContent === "Що нового"); return !!a && a.getAttribute("href") === "/whats-new"; })());

const h = await page("/");
h.$$("footer a").find((x) => x.textContent === "Що нового").click();
await sleep(80);
t("клік по посиланню в підвалі відкриває сторінку (без перезавантаження), адреса /whats-new", h.path() === "/whats-new" && h.$$(".nw-card").length === 3);

const u = await page("/whats-new", user);
t("користувач із входом бачить ту саму сторінку, а не кабінет", u.$$(".nw-card").length === 3 && !u.$(".dash"));
t("посилання «Напишіть нам» веде на /contact", u.$$(".nw-soon a").some((a) => a.getAttribute("href") === "/contact"));

console.log(`\nПройдено перевірок («Що нового», інтерфейс): ${ok}`);
