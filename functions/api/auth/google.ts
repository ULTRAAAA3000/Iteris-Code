// POST /api/auth/google — обмін коду Google на сесію
import type { Env } from "../../../lib/env.ts";
import { createSession, json, sameOrigin, sessionCookie } from "../../../lib/session.ts";

interface GoogleProfile {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.SESSION_SECRET) return json({ error: "not_configured" }, 500);

  let code: unknown;
  try {
    code = ((await request.json()) as { code?: unknown }).code;
  } catch {
    /* некоректне тіло */
  }
  if (typeof code !== "string" || !code) return json({ error: "bad_request" }, 400);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: new URL(request.url).origin + "/",
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return json({ error: "token_exchange_failed" }, 401);
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const profRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: "Bearer " + access_token } });
  if (!profRes.ok) return json({ error: "profile_failed" }, 401);
  const p = (await profRes.json()) as GoogleProfile;
  if (!p.sub || !p.email || p.email_verified === false) return json({ error: "unverified_account" }, 401);

  // Якщо з цією поштою вже є акаунт, створений за паролем, прив'язуємо Google до нього (пошту підтверджено Google)
  const email = p.email.toLowerCase();
  let uid = p.sub;
  try {
    const old = await env.DB.prepare("SELECT id, email_verified FROM users WHERE lower(email) = ?1").bind(email).first<{ id: string; email_verified: number }>();
    if (old && old.id !== p.sub) {
      uid = old.id;
      // Непідтверджений акаунт міг створити не власник пошти: скидаємо його пароль, щоб ним не можна було заволодіти
      if (!old.email_verified) {
        await env.DB.prepare("UPDATE users SET password_hash = NULL, email_verified = 1 WHERE id = ?1").bind(uid).run();
        await env.DB.prepare("DELETE FROM email_tokens WHERE user_id = ?1").bind(uid).run();
      }
      await env.DB.prepare("UPDATE users SET name = COALESCE(name, ?1), avatar_url = COALESCE(avatar_url, ?2) WHERE id = ?3").bind(p.name ?? null, p.picture ?? null, uid).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO users (id, email, name, avatar_url) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name, avatar_url = excluded.avatar_url`
      ).bind(p.sub, email, p.name ?? null, p.picture ?? null).run();
    }
  } catch {
    return json({ error: "account_conflict" }, 409);
  }

  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(await createSession(env, uid, 30), 30 * 86400) });
};
