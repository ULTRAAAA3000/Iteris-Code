// Нарахування XP на сервері. XP видається лише за перевірені факти в базі (пройдені уроки, розв'язані завдання, серія).
// Унікальність (user_id, reason, ref) гарантує, що за одну й ту саму дію XP не нараховується двічі,
// а зняття й повторна відмітка уроку нічого не накручують.
import type { Env, UserRow } from "./env.ts";
import { effectiveStreak } from "./session.ts";
import { LESSONS } from "../content/lessons.js";
import { taskById } from "../content/tasks/index.ts";
import { isLevel, LESSON_XP, STREAK_BONUS, STREAK_MILESTONES, type Level } from "../src/xp.ts";

export interface XpEvent { amount: number; reason: "lesson" | "task" | "streak"; ref: string }

export const lessonExists = (id: string): boolean => {
  const [k, n] = id.split("/");
  const list = Object.prototype.hasOwnProperty.call(LESSONS, k) ? LESSONS[k] : undefined;
  return !!list && /^[1-9]\d{0,2}$/.test(n) && +n <= list.length;
};
export const courseExists = (k: string): boolean => Object.prototype.hasOwnProperty.call(LESSONS, k);

export async function xpTotal(env: Pick<Env, "DB">, userId: string): Promise<number> {
  const r = await env.DB.prepare("SELECT COALESCE(SUM(amount), 0) AS s FROM xp_events WHERE user_id = ?1").bind(userId).first<{ s: number }>();
  return Number(r?.s ?? 0);
}

/** Нараховує відсутні події XP; повертає нові події та суму до й після (ідемпотентно) */
export async function syncXp(env: Pick<Env, "DB">, u: Pick<UserRow, "id" | "streak_count" | "last_active_at">): Promise<{ prev: number; total: number; gained: XpEvent[] }> {
  const [lessons, tasks, have] = (await env.DB.batch<Record<string, string | number>>([
    env.DB.prepare("SELECT lesson_id AS v FROM user_progress WHERE user_id = ?1").bind(u.id),
    env.DB.prepare("SELECT DISTINCT task_id AS v FROM task_submissions WHERE user_id = ?1 AND is_passed = 1").bind(u.id),
    env.DB.prepare("SELECT reason, ref, amount FROM xp_events WHERE user_id = ?1").bind(u.id),
  ])).map((r) => r.results);

  const owned = new Set(have.map((r) => r.reason + ":" + r.ref));
  const prev = have.reduce((s, r) => s + Number(r.amount), 0);
  const want: XpEvent[] = [];
  for (const r of lessons) if (lessonExists(String(r.v))) want.push({ amount: LESSON_XP, reason: "lesson", ref: String(r.v) });
  for (const r of tasks) { const t = taskById(String(r.v)); if (t) want.push({ amount: t.xp, reason: "task", ref: t.id }); }
  const streak = effectiveStreak(u);
  for (const m of STREAK_MILESTONES) if (streak >= m) want.push({ amount: STREAK_BONUS[m], reason: "streak", ref: String(m) });

  const gained = want.filter((e) => !owned.has(e.reason + ":" + e.ref));
  if (gained.length) {
    await env.DB.prepare("INSERT OR IGNORE INTO xp_events (user_id, amount, reason, ref) SELECT ?1, json_extract(value, '$.amount'), json_extract(value, '$.reason'), json_extract(value, '$.ref') FROM json_each(?2)")
      .bind(u.id, JSON.stringify(gained)).run();
  }
  return { prev, total: await xpTotal(env, u.id), gained };
}

export interface Onboarding { level: Level; courses: string[] }

export async function loadOnboarding(env: Pick<Env, "DB">, userId: string): Promise<Onboarding | null> {
  const r = await env.DB.prepare("SELECT level, courses FROM user_onboarding WHERE user_id = ?1").bind(userId).first<{ level: string; courses: string }>();
  if (!r || !isLevel(r.level)) return null;
  try {
    const courses = (JSON.parse(r.courses) as unknown[]).filter((c): c is string => typeof c === "string" && courseExists(c));
    return courses.length ? { level: r.level, courses } : null;
  } catch {
    return null;
  }
}
