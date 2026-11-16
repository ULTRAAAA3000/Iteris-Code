// Перевірка сторінок HTML/CSS: складання документа з коду користувача і перевірка його за списком PageCheck.
// Працює в браузері (iframe без скриптів) і в Node-тестах (jsdom): сам нічого не створює, лише читає передані Document і Window.
import type { PageCheck, PageTask } from "../tasks/types.ts";
import type { TestResult } from "./core.ts";

/** Повний HTML-документ для попереднього перегляду й перевірки */
export function buildPageDoc(task: PageTask, code: string): string {
  if (task.edit === "html") return code;
  return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${code}</style></head><body>${task.markup ?? ""}</body></html>`;
}

const norm = (s: string): string => s.replace(/\s+/g, " ").trim();
const clip = (s: string, n = 90): string => (s.length > n ? s.slice(0, n) + "…" : s);

/** Приводить значення CSS до єдиного вигляду, щоб hex, rgb() і ключові слова порівнювались однаково в браузері й jsdom */
export function normCss(prop: string, v: string): string {
  let x = v.trim().toLowerCase().replace(/\s+/g, " ");
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(x);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    return `rgb(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)})`;
  }
  const rgb = /^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/.exec(x);
  if (rgb) {
    const a = rgb[4];
    if (a === undefined || a === "1" || a === "100%") return `rgb(${rgb[1]}, ${rgb[2]}, ${rgb[3]})`;
    if (a === "0") return "rgba(0, 0, 0, 0)";
    return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${a})`;
  }
  if (x === "transparent") return "rgba(0, 0, 0, 0)";
  if (/^0(px)?$/.test(x)) return "0px";
  if (prop === "font-weight") { if (x === "bold") return "700"; if (x === "normal") return "400"; }
  return x;
}

function styleDiff(el: Element, style: Record<string, string>, win: Window): string[] {
  const cs = win.getComputedStyle(el);
  const bad: string[] = [];
  for (const [prop, want] of Object.entries(style)) {
    const got = cs.getPropertyValue(prop);
    if (normCss(prop, got) !== normCss(prop, want)) bad.push(`${prop}: потрібно ${want}, зараз ${got === "" ? "не задано" : got}`);
  }
  return bad;
}

function attrOk(el: Element, a: NonNullable<PageCheck["attr"]>): boolean {
  const v = el.getAttribute(a.name);
  if (v === null) return false;
  if (a.equals !== undefined) return v === a.equals;
  if (a.has !== undefined) return v.includes(a.has);
  if (a.matches !== undefined) { try { return new RegExp(a.matches, "s").test(v); } catch { return false; } }
  return true;
}

function sourceOk(s: NonNullable<PageCheck["source"]>, source: string): boolean {
  if (s.has !== undefined) return source.includes(s.has);
  if (s.matches !== undefined) { try { return new RegExp(s.matches, "s").test(source); } catch { return false; } }
  return false;
}

export function evalPageCheck(c: PageCheck, doc: Document, win: Window, source: string): TestResult {
  let ok = true;
  let detail = "";
  if (c.selector !== undefined) {
    let els: Element[];
    try { els = Array.from(doc.querySelectorAll(c.selector)); } catch { return { name: c.name, passed: false, error: "перевірку описано неправильно (селектор)" }; }
    const found = els.length;
    const first = els[0];
    if (c.text !== undefined) { const t = norm(c.text); els = els.filter((e) => norm(e.textContent ?? "").includes(t)); }
    if (c.attr) { const a = c.attr; els = els.filter((e) => attrOk(e, a)); }
    let styleNote = "";
    if (c.style) {
      const st = c.style;
      const before = els[0] ?? first;
      els = els.filter((e) => styleDiff(e, st, win).length === 0);
      if (before && els.length === 0) styleNote = styleDiff(before, st, win).join("; ");
    }
    const n = els.length;
    const min = typeof c.count === "number" ? c.count : c.count ? c.count.min ?? 0 : 1;
    const max = typeof c.count === "number" ? c.count : c.count?.max ?? Infinity;
    ok = n >= min && n <= max;
    if (!ok && !c.not) {
      if (found === 0) detail = `елемент «${c.selector}» не знайдено`;
      else if (n === 0 && styleNote) detail = styleNote;
      else if (n === 0 && c.text !== undefined) detail = `у «${c.selector}» немає тексту «${clip(c.text, 50)}»`;
      else if (n === 0 && c.attr) detail = `у «${c.selector}» немає потрібного атрибута ${c.attr.name}`;
      else detail = `знайдено ${n}, потрібно ${typeof c.count === "number" ? c.count : c.count ? `від ${min}${max === Infinity ? "" : " до " + max}` : "щонайменше 1"}`;
    }
  }
  if (ok && c.source) {
    ok = sourceOk(c.source, source);
    if (!ok && !c.not) detail = "у коді не знайдено потрібної конструкції";
  }
  if (c.not) ok = !ok;
  if (!ok && c.hint) detail = detail ? `${detail}\n    ${c.hint}` : c.hint;
  return ok ? { name: c.name, passed: true } : { name: c.name, passed: false, error: detail || "не виконано" };
}

export const evalPageChecks = (checks: readonly PageCheck[], doc: Document, win: Window, source: string): TestResult[] => checks.map((c) => evalPageCheck(c, doc, win, source));

/** Записує документ в iframe (той самий origin, sandbox без скриптів) і повертає його Document та Window */
export function renderInFrame(frame: HTMLIFrameElement, html: string): { doc: Document; win: Window } | null {
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) return null;
  doc.open();
  doc.write(html);
  doc.close();
  return { doc, win };
}
