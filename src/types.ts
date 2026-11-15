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
