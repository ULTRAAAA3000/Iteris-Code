// Англійська версія, інтерфейс: перемикач мови в шапці, навігація, форми, демо, форма підтримки. Запуск: npm run build && node tests/i18n-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { runSuite } from "../src/runner/core.ts";
import { contentReply } from "./content-mock.mjs";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }
const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const shell = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, (m) => (m.includes("__IC_WORKER__") ? "" : m));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CY = /[А-Яа-яІіЇїЄєҐґ]/;

async function page(url = "/", { pref = null, me = null, authReply = null, contactReply = [200, { ok: true }] } = {}) {
  const calls = [];
  const dom = new JSDOM(shell, { url: "https://iteris-code.pages.dev" + url, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true; w.scrollTo = () => {};
  if (pref) w.localStorage.setItem("ic-lang", JSON.stringify(pref));   // застосунок зберігає значення як JSON
  const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });
  w.fetch = async (u, o = {}) => {
    calls.push({ method: o.method || "GET", url: u, body: o.body ? JSON.parse(o.body) : null });
    if (u === "/api/me") return reply(200, { user: me });
    const cr = contentReply(u, me); if (cr) return reply(cr[0], cr[1]);
    if (u === "/api/auth/config") return reply(200, { clientId: "cid", turnstileSiteKey: null, mail: true });
    if (u === "/api/auth/login") return authReply ? reply(...authReply) : reply(401, { error: "invalid_credentials" });
    if (u === "/api/contact") return reply(...contactReply);
    return reply(404, {});
  };
  w.Worker = class { postMessage(m) { runSuite(m.code, m.tests, () => {}).then((r) => this.onmessage({ data: { nonce: m.nonce, type: "done", ...r } })); } terminate() {} };
  try { Object.defineProperty(w, "crypto", { value: globalThis.crypto, configurable: true }); } catch {}
  w.eval(bundle);
  await sleep(150);
  const $ = (s) => w.document.querySelector(s), $$ = (s) => Array.from(w.document.querySelectorAll(s));
  return { w, calls, $, $$, app: () => $("#app").innerHTML, text: (s) => $(s)?.textContent ?? "", go: async (sel) => { $(sel).click(); await sleep(150); }, path: () => w.location.pathname, pref: () => { const v = w.localStorage.getItem("ic-lang"); return v === null ? null : JSON.parse(v); } };
}
let ok = 0;
const t = (name, cond) => { if (!cond) { console.log("FAIL -", name); process.exitCode = 1; } else { ok++; console.log("ok  -", name); } };
const noCy = (s) => !CY.test(s.replace("Мова / Language", "").replace("Українська", ""));

const en = await page("/en/");
t("/en/: мова документа, заголовок, головний заголовок і меню англійською", en.w.document.documentElement.lang === "en" && en.w.document.title.includes("learn to code for free") && en.text("h1") === "Learn to code. For free." && en.text('#nav a[data-k="courses"]') === "Courses" && en.text("footer").includes("Terms of use"));
t("/en/: у шапці й вмісті немає українського тексту (крім підпису перемикача)", noCy(en.$("header.top").textContent) && noCy(en.app()) && noCy(en.$("footer").textContent));
t("/en/: перемикач UA | EN, англійська позначена, адреси веде на ту саму сторінку", en.$("#lang [data-lang=en]").getAttribute("aria-current") === "true" && !en.$("#lang [data-lang=uk]").hasAttribute("aria-current") && en.$("#lang [data-lang=uk]").getAttribute("href") === "/" && en.$("#lang [data-lang=en]").getAttribute("href") === "/en/");
t("/en/: посилання на публічні сторінки з /en, на кабінет без нього, кнопка входу англійською", en.$$('#app a[href="/en/courses"]').length > 0 && !en.app().includes('href="/courses"') && en.$('footer a[href="/en/privacy"]') !== null && en.$('#nav a[data-k="path"]')?.getAttribute("href") === "/path" && en.text("#acct").includes("Sign in"));
t("/en/: hreflang обох мов і x-default, canonical англійський", en.$$('link[rel="alternate"][hreflang]').length === 3 && en.$('link[rel="alternate"][hreflang="x-default"]').href.endsWith("/") && !en.$('link[rel="alternate"][hreflang="x-default"]').href.includes("/en/") && en.$('link[rel="canonical"]').href.endsWith("/en/") && en.$('meta[property="og:locale"]').content === "en_US");
t("/en/: демонстраційний Python на головній відповідає англійською", (() => { en.$("#pyrun").click(); return en.text("#pyout").startsWith("What is your name? Alex\nHello, Alex!"); })());

