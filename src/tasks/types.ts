// Практичні завдання: опис спільний для фронтенду і сервера (без залежностей від DOM)
export interface Task {
  id: string;
  /** Урок, до якого прив'язане завдання, у форматі "js/3" */
  lesson: string;
  course: string;
  title: string;
  /** Навіщо це потрібно в реальному проєкті */
  context: string;
  /** Постановка задачі: абзаци */
  brief: string[];
  starter: string;
  /** Код тестів: виконується в одному контексті з рішенням користувача (API як у Vitest) */
  tests: string;
  premium: boolean;
  xp: number;
}
