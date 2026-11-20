// Реєстр чернеток і перетворення чернетки на справжнє завдання. Нікуди не підключено (див. types.ts).
import type { PageTask, RemoteTask } from "../../src/tasks/types.ts";
import { CPP_DRAFTS } from "./cpp.ts";
import { HTML_DRAFTS } from "./html.ts";
import { PASCAL_DRAFTS } from "./pascal.ts";
import type { SpecDraft } from "./types.ts";

export type { SpecDraft } from "./types.ts";

export const DRAFTS: readonly SpecDraft[] = [...CPP_DRAFTS, ...PASCAL_DRAFTS, ...HTML_DRAFTS];

const FILE = { cpp: "main.cpp", pascal: "main.pas" } as const;

/** Чернетка → завдання, яке можна покласти в content/tasks/<мова>.ts. Умови ТЗ переносяться в постановку, вимоги стають перевірками R1, R2, … */
export function draftToTask(d: SpecDraft): RemoteTask | PageTask {
  const brief = [
    ...d.brief,
    `<b>Договір:</b> ${d.contract.join("; ")}.`,
    `<b>Вимоги:</b><br>${d.requirements.map((r) => `<b>${r.id}.</b> ${r.text}`).join("<br>")}`,
  ];
  const common = { id: d.id, lesson: d.after, course: d.course, title: d.title, context: d.context, brief, starter: d.starter, premium: false, xp: d.xp };
  const named = <C extends object>(d2: SpecDraft): (C & { name: string; hint: string })[] =>
    d2.requirements.flatMap((r) => (r.checks as C[]).map((c, i) => ({ ...c, name: r.checks.length > 1 ? `${r.id}.${i + 1} ${r.short}` : `${r.id}. ${r.short}`, hint: r.hint })));
  return d.runtime === "remote"
    ? { ...common, runtime: "remote", course: d.course, lang: d.lang, file: FILE[d.lang], editorLang: d.lang, checks: named(d) }
    : { ...common, runtime: "page", edit: "html", file: "index.html", editorLang: "html", checks: named(d) };
}
