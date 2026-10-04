// GET /api/me — текущий пользователь, статус Pro и стрик (для гостя user = null)
import { currentUser, json, publicUser, sessionCookie } from "../../lib/session.js";

export async function onRequestGet({ request, env }) {
  const u = await currentUser(request, env);
  if (!u) return json({ user: null });
  return json({ user: publicUser(u) });
}
