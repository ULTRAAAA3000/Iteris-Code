// POST /api/auth/google — обмен кода Google на сессию
import { createSession, json, sameOrigin, sessionCookie } from "../../../lib/session.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.SESSION_SECRET) return json({ error: "not_configured" }, 500);

  let code;
  try {
    code = (await request.json()).code;
  } catch (e) {}
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
  const { access_token } = await tokenRes.json();

  const profRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: "Bearer " + access_token } });
  if (!profRes.ok) return json({ error: "profile_failed" }, 401);
  const p = await profRes.json();
  if (!p.sub || !p.email || p.email_verified === false) return json({ error: "unverified_account" }, 401);

  try {
    await env.DB.prepare(
      `INSERT INTO users (id, email, name, avatar_url) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name, avatar_url = excluded.avatar_url`
    ).bind(p.sub, p.email, p.name || null, p.picture || null).run();
  } catch (e) {
    return json({ error: "account_conflict" }, 409);
  }

  const maxAge = 30 * 86400;
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(await createSession(env, p.sub, 30), maxAge) });
}
