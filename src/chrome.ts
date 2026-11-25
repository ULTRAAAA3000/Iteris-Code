// «Рамка» сайту (шапка й підвал) лежить у index.template.html українською. Тут її переклад англійською, перемикач мови й локалізація посилань.
// Працює і в збірці (рядки HTML для готових сторінок), і в браузері (оновлення живої сторінки без перезавантаження).
import { DEFAULT_LANG, HTML_LANG, LANG_NAME, LANG_SHORT, LANGS, splitLang, withLang, type Lang } from "./i18n.ts";

/** Пари «українською, англійською» для тексту й атрибутів aria-label шапки та підвалу. Нова фраза в шаблоні потребує рядка тут (це перевіряє тест) */
export const CHROME_EN: readonly (readonly [string, string])[] = [
  ["Iteris Code — на головну", "Iteris Code — home"],
  ["Основна навігація", "Main navigation"],
  ["Курси", "Courses"], ["Шлях", "Path"], ["Як це працює", "How it works"], ["Про проєкт", "About"],
  ["Перемкнути тему", "Toggle theme"],
  ["Безкоштовна платформа для вивчення програмування українською. Довідник відкритий усім, уроки й завдання чекають у кабінеті.", "A free platform for learning to code. The reference is open to everyone, lessons and tasks are waiting in your account. Lessons are in Ukrainian for now."],
  ["13 мов", "13 languages"], ["Автоперевірка коду", "Automatic code checking"], ["XP і серія днів", "XP and day streaks"],
  ["Навчання", "Learning"], ["Усі курси", "All courses"], ["Шлях навчання", "Learning path"], ["Почати безкоштовно", "Start for free"],
  ["Напрями", "Categories"], ["Програмування", "Programming"], ["Web-технології", "Web technologies"], ["Серверна розробка", "Server-side development"],
  ["Бази даних", "Databases"], ["Інструменти", "Tools"],
  ["Довідники", "References"], ["Проєкт", "Project"], ["Що нового", "What's new"], ["Підтримка", "Support"],
  ["Для роботи сайту потрібен JavaScript.", "This site needs JavaScript to work."],
  ["Конфіденційність", "Privacy"], ["Умови користування", "Terms of use"], ["Вхід", "Sign in"], ["Особистий кабінет", "My account"],
];

/** Адреси поточної сторінки в обох мовах: для публічної сторінки різні, для кабінету й уроків однакові */
export type Alts = Record<Lang, string>;
export const altsFor = (path: string): Alts => ({ uk: withLang(path, "uk"), en: withLang(path, "en") });

const attr = (s: string): string => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/** Розмітка перемикача: два посилання, поточна мова позначена aria-current */
export function switcherHtml(lang: Lang, alts: Alts): string {
  return `<div class="lang" id="lang" role="group" aria-label="Мова / Language">${LANGS.map((l) =>
    `<a href="${attr(alts[l])}" hreflang="${l}" lang="${l}" data-lang="${l}" title="${LANG_NAME[l]}"${l === lang ? ' aria-current="true"' : ""}>${LANG_SHORT[l]}</a>`).join("")}</div>`;
}

/** Шаблон сторінки для мови (збірка): переклад тексту й атрибутів, префікс /en у посиланнях на публічні сторінки, <html lang>, перемикач */
export function chromeHtml(html: string, lang: Lang, alts: Alts): string {
  let out = html;
  if (lang !== DEFAULT_LANG) {
    for (const [uk, en] of CHROME_EN) out = out.split(`>${uk}<`).join(`>${en}<`).split(`="${uk}"`).join(`="${attr(en)}"`);
    out = out.replace(/href="(\/[^"]*)"/g, (_m, h: string) => `href="${withLang(h, lang)}"`).replace('<html lang="uk">', `<html lang="${HTML_LANG[lang]}">`);
  }
  return out.replace("<!--lang-->", () => switcherHtml(lang, alts));
}

/* ---------- Браузер: жива сторінка ---------- */

const UK = new Map(CHROME_EN), EN = new Map(CHROME_EN.map(([u, e]) => [e, u] as const));

/** Перекладає шапку й підвал на місці й виставляє мовні адреси посилань; викликається після кожної перемальовки сторінки */
export function applyChromeDom(lang: Lang, alts: Alts): void {
  document.documentElement.lang = HTML_LANG[lang];
  const map = lang === "en" ? UK : EN;           // шукаємо те, що треба замінити: для англійської шукаємо українські фрази, і навпаки
  for (const root of [document.querySelector("header.top"), document.querySelector("footer")]) {
    if (!root) continue;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = (n.nodeValue ?? "").trim(), to = map.get(t);
      if (to && !(n.parentElement?.closest("#lang"))) n.nodeValue = (n.nodeValue as string).replace(t, to);
    }
    root.querySelectorAll<HTMLElement>("[aria-label],[title]").forEach((el) => {
      if (el.closest("#lang")) return;
      for (const a of ["aria-label", "title"]) { const v = el.getAttribute(a), to = v && map.get(v); if (to) el.setAttribute(a, to); }
    });
    root.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((a) => {
      if (a.closest("#lang")) return;
      const h = a.getAttribute("href") as string;
      const bare = splitLang(h.replace(/[?#].*$/, "")).path + h.slice(h.replace(/[?#].*$/, "").length);
      a.setAttribute("href", withLang(bare, lang));
    });
  }
  const sw = document.getElementById("lang");
  if (sw) for (const l of LANGS) {
    const a = sw.querySelector<HTMLAnchorElement>(`[data-lang="${l}"]`);
    if (!a) continue;
    a.setAttribute("href", alts[l]);
    if (l === lang) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
  }
}
