// GET /api/dashboard — агрегированная статистика личного кабинета
import { currentUser, json, publicUser } from "../../lib/session.js";

export async function onRequestGet({ request, env }) {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);

  const q = (sql) => env.DB.prepare(sql).bind(u.id);
  const [progress, subs, actLessons, actTasks, passed] = await env.DB.batch([
    q("SELECT lesson_id, completed_at FROM user_progress WHERE user_id = ?1 ORDER BY completed_at DESC, rowid DESC"),
    q("SELECT task_id, is_passed, created_at FROM task_submissions WHERE user_id = ?1 ORDER BY created_at DESC LIMIT 5"),
    q("SELECT date(completed_at) AS d, COUNT(*) AS c FROM user_progress WHERE user_id = ?1 AND completed_at >= date('now', '-182 day') GROUP BY d"),
    q("SELECT date(created_at) AS d, COUNT(*) AS c FROM task_submissions WHERE user_id = ?1 AND created_at >= date('now', '-182 day') GROUP BY d"),
    q("SELECT COUNT(DISTINCT task_id) AS c FROM task_submissions WHERE user_id = ?1 AND is_passed = 1"),
  ]);

  const activity = {};
  for (const r of [...actLessons.results, ...actTasks.results]) activity[r.d] = (activity[r.d] || 0) + r.c;

  return json({
    user: publicUser(u),
    completedLessons: progress.results.map((r) => r.lesson_id),
    lastLesson: progress.results.length ? progress.results[0].lesson_id : null,
    tasksPassed: passed.results[0] ? passed.results[0].c : 0,
    recentSubmissions: subs.results.map((r) => ({ taskId: r.task_id, passed: !!r.is_passed, at: r.created_at })),
    activity,
  });
}
