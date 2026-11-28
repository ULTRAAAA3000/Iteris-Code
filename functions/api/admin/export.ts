// GET /api/admin/export?q=…&course=… — CSV зі списком акаунтів (той самий пошук і фільтр, що на сторінці /admin). Для всіх інших 404.
import type { Env } from "../../../lib/env.ts";
import { isAdmin } from "../../../lib/admin.ts";
import { usersCsv } from "../../../lib/admin-users.ts";
import { currentUser, json } from "../../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u || !(await isAdmin(env, u.id))) return json({ error: "not_found" }, 404);
  const url = new URL(request.url);
  const csv = await usersCsv(env.DB, { q: url.searchParams.get("q") ?? "", course: url.searchParams.get("course") ?? "" });
  return new Response("﻿" + csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="iteris-users.csv"', "cache-control": "no-store" } });
};
