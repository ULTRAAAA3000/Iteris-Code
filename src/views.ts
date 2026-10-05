import { C, CATS, darkText, totals } from "./data.ts";
import { done, isDone, progress } from "./progress.ts";
import { taskForLesson } from "./tasks/index.ts";
import type { Lesson } from "./types.ts";
import { count, esc, pad, pl, store, W } from "./util.ts";
import { workspaceHTML } from "./workspace.ts";

const badge = (k: string, cls = ""): string => `<span class="badge ${cls}" style="background:${C[k].color};${darkText(k)}" aria-hidden="true">${esc(C[k].badge)}</span>`;
const chip = (k: string): string => `<a class="chip" href="#/course/${k}">${badge(k, "sm")}<span><b>${C[k].name}</b><small>${count(C[k].L.length, W.lesson)}, ${count(C[k].tasks, W.task)}</small></span></a>`;

export function home(): string {
  const last = store.get<{ k: string; n: number } | null>("ic-last", null);
  let cont;
  if (last && C[last.k] && C[last.k].L[last.n - 1]) {
    const c = C[last.k];
    cont = `<h3>Продовжити навчання</h3><p>${c.name}, урок ${last.n}: ${c.L[last.n - 1].t}</p><a class="btn primary small" href="#/lesson/${last.k}/${last.n}">Відкрити урок</a>`;
  } else {
    cont = `<h3>З чого почати</h3><p>Не знаєте, яку мову обрати? Python — найкращий старт, а HTML і CSS дозволяють швидко побачити результат у браузері.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary small" href="#/lesson/python/1">Урок 1 з Python</a><a class="btn small" href="#/lesson/html/1">Урок 1 з HTML</a></div>`;
  }
  return `
  <section class="hero" aria-labelledby="h1">
    <div>
      <h1 id="h1">Вчимося кодити разом</h1>
      <p class="lead">Короткі уроки з мов програмування: пояснення, приклади коду й завдання для самоперевірки. Українською, безкоштовно.</p>
      <div class="actions"><button class="btn primary" data-scroll="dirs">Обрати мову</button><a class="btn" href="#/lesson/python/1">Перший урок</a></div>
    </div>
    <div class="sheet" aria-label="Спробуйте прямо тут">
      <div class="tabs" role="tablist">
        <button role="tab" aria-selected="true" data-tab="p">Python</button>
        <button role="tab" aria-selected="false" data-tab="h">HTML</button>
      </div>
      <div class="pane" data-pane="p">
        <p class="hint">Введіть ім'я й запустіть програму.</p>
        <pre class="code">name = input("Як тебе звати? ")
print("Привіт,", name + "!")</pre>
        <div class="field"><input type="text" id="pyname" value="Олена" aria-label="Ваше ім'я" maxlength="30"><button class="btn small" id="pyrun">Запустити</button></div>
        <div class="out" id="pyout" aria-live="polite"></div>
      </div>
      <div class="pane" data-pane="h" hidden>
        <p class="hint">Змініть текст заголовка: сторінка оновиться одразу.</p>
        <pre class="code" id="htmlcode"></pre>
        <div class="field"><input type="text" id="htmlin" value="Мій перший сайт" aria-label="Текст заголовка" maxlength="40"></div>
        <div class="out render" id="htmlout"></div>
      </div>
    </div>
  </section>
  <h2 class="section-title" id="dirs">${count(Object.keys(CATS).length, ["напрям","напрями","напрямів"])}, ${count(totals.courses, W.course)}</h2>
  <p class="section-sub">Кожен курс складається з уроків із прикладами коду та завдань для самоперевірки.</p>
  <div class="ruled">
    ${Object.entries(CATS).map(([key, c]) => `
    <div class="dir">
      <div><h3><a href="#/${key}">${c.title}</a></h3><p>${c.desc}</p></div>
      <div class="chips">${c.courses.map(chip).join("")}</div>
    </div>`).join("")}
  </div>
  <div class="duo">
    <div class="card">${cont}</div>
    <div class="card">
      <h3>Зараз на платформі</h3>
      <div class="stats">
        <div><strong>${totals.courses}</strong><span>${pl(totals.courses, ...W.course)}</span></div>
        <div><strong>${totals.lessons}</strong><span>${pl(totals.lessons, ...W.lesson)}</span></div>
        <div><strong>${totals.tasks}</strong><span>${pl(totals.tasks, ...W.task)}</span></div>
      </div>
    </div>
  </div>`;
}

export function dir(key: string): string {
  const c = CATS[key];
  return `
  <div class="crumbs"><a href="#/">Головна</a> / ${c.title}</div>
  <h1 style="font-size:clamp(2rem,4.5vw,3rem);margin-bottom:12px">${c.title}</h1>
  <p class="section-sub" style="margin-bottom:32px">${c.desc}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px">
    ${c.courses.map(k => {
      const x = C[k], p = progress(k), pct = Math.round(p / x.L.length * 100);
      return `<a class="card" href="#/course/${k}" style="text-decoration:none;display:grid;gap:14px;border-top:10px solid ${x.color}">
        <div style="display:flex;gap:14px;align-items:center">${badge(k)}<h2 style="font-size:1.6rem">${x.name}</h2></div>
        <p style="margin:0">${x.desc}</p>
        <div><div class="bar" style="height:12px"><i style="width:${pct}%"></i></div>
        <small style="color:var(--muted)">${count(x.L.length, W.lesson)}, ${count(x.tasks, W.task)}${p ? `. Пройдено: ${p}` : ""}</small></div>
      </a>`;
    }).join("")}
  </div>`;
}

