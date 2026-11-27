// GET /api/admin/users?q=…&course=…&offset=… — список акаунтів і пошт для власника (сторінка /admin). Для всіх інших відповідає 404.
// Містить персональні дані, тому перевірка isAdmin тут така сама, як у /api/admin/stats, а відповідь не кешується (json() ставить no-store).
import type { Env } from "../../../lib/env.ts";
import { isAdmin } from "../../../lib/admin.ts";
import { listUsers } from "../../../lib/admin-users.ts";
import { currentUser, json } from "../../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u || !(await isAdmin(env, u.id))) return json({ error: "not_found" }, 404);   // існування сторінки не розкриваємо
  const url = new URL(request.url);
  return json(await listUsers(env.DB, { q: url.searchParams.get("q") ?? "", course: url.searchParams.get("course") ?? "", offset: Number(url.searchParams.get("offset")) || 0 }));
};
