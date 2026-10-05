// Екран уроку з практичним завданням: теорія ліворуч, редактор і термінал праворуч.
import { completeTask, getUser, invalidate } from "./auth.ts";
import { createEditor } from "./editor.ts";
import type { CodeEditor } from "./editor.ts";
import { isTaskPassed, markTaskPassed } from "./progress.ts";
import { runInWorker } from "./runner/client.ts";
import type { RunOutcome } from "./runner/client.ts";
import type { Task } from "./tasks/types.ts";
import { toast, ui } from "./ui.ts";
import { esc, escA, pl, store } from "./util.ts";

interface View { crumbs: string; meta: string; title: string; actions: string; prose: string; pager: string; task: Task }

export function workspaceHTML(v: View): string {
  const t = v.task;
  const badge = t.premium ? `<span class="plan pro">Pro</span>` : `<span class="plan free">Безкоштовно</span>`;
  return `${v.crumbs}
  <div class="ws">
    <article class="ws-left lesson">
      ${v.meta}
      <h1>${v.title}</h1>
      ${v.actions}
      <div class="prose">
        ${v.prose}
        <section class="task-brief" id="task">
          <h2>Практичне завдання: ${escA(t.title)} ${badge}</h2>
          <div class="callout"><b>Навіщо це в роботі.</b> ${t.context}</div>
          ${t.brief.map((x) => `<p>${x}</p>`).join("")}
          <p class="dash-muted">Нагорода: ${t.xp} XP${isTaskPassed(t.id) ? " · вже розв'язано ✓" : ""}</p>
        </section>
      </div>
      ${v.pager}
    </article>
    <section class="ws-right" aria-label="Редактор коду">
      <div class="ws-bar">
        <span class="ws-tab">solution.js</span>
        <span class="ws-spacer"></span>
        <button class="btn small" data-ws="reset">Скинути</button>
        <button class="btn primary small" data-ws="run" id="ws-run">▶ Запустити тести</button>
      </div>
      <div id="ws-paywall"></div>
      <div id="editor" class="ws-editor"></div>
      <div id="ws-win" aria-live="polite"></div>
      <pre id="ws-term" class="ws-term" aria-live="polite" tabindex="0">Натисніть «Запустити тести» (Ctrl+Enter), щоб перевірити рішення.</pre>
    </section>
  </div>`;
}

let active: { editor: CodeEditor | null; dispose: () => void } | null = null;

export function disposeWorkspace(): void {
  active?.dispose();
  active = null;
}

function renderOutcome(res: RunOutcome, logs: string[]): string {
  const parts: string[] = [];
  if (logs.length) parts.push(`<span class="t-dim">Консоль:</span>\n${esc(logs.join("\n"))}\n`);
  if (res.error) parts.push(`<span class="t-fail">${esc(res.error)}</span>`);
  for (const r of res.results) {
    parts.push(r.passed ? `<span class="t-ok">✓ ${esc(r.name)}</span>` : `<span class="t-fail">✗ ${esc(r.name)}</span>\n    <span class="t-dim">${esc(r.error ?? "")}</span>`);
  }
  if (res.results.length) {
    const ok = res.results.filter((r) => r.passed).length;
    parts.push(`\n<b class="${ok === res.results.length ? "t-ok" : "t-fail"}">Пройдено ${ok} з ${res.results.length}</b>`);
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

  const editor = await createEditor(host, { value: store.get<string>(draftKey, task.starter), language: "javascript" });
  if (active !== me || !host.isConnected) { editor.dispose(); return; }  // користувач уже перейшов на іншу сторінку
  me.editor = editor;
  me.dispose = () => { ui.authListeners.delete(refresh); editor.dispose(); };

  let timer: number | undefined;
  editor.onChange(() => {
    clearTimeout(timer);
    timer = window.setTimeout(() => store.set(draftKey, editor.getValue()), 400);
  });

  let running = false;
  const run = async (): Promise<void> => {
    if (running || locked()) return;
    running = true;
    runBtn.disabled = true; runBtn.textContent = "Виконується…";
    win.innerHTML = "";
    const code = editor.getValue();
    const logs: string[] = [];
    const res = await runInWorker(code, task.tests, (l) => logs.push(l));
    running = false;
    runBtn.textContent = "▶ Запустити тести";
    refresh();
    if (!term.isConnected) return;
    term.innerHTML = renderOutcome(res, logs);
    if (!res.error && res.results.length > 0 && res.results.every((r) => r.passed)) await onSolved(code);
  };

  const onSolved = async (code: string): Promise<void> => {
    markTaskPassed(task.id);
    const user = getUser();
    let msg = "Увійдіть, щоб зберегти прогрес і серію занять.";
    let xp = 0;
    if (user) {
      const r = await completeTask(task.id, code);
      if (r.status === 402) { toast("Це завдання входить до підписки Pro"); return; }
      if (r.ok) {
        xp = r.xp ?? 0;
        msg = r.firstSolve ? `+${xp} XP · 🔥 ${r.streak} ${pl(r.streak ?? 0, "день", "дні", "днів")} поспіль` : "Ви вже розв'язували це завдання, XP не нараховується повторно.";
      } else msg = "Рішення правильне, але зберегти результат не вдалося. Спробуйте ще раз.";
    }
    invalidate();
    if (win.isConnected) win.innerHTML = `<div class="ws-win" role="status"><span class="ws-win-icon" aria-hidden="true">🎉</span><div><b>Завдання розв'язано!</b><div>${esc(msg)}</div></div></div>`;
  };

  area.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-ws]");
    if (!b) return;
    if (b.dataset.ws === "run") void run();
    else if (b.dataset.ws === "reset") {
      editor.setValue(task.starter);
      store.set(draftKey, task.starter);
      win.innerHTML = "";
      term.textContent = "Код скинуто до початкового.";
    }
  });
  host.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void run(); }
  });
}
