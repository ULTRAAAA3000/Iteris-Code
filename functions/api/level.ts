// POST /api/level { course, level } — перемкнути рівень курсу: "base" (базовий) або "adv" (просунутий). Лише для курсів, де є просунуті уроки
import type { Env } from "../../lib/env.ts";
import { hasLevels, isLevel, loadLevels, saveLevel } from "../../lib/levels.ts";
import { currentUser, json, sameOrigin } from "../../lib/session.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  let body: { course?: unknown; level?: unknown };
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  if (typeof body.course !== "string" || !hasLevels(body.course) || !isLevel(body.level)) return json({ error: "bad_request" }, 400);
  await saveLevel(env, u.id, body.course, body.level);
  return json({ ok: true, levels: await loadLevels(env, u.id) });
};
