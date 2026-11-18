// POST /api/demo-run { code } — запуск демо-вправи Python з лендингу для гостей (А3). Лише одне фіксоване завдання (DEMO_PY), не з курсів.
// Пісочниця зовнішня й безкоштовна, тому ліміти жорсткі: за IP і загальний добовий (щоб відкритий ендпоінт не вичерпав чужі квоти).
import type { Env } from "../../lib/env.ts";
import { allow, clientIp } from "../../lib/auth.ts";
import { RUNNERS, RunnerUnavailable } from "../../lib/runners.ts";
import { json, sameOrigin } from "../../lib/session.ts";
import { evalChecks } from "../../src/runner/checks.ts";
import { DEMO_PY } from "../../src/demo.ts";

const MAX_CODE = 1500;
const MAX_STDOUT = 4000;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  let body: { code?: unknown };
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  if (typeof body.code !== "string" || !body.code.trim() || body.code.length > MAX_CODE) return json({ error: "bad_request" }, 400);
  if (!(await allow(env, "demo-ip:" + (clientIp(request) ?? "?"), 8, 600)) || !(await allow(env, "demo-day", 500, 86400))) return json({ error: "rate_limited" }, 429);

  let out;
  try {
    out = await RUNNERS.python.run(body.code);
  } catch (e) {
    if (e instanceof RunnerUnavailable) { console.error("demo runner unavailable", e.message); return json({ error: "runner_unavailable" }, 503); }
    throw e;
  }
  const stdout = out.stdout.length > MAX_STDOUT ? out.stdout.slice(0, MAX_STDOUT) + "\n… (вивід обрізано)" : out.stdout;
  if (out.error) return json({ passed: false, results: [], stdout, stderr: out.stderr, error: out.error, timedOut: !!out.timedOut });
  const results = evalChecks(DEMO_PY.checks, body.code, out);
  if (out.exitCode) results.unshift({ name: "Програма завершується без помилки", passed: false, error: out.stderr.trim().slice(0, 400) || "код завершення " + out.exitCode });
  return json({ passed: results.length > 0 && results.every((r) => r.passed), results, stdout, stderr: out.stderr });
};
