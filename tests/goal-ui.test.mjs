// Денна ціль і підказка «серія сьогодні під загрозою» в кабінеті та онбордингу. Запуск: npm run build && npm i --no-save jsdom && node tests/goal-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { contentReply } from "./content-mock.mjs";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }
const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

async function page(opts = {}) {
  const { me = null, dash = null, hash = "#/dashboard", done = null, onboarding, syncReply = null, saveOk = true } = opts;
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
    if (url === "/api/goal") return reply(200, { ok: true, goal: { target: 5, done: 1, custom: true } });
    if (url === "/api/xp/sync") return syncReply ? reply(200, syncReply) : reply(200, { xp: 10, gained: [], level: 1, prevLevel: 1, leveledUp: false });
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
const dash = (over = {}) => ({ user, completedLessons: ["js/1", "js/2"], lastLesson: "js/2", passedTasks: [], tasksPassed: 0, recentSubmissions: [], activity: {}, xp: 20, onboarding: { level: "beginner", courses: ["js"] }, goal: { target: 3, done: 1, custom: true }, ...over });

// --- підказка «серія під загрозою»
const risk = await page({ me: user, dash: dash() });
t("серія є, сьогодні нічого: вгорі кабінету з'являється підказка", !!risk.$(".risk-banner") && risk.$(".risk-banner").textContent.includes("Серія 3 дні сьогодні під загрозою"));
t("підказка називає час, до якого треба встигнути, і скільки лишилось", /до \d{2}:\d{2}/.test(risk.$(".risk-banner").textContent) && /лишилось/.test(risk.$(".risk-banner").textContent));
t("підказка веде до наступного кроку навчання", /^\/lesson\/js\/\d+$/.test(risk.$(".risk-banner a")?.getAttribute("href") ?? ""));
t("підказка стоїть першою, над вітанням і рештою карток", risk.$(".dash").firstElementChild === risk.$(".risk-banner") && !!(risk.$(".risk-banner").compareDocumentPosition(risk.$(".dash-grid")) & 4));
t("картка серії теж попереджає про дедлайн", risk.$(".streak-card").textContent.includes("Серія під загрозою"));

const safe = await page({ me: user, dash: dash({ activity: { [today]: 1 } }) });
t("сьогодні вже був крок: підказки немає, серія зарахована", !safe.$(".risk-banner") && safe.$(".streak-card").textContent.includes("Сьогодні вже зараховано"));
const extended = await page({ me: { ...user, streakToday: true }, dash: dash({ user: { ...user, streakToday: true }, activity: {} }) });
t("серію вже продовжено (повторне розв'язання): запису в історії немає, але підказки теж немає", !extended.$(".risk-banner") && extended.$(".streak-card").textContent.includes("Сьогодні вже зараховано"));
t("картка серії: вогник горить, коли серію продовжено сьогодні", !!extended.$(".streak-card .flame.lit") && !extended.$(".streak-card .flame.dim"));
const notYet = await page({ me: { ...user, streakToday: false }, dash: dash({ user: { ...user, streakToday: false }, activity: {} }) });
t("серію не продовжено й історії немає: підказка на місці", !!notYet.$(".risk-banner"));
const none = await page({ me: { ...user, streak: 0 }, dash: dash({ user: { ...user, streak: 0 } }) });
t("серії немає: нема чого рятувати, підказки немає", !none.$(".risk-banner"));

// --- картка денної цілі
const g = await page({ me: user, dash: dash() });
t("картка цілі: 1 з 3, три крапки, одна заповнена", g.$(".goal-n").textContent === "1" && g.$$(".goal-dots i").length === 3 && g.$$(".goal-dots i.on").length === 1);
t("картка цілі: пояснення, скільки ще залишилось", g.$(".goal-msg").textContent.includes("Ще 2 кроки"));
t("картка цілі: поточна ціль підсвічена, варіанти 1, 2, 3, 5", g.$$(".goal-pick button").map((b) => b.dataset.goal).join() === "1,2,3,5" && g.$(".goal-pick .on")?.dataset.goal === "3");
t("індикатор цілі доступний: progressbar із значеннями", g.$(".goal-dots").getAttribute("role") === "progressbar" && g.$(".goal-dots").getAttribute("aria-valuenow") === "1" && g.$(".goal-dots").getAttribute("aria-valuemax") === "3");

const done = await page({ me: user, dash: dash({ goal: { target: 2, done: 2, custom: true } }) });
t("ціль виконано: окремий стан і вітання", !!done.$(".goal-card.reached") && done.$(".goal-msg").textContent.includes("Ціль виконано"));
const over = await page({ me: user, dash: dash({ goal: { target: 1, done: 4, custom: false } }) });
t("кроків більше за ціль: крапок рівно стільки, скільки цілей, без «мінус» у підказці", over.$$(".goal-dots i").length === 1 && over.$(".goal-msg").textContent.includes("Ціль виконано"));
const nogoal = await page({ me: user, dash: dash({ goal: undefined }) });
t("старий відповідь сервера без goal: показується ціль за замовчуванням (1 крок)", nogoal.$(".goal-card") && nogoal.$$(".goal-dots i").length === 1);

// --- зміна цілі з кабінету
const pick = await page({ me: user, dash: dash() });
const before = pick.calls.filter((c) => c.url === "/api/dashboard").length;
pick.$('.goal-pick button[data-goal="5"]').click();
await sleep(150);
const saved = pick.calls.find((c) => c.method === "POST" && c.url === "/api/goal");
t("клік по цілі 5 надсилає POST /api/goal { goal: 5 }", saved?.body?.goal === 5);
t("після збереження кабінет завантажується заново", pick.calls.filter((c) => c.url === "/api/dashboard").length > before);

// --- онбординг
const onb = await page({ me: user, dash: dash({ onboarding: null }) });
t("онбординг: чотири варіанти цілі, за замовчуванням 1 крок", onb.$$('input[name="goal"]').map((i) => i.value).join() === "1,2,3,5" && onb.$('input[name="goal"]:checked')?.value === "1");
onb.$('input[name="course"]').checked = true;
onb.$('input[name="goal"][value="3"]').checked = true;
onb.$("#onb-form").dispatchEvent(new onb.w.Event("submit", { cancelable: true, bubbles: true }));
await sleep(150);
const post = onb.calls.find((c) => c.method === "POST" && c.url === "/api/onboarding");
t("онбординг: обрана ціль передається на сервер разом з вибором", post?.body?.dailyGoal === 3 && Array.isArray(post.body.courses) && post.body.courses.length === 1);

console.log(`\nПройдено перевірок денної цілі (інтерфейс): ${ok}`);
