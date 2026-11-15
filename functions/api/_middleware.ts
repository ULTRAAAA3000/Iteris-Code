// Общая обёртка для всех /api/*: проверяет схему базы (создаёт недостающее) и превращает неожиданные исключения
// в понятный JSON-ответ с кодом вместо пустой страницы ошибки. Подробности пишутся в логи Cloudflare.
import type { Env } from "../../lib/env.ts";
import { ensureSchema } from "../../lib/schema.ts";
import { json } from "../../lib/session.ts";

export const failureCode = (e: unknown): string => {
  const m = e instanceof Error ? e.message : String(e);
  if (/no such (table|column)|has no column|no column named/i.test(m)) return "db_schema";
  if (/D1_|SQLITE|database|constraint/i.test(m)) return "db_error";
  return "server_error";
};

export const onRequest: PagesFunction<Env> = async (ctx) => {
  if (!ctx.env.DB) return json({ error: "server_error", code: "db_binding_missing" }, 500);
  try {
    await ensureSchema(ctx.env);
    return await ctx.next();
  } catch (e) {
    console.error("api error", ctx.request.method, new URL(ctx.request.url).pathname, e instanceof Error ? (e.stack ?? e.message) : e);
    return json({ error: "server_error", code: failureCode(e) }, 500);
  }
};
