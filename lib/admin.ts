// Доступ до закритих сторінок власника: лише пошти зі змінної ADMIN_EMAILS (через кому).
// Захист від підміни пошти: якщо в акаунта є пароль, пошта має бути підтверджена листом (а листи мають бути налаштовані).
// Альтернатива без пошти: ADMIN_PASSWORD (хеш пароля власника з бази).
// Входи через Google/GitHub (без пароля) пошту вже підтвердили провайдери.
import type { Env } from "./env.ts";
import { mailConfigured } from "./mail.ts";

const sameText = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

export async function isAdmin(env: Env, userId: string): Promise<boolean> {
  const list = (env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!list.length) return false;
  const u = await env.DB.prepare("SELECT email, password_hash, email_verified FROM users WHERE id = ?1").bind(userId).first<{ email: string; password_hash: string | null; email_verified: number | null }>();
  if (!u || !list.includes(u.email.toLowerCase())) return false;
  if (!u.password_hash) return true;
  // Вхід за поштою й паролем: або пошта підтверджена листом, або хеш пароля акаунта збігається з ADMIN_PASSWORD
  // (хеш копіюється з бази; після зміни пароля доступ зникає, доки ADMIN_PASSWORD не оновлено).
  const ap = (env.ADMIN_PASSWORD ?? "").trim();
  if (ap && sameText(ap, u.password_hash)) return true;
  return mailConfigured(env) && u.email_verified === 1;
}
