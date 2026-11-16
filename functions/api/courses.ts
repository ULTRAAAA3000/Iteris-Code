// GET /api/courses — структура всіх курсів і список завдань. Лише для користувача, що увійшов: уроки не публічні
import type { Env } from "../../lib/env.ts";
import { courseOutline } from "../../lib/content.ts";
import { currentUser, json } from "../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await currentUser(request, env))) return json({ error: "unauthorized" }, 401);
  return json(courseOutline());
};
