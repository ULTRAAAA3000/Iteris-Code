// GET /api/auth/health — диагностика входа для владельца: чего не хватает в настройках. Секретных значений не отдаёт, только «задано / не задано».
// GET /api/auth/health?hash=1 — дополнительно проверяет, укладывается ли хеширование пароля в лимиты воркера.
import type { Env } from "../../../lib/env.ts";
import { mailConfigured } from "../../../lib/mail.ts";
import { hashPassword } from "../../../lib/password.ts";
import { json } from "../../../lib/session.ts";
import { turnstileEnabled } from "../../../lib/turnstile.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const problems: string[] = [];
  if (!env.SESSION_SECRET) problems.push("Не задана переменная SESSION_SECRET: без неё вход и регистрация невозможны");
  else if (env.SESSION_SECRET.length < 32) problems.push("SESSION_SECRET слишком короткая (нужно хотя бы 32 символа)");
  if (Boolean(env.TURNSTILE_SITE_KEY) !== Boolean(env.TURNSTILE_SECRET_KEY)) problems.push("Turnstile настроен наполовину: нужны оба ключа, TURNSTILE_SITE_KEY и TURNSTILE_SECRET_KEY");
  if (Boolean(env.GITHUB_CLIENT_ID) !== Boolean(env.GITHUB_CLIENT_SECRET)) problems.push("GitHub настроен наполовину: нужны оба значения, GITHUB_CLIENT_ID и GITHUB_CLIENT_SECRET");
  if (Boolean(env.RESEND_API_KEY) !== Boolean(env.MAIL_FROM)) problems.push("Почта настроена наполовину: нужны оба значения, RESEND_API_KEY и MAIL_FROM");

  const tables = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all<{ name: string }>();
  const have = new Set(tables.results.map((t) => t.name));
  const missing = ["users", "email_tokens", "auth_throttle"].filter((t) => !have.has(t));
  if (missing.length) problems.push("В базе нет таблиц: " + missing.join(", "));
  const cols = await env.DB.prepare("SELECT name FROM pragma_table_info('users')").all<{ name: string }>();
  const userCols = new Set(cols.results.map((c) => c.name));
  for (const c of ["password_hash", "email_verified"]) if (!userCols.has(c)) problems.push("В таблице users нет колонки " + c);

  const out: Record<string, unknown> = {
    ok: problems.length === 0,
    problems,
    features: { google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET), github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET), turnstile: turnstileEnabled(env), mail: mailConfigured(env) },
  };
  if (new URL(request.url).searchParams.get("hash") === "1") {
    const t0 = Date.now();
    await hashPassword("health-check");
    out.hashMs = Date.now() - t0;
  }
  return json(out);
};
