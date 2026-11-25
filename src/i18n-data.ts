// Англійські назви й описи напрямів і курсів для публічних сторінок. Українські лишаються в data.ts.
import { C, CATS } from "./data.ts";
import { tr } from "./i18n.ts";

export const CAT_EN: Record<string, { title: string; desc: string }> = {
  program: { title: "Programming", desc: "Logical thinking, algorithms and the languages people start with and work in." },
  web: { title: "Web technologies", desc: "Markup, styles and scripts: everything you need to build a living website from scratch." },
  server: { title: "Server-side development", desc: "Code that runs on the server: handling requests, forms and data." },
  data: { title: "Databases", desc: "Storing data and querying it with SQL." },
  tools: { title: "Developer tools", desc: "What every team relies on: version control and the command line." },
};

export const COURSE_EN: Record<string, { name: string; desc: string }> = {
  python: { name: "Python", desc: "A simple language to start with: variables, branching and loops." },
  cpp: { name: "C++", desc: "A fast compiled language: types, input and output, conditions and loops." },
  pascal: { name: "Pascal", desc: "A teaching language with a clear structure, ideal for your first algorithms." },
  html: { name: "HTML", desc: "Page markup: structure, text, lists, tables and forms." },
  css: { name: "CSS", desc: "Page styling: selectors, the box model and flexbox." },
  js: { name: "JavaScript", desc: "The language of the browser: functions, arrays, the DOM and server requests." },
  go: { name: "Go", desc: "A simple and fast language from Google: types, functions and goroutines for concurrency." },
  java: { name: "Java", desc: "A language for large applications and Android: classes, variables, conditions and loops." },
  ts: { name: "TypeScript", desc: "JavaScript with types: fewer errors, clearer code. A continuation of the JavaScript course." },
  php: { name: "PHP", desc: "The web's server-side language: variables, arrays, functions and safe form handling." },
  git: { name: "Git", desc: "Version control: commits, branches, GitHub and teamwork." },
  bash: { name: "Command line", desc: "Terminal and Bash: files, search, pipelines and first scripts." },
  sql: { name: "SQL", desc: "The query language: selecting, filtering, grouping and joining tables." },
};

export const catTitle = (k: string): string => tr(CATS[k].title, CAT_EN[k]?.title ?? CATS[k].title);
export const catDesc = (k: string): string => tr(CATS[k].desc, CAT_EN[k]?.desc ?? CATS[k].desc);
export const courseName = (k: string): string => tr(C[k].name, COURSE_EN[k]?.name ?? C[k].name);
export const courseDesc = (k: string): string => tr(C[k].desc, COURSE_EN[k]?.desc ?? C[k].desc);
