// Збірка: TypeScript → dist/ (esbuild). Тип-перевірка окремо: npm run check
import { build } from "esbuild";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");
const common = { bundle: true, format: "iife", target: "es2020", minify: true, legalComments: "none", charset: "utf8", logLevel: "info" };
await build({ ...common, entryPoints: ["src/main.ts"], outfile: "dist/app.js" });
await build({ ...common, entryPoints: ["src/runner/worker.ts"], outfile: "dist/runner.worker.js" });
copyFileSync("index.html", "dist/index.html");
