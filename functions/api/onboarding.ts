// GET /api/onboarding — вибір рівня й курсів після першої реєстрації (null, якщо ще не обирали); POST — зберегти вибір
import type { Env } from "../../lib/env.ts";
import { currentUser, json, sameOrigin } from "../../lib/session.ts";
import { loadGoal, saveGoal } from "../../lib/goal.ts";
import { courseExists, loadOnboarding } from "../../lib/xp.ts";
import { isGoal } from "../../src/goal.ts";
import { isLevel } from "../../src/xp.ts";

const MAX_COURSES = 5;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  return json({ onboarding: await loadOnboarding(env, u.id), goal: await loadGoal(env, u.id) });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  let body: { level?: unknown; courses?: unknown; dailyGoal?: unknown };
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const courses = Array.isArray(body.courses) ? [...new Set<unknown>(body.courses)] : [];
  if (!isLevel(body.level) || !courses.length || courses.length > MAX_COURSES || courses.some((c) => typeof c !== "string" || !courseExists(c))) {
    return json({ error: "bad_request" }, 400);
  }
  if (body.dailyGoal !== undefined && !isGoal(body.dailyGoal)) return json({ error: "bad_request" }, 400);   // ціль необов'язкова, але некоректну не приймаємо
  await env.DB.prepare(
    "INSERT INTO user_onboarding (user_id, level, courses) VALUES (?1, ?2, ?3) ON CONFLICT(user_id) DO UPDATE SET level = excluded.level, courses = excluded.courses"
  ).bind(u.id, body.level, JSON.stringify(courses)).run();
  if (isGoal(body.dailyGoal)) await saveGoal(env, u.id, body.dailyGoal);
  return json({ ok: true, onboarding: { level: body.level, courses } });
};
