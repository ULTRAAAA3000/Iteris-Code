// POST /api/contact — звернення до підтримки зі сторінки /contact (теми: ефекти й візуал, помилка, ідея, інше).
// Усе зберігається в таблиці support_messages; якщо налаштовано пошту і SUPPORT_EMAIL, копія летить власнику (Reply-To це пошта автора).
import type { Env } from "../../lib/env.ts";
import { allow, cleanName, clientIp, normEmail, readBody } from "../../lib/auth.ts";
import { mailConfigured, sendMail } from "../../lib/mail.ts";
import { currentUser, json, sameOrigin } from "../../lib/session.ts";
import { verifyTurnstile } from "../../lib/turnstile.ts";
import { isTopic, MSG_MAX, MSG_MIN, TOPICS } from "../../src/support.ts";

const clip = (v: unknown, n: number): string => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, n) : "");

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  const b = await readBody(request);
  if (typeof b.website === "string" && b.website !== "") return json({ ok: true });   // приманка для ботів заповнена: мовчки «приймаємо» й нічого не зберігаємо

  const u = await currentUser(request, env);
  const email = normEmail(b.email) ?? (u ? normEmail(u.email) : null);
  if (!email) return json({ error: "invalid_email" }, 400);
  if (!isTopic(b.topic)) return json({ error: "invalid_topic" }, 400);
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (message.length < MSG_MIN || message.length > MSG_MAX) return json({ error: "invalid_message" }, 400);
  const ip = clientIp(request);
  if ((await verifyTurnstile(env, b.turnstile, ip)) !== "ok") return json({ error: "captcha_failed" }, 400);
  if (!(await allow(env, "contact-ip:" + (ip ?? "?"), 5, 3600)) || !(await allow(env, "contact-mail:" + email, 3, 3600))) return json({ error: "too_many_requests" }, 429);

  // Подвійне натискання або повторна відправка того самого тексту: вдруге не зберігаємо
  const dup = await env.DB.prepare("SELECT id FROM support_messages WHERE email = ?1 AND message = ?2 AND created_at > datetime('now', '-10 minutes')").bind(email, message).first();
  if (dup) return json({ ok: true });

  const name = cleanName(b.name) ?? u?.name ?? null;
  // Технічні подробиці допомагають відтворити проблему з візуалом: сторінка, розмір вікна, браузер, чи ввімкнено «зменшення руху»
  const meta = JSON.stringify({ page: clip(b.page, 200), vp: clip(b.vp, 20), ua: clip(b.ua, 300), motion: b.motion === "reduce" ? "reduce" : "full" });
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO support_messages (id, user_id, name, email, topic, message, meta) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
    .bind(id, u?.id ?? null, name, email, b.topic, message, meta).run();

  if (mailConfigured(env) && env.SUPPORT_EMAIL) {
    const m = JSON.parse(meta) as Record<string, string>;
    const text = `Тема: ${TOPICS[b.topic]}\nВід: ${name ?? "—"} <${email}>${u ? ` (акаунт ${u.id})` : " (гість)"}\nСторінка: ${m.page || "—"}\nВікно: ${m.vp || "—"}, рух: ${m.motion}\nБраузер: ${m.ua || "—"}\n\n${message}`;
    if (await sendMail(env, env.SUPPORT_EMAIL, `[Iteris Code] ${TOPICS[b.topic]}`, text, email)) {
      await env.DB.prepare("UPDATE support_messages SET emailed = 1 WHERE id = ?1").bind(id).run();
    }
  }
  return json({ ok: true });
};
