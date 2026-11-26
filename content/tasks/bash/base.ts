export const base = { course: "bash", runtime: "remote", lang: "bash", file: "main.sh", editorLang: "shell", premium: false } as const;

/** Тег для еталонів і заготовок: як String.raw, але \${…} і \` дають ${…} і ` (у String.raw запис ${var} JavaScript прочитав би як підстановку) */
export const sh = (s: TemplateStringsArray): string => s.raw.join("").replace(/\\\$\{/g, "${").replace(/\\`/g, "`");
