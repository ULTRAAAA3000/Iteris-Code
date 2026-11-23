// Адреси сторінок: звичайні шляхи (/ref/js, /courses, /dashboard) через History API.
// Старі адреси з решіткою (#/lesson/js/3) і далі відкриваються: при завантаженні вони перетворюються на шляхи.
import { leave, onDashHost, onRootHost, resolveTarget } from "./domains.ts";
import { splitLang } from "./i18n.ts";
import { ui } from "./ui.ts";

/** Частини адреси без крайніх скісних рисок і без .html: "ref/js", "courses", "" для головної */
export const pathOf = (): string => {
  const p = splitLang(location.pathname).path.replace(/\.html$/, "").replace(/^\/+|\/+$/g, "");   // /en/courses → courses
  return p === "" && onDashHost() ? "dashboard" : p;   // на кабінетному піддомені головна сторінка «/» і є кабінетом
};

/** Сегменти поточної адреси: ["ref", "js"] */
export const segments = (): string[] => pathOf().split("/");

/** Старий адрес вигляду "#/ref/js" → "/ref/js"; для інших решіток (наприклад "#s2") повертає null */
const fromLegacy = (hash: string): string | null => (/^#\//.test(hash) ? hash.slice(1).replace(/\/+$/, "") || "/" : null);

/** Замінює старий адрес із решіткою на звичайний, не додаючи запис в історію. true, якщо щось змінилось */
export function normalizeLegacy(): boolean {
  const to = fromLegacy(location.hash);
  if (!to) return false;
  history.replaceState(null, "", to + location.search);
  return true;
}

/** Адреса, відкрита напряму не на «своєму» домені (закладка, старе посилання): /dashboard на основному домені → кабінет, чужа сторінка на кабінетному → основний домен.
 *  Те саме робить скрипт у <head> до завантаження застосунку; тут запасний варіант */
function normalizeHost(): void {
  const path = location.pathname, full = path + location.search + location.hash;
  if (onRootHost() && /^\/dashboard(\/|$)/.test(path)) {
    const t = resolveTarget(full);
    if ("external" in t) leave(t.external, true);
  } else if (onDashHost() && path !== "/") {
    const t = resolveTarget(full);
    if ("external" in t) leave(t.external, true);          // чужа сторінка → основний домен
    else history.replaceState(null, "", t.local);               // /dashboard → /
  }
}

/** Перехід на іншу сторінку без перезавантаження: адреса в історії браузера й перемальовка */
export function navigate(to: string, replace = false): void {
  const t = resolveTarget(to);
  if ("external" in t) { leave(t.external, replace); return; }
  to = t.local;
  const same = to === location.pathname + location.search;
  if (replace || same) history.replaceState(null, "", to); else history.pushState(null, "", to);
  ui.render();
}

/** Внутрішнє посилання, яке треба обробити самим (а не віддавати браузеру) */
function internalHref(a: HTMLAnchorElement): string | null {
  const href = a.getAttribute("href");
  if (!href || !href.startsWith("/") || href.startsWith("//")) return null;
  if (a.target && a.target !== "_self") return null;
  if (a.hasAttribute("download") || href.startsWith("/api/")) return null;
  return href;
}

/** Підключає кнопки «назад/вперед», старі адреси з решіткою й внутрішні посилання. Викликається один раз */
export function initRouter(): void {
  normalizeLegacy();
  normalizeHost();
  window.addEventListener("popstate", () => ui.render());
  window.addEventListener("hashchange", () => { if (normalizeLegacy()) { normalizeHost(); ui.render(); } });
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
    const to = a && internalHref(a);
    if (!to) return;
    e.preventDefault();
    navigate(to);
  });
}
