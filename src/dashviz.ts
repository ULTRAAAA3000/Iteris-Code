// Візуалізації кабінету: кільця прогресу, радар навичок, графік активності, нагороди за серію, вітання.
// Лише HTML-рядки без залежності від DOM і auth.ts (щоб не створювати цикл імпортів). Анімації описані в stage2.css.
import { escA, pl } from "./util.ts";
import { levelInfo, STREAK_BONUS, STREAK_MILESTONES } from "./xp.ts";

const DAY = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const utcKey = (d: Date): string => d.toISOString().slice(0, 10);
const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

/** Кільце прогресу 0–100 (SVG, pathLength=100: довжина дуги дорівнює відсоткам). Колір задає клас: ok, vio */
export function ring(pct: number, cls = ""): string {
  const p = clamp(pct);
  return `<svg class="rg ${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle class="trk" cx="50" cy="50" r="44"/>${p > 0 ? `<circle class="val" cx="50" cy="50" r="44" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${100 - p}"/>` : ""}</svg>`;
}

/** Привітання за місцевим часом користувача */
export function greeting(now = new Date()): string {
  const h = now.getHours();
  return h < 5 ? "Доброї ночі" : h < 12 ? "Доброго ранку" : h < 18 ? "Доброго дня" : "Доброго вечора";
}

/** Аватар у кільці прогресу до наступного рівня, із позначкою рівня */
export function avatarRing(avatarHtml: string, xp: number): string {
  const i = levelInfo(xp);
  return `<div class="ava-ring" title="Рівень ${i.level}: ${i.into} з ${i.need} XP">${ring(i.pct)}${avatarHtml}<span class="ava-lvl" aria-label="Рівень ${i.level}">${i.level}</span></div>`;
}

/** Плаваючі символи коду на фоні банера (декор, для екранних читалок прихований) */
export const heroFx = (): string =>
  `<div class="hero-fx" aria-hidden="true">${["{ }", "</>", "( )", "=>", "[ ]", ";"].map((s, i) => `<span style="--i:${i};--j:${i % 3}">${s}</span>`).join("")}</div>`;

/** Підсумок у банері: рівень, XP, серія, уроки */
export function heroChips(xp: number, streak: number, lessons: number): string {
  const i = levelInfo(xp);
  const chips = [`Рівень ${i.level}`, `${i.total} XP`, `🔥 ${streak} ${pl(streak, "день", "дні", "днів")}`, `${lessons} ${pl(lessons, "урок", "уроки", "уроків")}`];
  return `<ul class="hero-chips">${chips.map((c, n) => `<li style="--i:${n}">${escA(c)}</li>`).join("")}</ul>`;
}

/** Стовпчики активності за 14 днів (UTC): кожен день окремим стовпчиком, сьогодні виділено */
export function activityCard(activity: Record<string, number> = {}): string {
  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => { const x = new Date(now); x.setUTCDate(x.getUTCDate() - (13 - i)); return x; });
  const vals = days.map((x) => activity[utcKey(x)] || 0);
  const max = Math.max(1, ...vals), total = vals.reduce((s, v) => s + v, 0);
  const bi = vals.indexOf(Math.max(...vals));
  const cols = days.map((x, i) => {
    const v = vals[i], k = utcKey(x), px = v ? Math.round(14 + (v / max) * 86) : 0;
    return `<li class="${v ? "" : "z"}${i === 13 ? " today" : ""}" style="--h:${px};--i:${i}" title="${k}: ${v}"><em>${v || ""}</em><i></i><span>${DAY[x.getUTCDay()]}</span></li>`;
  }).join("");
  const note = total ? `Найактивніший день: ${new Date(utcKey(days[bi]) + "T00:00:00Z").toLocaleDateString("uk-UA", { day: "numeric", month: "long", timeZone: "UTC" })} (${vals[bi]})` : "Закрийте урок або завдання, і тут з'явиться перший стовпчик.";
  return `<section class="card act-card"><h3>Активність за 14 днів</h3>
    <ol class="act14" aria-label="Дії за останні 14 днів">${cols}</ol>
    <p class="act-total"><b class="cnt" data-to="${total}">${total}</b> ${pl(total, "дія", "дії", "дій")} за два тижні</p>
    <p class="dash-muted act-note">${note}</p></section>`;
}

/** Радар навичок: по осі на кожну групу курсів, форма показує збалансованість навчання */
export function radarCard(items: { t: string; pct: number }[]): string {
  const n = items.length;
  if (n < 3) return "";
  const cx = 200, cy = 150, R = 88;
  const pt = (i: number, r: number): [number, number] => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const poly = (f: (i: number) => number): string => items.map((_, i) => pt(i, f(i)).map((v) => v.toFixed(1)).join(",")).join(" ");
  const rings = [0.25, 0.5, 0.75, 1].map((k) => `<polygon class="ring" points="${poly(() => R * k)}"/>`).join("");
  const axes = items.map((_, i) => { const [x, y] = pt(i, R); return `<line class="axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join("");
  const r = (it: { pct: number }): number => R * Math.max(0.04, clamp(it.pct) / 100);
  const dots = items.map((it, i) => { const [x, y] = pt(i, r(it)); return `<circle class="pt" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"><title>${escA(it.t)}: ${clamp(it.pct)}%</title></circle>`; }).join("");
  const labels = items.map((it, i) => {
    const [x, y] = pt(i, R + 16), anchor = x > cx + 10 ? "start" : x < cx - 10 ? "end" : "middle";
    const y0 = y < cy - R + 4 ? y - 22 : y > cy + R - 4 ? y + 10 : y - 6;   // підпис із двох рядків: назва і відсоток
    return `<text x="${x.toFixed(1)}" y="${y0.toFixed(1)}" text-anchor="${anchor}">${escA(it.t)}<tspan class="pct" x="${x.toFixed(1)}" dy="17">${clamp(it.pct)}%</tspan></text>`;
  }).join("");
  return `<section class="card radar-card"><h3>Радар навичок</h3>
    <svg class="radar" viewBox="0 0 400 290" role="img" aria-label="Радар навичок: ${escA(items.map((it) => `${it.t} ${clamp(it.pct)}%`).join(", "))}">
      ${rings}${axes}<polygon class="area" points="${poly((i) => r(items[i]))}"/>${dots}${labels}</svg>
    <p class="dash-muted">Чим рівніша форма, тим збалансованіше навчання.</p></section>`;
}

/** Нагороди за серію: пройдені позначки світяться, наступна підказує, скільки лишилось */
export function medalsCard(streak: number): string {
  const got = STREAK_MILESTONES.filter((m) => streak >= m).length;
  const items = STREAK_MILESTONES.map((m, i) => {
    const on = streak >= m;
    return `<li class="medal ${on ? "on" : "off"}" style="--i:${i}" title="${m} ${pl(m, "день", "дні", "днів")} серії: +${STREAK_BONUS[m]} XP"><span aria-hidden="true">${on ? "🏅" : "🔒"}</span><b>${m}</b><small>+${STREAK_BONUS[m]} XP</small></li>`;
  }).join("");
  return `<section class="card medals-card"><h3>Нагороди за серію</h3>
    <ol class="medals" aria-label="Нагороди за серію занять">${items}</ol>
    <p class="dash-muted">Отримано ${got} з ${STREAK_MILESTONES.length}. Серія росте щодня, коли ви проходите урок або завдання.</p></section>`;
}
