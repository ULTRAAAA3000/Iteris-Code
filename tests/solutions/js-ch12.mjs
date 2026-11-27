const raw = String.raw;

export const SOLUTIONS_12 = {
  "js-text-analyzer": raw`const WORDS_PER_MINUTE = 200;
const isWordChar = (ch) => /[\p{L}\p{N}]/u.test(ch);

function analyzeText(text, { top = 3 } = {}) {
  if (typeof text !== "string") throw new TypeError("Очікується рядок");
  const tokens = (text.toLowerCase().match(/[\p{L}\p{N}'’-]+/gu) ?? []).filter((w) => /[\p{L}\p{N}]/u.test(w));
  const lengthOf = (word) => [...word].filter(isWordChar).length;

  const counts = new Map();
  for (const word of tokens) counts.set(word, (counts.get(word) ?? 0) + 1);

  let longestWord = "";
  let longest = 0;
  let totalLength = 0;
  for (const word of tokens) {
    const length = lengthOf(word);
    totalLength += length;
    if (length > longest) {
      longest = length;
      longestWord = word;
    }
  }

  const topWords = [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "uk"))
    .slice(0, top)
    .map(([word, count]) => ({ word, count }));

  return {
    words: tokens.length,
    uniqueWords: counts.size,
    sentences: text.split(/[.!?…]+/).filter((part) => /[\p{L}\p{N}]/u.test(part)).length,
    letters: (text.match(/\p{L}/gu) ?? []).length,
    averageWordLength: tokens.length === 0 ? 0 : Math.round((totalLength / tokens.length) * 100) / 100,
    longestWord,
    topWords,
    readingMinutes: tokens.length === 0 ? 0 : Math.ceil(tokens.length / WORDS_PER_MINUTE),
  };
}`,
  "js-todo-app": raw`function createTodoApp(storage, { now = () => Date.now(), nextId } = {}) {
  function load() {
    const text = storage.getItem("todos");
    if (text === null) return [];
    try {
      const value = JSON.parse(text);
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  let todos = load();
  let counter = todos.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0);
  const makeId = nextId ?? (() => ++counter);

  function save() {
    try {
      storage.setItem("todos", JSON.stringify(todos));
    } catch {
      // сховище недоступне чи переповнене: працюємо зі станом у пам'яті
    }
  }

  const find = (id) => todos.find((t) => t.id === id);

  return {
    add(title) {
      const clean = String(title).trim();
      if (clean === "") throw new RangeError("Назва не може бути порожньою");
      const todo = { id: makeId(), title: clean, done: false, createdAt: now() };
      todos.push(todo);
      save();
      return { ...todo };
    },
    toggle(id) {
      const todo = find(id);
      if (!todo) throw new Error("Справу не знайдено: " + id);
      todo.done = !todo.done;
      save();
      return { ...todo };
    },
    remove(id) {
      const before = todos.length;
      todos = todos.filter((t) => t.id !== id);
      const removed = todos.length !== before;
      if (removed) save();
      return removed;
    },
    clearDone() {
      const before = todos.length;
      todos = todos.filter((t) => !t.done);
      const removed = before - todos.length;
      if (removed > 0) save();
      return removed;
    },
    list({ status = "all", search = "" } = {}) {
      if (!["all", "active", "done"].includes(status)) throw new RangeError("Невідомий статус: " + status);
      const query = search.trim().toLowerCase();
      return todos
        .filter((t) => status === "all" || (status === "done") === t.done)
        .filter((t) => t.title.toLowerCase().includes(query))
        .map((t) => ({ ...t }));
    },
    stats() {
      const done = todos.filter((t) => t.done).length;
      return { total: todos.length, done, active: todos.length - done };
    },
  };
}`,
  "js-api-project": raw`class HttpError extends Error {
  constructor(status, body) {
    super("HTTP " + status + (body && typeof body.error === "string" ? ": " + body.error : ""));
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

function createApiClient({ baseUrl, fetchFn, sleep = async () => {}, now = () => Date.now(), retries = 2, backoffMs = 100, ttlMs = 0 }) {
  const cache = new Map();
  const inflight = new Map();

  const buildUrl = (path, params = {}) => {
    const url = new URL(path, baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) url.searchParams.set(key, String(value));
    }
    return url.href;
  };

  async function send(url, options) {
    const response = await fetchFn(url, options);
    const text = await response.text();
    let data = null;
    if (text !== "") {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!response.ok) throw new HttpError(response.status, data);
    return data;
  }

  const retryable = (error) => !(error instanceof HttpError) || error.status === 429 || error.status >= 500;

  async function getWithRetries(url) {
    for (let attempt = 0; ; attempt++) {
      try {
        return await send(url, { method: "GET", headers: { Accept: "application/json" } });
      } catch (error) {
        if (attempt >= retries || !retryable(error)) throw error;
        await sleep(backoffMs * 2 ** attempt);
      }
    }
  }

  return {
    async get(path, { params } = {}) {
      const url = buildUrl(path, params);
      if (ttlMs > 0) {
        const hit = cache.get(url);
        if (hit && now() - hit.at < ttlMs) return hit.value;
        if (inflight.has(url)) return inflight.get(url);
        const promise = getWithRetries(url)
          .then((value) => {
            cache.set(url, { value, at: now() });
            return value;
          })
          .finally(() => inflight.delete(url));
        inflight.set(url, promise);
        return promise;
      }
      return getWithRetries(url);
    },
    async post(path, body) {
      const data = await send(buildUrl(path), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      cache.clear();
      return data;
    },
  };
}`,
  "js-task-queue": raw`function createTaskQueue({ concurrency = 1 } = {}) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new RangeError("concurrency має бути цілим від 1");
  const waiting = [];
  const idleWaiters = [];
  let running = 0;

  function notifyIdle() {
    if (running === 0 && waiting.length === 0) {
      for (const done of idleWaiters.splice(0)) done();
    }
  }

  function pump() {
    while (running < concurrency && waiting.length > 0) {
      const { fn, resolve, reject } = waiting.shift();
      running++;
      Promise.resolve()
        .then(fn)
        .then(resolve, reject)
        .finally(() => {
          running--;
          pump();
          notifyIdle();
        });
    }
  }

  return {
    add(fn, { priority = 0 } = {}) {
      return new Promise((resolve, reject) => {
        let i = waiting.length;
        while (i > 0 && waiting[i - 1].priority < priority) i--;
        waiting.splice(i, 0, { fn, priority, resolve, reject });
        queueMicrotask(pump);
      });
    },
    onIdle() {
      if (running === 0 && waiting.length === 0) return Promise.resolve();
      return new Promise((done) => idleWaiters.push(done));
    },
    get size() {
      return waiting.length;
    },
    get running() {
      return running;
    },
  };
}`,
  "js-rate-limiter": raw`function createRateLimiter({ limit, windowMs, now = () => Date.now() }) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError("limit має бути цілим від 1");
  if (!(windowMs > 0)) throw new RangeError("windowMs має бути додатним");
  const hits = new Map();

  const recentFor = (key, t) => (hits.get(key) ?? []).filter((time) => time > t - windowMs);

  return {
    tryAcquire(key = "default") {
      const t = now();
      const recent = recentFor(key, t);
      if (recent.length < limit) {
        recent.push(t);
        hits.set(key, recent);
        return { allowed: true, remaining: limit - recent.length, retryAfterMs: 0 };
      }
      hits.set(key, recent);
      return { allowed: false, remaining: 0, retryAfterMs: recent[0] + windowMs - t };
    },
    reset(key = "default") {
      hits.delete(key);
    },
    size() {
      const t = now();
      let count = 0;
      for (const key of [...hits.keys()]) {
        const recent = recentFor(key, t);
        if (recent.length === 0) hits.delete(key);
        else {
          hits.set(key, recent);
          count++;
        }
      }
      return count;
    },
  };
}`,
};
