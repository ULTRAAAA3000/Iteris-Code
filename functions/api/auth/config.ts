// GET /api/auth/config — публічна конфігурація входу (client_id і ключ Turnstile не секретні)
import type { Env } from "../../../lib/env.ts";
import { mailConfigured } from "../../../lib/mail.ts";
import { json } from "../../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = ({ env }) =>
  json({
    clientId: env.GOOGLE_CLIENT_ID ?? null,
    // Вхід за поштою вмикається лише тоді, коли налаштовано все потрібне: Turnstile, листи й підпис сесії
    turnstileSiteKey: env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY && env.SESSION_SECRET && mailConfigured(env) ? env.TURNSTILE_SITE_KEY : null,
  });
