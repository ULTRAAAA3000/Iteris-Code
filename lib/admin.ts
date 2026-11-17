// Доступ до закритих сторінок власника: лише пошти зі змінної ADMIN_EMAILS (через кому).
// Захист від підміни пошти: якщо в акаунта є пароль, пошта має бути підтверджена листом (а листи мають бути налаштовані).
// Входи через Google/GitHub (без пароля) пошту вже підтвердили провайдери.
import type { Env } from "./env.ts";
import { mailConfigured } from "./mail.ts";

export async function isAdmin(env: Env, userId: string): Promise<boolean> {
  const list = (env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!list.length) return false;
  const u = await env.DB.prepare("SELECT email, password_hash, email_verified FROM users WHERE id = ?1").bind(userId).first<{ email: string; password_hash: string | null; email_verified: number | null }>();
  if (!u || !list.includes(u.email.toLowerCase())) return false;
  return !u.password_hash || (mailConfigured(env) && u.email_verified === 1);
}