export function course(k: string): string {
  const c = C[k], p = progress(k), pct = Math.round(p / c.L.length * 100), next = Math.min((done[k] || []).length ? Math.max(...done[k]) + 1 : 1, c.L.length);
  return `
  <div class="crumbs"><a href="#/">Головна</a> / <a href="#/${c.cat}">${CATS[c.cat].title}</a> / ${c.name}</div>
  <div class="course-head">${badge(k)}<div><h1>${c.name}</h1><p>${c.desc}</p></div></div>
  <div class="meter">
    <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${c.L.length}" aria-valuenow="${p}" aria-label="Прогрес курсу"><i style="width:${pct}%"></i></div>
    <span><b>${p}</b> з ${c.L.length} пройдено</span>
    <a class="btn primary small" href="#/lesson/${k}/${next}">${p ? "Продовжити" : "Почати курс"}</a>
  </div>
  ${c.req ? `<div class="callout"><b>Спершу JavaScript.</b> Цей курс спирається на ${C[c.req].name}. <a href="#/course/${c.req}">Перейти до курсу ${C[c.req].name}</a></div>` : ""}
  <ol class="lessons">
    ${c.L.map((l, i) => { const n = i + 1, d = isDone(k, n); return `${i === 0 || l.ch !== c.L[i - 1].ch ? `<li class="chap">Глава: ${l.ch}</li>` : ""}
    <li class="${d ? "done" : ""}">
      <span class="n">${pad(n)}</span>
      <a class="t" href="#/lesson/${k}/${n}">${l.t}</a>
      <span class="row-actions"><button class="icon-btn" data-toggle="${k}:${n}" aria-pressed="${d}" aria-label="Позначити урок ${n} пройденим">${d ? "Пройдено" : "Готово"}</button></span>
    </li>`; }).join("")}
  </ol>
  ${c.next ? `<div class="callout"><b>Далі: ${C[c.next].name}.</b> Коли освоїте JavaScript, додайте до нього типи. <a href="#/course/${c.next}">Перейти до курсу ${C[c.next].name}</a></div>` : ""}`;
}


export function lesson(k: string, n: number): string {
  const c = C[k], i = n - 1, l: Lesson = c.L[i], d = isDone(k, n);
  store.set("ic-last", { k, n });
  const crumbs = `<div class="crumbs"><a href="#/">Головна</a> / <a href="#/${c.cat}">${CATS[c.cat].title}</a> / <a href="#/course/${k}">${c.name}</a> / Урок ${n}</div>`;
  const meta = `<div class="meta"><span class="tag" style="background:${c.color};${darkText(k)}">${c.name}</span><span>Урок ${n} з ${c.L.length}</span><span>Глава: ${l.ch}</span></div>`;
  const actions = `<div class="lesson-actions"><button class="btn small" data-toggle="${k}:${n}" aria-pressed="${d}">${d ? "Пройдено" : "Позначити пройденим"}</button></div>`;
  const prose = `${l.easy ? `<div class="callout"><b>Простими словами.</b> ${l.easy}</div>` : ""}
        ${l.p.map((x) => `<p>${x}</p>`).join("")}
        <h2>Приклад коду</h2>
        ${l.code.map((x) => `<pre class="code">${esc(x)}</pre>`).join("")}
        <div class="callout"><b>Запам'ятайте.</b> ${l.note}</div>
        ${l.work ? `<h2>Як це в роботі</h2><p>${l.work}</p>` : ""}
        <h2>Завдання для самоперевірки</h2>
        <ul class="tasks">${l.tasks.map((t, j) => `<li><input type="checkbox" id="t${j}"><label for="t${j}">${t}</label></li>`).join("")}</ul>`;
  const pager = `<div class="pager">
        ${n > 1 ? `<a class="btn small" href="#/lesson/${k}/${n - 1}">Попередній урок</a>` : "<span></span>"}
        ${n < c.L.length ? `<a class="btn primary small" href="#/lesson/${k}/${n + 1}">Наступний урок</a>` : `<a class="btn primary small" href="#/course/${k}">До списку уроків</a>`}
      </div>`;

  const task = taskForLesson(`${k}/${n}`);
  if (task) return workspaceHTML({ crumbs, meta, title: l.t, actions, prose, pager, task });

  return `
  ${crumbs}
  <div class="lesson-layout">
    <aside class="side" aria-label="Уроки курсу">
      <h4>${c.name}</h4>
      <ol>${c.L.map((x, j) => `${j === 0 || x.ch !== c.L[j - 1].ch ? `<li class="sch">${x.ch}</li>` : ""}<li><a href="#/lesson/${k}/${j + 1}" ${j === i ? 'aria-current="page"' : ""}><span>${pad(j + 1)}</span>${x.t}</a></li>`).join("")}</ol>
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
  return `<div class="empty"><h1>Такої сторінки немає</h1><p>Можливо, посилання застаріло. Поверніться на головну й оберіть курс.</p><a class="btn primary" href="#/">На головну</a></div>`;
}

