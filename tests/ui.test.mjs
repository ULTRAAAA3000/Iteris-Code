// Запуск: npm run build && npm i --no-save jsdom && node tests/ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { runSuite } from "../src/runner/core.ts";
import { SOLUTIONS } from "./solutions.mjs";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }

const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, (m) => (m.includes("__IC_WORKER__") ? "" : m));
const today = new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(opts = {}) {
  const { me = null, dash = null, hash = "#/dashboard", search = "", state = null, complete = null, clientId = "cid", siteKey = null, mail = true, auth = null, noCaptcha = false } = opts;
  const calls = [];
  const dom = new JSDOM(html, { url: "https://iteris-code.pages.dev/" + search + hash, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true;
  if (state) w.sessionStorage.setItem("ic-oauth-state", state);
  const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });
  w.fetch = async (url, o = {}) => {
    o = { ...o, billing: opts.billing };
    calls.push({ method: o.method || "GET", url, body: o.body ? JSON.parse(o.body) : null });
    if (url === "/api/me") return reply(200, { user: me });
    if (url === "/api/dashboard") return dash ? reply(200, dash) : reply(500, {});
    if (url === "/api/billing/checkout") return (o.billing ?? (() => reply(200, { url: "https://iteris.lemonsqueezy.com/checkout/buy/x?checkout[custom][user_id]=g1" })))();
    if (url === "/api/billing/portal") return opts.portal ? reply(200, { url: "https://iteris.lemonsqueezy.com/billing" }) : reply(404, { error: "not_found" });
    if (url === "/api/progress/complete") return complete ? complete() : reply(200, { ok: true, streak: 4, firstSolve: true, xp: 30 });
    if (url === "/api/progress" && !o.method) return reply(200, { lessonIds: ["js/1", "js/2"] });
    if (url === "/api/progress") return reply(200, { ok: true, streak: 2 });
    if (url === "/api/auth/config") return reply(200, { clientId, turnstileSiteKey: siteKey, mail });
    if (auth && url.startsWith("/api/auth/") && url !== "/api/auth/google") { const r = await auth(url, o.body ? JSON.parse(o.body) : null); if (r) return reply(r[0], r[1]); }
    if (url === "/api/auth/google") return reply(200, { ok: true });
    return reply(404, {});
  };
  try { Object.defineProperty(w, "crypto", { value: globalThis.crypto, configurable: true }); } catch {}
  // Web Worker у jsdom немає: підміняємо тим самим ядром, яке виконується у справжньому воркері
  w.Worker = class {
    postMessage(m) {
      runSuite(m.code, m.tests, (line) => this.onmessage({ data: { nonce: m.nonce, type: "log", line } }))
        .then((r) => this.onmessage({ data: { nonce: m.nonce, type: "done", ...r } }));
    }
    terminate() {}
  };
  // Turnstile у jsdom не завантажується: підміняємо віджет, який одразу видає токен (або мовчить, якщо noCaptcha)
  w.turnstile = { resets: 0, render(_el, o) { if (!noCaptcha) o.callback("ok-token"); return "w1"; }, reset() { this.resets++; } };
  w.eval(bundle);
  await sleep(80);
  const $ = (s) => w.document.querySelector(s);
  return { w, calls, $, html: () => w.document.getElementById("app").innerHTML, head: () => w.document.getElementById("acct").innerHTML,
    term: () => $("#ws-term").textContent, type: (code) => { const ta = $(".ws-plain"); ta.value = code; ta.dispatchEvent(new w.Event("input")); },
    run: async () => { $("[data-ws=run]").click(); await sleep(120); } };
}

let ok = 0;
const t = (name, cond) => { if (!cond) { console.log("FAIL -", name); process.exitCode = 1; } else { ok++; console.log("ok  -", name); } };

