// POST /api/auth/logout — очистка cookie сессии
import { json, sameOrigin, sessionCookie } from "../../../lib/session.js";

export async function onRequestPost({ request }) {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
}
