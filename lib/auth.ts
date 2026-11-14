// Спільні помічники для входу за поштою: нормалізація, одноразові токени з листів, ліміт спроб.
import type { Env } from "./env.ts";
import { toB64u } from "./session.ts";

export const normEmail = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  const e = v.trim().toLowerCase();
  return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
};

export const cleanName = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim().replace(/\s+/g, " ").slice(0, 60) : null);

export const clientIp = (request: Request): string | null => request.headers.get("CF-Connecting-IP");

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const b = await request.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

const sha256hex = async (s: string): Promise<string> =>
  Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))), (b) => b.toString(16).padStart(2, "0")).join("");

export type TokenKind = "verify" | "reset";
export const TOKEN_TTL: Record<TokenKind, number> = { verify: 24 * 3600, reset: 3600 };
const now = (): number => Math.floor(Date.now() / 1000);

// У базі лежить лише SHA-256 від токена: витік бази не дає готових посилань
export async function issueToken(env: Pick<Env, "DB">, userId: string, kind: TokenKind): Promise<string> {
  const token = toB64u(crypto.getRandomValues(new Uint8Array(32)));
  await env.DB.prepare("DELETE FROM email_tokens WHERE user_id = ?1 AND kind = ?2").bind(userId, kind).run();
  await env.DB.prepare("INSERT INTO email_tokens (token_hash, user_id, kind, expires_at) VALUES (?1, ?2, ?3, ?4)")
    .bind(await sha256hex(token), userId, kind, now() + TOKEN_TTL[kind]).run();
  return token;
}

// Токен одноразовий: DELETE ... RETURNING гарантує, що двічі його не використати
export async function consumeToken(env: Pick<Env, "DB">, token: unknown, kind: TokenKind): Promise<string | null> {
  if (typeof token !== "string" || token.length < 20 || token.length > 100) return null;
  const row = await env.DB.prepare("DELETE FROM email_tokens WHERE token_hash = ?1 AND kind = ?2 RETURNING user_id, expires_at")
    .bind(await sha256hex(token), kind).first<{ user_id: string; expires_at: number }>();
  return row && row.expires_at > now() ? row.user_id : null;
}

// Лічильник спроб у вікні часу. true = можна продовжувати
export async function allow(env: Pick<Env, "DB">, key: string, max: number, windowSec: number): Promise<boolean> {
  const row = await env.DB.prepare("SELECT count, reset_at FROM auth_throttle WHERE key = ?1").bind(key).first<{ count: number; reset_at: number }>();
  if (!row || row.reset_at <= now()) {
    await env.DB.prepare("INSERT INTO auth_throttle (key, count, reset_at) VALUES (?1, 1, ?2) ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at")
      .bind(key, now() + windowSec).run();
    return true;
  }
  if (row.count >= max) return false;
  await env.DB.prepare("UPDATE auth_throttle SET count = count + 1 WHERE key = ?1").bind(key).run();
  return true;
}

export const forget = (env: Pick<Env, "DB">, key: string) => env.DB.prepare("DELETE FROM auth_throttle WHERE key = ?1").bind(key).run();
