// GET /api/me — поточний користувач, статус Pro і стрік (для гостя user = null)
import type { Env } from "../../lib/env.ts";
import { currentUser, json, publicUser } from "../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  return json({ user: u ? publicUser(u) : null });
};
