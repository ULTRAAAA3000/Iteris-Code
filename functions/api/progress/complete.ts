// POST /api/progress/complete — зберегти результат практичного завдання
import type { Env } from "../../../lib/env.ts";
import { bumpStreak, currentUser, effectiveStreak, isProActive, json, sameOrigin } from "../../../lib/session.ts";
import { taskById } from "../../../src/tasks/index.ts";

const MAX_CODE = 20000;
const MAX_PER_MINUTE = 20;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);

  let body: { taskId?: unknown; code?: unknown; passed?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const task = typeof body.taskId === "string" ? taskById(body.taskId) : undefined;
  if (!task || typeof body.code !== "string" || body.code.length > MAX_CODE || typeof body.passed !== "boolean") {
    return json({ error: "bad_request" }, 400);
  }
  // Преміум-завдання доступні лише з активною підпискою Pro (перевірка на сервері)
  if (task.premium && !isProActive(u)) return json({ error: "pro_required" }, 402);

  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM task_submissions WHERE user_id = ?1 AND created_at > datetime('now', '-1 minute')"
  ).bind(u.id).first<{ c: number }>();
  if ((recent?.c ?? 0) >= MAX_PER_MINUTE) return json({ error: "rate_limited" }, 429);

  const earlier = await env.DB.prepare("SELECT 1 AS x FROM task_submissions WHERE user_id = ?1 AND task_id = ?2 AND is_passed = 1 LIMIT 1")
    .bind(u.id, task.id).first();

  await env.DB.prepare("INSERT INTO task_submissions (id, user_id, task_id, code, is_passed) VALUES (?1, ?2, ?3, ?4, ?5)")
    .bind(crypto.randomUUID(), u.id, task.id, body.code, body.passed ? 1 : 0).run();

  let streak = effectiveStreak(u);
  if (body.passed) {
    streak = bumpStreak(u);
    await env.DB.prepare("UPDATE users SET streak_count = ?1, last_active_at = CURRENT_TIMESTAMP WHERE id = ?2").bind(streak, u.id).run();
  }
  const firstSolve = body.passed && !earlier;
  return json({ ok: true, streak, firstSolve, xp: firstSolve ? task.xp : 0 });
};
