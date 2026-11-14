// POST /api/auth/login — вхід за поштою й паролем
import type { Env } from "../../../lib/env.ts";
import { allow, clientIp, forget, normEmail, readBody } from "../../../lib/auth.ts";
import { dummyHash, verifyPassword } from "../../../lib/password.ts";
import { createSession, json, sameOrigin, sessionCookie } from "../../../lib/session.ts";
import { verifyTurnstile } from "../../../lib/turnstile.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!env.SESSION_SECRET || !env.TURNSTILE_SECRET_KEY) return json({ error: "not_configured" }, 503);

  const b = await readBody(request);
  const email = normEmail(b.email);
  if (!email || typeof b.password !== "string" || !b.password || b.password.length > 128) return json({ error: "invalid_credentials" }, 401);
  const ip = clientIp(request);
  if ((await verifyTurnstile(env, b.turnstile, ip)) !== "ok") return json({ error: "captcha_failed" }, 400);
  if (!(await allow(env, "login:" + email, 10, 900)) || !(await allow(env, "login-ip:" + (ip ?? "?"), 40, 900))) return json({ error: "too_many_requests" }, 429);

  const u = await env.DB.prepare("SELECT id, password_hash, email_verified FROM users WHERE lower(email) = ?1")
    .bind(email).first<{ id: string; password_hash: string | null; email_verified: number }>();
  const ok = await verifyPassword(b.password, u?.password_hash ?? (await dummyHash()));
  if (!u || !u.password_hash || !ok) return json({ error: "invalid_credentials" }, 401);
  if (!u.email_verified) return json({ error: "email_not_verified" }, 403);

  await forget(env, "login:" + email);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(await createSession(env, u.id, 30), 30 * 86400) });
};
