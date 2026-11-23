// Еталонні рішення завдань Python, глава 12 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_12 = {
  "python-text-analyzer": raw`import re
from collections import Counter


def analyze(text, stop_words=frozenset(), top_n=3):
    words = re.findall(r"\w+", text.lower())
    sentences = [s for s in re.split(r"[.!?]+", text) if s.strip()]
    counts = Counter(w for w in words if w not in stop_words)
    top = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:top_n]
    avg_len = round(sum(map(len, words)) / len(words), 2) if words else 0.0
    return {"words": len(words), "unique": len(set(words)), "sentences": len(sentences),
            "top": top, "avg_len": avg_len}


text = "Python — проста мова. Python любить кожен! Проста мова — це сила."
result = analyze(text, stop_words={"це"})
for key in ["words", "unique", "sentences", "top", "avg_len"]:
    print(key, result.get(key))
print(analyze("")["words"], analyze("... !!!")["sentences"])
`,
  "python-notes-api": raw`class NotesAPI:
    def __init__(self):
        self.notes = {}
        self.next_id = 1

    def handle(self, method, path, query=None, body=None):
        query = query or {}
        parts = [p for p in path.split("/") if p]
        if parts == ["notes"]:
            if method == "POST":
                return self._create(body or {})
            if method == "GET":
                return self._list(query)
        elif len(parts) == 2 and parts[0] == "notes" and parts[1].isdigit():
            note_id = int(parts[1])
            if note_id not in self.notes:
                return 404, {"error": "не знайдено"}
            if method == "GET":
                return 200, dict(self.notes[note_id])
            if method == "PATCH":
                return self._patch(note_id, body or {})
            if method == "DELETE":
                del self.notes[note_id]
                return 204, None
        return 404, {"error": "не знайдено"}

    def _title_error(self, title):
        if not isinstance(title, str) or not title.strip():
            return "поле title обов'язкове"
        if len(title) > 50:
            return "title не довший за 50 символів"
        return None

    def _create(self, body):
        error = self._title_error(body.get("title"))
        if error:
            return 422, {"error": error}
        note = {"id": self.next_id, "title": body["title"].strip(), "body": body.get("body", "")}
        self.notes[self.next_id] = note
        self.next_id += 1
        return 201, dict(note)

    def _patch(self, note_id, body):
        if "title" in body:
            error = self._title_error(body["title"])
            if error:
                return 422, {"error": error}
            self.notes[note_id]["title"] = body["title"].strip()
        if "body" in body:
            self.notes[note_id]["body"] = body["body"]
        return 200, dict(self.notes[note_id])

    def _list(self, query):
        try:
            limit = int(query.get("limit", 10))
            offset = int(query.get("offset", 0))
        except ValueError:
            return 422, {"error": "limit і offset мають бути числами"}
        if not 1 <= limit <= 100 or offset < 0:
            return 422, {"error": "limit має бути від 1 до 100, offset не від'ємний"}
        items = [dict(n) for n in self.notes.values()]
        q = query.get("q", "").lower()
        if q:
            items = [n for n in items if q in n["title"].lower()]
        return 200, {"total": len(items), "items": items[offset:offset + limit]}


api = NotesAPI()
print(api.handle("POST", "/notes", body={"title": "Купити хліб", "body": "білий"}))
print(api.handle("POST", "/notes", body={"title": "Лист другу"}))
print(api.handle("POST", "/notes", body={"title": ""}))
print(api.handle("GET", "/notes", query={"q": "хліб"}))
print(api.handle("GET", "/notes", query={"limit": "1", "offset": "1"}))
print(api.handle("PATCH", "/notes/2", body={"title": "Лист мамі"}))
print(api.handle("DELETE", "/notes/1"))
print(api.handle("GET", "/notes/1"))
print(api.handle("GET", "/notes", query={"limit": "0"}))
`,
  "python-concurrent-processor": raw`import asyncio
import time
from concurrent.futures import ThreadPoolExecutor


def process_all(items, func, max_workers=4):
    results = [None] * len(items)
    errors = {}
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = [pool.submit(func, item) for item in items]
    for index, future in enumerate(futures):
        try:
            results[index] = future.result()
        except Exception as e:
            errors[index] = f"{type(e).__name__}: {e}"
    return results, errors


async def process_async(items, func, limit=2):
    sem = asyncio.Semaphore(limit)

    async def run_one(item):
        async with sem:
            return await func(item)

    return await asyncio.gather(*(run_one(i) for i in items), return_exceptions=True)


def summary(results, errors):
    total = len(results)
    failed = len(errors)
    ok = total - failed
    return f"Виконано {ok} з {total}, помилок: {failed} ({ok / total:.0%} успіху)"


def work(n):
    time.sleep(0.01)
    if n % 4 == 0:
        raise ValueError(f"{n} ділиться на 4")
    return n * n


async def awork(n):
    await asyncio.sleep(0.01)
    if n == 3:
        raise ValueError("три")
    return n * 2


results, errors = process_all(list(range(1, 9)), work)
print(results)
print(errors)
print(summary(results, errors))
done = asyncio.run(process_async([1, 2, 3, 4], awork))
print([type(r).__name__ if isinstance(r, Exception) else r for r in done])
`,
  "python-ttl-cache": raw`import time
from collections import OrderedDict


class TTLCache[K, V]:
    def __init__(self, ttl, max_size=128, clock=None):
        self.ttl = ttl
        self.max_size = max_size
        self.clock = clock or time.monotonic
        self._data = OrderedDict()
        self.hits = 0
        self.misses = 0

    def set(self, key, value):
        self._data[key] = (value, self.clock() + self.ttl)
        self._data.move_to_end(key)
        while len(self._data) > self.max_size:
            self._data.popitem(last=False)

    def get(self, key, default=None):
        item = self._data.get(key)
        if item is None or item[1] <= self.clock():
            self._data.pop(key, None)
            self.misses += 1
            return default
        self._data.move_to_end(key)
        self.hits += 1
        return item[0]

    def __len__(self):
        now = self.clock()
        return sum(1 for _, expires in self._data.values() if expires > now)

    def get_or_set(self, key, factory):
        sentinel = object()
        value = self.get(key, sentinel)
        if value is sentinel:
            value = factory()
            self.set(key, value)
        return value


now = [0]
cache = TTLCache(ttl=10, max_size=2, clock=lambda: now[0])
cache.set("a", 1)
cache.set("b", 2)
print(cache.get("a"))
cache.set("c", 3)
print(cache.get("b", "немає"), len(cache))
now[0] = 11
print(cache.get("a", "прострочено"))
print(cache.hits, cache.misses)
calls = []
print(cache.get_or_set("k", lambda: calls.append(1) or "значення"), cache.get_or_set("k", lambda: calls.append(1) or "інше"), len(calls))
`,
  "python-rate-limiter": raw`import threading


class RateLimiter:
    def __init__(self, rate, capacity, clock):
        self.rate = rate
        self.capacity = capacity
        self.clock = clock
        self._buckets = {}
        self._lock = threading.Lock()

    def _refill(self, key):
        now = self.clock()
        tokens, updated = self._buckets.get(key, (self.capacity, now))
        tokens = min(self.capacity, tokens + (now - updated) * self.rate)
        return tokens, now

    def allow(self, key):
        with self._lock:
            tokens, now = self._refill(key)
            allowed = tokens >= 1
            self._buckets[key] = (tokens - 1 if allowed else tokens, now)
            return allowed

    def retry_after(self, key):
        with self._lock:
            tokens, now = self._refill(key)
            self._buckets[key] = (tokens, now)
            return 0 if tokens >= 1 else (1 - tokens) / self.rate


now = [0.0]
limiter = RateLimiter(rate=1, capacity=2, clock=lambda: now[0])
print([limiter.allow("оля") for _ in range(3)])
print(limiter.allow("іван"))
print(limiter.retry_after("оля"))
now[0] = 1.5
print(limiter.allow("оля"))
print(round(limiter.retry_after("оля"), 2))
`,
};
