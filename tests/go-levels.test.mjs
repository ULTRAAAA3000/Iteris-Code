// Go: проєкти за ТЗ із серверним запуском (/api/project, /api/project-run, підпис, XP) і рівні курсу (/api/level, /api/courses).
// Go Playground підміняється, мережа не потрібна. Запуск: node tests/go-levels.test.mjs  (Node 22+)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { createSession, sessionCookie } from "../lib/session.ts";
import { onRequestPost as projectRun } from "../functions/api/project-run.ts";
import { onRequestGet as projectGet } from "../functions/api/project.ts";
import { onRequestPost as complete } from "../functions/api/progress/complete.ts";
import { onRequestGet as courses } from "../functions/api/courses.ts";
import { onRequestPost as level } from "../functions/api/level.ts";
import { PROGRAM_PROJECTS, projectForLesson } from "../content/projects/index.ts";
import { LESSONS } from "../content/lessons.js";
import { parseVerdicts } from "../lib/project-run.ts";

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../schema.sql", import.meta.url), "utf8"));
const stmt = (q) => ({
  q, p: [],
  bind(...a) { this.p = a; return this; },
  async first() { return sqlite.prepare(q).get(...this.p) ?? null; },
  async all() { return { results: sqlite.prepare(q).all(...this.p) }; },
  async run() { const r = sqlite.prepare(q).run(...this.p); return { success: true, meta: { changes: Number(r.changes) } }; },
});
const env = { DB: { prepare: stmt }, SESSION_SECRET: "s".repeat(40) };
const ORIGIN = "https://iteris-code.pages.dev";
const post = (path, body, cookie) => new Request(ORIGIN + path, { method: "POST", headers: { Origin: ORIGIN, "Content-Type": "application/json", "CF-Connecting-IP": "2.2.2.2", ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify(body) });
const get = (path, cookie) => new Request(ORIGIN + path, { headers: cookie ? { Cookie: cookie } : {} });
const call = async (fn, r) => { const res = await fn({ request: r, env }); return { status: res.status, data: await res.json() }; };
const login = async (id) => {
  sqlite.prepare("INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)").run(id, id + "@x.ua", id);
  return sessionCookie(await createSession(env, id, 30), 3600).split(";")[0];
};

// Go Playground: програма виводить R<n> PASS для кожної вимоги проєкту (режим «еталон») або FAIL
let mode = "pass", sent = null;
globalThis.fetch = async (url, init) => {
  const body = new URLSearchParams(init.body).get("body") ?? "";
  sent = body;
  const p = PROGRAM_PROJECTS.find((x) => body.includes(x.harness.slice(0, 80)));
  const lines = (p?.requirements ?? []).map((r, i) => (mode === "pass" || i > 0 ? `${r.id} PASS\n` : `${r.id} FAIL: чогось бракує\n`)).join("");
  return new Response(JSON.stringify({ Errors: "", Events: [{ Message: "привіт від користувача\n" + lines, Kind: "stdout", Delay: 0 }], Status: 0 }), { status: 200, headers: { "Content-Type": "application/json" } });
};

let n = 0;
const test = async (name, fn) => { await fn(); n++; console.log("ok  -", name); };
const P = PROGRAM_PROJECTS.find((p) => p.id === "go-tasks");
const ck = await login("go-a");

await test("Go: 110 уроків, 30 просунутих, 80 базових; проєкти стоять лише на базових уроках", () => {
  assert.equal(LESSONS.go.length, 110);
  assert.equal(LESSONS.go.filter((l) => l.adv).length, 30);
  assert.equal(PROGRAM_PROJECTS.length, 3);
  for (const p of PROGRAM_PROJECTS) { const [, num] = p.lesson.split("/"); assert.ok(!LESSONS.go[+num - 1].adv, p.id); assert.equal(projectForLesson(p.lesson)?.id, p.id); }
});

await test("/api/project: гостю 401, користувачу умови без harness і без перевірок-коду", async () => {
  assert.equal((await call(projectGet, get("/api/project?id=go-tasks"))).status, 401);
  const r = await call(projectGet, get("/api/project?id=go-tasks", ck));
  assert.equal(r.status, 200);
  assert.equal(r.data.kind, "program"); assert.ok(r.data.starter.includes("package main") || r.data.starter.length > 20);
  assert.ok(!("harness" in r.data)); assert.ok(!JSON.stringify(r.data).includes(P.harness.slice(0, 60)));
});

await test("parseVerdicts: PASS/FAIL по вимогах, відсутня вимога = невиконана, друк користувача окремо", () => {
  const r = parseVerdicts("привіт\nR1 PASS\nR2 FAIL: причина\nщось\n", ["R1", "R2", "R3"]);
  assert.deepEqual(r.verdicts.map((v) => v.ok), [true, false, false]);
  assert.equal(r.verdicts[1].msg, "причина"); assert.match(r.verdicts[2].msg, /не завершилась/);
  assert.equal(r.rest, "привіт\nщось");
});

let proof;
await test("/api/project-run: код користувача + harness у програмі; усе пройдено → proof; друк користувача лишається, службові рядки ховаються", async () => {
  mode = "pass";
  const r = await call(projectRun, post("/api/project-run", { projectId: "go-tasks", code: "package main\n// мій код" }, ck));
  assert.equal(r.status, 200); assert.equal(r.data.passed, true); assert.ok(r.data.proof);
  assert.equal(r.data.results.length, P.requirements.length); assert.ok(r.data.results.every((x) => x.ok));
  assert.ok(sent.includes("// мій код") && sent.includes(P.harness.slice(0, 80)));
  assert.equal(r.data.stdout, "привіт від користувача");
  proof = r.data.proof;
});

await test("/api/project-run: невиконана вимога → passed=false, без proof; гість 401; чужий id 400", async () => {
  mode = "fail";
  const r = await call(projectRun, post("/api/project-run", { projectId: "go-tasks", code: "package main" }, ck));
  assert.equal(r.data.passed, false); assert.equal(r.data.proof, undefined); assert.equal(r.data.results[0].ok, false);
  assert.equal((await call(projectRun, post("/api/project-run", { projectId: "go-tasks", code: "x" }))).status, 401);
  assert.equal((await call(projectRun, post("/api/project-run", { projectId: "js-todo", code: "x" }, ck))).status, 400);
});

await test("complete: без proof XP немає, з proof від цього коду нараховується один раз", async () => {
  const bad = await call(complete, post("/api/progress/complete", { taskId: "go-tasks", code: "package main\n// мій код", passed: true }, ck));
  assert.equal(bad.data.xp, 0);
  const other = await call(complete, post("/api/progress/complete", { taskId: "go-tasks", code: "інший код", passed: true, proof }, ck));
  assert.equal(other.data.xp, 0);
  const ok = await call(complete, post("/api/progress/complete", { taskId: "go-tasks", code: "package main\n// мій код", passed: true, proof }, ck));
  assert.equal(ok.data.firstSolve, true); assert.equal(ok.data.xp, P.xp);
  const again = await call(complete, post("/api/progress/complete", { taskId: "go-tasks", code: "package main\n// мій код", passed: true, proof }, ck));
  assert.equal(again.data.xp, 0);
});

await test("/api/courses: у Go позначені просунуті уроки, рівень за замовчуванням порожній (базовий); гостю 401", async () => {
  assert.equal((await call(courses, get("/api/courses"))).status, 401);
  const r = await call(courses, get("/api/courses", ck));
  assert.equal(r.data.courses.go.length, 110); assert.equal(r.data.courses.go.filter((l) => l.adv).length, 30);
  assert.equal(r.data.courses.python.filter((l) => l.adv).length, 0);
  assert.deepEqual(r.data.levels, {});
  assert.ok(r.data.projects.some((p) => p.id === "go-pipeline"));
});

await test("/api/level: зберігається по користувачу, лише для курсів із рівнями, некоректне відхиляється", async () => {
  const r = await call(level, post("/api/level", { course: "go", level: "adv" }, ck));
  assert.deepEqual(r.data.levels, { go: "adv" });
  assert.deepEqual((await call(courses, get("/api/courses", ck))).data.levels, { go: "adv" });
  const ck2 = await login("go-b");
  assert.deepEqual((await call(courses, get("/api/courses", ck2))).data.levels, {});
  await call(level, post("/api/level", { course: "go", level: "base" }, ck));
  assert.deepEqual((await call(courses, get("/api/courses", ck))).data.levels, { go: "base" });
  for (const b of [{ course: "python", level: "adv" }, { course: "go", level: "pro" }, { course: "__proto__", level: "adv" }, {}]) assert.equal((await call(level, post("/api/level", b, ck))).status, 400);
  assert.equal((await call(level, post("/api/level", { course: "go", level: "adv" }))).status, 401);
});

console.log(`\nУсі тести Go-проєктів і рівнів пройдено: ${n}`);
