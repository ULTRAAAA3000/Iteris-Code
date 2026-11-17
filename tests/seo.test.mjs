// Готові сторінки для пошуковиків: заголовки, canonical, Open Graph, JSON-LD, sitemap, robots, відсутність закритого вмісту. Запуск: node tests/seo.test.mjs
import assert from "node:assert/strict";
import { publicPages, findPage } from "../src/pages.ts";
import { buildPages, sitemap, robots, fileOf } from "../src/seo.ts";
import { readFileSync } from "node:fs";

const SITE = "https://example.test";
let ok = 0;
const t = (name, fn) => { try { fn(); ok++; console.log("ok  -", name); } catch (e) { console.log("FAIL -", name, "\n", e.message); process.exitCode = 1; } };
const template = readFileSync(new URL("../src/index.template.html", import.meta.url), "utf8")
  .replace("</style>", "</style>");
const pages = publicPages();
const files = buildPages(template, SITE);

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
t("JSON-LD коректний: на головній WebSite, Organization, FAQPage; на інших BreadcrumbList", () => {
  for (const f of files) {
    const blocks = [...f.html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
    const types = blocks.map((b) => b["@type"]);
    if (f.file === "index.html") assert.deepEqual(types, ["WebSite", "Organization", "FAQPage"]);
    else assert.ok(types.includes("BreadcrumbList"), f.file);
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

console.log(`\nУсі перевірки сторінок пройдено: ${ok}`);
