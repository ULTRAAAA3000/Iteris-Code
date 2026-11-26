// Усе для пошуковиків і ІІ-асистентів: готові сторінки з метаданими й JSON-LD, sitemap, robots, llms.txt, Markdown-копії довідників,
// манифест і security.txt. Збірка бере чисті сторінки з pages.ts і створює з них файли для dist/.
// Запускається лише під час збірки (Node), у браузер не потрапляє.
import { NEWS_PATH, RELEASES } from "./changelog.ts";
import { altsFor, chromeHtml } from "./chrome.ts";
import { C, CATS, publicLessonTotal } from "./data.ts";
import { REF } from "./data/reference/index.ts";
import { catDesc, courseDesc, courseName } from "./i18n-data.ts";
import { refSections } from "./i18n-ref.ts";
import { DEFAULT_LANG, HTML_LANG, inLang, LANG_SHORT, LANGS, OG_LOCALE, tr, withLang, type Lang } from "./i18n.ts";
import { BRAND, publicPages } from "./pages.ts";
import type { PageDef } from "./pages.ts";
import { escA as esc } from "./util.ts";

export interface OutFile { file: string; html: string }
export interface TextFile { file: string; text: string }
/** Необов'язкові дані збірки: коди підтвердження сайту в Google, Bing, Яндекс та дата останньої зміни вмісту (РРРР-ММ-ДД) */
export interface SeoOptions { google?: string; bing?: string; yandex?: string; modified?: string }

/** Закриті адреси: кабінет, уроки, API. Пошуковикам їх не показуємо (robots.txt і заголовок X-Robots-Tag) */
export const PRIVATE_PATHS: readonly string[] = ["/api/", "/dashboard", "/profile", "/path", "/start", "/lesson/", "/course/", "/project/", "/admin"];

/** Пошукові системи й ІІ-асистенти, яким явно дозволено читати публічні сторінки. Щоб заборонити навчання моделей, приберіть із цього списку відповідні рядки */
export const AI_BOTS: readonly string[] = [
  // Пошук
  "Googlebot", "Googlebot-Image", "Bingbot", "DuckDuckBot", "YandexBot", "Applebot",
  // ІІ-пошук і асистенти (відповідають на запитання користувачів і наводять посилання)
  "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "MistralAI-User", "YouBot",
  // Збір даних для навчання моделей
  "GPTBot", "ClaudeBot", "anthropic-ai", "Google-Extended", "Applebot-Extended", "CCBot", "Amazonbot", "meta-externalagent", "cohere-ai", "Bytespider",
];

const SOCIAL_IMG = { w: 1200, h: 630 };
const url = (site: string, path: string, lang: Lang = DEFAULT_LANG): string => site + withLang(path, lang);
const isoOf = (d: string): string => d.split(".").reverse().join("-");
const json = (o: unknown): string => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
const nCourses = (): number => Object.keys(C).length;

/** Дата зміни сторінки для sitemap і розмітки: «Що нового» має власну, решта поділяють дату зміни вмісту */
export function lastmodOf(p: PageDef, modified: string): string {
  if (p.path !== NEWS_PATH) return modified;
  const newest = RELEASES.map((r) => isoOf(r.date)).sort().at(-1);
  return newest && newest > modified ? newest : modified;
}

/* ---------- Структуровані дані ---------- */

const orgOf = (site: string, lang: Lang) => ({
  "@type": ["Organization", "EducationalOrganization"], "@id": site + "/#organization",
  name: BRAND, url: url(site, "/", lang),
  description: tr(`Безкоштовна платформа для вивчення програмування українською: ${nCourses()} мов і технологій, уроки із завданнями, що перевіряються автоматично, і проєкти за технічним завданням.`, `A free platform for learning to code: ${nCourses()} languages and technologies, lessons with automatically checked tasks and projects from a specification. The lessons are in Ukrainian for now.`),
  logo: { "@type": "ImageObject", url: site + "/icon-512.png", width: 512, height: 512 }, image: site + "/og.png",
  contactPoint: { "@type": "ContactPoint", contactType: "customer support", url: url(site, "/contact", lang), availableLanguage: ["uk", "en"] },
});

const courseOf = (site: string, k: string, lang: Lang) => ({
  "@type": "Course", "@id": `${url(site, "/ref/" + k, lang)}#course`, name: tr(`${courseName(k)}: курс українською`, `${courseName(k)}: a course taught in Ukrainian`), description: courseDesc(k),
  url: url(site, "/ref/" + k, lang), inLanguage: "uk", isAccessibleForFree: true, educationalLevel: "Beginner", provider: { "@id": site + "/#organization" },
  offers: { "@type": "Offer", category: "Free", price: "0", priceCurrency: "UAH" }, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
});

