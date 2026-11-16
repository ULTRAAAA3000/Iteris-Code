// Каталог курсів. Публічно відомі лише категорії й мови; список уроків і завдань приходить після входу (setOutline)
import type { Outline, OutlineLesson, TaskMeta } from "./types.ts";

export interface Category { title: string; desc: string; courses: string[] }
export interface CourseMeta { name: string; badge: string; color: string; cat: string; desc: string; req?: string; next?: string }
export interface Course extends CourseMeta { L: OutlineLesson[] }

export const CATS: Record<string, Category> = {
  program: { title: "Програмування", desc: "Логічне мислення, алгоритми та мови, з яких починають і на яких працюють.", courses: ["python","go","java","cpp","pascal"] },
  web: { title: "Web-технології", desc: "Розмітка, стилі та скрипти: усе, щоб створити живий сайт з нуля.", courses: ["html","css","js","ts"] },
  server: { title: "Серверна розробка", desc: "Код, що працює на сервері: обробка запитів, форм і даних.", courses: ["php"] },
  data: { title: "Бази даних", desc: "Зберігання даних і запити до них мовою SQL.", courses: ["sql"] },
  tools: { title: "Інструменти розробника", desc: "Те, без чого не обходиться жодна команда: контроль версій і командний рядок.", courses: ["git","bash"] }
};
const META: Record<string, CourseMeta> = {
  python: { name: "Python", badge: "Py", color: "#C99700", cat: "program", desc: "Проста мова для старту: змінні, розгалуження та цикли." },
  cpp: { name: "C++", badge: "C+", color: "#00599C", cat: "program", desc: "Швидка компільована мова: типи, ввід-вивід, умови та цикли." },
  pascal: { name: "Pascal", badge: "Pa", color: "#7A4DD8", cat: "program", desc: "Навчальна мова з чіткою структурою: ідеальна для перших алгоритмів." },
  html: { name: "HTML", badge: "<>", color: "#E8531F", cat: "web", desc: "Розмітка сторінок: структура, текст, списки, таблиці та форми." },
  css: { name: "CSS", badge: "{}", color: "#1C8FE0", cat: "web", desc: "Оформлення сторінок: селектори, блочна модель і flexbox." },
  js: { name: "JavaScript", badge: "JS", color: "#E0B400", cat: "web", desc: "Мова браузера: функції, масиви, DOM і запити до сервера.", next: "ts" },
  go: { name: "Go", badge: "Go", color: "#00ADD8", cat: "program", desc: "Проста й швидка мова від Google: типи, функції та горутини для паралельності." },
  java: { name: "Java", badge: "Jv", color: "#E76F00", cat: "program", desc: "Мова великих застосунків і Android: класи, змінні, умови та цикли." },
  ts: { name: "TypeScript", badge: "TS", color: "#3178C6", cat: "web", req: "js", desc: "JavaScript із типами: менше помилок, зрозуміліший код. Продовження курсу JavaScript." },
  php: { name: "PHP", badge: "Ph", color: "#777BB4", cat: "server", desc: "Серверна мова вебу: змінні, масиви, функції та безпечна обробка форм." },
  git: { name: "Git", badge: "Gt", color: "#F05032", cat: "tools", desc: "Контроль версій: коміти, гілки, GitHub і робота в команді." },
  bash: { name: "Командний рядок", badge: "Sh", color: "#3E4A59", cat: "tools", desc: "Термінал і Bash: файли, пошук, конвеєри та перші скрипти." },
  sql: { name: "SQL", badge: "DB", color: "#1E8E4E", cat: "data", desc: "Мова запитів: вибірка, фільтрація, групування та об'єднання таблиць." }
};

// До входу в кожного курсу L порожній: уроки з'являються лише після setOutline
export const C: Record<string, Course> = {};
for (const [k, m] of Object.entries(META)) C[k] = { ...m, L: [] };

let tasks: readonly TaskMeta[] = [];
/** Підставляє структуру курсів із /api/courses; null прибирає її (вихід із акаунта або помилка) */
export function setOutline(o: Outline | null): void {
  for (const k of Object.keys(C)) C[k].L = o?.courses[k] ?? [];
  tasks = o?.tasks ?? [];
}
export const allTasks = (): readonly TaskMeta[] => tasks;
export const taskMeta = (id: string): TaskMeta | undefined => tasks.find((t) => t.id === id);
/** Завдання, прив'язане до уроку n курсу k (за структурою курсу) */
export const taskOf = (k: string, n: number): TaskMeta | undefined => { const id = C[k]?.L[n - 1]?.task; return id ? taskMeta(id) : undefined; };
export const lessonTotal = (): number => Object.values(C).reduce((s, c) => s + c.L.length, 0);

export const darkText = (k: string): string => (k === "python" || k === "js" ? "color:#14213D" : "");
