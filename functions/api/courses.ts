// GET /api/courses — структура всіх курсів і список завдань + обраний рівень курсів. Лише для користувача, що увійшов: уроки не публічні
import type { Env } from "../../lib/env.ts";
import { courseOutline } from "../../lib/content.ts";
import { loadLevels } from "../../lib/levels.ts";
import { currentUser, json } from "../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  return json({ ...courseOutline(), levels: await loadLevels(env, u.id) });
};
