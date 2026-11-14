// POST /api/auth/forgot — лист із посиланням для відновлення пароля (відповідь завжди однакова)
import type { Env } from "../../../lib/env.ts";
import { allow, clientIp, issueToken, normEmail, readBody } from "../../../lib/auth.ts";
import { mailConfigured, resetMail, sendMail } from "../../../lib/mail.ts";
import { json, sameOrigin } from "../../../lib/session.ts";
import { verifyTurnstile } from "../../../lib/turnstile.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!mailConfigured(env)) return json({ error: "not_configured" }, 503);

  const b = await readBody(request);
  const email = normEmail(b.email);
  if (!email) return json({ error: "invalid_email" }, 400);
  const ip = clientIp(request);
  if ((await verifyTurnstile(env, b.turnstile, ip)) !== "ok") return json({ error: "captcha_failed" }, 400);
  if (!(await allow(env, "forgot-ip:" + (ip ?? "?"), 10, 3600)) || !(await allow(env, "mail:" + email, 5, 3600))) return json({ error: "too_many_requests" }, 429);

  const u = await env.DB.prepare("SELECT id FROM users WHERE lower(email) = ?1").bind(email).first<{ id: string }>();
  if (u) {
    const m = resetMail(new URL(request.url).origin + "/#/reset/" + (await issueToken(env, u.id, "reset")));
    await sendMail(env, email, m.subject, m.text);
  }
  return json({ ok: true });
};
