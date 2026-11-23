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

// ---- приклади прямо за тим абзацом, який їх пояснює ----
const plain = (h: string): string => h.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const squash = (s: string): string => s.replace(/\s+/g, "");
/** Фрагменти коду з тегів <code> абзацу (без пробілів); «…» у фрагменті розбиває його на частини */
function snippets(p: string): string[] {
  const out: string[] = [];
  for (const m of p.matchAll(/<code>([\s\S]*?)<\/code>/g)) for (const part of squash(plain(m[1])).split(/…|\.\.\./)) if (part.length >= 3) out.push(part);
  return out;
}

/** Для кожного прикладу (за порядком) повертає номер абзацу, після якого його показати.
 *  Приклад іде за абзацом, у якому згадано найбільше його фрагментів коду; порядок прикладів зберігається (динамічне програмування).
 *  Приклад без збігів не губиться: він займає місце, рівномірно розподілене між абзацами. Лише розмітка, тексти не змінюються. */
export function placeExamples(paragraphs: readonly string[], codes: readonly string[]): number[] {
  const P = paragraphs.length, E = codes.length;
  if (!P || !E) return codes.map(() => 0);
  const sn = paragraphs.map(snippets), src = codes.map(squash);
  const hit = (i: number, j: number): number => sn[i].reduce((s, x) => s + (src[j].includes(x) ? Math.min(x.length, 10) : 0), 0);
  const ideal = (j: number): number => Math.min(P - 1, Math.floor(((j + 1) * P) / (E + 1)));
  const LAMBDA = 0.6, SHARE = 5, INTRO = 2;   // штрафи: за відхід від рівномірного місця, за кілька прикладів після одного абзацу, за приклад одразу після вступу
  const gain = (i: number, j: number): number => hit(i, j) - LAMBDA * Math.abs(i - ideal(j)) - (i === 0 && P > 2 ? INTRO : 0);
  // best[j][i]: найкраща сума для перших j+1 прикладів, якщо приклад j стоїть після абзацу i
  const best: number[][] = [], from: number[][] = [];
  for (let j = 0; j < E; j++) {
    best.push(new Array(P).fill(-Infinity)); from.push(new Array(P).fill(-1));
    for (let i = 0; i < P; i++) {
      if (j === 0) { best[j][i] = gain(i, j); continue; }
      for (let k = 0; k <= i; k++) { const v = best[j - 1][k] + gain(i, j) - (k === i ? SHARE : 0); if (v > best[j][i]) { best[j][i] = v; from[j][i] = k; } }
    }
  }
  let i = best[E - 1].reduce((b, v, x) => (v > best[E - 1][b] ? x : b), 0);
  const at: number[] = new Array(E);
  for (let j = E - 1; j >= 0; j--) { at[j] = i; i = from[j][i]; }
  return at;
}

// ---- довгі абзаци розбиваємо на 2–3 частини по реченнях (лише подання: текст той самий, між частинами лише менший відступ) ----
/** Чи стоїть позиція всередині тега <code> (там крапки — частина коду, різати не можна) */
const inCode = (s: string, at: number): boolean => (s.slice(0, at).match(/<code>/g) ?? []).length > (s.slice(0, at).match(/<\/code>/g) ?? []).length;
export function splitParagraph(p: string, minChunk = 200, minTail = 100, minLen = 360): string[] {
  if (p.length < minLen) return [p];
  const out: string[] = [];
  let start = 0;
  for (const m of p.matchAll(/([.!?…])(["”»)]?)\s+(?=[«"„<A-ZА-ЯІЇЄҐ])/g)) {
    const end = m.index + m[1].length + m[2].length, next = m.index + m[0].length;
    const word = /([A-Za-zА-Яа-яІіЇїЄєҐґ]+)$/.exec(p.slice(0, m.index))?.[1] ?? "";
    if (m[1] === "." && word.length > 0 && word.length <= 2) continue;   // «т. д.», «напр.»: це не кінець речення
    if (inCode(p, m.index)) continue;
    if (end - start >= minChunk && p.length - end >= minTail) { out.push(p.slice(start, end)); start = next; }
  }
  out.push(p.slice(start));
  return out;
}

const chip = (id: string, label: string): string => `<button type="button" class="l-chip" data-scroll="${id}">${label}</button>`;

/** Тіло уроку до самоперевірки включно: підсумок, зміст, теорія, приклади, «Запам'ятайте», «Як це в роботі», завдання */
export function lessonBody(l: Lesson): string {
  const nav = [chip("l-theory", "Теорія"), l.code.length ? chip("l-code", "Приклади") : "", chip("l-note", "Запам'ятайте"), l.work ? chip("l-work", "У роботі") : "", chip("l-check", "Самоперевірка")].join("");
  const at = placeExamples(l.p, l.code);
  const figure = (x: string, i: number): string => {
    const f = codeFlag(x);
    return `<figure class="ex${f ? ` ex--${f.kind}` : ""}"${i === 0 ? ' id="l-code"' : ""}><figcaption><span>Приклад ${i + 1} з ${l.code.length}</span>${f ? `<span class="ex-flag fl-${f.kind}">${f.label}</span>` : ""}</figcaption><pre class="code">${esc(x)}</pre></figure>`;
  };
  const theory = l.p.map((x, pi) => `<div class="l-para">${splitParagraph(x).map((c) => `<p>${c}</p>`).join("")}</div>${l.code.map((c, i) => (at[i] === pi ? figure(c, i) : "")).join("")}`).join("");
  return `<div class="l-body">
        ${l.easy ? `<aside class="callout co-easy"><div class="co-h">Простими словами</div><p>${l.easy}</p></aside>` : ""}
        <nav class="l-toc" aria-label="Зміст уроку">${nav}<span class="l-size" role="group" aria-label="Розмір тексту"><button type="button" class="l-chip" data-fs="-1" aria-label="Менший текст">A−</button><button type="button" class="l-chip" data-fs="1" aria-label="Більший текст">A+</button></span></nav>
        <h2 id="l-theory">Теорія з прикладами</h2>
        <div class="l-theory">${theory}</div>
        <aside class="callout co-note" id="l-note"><div class="co-h">Запам'ятайте</div><p>${l.note}</p></aside>
        ${l.work ? `<section class="l-work" id="l-work"><h2>Як це в роботі</h2><p>${l.work}</p></section>` : ""}
        <h2 id="l-check">Завдання для самоперевірки</h2>
        <ul class="tasks">${l.tasks.map((t, j) => `<li><input type="checkbox" id="t${j}"><label for="t${j}">${t}</label></li>`).join("")}</ul>
      </div>`;
}
