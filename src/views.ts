// Сторінки, доступні лише після входу: список уроків курсу, урок із завданням. Публічні сторінки: src/pages.ts.
import { C, CATS, darkText, projectOf } from "./data.ts";
import { badge } from "./pages.ts";
import { done, isDone, progress } from "./progress.ts";
import type { LessonPayload } from "./types.ts";
import { count, esc, escA, pad, store, W } from "./util.ts";
import { workspaceHTML } from "./workspace.ts";

/** Картка для сторінок, що доступні лише після входу (уроки, шлях, кабінет) */
export function gate(): string {
  return `<div class="card dash-guest"><h1>Уроки та завдання в кабінеті</h1>
    <p>Увійдіть, щоб відкрити уроки й практику, зберігати прогрес на всіх пристроях і отримувати XP. Довідник по мовах доступний без входу.</p>
    <button class="btn primary" data-act="login">Увійти</button> <a class="btn" href="/courses">До курсів</a></div>`;
}

export const loadingCard = (): string => `<div class="card dash-guest" aria-busy="true" aria-label="Завантаження"><i class="sk h"></i><i class="sk"></i><i class="sk"></i><i class="sk s"></i></div>`;

export function loadError(retry: string): string {
  return `<div class="card dash-guest"><h1>Не вдалося завантажити уроки</h1>
    <p>Перевірте з'єднання та спробуйте ще раз.</p><button class="btn primary" data-act="${retry}">Спробувати ще раз</button></div>`;
}

export function course(k: string): string {
  const c = C[k], p = progress(k), pct = Math.round(p / c.L.length * 100), next = Math.min((done[k] || []).length ? Math.max(...done[k]) + 1 : 1, c.L.length);
  return `
  <nav class="crumbs" aria-label="Де ви"><a href="/">Головна</a> / <a href="/courses">Курси</a> / <a href="/${c.cat}">${CATS[c.cat].title}</a> / ${c.name}</nav>
  <div class="course-head">${badge(k)}<div><h1>${c.name}</h1><p>${c.desc}</p></div></div>
  <div class="meter">
    <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${c.L.length}" aria-valuenow="${p}" aria-label="Прогрес курсу"><i style="width:${pct}%"></i></div>
    <span><b>${p}</b> з ${c.L.length} пройдено</span>
    <a class="btn primary small" href="/lesson/${k}/${next}">${p ? "Продовжити" : "Почати курс"}</a>
  </div>
  <p><a href="/ref/${k}">Довідник ${esc(c.name)}</a></p>
  ${c.req ? `<div class="callout"><b>Спершу JavaScript.</b> Цей курс спирається на ${C[c.req].name}. <a href="/course/${c.req}">Перейти до курсу ${C[c.req].name}</a></div>` : ""}
  <ol class="lessons">
    ${c.L.map((l, i) => { const n = i + 1, d = isDone(k, n); return `${i === 0 || l.ch !== c.L[i - 1].ch ? `<li class="chap">Глава: ${l.ch}</li>` : ""}
    <li class="${d ? "done" : ""}">
      <span class="n">${pad(n)}</span>
      <a class="t" href="/lesson/${k}/${n}">${l.t}</a>
      <span class="row-actions"><button class="icon-btn" data-toggle="${k}:${n}" aria-pressed="${d}" aria-label="Позначити урок ${n} пройденим">${d ? "Пройдено" : "Готово"}</button></span>
    </li>`; }).join("")}
  </ol>
  ${c.next ? `<div class="callout"><b>Далі: ${C[c.next].name}.</b> Коли освоїте JavaScript, додайте до нього типи. <a href="/course/${c.next}">Перейти до курсу ${C[c.next].name}</a></div>` : ""}`;
}


/** Картка «Проєкт за ТЗ» в кінці уроку, після якого пропонується проєкт */
function projectCard(k: string, n: number): string {
  const p = projectOf(k, n);
  return p ? `<div class="callout pj-card"><b>Проєкт за ТЗ.</b> Закріпіть тему на практиці: <a href="/project/${escA(p.id)}">${escA(p.title)}</a> (до ${p.xp} XP). Ви отримаєте технічне завдання й перевірку кожної вимоги.</div>` : "";
}

export function lesson(k: string, n: number, data: LessonPayload): string {
  const c = C[k], i = n - 1, l = data.lesson, d = isDone(k, n);
  store.set("ic-last", { k, n });
  const crumbs = `<nav class="crumbs" aria-label="Де ви"><a href="/">Головна</a> / <a href="/courses">Курси</a> / <a href="/${c.cat}">${CATS[c.cat].title}</a> / <a href="/course/${k}">${c.name}</a> / Урок ${n}</nav>`;
  const meta = `<div class="meta"><span class="tag" style="background:${c.color};${darkText(k)}">${c.name}</span><span>Урок ${n} з ${c.L.length}</span><span>Глава: ${l.ch}</span></div>`;
  const actions = `<div class="lesson-actions"><button class="btn small" data-toggle="${k}:${n}" aria-pressed="${d}">${d ? "Пройдено" : "Позначити пройденим"}</button><a class="btn small" href="/contact?topic=bug&amp;from=${encodeURIComponent(`/lesson/${k}/${n}`)}">Повідомити про помилку</a></div>`;
  const prose = `${l.easy ? `<div class="callout"><b>Простими словами.</b> ${l.easy}</div>` : ""}
        ${l.p.map((x) => `<p>${x}</p>`).join("")}
        <h2>Приклад коду</h2>
        ${l.code.map((x) => `<pre class="code">${esc(x)}</pre>`).join("")}
        <div class="callout"><b>Запам'ятайте.</b> ${l.note}</div>
        ${l.work ? `<h2>Як це в роботі</h2><p>${l.work}</p>` : ""}
        <h2>Завдання для самоперевірки</h2>
        <ul class="tasks">${l.tasks.map((t, j) => `<li><input type="checkbox" id="t${j}"><label for="t${j}">${t}</label></li>`).join("")}</ul>${projectCard(k, n)}`;
  const pager = `<div class="pager">
        ${n > 1 ? `<a class="btn small" href="/lesson/${k}/${n - 1}">Попередній урок</a>` : "<span></span>"}
        ${n < c.L.length ? `<a class="btn primary small" href="/lesson/${k}/${n + 1}">Наступний урок</a>` : `<a class="btn primary small" href="/course/${k}">До списку уроків</a>`}
      </div>`;

  if (data.task) return workspaceHTML({ crumbs, meta, title: l.t, actions, prose, pager, task: data.task });

  return `
  ${crumbs}
  <div class="lesson-layout">
    <aside class="side" aria-label="Уроки курсу">
      <h4>${c.name}</h4>
      <ol>${c.L.map((x, j) => `${j === 0 || x.ch !== c.L[j - 1].ch ? `<li class="sch">${x.ch}</li>` : ""}<li><a href="/lesson/${k}/${j + 1}" ${j === i ? 'aria-current="page"' : ""}><span>${pad(j + 1)}</span>${x.t}</a></li>`).join("")}</ol>
    </aside>
    <article class="lesson">
      ${meta}
      <h1>${l.t}</h1>
      ${actions}
      <div class="prose">
        ${prose}
      </div>
      ${pager}
    </article>
  </div>`;
}

export function notFound(): string {
  return `<div class="empty"><h1>Такої сторінки немає</h1><p>Можливо, посилання застаріло. Поверніться на головну й оберіть курс.</p><a class="btn primary" href="/">На головну</a></div>`;
}
