// Общая часть входа через внешнего провайдера (Google, GitHub): создать или найти аккаунт и выдать сессию
import type { Env } from "./env.ts";
import { createSession, json, sessionCookie } from "./session.ts";

export interface OAuthProfile {
  /** Идентификатор у провайдера: у Google это sub, у GitHub "gh-<число>" */
  id: string;
  /** Подтверждённая провайдером почта */
  email: string;
  name: string | null;
  picture: string | null;
}

/** Если с этой почтой уже есть аккаунт (в том числе созданный по паролю), привязываем провайдера к нему: почту подтвердил провайдер */
export async function signInWithProfile(env: Env, p: OAuthProfile): Promise<Response> {
  const email = p.email.toLowerCase();
  let uid = p.id;
  try {
    const old = await env.DB.prepare("SELECT id, email_verified FROM users WHERE lower(email) = ?1").bind(email).first<{ id: string; email_verified: number }>();
    if (old && old.id !== p.id) {
      uid = old.id;
      // Непідтверджений акаунт міг створити не власник пошти: скидаємо його пароль, щоб ним не можна було заволодіти
      if (!old.email_verified) {
        await env.DB.prepare("UPDATE users SET password_hash = NULL, email_verified = 1 WHERE id = ?1").bind(uid).run();
        await env.DB.prepare("DELETE FROM email_tokens WHERE user_id = ?1").bind(uid).run();
      }
      await env.DB.prepare("UPDATE users SET name = COALESCE(name, ?1), avatar_url = COALESCE(avatar_url, ?2) WHERE id = ?3").bind(p.name, p.picture, uid).run();
    } else {
      await env.DB.prepare(
        `INSERT INTO users (id, email, name, avatar_url) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name, avatar_url = excluded.avatar_url`
      ).bind(p.id, email, p.name, p.picture).run();
    }
  } catch {
    return json({ error: "account_conflict" }, 409);
  }
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(await createSession(env, uid, 30), 30 * 86400) });
}
