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

// ---- Wandbox (wandbox.org): безкоштовна публічна пісочниця для Python, Java, C++, PHP, Pascal та інших мов ----
// Версію компілятора не зашиваємо в код: беремо найновішу стабільну зі списку /api/list.json (кеш на годину),
// тому оновлення версій на боці сервісу нам нічого не ламає.

interface WandboxCompiler { name: string; language: string }
interface WandboxReply {
  status?: string | number; signal?: string;
  compiler_error?: string; compiler_message?: string;
  program_output?: string; program_error?: string; program_message?: string;
}

const WANDBOX = "https://wandbox.org/api";
const LIST_TTL_MS = 60 * 60 * 1000;
let listCache: { at: number; list: WandboxCompiler[] } | undefined;

const versionOf = (name: string): number[] => (name.match(/\d+/g) ?? []).map(Number);
function newer(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] ?? -1) !== (b[i] ?? -1)) return (a[i] ?? -1) - (b[i] ?? -1);
  return 0;
}

/** Найновіший стабільний компілятор мови: назва збігається з pattern, без head/trunk та прев'ю-збірок */
export function pickCompiler(list: readonly WandboxCompiler[], language: string, pattern: RegExp): string | undefined {
  const lang = language.toLowerCase();
  const found = list.filter((c) => (lang.length === 1 ? c.language.toLowerCase() === lang : c.language.toLowerCase().startsWith(lang)) && pattern.test(c.name) && !/head|trunk|dev|nightly|alpha|beta|rc\d/i.test(c.name));
  found.sort((x, y) => newer(versionOf(y.name), versionOf(x.name)));
  return found[0]?.name;
}

async function compilerList(fetcher: typeof fetch): Promise<WandboxCompiler[]> {
  if (listCache && Date.now() - listCache.at < LIST_TTL_MS) return listCache.list;
  const res = await fetcher(WANDBOX + "/list.json", { headers: { "User-Agent": "iteris-code (learning platform)" }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new RunnerUnavailable("wandbox list " + res.status);
  const list = (await res.json()) as WandboxCompiler[];
  if (!Array.isArray(list) || !list.length) throw new RunnerUnavailable("wandbox list is empty");
  listCache = { at: Date.now(), list };
  return list;
}

/** Для тестів: скинути кеш списку компіляторів */
export const resetWandboxCache = (): void => { listCache = undefined; };

/** file: ім'я файла в редакторі, на нього замінюємо prog.* у повідомленнях компілятора */
function wandbox(language: string, pattern: RegExp, file: string): RemoteRunner {
  return {
    maxCode: 8000,
    async run(code, fetcher = fetch) {
      let data: WandboxReply;
      try {
        const compiler = pickCompiler(await compilerList(fetcher), language, pattern);
        if (!compiler) throw new RunnerUnavailable("wandbox: no compiler for " + language);
        const res = await fetcher(WANDBOX + "/compile.json", {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8", "User-Agent": "iteris-code (learning platform)" },
          body: JSON.stringify({ compiler, code, save: false }),
          signal: AbortSignal.timeout(18000),
        });
        if (!res.ok) throw new RunnerUnavailable("wandbox " + res.status);
        data = (await res.json()) as WandboxReply;
      } catch (e) {
        throw e instanceof RunnerUnavailable ? e : new RunnerUnavailable(e instanceof Error ? e.message : String(e));
      }
      const stdout = data.program_output ?? "";
      const stderr = data.program_error ?? "";
      const status = Number(data.status ?? 0) || 0;
      const compilerText = ((data.compiler_error || data.compiler_message) ?? "").replace(/\bprog\.\w+/g, file).trim();
      if (/kill|terminat|timeout|timed out/i.test(String(data.signal ?? "")) || status === 124) return { stdout, stderr, timedOut: true, error: "Перевищено час виконання. Імовірно, у коді нескінченний цикл." };
      // Компіляція не вдалась: код завершення не нуль, а програма нічого не виводила
      if (status !== 0 && !stdout && !stderr && compilerText) return { stdout, stderr, error: compilerText };
      return { stdout, stderr, exitCode: status };
    },
  };
}

export const RUNNERS: Record<RemoteLang, RemoteRunner> = {
  go: goPlayground,
  python: wandbox("Python", /^cpython-3\./, "main.py"),
  java: wandbox("Java", /^openjdk-/, "Main.java"),
  c: wandbox("C", /^gcc-\d/, "main.c"),
  cpp: wandbox("C++", /^gcc-\d/, "main.cpp"),
  php: wandbox("PHP", /^php-\d/, "main.php"),
  pascal: wandbox("Pascal", /^fpc-/, "main.pas"),
  ts: wandbox("TypeScript", /^typescript/, "main.ts"),
  sql: wandbox("SQL", /^sqlite/, "main.sql"),
  bash: wandbox("Bash", /^bash/, "main.sh"),
};
