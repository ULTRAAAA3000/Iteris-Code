// Спільні помічники для Pages Functions: підписана сесія (HMAC-SHA256), JSON-відповіді, стрік, Pro.
import type { Env, PublicUser, UserRow } from "./env.ts";

const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64u = (buf: ArrayBuffer | Uint8Array): string =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = (s: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const hmacKey = (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

export async function createSession(env: Pick<Env, "SESSION_SECRET">, uid: string, days = 30): Promise<string> {
  const payload = toB64u(enc.encode(JSON.stringify({ uid, exp: Math.floor(Date.now() / 1000) + days * 86400 })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(env.SESSION_SECRET ?? ""), enc.encode(payload));
  return payload + "." + toB64u(sig);
}

export async function readSession(request: Request, env: Pick<Env, "SESSION_SECRET">): Promise<string | null> {
  if (!env.SESSION_SECRET) return null;
  const m = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)session=([^;]+)/);
  if (!m) return null;
  const [payload, sig] = m[1].split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(env.SESSION_SECRET), fromB64u(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(dec.decode(fromB64u(payload))) as { uid?: unknown; exp?: unknown };
    return typeof data.exp === "number" && data.exp > Date.now() / 1000 && typeof data.uid === "string" ? data.uid : null;
  } catch {
    return null;
  }
}

export const sessionCookie = (value: string, maxAge: number): string =>
  `session=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });

// Захист від CSRF для POST-запитів: Origin має збігатися з адресою сайту
export const sameOrigin = (request: Request): boolean => request.headers.get("Origin") === new URL(request.url).origin;

const day = (ms: number): string => new Date(ms).toISOString().slice(0, 10);
type StreakInfo = Pick<UserRow, "streak_count" | "last_active_at">;

export function effectiveStreak(u: StreakInfo): number {
  if (!u.last_active_at) return 0;
  const last = String(u.last_active_at).slice(0, 10);
  return last === day(Date.now()) || last === day(Date.now() - 864e5) ? u.streak_count || 0 : 0;
}

export function bumpStreak(u: StreakInfo): number {
  const last = u.last_active_at ? String(u.last_active_at).slice(0, 10) : null;
  if (last === day(Date.now())) return Math.max(u.streak_count || 1, 1);
  return last === day(Date.now() - 864e5) ? (u.streak_count || 0) + 1 : 1;
}

export function isProActive(u: Pick<UserRow, "is_pro" | "pro_until">): boolean {
  if (!u.is_pro) return false;
  if (!u.pro_until) return true;
  const t = String(u.pro_until);
  return new Date(t.includes("T") ? t : t.replace(" ", "T") + "Z") > new Date();
}

export const publicUser = (u: UserRow): PublicUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  avatarUrl: u.avatar_url,
  isPro: isProActive(u),
  proUntil: u.pro_until || null,
  streak: effectiveStreak(u),
});

export async function currentUser(request: Request, env: Env): Promise<UserRow | null> {
  const uid = await readSession(request, env);
  if (!uid) return null;
  return env.DB.prepare(
    "SELECT id, email, name, avatar_url, is_pro, pro_until, streak_count, last_active_at FROM users WHERE id = ?1"
  ).bind(uid).first<UserRow>();
}
