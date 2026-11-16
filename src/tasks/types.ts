// Практичні завдання: опис спільний для фронтенду і сервера (без залежностей від DOM)

/**
 * Перевірка результату «віддаленого» завдання. Однакова для всіх мов: дивимось на вивід програми (stdout)
 * або на вихідний код. Заповнюється рівно одне з полів equals / has / matches.
 */
export interface Check {
  /** Що бачить користувач у терміналі: «Виводить суму», «Використовує цикл for» */
  name: string;
  /** stdout — вивід програми, source — код користувача (щоб вимагати певну конструкцію мови) */
  on: "stdout" | "source";
  /** Точний збіг (для stdout: без кінцевих пробілів у рядках і порожніх рядків наприкінці) */
  equals?: string;
  /** Містить підрядок */
  has?: string;
  /** Регулярний вираз (рядок без слешів, прапорці: s, m) */
  matches?: string;
  /** Інвертувати: перевірка пройдена, якщо умови НЕ виконано (наприклад, «не використовує goto») */
  not?: boolean;
  /** Підказка, що показується при невдачі */
  hint?: string;
}

/** Мови, які вміє запускати сервер (lib/runners.ts). Нова мова: додати сюди й у реєстр runners */
export type RemoteLang = "go" | "python" | "java" | "cpp" | "php" | "pascal";

interface TaskBase {
  id: string;
  /** Урок, до якого прив'язане завдання, у форматі "js/3" */
  lesson: string;
  course: string;
  title: string;
  /** Навіщо це потрібно в реальному проєкті */
  context: string;
  /** Постановка задачі: абзаци */
  brief: string[];
  starter: string;
  premium: boolean;
  xp: number;
}

/** Виконується в браузері, у Web Worker (JavaScript) */
export interface JsTask extends TaskBase {
  runtime?: "js";
  /** Код тестів: виконується в одному контексті з рішенням користувача (API як у Vitest) */
  tests: string;
}

/** Виконується на сервері через пісочницю мови (/api/run), результат перевіряють checks */
export interface RemoteTask extends TaskBase {
  runtime: "remote";
  lang: RemoteLang;
  /** Назва вкладки редактора, наприклад "main.go" */
  file: string;
  /** Мова підсвітки в редакторі (Monaco): "go", "python", ... */
  editorLang: string;
  checks: Check[];
}

export type Task = JsTask | RemoteTask;

export const isRemote = (t: Task): t is RemoteTask => t.runtime === "remote";
