export const LESSONS_12 = [
  {
    t: "Проєкт: аналіз тексту",
    ch: "Проєкти",
    easy: "Перший проєкт збирає докупи те, що ви вже вмієте: рядки, регулярні вирази, словники, сортування й датакласи. Ми побудуємо невеликий інструмент, що за текстом видає звіт: скільки слів, які найчастіші й наскільки вони довгі.",
    p: [
      "Мета проєкту — функція <code>analyze(text)</code>, яка приймає довільний текст і повертає зрозумілу статистику: кількість слів, кількість унікальних слів, кількість речень, найчастіші слова (без службових) і середню довжину слова. Такі інструменти лежать в основі пошуку, аналізу відгуків і перевірки текстів. Проєкт невеликий, але на ньому добре видно, як будується програма з кількох маленьких, незалежних кроків.",
      "Розбийте задачу на етапи: нормалізація (привести до малих літер), токенізація (розбити на слова), підрахунок (<code>Counter</code>), відбір (прибрати службові слова й вибрати топ), форматування звіту. Кожен етап — окрема функція з одним завданням, яку можна перевірити окремо. Токенізацію найпростіше виконати регулярним виразом <code>\\w+</code>: він знаходить послідовності літер і цифр у Unicode, тож кирилиця працює без додаткових зусиль, а тире й розділові знаки відкидаються самі.",
      "Результат зручно повертати не словником із довільними ключами, а датакласом <code>Stats</code> із типізованими полями: так редактор підказує імена, а помилки в іменах виявляються одразу. Для сортування «найчастіші слова» застосуйте ключ <code>(-кількість, слово)</code>, щоб за однакової частоти порядок був передбачуваним: без цього результат залежав би від порядку появи, і тести стали б нестабільними.",
      "Звертайте увагу на крайні випадки: порожній текст (середню довжину слова не можна ділити на нуль), текст без розділових знаків (речень рівно одне), текст лише з розділових знаків (слів немає), різний регістр (<code>Python</code> і <code>python</code> — те саме слово), апострофи (<code>м'ясо</code> розбивається <code>\\w+</code> на дві частини, і це відома обмеженість простого підходу). Кожен такий випадок варто закріпити тестом, а про відомі обмеження чесно написати в документації.",
      "Речення рахують за кінцевими розділовими знаками: розбийте текст за шаблоном <code>[.!?]+</code> і відкиньте порожні частини. Це спрощення: скорочення на кшталт «т. д.» дадуть зайві речення. Для навчального проєкту воно прийнятне, а для справжньої обробки природної мови використовують спеціалізовані бібліотеки (spaCy, nltk). Корисно одразу позначити в коментарі такі припущення: вони допомагають наступній людині зрозуміти межі застосовності.",
      "Перевірте проєкт тестами. Невеликий текст відомого складу дає передбачувані числа: <code>words == 10</code>, <code>unique == 7</code>, <code>sentences == 3</code>. Окремі тести для порожнього тексту та для стоп-слів. Тести фіксують поведінку, і ви можете сміливо покращувати реалізацію (швидший підрахунок, нова метрика), знаючи, що нічого не зламалося. Додайте також звіт: функція <code>report(stats)</code> форматує результат f-рядками у зручний для читання вигляд.",
      "Ідеї для розвитку: читати текст зі стандартного вводу чи файла; додати найдовші слова й слова, що трапилися один раз; порівнювати два тексти за спільними словами (множини); рахувати частоту біграм (пар сусідніх слів); виводити результат у JSON для іншої програми; додати аргументи командного рядка через <code>argparse</code>. Кожне розширення — окремий маленький крок, і саме так програмісти нарощують функціональність без страху все зламати.",
    ],
    code: [
      String.raw`import re

def tokenize(text):
    return re.findall(r"\w+", text.lower())

text = "Python — проста мова. Python любить кожен! Проста мова — це сила."
words = tokenize(text)
print(words)
print(len(words), len(set(words)))
`,
      String.raw`import re
from collections import Counter
from dataclasses import dataclass

@dataclass
class Stats:
    words: int
    unique: int
    sentences: int
    top: list
    avg_len: float

def analyze(text, stop_words=frozenset(), top_n=3):
    words = re.findall(r"\w+", text.lower())
    sentences = [s for s in re.split(r"[.!?]+", text) if s.strip()]
    counts = Counter(w for w in words if w not in stop_words)
    top = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:top_n]
    avg = round(sum(map(len, words)) / len(words), 2) if words else 0.0
    return Stats(len(words), len(set(words)), len(sentences), top, avg)

text = "Python — проста мова. Python любить кожен! Проста мова — це сила."
print(analyze(text, stop_words={"це"}))
`,
      String.raw`def report(stats):
    lines = [
        f"Слів: {stats['words']} (унікальних: {stats['unique']})",
        f"Речень: {stats['sentences']}",
        f"Середня довжина слова: {stats['avg_len']:.2f}",
        "Топ слів:",
    ]
    lines += [f"  {i}. {word}: {count}" for i, (word, count) in enumerate(stats["top"], 1)]
    return "\n".join(lines)

stats = {"words": 10, "unique": 7, "sentences": 3, "avg_len": 4.5, "top": [("python", 2), ("мова", 2)]}
print(report(stats))
`,
      String.raw`import io
import re
import unittest

def words_count(text):
    return len(re.findall(r"\w+", text.lower()))

class TestAnalyze(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(words_count(""), 0)

    def test_punctuation_only(self):
        self.assertEqual(words_count("... !!! —"), 0)

    def test_case_and_dash(self):
        self.assertEqual(words_count("Python — python"), 2)

suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestAnalyze)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print(result.testsRun, result.wasSuccessful())
`,
      String.raw`# аварія: середня довжина слова для порожнього тексту
words = []
print("слів:", len(words))
print(sum(len(w) for w in words) / len(words))
`,
    ],
    note: "Розбийте задачу на маленькі функції (нормалізація, токенізація, підрахунок, звіт), повертайте результат датакласом і сортуйте за ключем <code>(-кількість, слово)</code>. Крайні випадки (порожній текст, лише розділові знаки) закріпіть тестами.",
    work: "Аналіз тексту — основа пошуку, класифікації відгуків, моніторингу згадок і перевірки якості контенту. А побудова проєкту з малих функцій і тестів — той самий робочий процес, за яким пишуть і великі системи, тільки з більшою кількістю етапів.",
    tasks: [
      "Додайте до аналізатора найдовше слово й кількість слів, що трапилися лише один раз, і покрийте нові поля тестами.",
      "Зробіть консольну програму: прочитайте текст із файла за аргументом <code>argparse</code> і виведіть звіт.",
    ],
  },
  {
    t: "Проєкт: REST API нотаток",
    ch: "Проєкти",
    easy: "Другий проєкт — маленький сервіс нотаток із повним набором дій: створити, прочитати, змінити, видалити й знайти. Він поєднує маршрутизацію, валідацію, шари й тестування з попередніх глав у єдине ціле.",
    p: [
      "Мета — API нотаток із такими можливостями: <code>POST /notes</code> створює нотатку, <code>GET /notes</code> повертає список із пошуком (<code>q</code>) і посторінковим виводом (<code>limit</code>, <code>offset</code>), <code>GET /notes/&lt;id&gt;</code> читає, <code>PATCH /notes/&lt;id&gt;</code> змінює частково, <code>DELETE /notes/&lt;id&gt;</code> видаляє. Усе працює в пам'яті й без мережі: обробник отримує метод, шлях, параметри та тіло й повертає пару «статус, дані», а тести викликають його напряму.",
      "Архітектура має три шари. Сховище (<code>NoteRepository</code>) зберігає нотатки в словнику й видає ідентифікатори. Сервіс (<code>NoteService</code>) містить правила: заголовок обов'язковий, не довший за 50 символів, текст необов'язковий; видає доменні помилки <code>ValidationError</code> і <code>NotFoundError</code>. Обробник (<code>handle</code>) розбирає шлях і параметри, викликає сервіс і перетворює помилки на статуси. Така розбивка дозволяє перевіряти правила без HTTP.",
      "Реалізуйте поступово. Спершу сховище й сервіс із тестами. Потім обробник для <code>POST</code> і <code>GET /notes/&lt;id&gt;</code>. Далі список із пагінацією й пошуком, потім <code>PATCH</code> і <code>DELETE</code>. Після кожного кроку запускайте тести. Такий інкрементальний підхід (малий крок — перевірка) знижує ризик і швидше виявляє помилки, ніж написання всього одним махом із наступним довгим пошуком, що саме зламалось.",
      "Приділіть увагу контрактам API. Створення повертає <code>201</code> і нотатку з ідентифікатором. Список повертає об'єкт <code>{\"total\": N, \"items\": [...]}</code>, де <code>total</code> — кількість усіх знайдених записів до пагінації. Неправильні дані — <code>422</code> із <code>{\"error\": ...}</code>, відсутній ресурс — <code>404</code>, видалення — <code>204</code> без тіла. Клієнти звикають до одноманітності, тож однаковий формат помилок — важливіший за красу окремої відповіді.",
      "Валідація заслуговує окремих тестів: заголовок відсутній, порожній, завдовжки 51 символ, число замість рядка; параметри <code>limit</code> і <code>offset</code> не числа чи від'ємні. Для параметрів запиту застосуйте розумні межі (скажімо, <code>limit</code> від 1 до 100 зі значенням за замовчуванням 10). Також вирішіть, що робити з невідомими полями в тілі <code>PATCH</code>: ігнорувати чи відхиляти. Явне рішення краще за випадкову поведінку.",
      "Пошук за підрядком у заголовку без урахування регістру — простий фільтр: <code>q.lower() in note[\"title\"].lower()</code>. Список повертають у стабільному порядку (за зростанням <code>id</code>), інакше тести й клієнти матимуть різні результати. Пагінація — зріз <code>items[offset:offset + limit]</code> від уже відфільтрованого списку. Не забудьте, що <code>total</code> рахується до зрізу, інакше клієнт не дізнається, чи є наступна сторінка.",
      "Куди рухатись далі: обгорнути обробник у WSGI-застосунок і запустити через <code>wsgiref.simple_server</code>; додати проміжні шари журналу й автентифікації; замінити словник на SQLite без зміни сервісу; зробити нотатки прив'язаними до користувачів; додати теги й сортування. Кожне розширення чіпає один шар, і саме для цього шари існують. Ви створили основу справжнього сервісу, який можна нарощувати стільки, скільки потрібно.",
    ],
    code: [
      String.raw`class NoteRepository:
    def __init__(self):
        self._notes = {}
        self._next_id = 1

    def add(self, title, body):
        note = {"id": self._next_id, "title": title, "body": body}
        self._notes[self._next_id] = note
        self._next_id += 1
        return dict(note)

    def get(self, note_id):
        note = self._notes.get(note_id)
        return dict(note) if note else None

    def update(self, note_id, **fields):
        self._notes[note_id].update(fields)
        return dict(self._notes[note_id])

    def delete(self, note_id):
        return self._notes.pop(note_id, None) is not None

    def all(self):
        return [dict(n) for n in self._notes.values()]

repo = NoteRepository()
repo.add("перша", "")
repo.add("друга", "текст")
print(repo.get(2), repo.get(9), len(repo.all()))
`,
      String.raw`class ValidationError(Exception):
    pass

def validate_title(title):
    if not isinstance(title, str) or not title.strip():
        raise ValidationError("поле title обов'язкове")
    if len(title) > 50:
        raise ValidationError("title не довший за 50 символів")
    return title.strip()

def paginate(items, limit=10, offset=0):
    if not 1 <= limit <= 100 or offset < 0:
        raise ValidationError("limit має бути від 1 до 100, offset не від'ємний")
    return {"total": len(items), "items": items[offset:offset + limit]}

print(validate_title("  нотатка  "))
print(paginate(list(range(25)), limit=5, offset=20))
`,
      String.raw`def search(notes, q):
    q = q.lower()
    return [n for n in notes if q in n["title"].lower()]

notes = [{"id": 1, "title": "Купити ХЛІБ"}, {"id": 2, "title": "Лист"}, {"id": 3, "title": "хліб і молоко"}]
print([n["id"] for n in search(notes, "Хліб")])
print([n["id"] for n in search(notes, "")])
`,
      String.raw`import io
import unittest

def status_for(method, path):
    table = {("POST", "/notes"): 201, ("GET", "/notes"): 200, ("DELETE", "/notes/1"): 204}
    return table.get((method, path), 404)

class TestStatuses(unittest.TestCase):
    def test_table(self):
        for method, path, expected in [("POST", "/notes", 201), ("GET", "/notes", 200),
                                       ("DELETE", "/notes/1", 204), ("GET", "/x", 404)]:
            with self.subTest(method=method, path=path):
                self.assertEqual(status_for(method, path), expected)

suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestStatuses)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print(result.testsRun, result.wasSuccessful())
`,
      String.raw`# аварія: оновлення нотатки, якої немає
notes = {1: {"id": 1, "title": "перша"}}

def update(note_id, **fields):
    notes[note_id].update(fields)
    return notes[note_id]

print(update(1, title="змінена"))
print(update(5, title="немає такої"))
`,
    ],
    note: "Розділіть сервіс на шари, повертайте <code>total</code> до пагінації, використовуйте єдиний формат помилок і стабільний порядок списку. Розвивайте проєкт малими кроками, перевіряючи кожен тестами.",
    work: "CRUD-сервіси з пошуком і пагінацією — звичайна робота бекенд-розробника. Уміння розбити таку задачу на шари, зафіксувати контракти й покрити їх тестами відрізняє спокійну розробку від хаотичного латання коду перед кожним релізом.",
    tasks: [
      "Реалізуйте обробник із підтримкою створення, списку з пошуком і пагінацією, зміни та видалення нотаток і перевірте його сценарієм запитів.",
      "Додайте перевірку параметрів <code>limit</code> і <code>offset</code> та тести на неправильні значення.",
    ],
  },
  {
    t: "Проєкт: конкурентний обробник",
    ch: "Проєкти",
    easy: "Третій проєкт — обробник, що виконує багато незалежних завдань одночасно: перевірити сотню адрес, обробити пачку файлів. Він збирає результати за порядком, відділяє успіхи від збоїв і не падає від однієї помилки.",
    p: [
      "Задача: є список завдань (адреси, файли, записи) і функція, яка обробляє одне завдання. Обробка кожного може бути повільною (очікування мережі) і інколи завершується помилкою. Потрібно виконати всі завдання паралельно, не вичерпати ресурси й повернути повний звіт: результати в порядку вхідних даних, список невдач із причинами та підсумкову статистику. Саме так працюють краулери, перевірники посилань і пакетні завантажувачі.",
      "Для завдань, що чекають, підходить пул потоків: <code>ThreadPoolExecutor(max_workers=N)</code>. Кількість працівників обмежує паралелізм: сто завдань при чотирьох працівниках виконуються чотирма пачками, а система не відчуває перевантаження. Функція <code>submit</code> повертає <code>Future</code> для кожного завдання, і ми зберігаємо їх у тому самому порядку, що й завдання, щоб потім зібрати результати за індексом.",
      "Звіт має бути надійним. Не використовуйте <code>pool.map</code> для завдань, що можуть падати: перший виняток перерве збирання результатів. Замість цього зберіть майбутні об'єкти й викличте <code>result()</code> у блоці <code>try/except</code> для кожного: успіх запишіть в <code>results[i]</code>, помилку — в словник <code>errors[i]</code> із текстом. Тоді один збій не зупиняє решту, а ви бачите повну картину.",
      "Асинхронна версія виконує те саме на <code>asyncio</code>: <code>asyncio.gather(*tasks, return_exceptions=True)</code> повертає список результатів і винятків у порядку подання, а <code>Semaphore</code> обмежує кількість одночасних завдань. Вона масштабується краще для тисяч мережевих завдань і не створює потоків. Структура висновку та сама: результати за індексом, окремо помилки. Корисно вміти обидва варіанти й обирати за обставинами.",
      "Додайте відсотки готовності й підсумок: скільки завдань виконано, скільки впало, яка частка успіху. Для таймаутів використовуйте параметр <code>timeout</code> у <code>future.result(timeout=...)</code> або <code>asyncio.timeout</code>; для повторних спроб обгорніть робочу функцію в <code>retry</code>, який ви вже писали. Не лишайте завдання, що висять: завжди передбачайте верхню межу часу для кожного й для всього пакета.",
      "Тестуйте детерміновано: замість справжньої мережі використовуйте робочу функцію, що повертає значення за вхідним, спеціально кидає помилку для певних входів і спить кілька мілісекунд. Тест перевіряє три речі: порядок результатів збігається з порядком входу; помилки потрапили в <code>errors</code> із правильними індексами; загальна кількість успіхів і невдач дорівнює кількості завдань. Ці властивості не залежать від того, який потік коли закінчив.",
      "Можливі розширення: прогрес-бар через <code>as_completed</code>, пріоритетна черга завдань, скасування решти при критичній помилці, обмеження швидкості запитів до одного хоста, збереження звіту в JSON. Кожне зводиться до комбінації вже знайомих інструментів. Виконавши цей проєкт, ви переконаєтесь, що паралелізм — це не магія, а акуратна організація очікування, помилок і результатів.",
    ],
    code: [
      String.raw`from concurrent.futures import ThreadPoolExecutor
import time

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

def work(n):
    time.sleep(0.01)
    if n % 4 == 0:
        raise ValueError(f"{n} ділиться на 4")
    return n * n

print(process_all(list(range(1, 9)), work))
`,
      String.raw`from concurrent.futures import ThreadPoolExecutor, as_completed

def run(items, func):
    done = []
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(func, item): item for item in items}
        for future in as_completed(futures):
            done.append((futures[future], future.result()))
    return sorted(done)

print(run([3, 1, 2], lambda n: n * 10))
`,
      String.raw`import asyncio

async def process_async(items, func, limit=2):
    sem = asyncio.Semaphore(limit)

    async def run_one(item):
        async with sem:
            return await func(item)

    return await asyncio.gather(*(run_one(i) for i in items), return_exceptions=True)

async def work(n):
    await asyncio.sleep(0.01)
    if n == 3:
        raise ValueError("три")
    return n * 2

results = asyncio.run(process_async([1, 2, 3, 4], work))
print([type(r).__name__ if isinstance(r, Exception) else r for r in results])
`,
      String.raw`def summary(results, errors):
    total = len(results)
    failed = len(errors)
    ok = total - failed
    return f"Виконано {ok} з {total}, помилок: {failed} ({ok / total:.0%} успіху)"

print(summary([1, 4, None, 9], {2: "ValueError: 3"}))
`,
      String.raw`# аварія: pool.map перериває збирання на першій помилці
from concurrent.futures import ThreadPoolExecutor

def work(n):
    if n == 2:
        raise ValueError("збій на двійці")
    return n

with ThreadPoolExecutor() as pool:
    print(list(pool.map(work, [1, 2, 3])))
`,
    ],
    note: "Зберігайте майбутні об'єкти в порядку завдань, викликайте <code>result()</code> у <code>try/except</code> і повертайте результати разом із помилками за індексами. Обмежуйте паралелізм кількістю працівників чи семафором і ставте тайм-аути.",
    work: "Перевірка посилань, пакетна обробка файлів, збір даних із десятків API, масові розсилки — усе це конкурентні обробники. Надійний звіт із відокремленими помилками відрізняє промисловий інструмент від скрипта, що падає на першому збої.",
    tasks: [
      "Напишіть функцію, що паралельно обробляє список чисел і повертає результати за порядком та словник помилок за індексами.",
      "Перепишіть її на <code>asyncio</code> із семафором та порівняйте звіти двох версій.",
    ],
  },
  {
    t: "Проєкт: кеш із TTL і generics",
    ch: "Проєкти",
    adv: true,
    easy: "Кеш — це полиця з готовими відповідями: якщо відповідь уже є й не застаріла, її беруть звідти. TTL — термін придатності, після якого запис вважається простроченим, а ліміт розміру викидає найдавніше невикористане.",
    p: [
      "Кеш прискорює систему: дорогі обчислення чи запити зберігають і повторно використовують, поки відповідь актуальна. Нам потрібен універсальний <code>TTLCache[K, V]</code>: узагальнений (generic) клас, що працює з будь-якими ключами й значеннями, видаляє записи після заданого часу життя (TTL, time to live) і не перевищує максимального розміру, викидаючи найдавніше невикористаний запис (політика LRU).",
      "Ключовий дизайн-вибір — час. Якщо кеш напряму викликає <code>time.monotonic()</code>, тести змушені чекати справжні секунди, і вони повільні та нестабільні. Тому годинник передають залежністю: конструктор приймає функцію <code>clock</code> (за замовчуванням <code>time.monotonic</code>). У тесті підставляють підробний годинник, яким керує тест: «просунути час на 10 секунд». Усе, що залежить від часу, стає детермінованим.",
      "Структура даних: <code>collections.OrderedDict</code> зберігає порядок вставлення й має <code>move_to_end</code>. Значення разом із моментом закінчення зберігають кортежем <code>(value, expires_at)</code>. При <code>get</code> перевіряють, чи не минув час: якщо минув, запис видаляють і повертають «немає». Якщо запис є й актуальний, його переносять у кінець (він «свіжий»). При <code>set</code> нового запису, коли розмір перевищено, видаляють перший елемент, тобто найдавніше використаний.",
      "Корисні методи: <code>get(key, default=None)</code>, <code>set(key, value, ttl=None)</code> (власний TTL для запису), <code>delete(key)</code>, <code>__len__</code> і <code>__contains__</code> (не рахувати прострочені), <code>get_or_set(key, factory)</code> (повертає з кешу, а за відсутності обчислює й зберігає), а також лічильники <code>hits</code> і <code>misses</code> для статистики. Саме частка влучань показує, чи кеш приносить користь, і за нею налаштовують TTL та розмір.",
      "Потокобезпека: кеш використовують із різних потоків, тож усі операції захищають замком <code>threading.Lock</code>. Увага на <code>get_or_set</code>: якщо тримати замок під час виклику <code>factory</code>, інші потоки чекатимуть довго; якщо відпустити, дві задачі можуть обчислити одне й те саме (проблема «cache stampede»). Простий компроміс — відпускати замок на час обчислення й змиритися з рідким дублюванням, а складніші рішення використовують блокування за ключем.",
      "Є й зручна форма використання — декоратор: <code>@cached(ttl=60)</code> створює кеш для функції й ключем береться кортеж аргументів. Нагадаємо, що аргументи мають бути хешованими, а функція — чистою, інакше кеш віддаватиме застарілі або чужі відповіді. Для готових випадків є <code>functools.lru_cache</code> (без TTL) і бібліотеки на кшталт <code>cachetools</code>. Але написавши кеш самостійно, ви розумієте, що вони роблять і які в них компроміси.",
      "Чого не варто робити: кешувати помилки чи порожні результати без розуміння наслідків, ставити TTL «на вічність», кешувати персональні дані без урахування користувача (ключ має містити всі параметри, від яких залежить відповідь), забувати про інвалідацію при зміні даних. Відомий жарт стверджує, що в інформатиці лише дві складні речі: інвалідація кешу й іменування. Тому тримайте кеш простим і добре протестованим.",
    ],
    code: [
      String.raw`from collections import OrderedDict

class TTLCache[K, V]:
    def __init__(self, ttl, max_size=128, clock=None):
        import time
        self.ttl = ttl
        self.max_size = max_size
        self.clock = clock or time.monotonic
        self._data: OrderedDict[K, tuple[V, float]] = OrderedDict()
        self.hits = 0
        self.misses = 0

    def set(self, key, value, ttl=None):
        self._data[key] = (value, self.clock() + (ttl if ttl is not None else self.ttl))
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

now = [0]
cache = TTLCache(ttl=10, clock=lambda: now[0])
cache.set("a", 1)
print(cache.get("a"))
now[0] = 11
print(cache.get("a", "прострочено"), cache.hits, cache.misses)
`,
      String.raw`from collections import OrderedDict

cache = OrderedDict()
max_size = 2
for key in ["a", "b", "a", "c"]:
    if key in cache:
        cache.move_to_end(key)
    cache[key] = True
    while len(cache) > max_size:
        cache.popitem(last=False)
print(list(cache))
`,
      String.raw`class Cache:
    def __init__(self):
        self.data = {}
        self.hits = self.misses = 0

    def get_or_set(self, key, factory):
        if key in self.data:
            self.hits += 1
            return self.data[key]
        self.misses += 1
        self.data[key] = factory()
        return self.data[key]

calls = []
cache = Cache()
for _ in range(3):
    cache.get_or_set("report", lambda: calls.append(1) or "дорогий результат")
print(len(calls), cache.hits, cache.misses)
`,
      String.raw`import functools

def cached(store):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args):
            if args not in store:
                store[args] = func(*args)
            return store[args]
        return wrapper
    return decorator

store = {}

@cached(store)
def square(n):
    print("рахуємо", n)
    return n * n

print(square(4), square(4), square(5))
print(sorted(store))
`,
      String.raw`# аварія: ключ кешу має бути хешованим
cache = {}
cache[("a", 1)] = "кортеж можна"
print(len(cache))
cache[["a", 1]] = "список не можна"
`,
    ],
    note: "Передавайте годинник залежністю, щоб тестувати TTL без очікування, зберігайте у <code>OrderedDict</code> пару «значення, момент закінчення» і викидайте найдавніше використане при перевищенні розміру. Ключ має містити всі параметри, від яких залежить відповідь.",
    work: "Кеші живуть у кожному сервісі: на рівні застосунку, бази, мережі (CDN). Правильні TTL, політика витіснення й інвалідація — частина проєктування систем, і саме їх обговорюють на співбесідах із системного дизайну.",
    tasks: [
      "Реалізуйте <code>TTLCache</code> із підробним годинником і перевірте, що запис зникає після закінчення TTL, а при перевищенні розміру видаляється найдавніше невикористаний.",
      "Додайте <code>get_or_set</code> і лічильники влучань, а потім поясніть, як за ними підібрати TTL.",
    ],
  },
  {
    t: "Проєкт: rate limiter і підсумок курсу",
    ch: "Проєкти",
    adv: true,
    easy: "Rate limiter — це турнікет на вході: за хвилину пропускає лише задану кількість людей, а решті каже зачекати. Він захищає сервіс від перевантаження одним користувачем чи ботом, а чесних клієнтів лишає в безпеці.",
    p: [
      "Будь-який публічний сервіс має обмежувати частоту запитів: інакше один клієнт із помилкою в циклі або зловмисник покладе систему. Обмежувач швидкості (rate limiter) вирішує, чи пропустити запит зараз, чи відхилити його з кодом <code>429 Too Many Requests</code> і заголовком <code>Retry-After</code>. Це фінальний проєкт курсу: він використовує час, замки, словники, винятки, проміжні шари й тести з попередніх глав.",
      "Найпоширеніший алгоритм — «відро з токенами» (token bucket). Уявіть відро місткістю <code>capacity</code> токенів, яке поповнюється зі швидкістю <code>rate</code> токенів на секунду. Кожен запит забирає один токен; якщо токенів немає, запит відхиляють. Місткість дозволяє короткі сплески (клієнт може одразу зробити кілька запитів), а швидкість обмежує середню частоту. Токени не накопичуються понад місткість.",
      "Реалізація не потребує фонового потоку для поповнення. Достатньо запам'ятати кількість токенів і момент останнього оновлення. При кожному запиті обчислюють, скільки часу минуло, додають <code>elapsed * rate</code> токенів (але не більше <code>capacity</code>), оновлюють мітку часу й перевіряють, чи є хоча б один токен. Так поповнення «ліниве»: воно виконується лише коли хтось звертається, і не споживає ресурсів у простої.",
      "Як і в кеші, годинник передають залежністю, щоб тести були детермінованими: підроблений годинник просувають вручну. Додайте метод <code>retry_after()</code>, що повідомляє, через скільки секунд з'явиться токен: <code>(1 - tokens) / rate</code>. Його значення клієнт отримує в заголовку <code>Retry-After</code>, і добре поводжений клієнт (як наш із попередніх уроків) чекає саме стільки, а не шарахається навмання.",
      "Обмеження зазвичай діє для кожного клієнта окремо, тому тримають словник «ключ → відро», де ключ — ідентифікатор користувача, ключ API чи IP-адреса. Відра для невикористаних ключів потрібно періодично чистити, інакше пам'ять росте без меж. Доступ до словника захищають замком, а кожне відро має власний замок чи оновлюється атомарно під загальним: ці дрібниці й роблять обмежувач безпечним для потоків.",
      "Інтегруйте обмежувач як проміжний шар: функція <code>rate_limited(app, limiter)</code> бере ключ із запиту, питає <code>limiter.allow(key)</code>, і за відмови повертає <code>429</code> із <code>Retry-After</code>, не викликаючи застосунок. Це та сама схема, що й автентифікація з минулих уроків. Інші алгоритми: вікно, що ковзає (sliding window), лічильник у фіксованому вікні, «протікаюче відро» (leaky bucket): кожен має свої компроміси між точністю, пам'яттю й простотою.",
      "Підсумок курсу. Ви пройшли шлях від першого <code>print</code> до проєктування сервісів: змінні, колекції, функції, класи, типи, генератори, декоратори, помилки, потоки й асинхронність, стандартна бібліотека, тести, HTTP, шари й конфігурація. Далі рухайтеся вшир і вглиб: фреймворки (FastAPI, Django), бази даних і ORM, контейнеризація, аналіз даних, а головне — власні проєкти. Читайте чужий код, пишіть тести, просіть код-рев'ю й не бійтеся помилок: саме з них складається досвід. Успіхів!",
    ],
    code: [
      String.raw`class TokenBucket:
    def __init__(self, rate, capacity, clock):
        if rate <= 0 or capacity <= 0:
            raise ValueError("rate і capacity мають бути додатними")
        self.rate = rate
        self.capacity = capacity
        self.clock = clock
        self.tokens = capacity
        self.updated = clock()

    def _refill(self):
        now = self.clock()
        self.tokens = min(self.capacity, self.tokens + (now - self.updated) * self.rate)
        self.updated = now

    def allow(self):
        self._refill()
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

    def retry_after(self):
        self._refill()
        return 0 if self.tokens >= 1 else (1 - self.tokens) / self.rate

now = [0.0]
bucket = TokenBucket(rate=1, capacity=3, clock=lambda: now[0])
print([bucket.allow() for _ in range(5)])
print(bucket.retry_after())
now[0] = 2.0
print([bucket.allow() for _ in range(3)])
`,
      String.raw`import threading

class RateLimiter:
    def __init__(self, rate, capacity, clock):
        self.rate, self.capacity, self.clock = rate, capacity, clock
        self._buckets = {}
        self._lock = threading.Lock()

    def allow(self, key):
        with self._lock:
            now = self.clock()
            tokens, updated = self._buckets.get(key, (self.capacity, now))
            tokens = min(self.capacity, tokens + (now - updated) * self.rate)
            allowed = tokens >= 1
            self._buckets[key] = (tokens - 1 if allowed else tokens, now)
            return allowed

now = [0.0]
limiter = RateLimiter(rate=1, capacity=2, clock=lambda: now[0])
print([limiter.allow("оля") for _ in range(3)])
print(limiter.allow("іван"))
`,
      String.raw`def rate_limited(app, allow):
    def wrapper(environ, start_response):
        key = environ.get("REMOTE_ADDR", "?")
        if not allow(key):
            start_response("429 Too Many Requests", [("Retry-After", "1")])
            return [b"slow down"]
        return app(environ, start_response)
    return wrapper

def app(environ, start_response):
    start_response("200 OK", [])
    return [b"ok"]

budget = [2]

def allow(key):
    if budget[0] > 0:
        budget[0] -= 1
        return True
    return False

limited = rate_limited(app, allow)
statuses = []
for _ in range(4):
    limited({"REMOTE_ADDR": "1.2.3.4"}, lambda status, headers: statuses.append(status))
print(statuses)
`,
      String.raw`from collections import deque

class SlidingWindow:
    def __init__(self, limit, window, clock):
        self.limit, self.window, self.clock = limit, window, clock
        self.events = deque()

    def allow(self):
        now = self.clock()
        while self.events and self.events[0] <= now - self.window:
            self.events.popleft()
        if len(self.events) < self.limit:
            self.events.append(now)
            return True
        return False

now = [0]
window = SlidingWindow(limit=2, window=10, clock=lambda: now[0])
print([window.allow() for _ in range(3)])
now[0] = 10
print(window.allow())
`,
      String.raw`# аварія: некоректні параметри обмежувача
class TokenBucket:
    def __init__(self, rate, capacity):
        if rate <= 0 or capacity <= 0:
            raise ValueError("rate і capacity мають бути додатними")
        self.rate, self.capacity = rate, capacity

print(TokenBucket(1, 5).capacity)
TokenBucket(0, -1)
`,
    ],
    note: "Token bucket поповнюється «лінивo» за часом, що минув, дозволяє короткі сплески й обмежує середню швидкість. Годинник передавайте залежністю, відра зберігайте за ключем клієнта під замком, а відмову повертайте як <code>429</code> із <code>Retry-After</code>.",
    work: "Обмеження швидкості є в кожному публічному API: у GitHub, Stripe, Telegram. Його налаштовують на шлюзі (nginx, Cloudflare) і в застосунку, а клієнти мають поважати <code>429</code> і <code>Retry-After</code>. Це класична задача зі співбесід із проєктування систем.",
    tasks: [
      "Реалізуйте <code>TokenBucket</code> із підробним годинником і перевірте сплеск, відмову й поповнення після очікування.",
      "Додайте окремі відра для кожного ключа клієнта й проміжний шар, що повертає <code>429</code> із заголовком <code>Retry-After</code>.",
    ],
  },
];
