// Еталони завдань глави 9 «Тестування й якість» курсу TypeScript
const raw = String.raw;

export const SOLUTIONS_09 = {
  "ts-clamp-table": raw`function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError("min більше за max");
  }
  return Math.min(Math.max(value, min), max);
}

type Case = [value: number, min: number, max: number, expected: number];

const cases: Case[] = [
  [5, 0, 10, 5],
  [-3, 0, 10, 0],
  [42, 0, 10, 10],
  [0, 0, 0, 0],
  [7, 7, 7, 7],
  [3.5, 0, 3, 3],
];

function runTable(): { passed: number; failures: string[] } {
  let passed = 0;
  const failures: string[] = [];
  for (const [value, min, max, expected] of cases) {
    const actual = clamp(value, min, max);
    if (actual === expected) {
      passed++;
    } else {
      failures.push("clamp(" + value + ", " + min + ", " + max + "): очікувалось " + expected + ", отримано " + actual);
    }
  }
  return { passed, failures };
}

function assertThrows(action: () => unknown): boolean {
  try {
    action();
  } catch {
    return true;
  }
  return false;
}

const result = runTable();
console.log("пройдено:", result.passed, "з", cases.length);
for (const failure of result.failures) {
  console.log(failure);
}
console.log(assertThrows(() => clamp(1, 5, 0)), assertThrows(() => clamp(1, 0, 5)));
`,
  "ts-spy-mailer": raw`interface Mailer {
  send(to: string, text: string): void;
}

function spy<A extends unknown[], R>(fn: (...args: A) => R): { wrapped: (...args: A) => R; calls: A[] } {
  const calls: A[] = [];
  const wrapped = (...args: A): R => {
    calls.push(args);
    return fn(...args);
  };
  return { wrapped, calls };
}

function notifyAll(mailer: Mailer, emails: string[], text: string): number {
  let failed = 0;
  for (const email of emails) {
    try {
      mailer.send(email, text);
    } catch {
      failed++;
    }
  }
  return failed;
}

const delivered: string[] = [];
const sender = spy((to: string, text: string): void => {
  if (to.startsWith("bad")) {
    throw new Error("відхилено " + to);
  }
  delivered.push(to + ":" + text);
});

const failures = notifyAll({ send: sender.wrapped }, ["a@x.ua", "bad@x.ua", "b@x.ua"], "Привіт");
console.log("збоїв:", failures);
console.log("спроб:", sender.calls.length);
console.log(delivered.join(" | "));
console.log(JSON.stringify(sender.calls[1]));
`,
  "ts-type-tests": raw`type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

type Nullable<T> = T | null;
type ValuesOf<T> = T[keyof T];
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

type Config = { readonly host: string; readonly port: number };

type _t1 = Expect<Equal<Nullable<string>, string | null>>;
type _t2 = Expect<Equal<ValuesOf<Config>, string | number>>;
type _t3 = Expect<Equal<Mutable<Config>, { host: string; port: number }>>;

const frozen: Config = { host: "localhost", port: 80 };
// @ts-expect-error у Config поля лише для читання
frozen.port = 8080;

const editable: Mutable<Config> = { host: "localhost", port: 80 };
editable.port = 8080;

console.log(editable.port, frozen.port);
`,
  "ts-async-tests": raw`type TestFn = () => Promise<void> | void;

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function assertRejects(promise: Promise<unknown>): Promise<void> {
  try {
    await promise;
  } catch {
    return;
  }
  throw new Error("проміс виконався, а мав відхилитись");
}

async function runTests(tests: Record<string, TestFn>, timeoutMs: number): Promise<string> {
  const lines: string[] = [];
  let passed = 0;
  const entries = Object.entries(tests);
  for (const [testName, test] of entries) {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("не завершився за " + timeoutMs + " мс")), timeoutMs);
    });
    try {
      await Promise.race([Promise.resolve().then(test), timeout]);
      passed++;
      lines.push("ok " + testName);
    } catch (error) {
      lines.push("FAIL " + testName + ": " + (error instanceof Error ? error.message : String(error)));
    }
  }
  lines.push("пройдено: " + passed + " з " + entries.length);
  return lines.join("\n");
}

const tests: Record<string, TestFn> = {
  "додавання": () => {
    if (1 + 1 !== 2) {
      throw new Error("математика зламалась");
    }
  },
  "асинхронне читання": async () => {
    await pause(1);
  },
  "відхилення": async () => {
    await assertRejects(Promise.reject(new Error("збій")));
  },
  "падіння": async () => {
    await pause(1);
    throw new Error("навмисно");
  },
  "виконаний замість відхилення": async () => {
    await assertRejects(Promise.resolve(1));
  },
  "зависання": () => new Promise<void>(() => {}),
};

runTests(tests, 20).then((summary) => console.log(summary));
`,
  "ts-test-factory": raw`interface Customer {
  name: string;
  age: number;
}

interface Order {
  id: number;
  customer: Customer;
  items: string[];
  paid: boolean;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

let nextId = 1;

function makeOrder(overrides: DeepPartial<Order> = {}): Order {
  const base: Order = { id: nextId++, customer: { name: "Олена", age: 30 }, items: ["хліб"], paid: false };
  return {
    ...base,
    ...overrides,
    customer: { ...base.customer, ...overrides.customer },
    items: [...(overrides.items ?? base.items)],
  };
}

const makePaid = (overrides: DeepPartial<Order> = {}): Order => makeOrder({ paid: true, ...overrides });

const a = makeOrder();
const b = makeOrder({ customer: { age: 17 } });
const c = makePaid({ items: ["молоко", "сир"] });

console.log(a.id, b.id, c.id);
console.log(b.customer.name, b.customer.age);
console.log(c.paid, c.items.join(","));
console.log(a.items === makeOrder().items, a.items.join(","));
`,
  "ts-property-test": raw`function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Gen<T> = (random: () => number) => T;

const int = (min: number, max: number): Gen<number> => (random) => min + Math.floor(random() * (max - min + 1));
const arrayOf = <T>(gen: Gen<T>, maxLength: number): Gen<T[]> => (random) =>
  Array.from({ length: Math.floor(random() * (maxLength + 1)) }, () => gen(random));

type CheckResult<T> = { ok: true } | { ok: false; seed: number; value: T };

function dedupeSorted(items: number[]): number[] {
  return [...new Set(items)].sort((x, y) => x - y);
}

function checkProperty<T>(gen: Gen<T>, property: (value: T) => boolean, runs: number): CheckResult<T> {
  for (let seed = 1; seed <= runs; seed++) {
    const value = gen(makeRandom(seed));
    if (!property(value)) {
      return { ok: false, seed, value };
    }
  }
  return { ok: true };
}

function report(label: string, result: CheckResult<number[]>): string {
  return result.ok ? "ok " + label : "FAIL " + label + ": зерно " + result.seed + ", вхід " + JSON.stringify(result.value);
}

const numbers = arrayOf(int(-5, 5), 8);
const properties: Array<[string, (items: number[]) => boolean]> = [
  ["строго зростає", (items) => {
    const result = dedupeSorted(items);
    return result.every((x, i) => i === 0 || result[i - 1] < x);
  }],
  ["містить усі значення", (items) => {
    const result = dedupeSorted(items);
    return items.every((x) => result.includes(x));
  }],
  ["ідемпотентність", (items) => {
    const result = dedupeSorted(items);
    return JSON.stringify(dedupeSorted(result)) === JSON.stringify(result);
  }],
  ["результат непорожній", (items) => dedupeSorted(items).length > 0],
];

for (const [label, property] of properties) {
  console.log(report(label, checkProperty(numbers, property, 200)));
}
`,
};
