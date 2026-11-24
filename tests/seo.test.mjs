// Готові сторінки для пошуковиків: заголовки, canonical, Open Graph, JSON-LD, sitemap, robots, відсутність закритого вмісту. Запуск: node tests/seo.test.mjs
import assert from "node:assert/strict";
import { publicPages, findPage } from "../src/pages.ts";
import { AI_BOTS, PRIVATE_PATHS, buildPages, fileOf, lastmodOf, llmsFullTxt, llmsTxt, manifest, refMarkdown, robots, securityTxt, seoHeaders, sitemap, textFiles } from "../src/seo.ts";
import { C, CATS } from "../src/data.ts";
import { REF } from "../src/data/reference/index.ts";
import { NEWS_PATH, RELEASES } from "../src/changelog.ts";
import { FACTS } from "../content/facts.ts";
import { PROJECTS } from "../content/projects/index.ts";
import { readFileSync } from "node:fs";

const SITE = "https://example.test";
let ok = 0;
const t = (name, fn) => { try { fn(); ok++; console.log("ok  -", name); } catch (e) { console.log("FAIL -", name, "\n", e.message); process.exitCode = 1; } };
const template = readFileSync(new URL("../src/index.template.html", import.meta.url), "utf8")
  .replace("</style>", "</style>");
const pages = publicPages();
// Ці перевірки написано для української версії; англійська (en/…) перевіряється в tests/i18n.test.mjs
const ukOnly = (list) => list.filter((f) => !f.file.startsWith("en/"));
const files = ukOnly(buildPages(template, SITE));

t("сторінок 26: головна, каталог, як це працює, про проєкт, що нового, підтримка, політика, умови, 5 напрямів, 13 довідників", () => assert.equal(pages.length, 26));
t("адреси унікальні, заголовки й описи унікальні та не порожні", () => {
  assert.equal(new Set(pages.map((p) => p.path)).size, pages.length);
  assert.equal(new Set(pages.map((p) => p.title)).size, pages.length);
  assert.equal(new Set(pages.map((p) => p.desc)).size, pages.length);
  for (const p of pages) { assert.ok(p.title.length > 10 && p.title.length <= 80, p.path + " title " + p.title.length); assert.ok(p.desc.length >= 60 && p.desc.length <= 175, p.path + " desc " + p.desc.length); }
});
t("кожна сторінка має свій файл, canonical, og:title, og:image, один h1 і готовий вміст", () => {
  for (const f of files) {
    const p = pages.find((x) => fileOf(x.path) === f.file);
    assert.ok(p, f.file);
    const url = SITE + (p.path === "/" ? "/" : p.path);
    assert.ok(f.html.includes(`<link rel="canonical" href="${url}">`), f.file + " canonical");
    assert.ok(f.html.includes(`<title>`) && !f.html.includes("{{"), f.file + " токени");
    assert.ok(f.html.includes('property="og:image"') && f.html.includes('name="twitter:card"'), f.file + " og");
    assert.equal((f.html.match(/<h1[ >]/g) || []).length, 1, f.file + " h1");
    assert.ok(/<main[^>]*id="app"[^>]*>\s*</.test(f.html) && !/id="app"[^>]*><\/main>/.test(f.html), f.file + " вміст");
  }
});
t("меню: підсвічується пункт поточної сторінки", () => {
  const c = files.find((f) => f.file === "courses.html").html;
  assert.ok(c.includes('data-k="courses" aria-current="page"'));
  assert.ok(!files.find((f) => f.file === "about.html").html.includes('data-k="courses" aria-current'));
});
t("скрипт, що ховає заготовку, лишається лише на index.html (він же запасна сторінка для кабінету)", () => {
  for (const f of files) assert.equal(f.html.includes("<!--spa-->"), f.file === "index.html", f.file);
});
t("файли для Cloudflare Pages: /courses → courses.html, /ref/js → ref/js.html", () => {
  assert.equal(fileOf("/courses"), "courses.html");
  assert.equal(fileOf("/ref/js"), "ref/js.html");
});
t("sitemap містить усі адреси й жодної закритої; robots закриває кабінет і API та вказує sitemap", () => {
  const sm = sitemap(SITE, "2026-01-01");
  for (const p of pages) assert.ok(sm.includes(`<loc>${SITE}${p.path === "/" ? "/" : p.path}</loc>`), p.path);
  assert.ok(!/\/(dashboard|lesson|course|path|start)\b/.test(sm.replace(/<\?xml[^>]*>/, "")));
  const r = robots(SITE);
  assert.ok(r.includes("Disallow: /api/") && r.includes("Disallow: /dashboard") && r.includes(`Sitemap: ${SITE}/sitemap.xml`));
});
t("публічні сторінки не містять вмісту закритих уроків і слів про профілі, пошту, монети, магазин (D15)", () => {
  const lessons = readFileSync(new URL("../content/lessons.js", import.meta.url), "utf8");
  const first = lessons.match(/title:\s*"([^"]{25,})"/)?.[1];
  const all = files.map((f) => f.html).join("\n");
  if (first) assert.ok(!all.includes(first), "заголовок закритого уроку потрапив на публічну сторінку");
  const home = files.find((f) => f.file === "index.html").html.toLowerCase();
  for (const w of ["профіл", "монет", "магазин", "пошт"]) assert.ok(!home.includes(w), "головна: " + w);
});
t("головна: заклик «Зареєструйся і вчись безкоштовно», підпис «Powered by WYSB» із посиланням на wysb.eu", () => {
  const home = files.find((f) => f.file === "index.html").html;
  assert.ok(home.includes("Зареєструйся і вчись безкоштовно"));
  assert.ok(/Powered by <a href="https:\/\/wysb\.eu"[^>]*>WYSB<\/a>/.test(home));
  assert.ok(!/VSB/.test(home), "старої назви VSB не лишилось");
});
t("findPage розпізнає адреси з .html і скісною рискою, невідомі повертають undefined", () => {
  assert.equal(findPage("/ref/js/")?.path, "/ref/js");
  assert.equal(findPage("/dashboard"), undefined);
});

