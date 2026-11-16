// POST /api/run { taskId, code } — запустити код «віддаленого» завдання (Go та інші) у пісочниці й перевірити результат. Лише для користувача, що увійшов.
// Відповідь має ту саму форму, що й запуск JS у браузері: results + error, плюс stdout для терміналу.
import type { Env } from "../../lib/env.ts";
import { allow } from "../../lib/auth.ts";
import { signProof } from "../../lib/proof.ts";
import { RUNNERS, RunnerUnavailable } from "../../lib/runners.ts";
import { currentUser, isProActive, json, sameOrigin } from "../../lib/session.ts";
import { evalChecks } from "../../src/runner/checks.ts";
import { taskById } from "../../content/tasks/index.ts";
import { isRemote } from "../../src/tasks/types.ts";

const MAX_PER_MINUTE = 12;
const MAX_STDOUT = 20000;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!sameOrigin(request)) return json({ error: "forbidden" }, 403);
  let body: { taskId?: unknown; code?: unknown };
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const task = typeof body.taskId === "string" ? taskById(body.taskId) : undefined;
  if (!task || !isRemote(task) || typeof body.code !== "string") return json({ error: "bad_request" }, 400);
  const runner = RUNNERS[task.lang];
  if (!body.code.trim() || body.code.length > runner.maxCode) return json({ error: "bad_request" }, 400);

  // Завдання доступні лише в акаунті. Пісочниця зовнішня й безкоштовна: обмежуємо кількість запусків на людину
  const u = await currentUser(request, env);
  if (!u) return json({ error: "unauthorized" }, 401);
  if (!(await allow(env, "run:u:" + u.id, MAX_PER_MINUTE, 60))) return json({ error: "rate_limited" }, 429);
  if (task.premium && !isProActive(u)) return json({ error: "pro_required" }, 402);

  let out;
  try {
    out = await runner.run(body.code);
  } catch (e) {
    if (e instanceof RunnerUnavailable) { console.error("runner unavailable", task.lang, e.message); return json({ error: "runner_unavailable" }, 503); }
    throw e;
  }
  const stdout = out.stdout.length > MAX_STDOUT ? out.stdout.slice(0, MAX_STDOUT) + "\n… (вивід обрізано)" : out.stdout;
  if (out.error) return json({ passed: false, results: [], stdout, stderr: out.stderr, error: out.error, timedOut: !!out.timedOut });

  const results = evalChecks(task.checks, body.code, out);
  // Аварійне завершення (panic) завжди провал, навіть якщо потрібні рядки встигли надрукуватись
  if (out.exitCode) results.unshift({ name: "Програма завершується без аварії", passed: false, error: out.stderr.trim().slice(0, 400) || "код завершення " + out.exitCode });
  const passed = results.length > 0 && results.every((r) => r.passed);
  const proof = passed && u ? await signProof(env, u.id, task.id, body.code) : undefined;
  return json({ passed, results, stdout, stderr: out.stderr, proof });
};
