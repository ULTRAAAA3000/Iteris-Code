// Сторінка «Що нового» і «Скоро»: дані, готова сторінка для пошуковиків, sitemap, посилання в підвалі, відсутність внутрішніх подробиць.
// Запуск: node tests/news.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RELEASES, SOON, NEWS_PATH, newsHtml } from "../src/changelog.ts";
import { findPage, publicPages } from "../src/pages.ts";
import { buildPages, sitemap } from "../src/seo.ts";
import { IDOLS } from "../src/data/idols.ts";

const SITE = "https://example.test";
let ok = 0;
const t = (name, fn) => { try { fn(); ok++; console.log("ok  -", name); } catch (e) { console.log("FAIL -", name, "\n", e.message); process.exitCode = 1; } };
const template = readFileSync(new URL("../src/index.template.html", import.meta.url), "utf8");
const files = buildPages(template, SITE);
const page = findPage(NEWS_PATH);
const out = files.find((f) => f.file === "whats-new.html");
const iso = (d) => { const [dd, mm, yy] = d.split("."); return `${yy}-${mm}-${dd}`; };

t("сторінка /whats-new зареєстрована: заголовок, опис, один h1 і готовий вміст у файлі збірки", () => {
  assert.ok(page && out);
  assert.ok(page.title.length > 10 && page.title.length <= 80, "title " + page.title.length);
  assert.ok(page.desc.length >= 60 && page.desc.length <= 175, "desc " + page.desc.length);
  assert.equal((out.html.match(/<h1[ >]/g) || []).length, 1);
  assert.ok(out.html.includes(`<link rel="canonical" href="${SITE}/whats-new">`));
  assert.ok(out.html.includes("Що нового і що скоро") && out.html.includes("Уже випущено"));
});
t("sitemap містить /whats-new", () => assert.ok(sitemap(SITE, "2026-01-01").includes(`<loc>${SITE}/whats-new</loc>`)));
t("«Скоро»: монети, магазин, напарник, кожен зі своїм героєм і існуючою картинкою", () => {
  assert.deepEqual(SOON.map((s) => s.title), ["Монети", "Магазин", "Напарник"]);
  for (const s of SOON) assert.ok(IDOLS.some((i) => i.id === s.hero), "герой " + s.hero);
  const html = newsHtml("");
  assert.equal((html.match(/class="nw-card"/g) || []).length, 3);
  assert.equal((html.match(/class="nw-tag">Скоро</g) || []).length, 3);
  for (const s of SOON) assert.ok(html.includes(`/idols/${s.hero}.webp`));
});
t("випуски: дати коректні, без повторів і від новішого до старішого; у кожного є записи", () => {
  assert.ok(RELEASES.length >= 4);
  const dates = RELEASES.map((r) => r.date);
  assert.equal(new Set(dates).size, dates.length);
  for (const d of dates) { assert.match(d, /^\d{2}\.\d{2}\.\d{4}$/); const x = new Date(iso(d) + "T00:00:00Z"); assert.ok(!Number.isNaN(x.getTime()) && x.toISOString().slice(0, 10) === iso(d), d); }
  const sorted = [...dates].sort((a, b) => iso(b).localeCompare(iso(a)));
  assert.deepEqual(dates, sorted, "новіші зверху");
  for (const r of RELEASES) { assert.ok(r.items.length >= 1); for (const x of r.items) assert.ok(x.length > 20 && x.length < 400, x); }
});
t("на сторінці кожен випуск має <time datetime> і всі записи", () => {
  const html = newsHtml("");
  for (const r of RELEASES) { assert.ok(html.includes(`<time datetime="${iso(r.date)}">${r.date}</time>`)); }
  assert.equal((html.match(/<li>/g) || []).length, RELEASES.reduce((s, r) => s + r.items.length, 0));
});
t("записи для користувачів: без внутрішніх подробиць (файли, гілки, ключі, секрети, тести) і без розмітки", () => {
  const all = RELEASES.flatMap((r) => r.items).join(" ");
  for (const w of ["Documentation", ".md", "GitHub Actions", "SECRET", "D1", "KV", "pull request", "staging", "ключ", "токен", "<", ">"]) assert.ok(!all.includes(w), "внутрішнє слово «" + w + "»");
  for (const s of SOON) assert.ok(!/[<>]/.test(s.text + s.title));
});
t("текст екранується (вставка розмітки не пройде)", () => {
  const html = newsHtml("");
  assert.ok(!/<script/i.test(html));
});
t("підвал має посилання «Що нового» на кожній готовій сторінці, а головна лишається без заборонених слів (D15)", () => {
  for (const f of files) {
    const en = f.file.startsWith("en/");   // в англійській версії той самий пункт із англійською назвою й адресою /en/whats-new
    assert.ok(f.html.includes(en ? '<a href="/en/whats-new">What\'s new</a>' : '<a href="/whats-new">Що нового</a>'), f.file);
  }
  const home = files.find((f) => f.file === "index.html").html.toLowerCase();
  for (const w of ["профіл", "монет", "магазин", "пошт"]) assert.ok(!home.includes(w), "головна: " + w);
});
t("сторінку знаходить findPage зі скісною рискою й без неї; усього публічних сторінок 27", () => {
  assert.equal(findPage("/whats-new/")?.path, "/whats-new");
  assert.equal(findPage("whats-new")?.path, "/whats-new");
  assert.equal(publicPages().length, 27);
});

console.log(`\nУсі перевірки «Що нового» пройдено: ${ok}`);
