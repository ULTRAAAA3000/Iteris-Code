import { store } from "./util.ts";

export const done: Record<string, number[]> = store.get("ic-done", {});
export const hooks = { onToggle: (_k: string, _n: number, _isDone: boolean): void => {} };

export const isDone = (k: string, n: number): boolean => (done[k] || []).includes(n);
export const progress = (k: string): number => (done[k] || []).length;
export const persist = (): void => store.set("ic-done", done);

export function toggle(k: string, n: number): void {
  const s = new Set(done[k] || []);
  if (s.has(n)) s.delete(n); else s.add(n);
  done[k] = [...s].sort((a, b) => a - b);
  persist();
  hooks.onToggle(k, n, isDone(k, n));
}

// Локальна пам'ять про розв'язані практичні завдання (для гостей і для швидкого відображення)
export const isTaskPassed = (id: string): boolean => store.get<string[]>("ic-tasks", []).includes(id);
export function markTaskPassed(id: string): void {
  const l = store.get<string[]>("ic-tasks", []);
  if (!l.includes(id)) store.set("ic-tasks", [...l, id]);
}

/** Урок з практичним завданням вважається пройденим, коли завдання розв'язано (а не лише коли його відмітили вручну).
 *  Повертає id уроків («go/3»), які мають бути пройденими, але ще не позначені: завдання розв'язано, а урок ні. */
export function lessonsOfPassedTasks(tasks: readonly { id: string; lesson: string }[], passed: (id: string) => boolean, valid: (k: string, n: number) => boolean): string[] {
  const out = new Set<string>();
  for (const t of tasks) {
    const [k, n] = t.lesson.split("/");
    if (passed(t.id) && valid(k, +n) && !isDone(k, +n)) out.add(`${k}/${+n}`);
  }
  return [...out];
}

/** Завдання щойно розв'язано: позначає його урок пройденим (як кнопка «Позначити пройденим») і повідомляє сервер */
export function completeLessonOf(lessonId: string): boolean {
  const [k, n] = lessonId.split("/");
  if (!k || !(+n >= 1) || isDone(k, +n)) return false;
  done[k] = [...(done[k] || []), +n].sort((a, b) => a - b);
  persist();
  hooks.onToggle(k, +n, true);
  return true;
}
