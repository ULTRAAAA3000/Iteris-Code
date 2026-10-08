// Оплата (Lemon Squeezy): перевірка підпису вебхука та перетворення статусу підписки на доступ Pro.
const enc = new TextEncoder();

const hexToBytes = (hex: string): Uint8Array<ArrayBuffer> | null =>
  /^[0-9a-f]+$/i.test(hex) && hex.length % 2 === 0 ? Uint8Array.from(hex.match(/../g) ?? [], (h) => parseInt(h, 16)) : null;

/** Підпис Lemon Squeezy: HMAC-SHA256 від сирого тіла запиту, у hex. Порівняння виконує Web Crypto (сталий час). */
export async function verifySignature(secret: string, rawBody: string, signatureHex: string | null): Promise<boolean> {
  const sig = signatureHex ? hexToBytes(signatureHex.trim()) : null;
  if (!sig || sig.length !== 32) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, sig, enc.encode(rawBody));
}

export const SUBSCRIPTION_EVENTS = [
  "subscription_created", "subscription_updated", "subscription_cancelled", "subscription_resumed",
  "subscription_expired", "subscription_paused", "subscription_unpaused",
] as const;

export interface LemonEvent {
  meta?: { event_name?: string; custom_data?: { user_id?: unknown } };
  data?: {
    id?: string | number;
    type?: string;
    attributes?: {
      status?: string; renews_at?: string | null; ends_at?: string | null; updated_at?: string;
      variant_id?: number | string; urls?: { customer_portal?: string };
    };
  };
}

export interface Entitlement { isPro: boolean; proUntil: string | null }

/** Формат дати як у SQLite: "YYYY-MM-DD HH:MM:SS" (UTC) */
export const toSqlDate = (v: string | number | Date): string => new Date(v).toISOString().slice(0, 19).replace("T", " ");

const GRACE_DAYS = 3;
const FALLBACK_DAYS = 35;

/** Який доступ дає статус підписки. Невідомий статус → null (подію ігноруємо). */
export function entitlementFor(status: string, renewsAt: string | null, endsAt: string | null, now = Date.now()): Entitlement | null {
  const ts = (v: string | null): number | null => { const t = v ? Date.parse(v) : NaN; return Number.isNaN(t) ? null : t; };
  const renews = ts(renewsAt), ends = ts(endsAt);
  switch (status) {
    case "active":
    case "on_trial":
      return { isPro: true, proUntil: toSqlDate(renews ?? ends ?? now + FALLBACK_DAYS * 864e5) };
    case "cancelled": {            // користувач скасував, але доступ зберігається до кінця оплаченого періоду
      const until = ends ?? renews;
      return { isPro: until !== null && until > now, proUntil: until !== null ? toSqlDate(until) : null };
    }
    case "past_due":               // платіж не пройшов: короткий пільговий період
      return { isPro: true, proUntil: toSqlDate((renews ?? now) + GRACE_DAYS * 864e5) };
    case "expired":
    case "unpaid":
    case "paused":
      return { isPro: false, proUntil: toSqlDate(ends ?? now) };
    default:
      return null;
  }
}

/** Дозволяємо лише https-посилання на домен Lemon Squeezy */
export const isLemonUrl = (u: unknown): u is string => {
  if (typeof u !== "string") return false;
  try {
    const url = new URL(u);
    return url.protocol === "https:" && (url.hostname === "lemonsqueezy.com" || url.hostname.endsWith(".lemonsqueezy.com"));
  } catch {
    return false;
  }
};
