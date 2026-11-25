// Глава 12: завдання зібрано з частин (a, b)
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { TASKS_12a } from "./ch12a.ts";
import { TASKS_12b } from "./ch12b.ts";

export const TASKS_12: readonly RemoteTask[] = [...TASKS_12a, ...TASKS_12b];
