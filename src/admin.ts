// Закрита сторінка /admin: аналітика для власника (воронка, реєстрації, активність, утримання) і список акаунтів із поштами.
// Дані дають /api/admin/stats (лише кількості) і /api/admin/users (персональні дані, лише адміну).
// Для всіх інших API відповідає 404, тому сторінка показує «не знайдено». У пошуковики не потрапляє (noindex, немає в sitemap).
import { api } from "./auth.ts";
import { escA, pl } from "./util.ts";

interface DayCount { day: string; count: number }
interface Stats {
  generatedAt: string;
  totals: { users: number; publicProfiles: number; reports: number };
  funnel: { registered: number; onboarded: number; firstLesson: number; firstTask: number; returned: number; habit: number };
  signups: DayCount[];
  dau: DayCount[];
  retention: { d1: { cohort: number; returned: number }; d7: { cohort: number; returned: number } };
}

interface AdminUser {
  email: string; name: string | null; nick: string | null; createdAt: string | null; lastActiveAt: string | null;
  method: "password" | "social"; verified: boolean;
}
interface UsersPage { total: number; users: AdminUser[] }

export const adminHtml = (): string => `<h1 class="adm-h">Аналітика</h1><div id="adm-body" class="adm"><div class="card">Завантаження…</div></div>`;

const pct = (a: number, b: number): string => (b ? Math.round((a / b) * 100) + "%" : "—");

const bars = (rows: DayCount[]): string => {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return `<div class="adm-bars" role="img" aria-label="Графік по днях">${rows.map((r, i) =>
    `<div class="adm-bar" title="${r.day}: ${r.count}"><i style="height:${Math.max(r.count ? 4 : 1, Math.round((r.count / max) * 100))}%"></i><span>${i % 5 === 0 || i === rows.length - 1 ? r.day.slice(8) : ""}</span></div>`).join("")}</div>`;
};

export function adminStatsHtml(s: Stats): string {
  const f = s.funnel;
  const steps: [string, number][] = [
    ["Зареєструвались", f.registered],
    ["Налаштували шлях (онбординг)", f.onboarded],
    ["Пройшли перший урок", f.firstLesson],
    ["Склали перше завдання", f.firstTask],
    ["Повернулись у інший день", f.returned],
    ["Були активні 7+ днів", f.habit],
  ];
  const ret = (label: string, r: { cohort: number; returned: number }): string =>
    `<div class="adm-ret"><b>${pct(r.returned, r.cohort)}</b><span>${label}</span><small>${r.returned} із ${r.cohort}${r.cohort < 20 ? ", мало даних" : ""}</small></div>`;
  return `
    <div class="adm-grid">
      <div class="card adm-tot"><b>${s.totals.users}</b><span>${pl(s.totals.users, "акаунт", "акаунти", "акаунтів")}</span></div>
      <div class="card adm-tot"><b>${s.totals.publicProfiles}</b><span>відкритих профілів</span></div>
      <div class="card adm-tot"><b>${s.totals.reports}</b><span>скарг на профілі</span></div>
    </div>
    <section class="card"><h2>Воронка</h2>
      ${steps.map(([l, n]) => `<div class="adm-step"><div class="adm-row"><span>${l}</span><b>${n} <small>${pct(n, f.registered)}</small></b></div><div class="adm-track"><i style="width:${f.registered ? Math.max(1, Math.round((n / f.registered) * 100)) : 0}%"></i></div></div>`).join("")}
    </section>
    <section class="card"><h2>Утримання</h2><div class="adm-rets">${ret("повернулись наступного дня (D1)", s.retention.d1)}${ret("повернулись через 7 днів (D7)", s.retention.d7)}</div>
      <p class="adm-note">Рахуємо людей, зареєстрованих не пізніше за відповідний термін. Активність: урок, завдання або XP.</p></section>
    <section class="card"><h2>Реєстрації за 30 днів</h2>${bars(s.signups)}</section>
    <section class="card"><h2>Активні за день (14 днів)</h2>${bars(s.dau)}</section>
    <p class="adm-note">Оновлено ${new Date(s.generatedAt).toLocaleString("uk-UA")}. Зведення вище містить лише кількості.</p>`;
}

const dateOf = (s: string | null): string => {
  if (!s) return "—";
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("uk-UA");
};

/** Усі значення від користувачів (пошта, ім'я, нік) екрануємо: ім'я може містити розмітку */
export const userRowHtml = (u: AdminUser): string =>
  `<tr><td class="adm-email">${escA(u.email)}</td><td>${escA(u.name) || "—"}</td><td>${u.nick ? escA(u.nick) : "—"}</td>`
  + `<td>${u.method === "password" ? "Пошта й пароль" : "Google / GitHub"}</td>`
  + `<td>${u.verified ? "так" : "<b>ні</b>"}</td><td>${dateOf(u.createdAt)}</td><td>${dateOf(u.lastActiveAt)}</td></tr>`;

export const usersSectionHtml = (): string => `
  <section class="card" id="adm-users"><h2>Акаунти</h2>
    <input id="adm-q" class="adm-q" type="search" placeholder="Пошук за поштою, ім'ям або ніком" autocomplete="off" maxlength="100" aria-label="Пошук акаунтів">
    <div class="adm-tbl-wrap"><table class="adm-tbl"><thead><tr><th>Пошта</th><th>Ім'я</th><th>Нік</th><th>Вхід</th><th>Пошта підтверджена</th><th>Реєстрація</th><th>Остання активність</th></tr></thead><tbody id="adm-rows"></tbody></table></div>
    <p class="adm-note" id="adm-count">Завантаження…</p>
    <button type="button" class="btn small" id="adm-more" style="display:none">Показати ще</button>
  </section>`;

async function mountUsers(root: HTMLElement): Promise<void> {
  const rows = root.querySelector<HTMLElement>("#adm-rows");
  const count = root.querySelector<HTMLElement>("#adm-count");
  const more = root.querySelector<HTMLButtonElement>("#adm-more");
  const input = root.querySelector<HTMLInputElement>("#adm-q");
  if (!rows || !count || !more || !input) return;
  let q = "", shown = 0, token = 0;
  const load = async (reset: boolean): Promise<void> => {
    const mine = ++token;   // відповідь на застарілий пошук ігноруємо
    if (reset) { shown = 0; rows.innerHTML = ""; more.style.display = "none"; count.textContent = "Завантаження…"; }
    const r = await api<UsersPage>(`/api/admin/users?q=${encodeURIComponent(q)}&offset=${shown}`);
    if (mine !== token) return;
    if (!r.ok || !r.data) { count.textContent = "Не вдалося завантажити список акаунтів."; return; }
    rows.insertAdjacentHTML("beforeend", r.data.users.map(userRowHtml).join(""));
    shown += r.data.users.length;
    count.textContent = r.data.total ? `Показано ${shown} із ${r.data.total}` : "Нікого не знайдено.";
    more.style.display = shown < r.data.total ? "" : "none";
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => { q = input.value.trim(); void load(true); }, 300); });
  more.addEventListener("click", () => { void load(false); });
  await load(true);
}

export async function mountAdmin(): Promise<void> {
  const el = document.getElementById("adm-body");
  if (!el) return;
  const r = await api<Stats>("/api/admin/stats");
  if (!(r.ok && r.data)) { el.innerHTML = `<div class="card">Сторінку не знайдено.</div>`; return; }
  el.innerHTML = adminStatsHtml(r.data) + usersSectionHtml();
  await mountUsers(el);
}
