import { getUser, init as initAuth, isReady, renderDashboard, syncLesson, updateHeader } from "./auth.ts";
import { mountDemo } from "./demo-mount.ts";
import { adminHtml, mountAdmin } from "./admin.ts";
import { altsFor, applyChromeDom, type Alts } from "./chrome.ts";
import { mountContact } from "./contact-mount.ts";
import { cachedLesson, cachedProject, fetchLesson, fetchProject, lessonFailed, outlineLoaded, projectFailed, retryLesson, retryProject } from "./content.ts";
import { C, projectMeta } from "./data.ts";
import { authTitle, isAuthRoute, mountAuthPage, renderAuthPage } from "./login.ts";
import { preferredLang, savePreferred } from "./i18n-client.ts";
import { setLang, splitLang, tr, withLang, type Lang } from "./i18n.ts";
import { setMeta } from "./meta.ts";
import { getOnboarding, onboardingHtml } from "./onboarding.ts";
import { BRAND, findPage } from "./pages.ts";
import { renderPath } from "./path.ts";
import { mountSettings, renderPublic, renderSettings } from "./profile.ts";
import { disposeProject, mountProject, projectHTML } from "./project-page.ts";
import type { Project } from "./projects/types.ts";
import { hooks, toggle } from "./progress.ts";
import { onDashHost } from "./domains.ts";
import { initRouter, segments } from "./router.ts";
import { initStage2, mountStage2 } from "./stage2.ts";
import type { Task } from "./tasks/types.ts";
import { ui } from "./ui.ts";
import { store } from "./util.ts";
import { course, gate, lesson, loadError, loadingCard, notFound } from "./views.ts";
import { disposeWorkspace, mountWorkspace } from "./workspace.ts";

const defaultDesc = (): string => tr("Безкоштовні уроки програмування українською. Читай урок, пиши код у терміналі, отримуй перевірку й XP.", "Free programming lessons. Read a lesson, write code in the terminal, get checked and earn XP.");
// Сторінки з українським вмістом, яким в англійській версії потрібне пояснення
const UK_ONLY = new Set(["course", "lesson", "project", "dashboard", "path", "start", "profile", "admin", "u"]);
const app = document.getElementById("app") as HTMLElement;

/** Уроки, шлях і кабінет лише після входу: чекаємо відповіді сервера, гостю показуємо запрошення, а за помилки пропонуємо повторити */
function locked(): string | null {
  if (!isReady()) return loadingCard();
  if (!getUser()) return gate();
  return outlineLoaded() ? null : loadError("retry-outline");
}

function render(): void {
  const [a, b, c] = segments();
  // Мова: префікс /en в адресі, для публічних сторінок без префікса українська, для кабінету й форм входу останній вибір користувача
  const sp = splitLang(location.pathname), barePath = sp.path.replace(/\.html$/, "");
  const lang: Lang = sp.lang ?? (!onDashHost() && findPage(barePath, "uk") ? "uk" : preferredLang());
  setLang(lang);
  const page = onDashHost() ? undefined : findPage(barePath, lang);   // на кабінетному піддомені «/» не головна, а кабінет
  if (page || sp.lang) savePreferred(lang);
  let html: string, active = "", title = BRAND, task: Task | undefined, project: Project | undefined, indexable = false;
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
  else if (a === "project" && b) {
    // Проєкт, як і уроки, лише для користувача, що увійшов: гостя ведемо на запрошення, умови приходять з сервера
    const lk = locked();
    if (lk) html = lk;
    else if (!projectMeta(b)) html = notFound();
    else {
      const p = cachedProject(b);
      if (p) { project = p; html = projectHTML(p); active = "courses"; title = p.title + " — " + BRAND; }
      else if (projectFailed(b)) html = loadError("retry-project");
      else { html = loadingCard(); fetchProject(b); }
    }
  }
  else if (a === "dashboard") { html = renderDashboard(); title = tr("Особистий кабінет", "My account") + " — " + BRAND; }
  else if (a === "path") { html = locked() ?? renderPath(b, { onboarding: getOnboarding(), loggedIn: !!getUser() }); active = "path"; title = "Мій шлях — " + BRAND; }
  else if (a === "start") { html = locked() ?? onboardingHtml(); title = "Налаштування шляху — " + BRAND; }
  else if (a === "u" && b && !c) { const r = renderPublic(b); html = r.html; title = r.title + " — " + BRAND; indexable = r.index; }
  else if (a === "profile") { html = !isReady() ? loadingCard() : !getUser() ? gate() : renderSettings(); title = "Мій профіль — " + BRAND; }
  else if (a === "admin") { html = !isReady() ? loadingCard() : !getUser() ? gate() : adminHtml(); title = "Аналітика — " + BRAND; }
  else if (isAuthRoute(a)) { html = renderAuthPage(a); title = authTitle(a) + " — " + BRAND; }
  else { html = notFound(); title = tr("Сторінку не знайдено", "Page not found") + " — " + BRAND; }
  if (lang === "en" && !page && UK_ONLY.has(a)) html = `<p class="lang-note" role="note">${tr("", "Lessons, tasks and your account are available in Ukrainian only for now. English course content is on the way.")}</p>` + html;
  app.innerHTML = html;
  // Індексуються лише публічні сторінки: кабінет, уроки й форми входу пошуковикам не потрібні
  const alts: Alts = page ? altsFor(page.path) : { uk: location.pathname, en: location.pathname };
  setMeta({ title, desc: page?.desc ?? defaultDesc(), path: page ? withLang(page.path, lang) : location.pathname, noindex: !page && !indexable, lang, alts: page ? alts : null });   // індексуються публічні сторінки й відкриті профілі
  applyChromeDom(lang, alts);
  updateHeader();   // кнопка входу й підказки в шапці теж мовою сторінки
  document.documentElement.classList.remove("spa");
  document.querySelectorAll<HTMLElement>("#nav a").forEach((l) => (l.dataset.k === active ? l.setAttribute("aria-current", "page") : l.removeAttribute("aria-current")));
  window.scrollTo(0, 0);
  if (page?.kind === "home") { initHome(); mountDemo(); }
  if (task) void mountWorkspace(task);
  if (project) void mountProject(project);
  if (page?.path === "/contact") mountContact(getUser());
  if (isAuthRoute(a)) mountAuthPage(a, b);
  if (a === "profile" && getUser()) mountSettings();
  if (a === "admin" && getUser()) void mountAdmin();
  mountStage2(a);
}
ui.render = render;
hooks.onToggle = syncLesson;
initStage2();

// Перемикач мови: запам'ятовуємо вибір до того, як роутер перемалює сторінку (фаза перехоплення), далі перехід робить роутер
document.addEventListener("click", (e) => {
  const l = (e.target as Element).closest<HTMLElement>("#lang [data-lang]")?.dataset.lang;
  if (l === "uk" || l === "en") savePreferred(l);
}, true);

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
  if (target.closest("[data-act=retry-project]")) {
    retryProject(segments()[1] ?? "");
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
    const v = el<HTMLInputElement>("pyname").value.trim() || tr("друже", "friend");
    const o = el("pyout");
    o.textContent = tr("Як тебе звати? ", "What is your name? ") + v + "\n" + tr("Привіт, ", "Hello, ") + v + "!";
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
