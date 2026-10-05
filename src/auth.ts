// Особистий кабінет: вхід через Google, синхронізація прогресу, дашборд (#/dashboard)
import { C, totals } from "./data.ts";
import { done, isDone, persist } from "./progress.ts";
import { TASKS, taskById } from "./tasks/index.ts";
import { toast, ui } from "./ui.ts";
import type { DashboardData, PublicUser } from "./types.ts";
import { escA, pl } from "./util.ts";

type DashState = DashboardData | { error: true } | null;
const st: { user: PublicUser | null; ready: boolean; dash: DashState; loading: boolean } = { user: null, ready: false, dash: null, loading: false };

const GROUPS = [
  { t: "Frontend", courses: ["html", "css", "js", "ts"] },
  { t: "Server & Backend", courses: ["python", "go", "java", "php"] },
  { t: "Бази даних", courses: ["sql"] },
  { t: "Інструменти розробника", courses: ["git", "bash"] },
  { t: "Основи мов", courses: ["cpp", "pascal"] },
] as const;
const FOCUS_ORDER = ["python", "html", "js", "sql", "git", "go", "java", "php", "ts", "css", "bash", "cpp", "pascal"];

const safeImg = (u: string | null | undefined): string => (typeof u === "string" && /^https:\/\//.test(u) ? u : "");
const fmtDate = (s: string): string => {
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("uk-UA");
};

interface ApiResult<T> { ok: boolean; status: number; data: T | null }
async function api<T = unknown>(path: string, opts: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const r = await fetch(path, { credentials: "same-origin", ...opts });
    let data: T | null = null;
    try { data = (await r.json()) as T; } catch { /* порожня відповідь */ }
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}
const post = <T = unknown>(path: string, body: unknown = {}) =>
  api<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const avatar = (u: PublicUser, big = false): string =>
  safeImg(u.avatarUrl)
    ? `<img class="avatar${big ? " big" : ""}" src="${escA(safeImg(u.avatarUrl))}" alt="" referrerpolicy="no-referrer">`
    : `<span class="avatar${big ? " big" : ""}"></span>`;

export const getUser = (): PublicUser | null => st.user;
export const invalidate = (): void => { st.dash = null; };

export function updateHeader(): void {
  const el = document.getElementById("acct");
  if (!el) return;
  if (!st.ready) { el.innerHTML = ""; return; }
  el.innerHTML = st.user
    ? `<a class="acct-user" href="#/dashboard" title="Особистий кабінет">${avatar(st.user)}<span>${escA(st.user.name || st.user.email)}</span></a>`
    : `<button class="btn small" data-act="login">Увійти</button>`;
}

async function login(): Promise<void> {
  const cfg = await api<{ clientId: string | null }>("/api/auth/config");
  const id = cfg.data?.clientId;
  if (!id) return toast("Вхід тимчасово недоступний");
  const s = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
  try { sessionStorage.setItem("ic-oauth-state", s); } catch { return toast("Браузер блокує сховище, тому вхід неможливий"); }
  location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
    client_id: id, redirect_uri: location.origin + "/", response_type: "code",
    scope: "openid email profile", state: s, prompt: "select_account",
  });
}

async function handleCallback(): Promise<void> {
  const q = new URLSearchParams(location.search);
  if (!q.has("code") && !q.has("error")) return;
  const code = q.get("code"), s = q.get("state"), err = q.get("error");
  history.replaceState(null, "", location.pathname + location.hash);
  let saved: string | null = null;
  try { saved = sessionStorage.getItem("ic-oauth-state"); sessionStorage.removeItem("ic-oauth-state"); } catch { /* ігноруємо */ }
  if (err || !code) return toast("Вхід скасовано");
  if (!saved || saved !== s) return toast("Не вдалося підтвердити вхід. Спробуйте ще раз");
  const r = await post("/api/auth/google", { code });
  if (!r.ok) return toast("Не вдалося увійти через Google");
  location.hash = "#/dashboard";
}

// Після входу: об'єднуємо локальний прогрес із серверним
async function syncLocal(): Promise<void> {
  const r = await api<{ lessonIds: string[] }>("/api/progress");
  if (!r.ok || !r.data) return;
  const server = new Set(r.data.lessonIds);
  const local: string[] = [];
  for (const k of Object.keys(done)) if (C[k]) (done[k] || []).forEach((n) => local.push(k + "/" + n));
  let changed = false;
  server.forEach((id) => {
    const [k, n] = id.split("/");
    if (C[k] && +n >= 1 && +n <= C[k].L.length && !isDone(k, +n)) { done[k] = [...(done[k] || []), +n].sort((a, b) => a - b); changed = true; }
  });
  if (changed) persist();
  const extra = local.filter((id) => !server.has(id)).slice(0, 200);
  if (extra.length) await post("/api/progress", { lessonIds: extra, done: true, sync: true });
  st.dash = null;
}

