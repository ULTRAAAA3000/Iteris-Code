// Cloudflare Turnstile: перевірка токена віджета на сервері (захист форм від ботів)
import type { Env } from "./env.ts";

export type TurnstileResult = "ok" | "failed" | "not_configured";

export async function verifyTurnstile(env: Pick<Env, "TURNSTILE_SECRET_KEY">, token: unknown, ip: string | null): Promise<TurnstileResult> {
  if (!env.TURNSTILE_SECRET_KEY) return "not_configured";
  if (typeof token !== "string" || !token || token.length > 2048) return "failed";
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await r.json()) as { success?: boolean };
    return r.ok && data.success === true ? "ok" : "failed";
  } catch {
    return "failed";
  }
}
