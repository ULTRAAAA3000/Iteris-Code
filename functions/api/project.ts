// GET /api/project?id=js-todo — проєкт за ТЗ: умови, вимоги з перевірками, заготовка. Лише для користувача, що увійшов.
// Для програмних проєктів (Go) прихований harness у відповідь не потрапляє: перевірки виконуються лише на сервері (/api/project-run)
import type { Env } from "../../lib/env.ts";
import { projectById } from "../../content/projects/index.ts";
import { currentUser, json } from "../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await currentUser(request, env))) return json({ error: "unauthorized" }, 401);
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const project = /^[a-z0-9-]{1,40}$/.test(id) ? projectById(id) : undefined;
  if (!project) return json({ error: "not_found" }, 404);
  if ("harness" in project) { const { harness: _h, ...open } = project; return json(open); }
  return json(project);
};