const user = { id: "g1", email: "o@x.ua", name: "Олена <b>Коваль</b>", avatarUrl: "https://lh3.googleusercontent.com/a.jpg", isPro: false, proUntil: null, streak: 3 };
const dash = { user, completedLessons: ["python/1", "python/2", "js/1", "js/2", "js/3", "zzz/9", "js/999"], lastLesson: "js/3", passedTasks: ["js-safe-city"], tasksPassed: 1,
  recentSubmissions: [{ taskId: "js-safe-city", passed: true, at: today + " 10:00:00" }], activity: { [today]: 4 } };

/* ---- кабінет ---- */
let p = await page({ me: null });
t("гість: кнопка «Увійти» і запрошення в кабінеті", p.head().includes('data-act="login"') && p.html().includes('data-act="login"'));
p.$('[data-act="login"]').click();
await sleep(40);
p.$('[data-act="google"]').click();
t("вхід через Google зі сторінки входу: state збережено, без заглушки-тосту", p.w.sessionStorage.getItem("ic-oauth-state")?.length === 32 && p.$(".toast") === null);
const noCfg = await page({ me: null, clientId: null, hash: "#/login" });
t("Google не налаштовано: форма є, кнопки Google немає, тосту-заглушки немає", !!noCfg.$("#af [name=email]") && !!noCfg.$("#af [name=password]") && !noCfg.html().includes('data-act="google"') && noCfg.$(".toast") === null);
p = await page({ me: user, dash });
let h = p.html();
t("кабінет: ім'я екрановано, фокус на наступному уроці, серія 3 дні", h.includes("Олена &lt;b&gt;Коваль&lt;/b&gt;") && !h.includes("<b>Коваль</b>") && h.includes("#/lesson/js/4") && h.includes("дні поспіль"));
t("кабінет: невалідні id відкинуто (5 уроків), 5 груп навичок", h.includes("<strong>5</strong>") && (h.match(/class="card skill"/g) || []).length === 5);
t("кабінет: практика в групі Frontend 1/5, назва завдання замість id", h.includes("Практика: 1/5") && h.includes("Безпечне читання міста"));
t("кабінет: календар активності і Free-бейдж", (h.match(/<i class="l\d"/g) || []).length >= 182 && h.includes("Перейти на Pro за $5"));
const pro = await page({ me: { ...user, isPro: true, proUntil: "2999-05-01 00:00:00" }, dash: { ...dash, user: { ...user, isPro: true, proUntil: "2999-05-01 00:00:00" } } });
t("Pro: градієнтний бейдж і дата", pro.html().includes('class="plan pro"') && pro.html().includes("2999"));
t("помилка API: картка з повтором", (await page({ me: user, dash: null })).html().includes("Не вдалося завантажити кабінет"));
t("аватар лише https", !(await page({ me: user, dash: { ...dash, user: { ...user, avatarUrl: "javascript:alert(1)" } } })).html().includes("javascript:"));
const bad = await page({ me: null, hash: "", search: "?code=abc&state=zzz" });
t("OAuth: чужий state відхиляється", !bad.calls.some((c) => c.url === "/api/auth/google") && bad.w.location.search === "");
const good = await page({ me: null, hash: "", search: "?code=abc&state=good", state: "good" });
t("OAuth: правильний state обмінює код і веде в кабінет", good.calls.some((c) => c.url === "/api/auth/google") && good.w.location.hash === "#/dashboard");

/* ---- звичайні сторінки ---- */
const home = await page({ me: null, hash: "" });
t("головна: курси та вкладки працюють", home.html().includes("13 курсів") && home.$("[data-tab=h]") !== null);
const plain = await page({ me: null, hash: "#/lesson/python/1" });
t("урок без завдання: старий макет із боковим меню", plain.html().includes("lesson-layout") && !plain.html().includes('class="ws"'));
plain.$("[data-toggle]").click();
await sleep(30);
t("урок: позначка «пройдено» без входу не ходить на сервер", !plain.calls.some((c) => c.url === "/api/progress" && c.method === "POST"));
const logged = await page({ me: user, dash, hash: "#/lesson/python/1" });
logged.$("[data-toggle]").click();
await sleep(30);
t("урок: для користувача позначка синхронізується із сервером", logged.calls.some((c) => c.method === "POST" && c.url === "/api/progress" && c.body.lessonIds[0] === "python/1"));

