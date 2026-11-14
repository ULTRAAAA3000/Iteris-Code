// Хешування паролів: PBKDF2-SHA256 із випадковою сіллю (WebCrypto, доступний у Cloudflare Workers).
// Workers обмежують PBKDF2 до 100 000 ітерацій, тому використовуємо саме це значення.
// Формат запису: pbkdf2$sha256$<ітерації>$<сіль>$<хеш>. Ітерації зберігаються, щоб колись їх можна було збільшити.
import { fromB64u, toB64u } from "./session.ts";

const enc = new TextEncoder();
const ITERATIONS = 100_000;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return ["pbkdf2", "sha256", ITERATIONS, toB64u(salt), toB64u(await derive(password, salt, ITERATIONS))].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, hash, iter, salt, digest] = stored.split("$");
  const n = Number(iter);
  if (alg !== "pbkdf2" || hash !== "sha256" || !Number.isInteger(n) || n < 1 || n > ITERATIONS || !salt || !digest) return false;
  try {
    const got = await derive(password, fromB64u(salt), n);
    const want = fromB64u(digest);
    if (got.length !== want.length) return false;
    let diff = 0;
    for (let i = 0; i < got.length; i++) diff |= got[i] ^ want[i];   // порівняння за сталий час
    return diff === 0;
  } catch {
    return false;
  }
}

// Для неіснуючого користувача теж рахуємо хеш, щоб за часом відповіді не можна було дізнатися, чи є така пошта
let dummy: Promise<string> | null = null;
export const dummyHash = (): Promise<string> => (dummy ??= hashPassword("iteris-dummy-password"));

export const validPassword = (p: unknown): p is string => typeof p === "string" && p.length >= PASSWORD_MIN && p.length <= PASSWORD_MAX;
