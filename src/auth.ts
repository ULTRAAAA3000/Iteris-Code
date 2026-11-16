// Особистий кабінет: вхід через Google і GitHub, синхронізація прогресу, дашборд (/dashboard)
import { allTasks, C, lessonTotal, taskMeta } from "./data.ts";
import { clearContent, loadOutline, outlineLoaded } from "./content.ts";
import { done, isDone, persist } from "./progress.ts";
import { projectById } from "./projects/index.ts";
import { toast, ui } from "./ui.ts";
import { navigate, pathOf } from "./router.ts";
import type { DashboardData, PublicUser } from "./types.ts";
import { calendarCard, levelCard, pathCard, streakCard } from "./cabinet.ts";
import { activityCard, avatarRing, greeting, heroChips, heroFx, medalsCard, radarCard, ring } from "./dashviz.ts";
import { onboardingHtml, setOnboarding } from "./onboarding.ts";
import { escA, pl } from "./util.ts";

type DashState = DashboardData | { error: true } | null;
const st: { user: PublicUser | null; ready: boolean; dash: DashState; loading: boolean; clientId: string | null; githubId: string | null; siteKey: string | null; mail: boolean } = { user: null, ready: false, dash: null, loading: false, clientId: null, githubId: null, siteKey: null, mail: false };

const GROUPS = [
  { t: "Frontend", courses: ["html", "css", "js", "ts"] },
  { t: "Server & Backend", courses: ["python", "go", "java", "php"] },
  { t: "Бази даних", courses: ["sql"] },
  { t: "Інструменти розробника", courses: ["git", "bash"] },
  { t: "Основи мов", courses: ["cpp", "pascal"] },
] as const;
const SHORT: Record<string, string> = { "Server & Backend": "Backend", "Інструменти розробника": "Інструменти" };   // короткі підписи осей радара
const FOCUS_ORDER = ["python", "html", "js", "sql", "git", "go", "java", "php", "ts", "css", "bash", "cpp", "pascal"];

const safeImg = (u: string | null | undefined): string => (typeof u === "string" && /^https:\/\//.test(u) ? u : "");
const fmtDate = (s: string): string => {
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("uk-UA");
};

interface ApiResult<T> { ok: boolean; status: number; data: T | null }
export async function api<T = unknown>(path: string, opts: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const r = await fetch(path, { credentials: "same-origin", ...opts });
    let data: T | null = null;
    try { data = (await r.json()) as T; } catch { /* порожня відповідь */ }
    if (r.ok && opts.method === "POST" && path.startsWith("/api/progress")) document.dispatchEvent(new Event("ic:progress"));   // Етап 2: після дії прогресу нараховується XP
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}
export const post = <T = unknown>(path: string, body: unknown = {}) =>
  api<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const avatar = (u: PublicUser, big = false): string =>
  safeImg(u.avatarUrl)
    ? `<img class="avatar${big ? " big" : ""}" src="${escA(safeImg(u.avatarUrl))}" alt="" referrerpolicy="no-referrer">`
    : `<span class="avatar${big ? " big" : ""}"></span>`;

export const getUser = (): PublicUser | null => st.user;
export const invalidate = (): void => { st.dash = null; };

export const isReady = (): boolean => st.ready;
export const getAuthConfig = (): { clientId: string | null; githubId: string | null; siteKey: string | null; mail: boolean } => ({ clientId: st.clientId, githubId: st.githubId, siteKey: st.siteKey, mail: st.mail });

// Форма входу за поштою є завжди; Google, Turnstile і листи з'являються в ній лише коли налаштовані на сервері
const loginBtn = (cls: string, label: string): string => `<button class="${cls}" data-act="login">${label}</button>`;

export function updateHeader(): void {
  // Пункти навігації з data-auth (наприклад «Шлях») бачать лише зареєстровані користувачі
  document.querySelectorAll<HTMLElement>("#nav [data-auth]").forEach((a) => { a.hidden = !st.user; });
  const el = document.getElementById("acct");
  if (!el) return;
  if (!st.ready) { el.innerHTML = ""; return; }
  el.innerHTML = st.user
    ? `<a class="acct-user" href="/dashboard" title="Особистий кабінет">${avatar(st.user)}<span>${escA(st.user.name || st.user.email)}</span></a>`
    : loginBtn("btn small", "Увійти");
}

/** Випадковий state для входу через зовнішній сервіс; зберігається в сесії браузера й перевіряється при поверненні */
function newState(prefix = ""): string | null {
  const s = prefix + Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
  try { sessionStorage.setItem("ic-oauth-state", s); } catch { toast("Браузер блокує сховище, тому вхід неможливий"); return null; }
  return s;
}

export function loginGithub(): void {
  const id = st.githubId;
  const s = id && newState("gh.");
  if (!id || !s) return;
  location.href = "https://github.com/login/oauth/authorize?" + new URLSearchParams({ client_id: id, redirect_uri: location.origin + "/", scope: "read:user user:email", state: s });
}

export function loginGoogle(): void {
  const id = st.clientId;
  const s = id && newState();
  if (!id || !s) return;
  location.href = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
    client_id: id, redirect_uri: location.origin + "/", response_type: "code",
    scope: "openid email profile", state: s, prompt: "select_account",
  });
}

