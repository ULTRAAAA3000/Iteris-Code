import type { PageTask } from "../../../src/tasks/types.ts";
import { TASKS_01 } from "./ch01.ts";
import { TASKS_02 } from "./ch02.ts";
import { TASKS_03 } from "./ch03.ts";
import { TASKS_04 } from "./ch04.ts";
import { TASKS_05 } from "./ch05.ts";
import { TASKS_06 } from "./ch06.ts";
import { TASKS_07 } from "./ch07.ts";
import { TASKS_08 } from "./ch08.ts";

/** Завдання курсу HTML (30 уроків): по одному на урок, еталони в tests/solutions/html-chNN.mjs */
export const HTML_TASKS: readonly PageTask[] = [
  ...TASKS_01,
  ...TASKS_02,
  ...TASKS_03,
  ...TASKS_04,
  ...TASKS_05,
  ...TASKS_06,
  ...TASKS_07,
  ...TASKS_08,
];
