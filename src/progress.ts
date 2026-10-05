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