const itemList = (site: string, id: string, keys: readonly string[], lang: Lang) => ({
  "@type": "ItemList", "@id": id, numberOfItems: keys.length,
  itemListElement: keys.map((k, i) => ({ "@type": "ListItem", position: i + 1, item: courseOf(site, k, lang) })),
});

/** Структуровані дані сторінки одним графом: організація, сайт, сторінка, хлібні крихти й специфічне для виду сторінки (запитання, список курсів, стаття) */
export function jsonLd(p: PageDef, site: string, opts: SeoOptions = {}): string {
  return inLang(p.lang, () => {
    const lang = p.lang, u = url(site, p.path, lang), orgId = site + "/#organization", webId = site + "/#website";
    const pageType = p.path === "/about" ? "AboutPage" : p.path === "/contact" ? "ContactPage" : p.kind === "catalog" || p.kind === "dir" ? "CollectionPage" : "WebPage";
    const graph: Record<string, unknown>[] = [
      orgOf(site, lang),
      { "@type": "WebSite", "@id": webId, name: BRAND, url: url(site, "/", lang), inLanguage: HTML_LANG[lang], publisher: { "@id": orgId } },
      {
        "@type": pageType, "@id": u + "#webpage", url: u, name: p.title, description: p.desc, inLanguage: HTML_LANG[lang],
        isPartOf: { "@id": webId }, about: { "@id": orgId }, primaryImageOfPage: { "@type": "ImageObject", url: site + "/og.png", width: SOCIAL_IMG.w, height: SOCIAL_IMG.h },
        ...(p.kind === "home" ? {} : { breadcrumb: { "@id": u + "#breadcrumb" } }),
        ...(opts.modified ? { dateModified: lastmodOf(p, opts.modified) } : {}),
      },
    ];
    if (p.kind !== "home") {
      const items = [[tr("Головна", "Home"), "/"], ...p.crumbs].map(([name, href], i) => ({ "@type": "ListItem", position: i + 1, name, item: url(site, href, lang) }));
      graph.push({ "@type": "BreadcrumbList", "@id": u + "#breadcrumb", itemListElement: items });
    }
    if (p.faq) graph.push({ "@type": "FAQPage", "@id": u + "#faq", mainEntity: p.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) });
    if (p.kind === "catalog") graph.push(itemList(site, u + "#courses", Object.keys(C), lang));
    if (p.kind === "dir") graph.push(itemList(site, u + "#courses", CATS[p.path.slice(1)]?.courses ?? [], lang));
    if (p.kind === "ref") {
      const k = p.path.replace("/ref/", ""), secs = refSections(k);
      graph.push({
        "@type": ["TechArticle", "LearningResource"], "@id": u + "#article", headline: p.title, description: p.desc, inLanguage: HTML_LANG[lang], url: u,
        mainEntityOfPage: { "@id": u + "#webpage" }, about: { "@type": "Thing", name: courseName(k) }, teaches: secs.map((s) => s.t),
        keywords: tr([C[k].name, "довідник", "синтаксис", "приклади коду", "українською"], [courseName(k), "reference", "syntax", "code examples"]).join(", "), educationalLevel: "Beginner", learningResourceType: tr("Довідник", "Reference"),
        isAccessibleForFree: true, image: site + "/og.png", author: { "@id": orgId }, publisher: { "@id": orgId },
        ...(opts.modified ? { dateModified: opts.modified } : {}),
      });
    }
    return json({ "@context": "https://schema.org", "@graph": graph });
  });
}

/* ---------- Теги <head> ---------- */

