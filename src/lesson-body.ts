// Єдиний шаблон тіла уроку: однаковий для всіх курсів (Go, Python, JS тощо). Тексти уроків не змінюються, змінюється лише подання.
// Стилі: src/lesson.css (клас .l-body). Функція повертає лише HTML-рядок і не торкається DOM, тому її легко перевіряти в тестах.
import type { Lesson } from "./types.ts";
import { esc } from "./util.ts";

const words = (s: string): number => (s.replace(/<[^>]+>/g, " ").match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;

/** Скільки хвилин іде на читання теорії уроку (близько 180 слів на хвилину, мінімум 1) */
export function readMinutes(l: Lesson): number {
  const total = words(l.easy ?? "") + l.p.reduce((s, x) => s + words(x), 0) + words(l.note) + words(l.work ?? "");
  return Math.max(1, Math.round(total / 180));
}

/** Позначки навмисного збою в першому рядку прикладу: «// не компілюється: …», «# аварія: …» тощо */
const FLAGS: readonly [RegExp, string, string][] = [
  [/не\s+компілюється/i, "err", "Не компілюється"],
  [/аварія/i, "crash", "Аварія під час запуску"],
  [/лише\s+компіляція/i, "build", "Лише компіляція"],
  [/фрагмент/i, "frag", "Фрагмент"],
];
export function codeFlag(code: string): { kind: string; label: string } | null {
  const first = code.split("\n").find((x) => x.trim()) ?? "";
  if (!/^\s*(\/\/|#|--|\/\*|<!--|\(\*)/.test(first)) return null;
  const f = FLAGS.find(([re]) => re.test(first));
  return f ? { kind: f[1], label: f[2] } : null;
}

const chip = (id: string, label: string): string => `<button type="button" class="l-chip" data-scroll="${id}">${label}</button>`;

/** Тіло уроку до самоперевірки включно: підсумок, зміст, теорія, приклади, «Запам'ятайте», «Як це в роботі», завдання */
export function lessonBody(l: Lesson): string {
  const nav = [chip("l-theory", "Теорія"), chip("l-code", "Приклади"), chip("l-note", "Запам'ятайте"), l.work ? chip("l-work", "У роботі") : "", chip("l-check", "Самоперевірка")].join("");
  const examples = l.code.map((x, i) => {
    const f = codeFlag(x);
    return `<figure class="ex${f ? ` ex--${f.kind}` : ""}"><figcaption><span>Приклад ${i + 1} з ${l.code.length}</span>${f ? `<span class="ex-flag fl-${f.kind}">${f.label}</span>` : ""}</figcaption><pre class="code">${esc(x)}</pre></figure>`;
  }).join("");
  return `<div class="l-body">
        ${l.easy ? `<aside class="callout co-easy"><div class="co-h">Простими словами</div><p>${l.easy}</p></aside>` : ""}
        <nav class="l-toc" aria-label="Зміст уроку">${nav}</nav>
        <h2 id="l-theory">Теорія</h2>
        <div class="l-theory">${l.p.map((x) => `<p>${x}</p>`).join("")}</div>
        <h2 id="l-code">Приклади коду</h2>
        ${examples}
        <aside class="callout co-note" id="l-note"><div class="co-h">Запам'ятайте</div><p>${l.note}</p></aside>
        ${l.work ? `<section class="l-work" id="l-work"><h2>Як це в роботі</h2><p>${l.work}</p></section>` : ""}
        <h2 id="l-check">Завдання для самоперевірки</h2>
        <ul class="tasks">${l.tasks.map((t, j) => `<li><input type="checkbox" id="t${j}"><label for="t${j}">${t}</label></li>`).join("")}</ul>
      </div>`;
}
