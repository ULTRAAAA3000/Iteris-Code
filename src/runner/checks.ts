// Перевірка результату запуску за списком Check. Ті самі правила для будь-якої мови.
// Без залежностей від DOM: працює на сервері (functions/api/run.ts) і в Node-тестах.
import type { Check } from "../tasks/types.ts";
import type { TestResult } from "./core.ts";

/** Що повертає запуск програми в пісочниці */
export interface RunOutput {
  stdout: string;
  stderr: string;
  /** Помилка компіляції або запуску (текст компілятора); якщо є, програма не виконалась */
  error?: string;
  timedOut?: boolean;
  /** Код завершення програми; не нуль = аварія (panic, виняток) */
  exitCode?: number;
}

/** Вивід без кінцевих пробілів у рядках і порожніх рядків наприкінці: «Привіт \n\n» == «Привіт» */
export const normalize = (s: string): string => s.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");

const clip = (s: string, n = 160): string => (s.length > n ? s.slice(0, n) + "…" : s);
const show = (s: string): string => (s === "" ? "(порожньо)" : clip(s).replace(/\n/g, "⏎"));

function regex(pattern: string): RegExp | null {
  try { return new RegExp(pattern, "s"); } catch { return null; }
}

export function evalCheck(c: Check, source: string, out: RunOutput): TestResult {
  const target = c.on === "stdout" ? normalize(out.stdout) : source;
  let ok: boolean;
  let detail = "";
  if (c.equals !== undefined) {
    const want = c.on === "stdout" ? normalize(c.equals) : c.equals;
    ok = target === want;
    if (!ok && c.on === "stdout" && !c.not) detail = `очікувалось: ${show(want)}\n    отримано:   ${show(target)}`;
  } else if (c.has !== undefined) {
    ok = target.includes(c.has);
    if (!ok && c.on === "stdout" && !c.not) detail = `у виводі немає «${clip(c.has, 80)}»`;
  } else if (c.matches !== undefined) {
    const re = regex(c.matches);
    ok = !!re && re.test(target);
  } else {
    ok = false;
    detail = "перевірку описано неправильно";
  }
  if (c.not) ok = !ok;
  if (!ok && c.on === "source" && !detail) detail = "у коді не знайдено потрібної конструкції";
  if (!ok && c.hint) detail = detail ? `${detail}\n    ${c.hint}` : c.hint;
  return ok ? { name: c.name, passed: true } : { name: c.name, passed: false, error: detail || "не виконано" };
}

export const evalChecks = (checks: readonly Check[], source: string, out: RunOutput): TestResult[] => checks.map((c) => evalCheck(c, source, out));
