// GET /api/lesson?k=js&n=3 — повний урок і його практичне завдання. Лише для користувача, що увійшов
import type { Env } from "../../lib/env.ts";
import { lessonPayload } from "../../lib/content.ts";
import { currentUser, json } from "../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await currentUser(request, env))) return json({ error: "unauthorized" }, 401);
  const q = new URL(request.url).searchParams, k = q.get("k") ?? "", n = q.get("n") ?? "";
  const payload = /^[a-z]{1,12}$/.test(k) && /^[1-9]\d{0,2}$/.test(n) ? lessonPayload(k, Number(n)) : null;
  return payload ? json(payload) : json({ error: "not_found" }, 404);
};
