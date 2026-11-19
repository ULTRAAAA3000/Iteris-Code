// Перемикач рівня курсу «Базовий / Просунутий» (поки лише Go): розмітка, збереження на сервері, прогрес за рівнем
import { C, hasLevels, inLevel, levelOf, levelTotal, setLevelLocal } from "./data.ts";
import type { CourseLevel } from "./data.ts";
import { done } from "./progress.ts";
import { escA } from "./util.ts";

/** Пройдено уроків у поточному рівні курсу */
export const levelProgress = (k: string): number => (done[k] || []).filter((n) => inLevel(k, n)).length;

/** Номери уроків поточного рівня за порядком */
export const levelLessons = (k: string): number[] => C[k].L.map((_, i) => i + 1).filter((n) => inLevel(k, n));

/** Наступний урок поточного рівня після n (0, якщо n останній) */
export const nextInLevel = (k: string, n: number): number => { for (let i = n + 1; i <= C[k].L.length; i++) if (inLevel(k, i)) return i; return 0; };
export const prevInLevel = (k: string, n: number): number => { for (let i = n - 1; i >= 1; i--) if (inLevel(k, i)) return i; return 0; };

/** Розмітка перемикача; порожня для курсів без рівнів */
export function levelSwitch(k: string): string {
  if (!hasLevels(k)) return "";
  const cur = levelOf(k), b = levelTotal(k, "base"), a = levelTotal(k, "adv");
  const opt = (v: CourseLevel, name: string, n: number, hint: string): string =>
    `<button type="button" class="lv-opt" role="radio" aria-checked="${cur === v}" data-level="${v}" data-course="${escA(k)}"${cur === v ? ' aria-current="true"' : ""}><b>${name}</b><span>${n} уроків · ${hint}</span></button>`;
  return `<div class="lv-switch" role="radiogroup" aria-label="Рівень курсу">${opt("base", "Базовий", b, "основа мови й практика")}${opt("adv", "Просунутий", a, "плюс просунуті теми")}</div>
    <p class="lv-note dash-muted">Рівень можна змінити будь-коли: пройдені уроки й номери не зміняться.</p>`;
}

/** Зберігає рівень: одразу оновлює інтерфейс, на сервер відправляє у фоні (помилка мережі не блокує навчання) */
export async function chooseLevel(k: string, v: CourseLevel, rerender: () => void): Promise<void> {
  if (!hasLevels(k)) return;
  setLevelLocal(k, v);
  rerender();
  try {
    await fetch("/api/level", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ course: k, level: v }) });
  } catch { /* рівень залишиться локально до наступного входу */ }
}