export function syncLesson(k: string, n: number, isDoneNow: boolean): void {
  if (!st.user) return;
  void post<{ streak: number }>("/api/progress", { lessonIds: [k + "/" + n], done: isDoneNow }).then((r) => {
    if (r.ok && r.data && st.user) st.user.streak = r.data.streak;
    st.dash = null;
  });
}

export interface CompleteResult { ok: boolean; status: number; streak?: number; firstSolve?: boolean; xp?: number }
export async function completeTask(taskId: string, code: string): Promise<CompleteResult> {
  const r = await post<{ streak: number; firstSolve: boolean; xp: number }>("/api/progress/complete", { taskId, code, passed: true });
  if (r.ok && r.data && st.user) st.user.streak = r.data.streak;
  st.dash = null;
  return { ok: r.ok, status: r.status, ...(r.data ?? {}) };
}

async function logout(): Promise<void> {
  await post("/api/auth/logout");
  st.user = null; st.dash = null;
  updateHeader();
  ui.notifyAuth();
  if (location.hash === "#/" || location.hash === "") ui.render(); else location.hash = "#/";
}

export async function init(): Promise<void> {
  await handleCallback();
  const r = await api<{ user: PublicUser | null }>("/api/me");
  st.user = r.ok && r.data ? r.data.user : null;
  if (st.user) await syncLocal();
  st.ready = true;
  updateHeader();
  ui.notifyAuth();
  if (/^#\/dashboard/.test(location.hash)) ui.render();
}

async function loadDash(): Promise<void> {
  if (st.loading) return;
  st.loading = true;
  const r = await api<DashboardData>("/api/dashboard");
  st.loading = false;
  if (r.status === 401) { st.user = null; st.dash = null; updateHeader(); }
  else st.dash = r.ok && r.data ? r.data : { error: true };
  if (/^#\/dashboard/.test(location.hash)) ui.render();
}

/* ---------- Дашборд ---------- */
const skeleton = `<div class="card"><p class="dash-muted">Завантаження кабінету…</p></div>`;
const guestCard = (): string => `<div class="card dash-guest"><h1>Особистий кабінет</h1>
    <p>Увійдіть через Google, щоб зберігати прогрес на всіх пристроях, бачити серію занять і карту навичок.</p>
    <button class="btn primary" data-act="login">Увійти через Google</button></div>`;
const errorCard = (): string => `<div class="card dash-guest"><h1>Не вдалося завантажити кабінет</h1>
    <p>Перевірте з'єднання та спробуйте ще раз.</p><button class="btn primary" data-act="retry">Спробувати ще раз</button></div>`;

function focusLesson(set: Set<string>, last: string | null): [string, number] | null {
  const has = (k: string, n: number) => set.has(k + "/" + n);
  const first = (k: string): number => { for (let n = 1; n <= C[k].L.length; n++) if (!has(k, n)) return n; return 0; };
  if (last) {
    const [lk, ln] = [last.split("/")[0], +last.split("/")[1]];
    if (C[lk]) {
      let m = 0;
      for (let i = ln + 1; i <= C[lk].L.length && !m; i++) if (!has(lk, i)) m = i;
      if (!m) m = first(lk);
      if (m) return [lk, m];
    }
  }
  for (const k of FOCUS_ORDER) if (C[k]) { const m = first(k); if (m) return [k, m]; }
  return null;
}

function heat(activity: Record<string, number>): { total: number; html: string } {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today); start.setUTCDate(start.getUTCDate() - 181);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7)); // вирівнюємо за понеділком
  let cells = "", total = 0;
  for (const d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10), c = activity[key] || 0;
    total += c;
    const lv = c === 0 ? 0 : c === 1 ? 1 : c <= 3 ? 2 : c <= 5 ? 3 : 4;
    cells += `<i class="l${lv}" title="${key}: ${c}"></i>`;
  }
  return { total, html: `<div class="heat-wrap"><div class="heat" role="img" aria-label="Графік активності за пів року">${cells}</div></div>` };
}

