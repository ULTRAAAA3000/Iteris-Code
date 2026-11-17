// Форма підтримки /contact, інтерфейс. Запуск: npm run build && npm i --no-save jsdom && node tests/support-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { contentReply } from "./content-mock.mjs";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }
const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(opts = {}) {
  const { me = null, url = "/contact", siteKey = null, contactReply = [200, { ok: true }], noCaptcha = false, slowAuth = false } = opts;
  const calls = [];
  const dom = new JSDOM(html, { url: "https://iteris-code.pages.dev" + url, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true; w.scrollTo = () => {};
  w.turnstile = { resets: 0, render(_el, o) { if (!noCaptcha) o.callback("ok-token"); return "w1"; }, reset() { this.resets++; } };
  const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });
  w.fetch = async (u, o = {}) => {
    calls.push({ method: o.method || "GET", url: u, body: o.body ? JSON.parse(o.body) : null });
    if (u === "/api/me") { if (slowAuth) await sleep(250); return reply(200, { user: me }); }
    const cr = contentReply(u, me);
    if (cr) return reply(cr[0], cr[1]);
    if (u === "/api/auth/config") return reply(200, { clientId: "cid", turnstileSiteKey: siteKey, mail: false });
    if (u === "/api/progress" && !o.method) return reply(200, { lessonIds: [] });
    if (u === "/api/contact") { const r = typeof contactReply === "function" ? await contactReply(o) : contactReply; if (r === "offline") throw new Error("offline"); return reply(r[0], r[1]); }
    return reply(404, {});
  };
  try { Object.defineProperty(w, "crypto", { value: globalThis.crypto, configurable: true }); } catch {}
  w.eval(bundle);
  await sleep(120);
  const $ = (s) => w.document.querySelector(s), $$ = (s) => Array.from(w.document.querySelectorAll(s));
  return { w, calls, $, $$, html: () => w.document.getElementById("app").innerHTML };
}
let ok = 0;
const t = (name, cond) => { if (!cond) { console.log("FAIL -", name); process.exitCode = 1; } else { ok++; console.log("ok  -", name); } };
const user = { id: "g1", email: "olena@example.com", name: "Олена", avatarUrl: null, isPro: false, proUntil: null, streak: 3 };
const fill = (p, vals) => { for (const [k, v] of Object.entries(vals)) { const el = p.$(`#ct-form [name=${k}]`); el.value = v; el.dispatchEvent(new p.w.Event("input", { bubbles: true })); } };
const submit = async (p) => { p.$("#ct-form").dispatchEvent(new p.w.Event("submit", { cancelable: true, bubbles: true })); await sleep(100); };
const sent = (p) => p.calls.filter((c) => c.method === "POST" && c.url === "/api/contact");
const GOOD = "Анімація кнопки мерехтить на телефоні, дивіться на сторінці входу.";

const g = await page();
t("сторінка /contact: форма з 4 темами, «Ефекти та візуал» вибрано за замовчуванням", g.$$("#ct-form input[name=topic]").length === 4 && g.$("#ct-form input[value=visual]").checked && g.$("#app").textContent.includes("Ефекти та візуал"));
t("сторінка: поля ім'я, пошта, повідомлення з лічильником, приманка для ботів прихована від читачів екрана", !!g.$("[name=name]") && g.$("[name=email]").required && g.$("#ct-count").textContent === "0 / 2000" && g.$(".sp-hp").getAttribute("aria-hidden") === "true" && g.$("[name=website]").tabIndex === -1);
t("сторінка: заголовок, h1 один, лінк «Підтримка» у футері всіх сторінок", g.w.document.title.includes("Підтримка") && g.$$("h1").length === 1 && g.$$('footer a[href="/contact"]').length === 1);
t("гість: поля порожні", g.$("[name=email]").value === "" && g.$("[name=name]").value === "");

const lg = await page({ me: user });
await sleep(250);
t("користувач: ім'я та пошта підставлені з акаунта", lg.$("[name=email]").value === "olena@example.com" && lg.$("[name=name]").value === "Олена");
const slow = await page({ me: user, slowAuth: true });
fill(slow, { email: "ввів@вручну.ua" });
await sleep(700);
t("повільний вхід: те, що користувач уже ввів, не перезаписується підстановкою", slow.$("[name=email]").value === "ввів@вручну.ua" && slow.$("[name=name]").value === "Олена");

const tp = await page({ url: "/contact?topic=bug&from=/path" });
t("?topic=bug вибирає тему «Помилка в роботі», сторінка-джерело з ?from іде у звернення", tp.$("#ct-form input[value=bug]").checked && !tp.$("#ct-form input[value=visual]").checked);
fill(tp, { email: "a@x.ua", message: GOOD });
await submit(tp);
t("відправка: з ?from сторінка передається серверу", sent(tp)[0]?.body.page === "/path" && sent(tp)[0].body.topic === "bug");
const badTopic = await page({ url: "/contact?topic=hack" });
t("?topic із сміттям ігнорується: лишається тема за замовчуванням", badTopic.$("#ct-form input[value=visual]").checked);

fill(g, { message: "а".repeat(1900) });
t("лічильник рахує символи, біля межі підсвічується", g.$("#ct-count").textContent === "1900 / 2000" && g.$("#ct-count").className.includes("warn"));
fill(g, { message: "коротко" });
t("лічильник: у межах норми без попередження", g.$("#ct-count").textContent === "7 / 2000" && !g.$("#ct-count").className.includes("warn"));

