// Звернення до підтримки: теми й межі полів. Спільне для форми (браузер) і сервера (/api/contact).
export const TOPICS = {
  visual: "Ефекти та візуал",
  bug: "Помилка в роботі",
  idea: "Ідея або побажання",
  other: "Інше",
} as const;
export const TOPICS_EN: Record<keyof typeof TOPICS, string> = { visual: "Effects and visuals", bug: "Something is broken", idea: "Idea or wish", other: "Other" };
export type Topic = keyof typeof TOPICS;
export const isTopic = (v: unknown): v is Topic => typeof v === "string" && Object.prototype.hasOwnProperty.call(TOPICS, v);
export const DEFAULT_TOPIC: Topic = "visual";

export const MSG_MIN = 10;
export const MSG_MAX = 2000;
export const NAME_MAX = 60;