function full(d: DashboardData): string {
  const u = d.user;
  const set = new Set(d.completedLessons.filter((id) => { const [k, n] = id.split("/"); return C[k] && +n >= 1 && +n <= C[k].L.length; }));
  const passed = new Set(d.passedTasks);
  const doneIn = (k: string): number => C[k].L.filter((_, i) => set.has(k + "/" + (i + 1))).length;
  const f = focusLesson(set, d.lastLesson), h = heat(d.activity || {});
  const focus = f
    ? `<h3>Продовжити навчання</h3><p class="dash-muted">${escA(C[f[0]].name)} · ${escA(C[f[0]].L[f[1] - 1].ch || "")}</p>
         <p class="dash-focus">Урок ${f[1]}: ${escA(C[f[0]].L[f[1] - 1].t)}</p>
         <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${C[f[0]].L.length}" aria-valuenow="${doneIn(f[0])}"><i style="width:${Math.round((doneIn(f[0]) / C[f[0]].L.length) * 100)}%"></i></div>
         <p><a class="btn primary small" href="#/lesson/${f[0]}/${f[1]}">Продовжити</a></p>`
    : `<h3>Усі курси пройдено</h3><p class="dash-muted">Вітаємо! Скоро тут з'являться нові практичні завдання.</p>`;
  const skills = GROUPS.map((g) => {
    const ks = g.courses.filter((k) => C[k]);
    const tot = ks.reduce((s, k) => s + C[k].L.length, 0), dn = ks.reduce((s, k) => s + doneIn(k), 0), pct = tot ? Math.round((dn / tot) * 100) : 0;
    const gt = TASKS.filter((t) => (ks as readonly string[]).includes(t.course)), gp = gt.filter((t) => passed.has(t.id)).length;
    return `<div class="card skill"><h3><span>${escA(g.t)}</span><span>${pct}%</span></h3>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${escA(g.t)}"><i style="width:${pct}%"></i></div>
        <ul>${ks.map((k) => `<li><a href="#/course/${k}">${escA(C[k].name)}</a><span>${doneIn(k)}/${C[k].L.length}</span></li>`).join("")}</ul>
        <p class="locked">Теорія: ${pct}% · Практика: ${gt.length ? `${gp}/${gt.length}` : "скоро"}</p></div>`;
  }).join("");
  const subs = d.recentSubmissions.length
    ? `<ul class="subs">${d.recentSubmissions.map((s) => `<li><span class="${s.passed ? "s-ok" : "s-fail"}">${s.passed ? "Пройдено" : "Не пройдено"}</span><span>${escA(taskById(s.taskId)?.title ?? s.taskId)}</span><span class="dash-muted">${escA(fmtDate(s.at))}</span></li>`).join("")}</ul>`
    : `<p class="dash-muted">Поки що немає розв'язаних завдань. Вони з'являться тут, коли ви почнете практику.</p>`;
  const plan = u.isPro
    ? `<span class="plan pro">Pro</span> <span class="dash-muted">${u.proUntil ? "до " + escA(fmtDate(u.proUntil)) : ""}</span> <button class="btn small" data-act="manage">Керування підпискою</button>`
    : `<span class="plan free">Free</span> <button class="btn primary small" data-act="upgrade">Перейти на Pro за $5</button>`;
  return `<div class="dash">
      <section class="card dash-head">${avatar(u, true)}
        <div class="grow"><h1>${escA(u.name || "Користувач")}</h1><p>${escA(u.email)}</p><p class="plan-row">${plan}</p></div>
        <button class="btn small" data-act="logout">Вийти</button></section>
      <div class="dash-grid">
        <section class="card">${focus}</section>
        <section class="card"><h3>Серія занять</h3>
          <div class="streak"><span aria-hidden="true">🔥</span><b>${u.streak}</b><span>${pl(u.streak, "день", "дні", "днів")} поспіль</span></div>
          <p class="dash-muted">${u.streak ? "Так тримати! Позначте урок пройденим або розв'яжіть завдання сьогодні, щоб не втратити серію." : "Позначте урок пройденим, щоб почати серію."}</p></section>
        <section class="card"><h3>Підсумки</h3><div class="stats3">
          <div><strong>${set.size}</strong><span>${pl(set.size, "урок", "уроки", "уроків")}</span></div>
          <div><strong>${d.tasksPassed}</strong><span>${pl(d.tasksPassed, "завдання", "завдання", "завдань")}</span></div>
          <div><strong>${Math.round((set.size / totals.lessons) * 100)}%</strong><span>теорії</span></div></div></section>
      </div>
      <section><h2 class="section-title">Карта навичок</h2><div class="skills">${skills}</div></section>
      <section class="card"><h3>Активність за півроку: ${h.total}</h3>${h.html}
        <p class="legend dash-muted">Менше <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> Більше</p></section>
      <div class="dash-grid">
        <section class="card"><h3>Останні відповіді</h3>${subs}</section>
        <section class="card"><h3>Наскрізні проєкти</h3><p class="dash-muted">Mini-SaaS і API-сервіси з'являться тут разом із посиланням, яким можна поділитися.</p><button class="btn small" disabled>Скоро</button></section>
      </div></div>`;
}

export function renderDashboard(): string {
  if (!st.ready) return skeleton;
  if (!st.user) return guestCard();
  if (!st.dash) { void loadDash(); return skeleton; }
  return "error" in st.dash ? errorCard() : full(st.dash);
}

document.addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-act]");
  if (!b) return;
  const a = b.dataset.act;
  if (a === "login") void login();
  else if (a === "logout") void logout();
  else if (a === "retry") { st.dash = null; ui.render(); }
  else if (a === "upgrade" || a === "manage") toast("Оплата та керування підпискою будуть доступні найближчим часом");
});

