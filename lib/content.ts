// Тексти уроків і завдання лежать у content/ і потрапляють лише в серверний код. Браузер отримує їх після входу
// через /api/courses (структура) та /api/lesson (один урок із завданням). У публічну збірку (dist) вони не входять.
import { LESSONS } from "../content/lessons.js";
import { ALL_PROJECTS, projectForLesson } from "../content/projects/index.ts";
import { TASKS, taskForLesson } from "../content/tasks/index.ts";
import type { LessonPayload, Outline } from "../src/types.ts";
import { isRemote } from "../src/tasks/types.ts";

let outline: Outline | undefined;

/** Структура курсів: назви уроків, глави, де є завдання. Однакова для всіх, тому збирається один раз */
export function courseOutline(): Outline {
  outline ??= {
    courses: Object.fromEntries(Object.entries(LESSONS).map(([k, list]) => [k, list.map((l, i) => {
      const task = taskForLesson(`${k}/${i + 1}`), project = projectForLesson(`${k}/${i + 1}`);
      return { t: l.t, ...(l.ch ? { ch: l.ch } : {}), ...(l.adv ? { adv: true } : {}), ...(task ? { task: task.id } : {}), ...(project ? { project: project.id } : {}) };
    })])),
    tasks: TASKS.map((t) => ({ id: t.id, title: t.title, xp: t.xp, course: t.course, lesson: t.lesson })),
    projects: ALL_PROJECTS.map((p) => ({ id: p.id, title: p.title, xp: p.xp, course: p.course, lesson: p.lesson })),
  };
  return outline;
}

/** Урок k/n з завданням або null, якщо такого немає. Очікувані відповіді (checks) віддалених завдань браузеру не потрібні: їх перевіряє сервер */
export function lessonPayload(k: string, n: number): LessonPayload | null {
  const list = Object.prototype.hasOwnProperty.call(LESSONS, k) ? LESSONS[k] : undefined;
  if (!list || !Number.isInteger(n) || n < 1 || n > list.length) return null;
  const task = taskForLesson(`${k}/${n}`);
  return { lesson: list[n - 1], task: task ? (isRemote(task) ? { ...task, checks: [] } : task) : null };
}
