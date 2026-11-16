import type { Task } from "./tasks/types.ts";

export interface Lesson {
  t: string;
  p: string[];
  code: string[];
  note: string;
  easy?: string;
  work?: string;
  tasks: string[];
  ch?: string;
}

/** Урок у списку курсу (відповідь /api/courses): без тексту, лише назва, глава й id завдання */
export interface OutlineLesson { t: string; ch?: string; task?: string }
/** Короткий опис завдання для списків і кабінету (повний текст приходить разом з уроком) */
export interface TaskMeta { id: string; title: string; xp: number; course: string; lesson: string }
/** GET /api/courses (лише після входу): структура всіх курсів і список завдань */
export interface Outline { courses: Record<string, OutlineLesson[]>; tasks: TaskMeta[] }
/** GET /api/lesson?k=js&n=3 (лише після входу): повний урок і його завдання, якщо воно є */
export interface LessonPayload { lesson: Lesson; task: Task | null }

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isPro: boolean;
  proUntil: string | null;
  streak: number;
}

export interface DashboardData {
  user: PublicUser;
  completedLessons: string[];
  lastLesson: string | null;
  passedTasks: string[];
  tasksPassed: number;
  recentSubmissions: { taskId: string; passed: boolean; at: string }[];
  activity: Record<string, number>;
  /** Етап 2: сума XP, вибір рівня й курсів (null = ще не обирав), що пройдено в кожен день (UTC) */
  xp?: number;
  onboarding?: { level: "beginner" | "intermediate" | "advanced"; courses: string[] } | null;
  days?: Record<string, { l: string[]; t: string[] }>;
}
