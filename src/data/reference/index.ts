// Довідник по мовах: ключ збігається з ключем курсу в src/data.ts
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
import type { RefSection } from "./types.ts";

export type { RefItem, RefSection } from "./types.ts";
export const REF: Readonly<Record<string, readonly RefSection[]>> = { python, go, java, c, cpp, pascal, html, css, js, ts, php, sql, git, bash };
