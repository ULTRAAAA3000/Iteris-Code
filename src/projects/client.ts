// Запуск перевірки проєкту в iframe на сторінці (потрібен DOM)
import type { Report } from "./sandbox.ts";
import { buildSrcdoc, REPORT_TYPE } from "./sandbox.ts";
import type { Project } from "./types.ts";

/** Завантажує сторінку користувача разом зі скриптом перевірки в готовий iframe і чекає на звіт */
export function runProjectCheck(frame: HTMLIFrameElement, p: Project, html: string, timeoutMs = 7000): Promise<Report> {
  return new Promise((resolve) => {
    const nonce = crypto.randomUUID();
    const finish = (r: Report): void => { clearTimeout(timer); window.removeEventListener("message", onMsg); resolve(r); };
    const timer = setTimeout(() => {
      frame.srcdoc = "";
      finish({ results: [], timedOut: true, error: "Сторінка не відповіла вчасно. Перевірте, що теги закриті, а в скрипті немає нескінченного циклу." });
    }, timeoutMs);
    const onMsg = (ev: MessageEvent<{ type?: string; nonce?: string; results?: Report["results"]; error?: string }>): void => {
      const m = ev.data;
      // Беремо звіт лише від цього iframe і з нашим одноразовим кодом
      if (ev.source !== frame.contentWindow || !m || m.type !== REPORT_TYPE || m.nonce !== nonce) return;
      finish({ results: Array.isArray(m.results) ? m.results : [], error: m.error });
    };
    window.addEventListener("message", onMsg);
    frame.setAttribute("sandbox", "allow-scripts");
    frame.srcdoc = buildSrcdoc(html, p.requirements, nonce);
  });
}
