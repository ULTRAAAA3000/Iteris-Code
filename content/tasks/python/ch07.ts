// Практичні завдання глави «Паралелізм і асинхронність» (уроки 59–73). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_07: readonly RemoteTask[] = [
  {
    ...base, id: "python-threads-results", lesson: "python/59", xp: 20,
    title: "Квадрати чисел у потоках",
    context: "Потоки виконують кілька справ одночасно, але результат вони не повертають як функція. Типовий шлях: кожен потік пише у власну комірку спільного списку, а головний чекає всіх через join.",
    brief: [
      "У функції <code>square</code> запишіть <code>n * n</code> у <code>results[index]</code>.",
      "Для кожного числа створіть і запустіть потік (<code>threading.Thread</code> з <code>target</code> і <code>args</code>), а потім дочекайтеся всіх через <code>join()</code>.",
    ],
    starter: raw`import threading


def square(n, results, index):
    # TODO: results[index] = n * n
    pass


numbers = [1, 2, 3, 4]
results = [None] * len(numbers)

# TODO: створіть і запустіть потік для кожного числа, потім дочекайтеся всіх (join)

print(results)
`,
    checks: [
      { on: "stdout", name: "Квадрати обчислено в усіх комірках", has: "[1, 4, 9, 16]", hint: "Кожен потік пише у свою комірку results[index]." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[1, 4, 9, 16]", hint: "Виводьте список лише після того, як усі потоки завершилися." },
      { on: "source", name: "Використано Thread", has: "Thread(", hint: "threading.Thread(target=square, args=(n, results, i))." },
      { on: "source", name: "Потоки дочекано через join", has: ".join()", hint: "Для кожного потоку викличте t.join()." },
    ],
  },
  {
    ...base, id: "python-lock-counter", lesson: "python/60", xp: 25,
    title: "Лічильник без гонки даних",
    context: "Збільшення лічильника з кількох потоків без замка губить частину збільшень. Замок робить критичну секцію неподільною, і результат завжди рівний очікуваному.",
    brief: [
      "Додайте у <code>Counter</code> замок <code>threading.Lock()</code> і захистіть ним усі три кроки в <code>increment</code> (прочитати, віддати керування, записати) через <code>with</code>.",
      "Чотири потоки по 200 збільшень мають дати рівно <code>800</code>.",
    ],
    starter: raw`import threading
import time


class Counter:
    def __init__(self):
        self.value = 0
        # TODO: створіть замок

    def increment(self):
        # TODO: захистіть критичну секцію замком (with)
        current = self.value
        time.sleep(0)          # віддаємо керування іншому потоку
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
    checks: [
      { on: "stdout", name: "Жодне збільшення не загубилося", equals: "800", hint: "Усі три рядки читання, паузи й запису мають бути всередині одного with self.lock:." },
      { on: "source", name: "Створено замок", has: "Lock()", hint: "У __init__ додайте self.lock = threading.Lock()." },
      { on: "source", name: "Критична секція під with", matches: "with\\s+self\\._?lock\\s*:", hint: "Використайте with self.lock: навколо читання й запису." },
    ],
  },
  {
    ...base, id: "python-producer-consumer", lesson: "python/61", xp: 25,
    title: "Виробник і споживач через чергу",
    context: "Черга дозволяє потокам обмінюватися даними без спільних змінних і замків. Споживач бере завдання, виробник їх додає, а спеціальний маркер повідомляє, що роботи більше не буде.",
    brief: [
      "Допишіть <code>consumer</code>: у циклі беріть елемент із <code>tasks</code>; якщо це <code>None</code>, завершуйте цикл, інакше кладіть квадрат числа в <code>results</code>.",
      "Решта коду запускає споживача, додає числа 1–4 з маркером <code>None</code> і виводить результати.",
    ],
    starter: raw`import queue
import threading

tasks = queue.Queue()
results = queue.Queue()


def consumer():
    # TODO: беріть числа з tasks, None - сигнал завершення, квадрати кладіть у results
    pass


worker = threading.Thread(target=consumer)
worker.start()
for n in [1, 2, 3, 4]:
    tasks.put(n)
tasks.put(None)
worker.join()
print([results.get() for _ in range(results.qsize())])
`,
    checks: [
      { on: "stdout", name: "Квадрати зібрано в порядку надходження", has: "[1, 4, 9, 16]", hint: "Споживач в циклі while True бере item = tasks.get() і кладе item * item у results." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[1, 4, 9, 16]", hint: "Після маркера None цикл має завершитися." },
      { on: "source", name: "Є перевірка маркера None", matches: "is\\s+None", hint: "Якщо item is None, виходьте з циклу через break." },
    ],
  },
  {
    ...base, id: "python-thread-pool", lesson: "python/62", xp: 25,
    title: "Пул потоків: успіхи й невдачі окремо",
    context: "Пул розподіляє завдання між потоками, а Future повертає результат або піднімає помилку. Так перевіряють сотні адрес одночасно й дізнаються, що вдалося, а що ні.",
    brief: [
      "У <code>run(numbers)</code> відправте <code>check(n)</code> для кожного числа в <code>ThreadPoolExecutor</code> через <code>submit</code>.",
      "Зберіть успішні результати у <code>good</code>, а числа, для яких <code>result()</code> кинула <code>ValueError</code>, у <code>bad</code>, і поверніть <code>(good, bad)</code>.",
    ],
    starter: raw`from concurrent.futures import ThreadPoolExecutor


def check(n):
    if n % 2 == 0:
        raise ValueError(f"{n} парне")
    return n * 10


def run(numbers):
    # TODO: submit для кожного числа; good - результати, bad - числа з помилкою
    return [], []


good, bad = run([1, 2, 3, 4, 5])
print(good)
print(bad)
`,
    checks: [
      { on: "stdout", name: "Успішні результати", has: "[10, 30, 50]", hint: "Для непарних чисел check повертає n * 10." },
      { on: "stdout", name: "Числа з помилкою", has: "[2, 4]", hint: "future.result() піднімає ValueError: перехопіть його й додайте число в bad." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[10, 30, 50]\n[2, 4]", hint: "Зберігайте порядок: ітеруйте по числах, а не за порядком завершення." },
      { on: "source", name: "Використано submit і пул", matches: "ThreadPoolExecutor[\\s\\S]*submit\\(", hint: "Створіть пул через with ThreadPoolExecutor() as pool і викликайте pool.submit." },
    ],
  },
  {
    ...base, id: "python-gil-io", lesson: "python/63", xp: 25,
    title: "Паузи в потоках: чекання не складається",
    context: "Поки потік чекає (мережа, диск), він віддає GIL, тож п'ять очікувань у потоках тривають приблизно стільки, скільки одне. Саме для цього потоки в Python й корисні.",
    brief: [
      "У <code>run_threaded(n)</code> запустіть <code>pause</code> у <code>n</code> потоках одночасно, дочекайтеся їх і поверніть витрачений час.",
      "Виводить перевірки: послідовний запуск 5 пауз по 0,1 с триває щонайменше 0,5 с, а потоковий менше 0,4 с.",
    ],
    starter: raw`import threading
import time


def pause():
    time.sleep(0.1)


def run_sequential(n):
    start = time.perf_counter()
    for _ in range(n):
        pause()
    return time.perf_counter() - start


def run_threaded(n):
    # TODO: те саме, але в n потоках одночасно (start усіх, потім join усіх)
    start = time.perf_counter()
    for _ in range(n):
        pause()
    return time.perf_counter() - start


seq = run_sequential(5)
par = run_threaded(5)
print(seq >= 0.5)
print(par < 0.4)
`,
    checks: [
      { on: "stdout", name: "Послідовно: щонайменше 0.5 с", has: "True\n", hint: "Послідовна версія вже готова й повертає ≥ 0.5." },
      { on: "stdout", name: "Потоками: менше 0.4 с", equals: "True\nTrue", hint: "Спершу запустіть усі потоки (start), а вже потім викличте join для кожного." },
      { on: "source", name: "Використано потоки", has: "Thread(", hint: "threading.Thread(target=pause)." },
    ],
  },
  {
    ...base, id: "python-async-basic", lesson: "python/64", xp: 20,
    title: "Перша корутина з asyncio.sleep",
    context: "Корутина виконується лише коли її чекають, а asyncio.sleep, на відміну від time.sleep, не блокує увесь цикл подій. З такої пари починається будь-яка асинхронна програма.",
    brief: [
      "Допишіть корутину <code>greet(name, delay)</code>: <code>await asyncio.sleep(delay)</code> і результат <code>Привіт, ІМ'Я!</code>.",
      "У <code>main</code> дочекайтеся (<code>await</code>) двох викликів і виведіть результати окремими рядками.",
    ],
    starter: raw`import asyncio


async def greet(name, delay):
    # TODO: await asyncio.sleep(delay) і поверніть f"Привіт, {name}!"
    return ""


async def main():
    # TODO: await greet("Оля", 0.01) і await greet("Іван", 0.01); виведіть обидва результати
    pass


asyncio.run(main())
`,
    checks: [
      { on: "stdout", name: "Перше привітання", has: "Привіт, Оля!", hint: "Поверніть f\"Привіт, {name}!\" після asyncio.sleep." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Привіт, Оля!\nПривіт, Іван!", hint: "Кожен виклик корутини потрібно чекати через await." },
      { on: "source", name: "Використано await asyncio.sleep", matches: "await\\s+asyncio\\.sleep\\(", hint: "Затримку робіть через await asyncio.sleep(delay)." },
    ],
  },
  {
    ...base, id: "python-gather-tasks", lesson: "python/65", xp: 25,
    title: "gather: одночасні корутини",
    context: "gather запускає кілька корутин одночасно й повертає результати в порядку подання, незалежно від того, хто завершився першим. Три запити по секунді займають одну секунду, а не три.",
    brief: [
      "У <code>main</code> запустіть через <code>asyncio.gather</code> три виклики <code>job</code> з параметрами <code>(\"a\", 0.03)</code>, <code>(\"b\", 0.01)</code>, <code>(\"c\", 0.02)</code>.",
      "Виведіть список результатів (він у порядку подання), а потім список <code>order</code> (порядок завершення).",
    ],
    starter: raw`import asyncio

order = []


async def job(name, delay):
    await asyncio.sleep(delay)
    order.append(name)
    return name.upper()


async def main():
    # TODO: gather трьох job; виведіть results, а потім order
    pass


asyncio.run(main())
`,
    checks: [
      { on: "stdout", name: "Результати в порядку подання", has: "['A', 'B', 'C']", hint: "await asyncio.gather(job(...), job(...), job(...)) повертає список результатів." },
      { on: "stdout", name: "Порядок завершення: b, c, a", equals: "['A', 'B', 'C']\n['b', 'c', 'a']", hint: "Швидші корутини завершуються першими: order заповнюється в порядку завершення." },
      { on: "source", name: "Використано gather", has: "asyncio.gather(", hint: "Викличте asyncio.gather(...) із трьома корутинами." },
    ],
  },
  {
    ...base, id: "python-async-timeout", lesson: "python/66", xp: 25,
    title: "Тайм-аут і прибирання при скасуванні",
    context: "Асинхронна програма не повинна чекати вічно. Тайм-аут скасовує повільну корутину, а блок finally усередині неї гарантує, що ресурси будуть звільнені.",
    brief: [
      "У <code>main</code> чекайте <code>slow()</code> через <code>asyncio.wait_for</code> не довше 0,05 с.",
      "Якщо вичерпався час (<code>TimeoutError</code>), виведіть <code>тайм-аут</code>. Блок <code>finally</code> усередині <code>slow</code> уже виводить повідомлення про прибирання.",
    ],
    starter: raw`import asyncio


async def slow():
    try:
        await asyncio.sleep(1)
        return "готово"
    finally:
        print("slow: прибирання")


async def main():
    # TODO: wait_for(slow(), timeout=0.05); при TimeoutError виведіть "тайм-аут"
    pass


asyncio.run(main())
`,
    checks: [
      { on: "stdout", name: "Корутину скасовано з прибиранням", has: "slow: прибирання", hint: "wait_for скасовує slow(), і її блок finally виконується." },
      { on: "stdout", name: "Тайм-аут оброблено", equals: "slow: прибирання\nтайм-аут", hint: "Перехопіть TimeoutError і виведіть тайм-аут." },
      { on: "source", name: "Використано wait_for або timeout", matches: "wait_for\\(|asyncio\\.timeout\\(", hint: "Скористайтеся asyncio.wait_for(slow(), timeout=0.05)." },
    ],
  },
  {
    ...base, id: "python-async-semaphore", lesson: "python/67", xp: 30,
    title: "Обмеження паралелізму семафором",
    context: "Тисяча одночасних запитів перевантажить будь-який сервер. Семафор пропускає лише задану кількість задач одночасно, а решта чекають у черзі.",
    brief: [
      "У <code>job</code> використайте <code>async with sem:</code>: збільште <code>active</code>, оновіть <code>peak</code>, зачекайте <code>asyncio.sleep(0.02)</code> і зменште <code>active</code>.",
      "Після запуску шести задач із семафором на 2 найбільша кількість одночасних має дорівнювати 2.",
    ],
    starter: raw`import asyncio

active = 0
peak = 0


async def job(n, sem):
    global active, peak
    # TODO: async with sem: збільшіть active, оновіть peak, await asyncio.sleep(0.02), зменшіть active
    return n


async def main():
    sem = asyncio.Semaphore(2)
    results = await asyncio.gather(*(job(n, sem) for n in range(6)))
    print(results)
    print(peak)


asyncio.run(main())
`,
    checks: [
      { on: "stdout", name: "Результати всіх задач", has: "[0, 1, 2, 3, 4, 5]", hint: "Кожна задача повертає свій номер n." },
      { on: "stdout", name: "Одночасно не більше двох", equals: "[0, 1, 2, 3, 4, 5]\n2", hint: "peak = max(peak, active) після active += 1 усередині async with sem." },
      { on: "source", name: "Використано async with sem", matches: "async\\s+with\\s+sem", hint: "Огорніть роботу в async with sem:." },
    ],
  },
  {
    ...base, id: "python-event-semaphore", lesson: "python/68", xp: 25,
    title: "Спільний старт і семафор у потоках",
    context: "Event дозволяє потокам чекати спільного сигналу, а Semaphore обмежує кількість тих, хто одночасно користується ресурсом. Разом вони описують типові сценарії координації.",
    brief: [
      "У <code>worker</code> чекайте <code>start.wait()</code>, потім під <code>with sem</code> збільште <code>active</code>, оновіть <code>peak</code> (обидва під <code>lock</code>), поспіть 0,02 с і зменште <code>active</code>.",
      "Наприкінці додайте <code>n</code> у <code>results</code>. Максимум одночасних має бути 2.",
    ],
    starter: raw`import threading
import time

start = threading.Event()
sem = threading.Semaphore(2)
lock = threading.Lock()
results = []
active = 0
peak = 0


def worker(n):
    global active, peak
    # TODO: start.wait(); with sem: (під lock) active += 1, оновити peak; sleep(0.02); (під lock) active -= 1
    #       потім results.append(n)
    pass


threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
for t in threads:
    t.start()
start.set()
for t in threads:
    t.join()
print(sorted(results))
print(peak)
`,
    checks: [
      { on: "stdout", name: "Усі потоки відпрацювали", has: "[0, 1, 2, 3, 4]", hint: "Кожен потік після роботи додає свій n у results." },
      { on: "stdout", name: "Одночасно не більше двох", equals: "[0, 1, 2, 3, 4]\n2", hint: "Семафор sem на 2 пропускає лише двох: peak не перевищить 2." },
      { on: "source", name: "Використано Event.wait і Semaphore", matches: "start\\.wait\\(\\)[\\s\\S]*with\\s+sem", hint: "Спершу start.wait(), потім with sem:." },
    ],
  },
  {
    ...base, id: "python-chunks-pickle", lesson: "python/69", xp: 30,
    title: "Підготовка до паралелізму: шматки й pickle",
    context: "Пул процесів ділить роботу на шматки й передає функції та дані через pickle. Кожен із цих кроків можна перевірити без жодного процесу, а потім уже вмикати паралелізм.",
    brief: [
      "Допишіть <code>chunked(data, size)</code> (список шматків по <code>size</code> елементів) і <code>sum_squares(chunk)</code> (сума квадратів).",
      "Перевірте, що сума часткових результатів дорівнює результату для всього списку, а функція піклиться: <code>pickle.loads(pickle.dumps(sum_squares))([1, 2])</code> дає 5.",
    ],
    starter: raw`import pickle


def chunked(data, size):
    # TODO: [data[i:i + size], ...] для i = 0, size, 2 * size ...
    return []


def sum_squares(chunk):
    # TODO: сума квадратів елементів
    return 0


numbers = list(range(1, 11))
parts = chunked(numbers, 3)
print(parts)
total = sum(sum_squares(p) for p in parts)
print(total == sum_squares(numbers), total)
print(pickle.loads(pickle.dumps(sum_squares))([1, 2]))
`,
    checks: [
      { on: "stdout", name: "Розбиття на шматки", has: "[[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]", hint: "Зріз data[i:i + size] у генераторі списку з range(0, len(data), size)." },
      { on: "stdout", name: "Підсумок збігається з послідовним", has: "True 385", hint: "Сума квадратів чисел від 1 до 10 дорівнює 385." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]\nTrue 385\n5", hint: "Функція на верхньому рівні піклиться й працює після відновлення." },
    ],
  },
  {
    ...base, id: "python-lock-timeout", lesson: "python/70", xp: 30,
    title: "Переказ із тайм-аутом замість зависання",
    context: "Нескінченне очікування замка перетворює взаємне блокування на зависання. Тайм-аут у acquire дозволяє виявити проблему, відпустити взяте й повернути зрозумілу відповідь.",
    brief: [
      "Допишіть <code>try_transfer(src, dst, amount)</code>: захопіть <code>src.lock</code> і <code>dst.lock</code> через <code>acquire(timeout=...)</code>.",
      "Якщо замок не вдалося захопити, звільніть уже взятий і поверніть <code>False</code>; інакше перекажіть суму, звільніть обидва замки й поверніть <code>True</code>.",
    ],
    starter: raw`import threading


class Account:
    def __init__(self, balance):
        self.balance = balance
        self.lock = threading.Lock()


def try_transfer(src, dst, amount, timeout=0.05):
    # TODO: acquire(timeout=timeout) для обох замків; при невдачі звільніть взяте й поверніть False
    #       при успіху: перекажіть amount, звільніть замки (finally), поверніть True
    return True


a, b = Account(100), Account(0)
b.lock.acquire()
print(try_transfer(a, b, 10))
b.lock.release()
print(try_transfer(a, b, 10))
print(a.balance, b.balance)
`,
    checks: [
      { on: "stdout", name: "Зайнятий замок: False", has: "False\n", hint: "Якщо dst.lock.acquire(timeout=timeout) повернув False, звільніть src.lock і поверніть False." },
      { on: "stdout", name: "Вільні замки: переказ виконано", equals: "False\nTrue\n90 10", hint: "Після невдалої спроби баланси не змінюються, після вдалої 90 і 10." },
      { on: "source", name: "Використано acquire з тайм-аутом", matches: "acquire\\(\\s*timeout", hint: "lock.acquire(timeout=timeout) повертає False, коли час вийшов." },
    ],
  },
  {
    ...base, id: "python-pipeline-threads", lesson: "python/71", xp: 30,
    title: "Двоетапний конвеєр на потоках і чергах",
    context: "У конвеєрі кожен етап працює у своєму потоці й передає результат наступному через чергу. Поки перший готує нове значення, другий уже обробляє попереднє.",
    brief: [
      "Допишіть <code>stage(func, inbox, outbox)</code>: беріть елементи з <code>inbox</code>, кладіть <code>func(item)</code> в <code>outbox</code>.",
      "Отримавши маркер <code>None</code>, передайте його далі в <code>outbox</code> і завершіться. Конвеєр підносить числа до квадрата й додає одиницю.",
    ],
    starter: raw`import queue
import threading


def stage(func, inbox, outbox):
    # TODO: беріть елементи з inbox, застосовуйте func, кладіть у outbox
    #       None - маркер: передайте його далі й завершіться
    pass


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
    checks: [
      { on: "stdout", name: "Результат конвеєра", has: "[2, 5, 10, 17, 26]", hint: "Спочатку x * x, потім x + 1: для 1 це 2, для 2 це 5." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[2, 5, 10, 17, 26]", hint: "Маркер None має пройти через обидва етапи, інакше головний потік чекатиме." },
      { on: "source", name: "Маркер передається далі", matches: "outbox\\.put\\(None\\)", hint: "Отримавши None, викличте outbox.put(None)." },
    ],
  },
  {
    ...base, id: "python-timers", lesson: "python/72", xp: 20,
    title: "Два таймери, один скасовано",
    context: "Таймер виконує функцію з затримкою в окремому потоці й не блокує програму. Непотрібний таймер слід скасувати до спрацювання, інакше він триматиме програму живою.",
    brief: [
      "Створіть два <code>threading.Timer</code> по 0,05 с: перший додає <code>\"перший\"</code> у <code>fired</code>, другий <code>\"другий\"</code>.",
      "Запустіть обидва, другий скасуйте (<code>cancel()</code>), дочекайтеся обох (<code>join()</code>) і виведіть <code>fired</code>.",
    ],
    starter: raw`import threading

fired = []

# TODO: timer1 = Timer(0.05, fired.append, args=("перший",)), timer2 аналогічно для "другий"
# TODO: запустіть обидва, скасуйте timer2, дочекайтеся обох (join)

print(fired)
`,
    checks: [
      { on: "stdout", name: "Спрацював лише перший таймер", equals: "['перший']", hint: "Скасуйте timer2.cancel() до того, як мине 0,05 с." },
      { on: "source", name: "Використано Timer", has: "Timer(", hint: "threading.Timer(0.05, fired.append, args=(\"перший\",))." },
      { on: "source", name: "Один таймер скасовано", has: ".cancel()", hint: "Метод cancel() скасовує таймер до спрацювання." },
    ],
  },
  {
    ...base, id: "python-gil-check", lesson: "python/73", xp: 25,
    title: "Перевірка GIL і потокобезпечний лічильник",
    context: "У збірці без GIL приховані гонки даних проявляються, тому код має бути потокобезпечним незалежно від режиму. Перевірку GIL роблять безпечно, щоб вона працювала на будь-якій версії.",
    brief: [
      "Допишіть <code>gil_enabled()</code> через <code>getattr(sys, \"_is_gil_enabled\", ...)</code>: якщо функції немає (версії до 3.13), поверніть <code>True</code>.",
      "У <code>Counter</code> додайте замок і захистіть ним збільшення. Чотири потоки по 500 збільшень мають дати <code>2000</code>.",
    ],
    starter: raw`import sys
import threading


def gil_enabled():
    # TODO: getattr(sys, "_is_gil_enabled", lambda: True)()
    return None


class Counter:
    def __init__(self):
        self.value = 0
        # TODO: замок

    def increment(self):
        # TODO: збільшення під замком
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
    checks: [
      { on: "stdout", name: "gil_enabled повертає bool", has: "True\n", hint: "getattr із запасним варіантом lambda: True працює на будь-якій версії." },
      { on: "stdout", name: "Лічильник не втрачає збільшень", equals: "True\n2000", hint: "Захистіть self.value += 1 через with self.lock:." },
      { on: "source", name: "Безпечна перевірка через getattr", has: "getattr(", hint: "Не звертайтеся до sys._is_gil_enabled напряму." },
      { on: "source", name: "Є замок", has: "Lock()", hint: "У __init__ створіть self.lock = threading.Lock()." },
    ],
  },
];
