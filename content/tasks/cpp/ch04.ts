// Глава 04: завдання зібрано з частин (a, b, c)
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { TASKS_04a } from "./ch04a.ts";
import { TASKS_04b } from "./ch04b.ts";
import { TASKS_04c } from "./ch04c.ts";

export const TASKS_04: readonly RemoteTask[] = [...TASKS_04a, ...TASKS_04b, ...TASKS_04c];
