// Збірка: TypeScript → dist/ (esbuild). Тип-перевірка окремо: npm run check
// Файли отримують хеш у назві, тому браузер ніколи не змішає стару та нову версії сайту.
import { build } from "esbuild";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
const common = { bundle: true, format: "iife", target: "es2020", minify: true, legalComments: "none", charset: "utf8", logLevel: "info", metafile: true, entryNames: "[name]-[hash]" };
const out = async (entry) => {
  const r = await build({ ...common, entryPoints: [entry], outdir: "dist" });
  return basename(Object.keys(r.metafile.outputs).find((f) => f.endsWith(".js")));
};
const app = await out("src/main.ts");
const worker = await out("src/runner/worker.ts");

// Якщо застосунок не запустився, показуємо причину замість порожньої сторінки
const boot = `<script>
window.__IC_WORKER__ = "${worker}";
addEventListener("error", function (e) {
  var a = document.getElementById("app");
  if (!a || a.children.length) return;
  var t = e.target, m = t && t.tagName === "SCRIPT" ? "Не завантажився файл " + t.src : String((e.error && e.error.message) || e.message || "невідома помилка") + (e.filename ? " (" + e.filename.split("/").pop() + ":" + e.lineno + ")" : "");
  a.innerHTML = '<div class="card" style="margin:24px 0"><h2>Не вдалося запустити сайт</h2><p>Оновіть сторінку через Ctrl+F5. Якщо не допомогло, надішліть цей текст розробнику:</p><pre style="white-space:pre-wrap"></pre></div>';
  a.querySelector("pre").textContent = m;
}, true);
</script>
<noscript><p style="padding:24px">Для роботи сайту потрібен JavaScript.</p></noscript>
<script src="${app}"></script>`;
const html = readFileSync("index.html", "utf8");
if (!html.includes('<script src="app.js"></script>')) throw new Error("index.html: не знайдено тег <script src=\"app.js\">");
writeFileSync("dist/index.html", html.replace('<script src="app.js"></script>', boot));

// Головна сторінка завжди перевіряється заново, файли з хешем кешуються назавжди
writeFileSync("dist/_headers", `/
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/*.js
  Cache-Control: public, max-age=31536000, immutable
`);
console.log(`dist: ${app}, ${worker}`);
