// POST /api/report { nick, reason } — скарга на публічний профіль (спам, образи, особисті дані, інше)
// Скарги зберігаються в таблиці reports (дивимось вручну, поки немає адмінки, етап 6). Якщо на профіль поскаржились
// 3 різні люди, він автоматично закривається до розгляду.
import type { Env } from "../../lib/env.ts";
import { allow } from "../../lib/auth.ts";
import { currentUser, json, sameOrigin } from "../../lib/session.ts";

export const REPORT_REASONS = ["spam", "abuse", "personal", "other"] as const;
const AUTO_HIDE_AT = 3;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  let b: { nick?: unknown; reason?: unknown };
  try { b = (await request.json()) as typeof b; } catch { return json({ error: "bad_request" }, 400); }
  const nick = typeof b.nick === "string" ? b.nick.trim().toLowerCase() : "";
  const reason = typeof b.reason === "string" ? b.reason : "";
  if (!/^[a-z][a-z0-9_]{2,19}$/.test(nick) || !(REPORT_REASONS as readonly string[]).includes(reason)) return json({ error: "bad_request" }, 400);

  // Скаржитись можуть лише акаунти старші за добу (проти масових скарг з нових фейків) і не більше 10 скарг на добу
  const old = await env.DB.prepare("SELECT 1 AS x FROM users WHERE id = ?1 AND created_at <= datetime('now', '-1 day')").bind(u.id).first();
  if (!old) return json({ error: "too_new" }, 403);
  if (!(await allow(env, "report:" + u.id, 10, 86400))) return json({ error: "rate_limited" }, 429);

  const target = await env.DB.prepare("SELECT id FROM users WHERE nick = ?1 AND profile_public = 1").bind(nick).first<{ id: string }>();
  if (!target) return json({ error: "not_found" }, 404);
  if (target.id === u.id) return json({ error: "bad_request" }, 400);

  await env.DB.prepare("INSERT OR IGNORE INTO reports (id, reporter_id, nick, reason) VALUES (?1, ?2, ?3, ?4)").bind(crypto.randomUUID(), u.id, nick, reason).run();
  const n = await env.DB.prepare("SELECT COUNT(*) AS c FROM reports WHERE nick = ?1").bind(nick).first<{ c: number }>();
  if ((n?.c ?? 0) >= AUTO_HIDE_AT) await env.DB.prepare("UPDATE users SET profile_public = 0 WHERE nick = ?1").bind(nick).run();
  return json({ ok: true });
};
