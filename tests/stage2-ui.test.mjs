// Этап 2, интерфейс: онбординг, путь, уровень/XP, серия, календарь, эффекты. Запуск: npm run build && npm i --no-save jsdom && node tests/stage2-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { PROJECTS } from "../src/projects/index.ts";
import { TASKS } from "../src/tasks/index.ts";
import { LESSONS } from "../src/data/lessons.js";
import { chaptersOf, LESSON_XP, startLesson } from "../src/xp.ts";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }
const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

async function page(opts = {}) {
  const { me = null, dash = null, hash = "#/dashboard", done = null, onboarding, syncReply = null, saveOk = true, courseHtml = false } = opts;
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
    if (url === "/api/dashboard") return dash ? reply(200, dash) : reply(500, {});
    if (url === "/api/auth/config") return reply(200, { clientId: "cid", turnstileSiteKey: null, mail: false });
    if (url === "/api/onboarding" && !o.method) return reply(200, { onboarding: onboarding ?? null });
    if (url === "/api/onboarding") return saveOk ? reply(200, { ok: true }) : reply(500, {});
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
const base = { user, completedLessons: ["js/1", "js/2"], lastLesson: "js/2", passedTasks: [], tasksPassed: 0, recentSubmissions: [], activity: { [today]: 2 } };
const posted = (p, url) => p.calls.filter((c) => c.method === "POST" && c.url === url);
const change = (p, el, v) => { if (v !== undefined) el.checked = v; el.dispatchEvent(new p.w.Event("change", { bubbles: true })); };
const submit = async (p, sel) => { p.$(sel).dispatchEvent(new p.w.Event("submit", { cancelable: true, bubbles: true })); await sleep(90); };

/* ---- онбординг ---- */
const old = await page({ me: user, dash: base });
t("сумісність: відповідь кабінету без поля onboarding не показує майстер (старі клієнти й тести)", !old.$("#onb") && !!old.$(".lvl-card"));

const ob = await page({ me: user, dash: { ...base, completedLessons: [], onboarding: null, xp: 0 } });
t("перший вхід: замість кабінету майстер із курсами, рівнями й підказкою", !!ob.$("#onb") && ob.$$("#onb input[name=course]").length >= 10 && ob.$$("#onb input[name=level]").length === 3 && !ob.$(".lvl-card"));
t("майстер: рівень «Новачок» вибрано за замовчуванням, курсів не вибрано, підказка просить обрати курс", ob.$("#onb input[name=level][value=beginner]").checked && ob.$$("#onb input[name=course]:checked").length === 0 && ob.$("#onb-preview").textContent.includes("Оберіть"));
await submit(ob, "#onb-form");
t("майстер: без курсу запит не йде, показано повідомлення", posted(ob, "/api/onboarding").length === 0 && ob.$("#onb-msg").textContent.includes("Оберіть"));
change(ob, ob.$("#onb input[value=js]"), true);
t("майстер: підказка показує стартову главу й урок вибраного курсу", ob.$("#onb-preview").textContent.includes("JavaScript") && ob.$("#onb-preview").textContent.includes("урок 1"));
change(ob, ob.$("#onb input[name=level][value=advanced]"), true);
const advStart = startLesson(LESSONS.js, "advanced");
t("майстер: рівень «Впевнений» зсуває старт на пізнішу главу", advStart > 1 && ob.$("#onb-preview").textContent.includes("урок " + advStart));
change(ob, ob.$("#onb input[value=python]"), true);
await submit(ob, "#onb-form");
const sp = posted(ob, "/api/onboarding");
t("майстер: на сервер іде рівень і вибрані курси, далі відкривається шлях першого курсу", sp.length === 1 && sp[0].body.level === "advanced" && JSON.stringify(sp[0].body.courses.sort()) === JSON.stringify(["js", "python"]) && ob.w.location.hash.startsWith("#/path/"));

const lim = await page({ me: user, dash: { ...base, onboarding: null } });
for (const k of ["html", "css", "js", "ts", "python"]) change(lim, lim.$(`#onb input[value=${k}]`), true);
const others = lim.$$("#onb input[name=course]:not(:checked)");
t("майстер: не більше 5 курсів, решта блокується", others.length > 0 && others.every((i) => i.disabled));

const bad = await page({ me: user, dash: { ...base, onboarding: null }, saveOk: false });
change(bad, bad.$("#onb input[value=js]"), true);
await submit(bad, "#onb-form");
t("майстер: помилка збереження пояснена, кнопка знову активна, шлях не відкривається", bad.$("#onb-msg").textContent.includes("Не вдалося") && !bad.$("#onb button[type=submit]").disabled && bad.w.location.hash === "#/dashboard");

const re = await page({ me: user, dash: base, hash: "#/start", onboarding: { level: "intermediate", courses: ["js", "sql"] } });
await sleep(120);
t("#/start: вибір завантажується з сервера, форма з уже вибраними курсами й рівнем для зміни", re.$("#onb input[value=js]").checked && re.$("#onb input[value=sql]").checked && !re.$("#onb input[value=python]").checked && re.$("#onb input[name=level][value=intermediate]").checked);
t("#/start для гостя: сторінки немає", (await page({ me: null, hash: "#/start" })).html().includes("Такої сторінки немає"));

/* ---- кабінет ---- */
const t0 = TASKS[0];
const dayX = daysAgo(3);
const cab = await page({ me: user, dash: { ...base, xp: 140, onboarding: { level: "intermediate", courses: ["js"] }, activity: { [today]: 2, [dayX]: 3 },
  days: { [today]: { l: ["js/1", "js/2"], t: [] }, [dayX]: { l: ["python/1", "python/2"], t: [t0.id] } } } });
t("рівень: 140 XP це рівень 3, до рівня 4 залишилось 120 XP, смуга з aria", cab.$(".lvl-badge").textContent === "3" && cab.$(".lvl-xp").textContent === "140 XP" && cab.$(".lvl-card").textContent.includes("До рівня 4: 100 XP") && cab.$(".xp-bar").getAttribute("aria-valuenow") === "0" && cab.$(".xp-bar").getAttribute("aria-valuemax") === "100");
t("серія: лічильник, вогонь горить (сьогодні є активність), тиждень із позначками, бонус до наступної позначки", cab.$(".streak-n").dataset.to === "3" && cab.$(".flame").className.includes("lit") && cab.$$(".week li").length === 7 && cab.$(".week li.today").className.includes("on") && cab.$(".next-bonus").textContent.includes("4 дні") && cab.$(".next-bonus").textContent.includes("+30 XP"));
await sleep(700);
t("серія: анімований лічильник закінчує на справжньому числі", cab.$(".streak-n").textContent === "3");
const quiet = await page({ me: user, dash: { ...base, activity: {} } });
t("серія: без активності сьогодні вогонь згаслий і підказка про збереження серії", quiet.$(".flame").className.includes("dim") && quiet.$(".streak-card").textContent.includes("не втратити серію") && quiet.$(".streak-card").textContent.includes("UTC"));
t("шлях у кабінеті: курс, рівень, наступний урок і посилання на шлях", cab.$(".path-card").textContent.includes("JavaScript") && cab.$(".path-card").textContent.includes("Середній") && !!cab.$('.path-card a[href="#/path/js"]') && !!cab.$('.path-card a[href="#/start"]'));

const cell = (p, k) => p.$(`.heat i[data-day="${k}"]`);
t("календар: кожен день у вигляді клітинки, дні з активністю фокусуються з клавіатури, порожні ні", cab.$$(".heat i[data-day]").length >= 182 && cell(cab, dayX).getAttribute("tabindex") === "0" && cell(cab, daysAgo(10)).getAttribute("tabindex") === null && cell(cab, dayX).getAttribute("aria-label").includes("2 уроки, 1 завдання"));
cell(cab, dayX).click();
const det = cab.$("#day-detail");
t("календар: клік по дню показує кількість і список уроків та завдань із посиланнями", det.textContent.includes("2 уроки") && det.textContent.includes("1 завдання") && !!det.querySelector('a[href="#/lesson/python/1"]') && !!det.querySelector(`a[href="#/lesson/${t0.lesson}"]`) && det.textContent.includes(t0.title) && cell(cab, dayX).className.includes("sel"));
cell(cab, daysAgo(10)).click();
t("календар: порожній день повідомляє про відсутність активності, виділення переходить", cab.$("#day-detail").textContent.includes("активності не було") && !cell(cab, dayX).className.includes("sel"));
cell(cab, today).dispatchEvent(new cab.w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
t("календар: Enter на дні відкриває подробиці (клавіатура)", cab.$("#day-detail").textContent.includes("2 уроки") && cab.$("#day-detail").textContent.includes("0 завдань"));

/* ---- кабінет: візуалізації (банер, кільця, графік, радар, нагороди) ---- */
t("банер: привітання, ім'я, кільце навколо аватара і позначка рівня 3 (140 XP), підсумкові чипи", !!cab.$(".dash-hero .hero-hi") && cab.$(".dash-hero h1").textContent === "Олена" && !!cab.$(".ava-ring svg.rg .trk") && cab.$(".ava-lvl").textContent === "3" && cab.$$(".hero-chips li").length === 4 && cab.$(".hero-chips").textContent.includes("140 XP"));
t("підсумки: три кільця прогресу, а числа лишились у <strong> (0 завдань: кільце без дуги, лише доріжка)", cab.$$(".stats3 .srg svg.rg").length === 3 && cab.$$(".stats3 .srg .val").length === 2 && cab.$(".stats3 strong").textContent === "2");
t("графік активності: 14 стовпчиків, сьогодні виділено, висота лише у днів з активністю, сума за два тижні", cab.$$(".act14 li").length === 14 && cab.$(".act14 li:last-child").className.includes("today") && cab.$$(".act14 li:not(.z)").length === 2 && cab.$(".act-total").textContent.includes("5 дій"));
t("радар навичок: 5 осей, 5 підписів із відсотками, багатокутник, aria-опис", cab.$$(".radar .axis").length === 5 && cab.$$(".radar text").length === 5 && !!cab.$(".radar .area") && cab.$(".radar").getAttribute("aria-label").includes("Frontend") && cab.$(".radar").getAttribute("aria-label").includes("Backend"));
t("нагороди за серію: серія 3 дні = одна нагорода з шести світиться, решта закрита", cab.$$(".medal").length === 6 && cab.$$(".medal.on").length === 1 && cab.$$(".medal.off").length === 5 && cab.$(".medals-card").textContent.includes("Отримано 1 з 6"));
t("календар: підсумкові чипи, місяці над сіткою, сьогодні позначено, у клітинок є індекс тижня для хвилі", cab.$$(".cal-sum li").length === 3 && cab.$$(".heat-months span").length >= 5 && !!cab.$(".heat i.today") && cab.$(".heat i").getAttribute("style").includes("--w:") && cab.$(".cal-sum").textContent.includes("2 активні дні"));
await sleep(1200);
t("лічильники: після анімації показують справжні числа", [...cab.$$(".dash .cnt[data-to]")].every((e) => e.textContent === e.dataset.to));
const again = await page({ me: { ...user, streak: 0 }, dash: { ...base, user: { ...user, streak: 0 }, xp: 10, onboarding: { level: "beginner", courses: ["js"] }, activity: {}, days: {} } });
t("порожній акаунт: графік і радар малюються без помилок, усі нагороди закриті", again.$$(".act14 li.z").length === 14 && again.$$(".medal.on").length === 0 && !!again.$(".radar") && again.$(".act-note").textContent.includes("перший стовпчик"));
again.w.dispatchEvent(new again.w.Event("hashchange"));
await sleep(50);
t("повторне перемальовування: вступні анімації не повторюються (клас again на .dash)", again.$(".dash")?.className.includes("again"));

/* ---- шлях ---- */
const jsN = LESSONS.js.length;
const g = await page({ me: user, hash: "#/path/js", done: { js: [1, 2, 3] } });
const nodes = g.$$(".path-node");
t("шлях: по вузлу на кожен урок курсу, глави як заголовки, пройдені відмічені, поточний це перший непройдений", nodes.length === jsN && g.$$(".path-chap").length === chaptersOf(LESSONS.js).length && g.$$(".path-node.done").length === 3 && g.$$(".path-node.current").length === 1 && nodes[3].className.includes("current"));
t("шлях: блокувань немає, кожен вузол це посилання на свій урок", g.$$(".pn-dot").every((a, i) => a.getAttribute("href") === `#/lesson/js/${i + 1}`) && !g.html().includes("disabled") && !g.html().includes("lock"));
t("шлях: поточний вузол має aria-current і підпис «Продовжити», кнопка веде на нього", g.$(".path-node.current .pn-dot").getAttribute("aria-current") === "step" && g.$(".path-here").textContent === "Продовжити" && !!g.$('.path-sum a.btn[href="#/lesson/js/4"]'));
t("шлях: вкладки курсів, активний позначено, без вибраного рівня пропонується його обрати", g.$$(".path-tab").length >= 13 && g.$(".path-tab[aria-current=page]").textContent.includes("JavaScript") && !!g.$('.path-head a[href="#/start"]'));
const withTask = TASKS.find((x) => x.course === "js");
t("шлях: у підписах практики немає емодзі блискавки", !g.$(".path").textContent.includes("⚡"));
t("шлях: після уроку із завданням є вузол практики", g.$$(".path-prac").length >= 1 && !!g.$(`.path-node:nth-of-type(1) ~ .path-node .path-prac, .path-prac[href="#/lesson/${withTask.lesson}"]`));
t("шлях: невідомий курс у адресі дає курс за замовчуванням, а не помилку", (await page({ me: user, hash: "#/path/nope" })).$$(".path-node").length > 0);
const lineEdges = g.$$(".path-line .e");
t("шлях: лінія з'єднує сусідні вузли, пройдені ділянки суцільні", g.$$(".path-line").length === 1 && lineEdges.length === jsN - 1 && g.$$(".path-line .e.done").length === 3);
t("шлях: лінія не накопичується при повторному рендері", (() => { g.w.dispatchEvent(new g.w.Event("hashchange")); return g.$$(".path-line").length === 1; })());
const chapCnt = g.$$(".path-chap .chap-cnt");
t("шлях: у кожної глави лічильник «пройдено/усього», завершена глава позначена", chapCnt.length === chaptersOf(LESSONS.js).length && chapCnt[0].textContent.includes("/") && g.$$(".path-chap")[0].className.includes("complete") === (chaptersOf(LESSONS.js)[0].to <= 3));
t("шлях: пункт «Шлях» є в основній навігації й підсвічується на цій сторінці", g.$$("#nav a").some((a) => a.textContent === "Шлях" && a.getAttribute("aria-current") === "page"));

const lv = await page({ me: user, dash: base, hash: "#/path/js", onboarding: { level: "intermediate", courses: ["js", "python"] } });
await sleep(120);
const startN = startLesson(LESSONS.js, "intermediate");
t("шлях (вхід): рівень завантажується один раз і перемальовує сторінку, позначено «Ваш старт»", lv.calls.filter((c) => c.url === "/api/onboarding" && c.method === "GET").length === 1 && lv.$$(".path-chap.start").length === 1 && lv.$(".path-chap.start .flag").textContent === "Ваш старт" && lv.html().includes("Середній"));
t("шлях: без прогресу поточний урок це стартова глава рівня, попередні уроки позначені «before», але відкриті", lv.$(".path-node.current .pn-dot").getAttribute("href") === `#/lesson/js/${startN}` && startN > 1 && lv.$$(".path-node.before").length === startN - 1 && lv.$$(".path-node.before .pn-dot").every((a) => a.getAttribute("href")));
t("шлях: курси онбордингу йдуть першими зі зірочкою", lv.$$(".path-tab")[0].textContent.includes("★ JavaScript") && lv.$$(".path-tab")[1].textContent.includes("★ Python"));

/* ---- XP-ефекти ---- */
const fx = await page({ me: user, dash: { ...base, onboarding: { level: "beginner", courses: ["js"] }, xp: 0 }, syncReply: { xp: 20, gained: [{ amount: 10 }, { amount: 10 }], level: 1, prevLevel: 1, leveledUp: false } });
for (let i = 0; i < 3; i++) fx.w.document.dispatchEvent(new fx.w.Event("ic:progress"));
await sleep(600);
t("XP: серія подій прогресу зводиться в один запит синхронізації, показано «+20 XP», кабінет оновлено", posted(fx, "/api/xp/sync").length === 1 && fx.$(".xp-pop")?.textContent === "+20 XP" && fx.calls.filter((c) => c.url === "/api/dashboard").length === 2);
const lu = await page({ me: user, dash: { ...base, onboarding: { level: "beginner", courses: ["js"] } }, syncReply: { xp: 70, gained: [{ amount: 70 }], level: 2, prevLevel: 1, leveledUp: true } });
lu.w.document.dispatchEvent(new lu.w.Event("ic:progress"));
await sleep(600);
t("підвищення рівня: діалог з новим рівнем, фокус на кнопці", lu.$(".lvl-up")?.getAttribute("role") === "dialog" && lu.$(".lvl-up-badge").textContent === "2" && lu.w.document.activeElement === lu.$(".lvl-up button"));
lu.w.document.dispatchEvent(new lu.w.KeyboardEvent("keydown", { key: "Tab", cancelable: true }));
t("підвищення рівня: Tab не виводить фокус із діалогу", lu.w.document.activeElement === lu.$(".lvl-up button"));
lu.w.document.dispatchEvent(new lu.w.KeyboardEvent("keydown", { key: "Escape" }));
t("підвищення рівня: Esc закриває діалог", lu.$(".lvl-up") === null);
const gu = await page({ me: null, hash: "#/course/js" });
gu.w.document.dispatchEvent(new gu.w.Event("ic:progress"));
await sleep(500);
t("XP: гість не викликає синхронізацію", posted(gu, "/api/xp/sync").length === 0);
const tog = await page({ me: user, hash: "#/course/js", syncReply: { xp: 10, gained: [{ amount: 10 }], level: 1, prevLevel: 1, leveledUp: false } });
tog.$("[data-toggle='js:1']").click();
await sleep(700);
t("XP: відмітка уроку пройденим на сервері тягне синхронізацію XP й показує «+10 XP»", posted(tog, "/api/progress").length >= 1 && posted(tog, "/api/xp/sync").length === 1 && tog.$(".xp-pop")?.textContent === "+10 XP");

const maxXp = Math.max(...TASKS.map((x) => x.xp), ...PROJECTS.map((x) => x.xp));
const hint = (await page({ me: user, dash: { ...base, onboarding: { level: "beginner", courses: ["js"] }, xp: 0 } })).$(".lvl-hint").textContent;
t("рівень: підказка про XP береться з констант і завдань, а не з тексту", hint.includes(`+${LESSON_XP} XP`) && hint.includes(`до +${maxXp} XP`));
const css = readFileSync(new URL("../src/stage2.css", import.meta.url), "utf8");
t("шлях на телефоні (до 600 px): вузли колонкою, без зигзага й без позиціювання підписів збоку", /max-width:600px\)\{[^]*\.path \.path-node\{display:grid;grid-template-columns:58px[^}]*transform:none/.test(css) && /\.path \.pn-side[^{]*\{position:static/.test(css));
t("мобільна версія: є правила для 480 і 390 px, довгі назви переносяться", css.includes("max-width:480px") && css.includes("max-width:390px") && /\.path-prac\{[^}]*overflow-wrap:anywhere/.test(css));

/* ---- гості: без «Шляху» в шапці й на сторінці ---- */
const navPath = (p) => p.$$("#nav a").find((a) => a.textContent === "Шлях");
const gh = await page({ me: null, hash: "#/" });
t("гість: пункт «Шлях» у шапці прихований", !!navPath(gh) && navPath(gh).hidden === true);
const uh = await page({ me: user, hash: "#/" });
t("зареєстрований: пункт «Шлях» у шапці видно", !!navPath(uh) && navPath(uh).hidden === false);
for (const h of ["#/path", "#/path/js"]) {
  const gp = await page({ me: null, hash: h });
  t(`гість: ${h} не показує шлях, а відкриває форму входу`, gp.w.location.hash === "#/login" && gp.$$(".path-node").length === 0 && !!gp.$("#af"));
}

console.log(`\nПройдено перевірок Етапу 2 (інтерфейс): ${ok}`);
