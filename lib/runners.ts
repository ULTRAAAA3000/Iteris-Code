// Запуск коду користувача в зовнішній пісочниці. Один інтерфейс RemoteRunner на кожну мову:
// сервер отримує текст програми, повертає stdout / stderr / помилку компіляції, а перевірка (checks) спільна для всіх мов.
// Нова мова = новий об'єкт RemoteRunner + рядок у RUNNERS (див. Documentation/task-runtime.md).
import type { RunOutput } from "../src/runner/checks.ts";
import type { RemoteLang } from "../src/tasks/types.ts";

/** Пісочниця не відповіла або відмовила (мережа, ліміти зовнішнього сервісу) */
export class RunnerUnavailable extends Error {}

export interface RemoteRunner {
  /** Максимальний розмір програми, символів */
  maxCode: number;
  run(code: string, fetcher?: typeof fetch): Promise<RunOutput>;
}

const TIMEOUT_MS = 15000;

interface PlaygroundReply { Errors?: string; Events?: { Message: string; Kind: string }[]; Status?: number }

/** Go Playground (go.dev/play): безкоштовний офіційний сервіс, компілює й запускає один файл package main без мережі */
export const goPlayground: RemoteRunner = {
  maxCode: 8000,
  async run(code, fetcher = fetch) {
    let data: PlaygroundReply;
    try {
      const res = await fetcher("https://go.dev/_/compile", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "iteris-code (learning platform)" },
        body: new URLSearchParams({ version: "2", body: code, withVet: "false" }).toString(),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new RunnerUnavailable("go.dev " + res.status);
      data = (await res.json()) as PlaygroundReply;
    } catch (e) {
      throw e instanceof RunnerUnavailable ? e : new RunnerUnavailable(e instanceof Error ? e.message : String(e));
    }
    const events = Array.isArray(data.Events) ? data.Events : [];
    const stdout = events.filter((e) => e.Kind === "stdout").map((e) => e.Message).join("");
    const stderr = events.filter((e) => e.Kind === "stderr").map((e) => e.Message).join("");
    const errors = String(data.Errors ?? "").replace(/(\.\/)?prog\.go/g, "main.go").trim();
    if (/timeout running program|process took too long/i.test(errors + stderr)) return { stdout, stderr, timedOut: true, error: "Перевищено час виконання. Імовірно, у коді нескінченний цикл." };
    if (errors) return { stdout, stderr, error: errors };
    return { stdout, stderr, exitCode: Number(data.Status ?? 0) };
  },
};

export const RUNNERS: Record<RemoteLang, RemoteRunner> = { go: goPlayground };
