import { BASH_TASKS } from "./bash.ts";
import { C_TASKS } from "./c/index.ts";
import { CPP_TASKS } from "./cpp/index.ts";
import { CSS_TASKS } from "./css/index.ts";
import { GO_TASKS } from "./go/index.ts";
import { HTML_TASKS } from "./html/index.ts";
import { JAVA_TASKS } from "./java/index.ts";
import { JS_TASKS } from "./js/index.ts";
import { PASCAL_TASKS } from "./pascal.ts";
import { PHP_TASKS } from "./php/index.ts";
import { PYTHON_TASKS } from "./python/index.ts";
import { SQL_TASKS } from "./sql/index.ts";
import { TS_TASKS } from "./ts.ts";
import type { Task } from "../../src/tasks/types.ts";

export type { Task };

export const TASKS: readonly Task[] = [
  ...C_TASKS,
  ...GO_TASKS,
  ...PYTHON_TASKS,
  ...JAVA_TASKS,
  ...CPP_TASKS,
  ...PHP_TASKS,
  ...PASCAL_TASKS,
  ...TS_TASKS,
  ...JS_TASKS,
  ...HTML_TASKS,
  ...CSS_TASKS,
  ...SQL_TASKS,
  ...BASH_TASKS,
];

export const taskById = (id: string): Task | undefined => TASKS.find((t) => t.id === id);
export const taskForLesson = (lessonId: string): Task | undefined => TASKS.find((t) => t.lesson === lessonId);
