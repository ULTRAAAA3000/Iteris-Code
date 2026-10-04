// Общие помощники для Pages Functions: подписанная сессия (HMAC-SHA256), ответы JSON, стрик, Pro.
const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const hmacKey = (secret) => crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

export async function createSession(env, uid, days = 30) {
  const payload = toB64u(enc.encode(JSON.stringify({ uid, exp: Math.floor(Date.now() / 1000) + days * 86400 })));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(env.SESSION_SECRET), enc.encode(payload));
  return payload + "." + toB64u(sig);
}

export async function readSession(request, env) {
  if (!env.SESSION_SECRET) return null;
  const m = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)session=([^;]+)/);
  if (!m) return null;
  const [payload, sig] = m[1].split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(env.SESSION_SECRET), fromB64u(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(dec.decode(fromB64u(payload)));
    return data.exp > Date.now() / 1000 && typeof data.uid === "string" ? data.uid : null;
  } catch (e) {
    return null;
  }
}

export const sessionCookie = (value, maxAge) => `session=${value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });

// Защита от CSRF для POST-запросов: Origin обязан совпадать с адресом сайта
export const sameOrigin = (request) => request.headers.get("Origin") === new URL(request.url).origin;

const day = (ms) => new Date(ms).toISOString().slice(0, 10);

export function effectiveStreak(u) {
  if (!u.last_active_at) return 0;
  const last = String(u.last_active_at).slice(0, 10);
  return last === day(Date.now()) || last === day(Date.now() - 864e5) ? u.streak_count || 0 : 0;
}

export function bumpStreak(u) {
  const last = u.last_active_at ? String(u.last_active_at).slice(0, 10) : null;
  if (last === day(Date.now())) return Math.max(u.streak_count || 1, 1);
  return last === day(Date.now() - 864e5) ? (u.streak_count || 0) + 1 : 1;
}

export function isProActive(u) {
  if (!u.is_pro) return false;
  if (!u.pro_until) return true;
  const t = String(u.pro_until);
  return new Date(t.includes("T") ? t : t.replace(" ", "T") + "Z") > new Date();
}

export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  avatarUrl: u.avatar_url,
  isPro: isProActive(u),
  proUntil: u.pro_until || null,
  streak: effectiveStreak(u),
});

export async function currentUser(request, env) {
  const uid = await readSession(request, env);
  if (!uid) return null;
  return env.DB.prepare("SELECT id, email, name, avatar_url, is_pro, pro_until, streak_count, last_active_at FROM users WHERE id = ?1").bind(uid).first();
}
