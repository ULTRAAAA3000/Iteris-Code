const raw = String.raw;

export const SOLUTIONS_07 = {
  "js-schedule-order": raw`function schedule(log) {
  return new Promise((resolve) => {
    setTimeout(() => {
      log.push("timeout");
      resolve(log);
    }, 0);
    Promise.resolve().then(() => log.push("promise"));
    queueMicrotask(() => log.push("micro"));
    log.push("sync");
  });
}`,
  "js-delay-timeout": raw`function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function withTimeout(promise, ms) {
  const timer = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
  return Promise.race([promise, timer]);
}`,
  "js-promisify": raw`function promisify(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (error, value) => {
        if (error !== null && error !== undefined) reject(error);
        else resolve(value);
      });
    });
}`,
  "js-delay-promise": raw`function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function timeout(promise, ms) {
  let timer;
  const limit = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("Тайм-аут")), ms);
  });
  return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
}`,
  "js-run-sequentially": raw`async function runSequentially(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}`,
  "js-load-modes": raw`async function loadAll(ids, load) {
  return Promise.all(ids.map((id) => load(id)));
}

async function loadOneByOne(ids, load) {
  const results = [];
  for (const id of ids) results.push(await load(id));
  return results;
}`,
  "js-settle-summary": raw`async function summarize(promises) {
  const results = await Promise.allSettled(promises);
  const fulfilled = [];
  const rejected = [];
  for (const r of results) {
    if (r.status === "fulfilled") fulfilled.push(r.value);
    else rejected.push(r.reason);
  }
  return { fulfilled, rejected };
}

function withFallback(promise, ms, fallback) {
  let timer;
  const limit = new Promise((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
}`,
  "js-abortable-delay": raw`function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}`,
  "js-async-paginate": raw`async function* paginate(fetchPage) {
  for (let page = 0; ; page++) {
    const { items, hasMore } = await fetchPage(page);
    yield* items;
    if (!hasMore) return;
  }
}

async function collect(asyncIterable) {
  const result = [];
  for await (const item of asyncIterable) result.push(item);
  return result;
}`,
  "js-limit-pool": raw`async function runWithLimit(tasks, limit) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError("Ліміт має бути цілим числом від 1");
  const results = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const index = next++;
      results[index] = await tasks[index]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}`,
  "js-retry": raw`async function retry(fn, attempts) {
  if (!Number.isInteger(attempts) || attempts < 1) throw new RangeError("attempts має бути цілим числом ≥ 1");
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(i); } catch (e) { lastError = e; }
  }
  throw lastError;
}`,
  "js-debounce-throttle": raw`function debounce(fn, ms) {
  let timer;
  const wrapped = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  wrapped.cancel = () => clearTimeout(timer);
  return wrapped;
}

function throttle(fn, ms) {
  let last = -Infinity;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      return fn(...args);
    }
  };
}`,
  "js-predict-order": raw`function predictBasic() {
  return ["A", "D", "F", "C", "E", "B"];
}

function predictNested() {
  return ["1", "first:1", "second", "2", "first:2"];
}`,
  "js-rpc-router": raw`function createRpc(handlers) {
  return async function handle(message) {
    const { id, method, params = [] } = message;
    if (!Object.hasOwn(handlers, method) || typeof handlers[method] !== "function") {
      return { id, error: "Невідомий метод: " + method };
    }
    try {
      return { id, result: await handlers[method](...params) };
    } catch (error) {
      return { id, error: error instanceof Error ? error.message : String(error) };
    }
  };
}`,
  "js-atomic-counter": raw`function createCounters(size) {
  const data = new Int32Array(new ArrayBuffer(size * 4));
  return {
    add(i, n) {
      return Atomics.add(data, i, n) + n;
    },
    get(i) {
      return Atomics.load(data, i);
    },
    compareAndSet(i, expected, value) {
      return Atomics.compareExchange(data, i, expected, value) === expected;
    },
  };
}`,
};