/* ---- екран із завданням ---- */
let ws = await page({ me: null, hash: "#/lesson/js/3" });
t("завдання: двоколонний екран, теорія + постановка + редактор із заготовкою", ws.html().includes('class="ws"') && ws.html().includes("Навіщо це в роботі") && ws.$(".ws-plain").value.includes("user.address.city"));
t("безкоштовне завдання: без пейволу, кнопка запуску активна", !ws.$(".paywall") && ws.$("#ws-run").disabled === false);
await ws.run();
t("запуск із заготовкою: тести падають, XP не дається", ws.term().includes("✗") && ws.term().includes("Пройдено 1 з 5") && !ws.$(".ws-win"));
ws.type(SOLUTIONS["js-safe-city"]);
await ws.run();
t("правильне рішення: 5 з 5 і повідомлення для гостя", ws.term().includes("Пройдено 5 з 5") && ws.$(".ws-win")?.textContent.includes("Увійдіть"));
t("гість: результат на сервер не відправляється", !ws.calls.some((c) => c.url === "/api/progress/complete"));
ws.type("function getCity(){ while(true){} }");
t("чернетка коду зберігається", (await sleep(450), ws.w.localStorage.getItem("ic-code:js-safe-city")?.includes("while(true)")));
ws.$("[data-ws=reset]").click();
t("кнопка «Скинути» повертає заготовку", ws.$(".ws-plain").value.includes("user.address.city"));
ws.type("функція(");
await ws.run();
t("синтаксична помилка показується, а не ламає сторінку", ws.term().includes("Синтаксична помилка"));
ws.type("console.log('привіт з консолі'); function getCity(){return 'x'}");
await ws.run();
t("console.log користувача видно в терміналі", ws.term().includes("привіт з консолі"));

ws = await page({ me: user, dash, hash: "#/lesson/js/3" });
ws.type(SOLUTIONS["js-safe-city"]);
await ws.run();
const sent = ws.calls.find((c) => c.url === "/api/progress/complete");
t("користувач: рішення відправляється з taskId і кодом", sent && sent.body.taskId === "js-safe-city" && sent.body.code.includes("Невідомо") && sent.body.passed === true);
t("користувач: показано +XP і серію", ws.$(".ws-win")?.textContent.includes("+30 XP") && ws.$(".ws-win").textContent.includes("4 дні"));

const pw = await page({ me: null, hash: "#/lesson/js/8" });
t("Pro-завдання, гість: пейвол і заблокований запуск", pw.html().includes("Відкрий практичні задачі та тести за $5/місяць") && pw.$("#ws-run").disabled === true && pw.html().includes('data-act="login"'));
const pf = await page({ me: user, dash, hash: "#/lesson/js/8" });
t("Pro-завдання, Free-користувач: кнопка апгрейду, запуск заблокований", pf.html().includes('data-act="upgrade"') && pf.$("#ws-run").disabled === true);
pf.type(SOLUTIONS["js-cart-total"]);
pf.$("[data-ws=run]").click();
await sleep(100);
t("заблокований запуск нічого не виконує і не шле на сервер", pf.term().includes("Натисніть") && !pf.calls.some((c) => c.url === "/api/progress/complete"));
const pp = await page({ me: { ...user, isPro: true }, dash, hash: "#/lesson/js/8" });
t("Pro-завдання, Pro-користувач: без пейволу", !pp.$(".paywall") && pp.$("#ws-run").disabled === false);
pp.type(SOLUTIONS["js-cart-total"]);
await pp.run();
t("Pro-користувач проходить завдання з першої спроби", pp.term().includes("Пройдено 5 з 5") && pp.calls.some((c) => c.url === "/api/progress/complete"));

