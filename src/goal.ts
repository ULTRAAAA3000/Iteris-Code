// Денна ціль: скільки «кроків» (новий урок або вперше пройдене завдання) людина хоче робити щодня. Без залежностей від DOM:
// ті самі значення перевіряє сервер (lib/goal.ts, functions/api/goal.ts) і показує інтерфейс.
export const GOALS = [1, 2, 3, 5] as const;
export const DEFAULT_GOAL = 1;
export const isGoal = (x: unknown): x is number => typeof x === "number" && (GOALS as readonly number[]).includes(x);

/** Скільки кроків заплановано й зроблено сьогодні (день за UTC, як і серія); custom = людина сама обрала ціль */
export interface GoalInfo { target: number; done: number; custom: boolean }

export const GOAL_TEXT: Record<number, string> = { 1: "Легко", 2: "Звичайно", 3: "Серйозно", 5: "Інтенсив" };
