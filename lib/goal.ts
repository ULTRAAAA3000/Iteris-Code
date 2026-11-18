// Денна ціль: збереження вибору й підрахунок кроків за сьогодні (день за UTC, як і серія в lib/session.ts).
// Крок це урок, позначений пройденим сьогодні, або завдання, яке вперше розв'язано сьогодні. Повторне розв'язання нічого не додає,
// тож ціль не накрутити. Рахуємо за user_progress і task_submissions, а не за xp_events: XP нараховується в момент відкриття кабінету.
import type { Env } from "./env.ts";
import { DEFAULT_GOAL, isGoal, type GoalInfo } from "../src/goal.ts";

export async function loadGoal(env: Pick<Env, "DB">, userId: string): Promise<number | null> {
  const r = await env.DB.prepare("SELECT daily_goal FROM user_goals WHERE user_id = ?1").bind(userId).first<{ daily_goal: number }>();
  return r && isGoal(r.daily_goal) ? r.daily_goal : null;
}

export async function saveGoal(env: Pick<Env, "DB">, userId: string, goal: number): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO user_goals (user_id, daily_goal) VALUES (?1, ?2) ON CONFLICT(user_id) DO UPDATE SET daily_goal = excluded.daily_goal, updated_at = CURRENT_TIMESTAMP"
  ).bind(userId, goal).run();
}

export async function stepsToday(env: Pick<Env, "DB">, userId: string): Promise<number> {
  const r = await env.DB.prepare(
    `SELECT (SELECT COUNT(*) FROM user_progress WHERE user_id = ?1 AND date(completed_at) = date('now'))
          + (SELECT COUNT(*) FROM (SELECT task_id FROM task_submissions WHERE user_id = ?1 AND is_passed = 1 GROUP BY task_id HAVING date(MIN(created_at)) = date('now'))) AS n`
  ).bind(userId).first<{ n: number }>();
  return Number(r?.n ?? 0);
}

export async function goalInfo(env: Pick<Env, "DB">, userId: string): Promise<GoalInfo> {
  const [goal, done] = await Promise.all([loadGoal(env, userId), stepsToday(env, userId)]);
  return { target: goal ?? DEFAULT_GOAL, done, custom: goal !== null };
}