/* ===== Розширене SEO: метадані, граф JSON-LD, robots для ІІ-ботів, llms.txt, Markdown-довідники, іконки ===== */
const OPTS = { google: "g-code", bing: "b-code", yandex: "y-code", modified: "2026-11-17" };
const filesO = ukOnly(buildPages(template, SITE, OPTS));
const decode = (x) => x.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const graphOf = (html) => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
  assert.equal(blocks.length, 1, "рівно один блок JSON-LD");
  const j = JSON.parse(blocks[0][1]);
  assert.equal(j["@context"], "https://schema.org");
  return j["@graph"];
};
const typesOf = (n) => [].concat(n["@type"]);

t("голова: robots з max-snippet, hreflang uk і x-default збігаються з canonical, один canonical і один robots", () => {
  for (const f of filesO) {
    const p = pages.find((x) => fileOf(x.path) === f.file), u = SITE + (p.path === "/" ? "/" : p.path);
    assert.ok(f.html.includes('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">'), f.file + " robots");
    assert.ok(f.html.includes(`<link rel="alternate" hreflang="uk" href="${u}">`) && f.html.includes(`<link rel="alternate" hreflang="x-default" href="${u}">`), f.file + " hreflang");
    assert.equal((f.html.match(/rel="canonical"/g) || []).length, 1, f.file + " canonical");
    assert.equal((f.html.match(/name="robots"/g) || []).length, 1, f.file + " robots двічі");
    assert.equal((f.html.match(/<title>/g) || []).length, 1, f.file + " title");
  }
});
t("голова: Open Graph з розмірами й alt, Twitter з alt, og:type article лише для довідників, article:modified_time", () => {
  for (const f of filesO) {
    assert.ok(f.html.includes('property="og:image:width" content="1200"') && f.html.includes('property="og:image:height" content="630"') && f.html.includes('property="og:image:type" content="image/png"'), f.file);
    assert.ok(f.html.includes('property="og:image:alt"') && f.html.includes('name="twitter:image:alt"'), f.file + " alt");
    const isRef = f.file.startsWith("ref/");
    assert.ok(f.html.includes(`property="og:type" content="${isRef ? "article" : "website"}"`), f.file + " og:type");
    assert.equal(f.html.includes('property="article:modified_time" content="2026-11-17"'), isRef, f.file + " modified_time");
  }
});
t("голова: коди підтвердження сайту з'являються лише коли задані", () => {
  const h = filesO.find((f) => f.file === "index.html").html;
  assert.ok(h.includes('name="google-site-verification" content="g-code"') && h.includes('name="msvalidate.01" content="b-code"') && h.includes('name="yandex-verification" content="y-code"'));
  const plain = files.find((f) => f.file === "index.html").html;
  assert.ok(!/site-verification|msvalidate|yandex-verification/.test(plain));
});
t("голова: довідники мають посилання на Markdown-версію, решта сторінок ні", () => {
  for (const f of filesO) assert.equal(f.html.includes('type="text/markdown"'), f.file.startsWith("ref/"), f.file);
  assert.ok(filesO.find((f) => f.file === "ref/python.html").html.includes(`<link rel="alternate" type="text/markdown" href="${SITE}/ref/python.md"`));
});
t("шаблон: справжні іконки й манифест замість емодзі в data-адресі", () => {
  assert.ok(!/rel="icon" href="data:/.test(template));
  for (const x of ['href="/favicon.ico"', 'href="/icon-192.png"', 'rel="apple-touch-icon" href="/apple-touch-icon.png"', 'rel="manifest" href="/manifest.webmanifest"', 'name="theme-color"']) assert.ok(template.includes(x), x);
});

t("JSON-LD: один граф на сторінку, @id унікальні, усі посилання {\"@id\"} ведуть до вузла в тому самому графі", () => {
  for (const f of filesO) {
    const g = graphOf(f.html), ids = g.map((n) => n["@id"]).filter(Boolean);
    assert.equal(new Set(ids).size, ids.length, f.file + " дублі @id");
    const refs = [];
    const walk = (v) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") { const k = Object.keys(v); if (k.length === 1 && k[0] === "@id") refs.push(v["@id"]); else Object.values(v).forEach(walk); } };
    g.forEach((n) => Object.entries(n).forEach(([k, v]) => k !== "@id" && walk(v)));
    const defined = new Set([...ids, ...g.flatMap((n) => (n.itemListElement ?? []).map((e) => e.item?.["@id"]).filter(Boolean))]);
    for (const r of refs) assert.ok(defined.has(r), f.file + " висяче посилання " + r);
  }
});
t("JSON-LD: на кожній сторінці Organization (logo-ImageObject, contactPoint), WebSite і сторінка потрібного типу", () => {
  const want = { "/about": "AboutPage", "/contact": "ContactPage" };
  for (const f of filesO) {
    const p = pages.find((x) => fileOf(x.path) === f.file), g = graphOf(f.html);
    const org = g.find((n) => typesOf(n).includes("Organization")), site = g.find((n) => n["@type"] === "WebSite");
    assert.ok(org && org.logo["@type"] === "ImageObject" && org.logo.url === SITE + "/icon-512.png" && org.contactPoint.url === SITE + "/contact", f.file + " Organization");
    assert.ok(site && site.inLanguage === "uk" && site.publisher["@id"] === org["@id"], f.file + " WebSite");
    const type = want[p.path] ?? (p.kind === "catalog" || p.kind === "dir" ? "CollectionPage" : "WebPage");
    const page = g.find((n) => n["@id"] === SITE + (p.path === "/" ? "/" : p.path) + "#webpage");
    assert.ok(page && page["@type"] === type && page.name === p.title && page.description === p.desc && page.dateModified === lastmodOf(p, "2026-11-17"), f.file + " " + type);
  }
});
t("JSON-LD: хлібні крихти мають послідовні позиції й закінчуються поточною сторінкою; на головній їх немає", () => {
  for (const f of filesO) {
    const p = pages.find((x) => fileOf(x.path) === f.file), g = graphOf(f.html), bc = g.find((n) => n["@type"] === "BreadcrumbList");
    if (p.kind === "home") { assert.equal(bc, undefined); continue; }
    assert.deepEqual(bc.itemListElement.map((e) => e.position), bc.itemListElement.map((_, i) => i + 1), f.file);
    assert.equal(bc.itemListElement.at(-1).item, SITE + p.path, f.file + " остання крихта");
    assert.equal(bc.itemListElement[0].item, SITE + "/");
  }
});
t("JSON-LD: FAQPage на головній дослівно збігається з видимими запитаннями й відповідями", () => {
  const f = filesO.find((x) => x.file === "index.html"), faq = graphOf(f.html).find((n) => n["@type"] === "FAQPage"), text = decode(f.html);
  assert.equal(faq.mainEntity.length, pages[0].faq.length);
  for (const q of faq.mainEntity) assert.ok(text.includes(q.name) && text.includes(q.acceptedAnswer.text), q.name);
  for (const x of filesO.filter((y) => y.file !== "index.html")) assert.ok(!graphOf(x.html).some((n) => n["@type"] === "FAQPage"), x.file);
});
t("JSON-LD: каталог і напрями мають ItemList курсів (Course безкоштовний, українською, провайдер організація)", () => {
  const cat = graphOf(filesO.find((x) => x.file === "courses.html").html).find((n) => n["@type"] === "ItemList");
  assert.equal(cat.numberOfItems, Object.keys(C).length);
  for (const e of cat.itemListElement) {
    const c = e.item;
    assert.equal(c["@type"], "Course"); assert.equal(c.isAccessibleForFree, true); assert.equal(c.inLanguage, "uk");
    assert.equal(c.provider["@id"], SITE + "/#organization"); assert.equal(c.offers.price, "0");
    assert.ok(c.name && c.description && c.url.startsWith(SITE + "/ref/"));
  }
  for (const [key, cc] of Object.entries(CATS)) {
    const il = graphOf(filesO.find((x) => x.file === key + ".html").html).find((n) => n["@type"] === "ItemList");
    assert.deepEqual(il.itemListElement.map((e) => e.item.url), cc.courses.map((k) => `${SITE}/ref/${k}`), key);
  }
});
t("JSON-LD: довідник мови це TechArticle і LearningResource з розділами в teaches", () => {
  for (const k of Object.keys(C)) {
    const a = graphOf(filesO.find((x) => x.file === `ref/${k}.html`).html).find((n) => typesOf(n).includes("TechArticle"));
    assert.ok(typesOf(a).includes("LearningResource"), k);
    assert.deepEqual(a.teaches, REF[k].map((s) => s.t), k);
    assert.equal(a.about.name, C[k].name); assert.equal(a.inLanguage, "uk"); assert.equal(a.isAccessibleForFree, true); assert.equal(a.dateModified, "2026-11-17");
  }
});
t("JSON-LD: сторінка з HTML у назві не ламає розмітку (символ < екранується в \\u003c)", () => {
  for (const f of filesO) { const raw = f.html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]; assert.ok(!raw.includes("<"), f.file); }
});

