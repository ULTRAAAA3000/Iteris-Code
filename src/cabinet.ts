// Картки кабінету Етапу 2: рівень і XP, серія з анімацією, календар із деталями дня, шлях.
// Модуль без залежності від auth.ts (лише HTML і DOM), щоб не створювати цикл імпортів.
import { allProjects, allTasks, C, darkText, projectMeta, taskMeta } from "./data.ts";
import { DEFAULT_GOAL, GOAL_TEXT, GOALS } from "./goal.ts";
import type { DashboardData } from "./types.ts";
import { esc, escA, pl, store } from "./util.ts";
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
  const i = levelInfo(d.xp ?? 0), maxTaskXp = Math.max(0, ...allTasks().map((t) => t.xp), ...allProjects().map((p) => p.xp));
  return `<section class="card lvl-card"><h3>Рівень</h3>
    <div class="lvl-row"><span class="lvl-badge" aria-hidden="true">${i.level}</span>
      <div><b class="lvl-xp">${i.total} XP</b><span class="dash-muted">До рівня ${i.level + 1}: ${i.need - i.into} XP</span></div></div>
    <div class="xp-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${i.need}" aria-valuenow="${i.into}" aria-label="Прогрес до наступного рівня"><i style="width:${i.pct}%"></i></div>
    <p class="dash-muted lvl-hint">Урок: +${LESSON_XP} XP · завдання: до +${maxTaskXp} XP · бонус за серію</p></section>`;
}

/** Серія під загрозою: вона є, а сьогодні ще не було жодного кроку. Новий день за UTC, тому дедлайн це найближча північ UTC у часі користувача.
 *  Крок «є», якщо в історії за сьогодні щось записано АБО сервер каже, що серію вже продовжено (повторне розв'язання серію продовжує, але нового запису в історії не лишає) */
export function streakRisk(streak: number, activity: Record<string, number> = {}, now: Date = new Date(), extendedToday = false): { risk: boolean; deadline: Date; at: string; left: string } {
  const deadline = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return {
    risk: streak > 0 && !extendedToday && (activity[utcKey(now)] || 0) === 0,
    deadline,
    at: deadline.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" }),
    left: eta(deadline.getTime() - now.getTime()),
  };
}

/** Заметна підказка вгорі кабінету: серія є, а сьогодні ще нічого не пройдено */
export function streakRiskCard(streak: number, activity: Record<string, number> | undefined, href: string, extendedToday = false): string {
  const r = streakRisk(streak, activity, new Date(), extendedToday);
  if (!r.risk) return "";
  return `<section class="card risk-banner" role="status" aria-live="polite"><span class="risk-ico" aria-hidden="true">🔥</span>
    <div class="risk-text"><b>Серія ${streak} ${pl(streak, "день", "дні", "днів")} сьогодні під загрозою</b>
      <p>Зробіть урок або завдання до ${r.at} (за вашим часом): лишилось ${r.left}. Тоді серія продовжиться.</p></div>
    <a class="btn primary small" href="${escA(href)}">Продовжити</a></section>`;
}

/** Картка «Ціль на сьогодні»: крапки-кроки, підказка, вибір цілі (клік обробляє stage2.ts) */
export function goalCard(d: DashboardData): string {
  const g = d.goal ?? { target: DEFAULT_GOAL, done: 0, custom: false };
  const left = Math.max(0, g.target - g.done), reached = left === 0;
  const dots = Array.from({ length: g.target }, (_, i) => `<i class="${i < g.done ? "on" : ""}" style="--i:${i}"></i>`).join("");
  const pick = GOALS.map((n) => `<button type="button" class="btn small${n === g.target ? " on" : ""}" data-goal="${n}" aria-pressed="${n === g.target}" title="${GOAL_TEXT[n]}">${n}</button>`).join("");
  return `<section class="card goal-card${reached ? " reached" : ""}"><h3>Ціль на сьогодні</h3>
    <div class="goal-row"><b class="goal-n">${g.done}</b><span>з ${g.target} ${pl(g.target, "кроку", "кроків", "кроків")}</span></div>
    <div class="goal-dots" role="progressbar" aria-valuemin="0" aria-valuemax="${g.target}" aria-valuenow="${Math.min(g.done, g.target)}" aria-label="Кроки за сьогодні">${dots}</div>
    <p class="dash-muted goal-msg">${reached ? "Ціль виконано, так тримати! ✓" : `Ще ${left} ${pl(left, "крок", "кроки", "кроків")}: урок або завдання, пройдені вперше.`}</p>
    <div class="goal-pick" role="group" aria-label="Змінити денну ціль"><span class="dash-muted">Ціль:</span>${pick}</div></section>`;
}

