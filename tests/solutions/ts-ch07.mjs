// Еталони завдань глави 7 «Асинхронність» курсу TypeScript
const raw = String.raw;

export const SOLUTIONS_07 = {
  "ts-callbacks-order": raw`type Callback = (error: Error | null, name?: string) => void;

function loadName(id: number, callback: Callback): void {
  setTimeout(() => {
    if (id <= 0) {
      callback(new Error("Неправильний id"));
      return;
    }
    callback(null, "Користувач " + id);
  }, 0);
}

function show(error: Error | null, name?: string): void {
  if (error) {
    console.log("помилка: " + error.message);
    return;
  }
  console.log(name);
}

console.log("початок");
loadName(1, show);
loadName(-1, show);
console.log("кінець");
`,
  "ts-promise-chain": raw`function divide(a: number, b: number): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    if (b === 0) {
      reject(new Error("Ділення на нуль"));
      return;
    }
    resolve(a / b);
  });
}

divide(10, 2)
  .then((result) => {
    console.log("результат", result);
    return divide(1, 0);
  })
  .then((result) => {
    console.log("до цього рядка не дійдемо", result);
  })
  .catch((error: Error) => {
    console.log("помилка: " + error.message);
  })
  .finally(() => {
    console.log("готово");
  });
`,
  "ts-async-await-total": raw`const prices: Record<string, number> = { хліб: 30, молоко: 45, сир: 120 };

function getPrice(item: string): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const price = prices[item];
      if (price === undefined) {
        reject(new Error("Немає товару: " + item));
      } else {
        resolve(price);
      }
    }, 0);
  });
}

async function totalPrice(items: string[]): Promise<number> {
  let sum = 0;
  for (const item of items) {
    sum += await getPrice(item);
  }
  return sum;
}

async function safeTotal(items: string[]): Promise<number> {
  try {
    return await totalPrice(items);
  } catch {
    return -1;
  }
}

async function main(): Promise<void> {
  console.log(await totalPrice(["хліб", "молоко"]));
  console.log(await safeTotal(["хліб", "сир"]));
  console.log(await safeTotal(["хліб", "ікра"]));
}

main();
`,
  "ts-async-safe-call": raw`type Outcome<T> = { ok: true; value: T } | { ok: false; error: string };

async function safeCall<T>(action: () => Promise<T>): Promise<Outcome<T>> {
  try {
    return { ok: true, value: await action() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function parseNumber(text: string): Promise<number> {
  const n = Number(text);
  if (Number.isNaN(n)) {
    throw new Error("не число: " + text);
  }
  return n;
}

async function main(): Promise<void> {
  const first = await safeCall(() => parseNumber("42"));
  const second = await safeCall(() => parseNumber("abc"));
  for (const result of [first, second]) {
    if (result.ok) {
      console.log("значення", result.value);
    } else {
      console.log("помилка", result.error);
    }
  }
}

main();
`,
  "ts-promise-combinators": raw`function loadItem(id: number): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id % 3 === 0) {
        reject(new Error("не вдалося: " + id));
      } else {
        resolve("елемент " + id);
      }
    }, 10 - id);
  });
}

async function loadAll(ids: number[]): Promise<string[]> {
  return await Promise.all(ids.map(loadItem));
}

async function summary(ids: number[]): Promise<string> {
  const results = await Promise.allSettled(ids.map(loadItem));
  let ok = 0;
  let failed = 0;
  for (const result of results) {
    if (result.status === "fulfilled") {
      ok += 1;
    } else {
      failed += 1;
    }
  }
  return "успішно: " + ok + ", збоїв: " + failed;
}

async function main(): Promise<void> {
  console.log((await loadAll([1, 2, 4])).join(", "));
  try {
    await loadAll([1, 3]);
  } catch (error) {
    console.log("all відхилився:", error instanceof Error ? error.message : error);
  }
  console.log(await summary([1, 2, 3, 4, 6]));
}

main();
`,
  "ts-sequential-parallel": raw`function square(n: number): Promise<number> {
  return new Promise((resolve) => {
    console.log("старт " + n);
    setTimeout(() => {
      console.log("готово " + n);
      resolve(n * n);
    }, 5);
  });
}

async function runSequential(numbers: number[]): Promise<number[]> {
  const results: number[] = [];
  for (const n of numbers) {
    results.push(await square(n));
  }
  return results;
}

async function runParallel(numbers: number[]): Promise<number[]> {
  return await Promise.all(numbers.map(square));
}

async function main(): Promise<void> {
  console.log("послідовно");
  console.log((await runSequential([1, 2])).join(","));
  console.log("паралельно");
  console.log((await runParallel([3, 4])).join(","));
}

main();
`,
  "ts-sleep-delay": raw`function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function countdown(from: number): Promise<void> {
  for (let n = from; n >= 1; n--) {
    console.log(n);
    await sleep(5);
  }
  console.log("старт!");
}

async function main(): Promise<void> {
  await countdown(3);
  const word = await delay(5, "готово");
  console.log(word.toUpperCase());
}

main();
`,
  "ts-abortable-delay": raw`function delay(ms: number, signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("скасовано"));
      return;
    }
    const timer = setTimeout(() => resolve("минув час"), ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new Error("скасовано"));
      },
      { once: true },
    );
  });
}

async function run(ms: number, abortAfter: number | null): Promise<string> {
  const controller = new AbortController();
  if (abortAfter !== null) {
    setTimeout(() => controller.abort(), abortAfter);
  }
  try {
    return await delay(ms, controller.signal);
  } catch (error) {
    return error instanceof Error ? error.message : "невідома помилка";
  }
}

async function main(): Promise<void> {
  console.log(await run(5, null));
  console.log(await run(1000, 5));
}

main();
`,
  "ts-async-iterator": raw`async function* ticker(): AsyncGenerator<number> {
  let n = 1;
  try {
    while (true) {
      await Promise.resolve();
      yield n++;
    }
  } finally {
    console.log("ticker закрито");
  }
}

async function* take(source: AsyncIterable<number>, limit: number): AsyncGenerator<number> {
  let count = 0;
  for await (const item of source) {
    yield item;
    count++;
    if (count >= limit) {
      return;
    }
  }
}

async function collect(source: AsyncIterable<number>): Promise<number[]> {
  const items: number[] = [];
  for await (const item of source) {
    items.push(item);
  }
  return items;
}

async function main(): Promise<void> {
  const firstFour = await collect(take(ticker(), 4));
  console.log(firstFour.join(","));
}

main();
`,
  "ts-generators": raw`function* chunk<T>(items: T[], size: number): Generator<T[]> {
  for (let i = 0; i < items.length; i += size) {
    yield items.slice(i, i + size);
  }
}

function* ids(prefix: string): Generator<string> {
  let n = 1;
  while (true) {
    yield prefix + "-" + n;
    n++;
  }
}

function takeIds(count: number): string[] {
  const generator = ids("user");
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(String(generator.next().value));
  }
  return result;
}

console.log(JSON.stringify([...chunk([1, 2, 3, 4, 5], 2)]));
console.log(takeIds(3).join(" "));
`,
  "ts-event-bus": raw`type Handler<T> = (data: T) => void;

class EventBus<E extends object> {
  private handlers: { [K in keyof E]?: Handler<E[K]>[] } = {};

  on<K extends keyof E>(name: K, handler: Handler<E[K]>): () => void {
    const list = this.handlers[name] ?? [];
    list.push(handler);
    this.handlers[name] = list;
    return () => {
      this.handlers[name] = (this.handlers[name] ?? []).filter((h) => h !== handler);
    };
  }

  emit<K extends keyof E>(name: K, data: E[K]): void {
    for (const handler of [...(this.handlers[name] ?? [])]) {
      handler(data);
    }
  }
}

interface ShopEvents {
  added: { title: string; price: number };
  cleared: undefined;
}

const bus = new EventBus<ShopEvents>();
let total = 0;

const offAdded = bus.on("added", (item) => {
  total += item.price;
  console.log("додано " + item.title + ", разом " + total);
});
bus.on("cleared", () => {
  total = 0;
  console.log("кошик порожній");
});

bus.emit("added", { title: "хліб", price: 30 });
bus.emit("added", { title: "сир", price: 120 });
offAdded();
bus.emit("added", { title: "молоко", price: 45 });
bus.emit("cleared", undefined);
console.log("підсумок " + total);
`,
  "ts-pool": raw`async function runPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function runner(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]);
    }
  }

  const runners: Promise<void>[] = [];
  for (let i = 0; i < Math.min(limit, items.length); i++) {
    runners.push(runner());
  }
  await Promise.all(runners);
  return results;
}

let active = 0;
let maxActive = 0;

async function main(): Promise<void> {
  const results = await runPool([1, 2, 3, 4, 5, 6, 7], 3, async (n) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
    active -= 1;
    return n * n;
  });
  console.log("результат: " + results.join(","));
  console.log("максимум одночасно: " + maxActive);
}

main();
`,
  "ts-task-queue": raw`class TaskQueue {
  private tail: Promise<unknown> = Promise.resolve();

  add<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(task);
    this.tail = result.catch(() => undefined);
    return result;
  }
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function job(name: string, ms: number, fail = false): Promise<string> {
  console.log("початок " + name);
  await pause(ms);
  if (fail) {
    throw new Error("збій " + name);
  }
  console.log("кінець " + name);
  return name;
}

async function main(): Promise<void> {
  const queue = new TaskQueue();
  const results = await Promise.allSettled([
    queue.add(() => job("A", 15)),
    queue.add(() => job("B", 5, true)),
    queue.add(() => job("C", 1)),
  ]);
  console.log(results.map((r) => (r.status === "fulfilled" ? r.value : "помилка")).join(","));
}

main();
`,
  "ts-retry": raw`interface RetryOptions {
  attempts: number;
  baseDelay: number;
  sleep: (ms: number) => Promise<void>;
  shouldRetry?: (error: unknown) => boolean;
}

async function retry<T>(action: () => Promise<T>, options: RetryOptions): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < options.attempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (options.shouldRetry && !options.shouldRetry(error)) {
        throw error;
      }
      if (attempt < options.attempts - 1) {
        await options.sleep(options.baseDelay * 2 ** attempt);
      }
    }
  }
  throw lastError;
}

const waits: number[] = [];
const sleep = async (ms: number): Promise<void> => {
  waits.push(ms);
};

function makeFlaky(failures: number): () => Promise<string> {
  let calls = 0;
  return async () => {
    calls += 1;
    if (calls <= failures) {
      throw new Error("тимчасовий збій " + calls);
    }
    return "готово після " + calls + " спроб";
  };
}

function report(): string {
  return "паузи: " + (waits.join(",") || "немає");
}

async function main(): Promise<void> {
  console.log(await retry(makeFlaky(2), { attempts: 4, baseDelay: 100, sleep }));
  console.log(report());

  waits.length = 0;
  try {
    await retry(makeFlaky(10), { attempts: 3, baseDelay: 50, sleep });
  } catch (error) {
    console.log("здались: " + (error instanceof Error ? error.message : error));
  }
  console.log(report());

  waits.length = 0;
  try {
    await retry(makeFlaky(10), { attempts: 3, baseDelay: 50, sleep, shouldRetry: () => false });
  } catch (error) {
    console.log("без повторів: " + (error instanceof Error ? error.message : error));
  }
  console.log(report());
}

main().catch((error) => console.log("аварія: " + (error instanceof Error ? error.message : error)));
`,
  "ts-awaited": raw`type Services = Record<string, (...args: never[]) => unknown>;

type Results<T extends Services> = { [K in keyof T]: Awaited<ReturnType<T[K]>> };

async function runAll<T extends Services>(source: T): Promise<Results<T>> {
  const entries = await Promise.all(
    Object.entries(source).map(async ([key, fn]) => [key, await fn()] as const),
  );
  return Object.fromEntries(entries) as Results<T>;
}

const services = {
  user: async () => ({ nick: "olena" }),
  count: async () => 3,
  version: () => "1.0",
};

async function main(): Promise<void> {
  const all = await runAll(services);
  console.log(all.user.nick, all.count + 1, all.version.toUpperCase());
  console.log(Object.keys(all).join(","));
}

main().catch(() => console.log("не реалізовано"));
`,
};
