// Практичні завдання глави «Колекції» (уроки 19–30). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_03: readonly RemoteTask[] = [
  {
    ...base, id: "python-list-basics", lesson: "python/19", xp: 20,
    title: "Температури: індекси, зрізи й підсумки",
    context: "Список вимірювань — найпростіший набір даних. Дістати перший і останній елемент, взяти зріз, розвернути й порахувати розмах — це щоденна робота з будь-якою таблицею чи відповіддю API.",
    brief: [
      "Для списку <code>temps</code> виведіть: перший і останній елементи через пробіл, елементи з індексами 1–3 одним зрізом, список у зворотному порядку (оригінал не змінюйте).",
      "Потім виведіть різницю між найбільшою й найменшою температурою та кількість вимірювань.",
    ],
    starter: raw`temps = [18, 21, 19, 25, 23, 17, 20]

# TODO 1: перший і останній елементи через пробіл -> 18 20
# TODO 2: елементи з індексами 1, 2, 3 -> [21, 19, 25]
# TODO 3: список у зворотному порядку -> [20, 17, 23, 25, 19, 21, 18]
# TODO 4: різниця між найбільшою й найменшою температурою -> 8
# TODO 5: кількість вимірювань -> 7
`,
    checks: [
      { on: "stdout", name: "Перший і останній: 18 20", has: "18 20\n", hint: "Індекс 0 — перший елемент, індекс -1 — останній: print(temps[0], temps[-1])." },
      { on: "stdout", name: "Зріз [21, 19, 25]", has: "[21, 19, 25]", hint: "Зріз temps[1:4] бере індекси 1, 2 і 3 (кінець не входить)." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "18 20\n[21, 19, 25]\n[20, 17, 23, 25, 19, 21, 18]\n8\n7", hint: "Мають бути п'ять рядків у вказаному порядку." },
      { on: "source", name: "Розворот зрізом [::-1]", has: "[::-1]", hint: "Зріз temps[::-1] повертає новий список у зворотному порядку." },
      { on: "source", name: "Розмах через max і min", matches: "max\\([\\s\\S]*min\\(|min\\([\\s\\S]*max\\(", hint: "Розмах — це max(temps) - min(temps)." },
    ],
  },
  {
    ...base, id: "python-top3-unique", lesson: "python/20", xp: 25,
    title: "Унікальні значення і топ-3 зі списку",
    context: "Зі списку потрібно прибрати дублікати зі збереженням порядку, а потім вибрати найкращі значення: топ-3 товарів, найвищі оцінки, найбільші суми.",
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
      { on: "stdout", name: "Унікальні в порядку появи: [5, 3, 9, 7, 1]", has: "[5, 3, 9, 7, 1]", hint: "Додавайте елемент у результат лише тоді, коли його там ще немає." },
      { on: "stdout", name: "Топ-3: [9, 7, 5]", has: "[9, 7, 5]", hint: "sorted(nums, reverse=True)[:3] дає три найбільших за спаданням." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[5, 3, 9, 7, 1]\n[9, 7, 5]", hint: "Перевірте обидва рядки виводу." },
      { on: "source", name: "Використано сортування", matches: "sort", hint: "Для топ-3 відсортуйте значення за спаданням." },
    ],
  },
  {
    ...base, id: "python-copy-traps", lesson: "python/21", xp: 25,
    title: "Виправлення пасток копіювання",
    context: "Помилки з посиланнями на списки — одні з найпідступніших: дані змінюються десь в іншому місці програми. Уміння знайти спільний об'єкт і створити незалежну копію економить години налагодження.",
    brief: [
      "Зробіть <code>backup</code> справжньою копією <code>base</code>, щоб після <code>base.append(4)</code> резервна копія лишилася <code>[1, 2, 3]</code>.",
      "Побудуйте <code>grid</code> із двох незалежних рядків по три нулі (у циклі), щоб зміна <code>grid[0][0]</code> не торкалася другого рядка.",
    ],
    starter: raw`base = [1, 2, 3]
backup = base          # TODO: зробіть справжню копію
base.append(4)
print(backup)          # має лишитися [1, 2, 3]

grid = [[0] * 3] * 2   # TODO: два незалежні рядки, побудуйте їх у циклі
grid[0][0] = 1
print(grid)            # має бути [[1, 0, 0], [0, 0, 0]]
`,
    checks: [
      { on: "stdout", name: "Копія не змінилася: [1, 2, 3]", has: "[1, 2, 3]\n", hint: "Скористайтеся base.copy() (з дужками) або зрізом base[:]." },
      { on: "stdout", name: "Рядки сітки незалежні", has: "[[1, 0, 0], [0, 0, 0]]", hint: "Створюйте рядок [0] * 3 заново на кожному кроці циклу й додавайте його через append." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[1, 2, 3]\n[[1, 0, 0], [0, 0, 0]]", hint: "Мають бути рівно два рядки." },
      { on: "source", name: "Створено справжню копію", matches: "\\.copy\\(\\)|\\[:\\]|list\\(base\\)|deepcopy", hint: "Присвоєння backup = base копії не створює." },
      { on: "source", name: "Сітку не побудовано множенням списку списків", matches: "\\[\\[0\\]\\s*\\*\\s*3\\]\\s*\\*\\s*2", not: true, hint: "Запис [[0] * 3] * 2 повторює посилання на один і той самий рядок." },
    ],
  },
  {
    ...base, id: "python-tuple-unpack", lesson: "python/22", xp: 20,
    title: "Розпакування кортежів і списків",
    context: "Розпакування замінює індекси на промовисті імена: x, y замість point[0], point[1]. Саме так читаються цикли з enumerate, повернення кількох значень і обмін змінних.",
    brief: [
      "Розпакуйте <code>point</code> у <code>x</code> і <code>y</code> та виведіть відстань до початку координат <code>(x ** 2 + y ** 2) ** 0.5</code>.",
      "Розпакуйте <code>data</code> як <code>first, *middle, last</code> і виведіть їх; потім поміняйте <code>a</code> і <code>b</code> місцями без третьої змінної й виведіть пару.",
    ],
    starter: raw`point = (3, 4)
data = [10, 20, 30, 40, 50]
a, b = "left", "right"

# TODO 1: розпакуйте point в x, y; виведіть відстань до початку координат -> 5.0
# TODO 2: розпакуйте data як first, *middle, last; виведіть їх -> 10 [20, 30, 40] 50
# TODO 3: поміняйте a і b місцями; виведіть a b -> right left
`,
    checks: [
      { on: "stdout", name: "Відстань 5.0", has: "5.0\n", hint: "Після x, y = point порахуйте (x ** 2 + y ** 2) ** 0.5." },
      { on: "stdout", name: "Розпакування із зірочкою", has: "10 [20, 30, 40] 50", hint: "first, *middle, last = data: зірочка збирає решту у список." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "5.0\n10 [20, 30, 40] 50\nright left", hint: "Мають бути три рядки." },
      { on: "source", name: "Є розпакування із зірочкою", matches: "\\*middle", hint: "Змінна із зірочкою має називатися middle." },
      { on: "source", name: "Обмін без третьої змінної", matches: "a\\s*,\\s*b\\s*=\\s*b\\s*,\\s*a", hint: "Обмін в один рядок: a, b = b, a." },
    ],
  },
  {
    ...base, id: "python-matrix-sums", lesson: "python/23", xp: 30,
    title: "Суми рядків, стовпців і діагоналі матриці",
    context: "Таблиці, ігрові поля й зображення — це матриці. Суми по рядках і стовпцях, діагоналі й транспонування — набір типових задач, на яких перевіряють роботу з вкладеними списками.",
    brief: [
      "Порахуйте суми рядків у списку <code>row_sums</code>, суми стовпців у <code>col_sums</code> (через <code>zip(*m)</code>) і суму головної діагоналі; виведіть їх.",
      "Останнім рядком виведіть транспоновану матрицю як список кортежів: <code>list(zip(*m))</code>.",
    ],
    starter: raw`m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# TODO 1: суми рядків -> [6, 15, 24]
# TODO 2: суми стовпців через zip(*m) -> [12, 15, 18]
# TODO 3: сума головної діагоналі -> 15
# TODO 4: транспонована матриця -> [(1, 4, 7), (2, 5, 8), (3, 6, 9)]
`,
    checks: [
      { on: "stdout", name: "Суми рядків: [6, 15, 24]", has: "[6, 15, 24]", hint: "Для кожного рядка додайте sum(row) у список через append." },
      { on: "stdout", name: "Суми стовпців: [12, 15, 18]", has: "[12, 15, 18]", hint: "zip(*m) повертає стовпці: у циклі for col in zip(*m) додавайте sum(col)." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[6, 15, 24]\n[12, 15, 18]\n15\n[(1, 4, 7), (2, 5, 8), (3, 6, 9)]", hint: "Діагональ — це m[0][0] + m[1][1] + m[2][2]; транспонування виводить list(zip(*m))." },
      { on: "source", name: "Використано zip(*m)", matches: "zip\\(\\s*\\*", hint: "Зірочка перед m розкриває матрицю на окремі рядки." },
    ],
  },
  {
    ...base, id: "python-word-freq", lesson: "python/24", xp: 30,
    title: "Частота слів у словнику",
    context: "Підрахунок «скільки разів зустрівся ключ» — найчастіше застосування словника: частота слів, кількість замовлень на клієнта, голоси за варіант.",
    brief: [
      "Допишіть <code>word_count(text)</code>: поверніть словник, де ключ — слово, а значення — кількість його появ (слова розділені пробілами). Підказка: <code>counts.get(word, 0) + 1</code>.",
      "Вивід (сортування за спаданням кількості, потім за алфавітом) уже написаний унизу файла.",
    ],
    starter: raw`def word_count(text):
    # TODO: {слово: скільки разів зустрілось}
    return {}


counts = word_count("to be or not to be that is the question to")
for word, n in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
    print(word, n)
`,
    checks: [
      { on: "stdout", name: "Слово to зустрічається тричі", has: "to 3\n", hint: "Розбийте текст через split() і для кожного слова збільшуйте лічильник у словнику." },
      { on: "stdout", name: "Слово be зустрічається двічі", has: "be 2\n", hint: "Для нового слова get(word, 0) поверне 0, тож додавайте 1." },
      { on: "stdout", name: "Підрахунок усіх слів правильний", equals: "to 3\nbe 2\nis 1\nnot 1\nor 1\nquestion 1\nthat 1\nthe 1", hint: "Функція має повернути словник за всіма словами тексту." },
    ],
  },
  {
    ...base, id: "python-sets-tuples", lesson: "python/25", xp: 25,
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
      { on: "stdout", name: "Мінімум і максимум: 2 і 9", has: "Мін: 2 Макс: 9", hint: "Поверніть min(nums), max(nums) через кому: це і є кортеж." },
      { on: "stdout", name: "Спільні елементи: [4, 5]", has: "Спільні: [4, 5]", hint: "Перетин множин: set(a) & set(b); результат відсортуйте через sorted()." },
      { on: "source", name: "Використано set", has: "set(", hint: "Перетворіть обидва списки на множини через set()." },
    ],
  },
  {
    ...base, id: "python-comprehensions", lesson: "python/26", xp: 30,
    title: "Генератори списків, zip і enumerate",
    context: "Генератор списку замінює цикл із append одним виразом, а zip і enumerate прибирають із коду лічильники індексів: пари імен і балів, нумеровані списки.",
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
      { on: "stdout", name: "Квадрати парних: [4, 16, 36]", has: "[4, 16, 36]", hint: "[x * x for x in nums if x % 2 == 0]." },
      { on: "stdout", name: "Словник: {'Оля': 90, 'Іван': 75}", has: "{'Оля': 90, 'Іван': 75}", hint: "dict(zip(names, points)) або генератор словника з zip." },
      { on: "stdout", name: "Нумерований список", has: "['1. Оля', '2. Іван']", hint: "enumerate(names, 1) починає нумерацію з одиниці." },
      { on: "source", name: "Є генератор списку", matches: "\\[[^\\]\\n]*\\bfor\\b[^\\]\\n]*\\]", hint: "Квадратні дужки, вираз, for і (за потреби) if в одному рядку." },
      { on: "source", name: "Використано zip і enumerate", matches: "zip\\([\\s\\S]*enumerate\\(|enumerate\\([\\s\\S]*zip\\(", hint: "Для пар імен і балів потрібен zip, для нумерації — enumerate." },
    ],
  },
  {
    ...base, id: "python-sort-key", lesson: "python/27", xp: 30,
    title: "Сортування товарів: key і lambda",
    context: "Сортування за полем або за кількома полями одразу — щоденна задача: каталог за ціною, замовлення за датою, рейтинг за балами й іменем.",
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
      { on: "stdout", name: "За ціною: Хліб, Молоко, Яйця, Сир", has: "['Хліб', 'Молоко', 'Яйця', 'Сир']", hint: "Відсортуйте словники за p[\"price\"], а потім візьміть назви." },
      { on: "stdout", name: "За кількістю й назвою: Хліб, Яйця, Молоко, Сир", has: "['Хліб', 'Яйця', 'Молоко', 'Сир']", hint: "Ключ-кортеж: (-p[\"qty\"], p[\"name\"])." },
      { on: "source", name: "Використано lambda", has: "lambda", hint: "Ключ сортування задайте через lambda." },
    ],
  },
  {
    ...base, id: "python-collections-tools", lesson: "python/28", xp: 30,
    title: "Counter, defaultdict і deque",
    context: "Три колекції з модуля collections закривають найчастіші задачі: підрахунок, групування й «останні N елементів». Кожна з них економить цикл і кілька перевірок.",
    brief: [
      "Виведіть дві найчастіші літери рядка <code>text</code> через <code>Counter</code>, а потім згрупуйте <code>words</code> за першою літерою через <code>defaultdict(list)</code> і виведіть звичайний словник.",
      "Нарешті створіть <code>deque</code> з <code>maxlen=3</code>, додайте числа від 1 до 5 і виведіть його вміст списком.",
    ],
    starter: raw`from collections import Counter, defaultdict, deque

text = "abracadabra"
words = ["apple", "avocado", "banana", "blueberry", "cherry"]

# TODO 1: дві найчастіші літери text -> [('a', 5), ('b', 2)]
# TODO 2: групи слів за першою літерою (defaultdict(list)); виведіть dict(groups)
# TODO 3: deque(maxlen=3), додайте 1..5, виведіть list(...) -> [3, 4, 5]
`,
    checks: [
      { on: "stdout", name: "Найчастіші літери", has: "[('a', 5), ('b', 2)]", hint: "Counter(text).most_common(2) повертає список пар." },
      { on: "stdout", name: "Групи за першою літерою", has: "{'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}", hint: "groups[word[0]].append(word) працює без попередньої перевірки ключа." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[('a', 5), ('b', 2)]\n{'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}\n[3, 4, 5]", hint: "Мають бути рівно три рядки." },
      { on: "source", name: "Використано defaultdict(list)", has: "defaultdict(list)", hint: "Фабрика list створює порожній список для нового ключа." },
      { on: "source", name: "Використано maxlen", has: "maxlen", hint: "deque(maxlen=3) витісняє найстаріші елементи." },
    ],
  },
  {
    ...base, id: "python-itertools-basics", lesson: "python/29", xp: 30,
    title: "itertools: chain, combinations, product, islice",
    context: "Модуль itertools замінює вкладені цикли й ручну склейку списків короткими викликами. Він працює «ліниво», тож справляється навіть із нескінченними послідовностями.",
    brief: [
      "З'єднайте <code>[1, 2]</code> і <code>[3]</code> через <code>chain</code>, виведіть пари літер <code>\"abc\"</code> через <code>combinations</code> (через пробіл: <code>ab ac bc</code>).",
      "Виведіть кількість елементів <code>product([0, 1], repeat=2)</code> і перші п'ять парних чисел із нескінченного <code>count(0, 2)</code> через <code>islice</code>.",
    ],
    starter: raw`from itertools import chain, combinations, product, islice, count

# TODO 1: з'єднайте [1, 2] і [3] через chain; виведіть список -> [1, 2, 3]
# TODO 2: пари літер "abc" через combinations(..., 2), через пробіл -> ab ac bc
# TODO 3: кількість елементів product([0, 1], repeat=2) -> 4
# TODO 4: перші п'ять парних із count(0, 2) через islice -> [0, 2, 4, 6, 8]
`,
    checks: [
      { on: "stdout", name: "chain: [1, 2, 3]", has: "[1, 2, 3]\n", hint: "list(chain([1, 2], [3]))." },
      { on: "stdout", name: "Пари літер: ab ac bc", has: "ab ac bc", hint: "Склейте кожну пару через \"\".join(pair), а пари з'єднайте пробілом." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[1, 2, 3]\nab ac bc\n4\n[0, 2, 4, 6, 8]", hint: "Мають бути чотири рядки." },
      { on: "source", name: "Використано islice", has: "islice(", hint: "islice(count(0, 2), 5) бере перші п'ять значень." },
    ],
  },
  {
    ...base, id: "python-word-report", lesson: "python/30", xp: 35,
    title: "Топ слів тексту без службових слів",
    context: "Частотний аналіз лежить в основі пошуку, аналізу відгуків і звітів «топ-N». Нормалізація, підрахунок, сортування й фільтр стоп-слів складаються в готовий конвеєр.",
    brief: [
      "Допишіть <code>normalize(text)</code>: прибрати розділові знаки <code>. , ! ? ; :</code> і привести текст до малих літер.",
      "Допишіть <code>top_words(text, stop_words, n)</code>: порахувати слова без стоп-слів, відсортувати за <code>(-кількість, слово)</code> і повернути перші <code>n</code> пар.",
    ],
    starter: raw`text = "Python is great. Python is simple, and Python is popular! Simple is better than complex."
stop_words = {"is", "and", "than"}


def normalize(text):
    # TODO: прибрати . , ! ? ; : і привести до малих літер
    return text


def top_words(text, stop_words, n):
    # TODO: порахувати слова без стоп-слів, відсортувати, повернути перші n пар
    return []


for word, count in top_words(text, stop_words, 3):
    print(f"{word}: {count}")
`,
    checks: [
      { on: "stdout", name: "Найчастіше слово: python: 3", has: "python: 3", hint: "Спершу normalize, потім split(), підрахунок і відсів слів зі stop_words." },
      { on: "stdout", name: "Другий результат: simple: 2", has: "simple: 2", hint: "Слово Simple із великої літери має злитися з simple після normalize." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "python: 3\nsimple: 2\nbetter: 1", hint: "За однакової кількості слова йдуть за алфавітом: ключ сортування (-кількість, слово)." },
      { on: "source", name: "Стоп-слова перевіряються через in", matches: "\\bin\\s+stop_words|not\\s+in\\s+stop_words", hint: "Перевірка w in stop_words працює швидко завдяки множині." },
      { on: "source", name: "Сортування за ключем", matches: "sorted\\([\\s\\S]*key\\s*=", hint: "Скористайтеся sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))." },
    ],
  },
];
