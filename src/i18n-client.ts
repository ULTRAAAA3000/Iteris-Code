// Мова, яку користувач обрав востаннє (лише браузер): для сторінок без мовного префікса, як-от кабінет, уроки й форми входу.
import { DEFAULT_LANG, isLang, type Lang } from "./i18n.ts";
import { store } from "./util.ts";

export const preferredLang = (): Lang => { const v = store.get<string | null>("ic-lang", null); return isLang(v) ? v : DEFAULT_LANG; };
export const savePreferred = (l: Lang): void => store.set("ic-lang", l);
