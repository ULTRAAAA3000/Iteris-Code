// Запуск проєкту за ТЗ на сервері: код користувача + прихований harness → один файл → зовнішня пісочниця → розбір рядків R<n> PASS|FAIL.
import { assemble } from "../content/projects/program-types.ts";

export interface Verdict { id: string; ok: boolean; msg: string }

/** Рядки harness вигляду «R3 PASS» / «R3 FAIL: причина»; решту виводу (друк користувача) повертаємо окремо */
export function parseVerdicts(stdout: string, ids: readonly string[]): { verdicts: Verdict[]; rest: string } {
  const seen = new Map<string, Verdict>(), rest: string[] = [];
  for (const line of stdout.split("\n")) {
    const m = /^(R\d+) (PASS|FAIL)(?:: (.*))?$/.exec(line);
    if (m && ids.includes(m[1])) { if (!seen.has(m[1])) seen.set(m[1], { id: m[1], ok: m[2] === "PASS", msg: m[3] ?? "" }); }
    else rest.push(line);
  }
  // Вимога без рядка у виводі (програма впала раніше, цикл, os.Exit) вважається невиконаною
  return { verdicts: ids.map((id) => seen.get(id) ?? { id, ok: false, msg: "перевірка не завершилась: програма зупинилась раніше" }), rest: rest.join("\n").trim() };
}

export const buildProgram = (harness: string, userCode: string): string => assemble({ harness }, userCode);
