// Досягнення (без монет): рахуються з наявних даних, окремої таблиці немає.
// Спільний каталог для сервера (які отримані) і клієнта (назви, опис, іконки).

export interface AchStats { lessons: number; tasks: number; level: number; streakBest: number; coursesDone: number }
export interface Achievement { id: string; title: string; desc: string; icon: string; ok: (s: AchStats) => boolean }

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: "lesson1", title: "Перший урок", desc: "Пройдіть свій перший урок", icon: "book", ok: (s) => s.lessons >= 1 },
  { id: "lesson10", title: "10 уроків", desc: "Пройдіть 10 уроків", icon: "book", ok: (s) => s.lessons >= 10 },
  { id: "lesson50", title: "50 уроків", desc: "Пройдіть 50 уроків", icon: "book", ok: (s) => s.lessons >= 50 },
  { id: "task1", title: "Перше завдання", desc: "Розв'яжіть перше завдання", icon: "code", ok: (s) => s.tasks >= 1 },
  { id: "task10", title: "10 завдань", desc: "Розв'яжіть 10 завдань", icon: "code", ok: (s) => s.tasks >= 10 },
  { id: "streak3", title: "Серія 3 дні", desc: "Вчіться 3 дні поспіль", icon: "flame", ok: (s) => s.streakBest >= 3 },
  { id: "streak7", title: "Серія 7 днів", desc: "Вчіться тиждень поспіль", icon: "flame", ok: (s) => s.streakBest >= 7 },
  { id: "streak30", title: "Серія 30 днів", desc: "Вчіться 30 днів поспіль", icon: "flame", ok: (s) => s.streakBest >= 30 },
  { id: "level5", title: "Рівень 5", desc: "Дійдіть до 5 рівня", icon: "star", ok: (s) => s.level >= 5 },
  { id: "level10", title: "Рівень 10", desc: "Дійдіть до 10 рівня", icon: "star", ok: (s) => s.level >= 10 },
  { id: "course1", title: "Курс пройдено", desc: "Пройдіть усі уроки одного курсу", icon: "flag", ok: (s) => s.coursesDone >= 1 },
];

/** Ідентифікатори отриманих досягнень у порядку каталогу */
export const earnedAchievements = (s: AchStats): string[] => ACHIEVEMENTS.filter((a) => a.ok(s)).map((a) => a.id);

const P: Record<string, string> = {
  book: '<path d="M4 5h7v14H4zM13 5h7v14h-7z"/>',
  code: '<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>',
  flame: '<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.3l1-6.2L3 9.7l6.2-.9z"/>',
  flag: '<path d="M6 21V4M6 5h12l-3 4 3 4H6"/>',
};
/** Іконка значка (inline SVG, колір з currentColor) */
export const achIcon = (name: string): string =>
  `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] ?? ""}</svg>`;
