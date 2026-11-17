// POST /api/auth/logout — очищення cookie сесії; з тілом { "all": true } ще й відкликає сесії на всіх пристроях
import type { Env } from "../../../lib/env.ts";
import { currentUser, json, sameOrigin, sessionCookies } from "../../../lib/session.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  let all = false;
  try { all = ((await request.json()) as { all?: unknown })?.all === true; } catch { /* порожнє тіло: звичайний вихід */ }
  if (all) {
    const u = await currentUser(request, env);
    if (u) await env.DB.prepare("UPDATE users SET session_ver = COALESCE(session_ver, 0) + 1 WHERE id = ?1").bind(u.id).run();
  }
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookies("", 0, request, env) });
};
