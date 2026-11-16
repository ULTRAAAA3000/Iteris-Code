// Сторінка проєкту за ТЗ (#/project/<id>): умови й вимоги ліворуч, редактор, звіт і попередній перегляд праворуч.
import { completeTask, getUser, invalidate } from "./auth.ts";
import { C } from "./data.ts";
import { createEditor } from "./editor.ts";
import type { CodeEditor } from "./editor.ts";
import { isTaskPassed, markTaskPassed } from "./progress.ts";
import { runProjectCheck } from "./projects/client.ts";
import { scoreReport } from "./projects/sandbox.ts";
import type { Score } from "./projects/sandbox.ts";
import type { Project } from "./projects/types.ts";
import { toast, ui } from "./ui.ts";
import { esc, escA, pl, store } from "./util.ts";

export function projectHTML(p: Project): string {
  const c = C[p.course], [lk, ln] = p.lesson.split("/");
  const badge = p.premium ? `<span class="plan pro">Pro</span>` : `<span class="plan free">Безкоштовно</span>`;
  return `<div class="crumbs"><a href="#/">Головна</a> / <a href="#/course/${escA(p.course)}">${escA(c.name)}</a> / Проєкт</div>
  <div class="ws pj">
    <article class="ws-left lesson">
      <div class="meta"><span class="tag" style="background:${c.color}">Проєкт за ТЗ</span><span>Курс «${escA(c.name)}»</span></div>
      <h1>${escA(p.title)} ${badge}</h1>
      <div class="prose">
        <div class="callout"><b>Навіщо це в роботі.</b> ${p.context}</div>
        ${p.brief.map((x) => `<p>${x}</p>`).join("")}
        <h2>Макет</h2>
        <pre class="code" aria-label="Макет сторінки">${esc(p.mockup)}</pre>
        <h2>Договір по елементах</h2>
        <ul>${p.contract.map((x) => `<li>${x}</li>`).join("")}</ul>
        <h2>Вимоги</h2>
        <ol class="pj-reqs" id="pj-reqs">${p.requirements.map((r) => `<li data-req="${escA(r.id)}"><span class="pj-st" aria-hidden="true">○</span><div><b>${escA(r.id)}.</b> ${r.text}</div></li>`).join("")}</ol>
        <p class="dash-muted">Нагорода: ${p.xp} XP${isTaskPassed(p.id) ? " · вже виконано ✓" : ""}. Теорія для проєкту: <a href="#/lesson/${escA(lk)}/${escA(ln)}">урок ${escA(ln)}</a>.</p>
      </div>
    </article>
    <section class="ws-right" aria-label="Редактор проєкту">
      <div class="ws-bar">
        <span class="ws-tab">index.html</span>
        <span class="ws-spacer"></span>
        <button class="btn small" data-pj="reset">Скинути</button>
        <button class="btn primary small" data-pj="run" id="pj-run">▶ Перевірити проєкт</button>
      </div>
      <div id="pj-lock"></div>
      <div id="editor" class="ws-editor"></div>
      <div id="pj-report" class="pj-report" aria-live="polite">Натисніть «Перевірити проєкт» (Ctrl+Enter): ми запустимо вашу сторінку й перевіримо кожну вимогу.</div>
      <h2 class="pj-prev-h">Ваша сторінка</h2>
      <iframe id="pj-frame" class="pj-frame" title="Попередній перегляд вашої сторінки" sandbox="allow-scripts"></iframe>
    </section>
  </div>`;
}

let active: { dispose: () => void } | null = null;

export function disposeProject(): void {
  active?.dispose();
  active = null;
}

function showScore(s: Score): void {
  for (const i of s.items) {
    const li = document.querySelector<HTMLElement>(`#pj-reqs [data-req="${CSS.escape(i.req.id)}"]`);
    if (!li) continue;
    li.className = i.ok ? "ok" : "bad";
    (li.querySelector(".pj-st") as HTMLElement).textContent = i.ok ? "✓" : "✗";
  }
  const rep = document.getElementById("pj-report");
  if (!rep) return;
  const pct = s.total ? Math.round((s.passed / s.total) * 100) : 0;
  rep.innerHTML = `<div class="pj-score ${s.all ? "ok" : ""}"><b>Виконано ${s.passed} з ${s.total}</b>
    <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${s.total}" aria-valuenow="${s.passed}" aria-label="Виконано вимог"><i style="width:${pct}%"></i></div></div><ul class="pj-reqs pj-res" aria-label="Результат по вимогах">${s.items.map((i) => `<li class="${i.ok ? "ok" : "bad"}"><span class="pj-st" aria-hidden="true">${i.ok ? "✓" : "✗"}</span><div><b>${escA(i.req.id)}.</b> ${i.req.text}${i.ok ? "" : `<div class="pj-hint">${esc(i.req.hint + (i.msg ? " Що знайшла перевірка: " + i.msg : ""))}</div>`}</div></li>`).join("")}</ul><div id="pj-win"></div>`;
}

