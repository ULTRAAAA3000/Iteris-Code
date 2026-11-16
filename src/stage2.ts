// Етап 2, клей між модулями й API: підключення кабінету, онбордингу, шляху та ефектів XP («+XP», підвищення рівня).
import { api, getUser, invalidate, post } from "./auth.ts";
import { mountCabinet } from "./cabinet.ts";
import { getOnboarding, mountOnboarding, setOnboarding } from "./onboarding.ts";
import { mountPath } from "./path.ts";
import { ui } from "./ui.ts";
import { navigate, pathOf } from "./router.ts";
import type { Level } from "./xp.ts";

interface SyncResult { xp: number; gained: { amount: number }[]; level: number; prevLevel: number; leveledUp: boolean }

let inited = false, timer: ReturnType<typeof setTimeout> | undefined, loadingOnb = false;

function xpPop(text: string): void {
  document.querySelector(".xp-pop")?.remove();
  const el = document.createElement("div");
  el.className = "xp-pop";
  el.setAttribute("role", "status");
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function levelUp(level: number): void {
  document.querySelector(".lvl-up")?.remove();
  const el = document.createElement("div");
  el.className = "lvl-up";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", "Новий рівень");
  el.innerHTML = `<div class="lvl-up-card"><div class="confetti" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
    <div class="lvl-up-badge">${level}</div><h2>Новий рівень!</h2><p>Ви досягли рівня ${level}. Так тримати!</p><button class="btn primary" type="button">Чудово</button></div>`;
  const prev = document.activeElement as HTMLElement | null;
  const btn = el.querySelector("button") as HTMLButtonElement;
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") close();
    else if (e.key === "Tab") { e.preventDefault(); btn.focus(); }   // в окне одна кнопка: фокус не уходит на страницу под ним
  };
  function close(): void { el.remove(); document.removeEventListener("keydown", onKey); prev?.focus?.(); }
  el.addEventListener("click", (e) => { if (e.target === el) close(); });
  btn.addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  document.body.appendChild(el);
  btn.focus();
}

// Після будь-якої дії прогресу просимо сервер нарахувати XP за нові перевірені дії (ідемпотентно) і показуємо результат
async function runSync(): Promise<void> {
  if (!getUser()) return;
  const r = await post<SyncResult>("/api/xp/sync");
  if (!r.ok || !r.data) return;
  invalidate();
  const sum = r.data.gained.reduce((s, e) => s + e.amount, 0);
  if (sum > 0) xpPop(`+${sum} XP`);
  if (r.data.leveledUp) levelUp(r.data.level);
  if (pathOf() === "dashboard") ui.render();
}

export function initStage2(): void {
  if (inited) return;
  inited = true;
  document.addEventListener("ic:progress", () => { clearTimeout(timer); timer = setTimeout(() => void runSync(), 350); });
}

async function saveOnboarding(level: Level, courses: string[]): Promise<boolean> {
  const r = await post("/api/onboarding", { level, courses });
  if (!r.ok) return false;
  setOnboarding({ level, courses });
  invalidate();
  navigate("/path/" + courses[0]);
  return true;
}

/** Викликається після кожного рендеру сторінки */
export function mountStage2(a: string | undefined): void {
  if (a === "dashboard") mountCabinet();
  if (a === "path") mountPath();
  if (document.getElementById("onb")) mountOnboarding(saveOnboarding);
  // Шлях і форма зміни рівня потребують збереженого вибору: завантажуємо його один раз і перемальовуємо сторінку
  if ((a === "path" || a === "start") && getUser() && getOnboarding() === undefined && !loadingOnb) {
    loadingOnb = true;
    void api<{ onboarding: unknown }>("/api/onboarding").then((r) => {
      loadingOnb = false;
      setOnboarding(r.ok && r.data ? r.data.onboarding ?? null : null);
      if (getOnboarding() !== undefined && /^(path|start)(\/|$)/.test(pathOf())) ui.render();
    });
  }
}
