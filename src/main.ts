import { getUser, init as initAuth, isReady, renderDashboard, syncLesson } from "./auth.ts";
import { cachedLesson, fetchLesson, lessonFailed, outlineLoaded, retryLesson } from "./content.ts";
import { C } from "./data.ts";
import { authTitle, isAuthRoute, mountAuthPage, renderAuthPage } from "./login.ts";
import { setMeta } from "./meta.ts";
import { getOnboarding, onboardingHtml } from "./onboarding.ts";
import { BRAND, findPage } from "./pages.ts";
import { renderPath } from "./path.ts";
import { disposeProject, mountProject, projectHTML } from "./project-page.ts";
import { projectById } from "./projects/index.ts";
import type { Project } from "./projects/types.ts";
import { hooks, toggle } from "./progress.ts";
import { initRouter, segments } from "./router.ts";
import { initStage2, mountStage2 } from "./stage2.ts";
import type { Task } from "./tasks/types.ts";
import { ui } from "./ui.ts";
import { store } from "./util.ts";
import { course, gate, lesson, loadError, loadingCard, notFound } from "./views.ts";
import { disposeWorkspace, mountWorkspace } from "./workspace.ts";

const DEFAULT_DESC = "Безкоштовні уроки програмування українською. Читай урок, пиши код у терміналі, отримуй перевірку й XP.";
const app = document.getElementById("app") as HTMLElement;

/** Уроки, шлях і кабінет лише після входу: чекаємо відповіді сервера, гостю показуємо запрошення, а за помилки пропонуємо повторити */
function locked(): string | null {
  if (!isReady()) return loadingCard();
  if (!getUser()) return gate();
  return outlineLoaded() ? null : loadError("retry-outline");
}

function render(): void {
  const [a, b, c] = segments();
  const page = findPage(location.pathname.replace(/\.html$/, ""));
  let html: string, active = "", title = BRAND, task: Task | undefined, project: Project | undefined;
  disposeWorkspace();
  disposeProject();
  if (page) { html = page.html(!!getUser()); active = page.active; title = page.title; }
  else if (a === "course" && C[b]) { html = locked() ?? course(b); active = "courses"; title = C[b].name + " — " + BRAND; }
  else if (a === "lesson" && C[b]) {
    const n = Number(c), lk = locked();
    active = "courses";
    if (lk) html = lk;
    else if (!C[b].L[n - 1]) html = notFound();
    else {
      const p = cachedLesson(b, n);
      if (p) { html = lesson(b, n, p); title = C[b].L[n - 1].t + " — " + BRAND; task = p.task ?? undefined; }
      else if (lessonFailed(b, n)) html = loadError("retry-lesson");
      else { html = loadingCard(); fetchLesson(b, n); }
    }
  }
  else if (a === "project" && projectById(b)) {
    // Проєкт, як і уроки, лише для користувача, що увійшов: гостя ведемо на запрошення
    const lk = locked();
    if (lk) html = lk;
    else { project = projectById(b) as Project; html = projectHTML(project); active = "courses"; title = project.title + " — " + BRAND; }
  }
  else if (a === "dashboard") { html = renderDashboard(); title = "Особистий кабінет — " + BRAND; }
  else if (a === "path") { html = locked() ?? renderPath(b, { onboarding: getOnboarding(), loggedIn: !!getUser() }); active = "path"; title = "Мій шлях — " + BRAND; }
  else if (a === "start") { html = locked() ?? onboardingHtml(); title = "Налаштування шляху — " + BRAND; }
  else if (isAuthRoute(a)) { html = renderAuthPage(a); title = authTitle(a) + " — " + BRAND; }
  else { html = notFound(); title = "Сторінку не знайдено — " + BRAND; }
  app.innerHTML = html;
  // Індексуються лише публічні сторінки: кабінет, уроки й форми входу пошуковикам не потрібні
  setMeta({ title, desc: page?.desc ?? DEFAULT_DESC, path: page?.path ?? location.pathname, noindex: !page });
  document.documentElement.classList.remove("spa");
  document.querySelectorAll<HTMLElement>("#nav a").forEach((l) => (l.dataset.k === active ? l.setAttribute("aria-current", "page") : l.removeAttribute("aria-current")));
  window.scrollTo(0, 0);
  if (page?.kind === "home") initHome();
  if (task) void mountWorkspace(task);
  if (project) void mountProject(project);
  if (isAuthRoute(a)) mountAuthPage(a, b);
  mountStage2(a);
}
ui.render = render;
hooks.onToggle = syncLesson;
initStage2();

document.addEventListener("click", (e) => {
  const target = e.target as Element;
  const t = target.closest<HTMLElement>("[data-toggle]");
  if (t) {
    const [k, n] = (t.dataset.toggle ?? "").split(":");
    toggle(k, +n);
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
    return;
  }
  if (target.closest("[data-act=retry-lesson]")) {
    const [, k, n] = segments();
    retryLesson(k, Number(n));
    render();
    return;
  }
  const s = target.closest<HTMLElement>("[data-scroll]");
  if (s) document.getElementById(s.dataset.scroll ?? "")?.scrollIntoView({ behavior: "smooth" });
});

function initHome(): void {
  const tabs = document.querySelectorAll<HTMLElement>("[data-tab]");
  tabs.forEach((b) => b.addEventListener("click", () => {
    tabs.forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    document.querySelectorAll<HTMLElement>("[data-pane]").forEach((p) => { p.hidden = p.dataset.pane !== b.dataset.tab; });
  }));
  const el = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const run = () => {
    const v = el<HTMLInputElement>("pyname").value.trim() || "друже";
    const o = el("pyout");
    o.textContent = "Як тебе звати? " + v + "\nПривіт, " + v + "!";
    o.style.whiteSpace = "pre-line";
  };
  el("pyrun").addEventListener("click", run);
  run();
  const hin = el<HTMLInputElement>("htmlin"), hc = el("htmlcode"), ho = el("htmlout");
  const upd = () => {
    const v = hin.value;
    hc.textContent = "<h1>" + v + "</h1>";
    ho.innerHTML = "";
    const h = document.createElement("h1");
    h.textContent = v;
    ho.appendChild(h);
  };
  hin.addEventListener("input", upd);
  upd();
}

const root = document.documentElement;
const savedTheme = store.get<string | null>("ic-theme", null);
if (savedTheme) root.setAttribute("data-theme", savedTheme);
document.getElementById("theme")?.addEventListener("click", () => {
  const dark = root.getAttribute("data-theme") ? root.getAttribute("data-theme") === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const next = dark ? "light" : "dark";
  root.setAttribute("data-theme", next);
  store.set("ic-theme", next);
});

initRouter();
render();
void initAuth();
