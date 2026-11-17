// GET /api/admin/stats — зведена аналітика для власника (воронка, реєстрації, активність, утримання). Для всіх інших відповідає 404.
import type { Env } from "../../../lib/env.ts";
import { isAdmin } from "../../../lib/admin.ts";
import { computeStats } from "../../../lib/stats.ts";
import { currentUser, json } from "../../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u || !(await isAdmin(env, u.id))) return json({ error: "not_found" }, 404);   // існування сторінки не розкриваємо
  return json(await computeStats(env.DB));
};
