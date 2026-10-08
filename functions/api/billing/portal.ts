// GET /api/billing/portal — посилання на керування підпискою (скасування, зміна картки)
import type { Env } from "../../../lib/env.ts";
import { isLemonUrl } from "../../../lib/billing.ts";
import { currentUser, json } from "../../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  const row = await env.DB.prepare("SELECT portal_url FROM users WHERE id = ?1").bind(u.id).first<{ portal_url: string | null }>();
  return isLemonUrl(row?.portal_url) ? json({ url: row.portal_url }) : json({ error: "not_found" }, 404);
};
