// POST /api/project-run { projectId, code } — запустити програмний проєкт за ТЗ (Go) і перевірити кожну вимогу. Лише для користувача, що увійшов.
// Відповідь: { passed, results: [{id, ok, msg}], stdout (друк користувача), stderr, error, proof }. proof приймає /api/progress/complete.
import type { Env } from "../../lib/env.ts";
import { allow } from "../../lib/auth.ts";
import { signProof } from "../../lib/proof.ts";
import { buildProgram, parseVerdicts } from "../../lib/project-run.ts";
import { RUNNERS, RunnerUnavailable } from "../../lib/runners.ts";
import { currentUser, json, sameOrigin } from "../../lib/session.ts";
import { programProjectById } from "../../content/projects/index.ts";

const MAX_PER_MINUTE = 8;
const MAX_PER_DAY = 300;
const MAX_CODE = 20000;
const MAX_STDOUT = 8000;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  let body: { projectId?: unknown; code?: unknown };
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const p = typeof body.projectId === "string" ? programProjectById(body.projectId) : undefined;
  if (!p || typeof body.code !== "string" || !body.code.trim() || body.code.length > MAX_CODE) return json({ error: "bad_request" }, 400);
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  if (!(await allow(env, "run:u:" + u.id, MAX_PER_MINUTE, 60))) return json({ error: "rate_limited" }, 429);
  if (!(await allow(env, "run-day:" + u.id, MAX_PER_DAY, 86400))) return json({ error: "rate_limited" }, 429);

  let out;
  try {
    out = await RUNNERS[p.lang].run(buildProgram(p.harness, body.code));
  } catch (e) {
    if (e instanceof RunnerUnavailable) { console.error("runner unavailable", p.lang, e.message); return json({ error: "runner_unavailable" }, 503); }
    throw e;
  }
  // Номери рядків у помилках компіляції зсунуті на довжину harness лише після коду користувача, тож початок збігається
  if (out.error) return json({ passed: false, results: [], stdout: "", stderr: out.stderr, error: out.error, timedOut: !!out.timedOut });
  const { verdicts, rest } = parseVerdicts(out.stdout, p.requirements.map((r) => r.id));
  const passed = verdicts.every((v) => v.ok) && !out.exitCode;
  const stdout = rest.length > MAX_STDOUT ? rest.slice(0, MAX_STDOUT) + "\n… (вивід обрізано)" : rest;
  const proof = passed ? await signProof(env, u.id, p.id, body.code) : undefined;
  return json({ passed, results: verdicts, stdout, stderr: out.stderr.slice(0, 2000), proof });
};
