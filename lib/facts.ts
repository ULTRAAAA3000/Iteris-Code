// Плашка «Цікавий факт»: раз на 5 годин новий факт або підказка про напрямок, який людина обрала в кабінеті.
// Стану на сервері немає: факт визначається часом і користувачем, тож він однаковий на всіх пристроях.
import { FACTS } from "../content/facts.ts";
import type { DailyFact } from "../src/types.ts";

export const FACT_PERIOD_MS = 5 * 60 * 60 * 1000;

interface Entry { kind: "fact" | "tip"; text: string }

const fnv = (s: string): number => {   // простий хеш рядка (FNV-1a), щоб в різних людей порядок був різний
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ (ch.codePointAt(0) ?? 0), 16777619) >>> 0;
  return h;
};
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

const pools = new Map<string, Entry[]>();
/** Усі записи напрямку: після кожних трьох фактів іде підказка */
export function pool(lang: string): Entry[] {
  const cached = pools.get(lang);
  if (cached) return cached;
  const set = FACTS[lang] ?? FACTS.general;
  const out: Entry[] = [];
  let t = 0;
  set.f.forEach((text, i) => {
    out.push({ kind: "fact", text });
    if ((i + 1) % 3 === 0 && t < set.t.length) out.push({ kind: "tip", text: set.t[t++] });
  });
  while (t < set.t.length) out.push({ kind: "tip", text: set.t[t++] });
  pools.set(lang, out);
  return out;
}

/** Напрямки, для яких є факти (без дублікатів, у порядку вибору); якщо жодного, то загальні факти */
export const factLangs = (courses: readonly string[] | null | undefined): string[] => {
  const own = [...new Set(courses ?? [])].filter((c) => c !== "general" && Object.hasOwn(FACTS, c));
  return own.length ? own : ["general"];
};

/** Факт для людини в момент `now` (мс). Напрямки чергуються, а в межах напрямку записи не повторюються, доки не покажемо всі */
export function factFor(userId: string, courses: readonly string[] | null | undefined, now: number): DailyFact {
  const slot = Math.floor(now / FACT_PERIOD_MS);
  const langs = factLangs(courses);
  const lang = langs[slot % langs.length];
  const turn = Math.floor(slot / langs.length);   // котрий раз показуємо цей напрямок
  const p = pool(lang), n = p.length;
  let stride = 1 + (fnv(lang + "|" + userId) % Math.max(1, n - 1));
  while (gcd(stride, n) !== 1) stride++;          // крок взаємно простий з n: за n показів пройдемо всі записи рівно по разу
  const e = p[(fnv(userId + "|" + lang) + turn * stride) % n];
  return { id: String(slot), lang, kind: e.kind, text: e.text, nextAt: new Date((slot + 1) * FACT_PERIOD_MS).toISOString() };
}
