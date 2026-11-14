// POST /api/auth/reset — новий пароль за одноразовим токеном із листа
import type { Env } from "../../../lib/env.ts";
import { allow, clientIp, consumeToken, readBody } from "../../../lib/auth.ts";
import { hashPassword, validPassword } from "../../../lib/password.ts";
import { json, sameOrigin } from "../../../lib/session.ts";
import { verifyTurnstile } from "../../../lib/turnstile.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!env.TURNSTILE_SECRET_KEY) return json({ error: "not_configured" }, 503);

  const b = await readBody(request);
  if (!validPassword(b.password)) return json({ error: "weak_password" }, 400);   // перевіряємо до споживання токена, щоб слабкий пароль його не «спалив»
  const ip = clientIp(request);
  if ((await verifyTurnstile(env, b.turnstile, ip)) !== "ok") return json({ error: "captcha_failed" }, 400);
  if (!(await allow(env, "reset-ip:" + (ip ?? "?"), 20, 3600))) return json({ error: "too_many_requests" }, 429);

  const uid = await consumeToken(env, b.token, "reset");
  if (!uid) return json({ error: "invalid_token" }, 400);
  // Лист дійшов до власника пошти, тож пошту вважаємо підтвердженою; решту токенів користувача скасовуємо
  await env.DB.prepare("UPDATE users SET password_hash = ?1, email_verified = 1 WHERE id = ?2").bind(await hashPassword(b.password), uid).run();
  await env.DB.prepare("DELETE FROM email_tokens WHERE user_id = ?1").bind(uid).run();
  return json({ ok: true });
};
