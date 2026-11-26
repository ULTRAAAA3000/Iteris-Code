// Завдання курсу Git запускаються як скрипти Bash (lang: "bash", main.sh): репозиторій створюється в тимчасовій папці.
export { sh } from "../bash/base.ts";

export const base = { course: "git", runtime: "remote", lang: "bash", file: "main.sh", editorLang: "shell", premium: false } as const;
