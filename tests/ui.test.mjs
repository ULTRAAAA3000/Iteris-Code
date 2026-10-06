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

async function page({ me = null, dash = null, hash = "#/dashboard", search = "", state = null, complete = null } = {}) {
  const calls = [];
  const dom = new JSDOM(html, { url: "https://iteris-code.pages.dev/" + search + hash, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true;
  if (state) w.sessionStorage.setItem("ic-oauth-state", state);
  const reply = (status, body) => ({ ok: status < 400, status, json: async () => body });
  w.fetch = async (url, o = {}) => {
    calls.push({ method: o.method || "GET", url, body: o.body ? JSON.parse(o.body) : null });
    if (url === "/api/me") return reply(200, { user: me });
    if (url === "/api/dashboard") return dash ? reply(200, dash) : reply(500, {});
    if (url === "/api/progress/complete") return complete ? complete() : reply(200, { ok: true, streak: 4, firstSolve: true, xp: 30 });
    if (url === "/api/progress" && !o.method) return reply(200, { lessonIds: ["js/1", "js/2"] });
    if (url === "/api/progress") return reply(200, { ok: true, streak: 2 });
    if (url === "/api/auth/config") return reply(200, { clientId: "cid" });
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
t("гість: кнопка «Увійти» і запрошення в кабінеті", p.head().includes('data-act="login"') && p.html().includes("Увійти через Google"));
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

const nav = await page({ me: null, hash: "#/lesson/js/3" });
nav.w.location.hash = "#/";
await sleep(60);
t("перехід зі сторінки завдання не лишає сміття", nav.html().includes("Вчимося кодити") && !nav.$("#editor"));
console.log(`\nПройдено перевірок: ${ok}`);
