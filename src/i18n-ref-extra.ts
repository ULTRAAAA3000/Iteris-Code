// Переклади довідників мов, що мають лише довідник: кожна мова має свій файл i18n-ref-<мова>.ts, тут вони зливаються з основними словниками
import { NOTES_EN, RUNS_EN, TITLES_EN } from "./i18n-ref-data.ts";
import * as x_rust from "./i18n-ref-rust.ts";
import * as x_csharp from "./i18n-ref-csharp.ts";
import * as x_kotlin from "./i18n-ref-kotlin.ts";
import * as x_swift from "./i18n-ref-swift.ts";
import * as x_ruby from "./i18n-ref-ruby.ts";
import * as x_dart from "./i18n-ref-dart.ts";
import * as x_lua from "./i18n-ref-lua.ts";
import * as x_r from "./i18n-ref-r.ts";

const all = [x_rust, x_csharp, x_kotlin, x_swift, x_ruby, x_dart, x_lua, x_r];
const merge = (base: Readonly<Record<string, string>>, pick: (m: (typeof all)[number]) => Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.assign({}, base, ...all.map(pick));

export const TITLES_ALL = merge(TITLES_EN, (m) => m.TITLES);
export const NOTES_ALL = merge(NOTES_EN, (m) => m.NOTES);
export const RUNS_ALL = merge(RUNS_EN, (m) => m.RUNS);
