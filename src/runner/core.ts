// Ядро автоперевірки: мінімальний аналог Vitest (describe / it / expect) без залежностей від DOM.
// Виконується у Web Worker (див. worker.ts), а також у Node для тестів.
export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface SuiteResult {
  results: TestResult[];
  /** Помилка, через яку тести не вдалося запустити (синтаксис, виняток на верхньому рівні) */
  error?: string;
}

type AnyFn = (...args: unknown[]) => unknown;
type Ctor = abstract new (...args: never[]) => unknown;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (...args: string[]) => (...a: unknown[]) => Promise<unknown>;

class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

const fmt = (v: unknown): string => {
  if (v === undefined) return "undefined";
  if (typeof v === "function") return "[функція]";
  if (typeof v === "bigint") return v + "n";
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    return String(v);
  }
};

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

function matchThrown(thrown: unknown, expected?: string | RegExp | Ctor): string | null {
  if (expected === undefined) return null;
  const msg = thrown instanceof Error ? thrown.message : String(thrown);
  if (typeof expected === "string") return msg.includes(expected) ? null : `очікувалось повідомлення, що містить ${fmt(expected)}, отримано ${fmt(msg)}`;
  if (expected instanceof RegExp) return expected.test(msg) ? null : `повідомлення ${fmt(msg)} не відповідає ${expected}`;
  return thrown instanceof (expected as unknown as new (...a: never[]) => unknown) ? null : `очікувалась помилка типу ${(expected as { name?: string }).name}, отримано ${thrown instanceof Error ? thrown.name : fmt(thrown)}`;
}

function matchers(actual: unknown, negate: boolean) {
  const check = (ok: boolean, message: string, negMessage: string) => {
    if (negate ? ok : !ok) throw new AssertionError(negate ? negMessage : message);
  };
  return {
    toBe: (e: unknown) => check(Object.is(actual, e), `очікувалось ${fmt(e)}, отримано ${fmt(actual)}`, `значення не мало дорівнювати ${fmt(e)}`),
    toEqual: (e: unknown) => check(deepEqual(actual, e), `очікувалось ${fmt(e)}, отримано ${fmt(actual)}`, `значення не мало дорівнювати ${fmt(e)}`),
    toBeCloseTo: (e: number, digits = 2) =>
      check(typeof actual === "number" && Math.abs(actual - e) < 10 ** -digits / 2, `очікувалось ≈ ${e}, отримано ${fmt(actual)}`, `значення не мало бути ≈ ${e}`),
    toBeTruthy: () => check(!!actual, `очікувалось істинне значення, отримано ${fmt(actual)}`, `значення не мало бути істинним`),
    toBeFalsy: () => check(!actual, `очікувалось хибне значення, отримано ${fmt(actual)}`, `значення не мало бути хибним`),
    toBeNull: () => check(actual === null, `очікувалось null, отримано ${fmt(actual)}`, `значення не мало бути null`),
    toBeUndefined: () => check(actual === undefined, `очікувалось undefined, отримано ${fmt(actual)}`, `значення не мало бути undefined`),
    toContain: (e: unknown) =>
      check((Array.isArray(actual) || typeof actual === "string") && (actual as { includes(x: unknown): boolean }).includes(e), `${fmt(actual)} має містити ${fmt(e)}`, `${fmt(actual)} не мало містити ${fmt(e)}`),
    toHaveLength: (n: number) =>
      check((actual as { length?: number } | null)?.length === n, `очікувалась довжина ${n}, отримано ${fmt((actual as { length?: number } | null)?.length)}`, `довжина не мала дорівнювати ${n}`),
    toThrow: (expected?: string | RegExp | Ctor) => {
      if (typeof actual !== "function") throw new AssertionError("toThrow очікує функцію");
      let thrown: unknown, did = false;
      try { (actual as AnyFn)(); } catch (e) { did = true; thrown = e; }
      const mismatch = did ? matchThrown(thrown, expected) : "функція не кинула помилку";
      check(mismatch === null, mismatch ?? "", "функція не мала кидати таку помилку");
    },
  };
}

export function expect(actual: unknown) {
  return Object.assign(matchers(actual, false), {
    not: matchers(actual, true),
    rejects: {
      toThrow: async (expected?: string | RegExp | Ctor) => {
        let thrown: unknown, did = false;
        try { await actual; } catch (e) { did = true; thrown = e; }
        if (!did) throw new AssertionError("проміс мав бути відхилений, але виконався успішно");
        const mismatch = matchThrown(thrown, expected);
        if (mismatch) throw new AssertionError(mismatch);
      },
    },
    resolves: {
      toBe: async (e: unknown) => matchers(await actual, false).toBe(e),
      toEqual: async (e: unknown) => matchers(await actual, false).toEqual(e),
    },
  });
}

const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T> =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Тест не завершився за ${ms} мс`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });

const errMsg = (e: unknown): string => (e instanceof Error ? (e.name === "Error" || e.name === "AssertionError" ? e.message : `${e.name}: ${e.message}`) : String(e));

export async function runSuite(code: string, tests: string, log: (line: string) => void = () => {}, testTimeoutMs = 2000): Promise<SuiteResult> {
  const queue: { name: string; fn: AnyFn }[] = [];
  const stack: string[] = [];
  const describe = (name: string, fn: () => void) => { stack.push(name); try { fn(); } finally { stack.pop(); } };
  const it = (name: string, fn: AnyFn) => { queue.push({ name: [...stack, name].join(" › "), fn }); };
  const out = (...a: unknown[]) => log(a.map((x) => (typeof x === "string" ? x : fmt(x))).join(" "));
  const sandboxConsole = { log: out, info: out, warn: out, error: out, debug: out };

  let program: (...a: unknown[]) => Promise<unknown>;
  try {
    program = new AsyncFunction("describe", "it", "test", "expect", "console", `"use strict";\n${code}\n;\n${tests}`);
  } catch (e) {
    return { results: [], error: "Синтаксична помилка: " + errMsg(e) };
  }
  try {
    await withTimeout(program(describe, it, it, expect, sandboxConsole), testTimeoutMs);
  } catch (e) {
    return { results: [], error: "Помилка виконання: " + errMsg(e) };
  }

  const results: TestResult[] = [];
  for (const t of queue) {
    try {
      await withTimeout(Promise.resolve(t.fn()), testTimeoutMs);
      results.push({ name: t.name, passed: true });
    } catch (e) {
      results.push({ name: t.name, passed: false, error: errMsg(e) });
    }
  }
  return { results };
}
