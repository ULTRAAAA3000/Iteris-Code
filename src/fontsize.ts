// Розмір тексту уроку: чотири кроки (A− / A+), вибір зберігається в браузері. Змінює лише змінну --l-fs, яку читає src/lesson.css.
import { store } from "./util.ts";

export const FONT_STEPS = [0.9, 1, 1.12, 1.25] as const;
const KEY = "ic-fs";

export function fontStep(): number {
  const v = store.get<number>(KEY, 1);
  return Number.isInteger(v) && v >= 0 && v < FONT_STEPS.length ? v : 1;
}

/** Застосовує збережений розмір і вимикає кнопки на краях діапазону. Викликається після кожного рендеру сторінки */
export function applyFontStep(): void {
  const n = fontStep();
  document.documentElement.style.setProperty("--l-fs", String(FONT_STEPS[n]));
  document.querySelectorAll<HTMLButtonElement>("[data-fs]").forEach((b) => { b.disabled = b.dataset.fs === "1" ? n >= FONT_STEPS.length - 1 : n <= 0; });
}

export function stepFont(dir: 1 | -1): void {
  store.set(KEY, Math.min(FONT_STEPS.length - 1, Math.max(0, fontStep() + dir)));
  applyFontStep();
}
