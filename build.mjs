// Збірка: TypeScript → dist/ (esbuild). Тип-перевірка окремо: npm run check
// Файли отримують хеш у назві, тому браузер ніколи не змішає стару та нову версії сайту.
import { build } from "esbuild";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
// Домен сайту й піддомен кабінету (кабінет відкривається на dashboard.<домен>). Змінні необовʼязкові: ROOT_DOMAIN, DASH_SUBDOMAIN
const ROOT = (process.env.ROOT_DOMAIN || "iteris-code.org").toLowerCase();
const DASH = (process.env.DASH_SUBDOMAIN || "dashboard").toLowerCase();
const common = { define: { __ROOT__: JSON.stringify(ROOT), __DASH__: JSON.stringify(DASH) }, bundle: true, format: "iife", target: "es2020", minify: true, legalComments: "none", charset: "utf8", logLevel: "info", metafile: true, entryNames: "[name]-[hash]" };
const out = async (entry) => {
  const r = await build({ ...common, entryPoints: [entry], outdir: "dist" });
  return basename(Object.keys(r.metafile.outputs).find((f) => f.endsWith(".js")));
};
const app = await out("src/main.ts");
const worker = await out("src/runner/worker.ts");

// Генератор готових сторінок (src/seo.ts) збирається тим самим esbuild і запускається тут, у Node
const seoOut = (await build({ entryPoints: ["src/seo.ts"], bundle: true, format: "esm", platform: "node", target: "node22", write: false, logLevel: "error" })).outputFiles[0].text;
const seo = await import("data:text/javascript;base64," + Buffer.from(seoOut).toString("base64"));
// Адреса сайту для canonical, Open Graph і sitemap: змінна SITE_URL у Cloudflare, інакше основний домен
const SITE = (process.env.SITE_URL || "https://iteris-code.pages.dev").replace(/\/+$/, "");

// Якщо застосунок не запустився, показуємо причину замість порожньої сторінки
const boot = `<script>
window.__IC_WORKER__ = "/${worker}";
addEventListener("error", function (e) {
  var a = document.getElementById("app");
  if (!a || a.children.length) return;
  var t = e.target, m = t && t.tagName === "SCRIPT" ? "Не завантажився файл " + t.src : String((e.error && e.error.message) || e.message || "невідома помилка") + (e.filename ? " (" + e.filename.split("/").pop() + ":" + e.lineno + ")" : "");
  a.innerHTML = '<div class="card" style="margin:24px 0"><h2>Не вдалося запустити сайт</h2><p>Оновіть сторінку через Ctrl+F5. Якщо не допомогло, надішліть цей текст розробнику:</p><pre style="white-space:pre-wrap"></pre></div>';
  a.querySelector("pre").textContent = m;
}, true);
</script>
<noscript><p style="padding:24px">Для роботи сайту потрібен JavaScript.</p></noscript>
<script src="/${app}"></script>`;
const html = readFileSync("src/index.template.html", "utf8");
if (!html.includes("{{title}}") || !html.includes("<!--seo-->")) throw new Error("src/index.template.html: немає {{title}} або <!--seo-->");
if (!html.includes('<script src="app.js"></script>')) throw new Error("src/index.template.html: не знайдено тег <script src=\"app.js\">");
// Стилі Етапу 2 лежать окремим файлом і вбудовуються в єдиний <style> сторінки
const stage2css = readFileSync("src/stage2.css", "utf8") + readFileSync("src/landing.css", "utf8") + readFileSync("src/profile.css", "utf8") + readFileSync("src/support.css", "utf8");
if (!html.includes("</style>")) throw new Error("src/index.template.html: не знайдено </style>");
const template = html.replace("</style>", () => stage2css + "</style>").replace('<script src="app.js"></script>', () => boot).replaceAll("__ROOT__", ROOT).replaceAll("__DASH__", DASH);
// Кожна публічна сторінка отримує власний HTML: заголовок, опис, canonical, Open Graph, JSON-LD і готовий вміст
const pages = seo.buildPages(template, SITE);
for (const f of pages) {
  mkdirSync(dirname("dist/" + f.file), { recursive: true });
  writeFileSync("dist/" + f.file, f.html);
}
writeFileSync("dist/sitemap.xml", seo.sitemap(SITE, new Date().toISOString().slice(0, 10)));
writeFileSync("dist/robots.txt", seo.robots(SITE));
if (existsSync("static")) cpSync("static", "dist", { recursive: true });

// Сумісність зі старими закешованими сторінками: вони все ще просять app.js.
// Цей файл один раз оновлює кеш головної сторінки й перезавантажує її (петлі немає: прапорець у sessionStorage).
writeFileSync("dist/app.js", `(function () {
  try {
    if (sessionStorage.getItem("ic-refreshed")) return;
    sessionStorage.setItem("ic-refreshed", "1");
  } catch (e) { return; }
  fetch("/", { cache: "reload" }).then(function () { location.reload(); }, function () {});
})();
`);

// Головна сторінка завжди перевіряється заново, файли з хешем кешуються назавжди.
// Правила без перетину шаблонів: інакше Cloudflare склеює заголовки з кількох правил.
writeFileSync("dist/_headers", `/
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
${pages.filter((f) => f.file !== "index.html").map((f) => `/${f.file}\n  Cache-Control: no-cache\n/${f.file.replace(/\.html$/, "")}\n  Cache-Control: no-cache\n`).join("")}/sitemap.xml
  Cache-Control: no-cache
/app.js
  Cache-Control: no-store
  Clear-Site-Data: "cache"
/idols/*
  Cache-Control: public, max-age=86400
/${app}
  Cache-Control: public, max-age=31536000, immutable
/${worker}
  Cache-Control: public, max-age=31536000, immutable
`);
console.log(`dist: ${app}, ${worker}, сторінок: ${pages.length}`);

// У Cloudflare Pages (CF_PAGES=1) дублюємо готові файли в корінь репозиторію.
// Так сайт працює незалежно від того, чи в налаштуваннях Build output directory вказано "dist" чи "/".
// Ці файли створюються лише під час збірки на сервері й не потрапляють у git (.gitignore).
if (process.env.CF_PAGES) {
  cpSync("dist", ".", { recursive: true });
  console.log("CF_PAGES: готові файли скопійовано в корінь");
}
