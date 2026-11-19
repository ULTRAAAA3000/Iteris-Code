// Проєкти за ТЗ: опис спільний для фронтенду і сервера (без залежностей від DOM)
export interface Requirement {
  /** Номер вимоги: R1, R2, … */
  id: string;
  /** Формулювання вимоги для користувача (HTML) */
  text: string;
  /** Підказка, що показується, коли вимогу не виконано */
  hint: string;
  /** Тіло async-функції перевірки. Виконується всередині сторінки користувача; повертає true, коли вимогу виконано, або рядок із поясненням */
  check: string;
}

export interface Project {
  id: string;
  /** Урок, після якого пропонується проєкт, у форматі "js/17" */
  lesson: string;
  course: string;
  title: string;
  /** Навіщо це потрібно в реальній роботі */
  context: string;
  /** Постановка: абзаци (HTML) */
  brief: string[];
  /** Договір по елементах: id, класи й розмітка, на які спираються перевірки (HTML) */
  contract: string[];
  /** Макет: псевдографіка */
  mockup: string;
  requirements: readonly Requirement[];
  /** Початковий файл index.html із HTML, CSS і JS в одному місці */
  starter: string;
  premium: boolean;
  xp: number;
}

/** Проєкт за ТЗ мовою з серверним запуском (Go). Перевірки (harness) живуть лише на сервері, у браузер вони не потрапляють */
export interface ProgramProject {
  kind: "program";
  id: string;
  lang: "python" | "java" | "go";
  lesson: string;
  course: string;
  title: string;
  context: string;
  brief: string[];
  contract: string[];
  requirements: readonly { id: string; text: string; hint: string }[];
  starter: string;
  premium: boolean;
  xp: number;
}
export const isProgram = (p: Project | ProgramProject): p is ProgramProject => (p as ProgramProject).kind === "program";
