import { init as initAuth, renderDashboard, syncLesson } from "./auth.ts";
import { C, CATS } from "./data.ts";
import { hooks, toggle } from "./progress.ts";
import { taskForLesson } from "./tasks/index.ts";
import type { Task } from "./tasks/types.ts";
import { ui } from "./ui.ts";
import { store } from "./util.ts";
import { course, dir, home, lesson, notFound } from "./views.ts";
import { disposeWorkspace, mountWorkspace } from "./workspace.ts";

const BRAND = "Iteris Code";
const app = document.getElementById("app") as HTMLElement;

function render(): void {
  const [a, b, c] = location.hash.replace(/^#\/?/, "").split("/");
  let html: string, active = "", title = BRAND + " — вчимося кодити разом";
  let task: Task | undefined;
  disposeWorkspace();
  if (!a) html = home();
  else if (CATS[a]) { html = dir(a); active = a; title = CATS[a].title + " — " + BRAND; }
  else if (a === "course" && C[b]) { html = course(b); active = C[b].cat; title = C[b].name + " — " + BRAND; }
  else if (a === "lesson" && C[b] && C[b].L[Number(c) - 1]) {
    html = lesson(b, Number(c)); active = C[b].cat; title = C[b].L[Number(c) - 1].t + " — " + BRAND;
    task = taskForLesson(`${b}/${Number(c)}`);
  }
  else if (a === "dashboard") { html = renderDashboard(); title = "Особистий кабінет — " + BRAND; }
  else html = notFound();
  app.innerHTML = html;
  document.title = title;
  document.querySelectorAll<HTMLElement>("#nav a").forEach((l) => (l.dataset.k === active ? l.setAttribute("aria-current", "page") : l.removeAttribute("aria-current")));
  window.scrollTo(0, 0);
  if (!a) initHome();
  if (task) void mountWorkspace(task);
}
ui.render = render;
hooks.onToggle = syncLesson;
window.addEventListener("hashchange", render);

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
