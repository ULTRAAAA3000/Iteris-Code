const pad = n => String(n).padStart(2, "0");
const pl = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? b : c; };
const W = { lesson: ["урок","уроки","уроків"], task: ["завдання","завдання","завдань"], course: ["курс","курси","курсів"] };
const count = (n, w) => n + " " + pl(n, ...w);
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const CATS = {
  program: { title: "Програмування", desc: "Логічне мислення, алгоритми та мови, з яких починають і на яких працюють.", courses: ["python","go","java","cpp","pascal"] },
  web: { title: "Web-технології", desc: "Розмітка, стилі та скрипти: усе, щоб створити живий сайт з нуля.", courses: ["html","css","js","ts"] },
  server: { title: "Серверна розробка", desc: "Код, що працює на сервері: обробка запитів, форм і даних.", courses: ["php"] },
  data: { title: "Бази даних", desc: "Зберігання даних і запити до них мовою SQL.", courses: ["sql"] },
  tools: { title: "Інструменти розробника", desc: "Те, без чого не обходиться жодна команда: контроль версій і командний рядок.", courses: ["git","bash"] }
};
const C = {
  python: { name: "Python", badge: "Py", color: "#C99700", cat: "program", desc: "Проста мова для старту: змінні, розгалуження та цикли." },
  cpp: { name: "C++", badge: "C+", color: "#00599C", cat: "program", desc: "Швидка компільована мова: типи, ввід-вивід, умови та цикли." },
  pascal: { name: "Pascal", badge: "Pa", color: "#7A4DD8", cat: "program", desc: "Навчальна мова з чіткою структурою: ідеальна для перших алгоритмів." },
  html: { name: "HTML", badge: "<>", color: "#E8531F", cat: "web", desc: "Розмітка сторінок: структура, текст, списки, таблиці та форми." },
  css: { name: "CSS", badge: "{}", color: "#1C8FE0", cat: "web", desc: "Оформлення сторінок: селектори, блочна модель і flexbox." },
  js: { name: "JavaScript", badge: "JS", color: "#E0B400", cat: "web", desc: "Мова браузера: функції, масиви, DOM і запити до сервера.", next: "ts" },
  go: { name: "Go", badge: "Go", color: "#00ADD8", cat: "program", desc: "Проста й швидка мова від Google: типи, функції та горутини для паралельності." },
  java: { name: "Java", badge: "Jv", color: "#E76F00", cat: "program", desc: "Мова великих застосунків і Android: класи, змінні, умови та цикли." },
  ts: { name: "TypeScript", badge: "TS", color: "#3178C6", cat: "web", req: "js", desc: "JavaScript із типами: менше помилок, зрозуміліший код. Продовження курсу JavaScript." },
  php: { name: "PHP", badge: "Ph", color: "#777BB4", cat: "server", desc: "Серверна мова вебу: змінні, масиви, функції та безпечна обробка форм." },
  git: { name: "Git", badge: "Gt", color: "#F05032", cat: "tools", desc: "Контроль версій: коміти, гілки, GitHub і робота в команді." },
  bash: { name: "Командний рядок", badge: "Sh", color: "#3E4A59", cat: "tools", desc: "Термінал і Bash: файли, пошук, конвеєри та перші скрипти." },
  sql: { name: "SQL", badge: "DB", color: "#1E8E4E", cat: "data", desc: "Мова запитів: вибірка, фільтрація, групування та об'єднання таблиць." }
};
Object.keys(C).forEach(k => { C[k].L = LESSONS[k]; C[k].tasks = LESSONS[k].reduce((s, l) => s + l.tasks.length, 0); });
const darkText = k => (k === "python" || k === "js") ? "color:#14213D" : "";
const totals = Object.values(C).reduce((a, c) => ({ courses: a.courses + 1, lessons: a.lessons + c.L.length, tasks: a.tasks + c.tasks }), { courses: 0, lessons: 0, tasks: 0 });

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
let done = store.get("ic-done", {});
const isDone = (k, n) => (done[k] || []).includes(n);
function toggle(k, n) { const s = new Set(done[k] || []); s.has(n) ? s.delete(n) : s.add(n); done[k] = [...s].sort((a, b) => a - b); store.set("ic-done", done); Auth.syncLesson(k, n, isDone(k, n)); }
const progress = k => (done[k] || []).length;

const app = document.getElementById("app");
const badge = (k, cls = "") => `<span class="badge ${cls}" style="background:${C[k].color};${darkText(k)}" aria-hidden="true">${esc(C[k].badge)}</span>`;
const chip = k => `<a class="chip" href="#/course/${k}">${badge(k, "sm")}<span><b>${C[k].name}</b><small>${count(C[k].L.length, W.lesson)}, ${count(C[k].tasks, W.task)}</small></span></a>`;

