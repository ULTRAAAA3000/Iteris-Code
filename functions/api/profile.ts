// GET  /api/profile — свої налаштування публічного профілю
// POST /api/profile — змінити героя-аватарку, біо, відкритість і (один раз) нікнейм
import type { Env } from "../../lib/env.ts";
import { checkBio, checkNick } from "../../lib/profile.ts";
import { currentUser, json, sameOrigin } from "../../lib/session.ts";
import { idolById } from "../../src/data/idols.ts";

interface Row { nick: string | null; avatar_id: string | null; bio: string | null; profile_public: number }

const mine = async (env: Env, id: string) => {
  const r = await env.DB.prepare("SELECT nick, avatar_id, bio, profile_public FROM users WHERE id = ?1").bind(id).first<Row>();
  return { nick: r?.nick ?? null, avatarId: idolById(r?.avatar_id) ? r?.avatar_id : null, bio: r?.bio ?? "", public: !!r?.profile_public };
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  return json(await mine(env, u.id));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);

  let b: { nick?: unknown; avatarId?: unknown; bio?: unknown; public?: unknown };
  try {
    b = (await request.json()) as typeof b;
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  if (!b || typeof b !== "object") return json({ error: "bad_request" }, 400);

  const cur = await mine(env, u.id);
  const set: string[] = [], vals: unknown[] = [];
  const add = (col: string, v: unknown): void => { vals.push(v); set.push(`${col} = ?${vals.length}`); };

  if (b.avatarId !== undefined) {
    if (b.avatarId !== null && !idolById(b.avatarId)) return json({ error: "avatar_invalid" }, 400);
    add("avatar_id", b.avatarId);
  }
  if (b.bio !== undefined) {
    const c = checkBio(b.bio);
    if (!c.ok) return json({ error: c.error }, 400);
    add("bio", c.bio);
  }
  // Нікнейм задається один раз: повторне збереження того самого нікнейма не вважається зміною
  let newNick: string | null = null;
  if (b.nick !== undefined && b.nick !== null && b.nick !== "") {
    const c = checkNick(b.nick);
    if (!c.ok) return json({ error: c.error }, 400);
    if (cur.nick && cur.nick !== c.nick) return json({ error: "nick_locked" }, 409);
    if (!cur.nick) { newNick = c.nick; add("nick", c.nick); }
  }
  if (b.public !== undefined) {
    if (typeof b.public !== "boolean") return json({ error: "bad_request" }, 400);
    if (b.public && !cur.nick && !newNick) return json({ error: "nick_required" }, 409);
    add("profile_public", b.public ? 1 : 0);
  }
  if (!set.length) return json({ ok: true, profile: cur });

  try {
    // Умова nick IS NULL в самому запиті: навіть при гонці двох запитів нікнейм не буде змінено вдруге
    const guard = newNick ? " AND nick IS NULL" : "";
    vals.push(u.id);
    const r = await env.DB.prepare(`UPDATE users SET ${set.join(", ")} WHERE id = ?${vals.length}${guard}`).bind(...vals).run();
    if (newNick && !r.meta?.changes) return json({ error: "nick_locked" }, 409);
  } catch (e) {
    if (/unique|constraint/i.test(String((e as Error)?.message ?? e))) return json({ error: "nick_taken" }, 409);
    throw e;
  }
  return json({ ok: true, profile: await mine(env, u.id) });
};
