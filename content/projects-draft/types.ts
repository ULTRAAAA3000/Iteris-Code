// ЧЕРНЕТКИ проєктів за ТЗ для мов із серверним запуском (Python, Java, Go, C++, Pascal, TypeScript, PHP, SQL). НЕ ПІДКЛЮЧЕНІ до сайту: не потрапляють у PROJECTS,
// у сітку курсів і в /api/project. Підключення відбудеться, коли дописані курси (див. Documentation/project-drafts.md).
// Опис дивіться там же. Тут лише тип, спільний для чернеток і тесту tests/projects-draft.test.mjs.

export type ProgramLang = "python" | "java" | "go" | "cpp" | "pascal" | "ts" | "php" | "sql";

export interface ProgramRequirement {
  /** R1, R2, … Збігається з міткою у виводі harness: рядок «R1 PASS» або «R1 FAIL: причина» */
  id: string;
  /** Формулювання вимоги для користувача (HTML) */
  text: string;
  /** Підказка, що показується, коли вимогу не виконано */
  hint: string;
}

export interface ProgramProject {
  id: string;
  lang: ProgramLang;
  /** Після якого уроку курсу пропонується проєкт, у форматі "go/70". Орієнтовно, уточнюється після дописування курсу */
  lesson: string;
  title: string;
  /** Навіщо це потрібно в реальній роботі */
  context: string;
  /** Постановка: абзаци (HTML) */
  brief: string[];
  /** Договір: назви функцій, типів, сигнатури, формати, на які спираються перевірки (HTML) */
  contract: string[];
  requirements: readonly ProgramRequirement[];
  /** Заготовка користувача: компілюється, містить заглушки, жодна вимога не виконана */
  starter: string;
  /** Прихований код перевірок: дописується після коду користувача, друкує R<n> PASS/FAIL для кожної вимоги */
  harness: string;
  xp: number;
}

/** Складає програму для запуску: код користувача + harness. Файл: main.py, Main.java, main.go, main.cpp, main.pas, main.ts, main.php, main.sql */
export const assemble = (p: Pick<ProgramProject, "harness">, userCode: string): string => userCode.replace(/\s+$/, "") + "\n\n" + p.harness + "\n";
export const FILE: Record<ProgramLang, string> = { python: "main.py", java: "Main.java", go: "main.go", cpp: "main.cpp", pascal: "main.pas", ts: "main.ts", php: "main.php", sql: "main.sql" };
