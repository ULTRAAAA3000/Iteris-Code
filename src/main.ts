import { getUser, init as initAuth, isReady, renderDashboard, syncLesson } from "./auth.ts";
import { cachedLesson, fetchLesson, lessonFailed, outlineLoaded, retryLesson } from "./content.ts";
import { C, CATS } from "./data.ts";
import { authTitle, isAuthRoute, mountAuthPage, renderAuthPage } from "./login.ts";
import { getOnboarding, onboardingHtml } from "./onboarding.ts";
import { renderPath } from "./path.ts";
import { hooks, toggle } from "./progress.ts";
import { initStage2, mountStage2 } from "./stage2.ts";
import type { Task } from "./tasks/types.ts";
import { ui } from "./ui.ts";
import { store } from "./util.ts";
import { course, dir, gate, home, lesson, loadError, loadingCard, notFound, reference } from "./views.ts";
import { disposeWorkspace, mountWorkspace } from "./workspace.ts";

const BRAND = "Iteris Code";
const app = document.getElementById("app") as HTMLElement;

/** Уроки, шлях і кабінет лише після входу: чекаємо відповіді сервера, гостю показуємо запрошення, а за помилки пропонуємо повторити */
function locked(): string | null {
  if (!isReady()) return loadingCard();
  if (!getUser()) return gate();
  return outlineLoaded() ? null : loadError("retry-outline");
}

function render(): void {
  const [a, b, c] = location.hash.replace(/^#\/?/, "").split("/");
  let html: string, active = "", title = BRAND + " — довідник програміста";
  let task: Task | undefined;
  disposeWorkspace();
  if (!a) html = home(!!getUser());
  else if (CATS[a]) { html = dir(a); active = a; title = CATS[a].title + " — " + BRAND; }
  else if (a === "ref" && C[b]) { html = reference(b, !!getUser()); active = C[b].cat; title = C[b].name + ": довідник — " + BRAND; }
  else if (a === "course" && C[b]) { html = locked() ?? course(b); active = C[b].cat; title = C[b].name + " — " + BRAND; }
  else if (a === "lesson" && C[b]) {
    const n = Number(c), lk = locked();
    active = C[b].cat;
    if (lk) html = lk;
    else if (!C[b].L[n - 1]) html = notFound();
    else {
      const p = cachedLesson(b, n);
      if (p) { html = lesson(b, n, p); title = C[b].L[n - 1].t + " — " + BRAND; task = p.task ?? undefined; }
      else if (lessonFailed(b, n)) html = loadError("retry-lesson");
      else { html = loadingCard(); fetchLesson(b, n); }
    }
  }
  else if (a === "dashboard") { html = renderDashboard(); title = "Особистий кабінет — " + BRAND; }
  else if (a === "path") { html = locked() ?? renderPath(b, { onboarding: getOnboarding(), loggedIn: !!getUser() }); active = "path"; title = "Мій шлях — " + BRAND; }
  else if (a === "start") { html = locked() ?? onboardingHtml(); title = "Налаштування шляху — " + BRAND; }
  else if (isAuthRoute(a)) { html = renderAuthPage(a); title = authTitle(a) + " — " + BRAND; }
  else html = notFound();
  app.innerHTML = html;
  document.title = title;
  document.querySelectorAll<HTMLElement>("#nav a").forEach((l) => (l.dataset.k === active ? l.setAttribute("aria-current", "page") : l.removeAttribute("aria-current")));
  window.scrollTo(0, 0);
  if (!a) initHome();
  if (task) void mountWorkspace(task);
  if (isAuthRoute(a)) mountAuthPage(a, b);
  mountStage2(a);
}
ui.render = render;
hooks.onToggle = syncLesson;
window.addEventListener("hashchange", render);
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
    const [, k, n] = location.hash.replace(/^#\/?/, "").split("/");
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

render();
void initAuth();
