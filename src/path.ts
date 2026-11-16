// Шлях (лінійка уроків): курс → глави → вузли-уроки. Без блокувань (D6): будь-який урок відкривається, є лише підказка «ви тут».
// Між уроками показуємо вузли практики там, де вже є завдання (етап 3 додасть нові).
import { C, CATS } from "./data.ts";
import { isDone, isTaskPassed, progress } from "./progress.ts";
import { projectForLesson } from "./projects/index.ts";
import { taskForLesson } from "./tasks/index.ts";
import { escA, pad, store } from "./util.ts";
import { LEVEL_TEXT, startPoint, type OnboardingState } from "./onboarding.ts";
import { chaptersOf, currentLesson, startLesson, type Level } from "./xp.ts";

export interface PathCtx { onboarding: OnboardingState | null | undefined; loggedIn: boolean }

const ZIGZAG = [0, 28, 48, 28, 0, -28, -48, -28];   // зсув вузлів у пікселях: звивиста доріжка
/** Підпис ставимо збоку від кружка, де більше місця (лінія між кружками тоді нічого не перетинає): вузол ліворуч від осі, підпис праворуч, і навпаки */
const sideOf = (n: number): "l" | "r" => { const i = (n - 1) % ZIGZAG.length, x = ZIGZAG[i]; return x < 0 || (x === 0 && i === 0) ? "r" : "l"; };

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
    const isStart = level !== null && ch.from === start, size = ch.to - ch.from + 1;
    let got = 0;
    for (let n = ch.from; n <= ch.to; n++) if (isDone(key, n)) got++;
    let html = `<li class="path-chap${isStart ? " start" : ""}${got === size ? " complete" : ""}">Глава: ${escA(ch.name)}${isStart ? `<span class="flag">Ваш старт</span>` : ""}<span class="chap-cnt" aria-label="Пройдено ${got} з ${size}">${got === size ? "✓ " : ""}${got}/${size}</span></li>`;
    for (let n = ch.from; n <= ch.to; n++) {
      const l = c.L[n - 1], d = isDone(key, n), isCur = n === cur;
      const state = d ? "done" : isCur ? "current" : n < start ? "before" : "todo";
      const label = `Урок ${n}: ${l.t}. ${d ? "Пройдено" : isCur ? "Поточний урок" : "Доступний"}`;
      const task = taskForLesson(`${key}/${n}`), proj = projectForLesson(`${key}/${n}`);
      html += `<li class="path-node ${state} side-${sideOf(n)}" style="--x:${ZIGZAG[(n - 1) % ZIGZAG.length]}px">
        <a class="pn-dot" href="#/lesson/${key}/${n}" aria-label="${escA(label)}"${isCur ? ' aria-current="step"' : ""}>${d ? "✓" : pad(n)}</a>
        <div class="pn-side">${isCur ? `<span class="path-here">${p ? "Продовжити" : "Почати"}</span>` : ""}<span class="pn-title">${escA(l.t)}</span>
        ${task ? `<a class="path-prac${isTaskPassed(task.id) ? " done" : ""}" href="#/lesson/${key}/${n}">⚡ ${isTaskPassed(task.id) ? "Завдання розв'язано" : "Практика: " + escA(task.title)}</a>` : ""}${proj ? `<a class="path-prac${isTaskPassed(proj.id) ? " done" : ""}" href="#/project/${escA(proj.id)}">📋 ${isTaskPassed(proj.id) ? "Проєкт виконано" : "Проєкт: " + escA(proj.title.replace(/^Проєкт:\s*/, ""))}</a>` : ""}</div>
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

// ---- лінія шляху: плавна крива через центри кружків (кружки зсунуті зигзагом, тому пряма лінія їх не з'єднувала) ----
const SVG_NS = "http://www.w3.org/2000/svg";
let watcher: ResizeObserver | undefined;

/** Малює лінію між вузлами: пройдена ділянка суцільна, решта крапками. Викликається після рендеру й при зміні розмірів */
export function drawPathLine(): void {
  const ol = document.querySelector<HTMLElement>("ol.path");
  if (!ol) return;
  ol.querySelector(".path-line")?.remove();
  const box = ol.getBoundingClientRect();
  const pts = Array.from(ol.querySelectorAll<HTMLElement>(".path-node"), (n) => {
    const r = (n.querySelector(".pn-dot") as HTMLElement).getBoundingClientRect();
    return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top, done: n.classList.contains("done"), cur: n.classList.contains("current") };
  });
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "path-line");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("viewBox", `0 0 ${Math.max(1, Math.round(box.width))} ${Math.max(1, Math.round(box.height))}`);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], m = ((a.y + b.y) / 2).toFixed(1);
    const e = document.createElementNS(SVG_NS, "path");
    e.setAttribute("d", `M${a.x.toFixed(1)} ${a.y.toFixed(1)}C${a.x.toFixed(1)} ${m} ${b.x.toFixed(1)} ${m} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
    e.setAttribute("class", "e" + (a.done && (b.done || b.cur) ? " done" : ""));
    svg.appendChild(e);
  }
  ol.prepend(svg);
}

/** Підключає лінію до поточної сторінки шляху й перемальовує її, коли змінюється розмір (поворот екрана, шрифти) */
export function mountPath(): void {
  watcher?.disconnect();
  watcher = undefined;
  const ol = document.querySelector<HTMLElement>("ol.path");
  if (!ol) return;
  drawPathLine();
  if (typeof ResizeObserver !== "undefined") { watcher = new ResizeObserver(() => drawPathLine()); watcher.observe(ol); }
  void document.fonts?.ready.then(() => { if (ol.isConnected) drawPathLine(); });
}
