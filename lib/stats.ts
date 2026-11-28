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
  /** Що кому цікаво: скільки людей обрали курс в онбордингу, скільки справді вчаться (є пройдені уроки), скільки уроків пройдено, скільки на просунутому рівні */
  courses: CourseStat[];
  /** До 200 завдань, спершу з найбільшою кількістю спроб */
  tasks: TaskStat[];
  /** Розподіл за рівнем із онбордингу, денною ціллю, способом входу */
  levels: Bucket[];
  goals: Bucket[];
  methods: Bucket[];
  /** Активність: унікальні люди за 1, 7 і 30 днів; усього пройдено уроків; відправок завдань і частка успішних; звернень у підтримку */
  activity: { today: number; week: number; month: number; lessonsDone: number; submissions: number; passed: number; support: number; verified: number };
}
export interface CourseStat { course: string; chosen: number; learning: number; lessons: number; advanced: number; reach5: number; reach20: number }
/** Завдання: спроб усього, скільки людей пробувало й скільки розв'язали (успішна відправка хоча б раз) */
export interface TaskStat { id: string; attempts: number; users: number; solved: number }
export interface Bucket { key: string; count: number }

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

const rows = async <T>(db: D1Database, sql: string, ...p: unknown[]): Promise<T[]> => {
  try { return (await db.prepare(sql).bind(...p).all<T>()).results ?? []; } catch { return []; }
};

/** Вибрані курси лежать у user_onboarding.courses як JSON-масив; зіпсований рядок просто пропускаємо */
export const parseCourses = (raw: string | null): string[] => {
  try { const a: unknown = JSON.parse(raw ?? "[]"); return Array.isArray(a) ? a.filter((x): x is string => typeof x === "string") : []; } catch { return []; }
};

async function courseStats(db: D1Database): Promise<CourseStat[]> {
  const map = new Map<string, CourseStat>();
  const get = (k: string): CourseStat => { let c = map.get(k); if (!c) { c = { course: k, chosen: 0, learning: 0, lessons: 0, advanced: 0, reach5: 0, reach20: 0 }; map.set(k, c); } return c; };
  for (const r of await rows<{ courses: string }>(db, "SELECT courses FROM user_onboarding")) for (const k of new Set(parseCourses(r.courses))) get(k).chosen++;
  for (const r of await rows<{ c: string; users: number; lessons: number }>(db,
    "SELECT substr(lesson_id, 1, instr(lesson_id, '/') - 1) AS c, COUNT(DISTINCT user_id) AS users, COUNT(*) AS lessons FROM user_progress WHERE instr(lesson_id, '/') > 1 GROUP BY c"))
    { const c = get(r.c); c.learning = r.users; c.lessons = r.lessons; }
  for (const r of await rows<{ course: string; n: number }>(db, "SELECT course, COUNT(*) AS n FROM user_course_levels WHERE level = 'adv' GROUP BY course")) get(r.course).advanced = r.n;
  // Воронка: скільки людей дійшли до 5 і до 20 пройдених уроків курсу
  for (const r of await rows<{ c: string; r5: number; r20: number }>(db,
    `SELECT c, SUM(n >= 5) AS r5, SUM(n >= 20) AS r20 FROM (SELECT user_id, substr(lesson_id, 1, instr(lesson_id, '/') - 1) AS c, COUNT(*) AS n
       FROM user_progress WHERE instr(lesson_id, '/') > 1 GROUP BY user_id, c) GROUP BY c`)) { const c = get(r.c); c.reach5 = r.r5; c.reach20 = r.r20; }
  return [...map.values()].sort((a, b) => (b.chosen + b.learning) - (a.chosen + a.learning) || a.course.localeCompare(b.course));
}

const taskStats = (db: D1Database): Promise<TaskStat[]> => rows<TaskStat>(db,
  `SELECT task_id AS id, COUNT(*) AS attempts, COUNT(DISTINCT user_id) AS users, COUNT(DISTINCT CASE WHEN is_passed = 1 THEN user_id END) AS solved
   FROM task_submissions WHERE task_id IS NOT NULL GROUP BY task_id ORDER BY attempts DESC, task_id LIMIT 200`);

const buckets = async (db: D1Database, sql: string): Promise<Bucket[]> => (await rows<{ k: string | number | null; n: number }>(db, sql)).map((r) => ({ key: String(r.k ?? "—"), count: r.n }));

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

  const active = async (n: number): Promise<number> => num(db, `WITH ${ACT} SELECT COUNT(DISTINCT user_id) AS n FROM act WHERE d > date('now', ?1)`, `-${n} days`);
  const activity = {
    today: await num(db, `WITH ${ACT} SELECT COUNT(DISTINCT user_id) AS n FROM act WHERE d = date('now')`),
    week: await active(7),
    month: await active(30),
    lessonsDone: await num(db, "SELECT COUNT(*) AS n FROM user_progress"),
    submissions: await num(db, "SELECT COUNT(*) AS n FROM task_submissions"),
    passed: await num(db, "SELECT COUNT(*) AS n FROM task_submissions WHERE is_passed = 1"),
    support: await num(db, "SELECT COUNT(*) AS n FROM support_messages"),
    verified: await num(db, "SELECT COUNT(*) AS n FROM users WHERE password_hash IS NOT NULL AND email_verified = 1"),
  };

  return {
    generatedAt: new Date().toISOString(),
    totals,
    funnel,
    signups: fill(signups.results ?? [], days, today),
    dau: fill(dau.results ?? [], Math.min(days, 14), today),
    retention: { d1: await retention(1), d7: await retention(7) },
    courses: await courseStats(db),
    tasks: await taskStats(db),
    levels: await buckets(db, "SELECT level AS k, COUNT(*) AS n FROM user_onboarding GROUP BY level ORDER BY n DESC"),
    goals: await buckets(db, "SELECT daily_goal AS k, COUNT(*) AS n FROM user_goals GROUP BY daily_goal ORDER BY daily_goal"),
    methods: await buckets(db, "SELECT CASE WHEN password_hash IS NULL THEN 'social' ELSE 'password' END AS k, COUNT(*) AS n FROM users GROUP BY k ORDER BY n DESC"),
    activity,
  };
}