await submit(g);
t("порожня пошта: запит не йде, поле підсвічено, форма трясеться", sent(g).length === 0 && g.$("[name=email]").getAttribute("aria-invalid") === "true" && g.$("#ct-form").className.includes("shake") && g.$("#ct-msg").textContent.includes("пошти"));
fill(g, { email: "ann@example.com" });
t("редагування поля знімає підсвічування помилки", !g.$("[name=email]").hasAttribute("aria-invalid"));
await submit(g);
t("закороткий текст: запит не йде, підсвічено повідомлення, пояснено межі", sent(g).length === 0 && g.$("[name=message]").getAttribute("aria-invalid") === "true" && g.$("#ct-msg").textContent.includes("10") && g.$("#ct-msg").textContent.includes("2000"));
g.$("#ct-form").dispatchEvent(new g.w.Event("animationend", { bubbles: true }));
t("клас shake знімається після анімації", !g.$("#ct-form").className.includes("shake"));

fill(g, { name: "Ann", message: GOOD, website: "" });
g.$("#ct-form").dispatchEvent(new g.w.Event("submit", { cancelable: true, bubbles: true }));
const b = g.$("#ct-form button[type=submit]");
t("під час відправки кнопка блокується, показує спінер і aria-busy", b.disabled && b.classList.contains("is-loading") && b.getAttribute("aria-busy") === "true");
await sleep(120);
const body = sent(g)[0]?.body;
t("тіло запиту: тема, ім'я, пошта, текст, приманка порожня, технічні дані (розмір вікна, браузер, рух)", !!body && body.topic === "visual" && body.name === "Ann" && body.email === "ann@example.com" && body.message === GOOD && body.website === "" && /^\d+x\d+$/.test(body.vp) && body.ua.length > 0 && ["full", "reduce"].includes(body.motion) && !("turnstile" in body && body.turnstile));
t("успіх: форма ховається, показано подяку з поштою, фокус на заголовку для екранних читачів", g.$("#ct-form").hidden && !g.$("#ct-ok").hidden && g.$("#ct-ok-text").textContent.includes("ann@example.com") && g.w.document.activeElement === g.$("#ct-ok-h") && !!g.$(".sp-check path"));
g.$("#ct-again").click();
t("«Написати ще»: форма повертається, текст очищено, пошта лишається", !g.$("#ct-form").hidden && g.$("#ct-ok").hidden && g.$("[name=message]").value === "" && g.$("#ct-count").textContent === "0 / 2000" && g.$("[name=email]").value === "ann@example.com");

const e500 = await page({ contactReply: [500, { error: "server_error", code: "db_schema" }] });
fill(e500, { email: "a@x.ua", message: GOOD });
await submit(e500);
t("збій сервера: «Помилка сервера» з кодом, кнопка знову активна, форма лишається", e500.$("#ct-msg").textContent.includes("500") && e500.$("#ct-msg").textContent.includes("db_schema") && !e500.$("#ct-form").hidden && !e500.$("#ct-form button[type=submit]").disabled);
const e502 = await page({ contactReply: [502, null] });
fill(e502, { email: "a@x.ua", message: GOOD });
await submit(e502);
t("відповідь без JSON (502): теж «Помилка сервера» з кодом", e502.$("#ct-msg").textContent.includes("502"));
const off = await page({ contactReply: "offline" });
fill(off, { email: "a@x.ua", message: GOOD });
await submit(off);
t("немає зв'язку: окреме повідомлення", off.$("#ct-msg").textContent.includes("Немає зв'язку"));
const e429 = await page({ contactReply: [429, { error: "too_many_requests" }] });
fill(e429, { email: "a@x.ua", message: GOOD });
await submit(e429);
t("429: просить спробувати пізніше", e429.$("#ct-msg").textContent.includes("Забагато"));
const e400 = await page({ contactReply: [400, { error: "invalid_email" }] });
fill(e400, { email: "a@x.ua", message: GOOD });
await submit(e400);
t("400 від сервера: повідомлення й підсвічене поле", e400.$("#ct-msg").textContent.includes("пошти") && e400.$("[name=email]").getAttribute("aria-invalid") === "true");

const ts = await page({ siteKey: "sk" });
t("Turnstile налаштовано: перед кнопкою з'являється слот", !!ts.$("#ct-ts") && ts.$("#ct-form button[type=submit]").previousElementSibling === ts.$("#ct-ts"));
fill(ts, { email: "a@x.ua", message: GOOD });
await submit(ts);
t("Turnstile: токен передається серверу", sent(ts)[0]?.body.turnstile === "ok-token");
const nc = await page({ siteKey: "sk", noCaptcha: true });
fill(nc, { email: "a@x.ua", message: GOOD });
await submit(nc);
t("Turnstile не пройдено: запит не йде", sent(nc).length === 0 && nc.$("#ct-msg").textContent.includes("перевірки"));
const fc = await page({ siteKey: "sk", contactReply: [400, { error: "captcha_failed" }] });
fill(fc, { email: "a@x.ua", message: GOOD });
await submit(fc);
t("Turnstile: після відмови токен скидається", fc.w.turnstile.resets === 1 && fc.$("#ct-msg").textContent.includes("перевірку"));
t("Turnstile не налаштовано: слота немає, токен не надсилається", !g.$("#ct-ts") && !("turnstile" in (sent(g)[0]?.body ?? {}) && sent(g)[0].body.turnstile));

const home = await page({ url: "/" });
t("футер головної: лінк на /contact", !!home.$('footer a[href="/contact"]'));

console.log(`\nПройдено перевірок підтримки (інтерфейс): ${ok}`);
