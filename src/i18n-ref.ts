// Розділи довідника для поточної мови: українські з data/reference/*, англійські будуються з них словниками з i18n-ref-data.ts.
// Структура (розділи, приклади, код) однакова в обох мовах, перекладається лише текст: заголовки, пояснення й українські слова всередині коду.
import { REF, type RefSection } from "./data/reference/index.ts";
import { getLang } from "./i18n.ts";
import { NOTES_EN, RUNS_EN, TITLES_EN } from "./i18n-ref-data.ts";

const CY = "А-ЯІЇЄҐа-яіїєґ";
/** Українське слово або фраза всередині рядка коду (слова, розділені пробілами й розділовими знаками) */
export const RUN_RE = new RegExp(`[${CY}][${CY}'’]*(?:[ ,.!?:\\-]+[${CY}][${CY}'’]*)*`, "g");

const own = (o: Readonly<Record<string, string>>, k: string): string => (Object.prototype.hasOwnProperty.call(o, k) ? o[k] : k);
const cache = new Map<string, readonly RefSection[]>();

function toEn(secs: readonly RefSection[]): RefSection[] {
  return secs.map((s) => ({
    t: own(TITLES_EN, s.t),
    items: s.items.map((x) => ({ t: own(TITLES_EN, x.t), ...(x.note ? { note: own(NOTES_EN, x.note) } : {}), code: x.code.replace(RUN_RE, (m) => own(RUNS_EN, m)) })),
  }));
}

export function refSections(k: string): readonly RefSection[] {
  const uk = REF[k] ?? [];
  if (getLang() !== "en") return uk;
  let en = cache.get(k);
  if (!en) { en = toEn(uk); cache.set(k, en); }
  return en;
}
