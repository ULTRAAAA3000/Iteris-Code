// Самовосстановление схемы D1: недостающие таблицы и колонки создаются автоматически при первом запросе к API
// (один раз на экземпляр воркера). Так сайт работает, даже если миграции не выполнены вручную или остановились на ошибке.
// Всё идемпотентно. Источник истины остаётся schema.sql; тест tests/schema.test.mjs следит, чтобы они не расходились.
import type { Env } from "./env.ts";

const TABLES: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, avatar_url TEXT,
    is_pro INTEGER DEFAULT 0, pro_until DATETIME, streak_count INTEGER DEFAULT 0, last_active_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, portal_url TEXT, subscription_id TEXT, billing_updated_at TEXT,
    password_hash TEXT, email_verified INTEGER DEFAULT 1,
    nick TEXT, avatar_id TEXT, bio TEXT, profile_public INTEGER DEFAULT 0, session_ver INTEGER DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT, lesson_id TEXT, completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS task_submissions (
    id TEXT PRIMARY KEY, user_id TEXT, task_id TEXT, code TEXT, is_passed INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE INDEX IF NOT EXISTS idx_progress_user_time ON user_progress(user_id, completed_at)`,
  `CREATE INDEX IF NOT EXISTS idx_submissions_user_time ON task_submissions(user_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS payment_events (
    id TEXT PRIMARY KEY, provider TEXT NOT NULL, event_name TEXT, user_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS email_tokens (
    token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, kind TEXT NOT NULL, expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_tokens(user_id, kind)`,
  `CREATE TABLE IF NOT EXISTS auth_throttle (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL)`,
  // Этап 2: XP и онбординг (безвредны, пока код этапа 2 не задействован)
  `CREATE TABLE IF NOT EXISTS xp_events (
    user_id TEXT NOT NULL, amount INTEGER NOT NULL, reason TEXT NOT NULL, ref TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, reason, ref), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE INDEX IF NOT EXISTS idx_xp_user_time ON xp_events(user_id, created_at)`,
  // Жалобы на профили (модерация вручную до появления админки, этап 6)
  `CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY, reporter_id TEXT NOT NULL, nick TEXT NOT NULL, reason TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (reporter_id, nick))`,
  `CREATE TABLE IF NOT EXISTS user_onboarding (
    user_id TEXT PRIMARY KEY, level TEXT NOT NULL, courses TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS user_goals (
    user_id TEXT PRIMARY KEY, daily_goal INTEGER NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS user_course_levels (
    user_id TEXT NOT NULL, course TEXT NOT NULL, level TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS support_messages (
    id TEXT PRIMARY KEY, user_id TEXT, name TEXT, email TEXT NOT NULL, topic TEXT NOT NULL, message TEXT NOT NULL, meta TEXT,
    emailed INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS idx_support_time ON support_messages(created_at)`,
];

// Колонки, которые появились после первой версии таблицы users
const USER_COLUMNS: [string, string][] = [
  ["portal_url", "TEXT"], ["subscription_id", "TEXT"], ["billing_updated_at", "TEXT"],
  ["password_hash", "TEXT"], ["email_verified", "INTEGER DEFAULT 1"],   // существующие (Google) аккаунты считаются подтверждёнными
  ["nick", "TEXT"], ["avatar_id", "TEXT"], ["bio", "TEXT"], ["profile_public", "INTEGER DEFAULT 0"],   // этап 4: публичный профиль
  ["session_ver", "INTEGER DEFAULT 0"],   // версия сессий: смена пароля / «выйти всюду» отзывают старые cookie
];

async function run(env: Pick<Env, "DB">): Promise<void> {
  await env.DB.batch(TABLES.map((sql) => env.DB.prepare(sql)));   // одним запросом: холодный старт воркера не замедляется
  const { results } = await env.DB.prepare("SELECT name FROM pragma_table_info('users')").all<{ name: string }>();
  const have = new Set(results.map((r) => r.name));
  for (const [col, type] of USER_COLUMNS) {
    if (have.has(col)) continue;
    try {
      await env.DB.prepare(`ALTER TABLE users ADD COLUMN ${col} ${type}`).run();
    } catch (e) {
      if (!/duplicate column/i.test(String((e as Error)?.message ?? e))) throw e;   // параллельный запрос уже добавил колонку
    }
  }
  // Уникальный ник создаём после колонок: в старой базе колонки nick ещё могло не быть
  await env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nick ON users(nick) WHERE nick IS NOT NULL").run();
}

let ready: Promise<void> | null = null;
export function ensureSchema(env: Pick<Env, "DB">): Promise<void> {
  return (ready ??= run(env).catch((e) => { ready = null; throw e; }));
}
/** Только для тестов: сбросить кэш «схема уже проверена» */
export const resetSchemaCache = (): void => { ready = null; };
