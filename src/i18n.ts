// Мови сайту: українська (за замовчуванням, адреси без префікса) та англійська (/en/...).
// Модуль чистий (без DOM), тому ним користуються і браузер, і збірка для пошуковиків.
// Текст перекладається прямо в коді через tr(укр, англ): обидві версії лежать поруч, тому їх легко тримати в узгодженому стані.
// Тест tests/i18n.test.mjs перевіряє, що в англійській версії публічних сторінок не лишилось кирилиці й структура збігається з українською.
export type Lang = "uk" | "en";
export const LANGS: readonly Lang[] = ["uk", "en"];
/** Мова за замовчуванням: сторінки без префікса. Щоб зробити англійську основною (D25), змініть тут і перенесіть префікс на українську */
export const DEFAULT_LANG: Lang = "uk";
export const isLang = (v: unknown): v is Lang => v === "uk" || v === "en";

const PREFIX: Record<Lang, string> = { uk: "", en: "/en" };
export const HTML_LANG: Record<Lang, string> = { uk: "uk", en: "en" };
export const OG_LOCALE: Record<Lang, string> = { uk: "uk_UA", en: "en_US" };
export const LANG_NAME: Record<Lang, string> = { uk: "Українська", en: "English" };
export const LANG_SHORT: Record<Lang, string> = { uk: "UA", en: "EN" };

let cur: Lang = DEFAULT_LANG;
export const getLang = (): Lang => cur;
export const setLang = (l: Lang): void => { cur = l; };
/** Виконує функцію в потрібній мові й повертає попередню: так збірка малює сторінки обох мов поспіль */
export function inLang<T>(lang: Lang, fn: () => T): T {
  const prev = cur;
  cur = lang;
  try { return fn(); } finally { cur = prev; }
}
/** Текст для поточної мови: tr("Курси", "Courses") */
export const tr = <T>(uk: T, en: T): T => (cur === "en" ? en : uk);

/* ---------- Адреси ---------- */

/** Розділяє адресу на мову з префікса й шлях без нього: "/en/courses" → { lang: "en", path: "/courses" }; без префікса lang = null */
export function splitLang(pathname: string): { lang: Lang | null; path: string } {
  const m = /^\/en(?=\/|$)/.exec(pathname);
  if (!m) return { lang: null, path: pathname || "/" };
  return { lang: "en", path: pathname.slice(3) || "/" };
}

let isPublic: (path: string) => boolean = () => false;
/** pages.ts повідомляє, які адреси мають переклад: префікс додається лише їм (кабінет, уроки й форми входу мають одну адресу на всі мови) */
export const setPublicMatcher = (fn: (path: string) => boolean): void => { isPublic = fn; };

/** Адреса сторінки для мови: "/courses" → "/en/courses"; для не публічних адрес і мови за замовчуванням без змін. Рядок запиту й решітка зберігаються */
export function withLang(href: string, lang: Lang = cur): string {
  if (lang === DEFAULT_LANG || !href.startsWith("/") || href.startsWith("//")) return href;
  const m = /^[^?#]*/.exec(href) as RegExpExecArray, path = m[0], rest = href.slice(path.length);
  if (!isPublic(path.replace(/\.html$/, "") || "/")) return href;
  return (path === "/" ? "/en/" : PREFIX[lang] + path) + rest;
}
export const l = (href: string): string => withLang(href);

/* ---------- Лічильники з відмінками ---------- */

const EN_W = { lesson: ["lesson", "lessons"], task: ["task", "tasks"], course: ["course", "courses"], ref: ["reference", "references"], section: ["section", "sections"] } as const;
const UK_W = { lesson: ["урок", "уроки", "уроків"], task: ["завдання", "завдання", "завдань"], course: ["курс", "курси", "курсів"], ref: ["довідник", "довідники", "довідників"], section: ["розділ", "розділи", "розділів"] } as const;
const ukPl = (n: number, one: string, few: string, many: string): string => {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
};
/** "5 уроків" або "5 lessons" залежно від мови */
export const cnt = (n: number, key: keyof typeof EN_W): string =>
  cur === "en" ? `${n} ${n === 1 ? EN_W[key][0] : EN_W[key][1]}` : `${n} ${ukPl(n, UK_W[key][0], UK_W[key][1], UK_W[key][2])}`;
