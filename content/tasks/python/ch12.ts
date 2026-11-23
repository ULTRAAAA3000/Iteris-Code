// Практичні завдання глави «Проєкти» (уроки 106–110). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_12: readonly RemoteTask[] = [
  {
    ...base, id: "python-text-analyzer", lesson: "python/106", xp: 50,
    title: "Проєкт: аналізатор тексту",
    context: "Перший проєкт курсу збирає докупи рядки, регулярні вирази, словники й сортування: за довільним текстом програма видає статистику слів, речень і найчастіших слів без службових.",
    brief: [
      "Допишіть <code>analyze(text, stop_words, top_n)</code>: слова через <code>re.findall(r\"\\w+\", text.lower())</code>, речення — непорожні частини за <code>[.!?]+</code>, топ слів без <code>stop_words</code> за ключем <code>(-кількість, слово)</code>.",
      "Поверніть словник із ключами <code>words</code>, <code>unique</code>, <code>sentences</code>, <code>top</code> (список пар) і <code>avg_len</code> (середня довжина слова з двома знаками; для порожнього тексту <code>0.0</code>).",
    ],
    starter: raw`import re
from collections import Counter


def analyze(text, stop_words=frozenset(), top_n=3):
    # TODO: {"words", "unique", "sentences", "top", "avg_len"}
    return {}


text = "Python — проста мова. Python любить кожен! Проста мова — це сила."
result = analyze(text, stop_words={"це"})
for key in ["words", "unique", "sentences", "top", "avg_len"]:
    print(key, result.get(key))
print(analyze("")["words"], analyze("... !!!")["sentences"])
`,
    checks: [
      { on: "stdout", name: "Кількість слів і унікальних", has: "words 10\nunique 7\nsentences 3", hint: "Слова: re.findall(r\"\\w+\", text.lower()); унікальні — len(set(words))." },
      { on: "stdout", name: "Топ слів і середня довжина", has: "top [('python', 2), ('мова', 2), ('проста', 2)]\navg_len 4.9", hint: "Counter без стоп-слів, сортування за (-count, word), avg = round(sum(map(len, words)) / len(words), 2)." },
      { on: "stdout", name: "Крайні випадки", equals: "words 10\nunique 7\nsentences 3\ntop [('python', 2), ('мова', 2), ('проста', 2)]\navg_len 4.9\n0 0", hint: "Для порожнього тексту слів немає, а речень немає й для самих розділових знаків." },
      { on: "source", name: "Порожній текст не ділиться на нуль", matches: "if\\s+words|else\\s+0|if\\s+not\\s+words", hint: "Захистіть обчислення середньої довжини умовою на наявність слів." },
    ],
  },
  {
    ...base, id: "python-notes-api", lesson: "python/107", xp: 60,
    title: "Проєкт: REST API нотаток",
    context: "Другий проєкт поєднує маршрутизацію, валідацію, шари й пагінацію в одному сервісі. Обробник отримує метод, шлях, параметри й тіло, а повертає пару «статус, дані», тож тестується без жодного сервера.",
    brief: [
      "Допишіть <code>NotesAPI.handle(method, path, query=None, body=None)</code>: <code>POST /notes</code> (<code>201</code>; <code>title</code> обов'язковий і не довший за 50 символів, <code>body</code> необов'язковий), <code>GET /notes</code> (пошук <code>q</code> без урахування регістру, <code>limit</code> 1–100 за замовчуванням 10, <code>offset</code> ≥ 0; відповідь <code>{\"total\", \"items\"}</code>), <code>GET</code>, <code>PATCH</code>, <code>DELETE /notes/&lt;id&gt;</code> (<code>204</code> і <code>None</code> для видалення).",
      "Помилки: <code>422</code> із <code>{\"error\": ...}</code> (<code>поле title обов'язкове</code>, <code>limit має бути від 1 до 100, offset не від'ємний</code>) і <code>404</code> із <code>{\"error\": \"не знайдено\"}</code>.",
    ],
    starter: raw`class NotesAPI:
    def __init__(self):
        self.notes = {}
        self.next_id = 1

    def handle(self, method, path, query=None, body=None):
        # TODO: POST /notes, GET /notes (q, limit, offset), GET/PATCH/DELETE /notes/<id>
        return 500, {}


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
    checks: [
      { on: "stdout", name: "Створення нотаток", has: "(201, {'id': 1, 'title': 'Купити хліб', 'body': 'білий'})\n(201, {'id': 2, 'title': 'Лист другу', 'body': ''})\n(422, {'error': \"поле title обов'язкове\"})", hint: "Без body поле за замовчуванням порожній рядок, а порожній title дає 422." },
      { on: "stdout", name: "Пошук і пагінація", has: "(200, {'total': 1, 'items': [{'id': 1, 'title': 'Купити хліб', 'body': 'білий'}]})\n(200, {'total': 2, 'items': [{'id': 2, 'title': 'Лист другу', 'body': ''}]})", hint: "total рахується до зрізу items[offset:offset + limit]." },
      { on: "stdout", name: "Зміна, видалення й помилки", equals: "(201, {'id': 1, 'title': 'Купити хліб', 'body': 'білий'})\n(201, {'id': 2, 'title': 'Лист другу', 'body': ''})\n(422, {'error': \"поле title обов'язкове\"})\n(200, {'total': 1, 'items': [{'id': 1, 'title': 'Купити хліб', 'body': 'білий'}]})\n(200, {'total': 2, 'items': [{'id': 2, 'title': 'Лист другу', 'body': ''}]})\n(200, {'id': 2, 'title': 'Лист мамі', 'body': ''})\n(204, None)\n(404, {'error': 'не знайдено'})\n(422, {'error': \"limit має бути від 1 до 100, offset не від'ємний\"})", hint: "PATCH змінює лише передані поля, DELETE повертає (204, None), а наступний GET того самого id — 404." },
      { on: "source", name: "Є PATCH і DELETE", matches: "PATCH[\\s\\S]*DELETE|DELETE[\\s\\S]*PATCH", hint: "Обробіть усі методи ресурсу /notes/<id>." },
    ],
  },
  {
    ...base, id: "python-concurrent-processor", lesson: "python/108", xp: 50,
    title: "Проєкт: конкурентний обробник",
    context: "Третій проєкт виконує багато завдань паралельно й повертає надійний звіт: результати за порядком входу, помилки за індексами. Одна невдача не зупиняє решту, а підсумок показує, скільки завдань виконано.",
    brief: [
      "Допишіть <code>process_all(items, func, max_workers=4)</code> через <code>ThreadPoolExecutor</code> і <code>submit</code>: поверніть <code>(results, errors)</code>, де <code>results[i]</code> — результат (або <code>None</code>), а <code>errors[i]</code> — рядок <code>ТипПомилки: текст</code>.",
      "Допишіть <code>process_async(items, func, limit=2)</code>: корутини через <code>gather(..., return_exceptions=True)</code> із <code>Semaphore(limit)</code>.",
    ],
    starter: raw`import asyncio
import time
from concurrent.futures import ThreadPoolExecutor


def process_all(items, func, max_workers=4):
    # TODO: submit для кожного елемента; result() у try/except; (results, errors)
    return [], {}


async def process_async(items, func, limit=2):
    # TODO: Semaphore(limit) і gather(..., return_exceptions=True)
    return []


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
    checks: [
      { on: "stdout", name: "Результати за порядком входу", has: "[1, 4, 9, None, 25, 36, 49, None]", hint: "Зберігайте futures у списку в порядку завдань і записуйте results[index]." },
      { on: "stdout", name: "Помилки за індексами", has: "{3: 'ValueError: 4 ділиться на 4', 7: 'ValueError: 8 ділиться на 4'}", hint: "errors[index] = f\"{type(e).__name__}: {e}\" у блоці except." },
      { on: "stdout", name: "Підсумок і асинхронна версія", equals: "[1, 4, 9, None, 25, 36, 49, None]\n{3: 'ValueError: 4 ділиться на 4', 7: 'ValueError: 8 ділиться на 4'}\nВиконано 6 з 8, помилок: 2 (75% успіху)\n[2, 4, 'ValueError', 8]", hint: "gather з return_exceptions=True повертає виняток як значення у списку результатів." },
      { on: "source", name: "Використано пул і семафор", matches: "ThreadPoolExecutor[\\s\\S]*Semaphore|Semaphore[\\s\\S]*ThreadPoolExecutor", hint: "Потрібні і ThreadPoolExecutor, і asyncio.Semaphore." },
    ],
  },
  {
    ...base, id: "python-ttl-cache", lesson: "python/109", xp: 55,
    title: "Проєкт: TTLCache із LRU",
    context: "Кеш зберігає готові відповіді, знищує прострочені й не перевищує розміру, викидаючи найдавніше невикористане. Годинник передається залежністю, тому закінчення терміну перевіряється без жодного очікування.",
    brief: [
      "Допишіть узагальнений <code>TTLCache[K, V]</code> на <code>OrderedDict</code>: <code>set(key, value)</code>, <code>get(key, default=None)</code> (прострочений запис видаляється й дає промах), <code>__len__</code> (лише актуальні), <code>get_or_set(key, factory)</code> і лічильники <code>hits</code> та <code>misses</code>.",
      "При <code>set</code> запис стає найновішим, а при перевищенні <code>max_size</code> видаляється найдавніше використаний.",
    ],
    starter: raw`import time
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
        # TODO: (value, clock() + ttl), move_to_end, викинути найдавніший при перевищенні max_size
        pass

    def get(self, key, default=None):
        # TODO: прострочений -> видалити, misses += 1, default; інакше move_to_end, hits += 1
        return default

    def __len__(self):
        # TODO: кількість непрострочених записів
        return 0

    def get_or_set(self, key, factory):
        # TODO: значення з кешу або factory() із збереженням
        return None


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
    checks: [
      { on: "stdout", name: "LRU: b викинуто, a лишилось", has: "1\nнемає 2\n", hint: "Після get(\"a\") ключ a найновіший, тож при set(\"c\") видаляється b." },
      { on: "stdout", name: "Прострочений запис і лічильники", has: "прострочено\n1 2\n", hint: "expires_at <= clock() означає прострочено: видаліть запис і збільшіть misses." },
      { on: "stdout", name: "get_or_set викликає factory один раз", equals: "1\nнемає 2\nпрострочено\n1 2\nзначення значення 1", hint: "Другий виклик get_or_set бере значення з кешу, і factory не викликається." },
      { on: "source", name: "Використано OrderedDict і move_to_end", matches: "move_to_end[\\s\\S]*popitem|popitem[\\s\\S]*move_to_end", hint: "move_to_end позначає запис свіжим, popitem(last=False) викидає найдавніший." },
    ],
  },
  {
    ...base, id: "python-rate-limiter", lesson: "python/110", xp: 55,
    title: "Проєкт: rate limiter на token bucket",
    context: "Фінальний проєкт курсу захищає сервіс від перевантаження: кожен клієнт має своє відро токенів, що поповнюється з часом. Після вичерпання запит відхиляється, а клієнт дізнається, скільки чекати.",
    brief: [
      "Допишіть <code>RateLimiter(rate, capacity, clock)</code>: для кожного ключа зберігайте <code>(tokens, updated)</code>. Метод <code>allow(key)</code> поповнює відро на <code>(now - updated) * rate</code> (не вище <code>capacity</code>) і забирає один токен, якщо він є.",
      "Метод <code>retry_after(key)</code> повертає, через скільки секунд з'явиться токен: <code>0</code>, якщо вже є, інакше <code>(1 - tokens) / rate</code>. Усі операції виконуйте під замком.",
    ],
    starter: raw`import threading


class RateLimiter:
    def __init__(self, rate, capacity, clock):
        self.rate = rate
        self.capacity = capacity
        self.clock = clock
        self._buckets = {}
        self._lock = threading.Lock()

    def allow(self, key):
        # TODO: поповнення за часом, перевірка і списання одного токена
        return True

    def retry_after(self, key):
        # TODO: 0, якщо токен є, інакше (1 - tokens) / rate
        return 0


now = [0.0]
limiter = RateLimiter(rate=1, capacity=2, clock=lambda: now[0])
print([limiter.allow("оля") for _ in range(3)])
print(limiter.allow("іван"))
print(limiter.retry_after("оля"))
now[0] = 1.5
print(limiter.allow("оля"))
print(round(limiter.retry_after("оля"), 2))
`,
    checks: [
      { on: "stdout", name: "Сплеск і відмова", has: "[True, True, False]\nTrue\n", hint: "Ємність 2 дозволяє два запити підряд, третій відхиляється; іншому ключу відро окреме." },
      { on: "stdout", name: "Час очікування", has: "1.0\nTrue\n", hint: "retry_after = (1 - tokens) / rate, коли токенів менше одного." },
      { on: "stdout", name: "Поповнення з часом", equals: "[True, True, False]\nTrue\n1.0\nTrue\n0.5", hint: "Через 1.5 с відро отримує 1.5 токена, після списання лишається 0.5." },
      { on: "source", name: "Операції під замком", has: "with self._lock", hint: "Захистіть allow і retry_after через with self._lock:." },
    ],
  },
];
