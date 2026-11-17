// Піддомени: кабінет живе на dashboard.<домен>, решта сайту на головному домені.
// На інших адресах (iteris-code.pages.dev, localhost, превʼю) усе працює по-старому: кабінет на /dashboard.
// Домен і назву піддомену задають змінні збірки ROOT_DOMAIN і DASH_SUBDOMAIN (build.mjs), за замовчуванням iteris-code.org і dashboard.
declare const __ROOT__: string | undefined;
declare const __DASH__: string | undefined;

export const ROOT: string = typeof __ROOT__ === "string" ? __ROOT__ : "iteris-code.org";
export const DASH_HOST: string = (typeof __DASH__ === "string" ? __DASH__ : "dashboard") + "." + ROOT;

const host = (): string => location.hostname.toLowerCase();

/** Ми на кабінетному піддомені (dashboard.iteris-code.org) */
export const onDashHost = (): boolean => host() === DASH_HOST;
/** Ми на основному домені (iteris-code.org або www) */
export const onRootHost = (): boolean => host() === ROOT || host() === "www." + ROOT;

/** Повний перехід на інший домен. Тестовий хук window.__IC_LEAVE підміняє справжню навігацію (jsdom не вміє міняти домен) */
export function leave(url: string, replace = false): void {
  const hook = (window as unknown as { __IC_LEAVE?: (u: string) => void }).__IC_LEAVE;
  if (hook) hook(url); else if (replace) location.replace(url); else location.assign(url);
}

const isDashPath = (path: string): boolean => path === "/dashboard" || path.startsWith("/dashboard/");

/**
 * Куди веде внутрішнє посилання з урахуванням піддоменів:
 * - { external } — треба вийти на інший домен (повне перезавантаження);
 * - { local } — лишаємось на цьому домені, показуємо цю адресу.
 * На кабінетному домені головна сторінка «/» і є кабінетом, а весь решта сайт (включно з логотипом «/») веде на основний домен.
 */
export function resolveTarget(to: string): { external: string } | { local: string } {
  const path = to.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  const rest = to.slice(to.split(/[?#]/)[0].length);
  if (onRootHost() && isDashPath(path)) return { external: `https://${DASH_HOST}${path.replace(/^\/dashboard/, "") || "/"}${rest}` };
  if (onDashHost()) {
    if (isDashPath(path)) return { local: (path.replace(/^\/dashboard/, "") || "/") + rest };
    return { external: `https://${ROOT}${to}` };
  }
  return { local: to };
}
