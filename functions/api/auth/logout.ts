// POST /api/auth/logout — очищення cookie сесії
import type { Env } from "../../../lib/env.ts";
import { json, sameOrigin, sessionCookie } from "../../../lib/session.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
};
