// Картки кабінету Етапу 2: рівень і XP, серія з анімацією, календар із деталями дня, шлях.
// Модуль без залежності від auth.ts (лише HTML і DOM), щоб не створювати цикл імпортів.
import { allTasks, C, taskMeta } from "./data.ts";
import type { DashboardData } from "./types.ts";
import { escA, pl } from "./util.ts";
import { currentLesson, LESSON_XP, levelInfo, STREAK_BONUS, STREAK_MILESTONES } from "./xp.ts";
import { LEVEL_TEXT, startPoint } from "./onboarding.ts";

const DAY = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const utcKey = (d: Date): string => d.toISOString().slice(0, 10);
const dayLabel = (key: string): string => new Date(key + "T00:00:00Z").toLocaleDateString("uk-UA", { day: "numeric", month: "long", timeZone: "UTC" });
const dayCount = (d: DashboardData, key: string): { l: number; t: number; all: number } => {
  const x = d.days?.[key];
  return x ? { l: x.l.length, t: x.t.length, all: x.l.length + x.t.length } : { l: 0, t: 0, all: d.activity?.[key] || 0 };
};

export function levelCard(d: DashboardData): string {
  const i = levelInfo(d.xp ?? 0), maxTaskXp = Math.max(0, ...allTasks().map((t) => t.xp));
  return `<section class="card lvl-card"><h3>Рівень</h3>
    <div class="lvl-row"><span class="lvl-badge" aria-hidden="true">${i.level}</span>
      <div><b class="lvl-xp">${i.total} XP</b><span class="dash-muted">До рівня ${i.level + 1}: ${i.need - i.into} XP</span></div></div>
    <div class="xp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${i.need}" aria-valuenow="${i.into}" aria-label="Прогрес до наступного рівня"><i style="width:${i.pct}%"></i></div>
    <p class="dash-muted lvl-hint">Урок: +${LESSON_XP} XP · завдання: до +${maxTaskXp} XP · бонус за серію</p></section>`;
}

export function streakCard(streak: number, activity: Record<string, number> = {}): string {
  const today = new Date(), todayKey = utcKey(today), active = (activity[todayKey] || 0) > 0;
  const week = Array.from({ length: 7 }, (_, i) => { const x = new Date(today); x.setUTCDate(x.getUTCDate() - (6 - i)); return x; })
    .map((x) => { const k = utcKey(x); return `<li class="${(activity[k] || 0) > 0 ? "on" : ""}${k === todayKey ? " today" : ""}" title="${k}"><span>${DAY[x.getUTCDay()]}</span><i></i></li>`; }).join("");
  const next = STREAK_MILESTONES.find((m) => m > streak);
  const msg = active ? "Сьогодні вже зараховано ✓" : streak ? "Зробіть урок або завдання сьогодні, щоб не втратити серію." : "Позначте урок пройденим, щоб почати серію.";
  return `<section class="card streak-card"><h3>Серія занять</h3>
    <div class="streak2"><span class="flame ${active ? "lit" : "dim"}" aria-hidden="true">🔥</span><b class="streak-n" data-to="${streak}">${streak}</b><span>${pl(streak, "день", "дні", "днів")} поспіль</span></div>
    <ol class="week" aria-label="Останні 7 днів">${week}</ol>
    <p class="dash-muted">${msg}</p>
    ${next ? `<p class="next-bonus">До нагороди: ${next - streak} ${pl(next - streak, "день", "дні", "днів")} (+${STREAK_BONUS[next]} XP)</p>` : ""}
    <p class="dash-muted tz">Новий день починається о 00:00 за UTC</p></section>`;
}

export function pathCard(d: DashboardData, set: Set<string>): string {
  const o = d.onboarding;
  if (!o || !o.courses.length) return "";
  const k = o.courses.find((x) => C[x]);
  if (!k) return "";
  const L = C[k].L, [start, ch] = startPoint(k, o.level);
  const cur = currentLesson(L.length, start, (n) => set.has(k + "/" + n));
  return `<section class="card path-card"><h3>Ваш шлях</h3>
    <p class="dash-muted">${escA(C[k].name)} · ${LEVEL_TEXT[o.level][0]} · старт: «${escA(ch)}»</p>
    <p class="dash-focus">${cur ? `Далі: урок ${cur}, ${escA(L[cur - 1].t)}` : "Курс пройдено"}</p>
    <p><a class="btn primary small" href="#/path/${k}">Відкрити шлях</a> <a class="btn small" href="#/start">Змінити</a></p></section>`;
}