const groups = (txt) => {
  const out = []; let cur = null;
  for (const line of txt.split("\n")) {
    const m = line.match(/^User-agent:\s*(.+)$/i);
    if (m) { if (!cur || cur.rules.length) { cur = { agents: [], rules: [] }; out.push(cur); } cur.agents.push(m[1].trim()); continue; }
    const r = line.match(/^(Allow|Disallow):\s*(.*)$/i);
    if (r && cur) cur.rules.push(`${r[1]}: ${r[2]}`);
  }
  return out;
};
t("robots: група * і група відомих ботів мають однакові правила: усе відкрите, закриті адреси перелічені", () => {
  const r = robots(SITE), gs = groups(r);
  assert.equal(gs.length, 2);
  const want = ["Allow: /", ...PRIVATE_PATHS.map((x) => `Disallow: ${x}`)];
  for (const g of gs) assert.deepEqual(g.rules, want);
  assert.deepEqual(gs[0].agents, ["*"]);
  assert.deepEqual(gs[1].agents, [...AI_BOTS]);
  assert.ok(!/^Disallow:\s*\/\s*$/m.test(r), "жодного загального заборонного правила");
});
t("robots: явно названі пошуковики й ІІ-боти (OpenAI, Anthropic, Perplexity, Google, Bing, Apple), Content-Signal і Sitemap", () => {
  const r = robots(SITE);
  for (const b of ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "GPTBot", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot"]) assert.ok(r.includes(`User-agent: ${b}\n`), b);
  assert.equal(new Set(AI_BOTS).size, AI_BOTS.length);
  assert.ok(r.includes("Content-Signal: search=yes, ai-input=yes, ai-train=yes"));
  assert.ok(r.trimEnd().endsWith(`Sitemap: ${SITE}/sitemap.xml`) && r.includes(`${SITE}/llms.txt`));
  for (const p of ["/api/", "/dashboard", "/lesson/", "/course/", "/project/", "/admin"]) assert.ok(PRIVATE_PATHS.includes(p), p);
});
t("sitemap: дата зміни — переданий день, а для «Що нового» — найновіший випуск; жодних закритих адрес", () => {
  const sm = sitemap(SITE, "2020-01-01");
  const newest = RELEASES.map((x) => x.date.split(".").reverse().join("-")).sort().at(-1);
  assert.ok(sm.includes(`<loc>${SITE}${NEWS_PATH}</loc><lastmod>${newest}</lastmod>`));
  assert.ok(sm.includes(`<loc>${SITE}/courses</loc><lastmod>2020-01-01</lastmod>`));
  assert.equal((sm.match(/<url>/g) || []).length, pages.length * 2);   // кожна адреса в двох мовах
  for (const p of PRIVATE_PATHS) assert.ok(!sm.includes(`${SITE}${p.replace(/\/$/, "")}/`) && !sm.includes(`<loc>${SITE}${p}`), p);
});

const tf = textFiles(SITE, { modified: "2026-11-17" }), byFile = new Map(tf.map((x) => [x.file, x.text]));
t("файли для ІІ: llms.txt, llms-full.txt, manifest, security.txt і 13 Markdown-довідників", () => {
  for (const n of ["llms.txt", "llms-full.txt", "manifest.webmanifest", ".well-known/security.txt"]) assert.ok(byFile.get(n)?.length > 100, n);
  for (const k of Object.keys(C)) assert.ok(byFile.has(`ref/${k}.md`), k);
  assert.equal(tf.length, 4 + Object.keys(C).length);
});
t("llms.txt: за специфікацією (H1, цитата-опис, розділи H2), усі посилання абсолютні, ведуть на наші публічні сторінки або файли", () => {
  const txt = llmsTxt(SITE);
  assert.ok(txt.startsWith("# Iteris Code\n\n> "));
  assert.deepEqual(txt.match(/^## .+$/gm), ["## Основне", "## Напрями", "## Довідники мов (Markdown)", "## Службове", "## Optional"]);
  const known = new Set([...pages.map((p) => SITE + (p.path === "/" ? "/" : p.path)), `${SITE}/sitemap.xml`, `${SITE}/llms-full.txt`, `${SITE}/en/`, ...Object.keys(C).map((k) => `${SITE}/ref/${k}.md`)]);
  const links = [...txt.matchAll(/^- \[[^\]]+\]\((https?:[^)]+)\): .+$/gm)].map((m) => m[1]);
  assert.ok(links.length >= 28, "посилань " + links.length);
  for (const l of links) assert.ok(known.has(l), "невідоме посилання " + l);
  for (const k of Object.keys(C)) assert.ok(links.includes(`${SITE}/ref/${k}.md`), k);
});
t("llms.txt: не веде на закриті адреси й не містить слів, заборонених на публічних сторінках (D15)", () => {
  const txt = llmsTxt(SITE).toLowerCase();
  for (const p of PRIVATE_PATHS) assert.ok(!txt.includes(SITE + p), p);
  for (const w of ["профіл", "монет", "магазин", "пошт"]) assert.ok(!txt.includes(w), w);
});
t("llms-full.txt: опис, усі запитання й відповіді, список курсів і довідники всіх мов із кодом", () => {
  const txt = llmsFullTxt(SITE);
  assert.ok(txt.startsWith("# Iteris Code: повний опис і довідники"));
  for (const [q, a] of pages[0].faq) assert.ok(txt.includes(`### ${q}`) && txt.includes(a), q);
  for (const [k, c] of Object.entries(C)) assert.ok(txt.includes(`\n### ${c.name}: довідник синтаксису українською`) && txt.includes(`Сторінка: ${SITE}/ref/${k}`), k);
  assert.equal((txt.match(/^```/gm) || []).length % 2, 0, "кодові блоки парні");
  assert.ok(txt.length > 50000 && txt.length < 400000, "розмір " + txt.length);
});
t("Markdown-довідник: заголовок, розділи й приклади збігаються з довідником на сторінці, блоки коду з мовою", () => {
  for (const [k, secs] of Object.entries(REF)) {
    const md = refMarkdown(k, SITE);
    assert.ok(md.startsWith(`# ${C[k].name}: довідник синтаксису українською\n\n> ${C[k].desc}`), k);
    assert.equal((md.match(/^## /gm) || []).length, secs.length, k + " розділи");
    assert.equal((md.match(/^### /gm) || []).length, secs.reduce((n, s) => n + s.items.length, 0), k + " приклади");
    assert.equal((md.match(/^```/gm) || []).length, secs.reduce((n, s) => n + s.items.length, 0) * 2, k + " блоки");
    assert.ok(/^```[a-z]+$/m.test(md), k + " мова блоків");
    assert.ok(md.includes(secs[0].items[0].code.trim()), k + " код");
  }
  assert.ok(refMarkdown("js", SITE).includes("```javascript") && refMarkdown("git", SITE).includes("```bash"));
  assert.ok(refMarkdown("python", SITE, 2).startsWith("### Python: довідник"), "зсув заголовків для llms-full: мова на рівні H3 під «## Довідники мов»");
});
t("закритий вміст не потрапляє в публічні файли для ІІ: уроки, завдання, проєкти, факти кабінету", () => {
  const all = tf.map((x) => x.text).join("\n") + "\n" + filesO.map((f) => f.html).join("\n");
  const lessons = readFileSync(new URL("../content/lessons.js", import.meta.url), "utf8");
  const first = lessons.match(/title:\s*"([^"]{25,})"/)?.[1];
  if (first) assert.ok(!all.includes(first));
  assert.ok(!all.includes(FACTS.python.f[4].slice(0, 40)) && !all.includes(PROJECTS[0].starter.slice(0, 60)) && !all.includes("Купити молоко"));
});
t("manifest: назва, мова, start_url, іконки 192, 512 і maskable, колір збігається з theme-color шаблону", () => {
  const m = JSON.parse(manifest(SITE));
  assert.deepEqual([m.name, m.lang, m.start_url, m.display], ["Iteris Code", "uk", "/", "standalone"]);
  assert.equal(m.theme_color, template.match(/name="theme-color" content="([^"]+)"/)[1]);
  assert.deepEqual(m.icons.map((i) => [i.sizes, i.purpose]), [["192x192", "any"], ["512x512", "any"], ["512x512", "maskable"]]);
  for (const i of m.icons) assert.ok(readFileSync(new URL("../static" + i.src, import.meta.url)).length > 500, i.src);
});
t("іконки: PNG потрібних розмірів і favicon.ico з розмірами 16, 32 і 48", () => {
  const size = (f) => { const b = readFileSync(new URL("../static/" + f, import.meta.url)); assert.equal(b.subarray(1, 4).toString(), "PNG", f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
  assert.deepEqual(size("icon-192.png"), [192, 192]); assert.deepEqual(size("icon-512.png"), [512, 512]);
  assert.deepEqual(size("icon-maskable-512.png"), [512, 512]); assert.deepEqual(size("apple-touch-icon.png"), [180, 180]);
  const ico = readFileSync(new URL("../static/favicon.ico", import.meta.url));
  assert.equal(ico.readUInt16LE(0), 0); assert.equal(ico.readUInt16LE(2), 1);
  const dims = Array.from({ length: ico.readUInt16LE(4) }, (_, i) => ico[6 + i * 16] || 256).sort((a, b) => a - b);
  assert.deepEqual(dims, [16, 32, 48]);
});
t("security.txt (RFC 9116): Contact-адреса, Expires у майбутньому й не далі року, Canonical", () => {
  const txt = securityTxt(SITE, "2026-11-17"), exp = Date.parse(txt.match(/^Expires: (.+)$/m)[1]);
  assert.ok(txt.includes(`Contact: ${SITE}/contact`) && txt.includes(`Canonical: ${SITE}/.well-known/security.txt`));
  assert.ok(exp > Date.parse("2026-11-17") && exp - Date.parse("2026-11-17") < 365 * 86400000);
});
t("_headers: кожна закрита адреса має X-Robots-Tag noindex; llms і Markdown віддаються з правильним типом", () => {
  const h = seoHeaders();
  for (const p of PRIVATE_PATHS) { const pat = p.endsWith("/") ? p + "*" : p; assert.ok(h.includes(`${pat}\n  X-Robots-Tag: noindex, nofollow`), p); }
  assert.ok(h.includes("/llms.txt\n  Content-Type: text/plain; charset=utf-8") && h.includes("/ref/*.md\n  Content-Type: text/markdown; charset=utf-8"));
  assert.ok(!/X-Robots-Tag: noindex[^\n]*\n(?:  [^\n]+\n)*\/(?:courses|ref\/|about)/.test(h), "публічні адреси не закриваються");
});

console.log(`\nУсі перевірки сторінок пройдено: ${ok}`);
