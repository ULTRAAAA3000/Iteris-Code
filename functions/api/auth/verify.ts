// POST /api/auth/verify — підтвердження пошти за токеном із листа; одразу відкриває сесію
import type { Env } from "../../../lib/env.ts";
import { allow, clientIp, consumeToken, readBody } from "../../../lib/auth.ts";
import { createSession, json, sameOrigin, sessionCookies } from "../../../lib/session.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!env.SESSION_SECRET) return json({ error: "not_configured" }, 503);
  if (!(await allow(env, "verify-ip:" + (clientIp(request) ?? "?"), 30, 3600))) return json({ error: "too_many_requests" }, 429);

  const uid = await consumeToken(env, (await readBody(request)).token, "verify");
  if (!uid) return json({ error: "invalid_token" }, 400);
  await env.DB.prepare("UPDATE users SET email_verified = 1 WHERE id = ?1").bind(uid).run();
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookies(await createSession(env, uid, 30), 30 * 86400, request, env) });
};
