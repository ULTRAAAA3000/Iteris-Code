// Англійська версія публічних сторінок: повнота, збіг структури з українською, адреси, hreflang, sitemap, шапка й підвал.
// Запуск: npm run build && node tests/i18n.test.mjs  (Node 22+, потрібен jsdom для демо)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

import { C, CATS } from "../src/data.ts";
import { REF } from "../src/data/reference/index.ts";
import { CHROME_EN, altsFor, chromeHtml } from "../src/chrome.ts";
import { catDesc, catTitle, CAT_EN, COURSE_EN, courseDesc, courseName } from "../src/i18n-data.ts";
import { refSections } from "../src/i18n-ref.ts";
import { enResult } from "../src/i18n-runner.ts";
import { cnt, getLang, inLang, setLang, splitLang, tr, withLang } from "../src/i18n.ts";
import { BRAND, findPage, publicPages } from "../src/pages.ts";
import { buildPages, fileOf, headTags, jsonLd, llmsTxt, sitemap } from "../src/seo.ts";
import { RELEASES, SOON } from "../src/changelog.ts";
import { DEMO_HINTS, DEMO_HINTS_EN, DEMO_JS, DEMO_JS_EN, DEMO_HTML, DEMO_HTML_EN, DEMO_CSS, DEMO_CSS_EN, DEMO_PY, DEMO_PY_EN, demoHtml, demoTask, demoHints } from "../src/demo.ts";
import { PRIVACY_HTML, PRIVACY_HTML_EN, TERMS_HTML, TERMS_HTML_EN } from "../src/legal.ts";
import { TOPICS, TOPICS_EN } from "../src/support.ts";
import { runSuite } from "../src/runner/core.ts";
import { buildPageDoc, evalPageChecks } from "../src/runner/page.ts";

