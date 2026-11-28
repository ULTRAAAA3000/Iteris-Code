// GET  /api/account — вигрузка всіх даних користувача файлом JSON (право на перенесення даних, GDPR ст. 20)
// POST /api/account — видалення акаунта й усіх його даних: тіло { "confirm": "delete" } (право на видалення, GDPR ст. 17)
import type { Env } from "../../lib/env.ts";
import { currentUser, json, sameOrigin, sessionCookies } from "../../lib/session.ts";

// Таблиці з даними користувача (колонка user_id); payment_events лишилась від старої оплати й теж чиститься.
// Нова таблиця з user_id мусить потрапити сюди (вигрузка й видалення) і в тест tests/account.test.mjs: він перевіряє повноту за schema.sql
const USER_TABLES = ["user_progress", "user_course_levels", "task_submissions", "xp_events", "user_goals", "user_onboarding", "email_tokens", "payment_events"] as const;
// Службові поля, яких у вигрузці немає: хеш пароля й дані платіжки
const HIDDEN = new Set(["password_hash", "portal_url", "subscription_id", "billing_updated_at"]);

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  const row = await env.DB.prepare("SELECT * FROM users WHERE id = ?1").bind(u.id).first<Record<string, unknown>>();
  const account = Object.fromEntries(Object.entries(row ?? {}).filter(([k]) => !HIDDEN.has(k)));
  const data: Record<string, unknown> = { exportedAt: new Date().toISOString(), account };
  for (const t of USER_TABLES) {
    if (t === "email_tokens" || t === "payment_events") continue;   // службові одноразові дані, не контент користувача
    const r = await env.DB.prepare(`SELECT * FROM ${t} WHERE user_id = ?1`).bind(u.id).all();
    data[t] = r.results ?? [];
  }
  // Звернення до підтримки: за user_id, а також гостьові з тією самою ПІДТВЕРДЖЕНОЮ поштою; жалоби, які подав сам користувач
  // (жалоби на нього не віддаємо: там особа того, хто поскаржився)
  const mail = row?.email_verified ? String(row.email ?? "") : "";
  data.support_messages = (await env.DB.prepare("SELECT * FROM support_messages WHERE user_id = ?1 OR (?2 != '' AND lower(email) = lower(?2))").bind(u.id, mail).all()).results ?? [];
  data.reports = (await env.DB.prepare("SELECT * FROM reports WHERE reporter_id = ?1").bind(u.id).all()).results ?? [];
  return json(data, 200, { "Content-Disposition": 'attachment; filename="iteris-code-my-data.json"' });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  let b: { confirm?: unknown } = {};
  try { b = (await request.json()) as typeof b; } catch { /* порожнє тіло: нижче буде відмова */ }
  if (b.confirm !== "delete") return json({ error: "confirm_required" }, 400);

  // Не покладаємось на каскад зовнішніх ключів: чистимо явно, потім сам акаунт
  const row = await env.DB.prepare("SELECT email, email_verified, nick FROM users WHERE id = ?1").bind(u.id).first<{ email: string; email_verified: number; nick: string | null }>();
  const mail = row?.email_verified ? row.email : "";
  const stmts = USER_TABLES.map((t) => env.DB.prepare(`DELETE FROM ${t} WHERE user_id = ?1`).bind(u.id));
  stmts.push(env.DB.prepare("DELETE FROM support_messages WHERE user_id = ?1 OR (?2 != '' AND lower(email) = lower(?2))").bind(u.id, mail));
  stmts.push(env.DB.prepare("DELETE FROM reports WHERE reporter_id = ?1 OR (?2 != '' AND nick = ?2)").bind(u.id, row?.nick ?? ""));
  stmts.push(env.DB.prepare("DELETE FROM users WHERE id = ?1").bind(u.id));
  await env.DB.batch(stmts);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookies("", 0, request, env) });
};
