import type { GoalInfo } from "./goal.ts";
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
  /** Просунутий урок (лише для рівня «Просунутий») */
  adv?: boolean;
}

/** Урок у списку курсу (відповідь /api/courses): без тексту, лише назва, глава й id завдання */
export interface OutlineLesson { t: string; ch?: string; task?: string; project?: string; /** Просунутий урок: показується лише на просунутому рівні курсу */ adv?: boolean }
/** Короткий опис завдання для списків і кабінету (повний текст приходить разом з уроком) */
export interface TaskMeta { id: string; title: string; xp: number; course: string; lesson: string }
/** GET /api/courses (лише після входу): структура всіх курсів і список завдань */
/** Короткий опис проєкту за ТЗ (повний проєкт приходить з /api/project) */
export interface ProjectMeta { id: string; title: string; xp: number; course: string; lesson: string }
export interface Outline { courses: Record<string, OutlineLesson[]>; tasks: TaskMeta[]; projects: ProjectMeta[]; /** Обраний користувачем рівень курсів ('base' | 'adv'); немає запису: базовий */ levels?: Record<string, "base" | "adv"> }
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
  /** Нікнейм публічного профілю (задається один раз) і вибраний герой-аватарка */
  nick?: string | null;
  avatarId?: string | null;
}

/** GET /api/u?nick=…: відкриті дані профілю (дзеркало lib/profile.ts) */
export interface PublicProfile {
  nick: string;
  avatarId: string | null;
  bio: string;
  since: string | null;
  xp: number;
  level: number;
  streak: number;
  lessons: number;
  tasks: number;
  courses: { key: string; done: number; total: number }[];
  activity: Record<string, number>;
  badges: string[];
}

/** GET /api/profile: свої налаштування профілю */
export interface ProfileSettings { nick: string | null; avatarId: string | null; bio: string; public: boolean }

/** Плашка «Цікавий факт»: новий запис раз на 5 годин, про напрямок, який обрала людина */
export interface DailyFact { id: string; lang: string; kind: "fact" | "tip"; text: string; nextAt: string }

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
  fact?: DailyFact | null;
  /** Денна ціль: заплановано й зроблено кроків сьогодні */
  goal?: GoalInfo;
}
