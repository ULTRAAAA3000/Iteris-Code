// Поведінка демо-завдання на лендингу: вибір мови, редактор, перевірка в браузері (JS у Web Worker, HTML в ізольованому iframe).
import { demoHints, demoTask, type DemoLang } from "./demo.ts";
import { enResult } from "./i18n-runner.ts";
import { getLang, tr } from "./i18n.ts";
import type { JsTask, PageTask } from "./tasks/types.ts";
import type { TestResult } from "./runner/core.ts";
import { runInWorker } from "./runner/client.ts";
import { runRemote } from "./runner/remote.ts";
import { buildPageDoc, evalPageChecks, renderInFrame } from "./runner/page.ts";

const loc = (s: string): string => (getLang() === "en" ? enResult(s) : s);   // повідомлення раннера й сервера українською, для англійської сторінки перекладаємо
const escHtml = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function mountDemo(): void {
  const root = document.getElementById("try");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";
  const box: HTMLElement = root;
  const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
  const editor = $<HTMLTextAreaElement>("dm-code"), results = $("dm-results"), win = $("dm-win"), runBtn = $<HTMLButtonElement>("dm-run");
  const frame = $<HTMLIFrameElement>("dm-preview"), previewWrap = $("dm-preview-wrap"), panel = $("dm-panel");
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-dm]"));

  let lang: DemoLang = "js", runId = 0;
  const drafts: Record<DemoLang, string> = { js: demoTask("js").starter, html: demoTask("html").starter, css: demoTask("css").starter, python: demoTask("python").starter };
  const tips: Record<DemoLang, number> = { js: 0, html: 0, css: 0, python: 0 };   // скільки підказок уже показано для кожної мови
  const tipBtn = $<HTMLButtonElement>("dm-tip"), tipBox = $("dm-tips");   // у кожної мови свій незавершений код

  const preview = (): { doc: Document; win: Window } | null => renderInFrame(frame, buildPageDoc(demoTask(lang) as PageTask, editor.value));
  const showTips = (): void => {   // тексти підказок це наші константи; показуємо їх по одній
    const all = demoHints(lang), n = tips[lang];
    tipBox.innerHTML = all.slice(0, n).map((h, i) => `<p class="dm-tip"><b>${i + 1}.</b> ${h}</p>`).join("");
    tipBtn.disabled = n >= all.length;
    tipBtn.textContent = n === 0 ? tr("Підказка", "Hint") : n >= all.length ? tr("Підказок більше немає", "No more hints") : `${tr("Ще підказка", "Another hint")} (${n}/${all.length})`;
  };
  const clearResults = (): void => { runId++; results.innerHTML = ""; win.hidden = true; box.classList.remove("done"); };

  function show(lng: DemoLang): void {
    lang = lng;
    const t = demoTask(lng);
    $("dm-title").textContent = t.title;
    $("dm-brief").innerHTML = t.brief.map((p) => `<p>${p}</p>`).join("");   // тексти завдань це наші константи, не введення користувача
    editor.value = drafts[lng];
    panel.setAttribute("aria-labelledby", "dm-tab-" + lng);
    tabs.forEach((b) => { const on = b.dataset.dm === lng; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
    const pg = lng === "html" || lng === "css";
    previewWrap.hidden = !pg;
    $("dm-note").hidden = lng !== "python";
    if (pg) preview();
    showTips();
    clearResults();
  }

  function render(rs: TestResult[], error?: string): void {
    const passed = rs.filter((r) => r.passed).length;
    const all = !error && rs.length > 0 && passed === rs.length;
    const items = error
      ? [`<li class="dm-res no" style="--d:0"><span class="dm-ic" aria-hidden="true">✗</span><span><b>${tr("Не вдалося перевірити", "Could not check")}</b><small>${escHtml(loc(error))}</small></span></li>`]
      : [`<li class="dm-sum${all ? " ok" : ""}">${tr("Виконано", "Done")} ${passed} ${tr("з", "of")} ${rs.length}<span class="dm-bar" aria-hidden="true"><i style="width:${rs.length ? Math.round((passed / rs.length) * 100) : 0}%"></i></span></li>`,
        ...rs.map((r, i) => `<li class="dm-res ${r.passed ? "ok" : "no"}" style="--d:${i + 1}"><span class="dm-ic" aria-hidden="true">${r.passed ? "✓" : "✗"}</span><span><b>${escHtml(r.name)}</b>${!r.passed && r.error ? `<small>${escHtml(loc(r.error))}</small>` : ""}</span></li>`)];
    results.innerHTML = items.join("");
    win.hidden = !all;
    box.classList.toggle("done", all);
    if (all) $("dm-win-h").focus();
  }

  async function run(): Promise<void> {
    if (runBtn.disabled) return;
    const my = ++runId;
    runBtn.disabled = true;
    runBtn.classList.add("is-loading");
    runBtn.setAttribute("aria-busy", "true");
    try {
      if (lang === "js") {
        const r = await runInWorker(editor.value, (demoTask("js") as JsTask).tests, () => {});
        if (my === runId) render(r.results, r.error);
      } else if (lang === "python") {
        const r = await runRemote("demo-py", editor.value, 25000, "/api/demo-run", "taskId", { lang: getLang() });
        if (my === runId) render(r.results, r.error);
      } else {
        const page = preview(), task = demoTask(lang) as PageTask;
        if (my === runId) page ? render(evalPageChecks(task.checks, page.doc, page.win, editor.value)) : render([], tr("Не вдалося відобразити сторінку", "Could not render the page"));
      }
    } finally {
      runBtn.disabled = false;
      runBtn.classList.remove("is-loading");
      runBtn.removeAttribute("aria-busy");
    }
  }

  tabs.forEach((b, i) => {
    b.addEventListener("click", () => show(b.dataset.dm as DemoLang));
    b.addEventListener("keydown", (e) => {   // стрілки перемикають вкладки (шаблон ARIA tabs)
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      show(next.dataset.dm as DemoLang);
    });
  });
  editor.addEventListener("input", () => { drafts[lang] = editor.value; if (lang === "html" || lang === "css") preview(); });
  editor.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void run(); } });
  runBtn.addEventListener("click", () => void run());
  tipBtn.addEventListener("click", () => { if (tips[lang] < demoHints(lang).length) tips[lang]++; showTips(); });
  $("dm-reset").addEventListener("click", () => { drafts[lang] = demoTask(lang).starter; tips[lang] = 0; show(lang); editor.focus(); });
}
