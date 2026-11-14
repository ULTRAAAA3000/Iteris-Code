// GET /api/auth/config — публічна конфігурація входу (client_id і site key Turnstile не секретні)
import type { Env } from "../../../lib/env.ts";
import { mailConfigured } from "../../../lib/mail.ts";
import { turnstileEnabled } from "../../../lib/turnstile.ts";
import { json } from "../../../lib/session.ts";

// Форма входу за поштою є завжди. Google, Turnstile і листи (підтвердження пошти, відновлення пароля) з'являються, коли їх налаштовано
export const onRequestGet: PagesFunction<Env> = ({ env }) =>
  json({
    clientId: env.GOOGLE_CLIENT_ID ?? null,
    turnstileSiteKey: turnstileEnabled(env) ? (env.TURNSTILE_SITE_KEY as string) : null,
    mail: mailConfigured(env),
  });
