// GET /u/<нік> — сторінка профілю. Сайт одно сторінковий, тому тут беремо звичайний index.html і підставляємо в нього
// заголовок, опис і картинку профілю: так посилання красиво розгортається в месенджерах і пошуку.
import type { Env } from "../../lib/env.ts";
import { buildProfile, findByNick } from "../../lib/profile.ts";
import { ensureSchema } from "../../lib/schema.ts";
import { defaultIdol, idolOgSrc } from "../../src/data/idols.ts";
import { pl } from "../../lib/plural.ts";

const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface Tags { title: string; desc: string; url: string; image: string }

/** Підставляє в готовий index.html заголовок, опис, canonical, Open Graph і Twitter-теги; прибирає noindex */
export function retag(html: string, t: Tags): string {
  const set = (re: RegExp, to: string): void => { html = re.test(html) ? html.replace(re, () => to) : html.replace("</head>", () => to + "\n</head>"); };
  set(/<title>[\s\S]*?<\/title>/, `<title>${esc(t.title)}</title>`);
  set(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(t.desc)}">`);
  set(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${esc(t.url)}">`);
  for (const [k, v] of [["og:title", t.title], ["og:description", t.desc], ["og:url", t.url], ["og:image", t.image], ["twitter:title", t.title], ["twitter:description", t.desc], ["twitter:image", t.image]] as const) {
    const attr = k.startsWith("og:") ? "property" : "name";
    set(new RegExp(`<meta ${attr}="${k}" content="[^"]*">`), `<meta ${attr}="${k}" content="${esc(v)}">`);
  }
  return html.replace(/<meta name="robots" content="[^"]*">\n?/, "");
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const url = new URL(request.url);
  const page = env.ASSETS ? await env.ASSETS.fetch(new URL("/", url)) : null;
  if (!page || !page.ok) return new Response("Not found", { status: 404 });
  const html = await page.text();
  const headers = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" };
  const nick = String(params.nick ?? "").toLowerCase();
  try {
    await ensureSchema(env);
    const row = await findByNick(env, nick);
    if (row && row.profile_public) {
      const p = await buildProfile(env, row);
      const desc = p.bio || `Рівень ${p.level}, ${p.xp} XP, ${p.lessons} ${pl(p.lessons, "урок", "уроки", "уроків")} пройдено. Вчиться програмувати на Iteris Code.`;
      const out = retag(html, { title: `@${p.nick}: профіль на Iteris Code`, desc: [...desc].slice(0, 200).join(""), url: `${url.origin}/u/${p.nick}`, image: url.origin + idolOgSrc(p.avatarId ?? defaultIdol(p.nick).id) });
      return new Response(out, { headers });
    }
  } catch (e) {
    console.error("profile page", e instanceof Error ? e.message : e);
    return new Response(html, { headers });   // база недоступна: сайт сам покаже профіль або помилку
  }
  // Закритого або неіснуючого профілю для решти немає: 404 і noindex (сторінку все одно показує сайт)
  return new Response(html.replace("</head>", '<meta name="robots" content="noindex">\n</head>'), { status: 404, headers });
};
