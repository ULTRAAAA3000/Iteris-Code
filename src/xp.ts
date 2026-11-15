// XP, рівні, глави й стартова точка за рівнем: чисті функції без DOM, спільні для фронтенду й сервера.

export const LESSON_XP = 10;
/** Бонус за серію: днів поспіль → XP (видається один раз за кожну позначку) */
export const STREAK_BONUS: Readonly<Record<number, number>> = { 3: 15, 7: 30, 14: 60, 30: 150, 60: 300, 100: 500 };
export const STREAK_MILESTONES: readonly number[] = Object.keys(STREAK_BONUS).map(Number).sort((a, b) => a - b);

// Скільки XP потрібно, щоб піднятися з рівня n на n + 1: 60, 80, 100, ... (поріг росте з рівнем)
export const levelStep = (level: number): number => 40 + 20 * level;
/** Скільки всього XP потрібно, щоб досягти рівня (рівень 1 = 0 XP) */
export const xpAtLevel = (level: number): number => 40 * (level - 1) + 10 * level * (level - 1);

export interface LevelInfo { level: number; into: number; need: number; pct: number; total: number }
export function levelInfo(total: number): LevelInfo {
  const xp = Math.max(0, Math.floor(total) || 0);
  let level = 1;
  while (level < 500 && xp >= xpAtLevel(level + 1)) level++;
  const into = xp - xpAtLevel(level), need = levelStep(level);
  return { level, into, need, pct: Math.min(100, Math.round((into / need) * 100)), total: xp };
}

export type Level = "beginner" | "intermediate" | "advanced";
export const LEVELS: readonly Level[] = ["beginner", "intermediate", "advanced"];
export const isLevel = (v: unknown): v is Level => LEVELS.includes(v as Level);

export interface Chapter { name: string; from: number; to: number }
/** Глави курсу за полем ch уроків: from і to рахуються з 1, включно */
export function chaptersOf(lessons: readonly { ch?: string }[]): Chapter[] {
  const out: Chapter[] = [];
  lessons.forEach((l, i) => {
    const name = l.ch ?? "";
    const last = out[out.length - 1];
    if (last && last.name === name) last.to = i + 1;
    else out.push({ name, from: i + 1, to: i + 1 });
  });
  return out;
}

const START_SHARE: Record<Level, number> = { beginner: 0, intermediate: 0.34, advanced: 0.67 };
/** З якого уроку (з 1) починається шлях для рівня: початок глави на потрібній частині курсу. Попередні глави лишаються доступними */
export function startLesson(lessons: readonly { ch?: string }[], level: Level): number {
  const chs = chaptersOf(lessons);
  if (!chs.length) return 1;
  return chs[Math.min(chs.length - 1, Math.floor(chs.length * START_SHARE[level]))].from;
}

/** Урок, який зараз «поточний»: перший непройдений від стартової точки, інакше перший непройдений узагалі; 0 = курс пройдено */
export function currentLesson(total: number, start: number, isDone: (n: number) => boolean): number {
  for (let n = Math.max(1, start); n <= total; n++) if (!isDone(n)) return n;
  for (let n = 1; n <= total; n++) if (!isDone(n)) return n;
  return 0;
}
