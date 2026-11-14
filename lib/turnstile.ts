// Cloudflare Turnstile: перевірка токена віджета на сервері (захист форм від ботів).
// Захист вмикається лише тоді, коли задано обидва ключі (site key для віджета і secret для перевірки); інакше форми працюють без нього.
import type { Env } from "./env.ts";

type Keys = Pick<Env, "TURNSTILE_SITE_KEY" | "TURNSTILE_SECRET_KEY">;
export const turnstileEnabled = (env: Keys): boolean => Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);

export async function verifyTurnstile(env: Keys, token: unknown, ip: string | null): Promise<"ok" | "failed"> {
  if (!turnstileEnabled(env)) return "ok";
  if (typeof token !== "string" || !token || token.length > 2048) return "failed";
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY as string, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await r.json()) as { success?: boolean };
    return r.ok && data.success === true ? "ok" : "failed";
  } catch {
    return "failed";
  }
}
