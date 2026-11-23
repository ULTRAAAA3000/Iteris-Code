// Рівень проходження курсу: «base» (лише базові уроки) або «adv» (усі, з просунутими). Рівні мають курси, де є уроки з adv: true (поки Go).
// Немає рядка в БД: базовий. Урок завжди доступний за прямим посиланням, рівень лише визначає, що показують списки, шлях і прогрес.
import { LESSONS } from "../content/lessons.js";
import type { Env } from "./env.ts";

export type CourseLevel = "base" | "adv";
export const isLevel = (v: unknown): v is CourseLevel => v === "base" || v === "adv";
/** Чи є в курсі просунуті уроки, тобто чи має сенс перемикач */
export const hasLevels = (course: string): boolean => Object.prototype.hasOwnProperty.call(LESSONS, course) && LESSONS[course].some((l: { adv?: boolean }) => l.adv);

export async function loadLevels(env: Pick<Env, "DB">, userId: string): Promise<Record<string, CourseLevel>> {
  const { results } = await env.DB.prepare("SELECT course, level FROM user_course_levels WHERE user_id = ?1").bind(userId).all<{ course: string; level: string }>();
  const out: Record<string, CourseLevel> = {};
  for (const r of results ?? []) if (isLevel(r.level) && hasLevels(r.course)) out[r.course] = r.level;
  return out;
}

export async function saveLevel(env: Pick<Env, "DB">, userId: string, course: string, level: CourseLevel): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO user_course_levels (user_id, course, level) VALUES (?1, ?2, ?3) ON CONFLICT(user_id, course) DO UPDATE SET level = excluded.level, updated_at = CURRENT_TIMESTAMP"
  ).bind(userId, course, level).run();
}