export async function mountProject(p: Project): Promise<void> {
  disposeProject();
  const host = document.getElementById("editor");
  const runBtn = document.getElementById("pj-run") as HTMLButtonElement | null;
  const lock = document.getElementById("pj-lock");
  const frame = document.getElementById("pj-frame") as HTMLIFrameElement | null;
  const area = document.querySelector(".pj");
  if (!host || !runBtn || !lock || !frame || !area) return;

  const draftKey = "ic-code:" + p.id;
  const me = { dispose: () => {} };
  active = me;

  const locked = (): boolean => p.premium && !getUser()?.isPro;
  const refresh = (): void => {
    const user = getUser();
    lock.innerHTML = locked()
      ? `<div class="paywall" role="alert"><b>Проєкти за ТЗ входять до підписки Pro</b><p>${user ? "Оформіть підписку, щоб перевіряти проєкти." : "Увійдіть та оформіть підписку Pro."}</p>
          <button class="btn primary small" data-act="${user ? "upgrade" : "login"}">${user ? "Перейти на Pro за $5" : "Увійти"}</button></div>`
      : "";
    runBtn.disabled = locked();
  };
  refresh();
  ui.authListeners.add(refresh);

  const draft = store.get<string>(draftKey, p.starter);
  const editor: CodeEditor = await createEditor(host, { value: draft, language: "html" });
  if (active !== me || !host.isConnected) { editor.dispose(); return; }  // користувач уже перейшов на іншу сторінку
  me.dispose = () => { ui.authListeners.delete(refresh); editor.dispose(); };
  frame.srcdoc = draft;   // одразу показуємо поточну сторінку (без перевірки)

  let timer: number | undefined;
  editor.onChange(() => {
    clearTimeout(timer);
    timer = window.setTimeout(() => store.set(draftKey, editor.getValue()), 400);
  });

  const onSolved = async (code: string): Promise<void> => {
    markTaskPassed(p.id);
    const user = getUser();
    let msg = "Увійдіть, щоб зберегти прогрес і серію занять.";
    if (user) {
      const r = await completeTask(p.id, code);
      if (r.status === 402) { toast("Цей проєкт входить до підписки Pro"); return; }
      if (r.ok) msg = r.firstSolve ? `+${r.xp ?? 0} XP · 🔥 ${r.streak} ${pl(r.streak ?? 0, "день", "дні", "днів")} поспіль` : "Ви вже виконували цей проєкт, XP не нараховується повторно.";
      else msg = "Проєкт виконано, але зберегти результат не вдалося. Спробуйте ще раз.";
    }
    invalidate();
    const win = document.getElementById("pj-win");
    if (win) win.innerHTML = `<div class="ws-win" role="status"><span class="ws-win-icon" aria-hidden="true">🎉</span><div><b>Проєкт виконано!</b><div>${esc(msg)}</div></div></div>`;
  };

  let running = false;
  const run = async (): Promise<void> => {
    if (running || locked()) return;
    running = true;
    runBtn.disabled = true; runBtn.textContent = "Перевіряємо…";
    const code = editor.getValue();
    const report = await runProjectCheck(frame, p, code);
    running = false;
    runBtn.textContent = "▶ Перевірити проєкт";
    refresh();
    if (!runBtn.isConnected) return;
    const s = scoreReport(p, report);
    showScore(s);
    if (report.error) {
      const rep = document.getElementById("pj-report");
      rep?.insertAdjacentHTML("afterbegin", `<p class="t-fail" role="alert">${esc(report.error)}</p>`);
    }
    if (s.all) await onSolved(code);
  };

  area.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-pj]");
    if (!b) return;
    if (b.dataset.pj === "run") void run();
    else if (b.dataset.pj === "reset") {
      editor.setValue(p.starter);
      store.set(draftKey, p.starter);
      frame.srcdoc = p.starter;
      document.querySelectorAll<HTMLElement>("#pj-reqs li").forEach((li) => { li.className = ""; (li.querySelector(".pj-st") as HTMLElement).textContent = "○"; });
      const rep = document.getElementById("pj-report");
      if (rep) rep.textContent = "Код скинуто до початкового.";
    }
  });
  host.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void run(); }
  });
}
