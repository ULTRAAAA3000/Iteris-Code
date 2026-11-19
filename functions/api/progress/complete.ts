// POST /api/progress/complete — зберегти результат практичного завдання
import type { Env } from "../../../lib/env.ts";
import { allow } from "../../../lib/auth.ts";
import { verifyProof } from "../../../lib/proof.ts";
import { bumpStreak, currentUser, effectiveStreak, isProActive, json, sameOrigin } from "../../../lib/session.ts";
import { taskById } from "../../../content/tasks/index.ts";
import { practiceById } from "../../../lib/practice.ts";
import { programProjectById, projectById } from "../../../content/projects/index.ts";
import { isRemote } from "../../../src/tasks/types.ts";

const MAX_CODE = 20000;
const MAX_PROJECT_CODE = 60000;   // проєкт — це цілий файл HTML, CSS і JS
const MAX_PER_MINUTE = 20;
const MAX_PER_DAY = 600;       // суточный лимит спроб на користувача: захист від заповнення бази й накрутки
const KEEP_FAILED = 5;         // скільки останніх невдалих спроб за завдання зберігаємо

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);

  let body: { taskId?: unknown; code?: unknown; passed?: unknown; proof?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const task = typeof body.taskId === "string" ? practiceById(body.taskId) : undefined;
  if (!task || typeof body.code !== "string" || body.code.length > (projectById(task.id) ? MAX_PROJECT_CODE : MAX_CODE) || typeof body.passed !== "boolean") {
    return json({ error: "bad_request" }, 400);
  }
  // Преміум-завдання доступні лише з активною підпискою Pro (перевірка на сервері)
  if (task.premium && !isProActive(u)) return json({ error: "pro_required" }, 402);

  // Віддалені завдання (Go тощо) запускає сам сервер: «пройдено» приймається лише з його підписом, прапорцю від браузера не вірити
  let passed = body.passed;
  const full = taskById(task.id);
  if ((full && isRemote(full)) || programProjectById(task.id)) passed = await verifyProof(env, body.proof, u.id, task.id, body.code);

  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM task_submissions WHERE user_id = ?1 AND created_at > datetime('now', '-1 minute')"
  ).bind(u.id).first<{ c: number }>();
  if ((recent?.c ?? 0) >= MAX_PER_MINUTE) return json({ error: "rate_limited" }, 429);

  if (!(await allow(env, "sub-day:" + u.id, MAX_PER_DAY, 86400))) return json({ error: "rate_limited" }, 429);

  const earlier = await env.DB.prepare("SELECT 1 AS x FROM task_submissions WHERE user_id = ?1 AND task_id = ?2 AND is_passed = 1 LIMIT 1")
    .bind(u.id, task.id).first();

  // Зберігаємо не все підряд: пройдений розв'язок один на завдання, невдалих лише останні KEEP_FAILED (інакше акаунт роздуває базу)
  if (!(passed && earlier)) {
    await env.DB.prepare("INSERT INTO task_submissions (id, user_id, task_id, code, is_passed) VALUES (?1, ?2, ?3, ?4, ?5)")
      .bind(crypto.randomUUID(), u.id, task.id, body.code, passed ? 1 : 0).run();
    await env.DB.prepare(
      `DELETE FROM task_submissions WHERE user_id = ?1 AND task_id = ?2 AND is_passed = 0 AND id NOT IN
         (SELECT id FROM task_submissions WHERE user_id = ?1 AND task_id = ?2 AND is_passed = 0 ORDER BY created_at DESC, rowid DESC LIMIT ?3)`
    ).bind(u.id, task.id, KEEP_FAILED).run();
  }

  let streak = effectiveStreak(u);
  if (passed) {
    streak = bumpStreak(u);
    await env.DB.prepare("UPDATE users SET streak_count = ?1, last_active_at = CURRENT_TIMESTAMP WHERE id = ?2").bind(streak, u.id).run();
  }
  const firstSolve = passed && !earlier;
  return json({ ok: true, streak, firstSolve, xp: firstSolve ? task.xp : 0 });
};
