// Каталог курсів. Публічно відомі лише категорії й мови; список уроків і завдань приходить після входу (setOutline)
import type { Outline, OutlineLesson, ProjectMeta, TaskMeta } from "./types.ts";

export interface Category { title: string; desc: string; courses: string[] }
/** lessons: кількість уроків (число публічне, тексти закриті); тест content.test.mjs звіряє його з content/lessons.js */
export interface CourseMeta { lessons: number; /** Кількість базових уроків, якщо в курсі є рівні */ base?: number; name: string; badge: string; color: string; cat: string; desc: string; req?: string; next?: string }
export interface Course extends CourseMeta { L: OutlineLesson[] }

export const CATS: Record<string, Category> = {
  program: { title: "Програмування", desc: "Логічне мислення, алгоритми та мови, з яких починають і на яких працюють.", courses: ["python","go","java","cpp","pascal"] },
  web: { title: "Web-технології", desc: "Розмітка, стилі та скрипти: усе, щоб створити живий сайт з нуля.", courses: ["html","css","js","ts"] },
  server: { title: "Серверна розробка", desc: "Код, що працює на сервері: обробка запитів, форм і даних.", courses: ["php"] },
  data: { title: "Бази даних", desc: "Зберігання даних і запити до них мовою SQL.", courses: ["sql"] },
  tools: { title: "Інструменти розробника", desc: "Те, без чого не обходиться жодна команда: контроль версій і командний рядок.", courses: ["git","bash"] }
};
const META: Record<string, CourseMeta> = {
  python: { lessons: 110, base: 80, name: "Python", badge: "Py", color: "#C99700", cat: "program", desc: "Проста мова для старту: від print і змінних до функцій, класів, файлів і тестів." },
  cpp: { lessons: 110, base: 80, name: "C++", badge: "C+", color: "#00599C", cat: "program", desc: "Швидка компільована мова: типи, пам'ять, класи, стандартна бібліотека й сучасний C++." },
  pascal: { lessons: 8, name: "Pascal", badge: "Pa", color: "#7A4DD8", cat: "program", desc: "Навчальна мова з чіткою структурою: ідеальна для перших алгоритмів." },
  html: { lessons: 12, name: "HTML", badge: "<>", color: "#E8531F", cat: "web", desc: "Розмітка сторінок: структура, текст, списки, таблиці та форми." },
  css: { lessons: 13, name: "CSS", badge: "{}", color: "#1C8FE0", cat: "web", desc: "Оформлення сторінок: селектори, блочна модель і flexbox." },
  js: { lessons: 22, name: "JavaScript", badge: "JS", color: "#E0B400", cat: "web", desc: "Мова браузера: функції, масиви, DOM і запити до сервера.", next: "ts" },
  go: { lessons: 110, base: 80, name: "Go", badge: "Go", color: "#00ADD8", cat: "program", desc: "Проста й швидка мова від Google: типи, функції та горутини для паралельності." },
  java: { lessons: 11, name: "Java", badge: "Jv", color: "#E76F00", cat: "program", desc: "Мова великих застосунків і Android: класи, змінні, умови та цикли." },
  ts: { lessons: 12, name: "TypeScript", badge: "TS", color: "#3178C6", cat: "web", req: "js", desc: "JavaScript із типами: менше помилок, зрозуміліший код. Продовження курсу JavaScript." },
  php: { lessons: 10, name: "PHP", badge: "Ph", color: "#777BB4", cat: "server", desc: "Серверна мова вебу: змінні, масиви, функції та безпечна обробка форм." },
  git: { lessons: 10, name: "Git", badge: "Gt", color: "#F05032", cat: "tools", desc: "Контроль версій: коміти, гілки, GitHub і робота в команді." },
  bash: { lessons: 8, name: "Командний рядок", badge: "Sh", color: "#3E4A59", cat: "tools", desc: "Термінал і Bash: файли, пошук, конвеєри та перші скрипти." },
  sql: { lessons: 15, name: "SQL", badge: "DB", color: "#1E8E4E", cat: "data", desc: "Мова запитів: вибірка, фільтрація, групування та об'єднання таблиць." }
};

// До входу в кожного курсу L порожній: уроки з'являються лише після setOutline
export const C: Record<string, Course> = {};
for (const [k, m] of Object.entries(META)) C[k] = { ...m, L: [] };

let tasks: readonly TaskMeta[] = [];
let projects: readonly ProjectMeta[] = [];
/** Підставляє структуру курсів із /api/courses; null прибирає її (вихід із акаунта або помилка) */
export function setOutline(o: Outline | null): void {
  for (const k of Object.keys(C)) C[k].L = o?.courses[k] ?? [];
  for (const k of Object.keys(levels)) delete levels[k];
  Object.assign(levels, o?.levels ?? {});
  tasks = o?.tasks ?? [];
  projects = o?.projects ?? [];
}

// Рівні курсу: у курсі з просунутими уроками (adv) користувач проходить базовий чи просунутий шлях і може перемикатись будь-коли.
// Номери уроків не змінюються: базовий рівень лише ховає просунуті уроки зі списків, шляху, «Наступного уроку» й прогресу.
export type CourseLevel = "base" | "adv";
const levels: Record<string, CourseLevel> = {};
export const hasLevels = (k: string): boolean => !!C[k]?.L.some((l) => l.adv);
export const levelOf = (k: string): CourseLevel => (hasLevels(k) && levels[k] !== "adv" ? "base" : "adv");
export const setLevelLocal = (k: string, v: CourseLevel): void => { levels[k] = v; };
/** Урок n входить у поточний рівень курсу k */
export const inLevel = (k: string, n: number): boolean => levelOf(k) === "adv" || !C[k]?.L[n - 1]?.adv;
/** Скільки уроків у поточному рівні (або в зазначеному) */
export const levelTotal = (k: string, v: CourseLevel = levelOf(k)): number => (v === "adv" ? C[k].L.length : C[k].L.filter((l) => !l.adv).length);
export const allTasks = (): readonly TaskMeta[] => tasks;
export const taskMeta = (id: string): TaskMeta | undefined => tasks.find((t) => t.id === id);
export const allProjects = (): readonly ProjectMeta[] => projects;
export const projectMeta = (id: string): ProjectMeta | undefined => projects.find((p) => p.id === id);
/** Проєкт за ТЗ, прив'язаний до уроку n курсу k */
export const projectOf = (k: string, n: number): ProjectMeta | undefined => { const id = C[k]?.L[n - 1]?.project; return id ? projectMeta(id) : undefined; };
/** Завдання, прив'язане до уроку n курсу k (за структурою курсу) */
export const taskOf = (k: string, n: number): TaskMeta | undefined => { const id = C[k]?.L[n - 1]?.task; return id ? taskMeta(id) : undefined; };
export const lessonTotal = (): number => Object.values(C).reduce((s, c) => s + c.L.length, 0);
/** Кількість уроків усіх курсів без входу (для публічних сторінок) */
export const publicLessonTotal = (): number => Object.values(C).reduce((s, c) => s + c.lessons, 0);

export const darkText = (k: string): string => (k === "python" || k === "js" ? "color:#14213D" : "");
