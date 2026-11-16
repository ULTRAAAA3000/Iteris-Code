// GET /api/u?nick=<нік> — відкриті дані публічного профілю. Закритий профіль бачить лише його власник; для решти він «не існує»
import type { Env } from "../../lib/env.ts";
import { buildProfile, findByNick } from "../../lib/profile.ts";
import { currentUser, json } from "../../lib/session.ts";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const nick = (new URL(request.url).searchParams.get("nick") ?? "").toLowerCase();
  const row = await findByNick(env, nick);
  if (!row) return json({ error: "not_found" }, 404);
  const viewer = await currentUser(request, env);
  const own = viewer?.id === row.id;
  if (!row.profile_public && !own) return json({ error: "not_found" }, 404);
  return json({ profile: await buildProfile(env, row), own, public: !!row.profile_public });
};
