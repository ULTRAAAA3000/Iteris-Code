// Глава 08: завдання зібрано з частин (a, b)
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { TASKS_08a } from "./ch08a.ts";
import { TASKS_08b } from "./ch08b.ts";

export const TASKS_08: readonly RemoteTask[] = [...TASKS_08a, ...TASKS_08b];
