// Шлях (лінійка уроків): курс → глави → вузли-уроки. Без блокувань (D6): будь-який урок відкривається, є лише підказка «ви тут».
// Між уроками показуємо вузли практики там, де вже є завдання (етап 3 додасть нові).
import { C, CATS } from "./data.ts";
import { isDone, isTaskPassed, progress } from "./progress.ts";
import { taskForLesson } from "./tasks/index.ts";
import { escA, pad, store } from "./util.ts";
import { LEVEL_TEXT, startPoint, type OnboardingState } from "./onboarding.ts";
import { chaptersOf, currentLesson, startLesson, type Level } from "./xp.ts";

export interface PathCtx { onboarding: OnboardingState | null | undefined; loggedIn: boolean }

const ZIGZAG = [0, 26, 44, 26, 0, -26, -44, -26];   // зсув вузлів у пікселях: звивиста доріжка

export function pickCourse(k: string | undefined, ctx: PathCtx): string {
  if (k && C[k]) return k;
  const last = store.get<{ k?: string }>("ic-last", {}).k;
  return ctx.onboarding?.courses.find((c) => C[c]) ?? (last && C[last] ? last : Object.keys(C)[0]);
}

export function renderPath(k: string | undefined, ctx: PathCtx): string {
  const key = pickCourse(k, ctx), c = C[key], total = c.L.length;
  const level: Level | null = ctx.onboarding?.level ?? null;
  const start = level ? startLesson(c.L, level) : 1;
  const cur = currentLesson(total, start, (n) => isDone(key, n));
  const p = progress(key), pct = Math.round((p / total) * 100);
  const mine = ctx.onboarding?.courses ?? [];
  const tabs = [...mine, ...Object.keys(C).filter((x) => !mine.includes(x))]
    .map((x) => `<a class="path-tab" href="#/path/${x}"${x === key ? ' aria-current="page"' : ""}>${mine.includes(x) ? "★ " : ""}${escA(C[x].name)}</a>`).join("");

  const nodes = chaptersOf(c.L).map((ch) => {
    const isStart = level !== null && ch.from === start;
    let html = `<li class="path-chap${isStart ? " start" : ""}">Глава: ${escA(ch.name)}${isStart ? `<span class="flag">Ваш старт</span>` : ""}</li>`;
    for (let n = ch.from; n <= ch.to; n++) {
      const l = c.L[n - 1], d = isDone(key, n), isCur = n === cur;
      const state = d ? "done" : isCur ? "current" : n < start ? "before" : "todo";
      const label = `Урок ${n}: ${l.t}. ${d ? "Пройдено" : isCur ? "Поточний урок" : "Доступний"}`;
      const task = taskForLesson(`${key}/${n}`);
      html += `<li class="path-node ${state}" style="--x:${ZIGZAG[(n - 1) % ZIGZAG.length]}px">
        ${isCur ? `<span class="path-here">${p ? "Продовжити" : "Почати"}</span>` : ""}
        <a class="pn-dot" href="#/lesson/${key}/${n}" aria-label="${escA(label)}"${isCur ? ' aria-current="step"' : ""}>${d ? "✓" : pad(n)}</a>
        <span class="pn-title">${escA(l.t)}</span>
        ${task ? `<a class="path-prac${isTaskPassed(task.id) ? " done" : ""}" href="#/lesson/${key}/${n}">⚡ ${isTaskPassed(task.id) ? "Завдання розв'язано" : "Практика: " + escA(task.title)}</a>` : ""}
      </li>`;
    }
    return html;
  }).join("");

  const intro = level
    ? `Ваш рівень: <b>${LEVEL_TEXT[level][0]}</b>. Старт: глава «${escA(startPoint(key, level)[1])}». Попередні глави відкриті, їх можна пройти будь-коли. <a href="#/start">Змінити</a>`
    : ctx.loggedIn ? `<a href="#/start">Оберіть рівень</a>, і ми покажемо, з якого місця почати.` : `Усі уроки відкриті. <button class="btn small" data-act="login">Увійти</button>, щоб зберігати шлях на всіх пристроях і отримувати XP.`;
  return `<div class="crumbs"><a href="#/">Головна</a> / Шлях</div>
    <div class="path-head"><h1>Мій шлях</h1><p class="dash-muted">${intro}</p></div>
    <nav class="path-tabs" aria-label="Курси">${tabs}</nav>
    <div class="card path-sum">
      <div class="path-sum-t"><b>${escA(C[key].name)}</b><span class="dash-muted">${CATS[c.cat].title}</span></div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${p}" aria-label="Прогрес курсу"><i style="width:${pct}%"></i></div>
      <span><b>${p}</b> з ${total}</span>
      ${cur ? `<a class="btn primary small" href="#/lesson/${key}/${cur}">${p ? "Продовжити" : "Почати курс"}</a>` : `<span class="s-ok">Курс пройдено 🎉</span>`}
    </div>
    <ol class="path" aria-label="Шлях курсу ${escA(c.name)}">${nodes}</ol>`;
}
