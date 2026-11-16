// GET /api/project?id=js-todo — проєкт за ТЗ: умови, вимоги з перевірками, заготовка. Лише для користувача, що увійшов
import type { Env } from "../../lib/env.ts";
import { projectById } from "../../content/projects/index.ts";
import { currentUser, json } from "../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await currentUser(request, env))) return json({ error: "unauthorized" }, 401);
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const project = /^[a-z0-9-]{1,40}$/.test(id) ? projectById(id) : undefined;
  return project ? json(project) : json({ error: "not_found" }, 404);
};
