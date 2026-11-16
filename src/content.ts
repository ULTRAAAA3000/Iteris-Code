// Завантаження уроків і структури курсів із сервера. Доступно лише після входу: у публічній збірці текстів уроків немає.
import { setOutline } from "./data.ts";
import type { LessonPayload, Outline } from "./types.ts";
import { ui } from "./ui.ts";

const lessons = new Map<string, LessonPayload>();
const failed = new Set<string>();
const loading = new Set<string>();
let outlineOk = false;

const getJson = async <T>(url: string): Promise<T | null> => {
  try {
    const r = await fetch(url, { credentials: "same-origin" });
    return r.ok ? ((await r.json()) as T) : null;
  } catch {
    return null;
  }
};

/** Структура курсів (назви уроків, глави, завдання). Повертає false, якщо не вдалося завантажити */
export async function loadOutline(): Promise<boolean> {
  const o = await getJson<Outline>("/api/courses");
  setOutline(o);
  outlineOk = !!o;
  return outlineOk;
}
export const outlineLoaded = (): boolean => outlineOk;

/** Вихід із акаунта: забуваємо все, що було завантажено */
export function clearContent(): void {
  setOutline(null);
  outlineOk = false;
  lessons.clear();
  failed.clear();
}

const key = (k: string, n: number): string => k + "/" + n;
export const cachedLesson = (k: string, n: number): LessonPayload | undefined => lessons.get(key(k, n));
export const lessonFailed = (k: string, n: number): boolean => failed.has(key(k, n));
export const retryLesson = (k: string, n: number): void => { failed.delete(key(k, n)); };

/** Завантажує урок k/n (один запит на урок, результат запам'ятовується) і після відповіді перемальовує сторінку */
export function fetchLesson(k: string, n: number): void {
  const id = key(k, n);
  if (lessons.has(id) || loading.has(id)) return;
  loading.add(id);
  void getJson<LessonPayload>(`/api/lesson?k=${encodeURIComponent(k)}&n=${n}`).then((p) => {
    loading.delete(id);
    if (p) lessons.set(id, p); else failed.add(id);
    ui.render();
  });
}
