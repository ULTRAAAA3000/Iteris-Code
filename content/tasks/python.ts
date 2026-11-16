// Практичні завдання курсу Python: по одному на кожен урок. Запускаються на сервері (runtime: "remote"),
// перевірка за stdout і кодом (checks). Еталони: tests/solutions/python.mjs. Формат і правила: Documentation/task-runtime.md
// Пісочниця без мережі й клавіатури: замість input() і файлів на диску використовуємо готові дані та io.StringIO.
import type { RemoteTask } from "../../src/tasks/types.ts";

const raw = String.raw;
const base = { course: "python", runtime: "remote", lang: "python", file: "main.py", editorLang: "python", premium: false } as const;

export const PYTHON_TASKS: readonly RemoteTask[] = [
  {
    ...base, id: "python-hello-run", lesson: "python/1", xp: 15,
    title: "Перший запуск: привітання і обчислення",
    context: "Python часто використовують як калькулятор і швидкий скрипт: написав рядок, запустив, побачив результат. Із цього починається будь-яка автоматизація.",
    brief: [
      "Виведіть два рядки: <code>Привіт, Python!</code> і результат виразу <code>2 ** 10</code> (піднесення до степеня), а саме число, без готової відповіді в коді.",
      "Натисніть «Запустити»: код виконається на сервері, а вивід з'явиться в терміналі.",
    ],
    starter: raw`# Виведіть: Привіт, Python! і значення 2 ** 10
print()
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, Python!»", has: "Привіт, Python!" },
      { on: "stdout", name: "Друге число дорівнює 1024", has: "1024" },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, Python!\n1024" },
      { on: "source", name: "Число обчислюється виразом 2 ** 10", matches: "2\\s*\\*\\*\\s*10" },
    ],
  },
  {
    ...base, id: "python-print-sep-end", lesson: "python/2", xp: 15,
    title: "print: розділювач sep і закінчення end",
    context: "Параметри sep і end керують виводом: через них роблять списки в один рядок, індикатори прогресу, CSV-рядки. Без зайвої склейки рядків руками.",
    brief: [
      "Першим рядком виведіть <code>Go-Rust-Python</code> одним викликом <code>print</code> з параметром <code>sep=\"-\"</code>.",
      "Другим рядком виведіть <code>Завантаження... готово</code> двома викликами <code>print</code>: перший має закінчуватись на <code>... </code> завдяки <code>end</code>, а не переносом рядка.",
    ],
    starter: raw`# 1. Один print із sep="-": Go-Rust-Python
print("Go", "Rust", "Python")

# 2. Два print в один рядок: Завантаження... готово
print("Завантаження")
print("готово")
`,
    checks: [
      { on: "stdout", name: "Перший рядок: Go-Rust-Python", has: "Go-Rust-Python\n" },
      { on: "stdout", name: "Другий рядок: Завантаження... готово", has: "Завантаження... готово" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Go-Rust-Python\nЗавантаження... готово" },
      { on: "source", name: "Використано sep=", has: "sep=" },
      { on: "source", name: "Використано end=", has: "end=" },
    ],
  },
  {
    ...base, id: "python-order-total", lesson: "python/3", xp: 20,
    title: "Сума замовлення і типи даних",
    context: "Ціна дробова, кількість ціла. Гроші треба показувати з двома знаками після коми, а не як 599.9699999999999. Для цього є форматування f-рядків.",
    brief: [
      "Виведіть <code>Разом: 599.97</code>: два знаки після коми через f-рядок із форматом <code>:.2f</code>.",
      "Наступним рядком виведіть назви типів <code>price</code> і <code>qty</code> через пробіл: <code>float int</code> (підійде <code>type(x).__name__</code>).",
    ],
    starter: raw`price = 199.99
qty = 3
total = price * qty

# TODO: виведіть Разом: 599.97 (f-рядок з :.2f), а потім типи price і qty
print("Разом:", total)
`,
    checks: [
      { on: "stdout", name: "Рядок «Разом: 599.97»", has: "Разом: 599.97" },
      { on: "stdout", name: "Типи: float int", has: "float int" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Разом: 599.97\nfloat int" },
      { on: "source", name: "Використано f-рядок із форматом .2f", matches: "f[\"'][^\"']*\\{[^}]*:\\.2f\\}" },
    ],
  },
  {
    ...base, id: "python-grade", lesson: "python/4", xp: 20,
    title: "Оцінка за балами: if / elif / else",
    context: "Розгалуження вирішує, що робити далі: показати помилку чи результат, дати знижку чи ні. Ланцюжок elif замінює купу вкладених if.",
    brief: [
      "Допишіть функцію <code>grade(score)</code>: від 90 балів <code>відмінно</code>, від 75 <code>добре</code>, від 60 <code>задовільно</code>, інакше <code>незадовільно</code>.",
      "Використайте ланцюжок <code>if / elif / else</code>. Функція викликається для чотирьох результатів у <code>main</code>.",
    ],
    starter: raw`def grade(score):
    # TODO: поверніть "відмінно", "добре", "задовільно" або "незадовільно"
    return "?"


for s in [95, 80, 61, 30]:
    print(s, grade(s))
`,
    checks: [
      { on: "stdout", name: "95 балів: відмінно", has: "95 відмінно" },
      { on: "stdout", name: "80 балів: добре", has: "80 добре" },
      { on: "stdout", name: "61 бал: задовільно", has: "61 задовільно" },
      { on: "stdout", name: "30 балів: незадовільно", has: "30 незадовільно" },
      { on: "source", name: "Використано elif", matches: "\\belif\\b" },
    ],
  },
  {
    ...base, id: "python-fizzbuzz", lesson: "python/5", xp: 25,
    title: "FizzBuzz і цикл while",
    context: "Цикли обробляють списки замовлень, рядки файлу, сторінки відповіді API. FizzBuzz класична розминка: перевірка кратності в циклі for. А while потрібен, коли невідомо наперед, скільки кроків знадобиться.",
    brief: [
      "У циклі <code>for</code> для чисел від 1 до 15 виведіть число; але якщо воно ділиться на 3, виведіть <code>Fizz</code>, на 5, виведіть <code>Buzz</code>, на обидва, виведіть <code>FizzBuzz</code>.",
      "Потім циклом <code>while</code> порахуйте, скільки разів треба поділити 100 навпіл, щоб число стало менше 1. Виведіть <code>Кроків: 7</code>.",
    ],
    starter: raw`# 1. FizzBuzz для чисел від 1 до 15
for i in range(1, 16):
    print(i)

# 2. Скільки разів поділити 100 навпіл, щоб стало менше 1
n = 100
steps = 0
# TODO: цикл while
print("Кроків:", steps)
`,
    checks: [
      { on: "stdout", name: "Fizz на кратних 3, Buzz на кратних 5", has: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n" },
      { on: "stdout", name: "Кроків: 7", has: "Кроків: 7" },
      { on: "source", name: "Використано цикл while", matches: "\\bwhile\\b" },
      { on: "source", name: "Кратність перевіряється через %", has: "%" },
    ],
  },
  {
    ...base, id: "python-slugify", lesson: "python/6", xp: 25,
    title: "Slug для адреси сторінки і паліндром",
    context: "Із заголовка статті роблять адресу: «Hello World» стає hello-world. Це типова робота з рядками: прибрати зайві пробіли, привести до нижнього регістру, склеїти частини.",
    brief: [
      "Допишіть <code>slugify(title)</code>: прибрати пробіли на початку й у кінці, зробити малі літери, а слова (розділені будь-якою кількістю пробілів) з'єднати дефісом. Підказка: <code>split()</code> і <code>\"-\".join(...)</code>.",
      "Допишіть <code>is_palindrome(text)</code>: <code>True</code>, якщо текст однаково читається в обидва боки (регістр і пробіли не враховуються).",
    ],
    starter: raw`def slugify(title):
    # TODO
    return title


def is_palindrome(text):
    # TODO
    return False


print(slugify("  Hello   World From Python "))
print(is_palindrome("А роза упала на лапу Азора"))
print(is_palindrome("Python"))
`,
    checks: [
      { on: "stdout", name: "slugify: hello-world-from-python", has: "hello-world-from-python" },
      { on: "stdout", name: "Паліндром розпізнається (True)", has: "hello-world-from-python\nTrue" },
      { on: "stdout", name: "Не паліндром розпізнається (False)", has: "True\nFalse" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "hello-world-from-python\nTrue\nFalse" },
    ],
  },
  {
    ...base, id: "python-top3-unique", lesson: "python/7", xp: 25,
    title: "Унікальні значення і топ-3 зі списку",
    context: "Із списку потрібно прибрати дублікати зі збереженням порядку, а потім вибрати найкращі значення: топ-3 товарів, найвищі оцінки, найбільші суми.",
    brief: [
      "Допишіть <code>unique(nums)</code>: новий список без повторів, порядок першої появи зберігається.",
      "Допишіть <code>top3(nums)</code>: три найбільших значення за спаданням (підійде <code>sorted(..., reverse=True)</code> і зріз).",
    ],
    starter: raw`def unique(nums):
    # TODO: без повторів, у тому ж порядку
    return nums


def top3(nums):
    # TODO: три найбільших за спаданням
    return nums


data = [5, 3, 9, 3, 7, 9, 1, 5]
u = unique(data)
print(u)
print(top3(u))
`,
    checks: [
      { on: "stdout", name: "Унікальні в порядку появи: [5, 3, 9, 7, 1]", has: "[5, 3, 9, 7, 1]" },
      { on: "stdout", name: "Топ-3: [9, 7, 5]", has: "[9, 7, 5]" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[5, 3, 9, 7, 1]\n[9, 7, 5]" },
      { on: "source", name: "Використано сортування", matches: "sort" },
    ],
  },
  {
    ...base, id: "python-sets-tuples", lesson: "python/8", xp: 25,
    title: "Кортеж min/max і спільні елементи множин",
    context: "Кортежі повертають кілька значень із функції, а множини миттєво відповідають на питання «що спільного» і «що нового». Так порівнюють списки клієнтів, теги, права доступу.",
    brief: [
      "Допишіть <code>min_max(nums)</code>: поверніть кортеж <code>(найменше, найбільше)</code>.",
      "Допишіть <code>common(a, b)</code>: відсортований список елементів, що є в обох списках (використайте <code>set</code>).",
    ],
    starter: raw`def min_max(nums):
    # TODO: поверніть кортеж (мінімум, максимум)
    return (0, 0)


def common(a, b):
    # TODO: відсортований список спільних елементів, через set
    return []


low, high = min_max([7, 2, 9, 4])
print("Мін:", low, "Макс:", high)
print("Спільні:", common([1, 2, 3, 4, 5], [4, 5, 6, 7]))
`,
    checks: [
      { on: "stdout", name: "Мінімум і максимум: 2 і 9", has: "Мін: 2 Макс: 9" },
      { on: "stdout", name: "Спільні елементи: [4, 5]", has: "Спільні: [4, 5]" },
      { on: "source", name: "Використано set", has: "set(" },
    ],
  },
  {
    ...base, id: "python-word-freq", lesson: "python/9", xp: 30,
    title: "Частота слів у словнику",
    context: "Підрахунок «скільки разів зустрівся ключ» це найчастіше застосування словника: частота слів, кількість замовлень на клієнта, голоси за варіант.",
    brief: [
      "Допишіть <code>word_count(text)</code>: поверніть словник, де ключ це слово, а значення це кількість його появ (слова розділені пробілами). Підказка: <code>counts.get(word, 0) + 1</code>.",
      "Вивід (сортування за спаданням кількості, потім за алфавітом) уже написаний у <code>main</code>.",
    ],
    starter: raw`def word_count(text):
    # TODO: {слово: скільки разів зустрілось}
    return {}


counts = word_count("to be or not to be that is the question to")
for word, n in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
    print(word, n)
`,
    checks: [
      { on: "stdout", name: "Слово to зустрічається тричі", has: "to 3\n" },
      { on: "stdout", name: "Слово be зустрічається двічі", has: "be 2\n" },
      { on: "stdout", name: "Підрахунок усіх слів правильний", equals: "to 3\nbe 2\nis 1\nnot 1\nor 1\nquestion 1\nthat 1\nthe 1" },
    ],
  },
  {
    ...base, id: "python-functions", lesson: "python/10", xp: 30,
    title: "Знижка за замовчуванням і *args",
    context: "Параметри за замовчуванням роблять функцію зручною (знижка 10 %, якщо не вказано інше), а *args дозволяє прийняти будь-яку кількість значень.",
    brief: [
      "Допишіть <code>apply_discount(price, percent=10)</code>: повертає ціну після знижки, округлену до 2 знаків (<code>round</code>).",
      "Допишіть <code>summary(*nums)</code>: повертає кортеж <code>(кількість, сума, середнє)</code>, середнє округліть до 2 знаків.",
    ],
    starter: raw`def apply_discount(price, percent=10):
    # TODO: ціна після знижки, round(..., 2)
    return price


def summary(*nums):
    # TODO: (кількість, сума, середнє)
    return ()


print(apply_discount(200))
print(apply_discount(200, 25))
print(summary(4, 8, 15))
`,
    checks: [
      { on: "stdout", name: "Знижка за замовчуванням 10 %: 180.0", has: "180.0" },
      { on: "stdout", name: "Знижка 25 %: 150.0", has: "150.0" },
      { on: "stdout", name: "Підсумок: (3, 27, 9.0)", has: "(3, 27, 9.0)" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "180.0\n150.0\n(3, 27, 9.0)" },
      { on: "source", name: "Параметр за замовчуванням percent=10", matches: "percent\\s*=\\s*10" },
    ],
  },
  {
    ...base, id: "python-sort-key", lesson: "python/11", xp: 30,
    title: "Сортування товарів: key і lambda",
    context: "Сортування за полем або за кількома полями одразу це щоденна задача: каталог за ціною, замовлення за датою, рейтинг за балами й іменем.",
    brief: [
      "Допишіть <code>by_price(products)</code>: назви товарів за зростанням ціни.",
      "Допишіть <code>by_qty_then_name(products)</code>: спочатку за кількістю (більше йде першим), а за однакової кількості за назвою. Використайте <code>sorted(..., key=lambda ...)</code>; для спадання числа підійде мінус перед значенням.",
    ],
    starter: raw`products = [
    {"name": "Хліб", "price": 25, "qty": 10},
    {"name": "Молоко", "price": 42, "qty": 3},
    {"name": "Сир", "price": 180, "qty": 3},
    {"name": "Яйця", "price": 60, "qty": 10},
]


def by_price(items):
    # TODO: назви за зростанням ціни
    return []


def by_qty_then_name(items):
    # TODO: за спаданням кількості, потім за назвою
    return []


print(by_price(products))
print(by_qty_then_name(products))
`,
    checks: [
      { on: "stdout", name: "За ціною: Хліб, Молоко, Яйця, Сир", has: "['Хліб', 'Молоко', 'Яйця', 'Сир']" },
      { on: "stdout", name: "За кількістю й назвою: Хліб, Яйця, Молоко, Сир", has: "['Хліб', 'Яйця', 'Молоко', 'Сир']" },
      { on: "source", name: "Використано lambda", has: "lambda" },
    ],
  },
  {
    ...base, id: "python-comprehensions", lesson: "python/12", xp: 30,
    title: "Генератори списків, zip і enumerate",
    context: "Генератор списку замінює цикл із append одним виразом. А zip і enumerate прибирають із коду лічильники індексів: пари імен і балів, нумеровані списки.",
    brief: [
      "Допишіть <code>squares_of_evens(nums)</code>: квадрати лише парних чисел, одним генератором списку.",
      "Допишіть <code>scores(names, points)</code>: словник «ім'я: бал» через <code>zip</code>, і <code>numbered(names)</code>: список рядків виду <code>1. Оля</code> через <code>enumerate</code> (нумерація з 1).",
    ],
    starter: raw`def squares_of_evens(nums):
    # TODO: генератор списку з умовою
    return []


def scores(names, points):
    # TODO: {ім'я: бал} через zip
    return {}


def numbered(names):
    # TODO: ["1. Оля", ...] через enumerate
    return []


print(squares_of_evens([1, 2, 3, 4, 5, 6]))
print(scores(["Оля", "Іван"], [90, 75]))
print(numbered(["Оля", "Іван"]))
`,
    checks: [
      { on: "stdout", name: "Квадрати парних: [4, 16, 36]", has: "[4, 16, 36]" },
      { on: "stdout", name: "Словник: {'Оля': 90, 'Іван': 75}", has: "{'Оля': 90, 'Іван': 75}" },
      { on: "stdout", name: "Нумерований список", has: "['1. Оля', '2. Іван']" },
      { on: "source", name: "Є генератор списку", matches: "\\[[^\\]\\n]*\\bfor\\b[^\\]\\n]*\\]" },
      { on: "source", name: "Використано zip і enumerate", matches: "zip\\([\\s\\S]*enumerate\\(|enumerate\\([\\s\\S]*zip\\(" },
    ],
  },
  {
    ...base, id: "python-files-stringio", lesson: "python/13", xp: 35,
    title: "Запис і читання рядків, як у файлі",
    context: "Файл записують і читають одними й тими самими методами, що б у ньому не лежало: логи, експорт, налаштування. У пісочниці немає диска, тому тренуємось на io.StringIO: це об'єкт-«файл» у пам'яті з тим самим API, що й open().",
    brief: [
      "Допишіть <code>save_lines(f, lines)</code>: запишіть кожен рядок у «файл» <code>f</code>, закінчуючи його символом переносу <code>\\n</code>.",
      "Допишіть <code>load_lines(f)</code>: прочитайте весь вміст і поверніть список рядків без символів переносу (<code>read().splitlines()</code>).",
    ],
    starter: raw`import io


def save_lines(f, lines):
    # TODO: f.write(рядок + "\n") для кожного рядка
    pass


def load_lines(f):
    # TODO: поверніть список рядків без \n
    return []


buf = io.StringIO()          # працює як файл, відкритий через open()
save_lines(buf, ["перший", "другий", "третій"])
buf.seek(0)                  # повертаємось на початок перед читанням
lines = load_lines(buf)
print(lines)
print("Рядків:", len(lines))
`,
    checks: [
      { on: "stdout", name: "Прочитано три рядки", has: "['перший', 'другий', 'третій']" },
      { on: "stdout", name: "Рядків: 3", has: "Рядків: 3" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "['перший', 'другий', 'третій']\nРядків: 3" },
      { on: "source", name: "Рядки записуються через write", matches: "\\.write\\(" },
    ],
  },
  {
    ...base, id: "python-exceptions", lesson: "python/14", xp: 35,
    title: "Власна помилка і безпечне ділення",
    context: "Помилки неминучі: ділення на нуль, некоректні дані, відсутні ключі. Задача програми обробити їх так, щоб користувач побачив зрозуміле повідомлення, а не traceback.",
    brief: [
      "Допишіть <code>safe_div(a, b)</code>: повертає <code>a / b</code>, а при діленні на нуль перехоплює <code>ZeroDivisionError</code> і повертає <code>None</code>.",
      "Опишіть клас винятку <code>NegativeAgeError(ValueError)</code> і функцію <code>check_age(age)</code>: для віку менше 0 вона викликає <code>raise NegativeAgeError(\"вік не може бути від'ємним\")</code>.",
      "У <code>main</code> блок <code>finally</code> виводить «Перевірку завершено» за будь-якого результату.",
    ],
    starter: raw`def safe_div(a, b):
    # TODO: try / except ZeroDivisionError
    return a / b


# TODO: клас NegativeAgeError(ValueError)


def check_age(age):
    # TODO: для age < 0 викличте NegativeAgeError("вік не може бути від'ємним")
    return age


print(safe_div(10, 2))
print(safe_div(1, 0))
try:
    check_age(-5)
except NegativeAgeError as e:
    print("Помилка:", e)
finally:
    print("Перевірку завершено")
`,
    checks: [
      { on: "stdout", name: "Звичайне ділення: 5.0", has: "5.0\n" },
      { on: "stdout", name: "Ділення на нуль повертає None", has: "5.0\nNone" },
      { on: "stdout", name: "Власна помилка перехоплена з повідомленням", has: "Помилка: вік не може бути від'ємним" },
      { on: "stdout", name: "finally спрацював", has: "Перевірку завершено" },
      { on: "source", name: "Використано try / except", matches: "\\btry:[\\s\\S]*\\bexcept\\b" },
    ],
  },
  {
    ...base, id: "python-stdlib-modules", lesson: "python/15", xp: 30,
    title: "Стандартна бібліотека: math, statistics, Counter",
    context: "Половина роботи програміста це знати, що вже є в мові. Модулі стандартної бібліотеки не треба встановлювати через pip: вони йдуть разом із Python. (pip і venv потрібні для сторонніх пакетів, у пісочниці їх немає.)",
    brief: [
      "Підключені <code>math</code>, <code>statistics</code> і <code>Counter</code>. Виведіть три рядки: <code>Корінь: 12.0</code> (<code>math.sqrt(144)</code>), <code>Середнє: 5</code> (<code>statistics.mean</code> списку <code>[2, 4, 4, 4, 5, 5, 7, 9]</code>), <code>Найчастіше: a</code> (найчастіша літера слова <code>abracadabra</code> через <code>Counter(...).most_common(1)</code>).",
    ],
    starter: raw`import math
import statistics
from collections import Counter

# TODO: виведіть три рядки: Корінь: 12.0 / Середнє: 5 / Найчастіше: a
`,
    checks: [
      { on: "stdout", name: "Корінь: 12.0", has: "Корінь: 12.0" },
      { on: "stdout", name: "Середнє: 5", has: "Середнє: 5\n" },
      { on: "stdout", name: "Найчастіше: a", has: "Найчастіше: a" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Корінь: 12.0\nСереднє: 5\nНайчастіше: a" },
      { on: "source", name: "Використано Counter", has: "Counter(" },
    ],
  },
  {
    ...base, id: "python-json-csv", lesson: "python/16", xp: 35,
    title: "Розбір JSON і CSV",
    context: "JSON приходить із API, CSV зі звітів і таблиць. Прочитати, порахувати, відправити далі: типовий шматок будь-якого інтеграційного скрипта.",
    brief: [
      "Допишіть <code>orders_total(text)</code>: розберіть JSON-рядок (<code>json.loads</code>) зі списком замовлень і поверніть суму <code>price * qty</code>.",
      "Допишіть <code>read_csv(text)</code>: розберіть CSV-рядок у список словників (<code>csv.DictReader</code> над <code>io.StringIO(text)</code>).",
      "Допишіть <code>to_json(obj)</code>: JSON-рядок зі збереженням кирилиці (<code>ensure_ascii=False</code>).",
    ],
    starter: raw`import csv
import io
import json


def orders_total(text):
    # TODO: json.loads, потім сума price * qty
    return 0


def read_csv(text):
    # TODO: список словників через csv.DictReader
    return []


def to_json(obj):
    # TODO: json.dumps з ensure_ascii=False
    return ""


orders = '[{"item": "Хліб", "price": 25, "qty": 2}, {"item": "Сир", "price": 180, "qty": 1}]'
print(orders_total(orders))

rows = read_csv("name,age\nОля,25\nІван,30\n")
print([r["name"] for r in rows])
print(to_json(rows[0]))
`,
    checks: [
      { on: "stdout", name: "Сума замовлень: 230", has: "230" },
      { on: "stdout", name: "Імена з CSV: ['Оля', 'Іван']", has: "['Оля', 'Іван']" },
      { on: "stdout", name: "JSON із кирилицею", has: '{"name": "Оля", "age": "25"}' },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "230\n['Оля', 'Іван']\n{\"name\": \"Оля\", \"age\": \"25\"}" },
    ],
  },
  {
    ...base, id: "python-account-class", lesson: "python/17", xp: 40,
    title: "Клас банківського рахунку",
    context: "Клас об'єднує дані й поведінку: рахунок знає свій баланс і сам стежить, щоб не пішов у мінус. Так проєктують користувачів, кошики, замовлення.",
    brief: [
      "Опишіть клас <code>Account</code>: конструктор <code>__init__(self, owner, balance=0)</code>, методи <code>deposit(amount)</code> і <code>withdraw(amount)</code>.",
      "Якщо коштів не вистачає, <code>withdraw</code> викликає <code>ValueError(\"Недостатньо коштів\")</code>. Метод <code>__str__</code> повертає рядок виду <code>Оля: 150 грн</code>.",
    ],
    starter: raw`# TODO: клас Account з __init__, deposit, withdraw і __str__


acc = Account("Оля", 100)
acc.deposit(50)
print(acc)
try:
    acc.withdraw(500)
except ValueError as e:
    print("Помилка:", e)
acc.withdraw(30)
print(acc.balance)
`,
    checks: [
      { on: "stdout", name: "Рахунок виводиться через __str__", has: "Оля: 150 грн" },
      { on: "stdout", name: "Недостатньо коштів: помилка ValueError", has: "Помилка: Недостатньо коштів" },
      { on: "stdout", name: "Після зняття 30 залишається 120", has: "120" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Оля: 150 грн\nПомилка: Недостатньо коштів\n120" },
      { on: "source", name: "Описано клас Account", matches: "class\\s+Account\\b" },
    ],
  },
  {
    ...base, id: "python-shapes-property", lesson: "python/18", xp: 40,
    title: "Фігури з наслідуванням і властивість property",
    context: "Наслідування прибирає дублювання: спільне лежить у базовому класі, а відмінності в нащадках. property дає розраховуване поле, яке виглядає як звичайний атрибут.",
    brief: [
      "Класи <code>Circle(Shape)</code> і <code>Rectangle(Shape)</code> мають метод <code>area()</code>: коло <code>round(math.pi * r ** 2, 2)</code>, прямокутник <code>w * h</code>. Базовий <code>Shape.describe()</code> уже виводить опис через <code>area()</code> та <code>name</code>.",
      "У класі <code>Temperature</code> додайте властивість <code>fahrenheit</code> (декоратор <code>@property</code>): <code>celsius * 9 / 5 + 32</code>.",
    ],
    starter: raw`import math


class Shape:
    name = "Фігура"

    def area(self):
        raise NotImplementedError

    def describe(self):
        return f"{self.name}: {self.area()}"


# TODO: class Circle(Shape) з name = "Коло", __init__(self, r) і area()
# TODO: class Rectangle(Shape) з name = "Прямокутник", __init__(self, w, h) і area()


class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    # TODO: властивість fahrenheit через @property


for shape in [Circle(2), Rectangle(3, 4)]:
    print(shape.describe())
print(Temperature(100).fahrenheit)
`,
    checks: [
      { on: "stdout", name: "Коло: 12.57", has: "Коло: 12.57" },
      { on: "stdout", name: "Прямокутник: 12", has: "Прямокутник: 12" },
      { on: "stdout", name: "100 °C це 212.0 °F", has: "212.0" },
      { on: "source", name: "Нащадки успадковують Shape", matches: "class\\s+Circle\\s*\\(\\s*Shape\\s*\\)[\\s\\S]*class\\s+Rectangle\\s*\\(\\s*Shape\\s*\\)" },
      { on: "source", name: "Використано @property", has: "@property" },
    ],
  },
  {
    ...base, id: "python-api-response", lesson: "python/19", xp: 40,
    title: "Обробка відповіді API за статус-кодом",
    context: "Запит до API закінчується відповіддю, і першим ділом дивляться на статус-код: 200 дані, 404 немає, 500 помилка сервера. У пісочниці немає мережі й бібліотеки requests, тому відповідь імітує клас Response з тими самими status_code і json().",
    brief: [
      "Допишіть <code>get_username(resp)</code>: для статусу 200 поверніть <code>resp.json()[\"user\"][\"name\"]</code>, для 404 рядок <code>не знайдено</code>, для будь-якого іншого статусу викличте <code>RuntimeError(f\"Помилка сервера: {resp.status_code}\")</code>.",
    ],
    starter: raw`import json


class Response:
    """Імітація відповіді бібліотеки requests: status_code і json()"""

    def __init__(self, status_code, body=""):
        self.status_code = status_code
        self._body = body

    def json(self):
        return json.loads(self._body)


def get_username(resp):
    # TODO: 200 -> ім'я, 404 -> "не знайдено", інше -> RuntimeError
    return None


for resp in [Response(200, '{"user": {"name": "Оля"}}'), Response(404), Response(500)]:
    try:
        print(get_username(resp))
    except RuntimeError as e:
        print(e)
`,
    checks: [
      { on: "stdout", name: "Статус 200: ім'я користувача", has: "Оля" },
      { on: "stdout", name: "Статус 404: «не знайдено»", has: "не знайдено" },
      { on: "stdout", name: "Статус 500: «Помилка сервера: 500»", has: "Помилка сервера: 500" },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Оля\nне знайдено\nПомилка сервера: 500" },
      { on: "source", name: "Перевіряється status_code", has: "status_code" },
    ],
  },
  {
    ...base, id: "python-mini-tests", lesson: "python/20", xp: 40,
    title: "Напишіть тести для slugify",
    context: "Тест фіксує очікувану поведінку функції: зламаєте її пізніше, і тест одразу скаже про це. У pytest тест це звичайна функція з assert. Тут pytest немає, тому запускач тестів (він збирає функції з test_ у назві) уже написаний.",
    brief: [
      "Функція <code>slugify</code> уже працює. Напишіть щонайменше <b>три</b> тести: функції <code>test_...()</code> із <code>assert</code> (наприклад, <code>assert slugify(\"Hello World\") == \"hello-world\"</code>).",
      "Перевірте різні випадки: звичайний, зайві пробіли, уже малі літери. Усі тести мають проходити: підсумок <code>Пройдено N з N</code>, де N не менше 3.",
    ],
    starter: raw`def slugify(title):
    return "-".join(title.lower().split())


# TODO: напишіть щонайменше три функції test_...() із assert


def run_tests():
    names = sorted(n for n in globals() if n.startswith("test_"))
    passed = 0
    for name in names:
        try:
            globals()[name]()
            print("PASSED", name)
            passed += 1
        except AssertionError:
            print("FAILED", name)
    print(f"Пройдено {passed} з {len(names)}")


run_tests()
`,
    checks: [
      { on: "stdout", name: "Написано щонайменше три тести", matches: "(?:^|\\n)Пройдено ([3-9]|[1-9]\\d+) з " },
      { on: "stdout", name: "Усі тести проходять", matches: "(?:^|\\n)Пройдено (\\d+) з \\1$" },
      { on: "stdout", name: "Жодного FAILED", has: "FAILED", not: true },
      { on: "source", name: "Тести використовують assert", matches: "def\\s+test_\\w+[\\s\\S]*\\bassert\\b" },
    ],
  },
];