export function calendarCard(d: DashboardData): string {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today); start.setUTCDate(start.getUTCDate() - 181);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));   // вирівнюємо за понеділком
  let cells = "", total = 0;
  for (const x = new Date(start); x <= today; x.setUTCDate(x.getUTCDate() + 1)) {
    const key = utcKey(x), c = dayCount(d, key);
    total += c.all;
    const lv = c.all === 0 ? 0 : c.all === 1 ? 1 : c.all <= 3 ? 2 : c.all <= 5 ? 3 : 4;
    const label = `${dayLabel(key)}: ${c.all ? `${c.l} ${pl(c.l, "урок", "уроки", "уроків")}, ${c.t} ${pl(c.t, "завдання", "завдання", "завдань")}` : "без активності"}`;
    cells += `<i class="l${lv}" data-day="${key}" title="${escA(label)}" aria-label="${escA(label)}"${c.all ? ' role="button" tabindex="0"' : ""}></i>`;
  }
  return `<section class="card cal-card"><h3>Календар активності: ${total}</h3>
    <div class="heat-wrap"><div class="heat" data-days="${escA(JSON.stringify(d.days ?? {}))}">${cells}</div></div>
    <p class="legend dash-muted">Менше <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> Більше · натисніть на день, щоб побачити подробиці</p>
    <div class="day-detail" id="day-detail" aria-live="polite"><p class="dash-muted">Оберіть день, щоб побачити, що ви пройшли.</p></div></section>`;
}

function dayDetail(key: string, days: Record<string, { l: string[]; t: string[] }>): string {
  const x = days[key];
  if (!x || !(x.l.length + x.t.length)) return `<h4>${escA(dayLabel(key))}</h4><p class="dash-muted">У цей день активності не було.</p>`;
  const ls = x.l.map((id) => { const [k, n] = id.split("/"), l = C[k]?.L[+n - 1]; return l ? `<li><a href="#/lesson/${k}/${n}">${escA(C[k].name)} · урок ${n}: ${escA(l.t)}</a></li>` : ""; }).join("");
  const ts = x.t.map((id) => { const t = taskMeta(id); return t ? `<li><a href="#/lesson/${t.lesson}">⚡ ${escA(t.title)}</a></li>` : ""; }).join("");
  return `<h4>${escA(dayLabel(key))}</h4>
    <p><b>${x.l.length}</b> ${pl(x.l.length, "урок", "уроки", "уроків")} · <b>${x.t.length}</b> ${pl(x.t.length, "завдання", "завдання", "завдань")}</p><ul>${ls}${ts}</ul>`;
}

const reduced = (): boolean => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Оживляє кабінет: лічильник серії рахує вгору, день у календарі відкриває подробиці */
export function mountCabinet(): void {
  const n = document.querySelector<HTMLElement>(".streak-n");
  const to = n ? Number(n.dataset.to) : 0;
  if (n && to > 0 && !reduced() && !n.dataset.run) {
    n.dataset.run = "1";
    const t0 = performance.now(), dur = Math.min(900, 250 + to * 40);
    const tick = (now: number): void => {
      const p = Math.min(1, (now - t0) / dur);
      n.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1 && n.isConnected) requestAnimationFrame(tick); else n.textContent = String(to);
    };
    n.textContent = "0";
    requestAnimationFrame(tick);
  }
  const heat = document.querySelector<HTMLElement>(".heat[data-days]"), panel = document.getElementById("day-detail");
  if (!heat || !panel) return;
  let days: Record<string, { l: string[]; t: string[] }> = {};
  try { days = JSON.parse(heat.dataset.days || "{}"); } catch { /* порожній календар */ }
  const open = (cell: HTMLElement): void => {
    const key = cell.dataset.day;
    if (!key) return;
    heat.querySelector(".sel")?.classList.remove("sel");
    cell.classList.add("sel");
    panel.innerHTML = dayDetail(key, days);
  };
  heat.addEventListener("click", (e) => { const c = (e.target as HTMLElement).closest<HTMLElement>("i[data-day]"); if (c) open(c); });
  heat.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { const c = (e.target as HTMLElement).closest<HTMLElement>("i[data-day]"); if (c) { e.preventDefault(); open(c); } } });
}