const denied = await page({ me: { ...user, isPro: true }, dash, hash: "#/lesson/js/8", complete: () => ({ ok: false, status: 402, json: async () => ({ error: "pro_required" }) }) });
denied.type(SOLUTIONS["js-cart-total"]);
await denied.run();
t("сервер відхилив Pro (402): показано повідомлення, перемоги немає", denied.w.document.querySelector(".toast")?.textContent.includes("Pro") && !denied.$(".ws-win"));
const again = await page({ me: user, dash, hash: "#/lesson/js/3", complete: () => ({ ok: true, status: 200, json: async () => ({ ok: true, streak: 4, firstSolve: false, xp: 0 }) }) });
again.type(SOLUTIONS["js-safe-city"]);
await again.run();
t("повторне розв'язання: XP не нараховується", again.$(".ws-win")?.textContent.includes("вже розв'язували"));


/* ---- оплата ---- */
const payFree = await page({ me: user, dash });
payFree.w.window_open = [];
payFree.$("[data-act=upgrade]").click();
await sleep(60);
t("оплата: «Перейти на Pro» запитує посилання на оплату в сервера", payFree.calls.some((c) => c.method === "POST" && c.url === "/api/billing/checkout"));
const payOff = await page({ me: user, dash, billing: () => ({ ok: false, status: 503, json: async () => ({ error: "not_configured" }) }) });
payOff.$("[data-act=upgrade]").click();
await sleep(60);
t("оплата не налаштована (503): зрозуміле повідомлення", payOff.w.document.querySelector(".toast")?.textContent.includes("Оплату ще не налаштовано"));
t("кабінет Free: є кнопка «Оновити статус» після оплати", payFree.html().includes("Оновити статус"));
const proDash = { ...dash, user: { ...user, isPro: true, proUntil: "2999-05-01 00:00:00" } };
const payPro = await page({ me: { ...user, isPro: true }, dash: proDash, portal: true });
let opened = null;
payPro.w.open = (u, target, feat) => { opened = [u, target, feat]; };
payPro.$("[data-act=manage]").click();
await sleep(60);
t("Pro: «Керування підпискою» відкриває портал у новій вкладці без opener", opened && opened[0].startsWith("https://iteris.lemonsqueezy.com/") && opened[2] === "noopener");
const payNoPortal = await page({ me: { ...user, isPro: true }, dash: proDash });
payNoPortal.$("[data-act=manage]").click();
await sleep(60);
t("немає порталу (404): повідомлення замість тиші", payNoPortal.w.document.querySelector(".toast")?.textContent.includes("недоступне"));
const paid = await page({ me: user, dash: proDash, hash: "#/lesson/js/8" });
await sleep(60);
t("після оплати статус Pro з кабінету зніме пейвол у завданні", paid.$(".paywall") !== null);
paid.w.location.hash = "#/dashboard";
await sleep(150);
paid.w.location.hash = "#/lesson/js/8";
await sleep(150);
t("кабінет оновив статус: пейвол зник", paid.$(".paywall") === null && paid.$("#ws-run").disabled === false);
const nav = await page({ me: null, hash: "#/lesson/js/3" });
nav.w.location.hash = "#/";
await sleep(60);
t("перехід зі сторінки завдання не лишає сміття", nav.html().includes("Вчимося кодити") && !nav.$("#editor"));
/* ---- вхід за поштою ---- */
const fill = (pg, vals) => { for (const [k, v] of Object.entries(vals)) pg.$(`#af [name=${k}]`).value = v; };
const submit = async (pg) => { pg.$("#af").dispatchEvent(new pg.w.Event("submit", { cancelable: true, bubbles: true })); await sleep(80); };
const posted = (pg, url) => pg.calls.filter((c) => c.method === "POST" && c.url === url);

