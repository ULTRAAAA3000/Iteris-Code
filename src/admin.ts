// Закрита сторінка /admin: аналітика для власника (воронка, реєстрації, активність, утримання). Дані дає /api/admin/stats.
// Для всіх інших API відповідає 404, тому сторінка показує «не знайдено». У пошуковики не потрапляє (noindex, немає в sitemap).
import { api } from "./auth.ts";
import { pl } from "./util.ts";

interface DayCount { day: string; count: number }
interface Stats {
  generatedAt: string;
  totals: { users: number; publicProfiles: number; reports: number };
  funnel: { registered: number; onboarded: number; firstLesson: number; firstTask: number; returned: number; habit: number };
  signups: DayCount[];
  dau: DayCount[];
  retention: { d1: { cohort: number; returned: number }; d7: { cohort: number; returned: number } };
}

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
    <p class="adm-note">Оновлено ${new Date(s.generatedAt).toLocaleString("uk-UA")}. Лише кількості: без пошт та імен.</p>`;
}

export async function mountAdmin(): Promise<void> {
  const el = document.getElementById("adm-body");
  if (!el) return;
  const r = await api<Stats>("/api/admin/stats");
  el.innerHTML = r.ok && r.data ? adminStatsHtml(r.data) : `<div class="card">Сторінку не знайдено.</div>`;
}
