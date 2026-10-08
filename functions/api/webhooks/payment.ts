// POST /api/webhooks/payment — вебхук Lemon Squeezy: оновлює is_pro та pro_until
import type { Env } from "../../../lib/env.ts";
import { SUBSCRIPTION_EVENTS, entitlementFor, isLemonUrl, toSqlDate, verifySignature } from "../../../lib/billing.ts";
import type { LemonEvent } from "../../../lib/billing.ts";
import { json } from "../../../lib/session.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const secret = env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return json({ error: "not_configured" }, 500);

  const raw = await request.text();
  if (raw.length > 100_000) return json({ error: "too_large" }, 413);
  if (!(await verifySignature(secret, raw, request.headers.get("X-Signature")))) return json({ error: "invalid_signature" }, 401);

  let ev: LemonEvent;
  try {
    ev = JSON.parse(raw) as LemonEvent;
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const name = ev.meta?.event_name ?? request.headers.get("X-Event-Name") ?? "";
  if (!(SUBSCRIPTION_EVENTS as readonly string[]).includes(name)) return json({ ok: true, ignored: "event" });

  const a = ev.data?.attributes;
  const userId = ev.meta?.custom_data?.user_id;
  if (!a || ev.data?.id === undefined || typeof userId !== "string" || typeof a.updated_at !== "string" || typeof a.status !== "string") {
    return json({ error: "bad_request" }, 400);
  }
  if (env.LEMONSQUEEZY_VARIANT_ID && String(a.variant_id) !== env.LEMONSQUEEZY_VARIANT_ID) return json({ ok: true, ignored: "variant" });

  const ent = entitlementFor(a.status, a.renews_at ?? null, a.ends_at ?? null);
  if (!ent) return json({ ok: true, ignored: "status" });
  if (Number.isNaN(Date.parse(a.updated_at))) return json({ error: "bad_request" }, 400);

  const user = await env.DB.prepare("SELECT id, billing_updated_at FROM users WHERE id = ?1").bind(userId).first<{ id: string; billing_updated_at: string | null }>();
  if (!user) return json({ ok: true, ignored: "unknown_user" });   // повтор нічого не змінить, тому відповідаємо 200

  const eventId = `lemonsqueezy:${name}:${ev.data.id}:${a.updated_at}`;
  const seen = await env.DB.prepare("SELECT 1 AS x FROM payment_events WHERE id = ?1").bind(eventId).first();
  if (seen) return json({ ok: true, duplicate: true });

  // Старіша подія, що прийшла із запізненням, не повинна скасувати новішу
  const updated = toSqlDate(a.updated_at);
  if (user.billing_updated_at && user.billing_updated_at >= updated) return json({ ok: true, ignored: "stale" });

  const portal = isLemonUrl(a.urls?.customer_portal) ? a.urls?.customer_portal : null;
  try {
    // Журнал і оновлення користувача виконуються однією транзакцією
    await env.DB.batch([
      env.DB.prepare("INSERT INTO payment_events (id, provider, event_name, user_id) VALUES (?1, 'lemonsqueezy', ?2, ?3)").bind(eventId, name, userId),
      env.DB.prepare(
        "UPDATE users SET is_pro = ?1, pro_until = ?2, portal_url = COALESCE(?3, portal_url), subscription_id = ?4, billing_updated_at = ?5 WHERE id = ?6"
      ).bind(ent.isPro ? 1 : 0, ent.proUntil, portal, String(ev.data.id), updated, userId),
    ]);
  } catch {
    return json({ ok: true, duplicate: true });                    // паралельна доставка тієї самої події
  }
  return json({ ok: true, isPro: ent.isPro, proUntil: ent.proUntil });
};
