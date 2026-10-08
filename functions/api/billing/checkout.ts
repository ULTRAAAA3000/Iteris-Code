// POST /api/billing/checkout — посилання на оплату Pro для поточного користувача
import type { Env } from "../../../lib/env.ts";
import { isLemonUrl } from "../../../lib/billing.ts";
import { currentUser, json, sameOrigin } from "../../../lib/session.ts";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  if (!isLemonUrl(env.LEMONSQUEEZY_CHECKOUT_URL)) return json({ error: "not_configured" }, 503);

  // user_id повернеться у вебхуку: так ми знаємо, кому видати Pro
  const url = new URL(env.LEMONSQUEEZY_CHECKOUT_URL);
  url.searchParams.set("checkout[email]", u.email);
  if (u.name) url.searchParams.set("checkout[name]", u.name);
  url.searchParams.set("checkout[custom][user_id]", u.id);
  return json({ url: url.toString() });
};
