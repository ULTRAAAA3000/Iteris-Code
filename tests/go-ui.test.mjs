// Екран практичного завдання Go в інтерфейсі (jsdom): редактор, запуск на сервері, термінал, перемога.
// Запуск: npm run build && npm i --no-save jsdom && node tests/go-ui.test.mjs
import { readFileSync, readdirSync } from "node:fs";
import { contentReply } from "./content-mock.mjs";

let JSDOM;
try { ({ JSDOM } = await import("jsdom")); } catch { console.log("Потрібен jsdom: npm i --no-save jsdom"); process.exit(1); }

const appFile = readdirSync(new URL("../dist/", import.meta.url)).find((f) => /^main-.*\.js$/.test(f));
const bundle = readFileSync(new URL("../dist/" + appFile, import.meta.url), "utf8");
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").replace(/<script src="[^"]+"><\/script>/g, "").replace(/<script>[\s\S]*?<\/script>/g, (m) => (m.includes("__IC_WORKER__") ? "" : m));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const user = { id: "g1", email: "o@x.ua", name: "Олена", avatarUrl: null, isPro: false, proUntil: null, streak: 1 };

async function page({ me = user, runReply, status = 200 } = {}) {
  const calls = [];
  const dom = new JSDOM(html, { url: "https://iteris-code.pages.dev/#/lesson/go/1", runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window;
  w.__IC_PLAIN_EDITOR = true;
  const reply = (st, body) => ({ ok: st < 400, status: st, json: async () => body });
  w.fetch = async (url, o = {}) => {
    calls.push({ url, body: o.body ? JSON.parse(o.body) : null });
    if (url === "/api/me") return reply(200, { user: me });
    const cr = contentReply(url, me);
    if (cr) return reply(cr[0], cr[1]);
    if (url === "/api/auth/config") return reply(200, { clientId: null, turnstileSiteKey: null, mail: false });
    if (url === "/api/run") return reply(status, typeof runReply === "function" ? runReply() : runReply);
    if (url === "/api/progress/complete") return reply(200, { ok: true, streak: 2, firstSolve: true, xp: 15 });
    if (url === "/api/progress") return reply(200, { lessonIds: [] });
    return reply(404, {});
  };
  try { Object.defineProperty(w, "crypto", { value: globalThis.crypto, configurable: true }); } catch {}
  w.eval(bundle);
  await sleep(80);
  const $ = (s) => w.document.querySelector(s);
  return { w, calls, $, term: () => $("#ws-term").textContent, run: async () => { $("[data-ws=run]").click(); await sleep(150); } };
}

let ok = 0;
const t = (name, cond) => { if (!cond) { console.log("FAIL -", name); process.exitCode = 1; } else { ok++; console.log("ok  -", name); } };
const base = await page();
t("урок Go: показано редактор з файлом main.go і кнопку «Запустити»", base.$(".ws-tab")?.textContent === "main.go" && base.$("#ws-run")?.textContent === "▶ Запустити");
t("у редакторі заготовка Go, а не JS", base.$(".ws-plain")?.value.startsWith("package main"));
t("до запуску в терміналі пояснення про сервер", base.term().includes("на сервері"));

const failing = await page({ runReply: { passed: false, stdout: "Привіт!\n", results: [{ name: "Виводить «Привіт, Go!»", passed: false, error: "у виводі немає «Привіт, Go!»" }] } });
await failing.run();
t("невдалий запуск: вивід програми і ✗ у терміналі", failing.term().includes("Вивід програми:") && failing.term().includes("Привіт!") && failing.term().includes("✗") && failing.term().includes("Пройдено 0 з 1"));
t("надіслано на сервер id завдання й код", failing.calls.find((c) => c.url === "/api/run")?.body?.taskId === "go-hello-module");
t("невдача: вікна перемоги немає", !failing.$(".ws-win") && !failing.$(".ws-term-ok"));

const compile = await page({ runReply: { passed: false, stdout: "", results: [], error: "main.go:6:2: undefined: x" } });
await compile.run();
t("помилка компіляції показується в терміналі", compile.term().includes("main.go:6:2: undefined: x"));

const win = (me) => ({ me, runReply: { passed: true, stdout: "Привіт, Go!\n", proof: "p.sig", results: [{ name: "Виводить «Привіт, Go!»", passed: true }] } });
const guest = await page({ me: null });
t("гість: урок Go закритий, редактора немає, запити за уроком не йдуть", !!guest.$('[data-act="login"]') && !guest.$(".ws-plain") && !guest.calls.some((c) => c.url.startsWith("/api/lesson") || c.url === "/api/run"));

const member = await page(win(user));
await member.run();
const done = member.calls.find((c) => c.url === "/api/progress/complete");
t("користувач: разом із кодом передається підпис сервера", done?.body?.proof === "p.sig" && done.body.taskId === "go-hello-module");
t("користувач: показано +XP і серію", member.$(".ws-win")?.textContent.includes("+15 XP") && member.$(".ws-term-ok") && member.$(".ws-win .confetti i"));

const limited = await page({ runReply: {}, status: 429 });
await limited.run();
t("ліміт запусків: зрозуміле повідомлення", limited.term().includes("Забагато запусків"));
const down = await page({ runReply: {}, status: 503 });
await down.run();
t("сервіс недоступний: повідомлення, кнопка знову активна", down.term().includes("тимчасово недоступний") && !down.$("#ws-run").disabled);

console.log(`\nПройдено перевірок Go (інтерфейс): ${ok}`);
