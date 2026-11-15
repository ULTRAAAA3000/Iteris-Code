// POST /api/xp/sync — нарахувати XP за нові перевірені дії; відповідь містить нові події для анімації «+XP» і підвищення рівня
import type { Env } from "../../../lib/env.ts";
import { currentUser, json, sameOrigin } from "../../../lib/session.ts";
import { syncXp } from "../../../lib/xp.ts";
import { levelInfo } from "../../../src/xp.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  const r = await syncXp(env, u);
  const before = levelInfo(r.prev), after = levelInfo(r.total);
  return json({ xp: r.total, gained: r.gained, level: after.level, prevLevel: before.level, leveledUp: after.level > before.level });
};
