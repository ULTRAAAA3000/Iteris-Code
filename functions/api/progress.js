// GET /api/progress — список пройденных уроков; POST — отметить/снять отметку (lessonIds: ["python/3"])
import { bumpStreak, currentUser, effectiveStreak, json, sameOrigin } from "../../lib/session.js";

const ID = /^[a-z]{2,12}\/[1-9]\d{0,2}$/;

export async function onRequestGet({ request, env }) {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  const { results } = await env.DB.prepare("SELECT lesson_id FROM user_progress WHERE user_id = ?1").bind(u.id).all();
  return json({ lessonIds: results.map((r) => r.lesson_id) });
}

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "bad_request" }, 400);
  }
  const ids = Array.isArray(body.lessonIds) ? [...new Set(body.lessonIds)] : [];
  if (!ids.length || ids.length > 200 || ids.some((x) => typeof x !== "string" || !ID.test(x))) return json({ error: "bad_request" }, 400);

  const list = JSON.stringify(ids);
  if (body.done === false) {
    await env.DB.prepare("DELETE FROM user_progress WHERE user_id = ?1 AND lesson_id IN (SELECT value FROM json_each(?2))").bind(u.id, list).run();
    return json({ ok: true, streak: effectiveStreak(u) });
  }

  await env.DB.prepare("INSERT OR IGNORE INTO user_progress (user_id, lesson_id) SELECT ?1, value FROM json_each(?2)").bind(u.id, list).run();
  // Первичная синхронизация локального прогресса (sync) не считается новой активностью
  if (body.sync === true) return json({ ok: true, streak: effectiveStreak(u) });

  const streak = bumpStreak(u);
  await env.DB.prepare("UPDATE users SET streak_count = ?1, last_active_at = CURRENT_TIMESTAMP WHERE id = ?2").bind(streak, u.id).run();
  return json({ ok: true, streak });
}
