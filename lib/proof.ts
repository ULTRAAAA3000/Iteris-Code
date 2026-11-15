// Підтвердження «сервер сам запустив цей код і всі перевірки пройдено». Видається з /api/run, приймається в /api/progress/complete:
// без нього для віддалених завдань XP не нараховується, тож «пройдено» не можна підробити запитом.
// Підпис HMAC-SHA256 прив'язаний до користувача, завдання й точного тексту коду, дійсний 15 хвилин.
import type { Env } from "./env.ts";
import { fromB64u, toB64u } from "./session.ts";

const enc = new TextEncoder();
const TTL_SEC = 15 * 60;

async function sign(env: Pick<Env, "SESSION_SECRET">, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(env.SESSION_SECRET ?? ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toB64u(await crypto.subtle.sign("HMAC", key, enc.encode("run-proof:" + data)));
}
const digest = async (code: string): Promise<string> => toB64u(await crypto.subtle.digest("SHA-256", enc.encode(code)));

export async function signProof(env: Pick<Env, "SESSION_SECRET">, uid: string, taskId: string, code: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC;
  const body = [uid, taskId, exp, await digest(code)].join("|");
  return toB64u(enc.encode(body)) + "." + (await sign(env, body));
}

export async function verifyProof(env: Pick<Env, "SESSION_SECRET">, proof: unknown, uid: string, taskId: string, code: string): Promise<boolean> {
  if (!env.SESSION_SECRET || typeof proof !== "string" || proof.length > 600) return false;
  const [payload, sig] = proof.split(".");
  if (!payload || !sig) return false;
  try {
    const body = new TextDecoder().decode(fromB64u(payload));
    if ((await sign(env, body)) !== sig) return false;
    const [u, t, exp, h] = body.split("|");
    return u === uid && t === taskId && Number(exp) > Date.now() / 1000 && h === (await digest(code));
  } catch {
    return false;
  }
}
