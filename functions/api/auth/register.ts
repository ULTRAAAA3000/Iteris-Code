// POST /api/auth/register — реєстрація за поштою й паролем; лист із підтвердженням пошти
import type { Env } from "../../../lib/env.ts";
import { allow, cleanName, clientIp, issueToken, normEmail, readBody } from "../../../lib/auth.ts";
import { mailConfigured, sendMail, verifyMail } from "../../../lib/mail.ts";
import { hashPassword, validPassword } from "../../../lib/password.ts";
import { createSession, json, sameOrigin, sessionCookies } from "../../../lib/session.ts";
import { verifyTurnstile } from "../../../lib/turnstile.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!env.SESSION_SECRET) return json({ error: "not_configured" }, 503);

  const b = await readBody(request);
  const email = normEmail(b.email);
  if (!email) return json({ error: "invalid_email" }, 400);
  if (!validPassword(b.password)) return json({ error: "weak_password" }, 400);
  const ip = clientIp(request);
  if ((await verifyTurnstile(env, b.turnstile, ip)) !== "ok") return json({ error: "captcha_failed" }, 400);
  if (!(await allow(env, "reg-ip:" + (ip ?? "?"), 10, 3600)) || !(await allow(env, "mail:" + email, 5, 3600))) return json({ error: "too_many_requests" }, 429);

  const mail = mailConfigured(env);
  const hash = await hashPassword(b.password);
  const name = cleanName(b.name);
  const old = await env.DB.prepare("SELECT id, email_verified FROM users WHERE lower(email) = ?1").bind(email).first<{ id: string; email_verified: number }>();

  let uid: string;
  if (!old) {
    uid = "u_" + crypto.randomUUID();
    await env.DB.prepare("INSERT INTO users (id, email, name, password_hash, email_verified) VALUES (?1, ?2, ?3, ?4, 0)").bind(uid, email, name, hash).run();
  } else if (!old.email_verified && mail) {
    // Повторна реєстрація, поки пошту не підтверджено: оновлюємо пароль і надсилаємо нове посилання
    uid = old.id;
    await env.DB.prepare("UPDATE users SET password_hash = ?1, name = COALESCE(?2, name) WHERE id = ?3").bind(hash, name, uid).run();
  } else if (!mail) {
    return json({ error: "email_taken" }, 409);   // без пошти тиха відповідь неможлива: користувач має знати, що акаунт уже є
  } else {
    return json({ ok: true });   // така пошта вже зареєстрована: відповідь однакова, щоб не розкривати наявність акаунта
  }

  if (!mail) {
    // Пошту не налаштовано: підтвердити адресу нема чим, тому акаунт одразу активний (email_verified лишається 0 і блокує привласнення через Google)
    return json({ ok: true, signedIn: true }, 200, { "Set-Cookie": sessionCookies(await createSession(env, uid, 30), 30 * 86400, request, env) });
  }

  const link = new URL(request.url).origin + "/#/verify/" + (await issueToken(env, uid, "verify"));
  const m = verifyMail(link);
  if (!(await sendMail(env, email, m.subject, m.text))) return json({ error: "mail_failed" }, 502);
  return json({ ok: true });
};
