// Еталонні рішення завдань Python, глава 07 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_07 = {
  "python-threads-results": raw`import threading


def square(n, results, index):
    results[index] = n * n


numbers = [1, 2, 3, 4]
results = [None] * len(numbers)

threads = []
for i, n in enumerate(numbers):
    t = threading.Thread(target=square, args=(n, results, i))
    threads.append(t)
    t.start()
for t in threads:
    t.join()

print(results)
`,
  "python-lock-counter": raw`import threading
import time


class Counter:
    def __init__(self):
        self.value = 0
        self.lock = threading.Lock()

    def increment(self):
        with self.lock:
            current = self.value
            time.sleep(0)
            self.value = current + 1


counter = Counter()


def work():
    for _ in range(200):
        counter.increment()


threads = [threading.Thread(target=work) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(counter.value)
`,
  "python-producer-consumer": raw`import queue
import threading

tasks = queue.Queue()
results = queue.Queue()


def consumer():
    while True:
        item = tasks.get()
        if item is None:
            break
        results.put(item * item)


worker = threading.Thread(target=consumer)
worker.start()
for n in [1, 2, 3, 4]:
    tasks.put(n)
tasks.put(None)
worker.join()
print([results.get() for _ in range(results.qsize())])
`,
  "python-thread-pool": raw`from concurrent.futures import ThreadPoolExecutor


def check(n):
    if n % 2 == 0:
        raise ValueError(f"{n} парне")
    return n * 10


def run(numbers):
    good, bad = [], []
    with ThreadPoolExecutor() as pool:
        futures = [(n, pool.submit(check, n)) for n in numbers]
    for n, future in futures:
        try:
            good.append(future.result())
        except ValueError:
            bad.append(n)
    return good, bad


good, bad = run([1, 2, 3, 4, 5])
print(good)
print(bad)
`,
  "python-gil-io": raw`import threading
import time


def pause():
    time.sleep(0.1)


def run_sequential(n):
    start = time.perf_counter()
    for _ in range(n):
        pause()
    return time.perf_counter() - start


def run_threaded(n):
    start = time.perf_counter()
    threads = [threading.Thread(target=pause) for _ in range(n)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    return time.perf_counter() - start


seq = run_sequential(5)
par = run_threaded(5)
print(seq >= 0.5)
print(par < 0.4)
`,
  "python-async-basic": raw`import asyncio


async def greet(name, delay):
    await asyncio.sleep(delay)
    return f"Привіт, {name}!"


async def main():
    print(await greet("Оля", 0.01))
    print(await greet("Іван", 0.01))


asyncio.run(main())
`,
  "python-gather-tasks": raw`import asyncio

order = []


async def job(name, delay):
    await asyncio.sleep(delay)
    order.append(name)
    return name.upper()


async def main():
    results = await asyncio.gather(job("a", 0.03), job("b", 0.01), job("c", 0.02))
    print(results)
    print(order)


asyncio.run(main())
`,
  "python-async-timeout": raw`import asyncio


async def slow():
    try:
        await asyncio.sleep(1)
        return "готово"
    finally:
        print("slow: прибирання")


async def main():
    try:
        await asyncio.wait_for(slow(), timeout=0.05)
    except TimeoutError:
        print("тайм-аут")


asyncio.run(main())
`,
  "python-async-semaphore": raw`import asyncio

active = 0
peak = 0


async def job(n, sem):
    global active, peak
    async with sem:
        active += 1
        peak = max(peak, active)
        await asyncio.sleep(0.02)
        active -= 1
    return n


async def main():
    sem = asyncio.Semaphore(2)
    results = await asyncio.gather(*(job(n, sem) for n in range(6)))
    print(results)
    print(peak)


asyncio.run(main())
`,
  "python-event-semaphore": raw`import threading
import time

start = threading.Event()
sem = threading.Semaphore(2)
lock = threading.Lock()
results = []
active = 0
peak = 0


def worker(n):
    global active, peak
    start.wait()
    with sem:
        with lock:
            active += 1
            peak = max(peak, active)
        time.sleep(0.02)
        with lock:
            active -= 1
    results.append(n)


threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
for t in threads:
    t.start()
start.set()
for t in threads:
    t.join()
print(sorted(results))
print(peak)
`,
  "python-chunks-pickle": raw`import pickle


def chunked(data, size):
    return [data[i:i + size] for i in range(0, len(data), size)]


def sum_squares(chunk):
    return sum(n * n for n in chunk)


numbers = list(range(1, 11))
parts = chunked(numbers, 3)
print(parts)
total = sum(sum_squares(p) for p in parts)
print(total == sum_squares(numbers), total)
print(pickle.loads(pickle.dumps(sum_squares))([1, 2]))
`,
  "python-lock-timeout": raw`import threading


class Account:
    def __init__(self, balance):
        self.balance = balance
        self.lock = threading.Lock()


def try_transfer(src, dst, amount, timeout=0.05):
    if not src.lock.acquire(timeout=timeout):
        return False
    if not dst.lock.acquire(timeout=timeout):
        src.lock.release()
        return False
    try:
        src.balance -= amount
        dst.balance += amount
        return True
    finally:
        dst.lock.release()
        src.lock.release()


a, b = Account(100), Account(0)
b.lock.acquire()
print(try_transfer(a, b, 10))
b.lock.release()
print(try_transfer(a, b, 10))
print(a.balance, b.balance)
`,
  "python-pipeline-threads": raw`import queue
import threading


def stage(func, inbox, outbox):
    while True:
        item = inbox.get()
        if item is None:
            outbox.put(None)
            break
        outbox.put(func(item))


q1, q2, q3 = queue.Queue(), queue.Queue(), queue.Queue()
threads = [
    threading.Thread(target=stage, args=(lambda x: x * x, q1, q2)),
    threading.Thread(target=stage, args=(lambda x: x + 1, q2, q3)),
]
for t in threads:
    t.start()
for n in [1, 2, 3, 4, 5]:
    q1.put(n)
q1.put(None)

results = []
while (item := q3.get(timeout=1)) is not None:
    results.append(item)
for t in threads:
    t.join()
print(results)
`,
  "python-timers": raw`import threading

fired = []

timer1 = threading.Timer(0.05, fired.append, args=("перший",))
timer2 = threading.Timer(0.05, fired.append, args=("другий",))
timer1.start()
timer2.start()
timer2.cancel()
timer1.join()
timer2.join()

print(fired)
`,
  "python-gil-check": raw`import sys
import threading


def gil_enabled():
    return getattr(sys, "_is_gil_enabled", lambda: True)()


class Counter:
    def __init__(self):
        self.value = 0
        self.lock = threading.Lock()

    def increment(self):
        with self.lock:
            self.value += 1


c = Counter()


def work():
    for _ in range(500):
        c.increment()


threads = [threading.Thread(target=work) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(isinstance(gil_enabled(), bool))
print(c.value)
`,
};
