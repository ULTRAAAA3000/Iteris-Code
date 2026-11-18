// Клієнт «віддаленого» запуску: код завдання (Go та інші мови) надсилається на сервер, він запускає його в пісочниці
// й сам перевіряє результат. Відповідь має ту саму форму, що й запуск JS у воркері, плюс вивід програми.
import type { RunOutcome } from "./client.ts";

export interface RemoteOutcome extends RunOutcome {
  /** Усе, що програма вивела в stdout */
  stdout: string;
  /** Повідомлення про помилки виконання (traceback, panic): показуються в терміналі окремим блоком */
  stderr: string;
  /** Усі перевірки пройдено (рішення сервера) */
  passed: boolean;
  /** Підпис сервера, потрібний, щоб зберегти результат (лише для користувача, що увійшов) */
  proof?: string;
}

interface Reply { passed?: boolean; results?: RunOutcome["results"]; stdout?: string; stderr?: string; error?: string | null; timedOut?: boolean; proof?: string }

const fail = (error: string): RemoteOutcome => ({ results: [], stdout: "", stderr: "", passed: false, error });

export async function runRemote(taskId: string, code: string, timeoutMs = 25000, url = "/api/run"): Promise<RemoteOutcome> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, code }), signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return fail("Немає зв'язку з сервером запуску. Перевірте інтернет і спробуйте ще раз.");
  }
  let data: Reply = {};
  try { data = (await res.json()) as Reply; } catch { /* порожня відповідь */ }
  if (res.status === 429) return fail("Забагато запусків поспіль. Зачекайте хвилину й спробуйте знову.");
  if (res.status === 503) return fail("Сервіс запуску тимчасово недоступний. Спробуйте за хвилину.");
  if (res.status === 402) return fail("Це завдання входить до підписки Pro");
  if (!res.ok) return fail("Не вдалося запустити код (помилка " + res.status + "). Спробуйте ще раз.");
  return { results: data.results ?? [], stdout: data.stdout ?? "", stderr: data.stderr ?? "", passed: !!data.passed, error: data.error ?? undefined, timedOut: !!data.timedOut, proof: data.proof };
}