export function streakCard(streak: number, activity: Record<string, number> = {}, extendedToday = false): string {
  const today = new Date(), todayKey = utcKey(today), active = extendedToday || (activity[todayKey] || 0) > 0;
  const week = Array.from({ length: 7 }, (_, i) => { const x = new Date(today); x.setUTCDate(x.getUTCDate() - (6 - i)); return x; })
    .map((x, i) => { const k = utcKey(x); return `<li class="${(activity[k] || 0) > 0 ? "on" : ""}${k === todayKey ? " today" : ""}" style="--i:${i}" title="${k}"><span>${DAY[x.getUTCDay()]}</span><i></i></li>`; }).join("");
  const next = STREAK_MILESTONES.find((m) => m > streak);
  const risk = streakRisk(streak, activity, today, extendedToday);
  const msg = active ? "Сьогодні вже зараховано ✓" : streak ? `Серія під загрозою: зробіть урок або завдання до ${risk.at}, щоб не втратити серію.` : "Позначте урок пройденим, щоб почати серію.";
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
    <p><a class="btn primary small" href="/path/${k}">Відкрити шлях</a> <a class="btn small" href="/start">Змінити</a></p></section>`;
}

export function calendarCard(d: DashboardData): string {
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today); start.setUTCDate(start.getUTCDate() - 181);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));   // вирівнюємо за понеділком
  let cells = "", total = 0, n = 0, activeDays = 0, best = 0, run = 0, longest = 0, months = "";
  const todayK = utcKey(today);
  for (const x = new Date(start); x <= today; x.setUTCDate(x.getUTCDate() + 1), n++) {
    const key = utcKey(x), c = dayCount(d, key), w = Math.floor(n / 7);
    total += c.all;
    if (c.all) { activeDays++; run++; longest = Math.max(longest, run); best = Math.max(best, c.all); } else run = 0;
    if (x.getUTCDay() === 1 && x.getUTCDate() <= 7) { months += `<span style="grid-column:${w + 1}">${x.toLocaleDateString("uk-UA", { month: "short", timeZone: "UTC" })}</span>`; }
    const lv = c.all === 0 ? 0 : c.all === 1 ? 1 : c.all <= 3 ? 2 : c.all <= 5 ? 3 : 4;
    const label = `${dayLabel(key)}: ${c.all ? `${c.l} ${pl(c.l, "урок", "уроки", "уроків")}, ${c.t} ${pl(c.t, "завдання", "завдання", "завдань")}` : "без активності"}`;
    cells += `<i class="l${lv}${key === todayK ? " today" : ""}" style="--w:${w}" data-day="${key}" title="${escA(label)}" aria-label="${escA(label)}"${c.all ? ' role="button" tabindex="0"' : ""}></i>`;
  }
  return `<section class="card cal-card"><h3>Календар активності: ${total}</h3>
    <ul class="cal-sum"><li style="--i:0"><b class="cnt" data-to="${activeDays}">${activeDays}</b> ${pl(activeDays, "активний день", "активні дні", "активних днів")}</li><li style="--i:1">Найкращий день: <b class="cnt" data-to="${best}">${best}</b></li><li style="--i:2">Найдовша серія в календарі: <b class="cnt" data-to="${longest}">${longest}</b></li></ul>
    <div class="heat-wrap"><div class="heat-months" aria-hidden="true">${months}</div><div class="heat" data-days="${escA(JSON.stringify(d.days ?? {}))}">${cells}</div></div>
    <p class="legend dash-muted">Менше <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> Більше · натисніть на день, щоб побачити подробиці</p>
    <div class="day-detail" id="day-detail" aria-live="polite"><p class="dash-muted">Оберіть день, щоб побачити, що ви пройшли.</p></div></section>`;
}

function dayDetail(key: string, days: Record<string, { l: string[]; t: string[] }>): string {
  const x = days[key];
  if (!x || !(x.l.length + x.t.length)) return `<h4>${escA(dayLabel(key))}</h4><p class="dash-muted">У цей день активності не було.</p>`;
  const ls = x.l.map((id) => { const [k, n] = id.split("/"), l = C[k]?.L[+n - 1]; return l ? `<li><a href="/lesson/${k}/${n}">${escA(C[k].name)} · урок ${n}: ${escA(l.t)}</a></li>` : ""; }).join("");
  const ts = x.t.map((id) => { const pr = projectMeta(id), t = pr ?? taskMeta(id); return t ? `<li><a href="${pr ? "/project/" + escA(id) : "/lesson/" + (t as { lesson: string }).lesson}">${pr ? "📋" : "⚡"} ${escA(t.title)}</a></li>` : ""; }).join("");
  return `<h4>${escA(dayLabel(key))}</h4>
    <p><b>${x.l.length}</b> ${pl(x.l.length, "урок", "уроки", "уроків")} · <b>${x.t.length}</b> ${pl(x.t.length, "завдання", "завдання", "завдань")}</p><ul>${ls}${ts}</ul>`;
}

const reduced = (): boolean => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Оживляє кабінет: лічильник серії рахує вгору, день у календарі відкриває подробиці */
let shown = false;

/** Рахує число вгору до значення в data-to (кінцеве значення вже стоїть у тексті, тож без JS і при зменшеній анімації все правильно) */
function countUp(el: HTMLElement): void {
  const to = Number(el.dataset.to);
  if (!to || reduced() || el.dataset.run) return;
  el.dataset.run = "1";
  const t0 = performance.now(), dur = Math.min(1000, 300 + to * 30);
  const tick = (now: number): void => {
    const p = Math.min(1, (now - t0) / dur);
    el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
    if (p < 1 && el.isConnected) requestAnimationFrame(tick); else el.textContent = String(to);
  };
  el.textContent = "0";
  requestAnimationFrame(tick);
}

const FACT_SEEN = "ic-fact-seen";

/** Текст у зворотних лапках показуємо як код */
const withCode = (s: string): string => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
const eta = (ms: number): string => {
  const m = Math.max(1, Math.ceil(ms / 60000)), h = Math.floor(m / 60);
  return h ? `${h} год ${m % 60 ? (m % 60) + " хв" : ""}`.trim() : `${m} хв`;
};

/** Плашка «Цікавий факт» (або порада) про напрямок, який обрала людина. Нова з'являється раз на 5 годин; «Зрозуміло» ховає її до наступної */
export function factCard(d: DashboardData): string {
  const f = d.fact;
  if (!f || store.get<string>(FACT_SEEN, "") === f.id) return "";
  const c = C[f.lang];
  const left = Math.max(0, Date.parse(f.nextAt) - Date.now());
  return `<section class="card fact-card" data-fact="${escA(f.id)}" style="--fc:${c ? c.color : "var(--hl)"}" aria-label="${f.kind === "tip" ? "Корисна порада" : "Цікавий факт"}">
    <div class="fact-top"><span class="fact-kind">${f.kind === "tip" ? "Корисна порада" : "Цікавий факт"}</span><span class="fact-lang" style="${c ? darkText(f.lang) : ""}">${escA(c ? c.name : "Програмування")}</span></div>
    <p class="fact-text">${withCode(f.text)}</p>
    <div class="fact-foot"><span class="dash-muted">Наступний за ${eta(left)}</span><button class="btn small" type="button" data-fact-ok>Зрозуміло</button></div>
  </section>`;
}

export function mountCabinet(): void {
  const fact = document.querySelector<HTMLElement>(".fact-card");
  fact?.querySelector("[data-fact-ok]")?.addEventListener("click", () => { store.set(FACT_SEEN, fact.dataset.fact ?? ""); fact.remove(); });
  document.querySelectorAll<HTMLElement>(".dash .cnt[data-to]").forEach(countUp);
  // Вступна анімація карток грає один раз за відвідування: після перемальовування (нове XP) картки не «стрибають» знову
  if (shown) document.querySelector(".dash")?.classList.add("again"); else shown = true;
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
