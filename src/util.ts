import { pl } from "../lib/plural.ts";

export const pad = (n: number): string => String(n).padStart(2, "0");

export { pl };   // форми множини живуть у lib/plural.ts: їх використовують і функції Cloudflare, де немає браузерних типів

export type Forms = readonly [string, string, string];
export const W = {
  lesson: ["урок", "уроки", "уроків"],
  task: ["завдання", "завдання", "завдань"],
  course: ["курс", "курси", "курсів"],
  ref: ["довідник", "довідники", "довідників"],
  section: ["розділ", "розділи", "розділів"],
} as const satisfies Record<string, Forms>;
export const count = (n: number, w: Forms): string => n + " " + pl(n, ...w);

export const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Екранування для тексту й атрибутів (включно з лапками) */
export const escA = (s: unknown): string => esc(String(s ?? "")).replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : d;
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown): void {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* сховище недоступне */
    }
  },
};
