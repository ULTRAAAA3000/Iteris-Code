// Довідник по мовах: ключ збігається з ключем курсу в src/data.ts або з мовою лише з довідником (R у src/data.ts)
import { bash } from "./bash.ts";
import { c } from "./c.ts";
import { cpp } from "./cpp.ts";
import { css } from "./css.ts";
import { git } from "./git.ts";
import { go } from "./go.ts";
import { html } from "./html.ts";
import { java } from "./java.ts";
import { js } from "./js.ts";
import { pascal } from "./pascal.ts";
import { php } from "./php.ts";
import { python } from "./python.ts";
import { sql } from "./sql.ts";
import { ts } from "./ts.ts";
import { rust } from "./rust.ts";
import { csharp } from "./csharp.ts";
import { kotlin } from "./kotlin.ts";
import { swift } from "./swift.ts";
import { ruby } from "./ruby.ts";
import { dart } from "./dart.ts";
import { lua } from "./lua.ts";
import { r } from "./r.ts";
import type { RefSection } from "./types.ts";

export type { RefItem, RefSection } from "./types.ts";
export const REF: Readonly<Record<string, readonly RefSection[]>> = { python, go, java, c, cpp, pascal, html, css, js, ts, php, sql, git, bash, rust, csharp, kotlin, swift, ruby, dart, lua, r };
