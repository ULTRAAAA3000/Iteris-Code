// Публічний профіль: правила нікнейма й біо, збір відкритих даних про користувача.
// Публічно показуються лише нікнейм, герой-аватарка, біо, рівень, серія й навчальний прогрес. Ім'я, пошта й фото з входу не показуються ніколи.
import type { Env } from "./env.ts";
import { LESSONS } from "../content/lessons.js";
import { idolById } from "../src/data/idols.ts";
import { levelInfo } from "../src/xp.ts";
import { effectiveStreak } from "./session.ts";
import { xpTotal } from "./xp.ts";

export const NICK_RE = /^[a-z][a-z0-9_]{2,19}$/;
export const BIO_MAX = 160;
/** Адреси сторінок сайту й службові слова: нікнейм не може збігатися з ними */
const RESERVED = new Set([
  "admin", "administrator", "root", "support", "help", "api", "dashboard", "profile", "iteris", "iteriscode", "official", "staff", "moderator", "mod",
  "system", "null", "undefined", "me", "you", "user", "users", "ref", "courses", "course", "lesson", "path", "start", "login", "register", "about",
  "mo", "teo", "mika", "nox", "lulu", "andrew", "rex", "zak", "piko", "limo", "noa",   // імена героїв платформи
]);

export type NickCheck = { ok: true; nick: string } | { ok: false; error: "nick_invalid" | "nick_reserved" };
export function checkNick(raw: unknown): NickCheck {
  const nick = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!NICK_RE.test(nick)) return { ok: false, error: "nick_invalid" };
  if (RESERVED.has(nick) || /^iteris/.test(nick)) return { ok: false, error: "nick_reserved" };
  return { ok: true, nick };
}

// У біо поки не можна вставляти посилання: адреси з протоколом, www, пошту й домени з поширеними закінченнями
const LINK_RE = /:\/\/|www\.|@[\w-]+\.\w|\b[\w-]+\.(?:com|org|net|io|ua|me|dev|app|ru|co|info|xyz|link|ly|gg|tv|to|eu|site|online|shop|top|cc|fm|im|gl|by|pl|de|uk)\b/i;
/** Прибирає керівні й невидимі символи (крім переносу рядка), якими можна підробити вигляд тексту */
const stripControl = (s: string): string =>
  [...s].filter((ch) => { const c = ch.codePointAt(0) as number; return !(c < 9 || (c >= 11 && c <= 31) || c === 127 || (c >= 0x200b && c <= 0x200f) || (c >= 0x2028 && c <= 0x202e)); }).join("");
export type BioCheck = { ok: true; bio: string } | { ok: false; error: "bio_too_long" | "bio_links" };
export function checkBio(raw: unknown): BioCheck {
  // Керівні символи прибираємо, переноси рядків скорочуємо до одного, зайві пропуски обрізаємо
  const bio = stripControl(typeof raw === "string" ? raw : "").replace(/\n{2,}/g, "\n").trim();
  if ([...bio].length > BIO_MAX) return { ok: false, error: "bio_too_long" };
  if (LINK_RE.test(bio)) return { ok: false, error: "bio_links" };
  return { ok: true, bio };
}

export interface CourseProgress { key: string; done: number; total: number }
export interface PublicProfile {
  nick: string;
  avatarId: string | null;
  bio: string;
  /** Місяць реєстрації, "2026-11" */
  since: string | null;
  xp: number;
  level: number;
  streak: number;
  lessons: number;
  tasks: number;
  /** Прогрес за курсами: лише ті, де є пройдені уроки */
  courses: CourseProgress[];
  /** Дії за останні 182 дні (UTC): "2026-11-16" → кількість */
  activity: Record<string, number>;
}

interface ProfileRow { id: string; nick: string; avatar_id: string | null; bio: string | null; created_at: string | null; streak_count: number; last_active_at: string | null; profile_public: number }

export async function findByNick(env: Pick<Env, "DB">, nick: string): Promise<ProfileRow | null> {
  if (!NICK_RE.test(nick)) return null;
  return env.DB.prepare("SELECT id, nick, avatar_id, bio, created_at, streak_count, last_active_at, profile_public FROM users WHERE nick = ?1").bind(nick).first<ProfileRow>();
}

export async function buildProfile(env: Pick<Env, "DB">, u: ProfileRow): Promise<PublicProfile> {
  const q = (sql: string) => env.DB.prepare(sql).bind(u.id);
  const [lessons, tasks, actL, actT] = (await env.DB.batch<Record<string, string | number>>([
    q("SELECT lesson_id AS v FROM user_progress WHERE user_id = ?1"),
    q("SELECT DISTINCT task_id AS v FROM task_submissions WHERE user_id = ?1 AND is_passed = 1"),
    q("SELECT date(completed_at) AS d, COUNT(*) AS c FROM user_progress WHERE user_id = ?1 AND completed_at >= date('now', '-182 day') GROUP BY d"),
    q("SELECT date(created_at) AS d, COUNT(*) AS c FROM task_submissions WHERE user_id = ?1 AND created_at >= date('now', '-182 day') GROUP BY d"),
  ])).map((r) => r.results);

  const perCourse = new Map<string, number>();
  let done = 0;
  for (const r of lessons) {
    const [k, n] = String(r.v).split("/");
    const list = Object.prototype.hasOwnProperty.call(LESSONS, k) ? LESSONS[k] : undefined;
    if (!list || !/^[1-9]\d{0,2}$/.test(n) || +n > list.length) continue;   // лише існуючі уроки
    perCourse.set(k, (perCourse.get(k) ?? 0) + 1);
    done++;
  }
  const activity: Record<string, number> = {};
  for (const r of [...actL, ...actT]) activity[String(r.d)] = (activity[String(r.d)] || 0) + Number(r.c);
  const xp = await xpTotal(env, u.id);
  return {
    nick: u.nick,
    avatarId: idolById(u.avatar_id) ? u.avatar_id : null,
    bio: u.bio ?? "",
    since: u.created_at ? String(u.created_at).slice(0, 7) : null,
    xp,
    level: levelInfo(xp).level,
    streak: effectiveStreak({ streak_count: u.streak_count, last_active_at: u.last_active_at }),
    lessons: done,
    tasks: tasks.length,
    courses: [...perCourse].map(([key, n]) => ({ key, done: n, total: LESSONS[key].length })).sort((a, b) => b.done / b.total - a.done / a.total || b.done - a.done),
    activity,
  };
}