let em = await page({ me: null, hash: "#/dashboard", siteKey: "sk" });
em.$('[data-act="login"]').click();
await sleep(40);
t("пошта: «Увійти» відкриває форму входу з Turnstile, Google і посиланнями", em.w.location.hash === "#/login" && !!em.$("#af [name=email]") && !!em.$("#af [name=password]") && !!em.$("#af-ts")
  && em.html().includes('data-act="google"') && em.html().includes("#/forgot") && em.html().includes("#/register") && em.$("#af [name=password]").getAttribute("autocomplete") === "current-password");
em = await page({ me: null, hash: "#/login", siteKey: "sk", auth: (url) => (url === "/api/auth/login" ? [200, { ok: true }] : null) });
fill(em, { email: "a@x.ua", password: "correct-horse" });
await submit(em);
const lp = posted(em, "/api/auth/login");
t("вхід: на сервер іде пошта, пароль і токен Turnstile; далі кабінет", lp.length === 1 && lp[0].body.email === "a@x.ua" && lp[0].body.password === "correct-horse" && lp[0].body.turnstile === "ok-token"
  && em.calls.some((c) => c.url === "/api/me" && c.method === "GET") && em.w.location.hash === "#/dashboard");

const badLogin = await page({ me: null, hash: "#/login", siteKey: "sk", auth: () => [401, { error: "invalid_credentials" }] });
fill(badLogin, { email: "a@x.ua", password: "wrong-password" });
await submit(badLogin);
t("вхід: хибний пароль показує повідомлення, кнопка знову активна, Turnstile скинуто", badLogin.$("#af-msg").textContent === "Невірна пошта або пароль" && badLogin.$("#af button[type=submit]").disabled === false && badLogin.w.turnstile.resets === 1 && badLogin.w.location.hash === "#/login");

const nocap = await page({ me: null, hash: "#/login", siteKey: "sk", noCaptcha: true });
fill(nocap, { email: "a@x.ua", password: "correct-horse" });
await submit(nocap);
t("вхід: без пройденого Turnstile запит не надсилається", posted(nocap, "/api/auth/login").length === 0 && nocap.$("#af-msg").textContent.includes("перевірки"));

const rg = await page({ me: null, hash: "#/register", siteKey: "sk", auth: (url) => (url === "/api/auth/register" ? [200, { ok: true }] : null) });
t("реєстрація: поля ім'я, пошта, пароль (new-password, мін. 8)", !!rg.$("#af [name=name]") && rg.$("#af [name=password]").getAttribute("autocomplete") === "new-password" && rg.$("#af [name=password]").getAttribute("minlength") === "8");
fill(rg, { name: "Олена", email: "o@x.ua", password: "correct-horse" });
await submit(rg);
const rp = posted(rg, "/api/auth/register");
t("реєстрація: дані та токен Turnstile надіслано, форма замінюється повідомленням про лист", rp.length === 1 && rp[0].body.name === "Олена" && rp[0].body.turnstile === "ok-token"
  && rg.$("#af").hidden === true && rg.$("#af-msg").textContent.includes("o@x.ua") && rg.$("#af-msg").className.includes("ok"));

const fg = await page({ me: null, hash: "#/forgot", siteKey: "sk", auth: (url) => (url === "/api/auth/forgot" ? [200, { ok: true }] : null) });
fill(fg, { email: "o@x.ua" });
await submit(fg);
t("відновлення: однакове повідомлення, що не розкриває наявність акаунта", posted(fg, "/api/auth/forgot")[0].body.turnstile === "ok-token" && fg.$("#af-msg").textContent.startsWith("Якщо акаунт"));

