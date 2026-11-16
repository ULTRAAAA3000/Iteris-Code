// Практика на сервері: і завдання з content/, і проєкти за ТЗ. Завдання лежать лише в серверному коді (див. lib/content.ts),
// тому цей модуль не можна підключати з браузерного коду (src/).
import { taskById } from "../content/tasks/index.ts";
import { projectById, type Practice } from "../src/projects/index.ts";

export const practiceById = (id: string): Practice | undefined => taskById(id) ?? projectById(id);
