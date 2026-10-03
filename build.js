// Статичний сайт: збірка лише копіює файли в dist/
const fs = require("fs");
fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist");
for (const f of ["index.html", "app.js", "lessons.js"]) fs.copyFileSync(f, "dist/" + f);
console.log("Built to dist/");
