// Закритий режим збірки (staging): robots, sitemap, заголовок noindex, плашка. Запуск: node tests/staging.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CLOSED_HEADERS, CLOSED_ROBOTS, CLOSED_SITEMAP, STAGING_RIBBON, robots, withRibbon } from "../src/seo.ts";

let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("ok  -", name); };

test("закритий robots забороняє все, а відкритий нічого не змінює", () => {
  assert.match(CLOSED_ROBOTS, /User-agent: \*\nDisallow: \/\n/);
  assert.ok(!/Allow: \//.test(CLOSED_ROBOTS));
  assert.match(robots("https://example.test"), /Allow: \//);   // основний сайт: правила як раніше
});
test("закритий sitemap порожній, заголовок noindex є", () => {
  assert.ok(CLOSED_SITEMAP.includes("<urlset") && !CLOSED_SITEMAP.includes("<url>"));
  assert.match(CLOSED_HEADERS, /X-Robots-Tag: noindex, nofollow/);
});
test("плашка вставляється перед </body> один раз і не перехоплює кліки", () => {
  const out = withRibbon("<html><body><p>x</p></body></html>");
  assert.equal(out.split("STAGING").length - 1, 1);
  assert.ok(out.indexOf("STAGING") < out.indexOf("</body>"));
  assert.match(STAGING_RIBBON, /pointer-events:none/);
  assert.equal(withRibbon("<p>x</p>").includes("STAGING"), true);
});
test("build.mjs вмикає закритий режим лише для STAGING=1 або гілки не main", () => {
  const b = readFileSync(new URL("../build.mjs", import.meta.url), "utf8");
  assert.match(b, /process\.env\.STAGING === "1"/);
  assert.match(b, /CF_PAGES_BRANCH !== \(process\.env\.PRODUCTION_BRANCH \|\| "main"\)/);
  assert.match(b, /CLOSED \? seo\.CLOSED_ROBOTS : seo\.robots\(SITE\)/);
});
console.log(`\nУсі перевірки закритого режиму пройдено: ${passed}`);
