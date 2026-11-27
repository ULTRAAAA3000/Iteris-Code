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
export type RemoteLang = "go" | "python" | "java" | "c" | "cpp" | "php" | "pascal" | "ts" | "sql" | "bash";

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

/**
 * Перевірка сторінки (HTML/CSS). Спочатку вибираються елементи за selector, потім відфільтровуються за text / attr / style,
 * і кількість тих, що залишились, порівнюється з count (за замовчуванням потрібен хоча б один). Усі вказані умови діють разом.
 * Без selector перевіряється лише source.
 */
export interface PageCheck {
  name: string;
  /** CSS-селектор елементів сторінки */
  selector?: string;
  /** Скільки елементів має лишитись після фільтрів: число (рівно) або { min, max }. За замовчуванням щонайменше 1 */
  count?: number | { min?: number; max?: number };
  /** Текст елемента містить цей рядок (пробіли нормалізуються, регістр враховується) */
  text?: string;
  /** Атрибут елемента: рівно одне з equals / has / matches. Без них достатньо, що атрибут є */
  attr?: { name: string; equals?: string; has?: string; matches?: string };
  /** Обчислений стиль елемента: { властивість: значення }. Кольори пишіть у hex, довжини в px, лише повні (не скорочені) властивості */
  style?: Record<string, string>;
  /** Перевірка тексту коду, який написав користувач: has або matches (регулярний вираз-рядок) */
  source?: { has?: string; matches?: string };
  /** Інвертувати результат */
  not?: boolean;
  hint?: string;
}

/**
 * Редактор + попередній перегляд сторінки, перевірка в браузері (без сервера): сторінка малюється в ізольованому iframe без скриптів.
 * edit: "html" користувач пише увесь документ; "css" пише стилі до готової розмітки markup.
 */
export interface PageTask extends TaskBase {
  runtime: "page";
  edit: "html" | "css";
  /** Назва вкладки редактора: index.html або style.css */
  file: string;
  editorLang: "html" | "css";
  /** Для edit: "css": вміст <body> (готова розмітка) */
  markup?: string;
  checks: PageCheck[];
}

export type Task = JsTask | RemoteTask | PageTask;

export const isRemote = (t: Task): t is RemoteTask => t.runtime === "remote";
export const isPage = (t: Task): t is PageTask => t.runtime === "page";
