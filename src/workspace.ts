// Екран уроку з практичним завданням: теорія ліворуч, редактор і термінал праворуч.
import { completeTask, getUser, invalidate } from "./auth.ts";
import { createEditor } from "./editor.ts";
import type { CodeEditor } from "./editor.ts";
import { completeLessonOf, isTaskPassed, markTaskPassed } from "./progress.ts";
import { runInWorker } from "./runner/client.ts";
import type { RunOutcome } from "./runner/client.ts";
import { buildPageDoc, evalPageChecks, renderInFrame } from "./runner/page.ts";
import { runRemote } from "./runner/remote.ts";
import { isPage, isRemote } from "./tasks/types.ts";
import type { Task } from "./tasks/types.ts";
import { toast, ui } from "./ui.ts";
import { esc, escA, pl, store } from "./util.ts";

interface View { crumbs: string; meta: string; title: string; actions: string; prose: string; pager: string; task: Task }

const RUN_LABEL = (t: Task): string => (isRemote(t) ? "▶ Запустити" : isPage(t) ? "▶ Перевірити" : "▶ Запустити тести");
const FILE_NAME = (t: Task): string => (isRemote(t) || isPage(t) ? t.file : "solution.js");
const HINT = (t: Task): string =>
  isRemote(t) ? "Натисніть «Запустити» (Ctrl+Enter): код виконається на сервері, тут з'являться вивід програми і результат перевірок."
  : isPage(t) ? "Праворуч угорі живий попередній перегляд сторінки. Натисніть «Перевірити» (Ctrl+Enter), щоб побачити результат перевірок."
  : "Натисніть «Запустити тести» (Ctrl+Enter), щоб перевірити рішення.";

export function workspaceHTML(v: View): string {
  const t = v.task;
  const badge = t.premium ? `<span class="plan pro">Pro</span>` : `<span class="plan free">Безкоштовно</span>`;
  return `${v.crumbs}
  <div class="ws">
    <article class="ws-left lesson">
      ${v.meta}
      <h1>${v.title}</h1>
      ${v.actions}
      <button class="btn small ws-jump" data-scroll="task">До завдання ↓</button>
      <div class="prose">
        ${v.prose}
      </div>
    </article>
    <article class="ws-task lesson" id="task">
      <div class="prose">
        <section class="task-brief">
          <h2>Практичне завдання: ${escA(t.title)} ${badge}</h2>
          <div class="callout"><b>Навіщо це в роботі.</b> ${t.context}</div>
          ${t.brief.map((x) => `<p>${x}</p>`).join("")}
          <p class="dash-muted">Нагорода: ${t.xp} XP${isTaskPassed(t.id) ? " · вже розв'язано ✓" : ""}</p>
        </section>
      </div>
      <section class="ws-right" aria-label="Редактор коду">
        <div class="ws-bar">
          <span class="ws-tab">${esc(FILE_NAME(t))}</span>
          <span class="ws-spacer"></span>
          <button class="btn small" data-ws="reset">Скинути</button>
          <button class="btn primary small" data-ws="run" id="ws-run">${RUN_LABEL(t)}</button>
        </div>
        <div id="ws-paywall"></div>
        <div id="editor" class="ws-editor"></div>
        ${isPage(t) ? `<div class="ws-preview-label">Попередній перегляд</div><iframe id="ws-preview" class="ws-preview" sandbox="allow-same-origin" title="Попередній перегляд сторінки"></iframe>` : ""}
        <div id="ws-win" aria-live="polite"></div>
        <pre id="ws-term" class="ws-term" aria-live="polite" tabindex="0">${HINT(t)}</pre>
      </section>
    </article>
    ${v.pager}
  </div>`;
}

let active: { editor: CodeEditor | null; dispose: () => void } | null = null;

export function disposeWorkspace(): void {
  active?.dispose();
  active = null;
}

function renderOutcome(res: RunOutcome, logs: string[], label = "Консоль:", stderr = ""): string {
  const parts: string[] = [];
  if (logs.length) parts.push(`<span class="t-dim">${label}</span>\n${esc(logs.join("\n"))}\n`);
  if (stderr.trim()) parts.push(`<span class="t-dim">Помилки виконання:</span>\n<span class="t-fail">${esc(stderr.trim().slice(0, 1500))}</span>\n`);
  if (res.error) parts.push(`<span class="t-fail">${esc(res.error)}</span>`);
  // Рядки результатів з'являються по черзі (анімація, вимикається при prefers-reduced-motion)
  res.results.forEach((r, i) => {
    const line = r.passed ? `<span class="t-ok">✓ ${esc(r.name)}</span>` : `<span class="t-fail">✗ ${esc(r.name)}</span>\n    <span class="t-dim">${esc(r.error ?? "")}</span>`;
    parts.push(`<span class="t-line" style="--i:${i}">${line}</span>`);
  });
  if (res.results.length) {
    const ok = res.results.filter((r) => r.passed).length;
    parts.push(`\n<b class="${ok === res.results.length ? "t-ok" : "t-fail"} t-line" style="--i:${res.results.length}">Пройдено ${ok} з ${res.results.length}</b>`);
  }
  return parts.join("\n");
}

