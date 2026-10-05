// Запуск тестів у Web Worker із тайм-аутом (захист від нескінченних циклів).
import type { SuiteResult } from "./core.ts";

export interface RunOutcome extends SuiteResult {
  timedOut?: boolean;
}

export function runInWorker(code: string, tests: string, onLog: (line: string) => void, timeoutMs = 4000): Promise<RunOutcome> {
  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("runner.worker.js", document.baseURI));
    } catch {
      resolve({ results: [], error: "Цей браузер не дозволяє запускати код у безпечному режимі" });
      return;
    }
    const nonce = crypto.randomUUID();
    const finish = (r: RunOutcome) => { clearTimeout(timer); worker.terminate(); resolve(r); };
    const timer = setTimeout(() => finish({ results: [], timedOut: true, error: "Перевищено час виконання. Імовірно, у коді нескінченний цикл." }), timeoutMs);
    worker.onmessage = (ev: MessageEvent<{ nonce?: string; type?: string; line?: string } & Partial<SuiteResult>>) => {
      const m = ev.data;
      if (!m || m.nonce !== nonce) return;
      if (m.type === "log" && typeof m.line === "string") onLog(m.line);
      else if (m.type === "done") finish({ results: m.results ?? [], error: m.error });
    };
    worker.onerror = (e) => finish({ results: [], error: "Помилка виконання: " + (e.message || "невідома") });
    worker.postMessage({ code, tests, nonce });
  });
}