/** Теги для <head>: robots, canonical, мови (hreflang для обох версій), Open Graph, Twitter, підтвердження сайту, JSON-LD */
export function headTags(p: PageDef, site: string, opts: SeoOptions = {}): string {
  const lang = p.lang, u = url(site, p.path, lang), isRef = p.kind === "ref";
  const alt = inLang(lang, () => tr(`${BRAND}: безкоштовні уроки програмування українською`, `${BRAND}: free programming lessons`));
  const verify = [["google-site-verification", opts.google], ["msvalidate.01", opts.bing], ["yandex-verification", opts.yandex]]
    .filter((x): x is [string, string] => !!x[1]).map(([n, v]) => `<meta name="${n}" content="${esc(v)}">`);
  const others = LANGS.filter((l) => l !== lang);
  return inLang(lang, () => [
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`,
    `<meta name="author" content="${BRAND}">`,
    `<meta name="application-name" content="${BRAND}">`,
    ...verify,
    `<link rel="canonical" href="${esc(u)}">`,
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${esc(url(site, p.path, l))}">`),
    `<link rel="alternate" hreflang="x-default" href="${esc(url(site, p.path, DEFAULT_LANG))}">`,
    ...(isRef && lang === DEFAULT_LANG ? [`<link rel="alternate" type="text/markdown" href="${esc(site + p.path + ".md")}" title="Markdown-версія для ІІ-асистентів">`] : []),
    `<meta property="og:type" content="${isRef ? "article" : "website"}">`,
    `<meta property="og:site_name" content="${BRAND}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}">`,
    ...others.map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`),
    `<meta property="og:title" content="${esc(p.title)}">`,
    `<meta property="og:description" content="${esc(p.desc)}">`,
    `<meta property="og:url" content="${esc(u)}">`,
    `<meta property="og:image" content="${site}/og.png">`,
    `<meta property="og:image:type" content="image/png">`,
    `<meta property="og:image:width" content="${SOCIAL_IMG.w}">`,
    `<meta property="og:image:height" content="${SOCIAL_IMG.h}">`,
    `<meta property="og:image:alt" content="${esc(alt)}">`,
    ...(isRef ? [`<meta property="article:section" content="${tr("Довідник", "Reference")}">`, ...(opts.modified ? [`<meta property="article:modified_time" content="${opts.modified}">`] : [])] : []),
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(p.title)}">`,
    `<meta name="twitter:description" content="${esc(p.desc)}">`,
    `<meta name="twitter:image" content="${site}/og.png">`,
    `<meta name="twitter:image:alt" content="${esc(alt)}">`,
    jsonLd(p, site, opts),
  ].join("\n"));
}

/** Файл, у який записується сторінка: "/courses" → "courses.html", "/ref/js" → "ref/js.html", англійська версія в папці en/ (Cloudflare Pages віддає без .html) */
export const fileOf = (path: string, lang: Lang = DEFAULT_LANG): string => {
  const f = path === "/" ? "index.html" : path.slice(1) + ".html";
  return lang === DEFAULT_LANG ? f : "en/" + f;
};

