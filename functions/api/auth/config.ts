// GET /api/auth/config — публічна конфігурація OAuth (client_id не секретний)
import type { Env } from "../../../lib/env.ts";
import { json } from "../../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = ({ env }) => json({ clientId: env.GOOGLE_CLIENT_ID ?? null });
