// POST /api/auth/logout — очищення cookie сесії
import type { Env } from "../../../lib/env.ts";
import { json, sameOrigin, sessionCookies } from "../../../lib/session.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookies("", 0, request, env) });
};