const uk = await page("/courses");
t("/courses: українська за замовчуванням, перемикач веде на /en/courses", uk.w.document.documentElement.lang === "uk" && uk.text("h1") === "Курси програмування" && uk.$("#lang [data-lang=en]").getAttribute("href") === "/en/courses" && uk.$("#lang [data-lang=uk]").getAttribute("aria-current") === "true");
await uk.go("#lang [data-lang=en]");
t("клік «EN»: адреса /en/courses, англійський вміст, заголовок вкладки, мова документа, шапка й підвал", uk.path() === "/en/courses" && uk.text("h1") === "Programming courses" && uk.w.document.title.includes("Programming courses") && uk.w.document.documentElement.lang === "en" && uk.text('#nav a[data-k="courses"]') === "Courses" && uk.text("footer").includes("Support"));
t("клік «EN»: вибір запам'ятано, перемикач оновився, hreflang на обидві адреси", uk.pref() === "en" && uk.$("#lang [data-lang=en]").getAttribute("aria-current") === "true" && uk.$("#lang [data-lang=uk]").getAttribute("href") === "/courses" && uk.$$('link[rel="alternate"][hreflang]').length === 3 && uk.$('link[rel="canonical"]').href.endsWith("/en/courses"));
await uk.go('#app a[href="/en/program"]');
t("навігація всередині англійської версії лишається англійською: /en/program", uk.path() === "/en/program" && uk.text("h1") === "Programming" && noCy(uk.app()));
await uk.go('#app a[href^="/en/ref/"]');
t("перехід на довідник: англійська адреса, заголовки розділів і код без кирилиці", uk.path().startsWith("/en/ref/") && uk.text("h1").endsWith("reference") && noCy(uk.app()) && uk.$$("pre.code").length > 3);
await uk.go("#lang [data-lang=uk]");
t("клік «UA» з довідника: адреса без /en, українська, шапка й підвал українською", !uk.path().startsWith("/en") && uk.path().startsWith("/ref/") && uk.w.document.documentElement.lang === "uk" && uk.text("h1").includes("довідник") && uk.text('#nav a[data-k="courses"]') === "Курси" && uk.text("footer").includes("Підтримка") && uk.pref() === "uk");

const reg = await page("/register", { pref: "en" });
t("кабінетні адреси без префікса йдуть за вибором користувача: /register англійською", reg.w.document.documentElement.lang === "en" && reg.text("h1") === "Sign up" && reg.text("#af button[type=submit]") === "Create an account" && reg.text("#app").includes("Terms of Use") && reg.$('#app a[href="/en/terms"]') !== null);
t("форма входу англійською: підказки й посилання, шапка теж англійською", noCy(reg.app()) && noCy(reg.$("header.top").textContent) && reg.text("#acct").includes("Sign in"));
const lg = await page("/login", { pref: "en" });
const f = lg.$("#af"); lg.$("#af [name=email]").value = "a@x.ua"; lg.$("#af [name=password]").value = "wrong-password";
f.dispatchEvent(new lg.w.Event("submit", { cancelable: true, bubbles: true })); await sleep(120);
t("помилка входу англійською: «Wrong email or password»", lg.text("#af-msg") === "Wrong email or password");
const lg5 = await page("/login", { pref: "en", authReply: [500, { error: "server_error", code: "db_schema" }] });
lg5.$("#af [name=email]").value = "a@x.ua"; lg5.$("#af [name=password]").value = "wrong-password";
lg5.$("#af").dispatchEvent(new lg5.w.Event("submit", { cancelable: true, bubbles: true })); await sleep(120);
t("збій сервера англійською: «Server error (code 500, db_schema)»", lg5.text("#af-msg").startsWith("Server error (code 500, db_schema)"));

