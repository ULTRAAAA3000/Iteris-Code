// GET /api/goal — ціль на сьогодні й скільки вже зроблено; POST { goal } — змінити денну ціль (1, 2, 3 або 5 кроків)
import type { Env } from "../../lib/env.ts";
import { goalInfo, saveGoal } from "../../lib/goal.ts";
import { currentUser, json, sameOrigin } from "../../lib/session.ts";
import { isGoal } from "../../src/goal.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  return json({ goal: await goalInfo(env, u.id) });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  let body: { goal?: unknown };
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  if (!isGoal(body.goal)) return json({ error: "bad_request" }, 400);
  await saveGoal(env, u.id, body.goal);
  return json({ ok: true, goal: await goalInfo(env, u.id) });
};
