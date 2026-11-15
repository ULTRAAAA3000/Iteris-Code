// Онбординг після першої реєстрації: які курси вивчати й який рівень. Рівень лише визначає стартову точку шляху,
// усі уроки лишаються доступними (D6). Модуль не залежить від auth.ts: збереження передається колбеком.
import { C, CATS } from "./data.ts";
import { escA } from "./util.ts";
import { chaptersOf, isLevel, LEVELS, startLesson, type Level } from "./xp.ts";

export interface OnboardingState { level: Level; courses: string[] }
export const MAX_COURSES = 5;

// undefined = ще не завантажено, null = користувач ще не обирав
let cache: OnboardingState | null | undefined;
export const getOnboarding = (): OnboardingState | null | undefined => cache;
export function setOnboarding(v: unknown): void {
  if (v === null) { cache = null; return; }
  const o = v as Partial<OnboardingState> | undefined;
  if (o && isLevel(o.level) && Array.isArray(o.courses)) cache = { level: o.level, courses: o.courses.filter((k): k is string => typeof k === "string" && !!C[k]) };
}
export const resetOnboardingCache = (): void => { cache = undefined; };

export const LEVEL_TEXT: Record<Level, [string, string]> = {
  beginner: ["Новачок", "Починаю з нуля"],
  intermediate: ["Середній", "Знаю основи, хочу рухатися далі"],
  advanced: ["Впевнений", "Уже писав(ла) код, потрібно закріпити й піти глибше"],
};

/** Де починається шлях курсу для рівня: [номер уроку, назва глави] */
export function startPoint(k: string, level: Level): [number, string] {
  const L = C[k].L, n = startLesson(L, level);
  return [n, chaptersOf(L).find((c) => c.from === n)?.name || L[n - 1]?.ch || ""];
}

const courseChoice = (k: string, on: boolean): string =>
  `<label class="onb-chip"><input type="checkbox" name="course" value="${escA(k)}"${on ? " checked" : ""}><span><b class="onb-badge" style="background:${escA(C[k].color)}">${escA(C[k].badge)}</b>${escA(C[k].name)}</span></label>`;

export function onboardingHtml(prefill: OnboardingState | null | undefined = cache): string {
  const picked = new Set(prefill?.courses ?? []), lvl = prefill?.level ?? "beginner";
  const groups = Object.values(CATS).map((g) => {
    const ks = g.courses.filter((k) => C[k]);
    return ks.length ? `<div class="onb-group"><h3>${escA(g.title)}</h3><div class="onb-chips">${ks.map((k) => courseChoice(k, picked.has(k))).join("")}</div></div>` : "";
  }).join("");
  const levels = LEVELS.map((l) => `<label class="onb-level"><input type="radio" name="level" value="${l}"${l === lvl ? " checked" : ""}><span><b>${LEVEL_TEXT[l][0]}</b><small>${LEVEL_TEXT[l][1]}</small></span></label>`).join("");
  return `<div class="card onb" id="onb">
    <h1>Налаштуємо ваш шлях</h1>
    <p class="dash-muted">Усі уроки доступні завжди. Рівень лише підказує, з якого місця почати, а попередні глави лишаються відкритими.</p>
    <form id="onb-form">
      <fieldset><legend>Що хочете вивчати? <small>до ${MAX_COURSES} курсів</small></legend>${groups}</fieldset>
      <fieldset><legend>Ваш рівень</legend><div class="onb-levels">${levels}</div></fieldset>
      <div class="onb-preview" id="onb-preview" aria-live="polite"></div>
      <p class="form-msg" id="onb-msg" role="alert"></p>
      <button class="btn primary" type="submit">Почати навчання</button>
    </form></div>`;
}

export function mountOnboarding(save: (level: Level, courses: string[]) => Promise<boolean>): void {
  const f = document.getElementById("onb-form") as HTMLFormElement | null;
  if (!f) return;
  const prev = document.getElementById("onb-preview") as HTMLElement, msg = document.getElementById("onb-msg") as HTMLElement;
  const btn = f.querySelector("button[type=submit]") as HTMLButtonElement;
  const read = (): { level: Level; courses: string[] } => {
    const v = f.querySelector<HTMLInputElement>("input[name=level]:checked")?.value;
    return { level: isLevel(v) ? v : "beginner", courses: Array.from(f.querySelectorAll<HTMLInputElement>("input[name=course]:checked"), (i) => i.value) };
  };
  const refresh = (): void => {
    const { level, courses } = read();
    f.querySelectorAll<HTMLInputElement>("input[name=course]").forEach((i) => { i.disabled = !i.checked && courses.length >= MAX_COURSES; });
    prev.innerHTML = courses.length
      ? `<h3>Почнемо з:</h3><ul>${courses.map((k) => { const [n, ch] = startPoint(k, level); return `<li><b>${escA(C[k].name)}</b>: глава «${escA(ch)}», урок ${n}</li>`; }).join("")}</ul>`
      : `<p class="dash-muted">Оберіть хоча б один курс.</p>`;
  };
  f.addEventListener("change", () => { msg.textContent = ""; refresh(); });
  refresh();
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { level, courses } = read();
    if (!courses.length) { msg.textContent = "Оберіть хоча б один курс"; return; }
    btn.disabled = true;
    btn.classList.add("is-loading");
    msg.textContent = "";
    if (!(await save(level, courses))) { msg.textContent = "Не вдалося зберегти. Спробуйте ще раз"; btn.disabled = false; btn.classList.remove("is-loading"); }
  });
}