function home() {
  const last = store.get("ic-last", null);
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

function dir(key) {
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

function course(k) {
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

function lesson(k, n) {
  const c = C[k], i = n - 1, l = c.L[i], d = isDone(k, n);
  store.set("ic-last", { k, n });
  return `
  <div class="crumbs"><a href="#/">Головна</a> / <a href="#/${c.cat}">${CATS[c.cat].title}</a> / <a href="#/course/${k}">${c.name}</a> / Урок ${n}</div>
  <div class="lesson-layout">
    <aside class="side" aria-label="Уроки курсу">
      <h4>${c.name}</h4>
      <ol>${c.L.map((x, j) => `${j === 0 || x.ch !== c.L[j - 1].ch ? `<li class="sch">${x.ch}</li>` : ""}<li><a href="#/lesson/${k}/${j + 1}" ${j === i ? 'aria-current="page"' : ""}><span>${pad(j + 1)}</span>${x.t}</a></li>`).join("")}</ol>
    </aside>
    <article class="lesson">
      <div class="meta"><span class="tag" style="background:${c.color};${darkText(k)}">${c.name}</span><span>Урок ${n} з ${c.L.length}</span><span>Глава: ${l.ch}</span></div>
      <h1>${l.t}</h1>
      <div class="lesson-actions"><button class="btn small" data-toggle="${k}:${n}" aria-pressed="${d}">${d ? "Пройдено" : "Позначити пройденим"}</button></div>
      <div class="prose">
        ${l.easy ? `<div class="callout"><b>Простими словами.</b> ${l.easy}</div>` : ""}
        ${l.p.map(x => `<p>${x}</p>`).join("")}
        <h2>Приклад коду</h2>
        ${l.code.map(x => `<pre class="code">${esc(x)}</pre>`).join("")}
        <div class="callout"><b>Запам'ятайте.</b> ${l.note}</div>
        ${l.work ? `<h2>Як це в роботі</h2><p>${l.work}</p>` : ""}
        <h2>Завдання для самоперевірки</h2>
        <ul class="tasks">${l.tasks.map((t, j) => `<li><input type="checkbox" id="t${j}"><label for="t${j}">${t}</label></li>`).join("")}</ul>
      </div>
      <div class="pager">
        ${n > 1 ? `<a class="btn small" href="#/lesson/${k}/${n - 1}">Попередній урок</a>` : "<span></span>"}
        ${n < c.L.length ? `<a class="btn primary small" href="#/lesson/${k}/${n + 1}">Наступний урок</a>` : `<a class="btn primary small" href="#/course/${k}">До списку уроків</a>`}
      </div>
    </article>
  </div>`;
}

function notFound() {
  return `<div class="empty"><h1>Такої сторінки немає</h1><p>Можливо, посилання застаріло. Поверніться на головну й оберіть курс.</p><a class="btn primary" href="#/">На головну</a></div>`;
}

const BRAND = "Iteris Code";
function render() {
  const [a, b, c] = location.hash.replace(/^#\/?/, "").split("/");
  let html, active = "", title = BRAND + " — вчимося кодити разом";
  if (!a) html = home();
  else if (CATS[a]) { html = dir(a); active = a; title = CATS[a].title + " — " + BRAND; }
  else if (a === "course" && C[b]) { html = course(b); active = C[b].cat; title = C[b].name + " — " + BRAND; }
  else if (a === "lesson" && C[b] && C[b].L[(+c) - 1]) { html = lesson(b, +c); active = C[b].cat; title = C[b].L[c - 1].t + " — " + BRAND; }
  else if (a === "dashboard") { html = renderDashboard(); title = "Особистий кабінет — " + BRAND; }
  else html = notFound();
  app.innerHTML = html;
  document.title = title;
  document.querySelectorAll("#nav a").forEach(l => l.dataset.k === active ? l.setAttribute("aria-current", "page") : l.removeAttribute("aria-current"));
  window.scrollTo(0, 0);
  if (!a) initHome();
}
window.addEventListener("hashchange", render);

document.addEventListener("click", e => {
  const t = e.target.closest("[data-toggle]");
  if (t) { const [k, n] = t.dataset.toggle.split(":"); toggle(k, +n); const y = window.scrollY; render(); window.scrollTo(0, y); return; }
  const s = e.target.closest("[data-scroll]");
  if (s) document.getElementById(s.dataset.scroll).scrollIntoView({ behavior: "smooth" });
});

function initHome() {
  const tabs = document.querySelectorAll("[data-tab]");
  tabs.forEach(b => b.addEventListener("click", () => {
    tabs.forEach(x => x.setAttribute("aria-selected", x === b));
    document.querySelectorAll("[data-pane]").forEach(p => p.hidden = p.dataset.pane !== b.dataset.tab);
  }));
  const run = () => { const v = document.getElementById("pyname").value.trim() || "друже"; const o = document.getElementById("pyout"); o.textContent = "Як тебе звати? " + v + "\nПривіт, " + v + "!"; o.style.whiteSpace = "pre-line"; };
  document.getElementById("pyrun").addEventListener("click", run); run();
  const hin = document.getElementById("htmlin"), hc = document.getElementById("htmlcode"), ho = document.getElementById("htmlout");
  const upd = () => { const v = hin.value; hc.textContent = "<h1>" + v + "</h1>"; ho.innerHTML = ""; const h = document.createElement("h1"); h.textContent = v; ho.appendChild(h); };
  hin.addEventListener("input", upd); upd();
}

const root = document.documentElement;
const saved = store.get("ic-theme", null);
if (saved) root.setAttribute("data-theme", saved);
document.getElementById("theme").addEventListener("click", () => {
  const dark = root.getAttribute("data-theme") ? root.getAttribute("data-theme") === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const next = dark ? "light" : "dark";
  root.setAttribute("data-theme", next); store.set("ic-theme", next);
});
render();
Auth.init();
