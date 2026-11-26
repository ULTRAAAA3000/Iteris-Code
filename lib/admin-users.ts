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
}
export interface AdminUsersPage { total: number; users: AdminUser[] }

export const USERS_PAGE = 50;
const MAX_PAGE = 100;

/** Спецсимволи LIKE (% _ \) у пошуку шукаємо як звичайні літери */
const likeEscape = (s: string): string => s.replace(/[\\%_]/g, (c) => "\\" + c);

interface Row {
  email: string; name: string | null; nick: string | null; createdAt: string | null; lastActiveAt: string | null;
  hasPassword: number; verified: number | null;
}

export async function listUsers(db: D1Database, opts: { q?: string; offset?: number; limit?: number } = {}): Promise<AdminUsersPage> {
  const q = (opts.q ?? "").trim().slice(0, 100);
  const limit = Math.min(MAX_PAGE, Math.max(1, Math.floor(opts.limit ?? USERS_PAGE)));
  const offset = Math.max(0, Math.floor(opts.offset ?? 0));
  const like = `%${likeEscape(q)}%`;
  const where = "(?1 = '' OR email LIKE ?2 ESCAPE '\\' OR name LIKE ?2 ESCAPE '\\' OR nick LIKE ?2 ESCAPE '\\')";

  const total = (await db.prepare(`SELECT COUNT(*) AS n FROM users WHERE ${where}`).bind(q, like).first<{ n: number }>())?.n ?? 0;
  const rows = await db.prepare(
    `SELECT email, name, nick, created_at AS createdAt, last_active_at AS lastActiveAt,
            CASE WHEN password_hash IS NULL THEN 0 ELSE 1 END AS hasPassword, email_verified AS verified
     FROM users WHERE ${where} ORDER BY created_at DESC, email LIMIT ?3 OFFSET ?4`
  ).bind(q, like, limit, offset).all<Row>();

  return {
    total,
    users: (rows.results ?? []).map((r) => ({
      email: r.email, name: r.name, nick: r.nick, createdAt: r.createdAt, lastActiveAt: r.lastActiveAt,
      method: r.hasPassword ? "password" : "social",
      verified: r.hasPassword ? r.verified === 1 : true,
    })),
  };
}
