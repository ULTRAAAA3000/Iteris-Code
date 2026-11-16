// Перевірка проєктів за ТЗ без ШІ: сторінка користувача запускається в ізольованому iframe (sandbox без allow-same-origin),
// до неї дописується скрипт перевірки: він виконує вимоги й надсилає звіт батьківській сторінці через postMessage.
// Це чисті функції без DOM, тому їх можна запускати й тестувати в Node.
import type { Requirement } from "./types.ts";

export interface CheckResult { id: string; ok: boolean; msg?: string }
export interface Report { results: CheckResult[]; error?: string; timedOut?: boolean }
export interface Score { passed: number; total: number; all: boolean; items: { req: Requirement; ok: boolean; msg: string }[] }

/** Тип повідомлення зі звітом */
export const REPORT_TYPE = "ic-project-report";

// Допоміжні функції для вимог: $ $$ text css click type press wait. Кожна вимога виконується окремо, з таймаутом.
const CHECKER = `(function () {
  var NONCE = __NONCE__, CHECKS = __CHECKS__, TYPE = __TYPE__;
  var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 0); }); };
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var text = function (el) { return el ? (el.textContent || "").trim() : ""; };
  var css = function (el, p) { return el ? getComputedStyle(el)[p] : ""; };
  var need = function (el, what) { if (!el) throw new Error("Не знайдено " + what); return el; };
  var click = function (el) { need(el, "елемент для кліку"); el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window })); return wait(10); };
  var type = function (el, v) { need(el, "поле вводу"); el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); };
  var press = function (el, key) {
    need(el, "елемент для натискання клавіші");
    ["keydown", "keypress", "keyup"].forEach(function (t) { el.dispatchEvent(new KeyboardEvent(t, { key: key, bubbles: true, cancelable: true })); });
    return wait(10);
  };
  var race = function (p, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error("Перевірка не завершилась за " + ms + " мс")); }, ms);
      p.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  };
  async function runAll() {
    var out = [];
    for (var i = 0; i < CHECKS.length; i++) {
      var c = CHECKS[i];
      try {
        var fn = new AsyncFunction("$", "$$", "text", "css", "click", "type", "press", "wait", c.body);
        var r = await race(fn($, $$, text, css, click, type, press, wait), 1500);
        out.push(r === true ? { id: c.id, ok: true } : { id: c.id, ok: false, msg: typeof r === "string" ? r : "" });
      } catch (e) {
        out.push({ id: c.id, ok: false, msg: String((e && e.message) || e) });
      }
    }
    return out;
  }
  function send(m) { m.type = TYPE; m.nonce = NONCE; parent.postMessage(m, "*"); }
  function start() { runAll().then(function (r) { send({ results: r }); }, function (e) { send({ results: [], error: String(e) }); }); }
  if (document.readyState === "complete") setTimeout(start, 30); else addEventListener("load", function () { setTimeout(start, 30); });
})();`;

/** Сторінка користувача + скрипт перевірки: готовий документ для iframe.srcdoc */
export function buildSrcdoc(html: string, reqs: readonly Requirement[], nonce: string): string {
  // «<» екрануємо, щоб текст вимог не міг закрити тег script
  const checks = JSON.stringify(reqs.map((r) => ({ id: r.id, body: r.check }))).replace(/</g, "\\u003c");
  const script = CHECKER.replace("__NONCE__", () => JSON.stringify(nonce)).replace("__CHECKS__", () => checks).replace("__TYPE__", () => JSON.stringify(REPORT_TYPE));
  return html + "\n<script>" + script + "</script>";
}

/** Підсумок: скільки вимог виконано. Вимога без результату в звіті вважається невиконаною */
export function scoreReport(p: { requirements: readonly Requirement[] }, r: Report): Score {
  const byId = new Map(r.results.map((x) => [x.id, x]));
  const items = p.requirements.map((req) => {
    const x = byId.get(req.id);
    return { req, ok: x?.ok === true, msg: x?.ok ? "" : x?.msg ?? "" };
  });
  const passed = items.filter((i) => i.ok).length;
  return { passed, total: items.length, all: items.length > 0 && passed === items.length && !r.error, items };
}
