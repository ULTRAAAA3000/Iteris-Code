// GET /api/dashboard — агреговані дані особистого кабінету
import type { Env } from "../../lib/env.ts";
import { factFor } from "../../lib/facts.ts";
import { goalInfo } from "../../lib/goal.ts";
import { currentUser, json, publicUser } from "../../lib/session.ts";
import { loadOnboarding, syncXp } from "../../lib/xp.ts";

interface Row { [k: string]: string | number }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);

  const q = (sql: string) => env.DB.prepare(sql).bind(u.id);
  const [progress, subs, actLessons, actTasks, passed, dayLessons, dayTasks] = (await env.DB.batch<Row>([
    q("SELECT lesson_id, completed_at FROM user_progress WHERE user_id = ?1 ORDER BY completed_at DESC, rowid DESC"),
    q("SELECT task_id, is_passed, created_at FROM task_submissions WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 5"),
    q("SELECT date(completed_at) AS d, COUNT(*) AS c FROM user_progress WHERE user_id = ?1 AND completed_at >= date('now', '-182 day') GROUP BY d"),
    q("SELECT date(created_at) AS d, COUNT(*) AS c FROM task_submissions WHERE user_id = ?1 AND created_at >= date('now', '-182 day') GROUP BY d"),
    q("SELECT DISTINCT task_id FROM task_submissions WHERE user_id = ?1 AND is_passed = 1"),
    q("SELECT lesson_id, date(completed_at) AS d FROM user_progress WHERE user_id = ?1 AND completed_at >= date('now', '-182 day')"),
    q("SELECT DISTINCT task_id, date(created_at) AS d FROM task_submissions WHERE user_id = ?1 AND is_passed = 1 AND created_at >= date('now', '-182 day')"),
  ])).map((r) => r.results);

  // Етап 2: XP нараховується тут же (ідемпотентно), щоб кабінет завжди показував актуальні значення
  const xp = await syncXp(env, u);
  // Для календаря: що саме пройдено в кожен день (дні за UTC)
  const days: Record<string, { l: string[]; t: string[] }> = {};
  for (const r of dayLessons) (days[String(r.d)] ??= { l: [], t: [] }).l.push(String(r.lesson_id));
  for (const r of dayTasks) (days[String(r.d)] ??= { l: [], t: [] }).t.push(String(r.task_id));

  const activity: Record<string, number> = {};
  for (const r of [...actLessons, ...actTasks]) activity[String(r.d)] = (activity[String(r.d)] || 0) + Number(r.c);

  const onboarding = await loadOnboarding(env, u.id);
  const goal = await goalInfo(env, u.id);
  return json({
    user: publicUser(u),
    completedLessons: progress.map((r) => String(r.lesson_id)),
    lastLesson: progress.length ? String(progress[0].lesson_id) : null,
    passedTasks: passed.map((r) => String(r.task_id)),
    tasksPassed: passed.length,
    recentSubmissions: subs.map((r) => ({ taskId: String(r.task_id), passed: !!r.is_passed, at: String(r.created_at) })),
    activity,
    xp: xp.total,
    onboarding,
    goal,   // денна ціль: скільки кроків заплановано й зроблено сьогодні
    days,
    fact: factFor(u.id, onboarding?.courses, Date.now()),   // плашка «Цікавий факт»: новий раз на 5 годин
  });
};