const rs = await page({ me: null, hash: "#/reset/abcdefghijklmnopqrstuv", siteKey: "sk", auth: (url) => (url === "/api/auth/reset" ? [200, { ok: true }] : null) });
fill(rs, { password: "brand-new-password" });
await submit(rs);
const rsp = posted(rs, "/api/auth/reset");
t("новий пароль: токен із посилання передається, потім форма входу", rsp.length === 1 && rsp[0].body.token === "abcdefghijklmnopqrstuv" && rsp[0].body.password === "brand-new-password" && rs.w.location.hash === "#/login");

const rsBad = await page({ me: null, hash: "#/reset/abcdefghijklmnopqrstuv", siteKey: "sk", auth: () => [400, { error: "invalid_token" }] });
fill(rsBad, { password: "brand-new-password" });
await submit(rsBad);
t("новий пароль: недійсний токен пояснено", rsBad.$("#af-msg").textContent.includes("недійсне"));

const vf = await page({ me: null, hash: "#/verify/abcdefghijklmnopqrstuv", siteKey: "sk", auth: (url) => (url === "/api/auth/verify" ? [200, { ok: true }] : null) });
await sleep(60);
t("підтвердження пошти: токен надсилається один раз, далі кабінет", posted(vf, "/api/auth/verify").length === 1 && posted(vf, "/api/auth/verify")[0].body.token === "abcdefghijklmnopqrstuv" && vf.w.location.hash === "#/dashboard");
const vfBad = await page({ me: null, hash: "#/verify/abcdefghijklmnopqrstuv", siteKey: "sk", auth: () => [400, { error: "invalid_token" }] });
await sleep(60);
t("підтвердження пошти: недійсне посилання пояснено", vfBad.$("#af-msg").textContent.includes("недійсне") && vfBad.w.location.hash.startsWith("#/verify"));

