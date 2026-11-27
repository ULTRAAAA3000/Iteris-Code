// Список акаунтів для закритої сторінки /admin: пошта, ім'я, нік, дати, спосіб входу.
// Це персональні дані, тому функцію викликає лише /api/admin/users після isAdmin (інакше 404). Хеш пароля й токени назовні не йдуть.

export interface AdminUser {
  email: string;
  name: string | null;
  nick: string | null;
  createdAt: string | null;
  lastActiveAt: string | null;
  /** «password» — вхід за поштою й паролем; «social» — Google/GitHub (пошту підтвердив провайдер) */
  method: "password" | "social";
  verified: boolean;
  /** Мови, які людина обрала в онбордингу, і рівень (null: онбординг не проходила) */
  courses: string[];
  level: string | null;
  /** Скільки уроків пройдено в кожному курсі (де є прогрес), найбільші першими */
  progress: { course: string; lessons: number }[];
  xp: number;
  lessons: number;
  tasks: number;
}
export interface AdminUsersPage { total: number; users: AdminUser[] }

import { parseCourses } from "./stats.ts";

export const USERS_PAGE = 50;
const MAX_PAGE = 100;

/** Спецсимволи LIKE (% _ \) у пошуку шукаємо як звичайні літери */
const likeEscape = (s: string): string => s.replace(/[\\%_]/g, (c) => "\\" + c);

interface Row {
  id: string; email: string; name: string | null; nick: string | null; createdAt: string | null; lastActiveAt: string | null;
  hasPassword: number; verified: number | null;
  courses: string | null; level: string | null; xp: number; lessons: number; tasks: number;
}

export async function listUsers(db: D1Database, opts: { q?: string; course?: string; offset?: number; limit?: number } = {}): Promise<AdminUsersPage> {
  const q = (opts.q ?? "").trim().slice(0, 100);
  const limit = Math.min(MAX_PAGE, Math.max(1, Math.floor(opts.limit ?? USERS_PAGE)));
  const offset = Math.max(0, Math.floor(opts.offset ?? 0));
  const like = `%${likeEscape(q)}%`;
  const course = (opts.course ?? "").trim().slice(0, 20).replace(/[^a-z0-9+#-]/gi, "");
  const where = "(?1 = '' OR email LIKE ?2 ESCAPE '\\' OR name LIKE ?2 ESCAPE '\\' OR nick LIKE ?2 ESCAPE '\\')"
    + " AND (?3 = '' OR id IN (SELECT user_id FROM user_onboarding WHERE courses LIKE '%\"' || ?3 || '\"%')"
    + " OR id IN (SELECT user_id FROM user_progress WHERE lesson_id LIKE ?3 || '/%'))";

  const total = (await db.prepare(`SELECT COUNT(*) AS n FROM users WHERE ${where}`).bind(q, like, course).first<{ n: number }>())?.n ?? 0;
  const rows = await db.prepare(
    `SELECT u.id AS id, u.email AS email, u.name AS name, u.nick AS nick, u.created_at AS createdAt, u.last_active_at AS lastActiveAt,
            CASE WHEN u.password_hash IS NULL THEN 0 ELSE 1 END AS hasPassword, u.email_verified AS verified,
            (SELECT courses FROM user_onboarding o WHERE o.user_id = u.id) AS courses,
            (SELECT level FROM user_onboarding o WHERE o.user_id = u.id) AS level,
            COALESCE((SELECT SUM(amount) FROM xp_events x WHERE x.user_id = u.id), 0) AS xp,
            (SELECT COUNT(*) FROM user_progress p WHERE p.user_id = u.id) AS lessons,
            (SELECT COUNT(*) FROM xp_events x WHERE x.user_id = u.id AND x.reason = 'task') AS tasks
     FROM users u WHERE ${where.replace(/\b(email|name|nick|id)\b/g, "u.$1")} ORDER BY u.created_at DESC, u.email LIMIT ?4 OFFSET ?5`
  ).bind(q, like, course, limit, offset).all<Row>();

  const list = rows.results ?? [];
  const progress = new Map<string, { course: string; lessons: number }[]>();
  if (list.length) {
    const marks = list.map((_, i) => `?${i + 1}`).join(",");
    const per = await db.prepare(
      `SELECT user_id AS id, substr(lesson_id, 1, instr(lesson_id, '/') - 1) AS course, COUNT(*) AS lessons
       FROM user_progress WHERE user_id IN (${marks}) AND instr(lesson_id, '/') > 1 GROUP BY user_id, course ORDER BY lessons DESC`
    ).bind(...list.map((r) => r.id)).all<{ id: string; course: string; lessons: number }>();
    for (const r of per.results ?? []) progress.set(r.id, [...(progress.get(r.id) ?? []), { course: r.course, lessons: r.lessons }]);
  }

  return {
    total,
    users: list.map((r) => ({
      email: r.email, name: r.name, nick: r.nick, createdAt: r.createdAt, lastActiveAt: r.lastActiveAt,
      method: r.hasPassword ? "password" : "social",
      verified: r.hasPassword ? r.verified === 1 : true,
      courses: parseCourses(r.courses), level: r.level, progress: progress.get(r.id) ?? [],
      xp: r.xp, lessons: r.lessons, tasks: r.tasks,
    })),
  };
}