export async function mountWorkspace(task: Task): Promise<void> {
  disposeWorkspace();
  const host = document.getElementById("editor");
  const term = document.getElementById("ws-term");
  const runBtn = document.getElementById("ws-run") as HTMLButtonElement | null;
  const paywall = document.getElementById("ws-paywall");
  const win = document.getElementById("ws-win");
  const area = document.querySelector(".ws");
  if (!host || !term || !runBtn || !paywall || !win || !area) return;

  const draftKey = "ic-code:" + task.id;
  const me = { editor: null as CodeEditor | null, dispose: () => {} };
  active = me;

  const locked = (): boolean => task.premium && !getUser()?.isPro;
  const refresh = (): void => {
    const user = getUser();
    paywall.innerHTML = locked()
      ? `<div class="paywall" role="alert"><b>Відкрий практичні задачі та тести за $5/місяць</b>
          <p>${user ? "Це завдання входить до підписки Pro." : "Увійдіть та оформіть підписку Pro, щоб запускати тести до цього завдання."}</p>
          <button class="btn primary small" data-act="${user ? "upgrade" : "login"}">${user ? "Перейти на Pro за $5" : "Увійти"}</button></div>`
      : "";
    runBtn.disabled = locked();
    runBtn.title = locked() ? "Потрібна підписка Pro" : "";
  };
  refresh();
  ui.authListeners.add(refresh);

  const editor = await createEditor(host, { value: store.get<string>(draftKey, task.starter), language: isRemote(task) || isPage(task) ? task.editorLang : "javascript" });
  if (active !== me || !host.isConnected) { editor.dispose(); return; }  // користувач уже перейшов на іншу сторінку
  me.editor = editor;
  me.dispose = () => { ui.authListeners.delete(refresh); editor.dispose(); };

  // Живий попередній перегляд сторінки (лише для завдань HTML/CSS): оновлюється після паузи в наборі
  const frame = isPage(task) ? (document.getElementById("ws-preview") as HTMLIFrameElement | null) : null;
  const preview = (): { doc: Document; win: Window } | null => (frame && isPage(task) ? renderInFrame(frame, buildPageDoc(task, editor.getValue())) : null);
  preview();

  let timer: number | undefined;
  let previewTimer: number | undefined;
  editor.onChange(() => {
    clearTimeout(timer);
    timer = window.setTimeout(() => store.set(draftKey, editor.getValue()), 400);
    if (frame) { clearTimeout(previewTimer); previewTimer = window.setTimeout(preview, 300); }
  });

  let running = false;
  const run = async (): Promise<void> => {
    if (running || locked()) return;
    running = true;
    runBtn.disabled = true; runBtn.textContent = "Виконується…";
    term.classList.remove("ws-term-ok");
    if (isRemote(task)) term.textContent = "Код надіслано на сервер… перший запуск може тривати кілька секунд.";
    win.innerHTML = "";
    const code = editor.getValue();
    const logs: string[] = [];
    let stderr = "";
    let res: RunOutcome;
    let proof: string | undefined;
    let solved: boolean;
    if (isRemote(task)) {
      const r = await runRemote(task.id, code);
      res = r; proof = r.proof; solved = r.passed && !r.error;
      if (r.stdout) logs.push(r.stdout.replace(/\n+$/, ""));
      stderr = r.stderr;
    } else if (isPage(task)) {
      const page = preview();
      res = { results: page ? evalPageChecks(task.checks, page.doc, page.win, code) : [], error: page ? undefined : "Не вдалося відобразити сторінку" };
      solved = !res.error && res.results.length > 0 && res.results.every((r) => r.passed);
    } else {
      res = await runInWorker(code, task.tests, (l) => logs.push(l));
      solved = !res.error && res.results.length > 0 && res.results.every((r) => r.passed);
    }
    running = false;
    runBtn.textContent = RUN_LABEL(task);
    refresh();
    if (!term.isConnected) return;
    term.innerHTML = renderOutcome(res, logs, isRemote(task) ? "Вивід програми:" : "Консоль:", stderr);
    if (solved) { term.classList.add("ws-term-ok"); await onSolved(code, proof); }
  };

  const onSolved = async (code: string, proof?: string): Promise<void> => {
    markTaskPassed(task.id);
    if (completeLessonOf(task.lesson)) {   // урок із розв'язаним завданням стає пройденим одразу, без ручної відмітки
      const [lk, ln] = task.lesson.split("/");
      document.querySelectorAll<HTMLElement>(`[data-toggle="${lk}:${ln}"]`).forEach((b) => { b.setAttribute("aria-pressed", "true"); if (b.classList.contains("btn")) b.textContent = "Пройдено"; });
    }
    const user = getUser();
    let msg = "Увійдіть, щоб зберегти прогрес і серію занять.";
    let xp = 0;
    if (user) {
      const r = await completeTask(task.id, code, proof);
      if (r.status === 402) { toast("Це завдання входить до підписки Pro"); return; }
      if (r.ok) {
        xp = r.xp ?? 0;
        msg = r.firstSolve ? `+${xp} XP · 🔥 ${r.streak} ${pl(r.streak ?? 0, "день", "дні", "днів")} поспіль` : "Ви вже розв'язували це завдання, XP не нараховується повторно.";
      } else msg = "Рішення правильне, але зберегти результат не вдалося. Спробуйте ще раз.";
    }
    invalidate();
    if (win.isConnected) win.innerHTML = `<div class="ws-win" role="status"><div class="confetti" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div><span class="ws-win-icon" aria-hidden="true">🎉</span><div><b>Завдання розв'язано!</b><div>${esc(msg)}</div></div></div>`;
  };

  area.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-ws]");
    if (!b) return;
    if (b.dataset.ws === "run") void run();
    else if (b.dataset.ws === "reset") {
      editor.setValue(task.starter);
      store.set(draftKey, task.starter);
      preview();
      win.innerHTML = "";
      term.classList.remove("ws-term-ok");
      term.textContent = "Код скинуто до початкового.";
    }
  });
  host.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void run(); }
  });
}
