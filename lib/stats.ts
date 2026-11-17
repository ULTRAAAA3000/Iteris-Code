// Аналітика без cookie й без окремого трекінгу: усе рахується з даних, які вже є (users, user_onboarding, user_progress, xp_events, task_submissions).
// Персональних даних не повертає: лише кількості й дати. Показується на закритій сторінці /admin (Documentation/mvp.md, Б1).

export interface DayCount { day: string; count: number }
export interface Retention { cohort: number; returned: number }
export interface Stats {
  generatedAt: string;
  totals: { users: number; publicProfiles: number; reports: number };
  /** Воронка: скільки людей дійшло до кожного кроку (кроки вкладені один в один) */
  funnel: { registered: number; onboarded: number; firstLesson: number; firstTask: number; returned: number; habit: number };
  signups: DayCount[];
  dau: DayCount[];
  /** D1: з тих, хто зареєструвався вчора або раніше, скільки були активні наступного дня; D7: рівно через 7 днів */
  retention: { d1: Retention; d7: Retention };
}

// Дні активності користувача: будь-який урок, будь-яка відправка, будь-яке XP
const ACT = `act AS (
  SELECT user_id, date(created_at) AS d FROM xp_events
  UNION SELECT user_id, date(completed_at) FROM user_progress
  UNION SELECT user_id, date(created_at) FROM task_submissions
)`;

const num = async (db: D1Database, sql: string, ...p: unknown[]): Promise<number> => {
  try {
    const r = await db.prepare(sql).bind(...p).first<{ n: number | null }>();
    return r?.n ?? 0;
  } catch {
    return 0;   // таблиці ще немає (наприклад reports): рахуємо нулем
  }
};

/** Порожні дні заповнюємо нулями, щоб графік не «стрибав» */
function fill(rows: DayCount[], days: number, today: string): DayCount[] {
  const map = new Map(rows.map((r) => [r.day, r.count]));
  const out: DayCount[] = [];
  const base = Date.parse(today + "T00:00:00Z");
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(base - i * 86400000).toISOString().slice(0, 10);
    out.push({ day, count: map.get(day) ?? 0 });
  }
  return out;
}

export async function computeStats(db: D1Database, days = 30): Promise<Stats> {
  const today = (await db.prepare("SELECT date('now') AS d").first<{ d: string }>())?.d ?? new Date().toISOString().slice(0, 10);

  const totals = {
    users: await num(db, "SELECT COUNT(*) AS n FROM users"),
    publicProfiles: await num(db, "SELECT COUNT(*) AS n FROM users WHERE profile_public = 1"),
    reports: await num(db, "SELECT COUNT(*) AS n FROM reports"),
  };

  const funnel = {
    registered: totals.users,
    onboarded: await num(db, "SELECT COUNT(*) AS n FROM user_onboarding"),
    firstLesson: await num(db, "SELECT COUNT(DISTINCT user_id) AS n FROM user_progress"),
    firstTask: await num(db, "SELECT COUNT(DISTINCT user_id) AS n FROM xp_events WHERE reason = 'task'"),
    returned: await num(db, `WITH ${ACT} SELECT COUNT(*) AS n FROM (SELECT user_id FROM act GROUP BY user_id HAVING COUNT(DISTINCT d) >= 2)`),
    habit: await num(db, `WITH ${ACT} SELECT COUNT(*) AS n FROM (SELECT user_id FROM act GROUP BY user_id HAVING COUNT(DISTINCT d) >= 7)`),
  };

  const signups = await db.prepare("SELECT date(created_at) AS day, COUNT(*) AS count FROM users WHERE date(created_at) > date('now', ?1) GROUP BY day").bind(`-${days} days`).all<DayCount>();
  const dau = await db.prepare(`WITH ${ACT} SELECT d AS day, COUNT(DISTINCT user_id) AS count FROM act WHERE d > date('now', ?1) GROUP BY d`).bind(`-${days} days`).all<DayCount>();

  const retention = async (n: number): Promise<Retention> => {
    const r = await db.prepare(
      `WITH ${ACT} SELECT COUNT(*) AS cohort,
         COALESCE(SUM(EXISTS (SELECT 1 FROM act WHERE act.user_id = u.id AND act.d = date(u.created_at, ?1))), 0) AS returned
       FROM users u WHERE date(u.created_at) <= date('now', ?2)`
    ).bind(`+${n} days`, `-${n} days`).first<Retention>();
    return { cohort: r?.cohort ?? 0, returned: r?.returned ?? 0 };
  };

  return {
    generatedAt: new Date().toISOString(),
    totals,
    funnel,
    signups: fill(signups.results ?? [], days, today),
    dau: fill(dau.results ?? [], Math.min(days, 14), today),
    retention: { d1: await retention(1), d7: await retention(7) },
  };
}
