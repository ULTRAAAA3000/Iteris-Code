// GET /api/admin/user?email=… — картка одного акаунта для власника: останній XP, відправки завдань і звернення. Для всіх інших 404.
import type { Env } from "../../../lib/env.ts";
import { isAdmin } from "../../../lib/admin.ts";
import { userDetails } from "../../../lib/admin-users.ts";
import { currentUser, json } from "../../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u || !(await isAdmin(env, u.id))) return json({ error: "not_found" }, 404);
  const d = await userDetails(env.DB, new URL(request.url).searchParams.get("email") ?? "");
  return d ? json(d) : json({ error: "not_found" }, 404);
};