const SITE = "https://iteris-code.pages.dev";
const CY = /[А-Яа-яІіЇїЄєҐґ]/;
// build.mjs додає до шаблону блок <noscript>; повторюємо це, щоб перевіряти той самий вхід, що й збірка
const template = readFileSync(new URL("../src/index.template.html", import.meta.url), "utf8").replace("</body>", '<noscript><p style="padding:24px">Для роботи сайту потрібен JavaScript.</p></noscript></body>');
// У шапці лишаються лише ці українські слова: підпис перемикача й назва мови власною мовою
const ALLOWED = ["Мова / Language", "Українська"];
const visible = (h) => h.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");
const cyrOf = (h) => { let t = visible(h); for (const a of ALLOWED) t = t.split(a).join(""); return t.match(/[^<>"]{0,40}[А-Яа-яІіЇїЄєҐґ]+[^<>"]{0,30}/g) ?? []; };
const skeleton = (h) => h.replace(/>[^<]+</g, "><").replace(/(aria-label|title|alt|placeholder|value|content|datetime)="[^"]*"/g, '$1=""').replace(/href="\/en(\/[^"]*)?"/g, (_m, p) => `href="${p ?? "/"}"`).replace(/\s+/g, " ");

let passed = 0;
const test = async (name, fn) => { setLang("uk"); await fn(); passed++; console.log("ok  -", name); };
const uk = publicPages("uk"), en = publicPages("en");

await test("адреси: splitLang, withLang, публічні адреси отримують /en, кабінет і форми входу ні", () => {
  assert.deepEqual(splitLang("/en/courses"), { lang: "en", path: "/courses" });
  assert.deepEqual(splitLang("/en"), { lang: "en", path: "/" });
  assert.deepEqual(splitLang("/en/"), { lang: "en", path: "/" });
  assert.deepEqual(splitLang("/engine"), { lang: null, path: "/engine" });          // не плутаємо /en з /engine
  assert.deepEqual(splitLang("/courses"), { lang: null, path: "/courses" });
  assert.equal(withLang("/", "en"), "/en/"); assert.equal(withLang("/courses", "en"), "/en/courses"); assert.equal(withLang("/ref/js", "en"), "/en/ref/js");
  assert.equal(withLang("/courses", "uk"), "/courses"); assert.equal(withLang("/", "uk"), "/");
  for (const app of ["/dashboard", "/register", "/login", "/path", "/lesson/js/1", "/profile", "/u/someone", "/api/me", "/favicon.ico", "https://x.ua/a", "//cdn.x.ua/a"]) assert.equal(withLang(app, "en"), app, app);
  assert.equal(withLang("/courses?x=1#top", "en"), "/en/courses?x=1#top");
  assert.equal(withLang("/courses.html", "en"), "/en/courses.html");
  setLang("en"); assert.equal(getLang(), "en"); assert.equal(tr("а", "b"), "b"); setLang("uk"); assert.equal(tr("а", "b"), "а");
  assert.equal(inLang("en", () => tr("а", "b")), "b"); assert.equal(getLang(), "uk");
  assert.equal(inLang("en", () => cnt(1, "lesson")), "1 lesson"); assert.equal(inLang("en", () => cnt(5, "lesson")), "5 lessons");
  assert.equal(cnt(1, "lesson"), "1 урок"); assert.equal(cnt(3, "lesson"), "3 уроки"); assert.equal(cnt(11, "lesson"), "11 уроків"); assert.equal(cnt(21, "course"), "21 курс");
});

await test("реєстр: ті самі сторінки в обох мовах, у кожної своя мова, адреси без префікса", () => {
  assert.deepEqual(uk.map((p) => p.path), en.map((p) => p.path));
  assert.ok(uk.length >= 24);
  assert.ok(uk.every((p) => p.lang === "uk") && en.every((p) => p.lang === "en"));
  assert.ok(findPage("/courses", "en") && findPage("/courses", "en").lang === "en" && findPage("/courses", "uk").lang === "uk");
  assert.equal(findPage("/en/courses", "en"), undefined);
  assert.equal(findPage("/dashboard", "en"), undefined);
});

await test("англійські сторінки не містять кирилиці (для гостя й для користувача, що увійшов)", () => {
  for (const p of en) for (const li of [false, true]) { const c = cyrOf(p.html(li)); assert.deepEqual(c, [], `${p.path} (loggedIn=${li}): ${c.slice(0, 3).join(" | ")}`); }
  for (const p of en) { assert.ok(!CY.test(p.title), p.path + " title"); assert.ok(!CY.test(p.desc), p.path + " desc"); for (const [n] of p.crumbs) assert.ok(!CY.test(n), p.path + " crumb"); }
});

await test("українські сторінки не змінилися: українська лишається мовою за замовчуванням", () => {
  for (const p of uk) assert.ok(CY.test(p.html(false)), p.path);
  assert.ok(uk.find((p) => p.path === "/").title.includes("українською"));
  assert.ok(uk.find((p) => p.path === "/").html(false).includes('href="/courses"'));
});

await test("структура однакова: українська й англійська версія мають ту саму розмітку (різниться лише текст)", () => {
  for (const p of uk) {
    const e = en.find((x) => x.path === p.path);
    for (const li of [false, true]) assert.equal(skeleton(e.html(li)), skeleton(p.html(li)), `${p.path} (loggedIn=${li})`);
  }
});

await test("посилання: в англійських сторінках публічні адреси ведуть на /en, кабінетні лишаються без префікса", () => {
  const pub = new Set(uk.map((p) => p.path));
  for (const p of en) {
    const links = p.html(false).replace(/<pre[\s\S]*?<\/pre>/g, "");   // приклади коду з href у довідниках не є посиланнями сторінки
    const hrefs = [...links.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]);
    assert.ok(hrefs.length > 0, p.path);
    for (const h of hrefs) {
      const { lang, path } = splitLang(h);
      if (pub.has(path)) assert.equal(lang, "en", `${p.path} → ${h} має вести на англійську версію`);
      else assert.equal(lang, null, `${p.path} → ${h}: не публічна адреса не повинна мати /en`);
    }
  }
  for (const p of uk) for (const m of p.html(false).replace(/<pre[\s\S]*?<\/pre>/g, "").matchAll(/href="(\/[^"#?]*)/g)) assert.equal(splitLang(m[1]).lang, null, `${p.path}: українські сторінки не посилаються на /en`);
});

await test("SEO: canonical, hreflang обох мов і x-default, мова документа, og:locale, JSON-LD", () => {
  for (const p of uk) {
    const e = en.find((x) => x.path === p.path);
    const cu = SITE + withLang(p.path, "uk"), ce = SITE + withLang(p.path, "en");
    for (const [page, own, lang, loc, other] of [[p, cu, "uk", "uk_UA", "en_US"], [e, ce, "en", "en_US", "uk_UA"]]) {
      const h = headTags(page, SITE, { modified: "2026-11-20" });
      assert.ok(h.includes(`<link rel="canonical" href="${own}">`), page.lang + p.path);
      assert.ok(h.includes(`hreflang="uk" href="${cu}"`) && h.includes(`hreflang="en" href="${ce}"`) && h.includes(`hreflang="x-default" href="${cu}"`), page.lang + p.path);
      assert.ok(h.includes(`<meta property="og:locale" content="${loc}">`) && h.includes(`<meta property="og:locale:alternate" content="${other}">`));
      assert.ok(h.includes(`<meta property="og:url" content="${own}">`));
      assert.ok(!(lang === "en" && CY.test(h.replace(/<script[\s\S]*?<\/script>/g, ""))), "head англійської сторінки без кирилиці " + p.path);
      const ld = JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
      const web = ld["@graph"].find((n) => n["@type"] === "WebSite");
      assert.equal(web.inLanguage, lang); assert.equal(web.url, SITE + withLang("/", lang));
      const pg = ld["@graph"].find((n) => String(n["@id"]).endsWith("#webpage"));
      assert.equal(pg.url, own); assert.equal(pg.inLanguage, lang);
      if (lang === "en") assert.ok(!CY.test(jsonLd(page, SITE, {})), "JSON-LD без кирилиці " + p.path);
    }
  }
  const home = en.find((p) => p.path === "/");
  const ld = JSON.parse(headTags(home, SITE).match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const faq = ld["@graph"].find((n) => n["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, 8); assert.ok(faq.mainEntity[0].name.startsWith("Is it really free"));
});

await test("файли збірки: окремий файл на кожну сторінку кожної мови, англійські в en/", () => {
  const out = buildPages(template, SITE, { modified: "2026-11-20" });
  assert.equal(out.length, uk.length * 2);
  assert.equal(new Set(out.map((f) => f.file)).size, out.length);
  assert.equal(fileOf("/", "en"), "en/index.html"); assert.equal(fileOf("/courses", "en"), "en/courses.html"); assert.equal(fileOf("/ref/js", "en"), "en/ref/js.html"); assert.equal(fileOf("/ref/js"), "ref/js.html");
  for (const f of out.filter((x) => x.file.startsWith("en/"))) {
    assert.match(f.html, /<html lang="en">/); assert.deepEqual(cyrOf(f.html), [], f.file);
    assert.equal((f.html.match(/<h1[ >]/g) || []).length, 1, f.file + ": один h1");
  }
  for (const f of out.filter((x) => !x.file.startsWith("en/"))) assert.match(f.html, /<html lang="uk">/);
});

await test("sitemap: усі адреси обох мов, кожна з посиланнями на мовні версії", () => {
  const x = sitemap(SITE, "2026-11-20");
  assert.equal((x.match(/<url>/g) || []).length, uk.length * 2);
  assert.ok(x.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'));
  for (const p of uk) {
    assert.ok(x.includes(`<loc>${SITE}${withLang(p.path, "uk")}</loc>`) && x.includes(`<loc>${SITE}${withLang(p.path, "en")}</loc>`), p.path);
  }
  assert.ok(x.includes(`<xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/courses"/>`) && x.includes(`<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/courses"/>`));
  assert.ok(llmsTxt(SITE, {}).includes(`${SITE}/en/`));
});

await test("SEO-обмеження в обох мовах: унікальні title і опис, довжини в межах", () => {
  for (const list of [uk, en]) {
    assert.equal(new Set(list.map((p) => p.title)).size, list.length); assert.equal(new Set(list.map((p) => p.desc)).size, list.length);
    for (const p of list) { assert.ok(p.title.length <= 80 && p.title.includes(BRAND.split(" ")[0]), p.path + " title: " + p.title.length); assert.ok(p.desc.length >= 50 && p.desc.length <= 175, p.path + " desc: " + p.desc.length); }
  }
});

await test("шапка й підвал: англійський шаблон без кирилиці, посилання з /en, перемикач із двома адресами", () => {
  for (const [k] of CHROME_EN) assert.ok(template.includes(k), "у шаблоні немає фрази для перекладу: " + k);
  const h = chromeHtml(template, "en", altsFor("/courses"));
  assert.deepEqual(cyrOf(h), []);
  assert.match(h, /<html lang="en">/);
  assert.ok(h.includes('href="/en/courses"') && h.includes('href="/en/"') && h.includes('href="/en/privacy"'));
  assert.ok(h.includes('href="/path"') && !h.includes('href="/en/path"'));           // «Шлях» це кабінет, адреса одна на всі мови
  assert.ok(h.includes('data-lang="uk"') && h.includes('hreflang="en" lang="en" data-lang="en" title="English" aria-current="true"'));
  assert.ok(h.includes('href="/courses" hreflang="uk"') && h.includes('href="/en/courses" hreflang="en"'));
  const u = chromeHtml(template, "uk", altsFor("/courses"));
  assert.ok(u.includes('data-lang="uk" title="Українська" aria-current="true"') && u.includes("Курси") && !u.includes("<!--lang-->"));
  assert.equal(new Set(CHROME_EN.map(([a]) => a)).size, CHROME_EN.length);
});

await test("довідники: англійська версія має ту саму структуру, код без кирилиці, рядки без українських слів не змінені", () => {
  for (const k of Object.keys(C)) {
    const a = REF[k], b = inLang("en", () => refSections(k));
    assert.equal(b.length, a.length, k);
    a.forEach((s, i) => {
      assert.ok(!CY.test(b[i].t), `${k}: ${b[i].t}`); assert.equal(b[i].items.length, s.items.length);
      s.items.forEach((x, j) => {
        const y = b[i].items[j];
        assert.ok(!CY.test(y.t) && !CY.test(y.note ?? "") && !CY.test(y.code), `${k}/${s.t}/${x.t}: ${[y.t, y.note, y.code].filter((z) => CY.test(z ?? "")).join(" | ").slice(0, 80)}`);
        assert.equal(!!y.note, !!x.note);
        const l1 = x.code.split("\n"), l2 = y.code.split("\n");
        assert.equal(l2.length, l1.length);
        l1.forEach((line, n) => { if (!CY.test(line)) assert.equal(l2[n], line, "код без українського тексту має лишитись незмінним"); });
      });
    });
  }
  assert.equal(refSections("python")[0].t, REF.python[0].t);            // поза англійською мовою дані не змінюються
  assert.equal(inLang("en", () => refSections("python"))[0].t, "Output and input");
});

await test("напрями й курси: переклад є для кожного ключа, без кирилиці", () => {
  assert.deepEqual(Object.keys(CAT_EN).sort(), Object.keys(CATS).sort()); assert.deepEqual(Object.keys(COURSE_EN).sort(), Object.keys(C).sort());
  inLang("en", () => { for (const k of Object.keys(C)) { assert.ok(!CY.test(courseName(k)) && !CY.test(courseDesc(k)), k); } for (const k of Object.keys(CATS)) assert.ok(!CY.test(catTitle(k)) && !CY.test(catDesc(k)), k); });
  assert.equal(inLang("en", () => courseName("bash")), "Command line"); assert.equal(courseName("bash"), C.bash.name);
});

await test("новини: кожен запис і анонс має переклад з тією самою кількістю пунктів", () => {
  for (const r of RELEASES) { assert.equal(r.en.length, r.items.length, r.date); r.en.forEach((x) => assert.ok(!CY.test(x) && x.length > 15, x)); }
  for (const s of SOON) assert.ok(s.titleEn && s.textEn && !CY.test(s.titleEn + s.textEn));
  const nw = en.find((p) => p.path === "/whats-new" || p.title.includes("What's new")); assert.ok(nw);
  assert.ok(nw.html(false).includes("17 Nov 2026") && !nw.html(false).includes("17.11.2026"));
  assert.ok(uk.find((p) => p.path === nw.path).html(false).includes("17.11.2026"));
});

await test("юридичні сторінки: переклад має ті самі розділи, списки й таблицю", () => {
  for (const [a, b, facts] of [[PRIVACY_HTML, PRIVACY_HTML_EN, ["30 days", "90 days", "uoou.cz"]], [TERMS_HTML, TERMS_HTML_EN, ["Czech Republic", "<b>15</b>"]]]) {
    for (const tag of ["<h2>", "<li>", "<p>", "<b>", "<table>", "<tr>", "<a "]) assert.equal((b.match(new RegExp(tag, "g")) || []).length, (a.match(new RegExp(tag, "g")) || []).length, tag);
    assert.ok(!CY.test(b));
    for (const fact of ["AKERR-SHY s.r.o.", "04346360", "privacy@iteris-code.org", ...facts]) assert.ok(b.includes(fact), fact);   // реквізити й строки зберігаються дослівно
  }
  const priv = en.find((p) => p.path === "/privacy").html(false), terms = en.find((p) => p.path === "/terms").html(false);
  assert.ok(terms.includes('href="/en/privacy"') && !terms.includes('href="/privacy"'));
});

await test("демо: англійські завдання працюють так само (еталони проходять, заготовки ні), підказки й тести парні", async () => {
  const jsOk = await runSuite("function double(n) { return n * 2; }", DEMO_JS_EN.tests);
  assert.ok(jsOk.results.length === 3 && jsOk.results.every((r) => r.passed));
  assert.ok(!(await runSuite(DEMO_JS_EN.starter, DEMO_JS_EN.tests)).results.every((r) => r.passed));
  assert.equal((await runSuite("function double(n){return 0}", DEMO_JS_EN.tests)).results.length, (await runSuite("function double(n){return 0}", DEMO_JS.tests)).results.length);
  const page = (t, code) => { const d = new JSDOM(buildPageDoc(t, code)); return evalPageChecks(t.checks, d.window.document, d.window, code); };
  assert.ok(page(DEMO_HTML_EN, DEMO_HTML_EN.starter.replace(/<!--.*?-->/, "<h1>Hello</h1><button>Ok</button>")).every((r) => r.passed));
  assert.ok(page(DEMO_HTML_EN, DEMO_HTML_EN.starter).every((r) => !r.passed));
  assert.ok(page(DEMO_CSS_EN, "h1{color:#2563eb;text-align:center}button{background-color:#16a34a}").every((r) => r.passed));
  assert.ok(page(DEMO_CSS_EN, DEMO_CSS_EN.starter).every((r) => !r.passed));
  for (const [e, u] of [[DEMO_JS_EN, DEMO_JS], [DEMO_HTML_EN, DEMO_HTML], [DEMO_CSS_EN, DEMO_CSS], [DEMO_PY_EN, DEMO_PY]]) {
    assert.equal(e.id, u.id); assert.equal(e.xp, 0); assert.equal(e.brief.length, u.brief.length);
    assert.ok(![e.title, e.context, e.starter, ...e.brief].some((x) => CY.test(x)), e.id);
    if (e.checks) { assert.equal(e.checks.length, u.checks.length); assert.ok(!e.checks.some((c) => CY.test(JSON.stringify(c))), e.id); }
  }
  assert.deepEqual(Object.keys(DEMO_HINTS_EN), Object.keys(DEMO_HINTS));
  for (const k of Object.keys(DEMO_HINTS)) { assert.equal(DEMO_HINTS_EN[k].length, DEMO_HINTS[k].length, k); assert.ok(!DEMO_HINTS_EN[k].some((x) => CY.test(x))); }
  assert.deepEqual(DEMO_PY_EN.checks.map((c) => c.has ?? c.equals), ["Hello", "12", "Hello\n12"]);
  assert.equal(inLang("en", () => demoTask("python").id), "demo-py"); assert.equal(inLang("en", () => demoHints("css").length), 3);
  assert.ok(!CY.test(inLang("en", () => demoHtml())));
});

await test("повідомлення раннера англійською: типові рядки перекладаються, невідомі лишаються", () => {
  assert.equal(enResult("очікувалось 8, отримано undefined"), "expected 8, got undefined");
  assert.equal(enResult("очікувалось ≈ 0.3, отримано 0.30000000000000004"), "expected ≈ 0.3, got 0.30000000000000004");
  assert.equal(enResult("Синтаксична помилка: Unexpected end of input"), "Syntax error: Unexpected end of input");
  assert.equal(enResult("Перевищено час виконання. Імовірно, у коді нескінченний цикл."), "Time limit exceeded. The code probably has an infinite loop.");
  assert.equal(enResult("у виводі немає «Hello»"), "the output does not contain “Hello”");
  assert.equal(enResult("код завершення 1"), "exit code 1");
  assert.equal(enResult("SyntaxError: x"), "SyntaxError: x");
  assert.ok(!CY.test(enResult("очікувалось [функція], отримано 5")));
});

await test("форма підтримки: теми мають переклад, англійська розмітка без кирилиці", () => {
  assert.deepEqual(Object.keys(TOPICS_EN), Object.keys(TOPICS));
  Object.values(TOPICS_EN).forEach((t) => assert.ok(!CY.test(t)));
  const c = en.find((p) => p.path === "/contact").html(false);
  assert.ok(c.includes("Effects and visuals") && c.includes('id="ct-form"') && c.includes(">Send<"));
});

console.log(`\nУсі тести англійської версії пройдено: ${passed}`);