/** Готовий HTML однієї сторінки з шаблону (guest-вигляд) мовою сторінки. Другий аргумент прибирає з неї скрипт, що ховає заготовку на внутрішніх адресах */
export function renderPage(template: string, p: PageDef, site: string, opts: SeoOptions = {}): string {
  const nav = template.replace(/(<a href="[^"]*" data-k="([^"]*)")/g, (m, a, k) => (k === p.active ? a + ' aria-current="page"' : m));
  let html = chromeHtml(nav, p.lang, altsFor(p.path))
    .replace("{{title}}", () => esc(p.title))
    .replace("{{desc}}", () => esc(p.desc))
    .replace("<!--seo-->", () => headTags(p, site, opts))
    .replace(/(<main[^>]*id="app"[^>]*>)<\/main>/, (_, open) => `${open}${p.html(false)}</main>`);
  if (p.path !== "/" || p.lang !== DEFAULT_LANG) html = html.replace(/<!--spa-->[\s\S]*?<!--\/spa-->/, "");   // запасною сторінкою для кабінету лишається лише українська головна
  return html;
}

export function buildPages(template: string, site: string, opts: SeoOptions = {}): OutFile[] {
  return LANGS.flatMap((lang) => publicPages(lang).map((p) => ({ file: fileOf(p.path, lang), html: renderPage(template, p, site, opts) })));
}

/* ---------- sitemap.xml і robots.txt ---------- */

/** Усі публічні адреси обох мов; кожна позначена посиланнями на свої мовні версії (hreflang), як радить Google */
export function sitemap(site: string, date: string): string {
  const urls = LANGS.flatMap((lang) => publicPages(lang).map((p) => {
    const alts = [...LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${HTML_LANG[l]}" href="${url(site, p.path, l)}"/>`), `<xhtml:link rel="alternate" hreflang="x-default" href="${url(site, p.path, DEFAULT_LANG)}"/>`].join("");
    return `  <url><loc>${url(site, p.path, lang)}</loc><lastmod>${lastmodOf(p, date)}</lastmod>${alts}</url>`;
  })).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

export function robots(site: string): string {
  const rules = ["Allow: /", ...PRIVATE_PATHS.map((x) => `Disallow: ${x}`)].join("\n");
  return `# ${BRAND}: публічні сторінки відкриті для пошуковиків і ІІ-асистентів, кабінет, уроки й API закриті.
# Опис сайту для ІІ: ${site}/llms.txt (стисло) і ${site}/llms-full.txt (з довідниками мов).

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
${rules}

# Окремі правила для відомих пошукових і ІІ-ботів: кожен бот читає лише свою групу, тому закриті адреси повторюються.
${AI_BOTS.map((b) => `User-agent: ${b}`).join("\n")}
${rules}

Sitemap: ${site}/sitemap.xml
`;
}

/** Заголовки Cloudflare Pages (_headers): закриті адреси не індексуються, службові тексти віддаються з правильним типом */
export function seoHeaders(): string {
  const noindex = PRIVATE_PATHS.flatMap((p) => (p.endsWith("/") ? [p + "*"] : [p, p + "/*"])).map((p) => `${p}\n  X-Robots-Tag: noindex, nofollow\n`).join("");
  return `${noindex}/llms.txt\n  Content-Type: text/plain; charset=utf-8\n  Cache-Control: public, max-age=3600\n/llms-full.txt\n  Content-Type: text/plain; charset=utf-8\n  Cache-Control: public, max-age=3600\n/ref/*.md\n  Content-Type: text/markdown; charset=utf-8\n  Cache-Control: public, max-age=3600\n/manifest.webmanifest\n  Content-Type: application/manifest+json\n  Cache-Control: public, max-age=86400\n`;
}

/* ---------- Файли для ІІ: llms.txt, llms-full.txt, Markdown-довідники ---------- */

const FENCE: Readonly<Record<string, string>> = { python: "python", c: "c", cpp: "cpp", pascal: "pascal", html: "html", css: "css", js: "javascript", ts: "typescript", go: "go", java: "java", php: "php", sql: "sql", git: "bash", bash: "bash" };

const lang = (): string => Object.values(C).map((c) => c.name).join(", ");

/** Стислий опис платформи: його читають і люди, і моделі */
const about = (site: string): string[] => [
  `${BRAND} (${site}) — безкоштовна платформа для вивчення програмування українською мовою.`,
  `У ній ${nCourses()} мов і технологій (${lang()}), понад ${Math.floor(publicLessonTotal() / 10) * 10} уроків по главах, завдання з автоматичною перевіркою коду без ШІ, проєкти за технічним завданням, XP, рівні та серія днів. Редактор, термінал і перевірка працюють у браузері, у тому числі на телефоні.`,
  `Довідники синтаксису з прикладами коду відкриті всім без реєстрації. Уроки, завдання й кабінет доступні безкоштовно після входу.`,
];

/** Довідник однієї мови у форматі Markdown. base — на скільки рівнів зсунути заголовки (для вставки в llms-full.txt) */
export function refMarkdown(k: string, site: string, base = 0): string {
  const c = C[k], h = (n: number): string => "#".repeat(n + base);
  const out = [`${h(1)} ${c.name}: довідник синтаксису українською`, "", `> ${c.desc}`, "", `Сторінка: ${site}/ref/${k}`, ""];
  for (const s of REF[k] ?? []) {
    out.push(`${h(2)} ${s.t}`, "");
    for (const x of s.items) {
      out.push(`${h(3)} ${x.t}`, "");
      if (x.note) out.push(x.note, "");
      out.push("```" + (FENCE[k] ?? ""), x.code.replace(/\s+$/, ""), "```", "");
    }
  }
  return out.join("\n");
}

const line = (name: string, href: string, note: string): string => `- [${name}](${href}): ${note}`;

/** llms.txt за специфікацією llmstxt.org: заголовок, короткий опис і розділи з посиланнями */
export function llmsTxt(site: string): string {
  const pages = publicPages(), by = (p: string): PageDef => pages.find((x) => x.path === p) as PageDef;
  const main = [
    line("Головна", url(site, "/"), "що це за платформа, які мови можна вивчати, часті запитання й початок навчання"),
    line("Каталог курсів", url(site, "/courses"), `${nCourses()} курсів: ${lang()}; довідник відкритий без реєстрації`),
    line("Як це працює", url(site, "/how-it-works"), by("/how-it-works").desc),
    line("Про проєкт", url(site, "/about"), "принципи платформи, зміст курсів і технології"),
  ];
  const dirs = Object.entries(CATS).map(([key, c]) => line(c.title, url(site, "/" + key), c.desc));
  const refs = Object.entries(C).map(([k, c]) => line(`${c.name}: довідник`, `${site}/ref/${k}.md`, `${c.desc} Сторінка для людей: ${site}/ref/${k}`));
  const info = [
    line("Підтримка", url(site, "/contact"), "форма звернення до команди: помилка на сайті, ідея, побажання"),
    line("Політика конфіденційності", url(site, "/privacy"), "які дані збираються, навіщо й як їх переглянути чи видалити"),
    line("Умови користування", url(site, "/terms"), "правила платформи: акаунт, вік, безкоштовність, права на матеріали"),
  ];
  return [
    `# ${BRAND}`, "",
    `> ${about(site)[0]} Free Ukrainian-language platform for learning programming: ${nCourses()} languages and technologies, lessons, auto-checked tasks, projects by specification.`, "",
    ...about(site).slice(1), "",
    "Для асистентів і пошукових систем: посилайтесь на сторінки довідників і напрямів, вони відкриті й стабільні. Уроки й завдання лежать у кабінеті за входом, а в публічні файли не потрапляють.", "",
    "## Основне", "", ...main, "",
    "## Напрями", "", ...dirs, "",
    "## Довідники мов (Markdown)", "", ...refs, "",
    "## Службове", "", ...info, "",
    "## Optional", "",
    line("Повний текст: опис, запитання й довідники всіх мов", `${site}/llms-full.txt`, "усе вище в одному файлі"),
    line("Що нового", url(site, NEWS_PATH), "оновлення платформи за останні дні й плани"),
    line("English version of the site", `${site}/en/`, "the interface and public pages in English; the lessons themselves are in Ukrainian for now"),
    line("Карта сайту", `${site}/sitemap.xml`, "усі публічні адреси (українські й англійські)"), "",
  ].join("\n");
}

/** llms-full.txt: опис, часті запитання, список курсів і повні довідники всіх мов в одному текстовому файлі */
export function llmsFullTxt(site: string): string {
  const home = publicPages()[0], faq = home.faq ?? [];
  const parts = [
    `# ${BRAND}: повний опис і довідники`, "", `> ${about(site)[0]}`, "", ...about(site).slice(1), "",
    "## Часті запитання", "", ...faq.flatMap(([q, a]) => [`### ${q}`, "", a, ""]),
    "## Курси", "", ...Object.entries(C).map(([k, c]) => `- **${c.name}** (${c.lessons} уроків): ${c.desc} Довідник: ${site}/ref/${k}`), "",
    "## Довідники мов", "",
  ];
  for (const k of Object.keys(C)) parts.push(refMarkdown(k, site, 2), "");
  return parts.join("\n");
}

/** Web App Manifest: назва, колір і іконки для «Додати на головний екран» */
export function manifest(site: string): string {
  void site;
  return JSON.stringify({
    name: BRAND, short_name: BRAND, description: "Безкоштовні уроки програмування українською: довідники, уроки, завдання з перевіркою коду й проєкти.",
    lang: "uk", dir: "ltr", start_url: "/", scope: "/", display: "standalone", background_color: "#ffffff", theme_color: "#2F5BEA", categories: ["education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }, null, 2) + "\n";
}

/** /.well-known/security.txt (RFC 9116): куди писати про вразливості, дійсний трохи менше року */
export function securityTxt(site: string, today: string): string {
  const exp = new Date(Date.parse(today + "T00:00:00Z") + 330 * 86400000).toISOString();
  return `Contact: ${site}/contact\nExpires: ${exp}\nPreferred-Languages: uk, en\nCanonical: ${site}/.well-known/security.txt\n`;
}

/** Усі текстові файли, які збірка кладе в dist/ */
export function textFiles(site: string, opts: SeoOptions = {}): TextFile[] {
  const today = opts.modified ?? new Date().toISOString().slice(0, 10);
  return [
    { file: "llms.txt", text: llmsTxt(site) },
    { file: "llms-full.txt", text: llmsFullTxt(site) },
    { file: "manifest.webmanifest", text: manifest(site) },
    { file: ".well-known/security.txt", text: securityTxt(site, today) },
    ...Object.keys(C).map((k) => ({ file: `ref/${k}.md`, text: refMarkdown(k, site) })),
  ];
}
