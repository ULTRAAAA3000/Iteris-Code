// GET /api/dashboard — агреговані дані особистого кабінету
import type { Env } from "../../lib/env.ts";
import { currentUser, json, publicUser } from "../../lib/session.ts";

interface Row { [k: string]: string | number }

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);

  const q = (sql: string) => env.DB.prepare(sql).bind(u.id);
  const [progress, subs, actLessons, actTasks, passed] = (await env.DB.batch<Row>([
    q("SELECT lesson_id, completed_at FROM user_progress WHERE user_id = ?1 ORDER BY completed_at DESC, rowid DESC"),
    q("SELECT task_id, is_passed, created_at FROM task_submissions WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 5"),
    q("SELECT date(completed_at) AS d, COUNT(*) AS c FROM user_progress WHERE user_id = ?1 AND completed_at >= date('now', '-182 day') GROUP BY d"),
    q("SELECT date(created_at) AS d, COUNT(*) AS c FROM task_submissions WHERE user_id = ?1 AND created_at >= date('now', '-182 day') GROUP BY d"),
    q("SELECT DISTINCT task_id FROM task_submissions WHERE user_id = ?1 AND is_passed = 1"),
  ])).map((r) => r.results);

  const activity: Record<string, number> = {};
  for (const r of [...actLessons, ...actTasks]) activity[String(r.d)] = (activity[String(r.d)] || 0) + Number(r.c);

  return json({
    user: publicUser(u),
    completedLessons: progress.map((r) => String(r.lesson_id)),
    lastLesson: progress.length ? String(progress[0].lesson_id) : null,
    passedTasks: passed.map((r) => String(r.task_id)),
    tasksPassed: passed.length,
    recentSubmissions: subs.map((r) => ({ taskId: String(r.task_id), passed: !!r.is_passed, at: String(r.created_at) })),
    activity,
  });
};