const g1 = await page({ me: null, hash: "#/login", siteKey: null, clientId: null, mail: false, auth: (url) => (url === "/api/auth/login" ? [200, { ok: true }] : null) });
t("нічого не налаштовано: форма входу є, без Turnstile, Google і «Забули пароль»", !!g1.$("#af") && !g1.$("#af-ts") && !g1.html().includes('data-act="google"') && !g1.html().includes("#/forgot") && g1.head().includes('data-act="login"'));
fill(g1, { email: "a@x.ua", password: "correct-horse" });
await submit(g1);
t("без Turnstile: вхід надсилається без токена перевірки", posted(g1, "/api/auth/login").length === 1 && !("turnstile" in posted(g1, "/api/auth/login")[0].body) && g1.w.location.hash === "#/dashboard");
const gg = await page({ me: null, hash: "#/login", siteKey: null, clientId: "cid", mail: true });
t("налаштовано Google і пошту: з'являються кнопка Google та «Забули пароль»", gg.html().includes('data-act="google"') && gg.html().includes("#/forgot"));
t("без пошти: відновлення пароля й підтвердження недоступні", (await page({ me: null, hash: "#/forgot", mail: false })).html().includes("Такої сторінки немає") && (await page({ me: null, hash: "#/verify/abcdefghijklmnopqrstuv", mail: false })).html().includes("Такої сторінки немає"));
const nm = await page({ me: null, hash: "#/register", mail: false, auth: (url) => (url === "/api/auth/register" ? [200, { ok: true, signedIn: true }] : null) });
fill(nm, { email: "o@x.ua", password: "correct-horse" });
await submit(nm);
t("реєстрація без пошти: одразу вхід у кабінет", posted(nm, "/api/auth/register").length === 1 && nm.w.location.hash === "#/dashboard" && !nm.$("#af"));
const taken = await page({ me: null, hash: "#/register", mail: false, auth: () => [409, { error: "email_taken" }] });
fill(taken, { email: "o@x.ua", password: "correct-horse" });
await submit(taken);
t("реєстрація: пошта вже зайнята, пояснено", taken.$("#af-msg").textContent.includes("вже є"));
/* ---- ефекти форм: показ пароля, індикатор надійності, стани завантаження й помилки ---- */
const an = await page({ me: null, hash: "#/register", siteKey: "sk", auth: () => [400, { error: "weak_password" }] });
const pwi = an.$("#af [name=password]"), tog = an.$("#af .pw-toggle");
t("пароль: кнопка показу є, поле приховане, підпис і aria-pressed коректні", pwi.type === "password" && tog.getAttribute("aria-pressed") === "false" && tog.getAttribute("aria-label") === "Показати пароль" && tog.type === "button");
tog.click();
t("пароль: клік показує текст і міняє підпис", pwi.type === "text" && tog.getAttribute("aria-pressed") === "true" && tog.getAttribute("aria-label") === "Сховати пароль");
tog.click();
t("пароль: повторний клік знову ховає", pwi.type === "password" && tog.getAttribute("aria-pressed") === "false");
const setPw = (v) => { pwi.value = v; pwi.dispatchEvent(new an.w.Event("input", { bubbles: true })); };
const mt = () => an.$("#af .pw-meter").dataset.s;
t("індикатор надійності: порожньо 0", mt() === "0" && an.$("#af .pw-meter-t").textContent === "");
setPw("abc");
t("індикатор надійності: короткий пароль слабкий (1)", mt() === "1" && an.$("#af .pw-meter-t").textContent === "Слабкий пароль");
setPw("correct-horse-battery");
t("індикатор надійності: довгий пароль росте (3)", mt() === "3");
setPw("Str0ng!Passw0rd-2026");
t("індикатор надійності: максимум (4)", mt() === "4" && an.$("#af .pw-meter-t").textContent === "Надійний пароль");
setPw("");
t("індикатор надійності: після очищення знову 0", mt() === "0" && an.$("#af .pw-meter-t").textContent === "");
t("вхід: у полі пароля немає індикатора надійності, але є кнопка показу", (await page({ me: null, hash: "#/login", siteKey: "sk" })).$("#af .pw-meter") === null && !!(await page({ me: null, hash: "#/login", siteKey: "sk" })).$("#af .pw-toggle"));
fill(an, { email: "o@x.ua", password: "short" });
an.$("#af").dispatchEvent(new an.w.Event("submit", { cancelable: true, bubbles: true }));
const sb = an.$("#af button[type=submit]");
t("завантаження: під час запиту кнопка блокується, показує спінер і aria-busy", sb.disabled && sb.classList.contains("is-loading") && sb.getAttribute("aria-busy") === "true");
await sleep(80);
t("помилка: кнопка розблокована, поле пароля підсвічено, форма трясеться, повідомлення показано", !sb.disabled && !sb.classList.contains("is-loading") && !sb.hasAttribute("aria-busy")
  && an.$("#af [name=password]").getAttribute("aria-invalid") === "true" && !an.$("#af [name=email]").hasAttribute("aria-invalid") && an.$("#af").classList.contains("shake") && an.$("#af-msg").textContent.includes("8"));
an.$("#af [name=password]").dispatchEvent(new an.w.Event("input", { bubbles: true }));
t("помилка: підсвічування зникає, щойно користувач редагує поле", !an.$("#af [name=password]").hasAttribute("aria-invalid"));
an.$("#af").dispatchEvent(new an.w.Event("animationend", { bubbles: true }));
t("помилка: клас shake знімається після анімації", !an.$("#af").classList.contains("shake"));
const vwait = await page({ me: null, hash: "#/verify/abcdefghijklmnopqrstuv", siteKey: "sk", auth: () => new Promise(() => {}) });
t("підтвердження пошти: поки триває перевірка, показано спінер, а не галочку", vwait.$("#af-msg").className.includes("wait") && !vwait.$("#af-msg").className.includes("ok"));
t("уже увійшов: форму не показуємо", (await page({ me: user, dash, hash: "#/login", siteKey: "sk" })).html().includes("Ви вже увійшли"));

console.log(`\nПройдено перевірок: ${ok}`);