const gate = await page("/lesson/js/1", { pref: "en" });
t("уроки лишаються українськими: гостю англійською пояснено запрошення, і є примітка про українську мову", gate.text("#app").includes("Lessons and tasks are in your account") && gate.$(".lang-note")?.textContent.includes("Ukrainian"));
const nf = await page("/en/nope");
t("/en/nope: сторінки немає англійською, заголовок вкладки, посилання на /en/", nf.text("#app h1") === "This page does not exist" && nf.w.document.title.startsWith("Page not found") && nf.$('#app a[href="/en/"]') !== null);
t("не публічна адреса не має hreflang і не індексується", (await page("/login", { pref: "en" })).$$('link[rel="alternate"][hreflang]').length === 0);

const d = await page("/en/");
d.$("#dm-code").value = DEMO_STARTER_SOLUTION_PLACEHOLDER();
function DEMO_STARTER_SOLUTION_PLACEHOLDER() { return "function double(n) {\n}\n"; }
d.$("#dm-run").click(); await sleep(150);
t("демо англійською: заготовка не проходить, повідомлення раннера англійською", d.text(".dm-sum").includes("Done 0 of 3") && d.text("#dm-results").includes("expected 8, got undefined") && noCy(d.text("#dm-results")));
d.$("#dm-code").value = "function double(n) { return n * 2; }"; d.$("#dm-code").dispatchEvent(new d.w.Event("input", { bubbles: true }));
d.$("#dm-run").click(); await sleep(150);
t("демо англійською: правильне рішення дає «Done 3 of 3» і перемогу з англійськими кнопками й адресою /en/courses", d.text(".dm-sum").includes("Done 3 of 3") && !d.$("#dm-win").hidden && d.text("#dm-win-h") === "Done, everything works!" && d.$('#dm-win a[href="/en/courses"]') !== null && d.$('#dm-win a[href="/register"]') !== null);
d.$("#dm-tab-html").click();
t("демо англійською: завдання HTML і підказка англійською", d.text("#dm-title") === "A heading and a button" && d.text("#dm-tip") === "Hint" && d.$("#dm-code").value.includes('lang="en"'));

const ct = await page("/en/contact");
t("форма підтримки англійською: теми, поля, кнопка", ct.text("#app h1") === "Support" && ct.text(".onb-chips").includes("Effects and visuals") && ct.text("#ct-form button[type=submit]") === "Send" && noCy(ct.app()));
ct.$("#ct-form [name=email]").value = "bad"; ct.$("#ct-form").dispatchEvent(new ct.w.Event("submit", { cancelable: true, bubbles: true })); await sleep(60);
t("форма підтримки: помилка пошти англійською", ct.text("#ct-msg") === "Check the email address");
ct.$("#ct-form [name=email]").value = "ann@example.com"; ct.$("#ct-form [name=message]").value = "The animation flickers on my phone when I open the menu.";
ct.$("#ct-form").dispatchEvent(new ct.w.Event("submit", { cancelable: true, bubbles: true })); await sleep(120);
t("форма підтримки: подяка англійською з поштою", !ct.$("#ct-ok").hidden && ct.text("#ct-ok-text") === "We received your message and will reply to ann@example.com." && ct.text("#ct-ok-h") === "Thank you!");

const priv = await page("/en/privacy");
t("політика конфіденційності англійською: реквізити й посилання на умови з /en", priv.text("#app h1").includes("Privacy Policy") && priv.text("#app").includes("AKERR-SHY s.r.o.") && noCy(priv.app()));
const news = await page("/en/whats-new");
t("«What's new»: дати у форматі «17 Nov 2026», англійські картки «Soon»", news.text("#app").includes("17 Nov 2026") && news.text("#app").includes("Soon") && noCy(news.app()));
const course = await page("/en/ref/python");
t("довідник Python англійською: розділи, код, заклик увійти", course.text("#app h1") === "Python: reference" && course.text("#app").includes("Output and input") && course.$('#app [data-act="login"]')?.textContent === "Sign in and start");

console.log(`\nПройдено перевірок англійської версії (інтерфейс): ${ok}`);
