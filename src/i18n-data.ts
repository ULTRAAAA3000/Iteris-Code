// Англійські назви й описи напрямів і курсів для публічних сторінок. Українські лишаються в data.ts.
import { C, CATS, refMeta } from "./data.ts";
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
  c: { name: "C", desc: "The language operating systems are written in: types, pointers, memory, structures and files." },
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
  rust: { name: "Rust", desc: "A language without a garbage collector: memory safety, ownership, traits and C++-level speed." },
  csharp: { name: "C#", desc: "The language of the .NET platform: apps, Unity games, the web and services." },
  kotlin: { name: "Kotlin", desc: "A modern language for Android and the server: concise syntax, null safety and coroutines." },
  swift: { name: "Swift", desc: "Apple's language: apps for iPhone, iPad and Mac, optionals, structs and protocols." },
  ruby: { name: "Ruby", desc: "An expressive language for scripts and the web: blocks, symbols and readable code, as in Rails." },
  dart: { name: "Dart", desc: "The language of Flutter: one codebase for Android, iOS and the web, null safety and async code." },
  lua: { name: "Lua", desc: "A small embeddable language for games and scripts: tables, closures and coroutines." },
  r: { name: "R", desc: "The language of statistics and data analysis: vectors, data frames, functions and plots." },
};

export const catTitle = (k: string): string => tr(CATS[k].title, CAT_EN[k]?.title ?? CATS[k].title);
export const catDesc = (k: string): string => tr(CATS[k].desc, CAT_EN[k]?.desc ?? CATS[k].desc);
export const courseName = (k: string): string => tr(refMeta(k).name, COURSE_EN[k]?.name ?? refMeta(k).name);
export const courseDesc = (k: string): string => tr(refMeta(k).desc, COURSE_EN[k]?.desc ?? refMeta(k).desc);
