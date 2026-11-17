// Заготовки сторінок для пошуковиків: збірка бере чисті сторінки з pages.ts і створює з них готовий HTML, sitemap.xml та robots.txt.
// Запускається лише під час збірки (Node), у браузер не потрапляє.
import { BRAND, publicPages } from "./pages.ts";
import type { PageDef } from "./pages.ts";
import { escA as esc } from "./util.ts";

export interface OutFile { file: string; html: string }

const json = (o: unknown): string => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;

/** Структуровані дані для сторінки: сайт і організація, часті запитання, хлібні крихти, стаття */
export function jsonLd(p: PageDef, site: string): string {
  const url = site + (p.path === "/" ? "/" : p.path);
  const out: string[] = [];
  if (p.kind === "home") {
    out.push(json({ "@context": "https://schema.org", "@type": "WebSite", name: BRAND, url: site + "/", inLanguage: "uk" }));
    out.push(json({ "@context": "https://schema.org", "@type": "Organization", name: BRAND, url: site + "/", logo: site + "/og.png" }));
    if (p.faq) out.push(json({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }));
  } else {
    const items = [["Головна", "/"], ...p.crumbs].map(([name, href], i) => ({ "@type": "ListItem", position: i + 1, name, item: site + href }));
    out.push(json({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items }));
    if (p.kind === "ref") out.push(json({ "@context": "https://schema.org", "@type": "TechArticle", headline: p.title, description: p.desc, inLanguage: "uk", url, publisher: { "@type": "Organization", name: BRAND } }));
  }
  return out.join("\n");
}

/** Теги для <head>: canonical, Open Graph, Twitter, JSON-LD */
export function headTags(p: PageDef, site: string): string {
  const url = site + (p.path === "/" ? "/" : p.path);
  return [
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${BRAND}">`,
    `<meta property="og:locale" content="uk_UA">`,
    `<meta property="og:title" content="${esc(p.title)}">`,
    `<meta property="og:description" content="${esc(p.desc)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${site}/og.png">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(p.title)}">`,
    `<meta name="twitter:description" content="${esc(p.desc)}">`,
    `<meta name="twitter:image" content="${site}/og.png">`,
    jsonLd(p, site),
  ].join("\n");
}

/** Файл, у який записується сторінка: "/courses" → "courses.html", "/ref/js" → "ref/js.html" (Cloudflare Pages віддає без .html) */
export const fileOf = (path: string): string => (path === "/" ? "index.html" : path.slice(1) + ".html");

/** Готовий HTML однієї сторінки з шаблону (guest-вигляд). Другий аргумент прибирає з неї скрипт, що ховає заготовку на внутрішніх адресах */
export function renderPage(template: string, p: PageDef, site: string): string {
  const nav = template.replace(/(<a href="[^"]*" data-k="([^"]*)")/g, (m, a, k) => (k === p.active ? a + ' aria-current="page"' : m));
  let html = nav
    .replace("{{title}}", () => esc(p.title))
    .replace("{{desc}}", () => esc(p.desc))
    .replace("<!--seo-->", () => headTags(p, site))
    .replace(/(<main[^>]*id="app"[^>]*>)<\/main>/, (_, open) => `${open}${p.html(false)}</main>`);
  if (p.path !== "/") html = html.replace(/<!--spa-->[\s\S]*?<!--\/spa-->/, "");
  return html;
}

export function buildPages(template: string, site: string): OutFile[] {
  return publicPages().map((p) => ({ file: fileOf(p.path), html: renderPage(template, p, site) }));
}

export function sitemap(site: string, date: string): string {
  const urls = publicPages().map((p) => `  <url><loc>${site}${p.path === "/" ? "/" : p.path}</loc><lastmod>${date}</lastmod></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const robots = (site: string): string =>
  `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /dashboard\nDisallow: /profile\nDisallow: /path\nDisallow: /start\nDisallow: /lesson/\nDisallow: /course/\n\nSitemap: ${site}/sitemap.xml\n`;
