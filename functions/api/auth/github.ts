// POST /api/auth/github — обмін коду GitHub на сесію
import type { Env } from "../../../lib/env.ts";
import { signInWithProfile } from "../../../lib/oauth.ts";
import { json, sameOrigin } from "../../../lib/session.ts";

interface GithubUser { id?: number; login?: string; name?: string | null; avatar_url?: string | null }
interface GithubEmail { email: string; primary: boolean; verified: boolean }

const gh = (url: string, token: string): Promise<Response> =>
  fetch(url, { headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "User-Agent": "iteris-code" } });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.SESSION_SECRET) return json({ error: "not_configured" }, 500);

  let code: unknown;
  try {
    code = ((await request.json()) as { code?: unknown }).code;
  } catch {
    /* некоректне тіло */
  }
  if (typeof code !== "string" || !code) return json({ error: "bad_request" }, 400);

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", "User-Agent": "iteris-code" },
    body: new URLSearchParams({ code, client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, redirect_uri: new URL(request.url).origin + "/" }),
  });
  if (!tokenRes.ok) return json({ error: "token_exchange_failed" }, 401);
  // GitHub відповідає 200 і при помилці коду: тоді в тілі є error замість access_token
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return json({ error: "token_exchange_failed" }, 401);

  const userRes = await gh("https://api.github.com/user", access_token);
  if (!userRes.ok) return json({ error: "profile_failed" }, 401);
  const u = (await userRes.json()) as GithubUser;
  if (!u.id) return json({ error: "profile_failed" }, 401);

  // Пошта в профілі може бути прихована: беремо основну підтверджену зі списку адрес
  const emRes = await gh("https://api.github.com/user/emails", access_token);
  const list = emRes.ok ? ((await emRes.json()) as GithubEmail[]) : [];
  const mail = list.find((e) => e.primary && e.verified) ?? list.find((e) => e.verified);
  if (!mail) return json({ error: "unverified_account" }, 401);

  return signInWithProfile(env, { id: "gh-" + u.id, email: mail.email, name: u.name || u.login || null, picture: u.avatar_url ?? null });
};
