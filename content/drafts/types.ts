// Чернетки проєктів за ТЗ для курсів, які ще дописуються. НЕ ПУБЛІКУЮТЬСЯ: ці файли ніде не підключені
// (ні в content/tasks/index.ts, ні в content/projects/index.ts, ні в сторінки сайту), тому користувачі їх не бачать.
// Коли курс допишуть, чернетку або вставляють як є (draftToTask), або адаптують під нові уроки. Інструкція: Documentation/spec-drafts.md
import type { Check, PageCheck } from "../../src/tasks/types.ts";

/** Одна вимога ТЗ. Виконана, коли пройшли всі її перевірки */
export interface DraftReq<C> {
  /** R1, R2, … підряд */
  id: string;
  /** Коротко для терміналу: звичайний текст до 80 символів */
  short: string;
  /** Повне формулювання (HTML: лише <code>, <b>, <i>; символи < > & як &lt; &gt; &amp;) */
  text: string;
  /** Підказка при невдачі: наводить, але не видає рішення */
  hint: string;
  checks: C[];
}

interface DraftBase {
  id: string;
  course: string;
  title: string;
  /** Навіщо це в реальній роботі */
  context: string;
  /** Постановка: абзаци (HTML) */
  brief: string[];
  /** Договір: назви, які мають збігатися (функції, класи, id елементів) */
  contract: string[];
  /** Приклад очікуваного результату: вивід програми або схема сторінки */
  mockup: string;
  /** XP за проєкт: 40–60 */
  xp: number;
  /** Урок поточного плану, після якого проєкт можна давати вже зараз, формат "cpp/6" */
  after: string;
  /** Теми, без яких проєкт не зробити: за ними його розмістять у новому плані курсу */
  needs: string[];
}

/** Консольна програма: запускається на сервері, перевіряється за виводом і кодом */
export interface RemoteDraft extends DraftBase {
  runtime: "remote";
  lang: "cpp" | "pascal";
  starter: string;
  requirements: DraftReq<Omit<Check, "name" | "hint">>[];
}

/** Сторінка HTML: малюється в ізольованому iframe, перевіряється за DOM */
export interface PageDraft extends DraftBase {
  runtime: "page";
  starter: string;
  requirements: DraftReq<Omit<PageCheck, "name" | "hint">>[];
}

export type SpecDraft = RemoteDraft | PageDraft;
