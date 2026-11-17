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
