// Етап 3 (частина A), інтерфейс: рушій перевірки проєктів на справжніх рішеннях і сторінка проєкту.
// Запуск: npm run build && npm i --no-save jsdom && node tests/stage3-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { PROJECTS, projectById } from "../src/projects/index.ts";
import { buildSrcdoc, REPORT_TYPE, scoreReport } from "../src/projects/sandbox.ts";
import { contentReply } from "./content-mock.mjs";
import { PROJECT_SOLUTIONS } from "./solutions.mjs";

let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }
const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

async function page(opts = {}) {
  const { me = null, dash = null, hash = "#/dashboard", done = null, onboarding, syncReply = null, saveOk = true, courseHtml = false, completeReply = null } = opts;
  const calls = [];
  const dom = new JSDOM(html, { url: "https://iteris-code.pages.dev/" + hash, runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true;
  w.scrollTo = () => {};
  if (done) w.localStorage.setItem("ic-done", JSON.stringify(done));
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
const base = { user, completedLessons: [], lastLesson: null, passedTasks: [], tasksPassed: 0, recentSubmissions: [], activity: {} };
const posted = (p, url) => p.calls.filter((c) => c.method === "POST" && c.url === url);

/* ---- рушій: справжнє виконання сторінки з перевірками (jsdom без обмежень на скрипти) ---- */
const todo = projectById("js-todo");
async function check(html, ms = 8000) {
  const nonce = "n" + Math.random().toString(36).slice(2);
  const dom = new JSDOM(buildSrcdoc(html, todo.requirements, nonce), { runScripts: "dangerously", pretendToBeVisual: true, virtualConsole: new VirtualConsole() });
  return new Promise((resolve) => {
    const timer = setTimeout(() => { dom.window.close(); resolve(null); }, ms);
    dom.window.addEventListener("message", (ev) => {
      if (ev.data?.type === REPORT_TYPE && ev.data.nonce === nonce) { clearTimeout(timer); dom.window.close(); resolve(ev.data); }
    });
  });
}
const sol = PROJECT_SOLUTIONS["js-todo"];
const score = (r) => scoreReport(todo, r);

const rStarter = await check(todo.starter);
t("рушій: заготовка проходить лише вимогу про наявні елементи (R1), решту ні", !!rStarter && score(rStarter).passed === 1 && score(rStarter).items[0].ok);
const rSol = await check(sol);
t("рушій: еталонне рішення виконує всі вимоги", !!rSol && score(rSol).all && score(rSol).passed === todo.requirements.length);
const rNoDel = await check(sol.replace('del.className = "del";', ""));
t("рушій: без кнопки .del не виконано рівно R7, з поясненням", !!rNoDel && score(rNoDel).passed === 7 && !score(rNoDel).items[6].ok && score(rNoDel).items[6].msg.includes("del"));
const rNoClear = await check(sol.replace('input.value = "";', ""));
t("рушій: без очищення поля не виконано R3", !!rNoClear && !score(rNoClear).items[2].ok && score(rNoClear).items[1].ok);
const rNoTrim = await check(sol.replace("input.value.trim()", "input.value"));
t("рушій: без trim() порожні справи з пробілів додаються, R4 не виконано", !!rNoTrim && !score(rNoTrim).items[3].ok);
const rNoLine = await check(sol.replace("text-decoration: line-through; ", ""));
t("рушій: без закреслення не виконано R6", !!rNoLine && !score(rNoLine).items[5].ok && score(rNoLine).items[4].ok);
const rNoCount = await check(sol.replace("      update();\n    });\n    list", "    });\n    list"));
t("рушій: без оновлення лічильника при додаванні не виконано R8", !!rNoCount && !score(rNoCount).items[7].ok);
const rBoom = await check(sol.replace("const input", 'throw new Error("boom");\n    const input'));
t("рушій: помилка в скрипті користувача не ламає перевірку: звіт приходить, вимоги скрипту не виконано", !!rBoom && score(rBoom).passed >= 1 && score(rBoom).passed < 8);
const rEmpty = await check("");
t("рушій: порожній файл теж отримує звіт (нічого не виконано)", !!rEmpty && score(rEmpty).passed === 0);
const rXss = await check(sol.replace("</body>", "<script>parent.postMessage({type:'x'},'*')</script></body>"));
t("рушій: сторонні скрипти користувача не заважають звіту", !!rXss && score(rXss).all);

/* ---- сторінка проєкту ---- */
const pg = await page({ me: user, dash: base, hash: "#/project/js-todo" });
await sleep(150);
t("сторінка: назва, 8 вимог R1…R8, макет, договір по елементах, кнопка перевірки", pg.$("h1").textContent.includes("список справ") && pg.$$("#pj-reqs li").length === 8 && !!pg.$(".pj pre.code") && pg.$$(".pj .prose ul li").length >= 3 && !!pg.$("#pj-run"));
const frame = pg.$("#pj-frame");
t("сторінка: попередній перегляд у sandbox лише з allow-scripts (без allow-same-origin)", frame.getAttribute("sandbox") === "allow-scripts");
t("сторінка: у редакторі заготовка проєкту", pg.$("#editor textarea").value === todo.starter);
pg.$("#pj-run").click();
await sleep(60);
const doc = frame.srcdoc;
const nonce = (doc.match(/NONCE = "([^"]+)"/) ?? [])[1];
t("сторінка: перевірка завантажує у iframe сторінку користувача з одноразовим кодом", !!nonce && doc.includes("Список справ") && posted(pg, "/api/progress/complete").length === 0);
const send = (p, data, source) => p.w.dispatchEvent(new p.w.MessageEvent("message", { data, source }));
send(pg, { type: REPORT_TYPE, nonce: "інший", results: todo.requirements.map((r) => ({ id: r.id, ok: true })) }, frame.contentWindow);
send(pg, { type: REPORT_TYPE, nonce, results: todo.requirements.map((r) => ({ id: r.id, ok: true })) }, pg.w);
await sleep(60);
t("сторінка: звіт із чужим кодом або не від iframe ігнорується", !pg.$(".pj-score") && posted(pg, "/api/progress/complete").length === 0);
send(pg, { type: REPORT_TYPE, nonce, results: [{ id: "R1", ok: true }, { id: "R2", ok: false, msg: "нема li" }] }, frame.contentWindow);
await sleep(80);
t("сторінка: часткова відповідь показує «Виконано 1 з 8», підказку з поясненням, ✓ і ✗ біля вимог", pg.$(".pj-score b").textContent === "Виконано 1 з 8" && pg.$$("#pj-reqs li.ok").length === 1 && pg.$$("#pj-reqs li.bad").length === 7 && pg.$(".pj-res .pj-hint").textContent.includes("нема li") && posted(pg, "/api/progress/complete").length === 0);
t("сторінка: кнопку перевірки знову увімкнено після звіту", pg.$("#pj-run").disabled === false);

const pg2 = await page({ me: user, dash: base, hash: "#/project/js-todo", completeReply: { ok: true, streak: 4, firstSolve: true, xp: 60 } });
await sleep(150);
pg2.$("#pj-run").click();
await sleep(60);
const nonce2 = (pg2.$("#pj-frame").srcdoc.match(/NONCE = "([^"]+)"/) ?? [])[1];
send(pg2, { type: REPORT_TYPE, nonce: nonce2, results: todo.requirements.map((r) => ({ id: r.id, ok: true })) }, pg2.$("#pj-frame").contentWindow);
await sleep(120);
const call = posted(pg2, "/api/progress/complete")[0];
t("сторінка: усі вимоги виконано → результат збережено на сервері (taskId проєкту, passed) і показано «+60 XP»", !!call && call.body.taskId === "js-todo" && call.body.passed === true && pg2.$("#pj-win").textContent.includes("+60 XP") && pg2.$(".pj-score.ok b").textContent === "Виконано 8 з 8");
t("сторінка: проєкт запам'ятовується як виконаний локально", JSON.parse(pg2.w.localStorage.getItem("ic-tasks") || "[]").includes("js-todo"));

const gp = await page({ me: null, hash: "#/project/js-todo" });
await sleep(150);
t("сторінка (гість): проєкт, як і уроки, закритий: запрошення увійти, редактора й перевірки немає", !gp.$("#pj-run") && !gp.$("#pj-frame") && !!gp.$('#app [data-act="login"]') && posted(gp, "/api/progress/complete").length === 0);

pg2.$('[data-pj="reset"]').click();
t("сторінка: «Скинути» повертає заготовку й очищає позначки вимог", pg2.$("#editor textarea").value === todo.starter && pg2.$$("#pj-reqs li.ok, #pj-reqs li.bad").length === 0);

const nf = await page({ me: user, dash: base, hash: "#/project/nope" });
t("сторінка: невідомий проєкт дає «Такої сторінки немає»", nf.html().includes("Такої сторінки немає") && !nf.$("#pj-run"));

/* ---- входи до проєкту: урок, шлях, кабінет ---- */
const ls = await page({ me: user, dash: base, hash: "#/lesson/js/17" });
t("урок js/17: у кінці картка «Проєкт за ТЗ» з посиланням на проєкт", !!ls.$('.pj-card a[href="/project/js-todo"]'));
const lo = await page({ me: user, dash: base, hash: "#/lesson/js/1" });
t("інші уроки без проєкту не мають картки", !lo.$(".pj-card"));
const ph = await page({ me: user, dash: base, hash: "#/path/js" });
t("шлях: біля уроку 17 чип «Проєкт: …» веде на проєкт", ph.$$(".path-prac").some((a) => a.getAttribute("href") === "/project/js-todo" && a.textContent.includes("Проєкт: список справ")));
const ds = await page({ me: user, dash: { ...base, completedLessons: [], passedTasks: ["js-todo"], tasksPassed: 1, recentSubmissions: [{ taskId: "js-todo", passed: true, at: new Date().toISOString() }] } });
t("кабінет: у списку останніх спроб проєкт показано за назвою", ds.html().includes("Проєкт: список справ"));
const lvl = await page({ me: user, dash: { ...base, xp: 10 } });
t("кабінет: у підказці про XP максимум враховує проєкти (до +60 XP)", lvl.$(".lvl-hint").textContent.includes("до +60 XP"));

console.log(`\nПройдено перевірок Етапу 3 (інтерфейс): ${ok}`);