// Кнопка «Увійти» відкриває форму входу
function openLogin(): void {
  navigate("/login");
}

// Після успішного входу за поштою: підтягуємо користувача, зливаємо прогрес і відкриваємо кабінет
export async function completeSignIn(): Promise<void> {
  const r = await api<{ user: PublicUser | null }>("/api/me");
  st.user = r.ok && r.data ? r.data.user : null;
  if (st.user) { await loadOutline(); await syncLocal(); }   // уроки приходять лише після входу
  updateHeader();
  ui.notifyAuth();
  navigate("/dashboard");
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
  const gh = saved.startsWith("gh.");   // GitHub й Google повертаються на ту саму адресу; відрізняє їх префікс state
  const r = await post(gh ? "/api/auth/github" : "/api/auth/google", { code });
  if (!r.ok) return toast(gh ? "Не вдалося увійти через GitHub" : "Не вдалося увійти через Google");
  navigate("/dashboard");
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
/** proof: підпис сервера з /api/run; потрібен для завдань, які запускає сервер (Go та ін.) */
export async function completeTask(taskId: string, code: string, proof?: string): Promise<CompleteResult> {
  const r = await post<{ streak: number; firstSolve: boolean; xp: number }>("/api/progress/complete", { taskId, code, passed: true, proof });
  if (r.ok && r.data && st.user) st.user.streak = r.data.streak;
  st.dash = null;
  return { ok: r.ok, status: r.status, ...(r.data ?? {}) };
}

async function startCheckout(): Promise<void> {
  if (!st.user) return openLogin();
  const r = await post<{ url?: string }>("/api/billing/checkout");
  if (r.ok && r.data?.url) { location.href = r.data.url; return; }
  toast(r.status === 503 ? "Оплату ще не налаштовано. Спробуйте пізніше" : "Не вдалося перейти до оплати. Спробуйте ще раз");
}

async function openPortal(): Promise<void> {
  const r = await api<{ url?: string }>("/api/billing/portal");
  if (r.ok && r.data?.url) window.open(r.data.url, "_blank", "noopener");
  else toast("Керування підпискою поки недоступне. Якщо ви щойно оплатили, зачекайте хвилину й оновіть кабінет");
}

async function logout(): Promise<void> {
  await post("/api/auth/logout");
  st.user = null; st.dash = null;
  clearContent();
  updateHeader();
  ui.notifyAuth();
  navigate("/");
}

export async function init(): Promise<void> {
  await handleCallback();
  const [cfg, r] = await Promise.all([api<{ clientId: string | null; githubClientId?: string | null; turnstileSiteKey: string | null; mail: boolean }>("/api/auth/config"), api<{ user: PublicUser | null }>("/api/me")]);
  st.clientId = cfg.ok && typeof cfg.data?.clientId === "string" && cfg.data.clientId ? cfg.data.clientId : null;
  st.githubId = cfg.ok && typeof cfg.data?.githubClientId === "string" && cfg.data.githubClientId ? cfg.data.githubClientId : null;
  st.siteKey = cfg.ok && typeof cfg.data?.turnstileSiteKey === "string" && cfg.data.turnstileSiteKey ? cfg.data.turnstileSiteKey : null;
  st.mail = cfg.ok && cfg.data?.mail === true;
  st.user = r.ok && r.data ? r.data.user : null;
  if (st.user) { await loadOutline(); await syncLocal(); }
  st.ready = true;
  updateHeader();
  ui.notifyAuth();
  if (/^(dashboard|login|register|forgot|reset|verify|start|path|course|lesson|project)(\/|$)/.test(pathOf())) ui.render();
}

async function loadDash(): Promise<void> {
  if (st.loading) return;
  st.loading = true;
  const r = await api<DashboardData>("/api/dashboard");
  st.loading = false;
  if (r.status === 401) { st.user = null; st.dash = null; clearContent(); updateHeader(); }
  else {
    st.dash = r.ok && r.data ? r.data : { error: true };
    if (r.ok && r.data && st.user) { st.user = r.data.user; updateHeader(); ui.notifyAuth(); }   // статус Pro міг змінитися після оплати
  }
  if (pathOf() === "dashboard") ui.render();
}

/* ---------- Дашборд ---------- */
const skeleton = `<div class="card dash-guest" aria-busy="true" aria-label="Завантаження кабінету"><i class="sk h"></i><i class="sk"></i><i class="sk"></i><i class="sk s"></i></div>`;
const guestCard = (): string => `<div class="card dash-guest"><h1>Особистий кабінет</h1>
    <p>Увійдіть, щоб зберігати прогрес на всіх пристроях, бачити серію занять і карту навичок.</p>
    ${loginBtn("btn primary", "Увійти")}</div>`;
const errorCard = (act = "retry"): string => `<div class="card dash-guest"><h1>Не вдалося завантажити кабінет</h1>
    <p>Перевірте з'єднання та спробуйте ще раз.</p><button class="btn primary" data-act="${act}">Спробувати ще раз</button></div>`;

/** Який урок показати в «Продовжити навчання»: спершу курси, які користувач обрав на старті (у порядку вибору), потім останній пройдений, потім стандартний порядок */
function focusLesson(set: Set<string>, last: string | null, chosen: string[] = []): [string, number] | null {
  const has = (k: string, n: number) => set.has(k + "/" + n);
  const first = (k: string): number => { for (let n = 1; n <= C[k].L.length; n++) if (!has(k, n)) return n; return 0; };
  const mine = chosen.filter((k) => C[k]);
  if (last) {
    const [lk, ln] = [last.split("/")[0], +last.split("/")[1]];
    // Останній урок у обраному курсі (або курси не обирали): продовжуємо одразу після нього. Інакше обраний курс важливіший за випадковий урок з іншого
    if (C[lk] && (!mine.length || mine.includes(lk))) {
      let m = 0;
      for (let i = ln + 1; i <= C[lk].L.length && !m; i++) if (!has(lk, i)) m = i;
      if (!m) m = first(lk);
      if (m) return [lk, m];
    }
  }
  for (const k of mine) { const m = first(k); if (m) return [k, m]; }
  if (last) {
    const lk = last.split("/")[0];
    if (C[lk]) { const m = first(lk); if (m) return [lk, m]; }
  }
  for (const k of FOCUS_ORDER) if (C[k]) { const m = first(k); if (m) return [k, m]; }
  return null;
}

function full(d: DashboardData): string {
  setOnboarding(d.onboarding);
  if (d.onboarding === null) return onboardingHtml();   // перший вхід: спершу вибір курсів і рівня
  const u = d.user;
  const set = new Set(d.completedLessons.filter((id) => { const [k, n] = id.split("/"); return C[k] && +n >= 1 && +n <= C[k].L.length; }));
  const passed = new Set(d.passedTasks);
  const doneIn = (k: string): number => C[k].L.filter((_, i) => set.has(k + "/" + (i + 1))).length;
  const f = focusLesson(set, d.lastLesson, d.onboarding?.courses ?? []);
  const focus = f
    ? `<h3>Продовжити навчання</h3><p class="dash-muted">${escA(C[f[0]].name)} · ${escA(C[f[0]].L[f[1] - 1].ch || "")}</p>
         <p class="dash-focus">Урок ${f[1]}: ${escA(C[f[0]].L[f[1] - 1].t)}</p>
         <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${C[f[0]].L.length}" aria-valuenow="${doneIn(f[0])}"><i style="width:${Math.round((doneIn(f[0]) / C[f[0]].L.length) * 100)}%"></i></div>
         <p class="dash-cta"><a class="btn primary small" href="/lesson/${f[0]}/${f[1]}">Продовжити</a></p>`
    : `<h3>Усі курси пройдено</h3><p class="dash-muted">Вітаємо! Скоро тут з'являться нові практичні завдання.</p>`;
  const skills = GROUPS.map((g) => {
    const ks = g.courses.filter((k) => C[k]);
    const tot = ks.reduce((s, k) => s + C[k].L.length, 0), dn = ks.reduce((s, k) => s + doneIn(k), 0), pct = tot ? Math.round((dn / tot) * 100) : 0;
    const gt = allTasks().filter((t) => (ks as readonly string[]).includes(t.course)), gp = gt.filter((t) => passed.has(t.id)).length;
    return `<div class="card skill"><h3><span>${escA(g.t)}</span><span>${pct}%</span></h3>
        <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${escA(g.t)}"><i style="width:${pct}%"></i></div>
        <ul>${ks.map((k) => `<li><a href="/course/${k}">${escA(C[k].name)}</a><span>${doneIn(k)}/${C[k].L.length}</span></li>`).join("")}</ul>
        <p class="locked">Теорія: ${pct}% · Практика: ${gt.length ? `${gp}/${gt.length}` : "скоро"}</p></div>`;
  }).join("");
  const lessonsPct = Math.round((set.size / (lessonTotal() || 1)) * 100);
  const tasksPct = allTasks().length ? Math.round((d.tasksPassed / allTasks().length) * 100) : 0;
  const radarItems = GROUPS.map((g) => {
    const ks = g.courses.filter((k) => C[k]);
    const tot = ks.reduce((s, k) => s + C[k].L.length, 0), dn = ks.reduce((s, k) => s + doneIn(k), 0);
    return { t: SHORT[g.t] ?? g.t, pct: tot ? Math.round((dn / tot) * 100) : 0 };
  });
  const subs = d.recentSubmissions.length
    ? `<ul class="subs">${d.recentSubmissions.map((s) => `<li><span class="${s.passed ? "s-ok" : "s-fail"}">${s.passed ? "Пройдено" : "Не пройдено"}</span><span>${escA((projectById(s.taskId) ?? taskMeta(s.taskId))?.title ?? s.taskId)}</span><span class="dash-muted">${escA(fmtDate(s.at))}</span></li>`).join("")}</ul>`
    : `<p class="dash-muted">Поки що немає розв'язаних завдань. Вони з'являться тут, коли ви почнете практику.</p>`;
  const plan = u.isPro
    ? `<span class="plan pro">Pro</span> <span class="dash-muted">${u.proUntil ? "до " + escA(fmtDate(u.proUntil)) : ""}</span> <button class="btn small" data-act="manage">Керування підпискою</button>`
    : `<span class="plan free">Free</span> <button class="btn primary small" data-act="upgrade">Перейти на Pro за $5</button> <button class="btn small" data-act="retry">Оновити статус</button>`;
  return `<div class="dash">
      <section class="card dash-head dash-hero">${heroFx()}${avatarRing(avatar(u, true), d.xp ?? 0)}
        <div class="grow"><span class="hero-hi">${greeting()}</span><h1>${escA(u.name || "Користувач")}</h1><p>${escA(u.email)}</p><p class="plan-row">${plan}</p>${heroChips(d.xp ?? 0, u.streak, set.size)}</div>
        <button class="btn small" data-act="logout">Вийти</button></section>
      <div class="dash-grid">
        <section class="card">${focus}</section>
        ${levelCard(d)}
        ${streakCard(u.streak, d.activity)}
        <section class="card"><h3>Підсумки</h3><div class="stats3">
          <div><i class="srg">${ring(lessonsPct)}</i><strong>${set.size}</strong><span>${pl(set.size, "урок", "уроки", "уроків")}</span></div>
          <div><i class="srg">${ring(tasksPct, "ok")}</i><strong>${d.tasksPassed}</strong><span>${pl(d.tasksPassed, "завдання", "завдання", "завдань")}</span></div>
          <div><i class="srg">${ring(lessonsPct, "vio")}</i><strong>${lessonsPct}%</strong><span>теорії</span></div></div></section>
        ${pathCard(d, set)}
      </div>
      <div class="dash-grid viz-grid">
        ${activityCard(d.activity)}
        ${radarCard(radarItems)}
        ${medalsCard(u.streak)}
      </div>
      <section><h2 class="section-title">Карта навичок</h2><div class="skills">${skills}</div></section>
      ${calendarCard(d)}
      <div class="dash-grid">
        <section class="card"><h3>Останні відповіді</h3>${subs}</section>
        <section class="card"><h3>Наскрізні проєкти</h3><p class="dash-muted">Mini-SaaS і API-сервіси з'являться тут разом із посиланням, яким можна поділитися.</p><button class="btn small" disabled>Скоро</button></section>
      </div></div>`;
}

export function renderDashboard(): string {
  if (!st.ready) return skeleton;
  if (!st.user) return guestCard();
  if (!outlineLoaded()) return errorCard("retry-outline");
  if (!st.dash) { void loadDash(); return skeleton; }
  return "error" in st.dash ? errorCard() : full(st.dash);
}

document.addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-act]");
  if (!b) return;
  const a = b.dataset.act;
  if (a === "login") openLogin();
  else if (a === "google") loginGoogle();
  else if (a === "github") loginGithub();
  else if (a === "logout") void logout();
  else if (a === "retry") { st.dash = null; ui.render(); }
  else if (a === "retry-outline") void loadOutline().then(() => { st.dash = null; ui.render(); });
  else if (a === "upgrade") void startCheckout();
  else if (a === "manage") void openPortal();
});

