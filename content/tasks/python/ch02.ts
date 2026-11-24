// Практичні завдання глави «Основи мови» (уроки 5–18). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_02: readonly RemoteTask[] = [
  {
    ...base, id: "python-order-total", lesson: "python/5", xp: 20,
    title: "Змінні замовлення: присвоєння й типи",
    context: "Кожне замовлення в магазині — це кілька змінних: назва, ціна, кількість, сума. Уміння завести їх, оновити суму й подивитися на типи значень — основа будь-якої обробки даних.",
    brief: [
      "Обчисліть <code>total</code> як ціну, помножену на кількість, а потім збільште його на 20 (доставка) оператором <code>+=</code>.",
      "Виведіть рядок <code>Зошит: 220</code>, а наступним рядком назви типів <code>item</code> і <code>total</code> через пробіл: <code>str int</code> (підійде <code>type(x).__name__</code>).",
    ],
    starter: raw`item = "Зошит"
price = 40
qty = 5

# TODO 1: обчисліть total = price * qty
# TODO 2: збільште total на 20 (доставка) оператором +=
# TODO 3: виведіть  Зошит: 220  (назва, двокрапка, сума)
# TODO 4: виведіть типи item і total через пробіл: str int
`,
    checks: [
      { on: "stdout", name: "Рядок «Зошит: 220»", has: "Зошит: 220", hint: "Передайте в print назву з двокрапкою й суму: print(item + \":\", total)." },
      { on: "stdout", name: "Типи: str int", has: "str int", hint: "type(item).__name__ дає назву типу значення item." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Зошит: 220\nstr int", hint: "Мають бути рівно два рядки: спершу сума, потім типи." },
      { on: "source", name: "Доставка додана оператором +=", matches: "total\\s*\\+=\\s*20", hint: "Збільшити змінну на місці можна так: total += 20." },
    ],
  },
  {
    ...base, id: "python-numbers-money", lesson: "python/6", xp: 20,
    title: "Числа: divmod, Decimal і округлення",
    context: "Час, гроші й середні значення вимагають різних інструментів: divmod розкладає хвилини, Decimal рахує без похибки, round показує охайний результат. Помилка тут коштує реальних грошей.",
    brief: [
      "Розкладіть 135 хвилин на години й хвилини через <code>divmod</code> і виведіть <code>2 год 15 хв</code>.",
      "Виведіть суму <code>Decimal(\"0.1\") + Decimal(\"0.2\")</code>, а потім <code>10 / 3</code>, округлене до двох знаків.",
    ],
    starter: raw`from decimal import Decimal

minutes = 135

# TODO 1: розкладіть minutes через divmod і виведіть: 2 год 15 хв
# TODO 2: складіть Decimal("0.1") і Decimal("0.2") та виведіть результат: 0.3
# TODO 3: виведіть 10 / 3, округлене до 2 знаків: 3.33
`,
    checks: [
      { on: "stdout", name: "Години й хвилини: 2 год 15 хв", has: "2 год 15 хв", hint: "hours, rest = divmod(minutes, 60), а потім print(hours, \"год\", rest, \"хв\")." },
      { on: "stdout", name: "Decimal дає точне 0.3", has: "\n0.3\n", hint: "Рядки в Decimal передають текстом: Decimal(\"0.1\"). З float точності вже немає." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "2 год 15 хв\n0.3\n3.33", hint: "Три рядки: час, сума Decimal і round(10 / 3, 2)." },
      { on: "source", name: "Використано divmod", has: "divmod", hint: "Одна функція divmod повертає і частку, і остачу." },
      { on: "source", name: "Decimal створено з рядків", matches: "Decimal\\(\\s*[\"']0\\.1[\"']\\s*\\)", hint: "Пишіть Decimal(\"0.1\") у лапках, а не Decimal(0.1)." },
    ],
  },
  {
    ...base, id: "python-bool-none", lesson: "python/7", xp: 20,
    title: "Прапорці доступу, значення за замовчуванням і None",
    context: "Умови доступу, значення за замовчуванням і перевірки на відсутність даних складаються з bool, and, or та is None. Ці вирази потрібні в кожній формі, кожному API і кожній функції.",
    brief: [
      "Виведіть чотири рядки: чи є доступ за віком або VIP, чи є квиток і водночас не VIP, нік або слово <code>гість</code>, і чи <code>token</code> порожній.",
      "Порожність перевіряйте оператором <code>is None</code>, а не через <code>== None</code>.",
    ],
    starter: raw`age = 16
has_ticket = True
is_vip = False
nickname = ""
token = None

# TODO 1: вік від 18 АБО vip           -> False
# TODO 2: є квиток І не vip            -> True
# TODO 3: нік або слово "гість"        -> гість
# TODO 4: token порожній (is None)     -> True
`,
    checks: [
      { on: "stdout", name: "Перший вираз дає False", has: "False\n", hint: "Скористайтеся or: age >= 18 or is_vip." },
      { on: "stdout", name: "Нік за замовчуванням: гість", has: "гість", hint: "Вираз nickname or \"гість\" повертає другий операнд, якщо нік порожній." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "False\nTrue\nгість\nTrue", hint: "Очікується чотири рядки: False, True, гість, True." },
      { on: "source", name: "Використано or", matches: "\\bor\\b", hint: "Для «або» в Python є слово or." },
      { on: "source", name: "Перевірка через is None", has: "is None", hint: "Порівнюйте з None оператором is." },
      { on: "source", name: "Немає == None", matches: "==\\s*None", not: true, hint: "Замініть == None на is None." },
    ],
  },
  {
    ...base, id: "python-slugify", lesson: "python/8", xp: 25,
    title: "Slug для адреси сторінки і паліндром",
    context: "Із заголовка статті роблять адресу: «Hello World» стає hello-world. Це типова робота з рядками: прибрати зайві пробіли, привести до нижнього регістру, склеїти частини.",
    brief: [
      "Зробіть із <code>title</code> slug: прибрати пробіли на краях, зробити малі літери, а слова (розділені будь-якою кількістю пробілів) з'єднати дефісом. Підказка: <code>split()</code> і <code>\"-\".join(...)</code>.",
      "Для <code>word_a</code> і <code>word_b</code> виведіть <code>True</code> або <code>False</code>: чи читається текст однаково в обидва боки (регістр і пробіли не враховуються).",
    ],
    starter: raw`title = "  Hello   World From Python "
word_a = "А роза упала на лапу Азора"
word_b = "Python"

# TODO 1: виведіть slug: hello-world-from-python
# TODO 2: для word_a і word_b виведіть True або False (паліндром)
`,
    checks: [
      { on: "stdout", name: "Slug: hello-world-from-python", has: "hello-world-from-python", hint: "split() без аргументів розбиває за будь-якою кількістю пробілів і прибирає порожні частини." },
      { on: "stdout", name: "Паліндром розпізнається (True)", has: "hello-world-from-python\nTrue", hint: "Прибіріть пробіли й приведіть до малих літер, тоді порівняйте рядок із зворотним [::-1]." },
      { on: "stdout", name: "Не паліндром розпізнається (False)", has: "True\nFalse", hint: "Для word_b результат має бути False." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "hello-world-from-python\nTrue\nFalse", hint: "Мають бути рівно три рядки." },
      { on: "source", name: "Використано join і зворотний зріз", matches: "join[\\s\\S]*\\[::-1\\]", hint: "Для slug потрібен \"-\".join(...), для паліндрома — зріз [::-1]." },
    ],
  },
  {
    ...base, id: "python-parse-input", lesson: "python/9", xp: 20,
    title: "Розбір «брудного» введення",
    context: "Дані з форм і файлів приходять рядками, часто з пробілами й комою замість крапки. Розробник першим ділом чистить і перетворює їх на числа, а вже потім рахує.",
    brief: [
      "Перетворіть <code>raw_price</code> на <code>float</code> (приберіть пробіли, замініть кому на крапку), <code>raw_qty</code> на <code>int</code>, і виведіть вартість <code>37.5</code>.",
      "Другим рядком виведіть назву типу вартості, третім — <code>bool(\"0\")</code> і <code>bool(0)</code> через пробіл.",
    ],
    starter: raw`raw_price = " 12,50 "
raw_qty = "3"

# TODO 1: price = float(...), qty = int(...); виведіть price * qty -> 37.5
# TODO 2: виведіть назву типу вартості -> float
# TODO 3: виведіть bool("0") і bool(0) через пробіл -> True False
`,
    checks: [
      { on: "stdout", name: "Вартість 37.5", has: "37.5", hint: "Спершу strip(), потім replace(\",\", \".\"), а вже потім float()." },
      { on: "stdout", name: "Тип результату float", has: "float", hint: "type(total).__name__ покаже назву типу." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "37.5\nfloat\nTrue False", hint: "Три рядки: сума, тип і два результати bool." },
      { on: "source", name: "Використано float() і int()", matches: "float\\([\\s\\S]*int\\(", hint: "Ціну перетворюйте на float, а кількість на int." },
      { on: "source", name: "Кома замінюється на крапку", has: "replace", hint: "Метод replace(\",\", \".\") замінює кому." },
    ],
  },
  {
    ...base, id: "python-format-receipt", lesson: "python/10", xp: 20,
    title: "Рядок чека з вирівняними колонками",
    context: "Чеки, звіти й логи читаються лише тоді, коли колонки вирівняні, а гроші мають два знаки після коми. Саме для цього існують специфікації формату в f-рядках.",
    brief: [
      "Виведіть рядок чека: назва ліворуч у 8 позиціях, ціна праворуч у 7 позиціях із двома знаками, кількість праворуч у 3, сума праворуч у 8 із двома знаками, колонки розділені <code>|</code>. Очікується <code>Зошит   |  40.00|  3|  120.00</code>.",
      "Другим рядком виведіть <code>Усього: 1,234,567.89</code> для числа <code>big</code> (роздільники тисяч і два знаки).",
    ],
    starter: raw`name = "Зошит"
price = 40
qty = 3
big = 1234567.891

# TODO 1: рядок чека: Зошит   |  40.00|  3|  120.00
# TODO 2: Усього: 1,234,567.89
`,
    checks: [
      { on: "stdout", name: "Рядок чека вирівняно", has: "Зошит   |  40.00|  3|  120.00", hint: "Формати: {name:<8}, {price:>7.2f}, {qty:>3}, {price * qty:>8.2f}." },
      { on: "stdout", name: "Сума з роздільниками тисяч", has: "Усього: 1,234,567.89", hint: "Специфікація :,.2f ставить коми між тисячами й залишає два знаки." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Зошит   |  40.00|  3|  120.00\nУсього: 1,234,567.89", hint: "Мають бути рівно два рядки без зайвих пробілів." },
      { on: "source", name: "Використано f-рядок", matches: "\\bf[\"']", hint: "Ставте літеру f перед лапкою: f\"...\"." },
      { on: "source", name: "Є роздільник тисяч у специфікації", has: ":,", hint: "Скористайтеся специфікацією :,.2f." },
    ],
  },
  {
    ...base, id: "python-grade", lesson: "python/11", xp: 20,
    title: "Оцінка за балами і правила входу",
    context: "Розгалуження вирішує, що робити далі: показати помилку чи результат, дати знижку чи ні. Ланцюжок elif замінює купу вкладених if, а and з or описують складні правила.",
    brief: [
      "За значенням <code>score</code> виведіть оцінку: від 90 <code>відмінно</code>, від 75 <code>добре</code>, від 60 <code>задовільно</code>, інакше <code>незадовільно</code>. Використайте ланцюжок <code>if / elif / else</code>.",
      "Виведіть <code>Вхід дозволено</code>, якщо вік від 18 або (вік від 14 і є дорослий); інакше виведіть <code>Вхід заборонено</code>.",
    ],
    starter: raw`score = 82
age = 15
has_parent = True

# TODO 1: оцінка за score: відмінно / добре / задовільно / незадовільно
# TODO 2: Вхід дозволено або Вхід заборонено
`,
    checks: [
      { on: "stdout", name: "82 бали: добре", has: "добре", hint: "Порівнюйте від найбільшого порогу: спершу score >= 90, потім elif score >= 75." },
      { on: "stdout", name: "Вхід дозволено", has: "Вхід дозволено", hint: "Умова: age >= 18 or (age >= 14 and has_parent)." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "добре\nВхід дозволено", hint: "Мають бути рівно два рядки." },
      { on: "source", name: "Використано elif", matches: "\\belif\\b", hint: "Додайте гілки elif між if і else." },
      { on: "source", name: "Використано and та or", matches: "\\band\\b[\\s\\S]*\\bor\\b|\\bor\\b[\\s\\S]*\\band\\b", hint: "Для складного правила поєднайте and та or." },
    ],
  },
  {
    ...base, id: "python-match-command", lesson: "python/12", xp: 25,
    title: "match: код відповіді й команда",
    context: "Сервери відповідають кодами статусу, а програми розбирають команди різної форми. Оператор match читається краще за довгий ланцюжок elif, коли потрібно вибрати дію за значенням або структурою.",
    brief: [
      "Через <code>match</code> за <code>status</code>: 200, 201 і 204 — <code>Успіх</code>, 404 — <code>Не знайдено</code>, усе інше — <code>Інше</code>.",
      "Через <code>match</code> за <code>command</code>: зразок <code>[\"move\", x, y]</code> виводить <code>рух: x=3, y=4</code>, а будь-що інше — <code>Невідома команда</code>.",
    ],
    starter: raw`status = 404
command = "move 3 4".split()

# TODO 1: match за status: Успіх / Не знайдено / Інше
# TODO 2: match за command: рух: x=3, y=4 або Невідома команда
`,
    checks: [
      { on: "stdout", name: "Код 404: Не знайдено", has: "Не знайдено", hint: "Додайте гілку case 404: і виведіть Не знайдено." },
      { on: "stdout", name: "Команда: рух: x=3, y=4", has: "рух: x=3, y=4", hint: "Зразок case [\"move\", x, y]: бере два числа в змінні x і y." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Не знайдено\nрух: x=3, y=4", hint: "Мають бути рівно два рядки." },
      { on: "source", name: "Використано match", matches: "\\bmatch\\b", hint: "Почніть із match status: і гілок case." },
      { on: "source", name: "Є зразок-послідовність", matches: "case\\s+\\[", hint: "Для команди потрібен зразок у квадратних дужках." },
      { on: "source", name: "Є гілка case _", matches: "case\\s+_\\s*:", hint: "Гілка case _: ловить усі решту випадків і стоїть останньою." },
    ],
  },
  {
    ...base, id: "python-fizzbuzz", lesson: "python/13", xp: 25,
    title: "FizzBuzz і цикл while",
    context: "Цикли обробляють списки замовлень, рядки файлу, сторінки відповіді API. FizzBuzz — класична розминка з перевіркою кратності в циклі for, а while потрібен, коли невідомо наперед, скільки кроків знадобиться.",
    brief: [
      "У циклі <code>for</code> для чисел від 1 до 15 виведіть число; але якщо воно ділиться на 3, виведіть <code>Fizz</code>, на 5 — <code>Buzz</code>, на обидва — <code>FizzBuzz</code>.",
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
      { on: "stdout", name: "Fizz на кратних 3, Buzz на кратних 5", has: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n", hint: "Спершу перевіряйте кратність 15 (або обох чисел), потім 3, потім 5." },
      { on: "stdout", name: "Кроків: 7", has: "Кроків: 7", hint: "У циклі while n >= 1 діліть n на 2 і збільшуйте steps." },
      { on: "source", name: "Використано цикл while", matches: "\\bwhile\\b", hint: "Другу частину напишіть через while." },
      { on: "source", name: "Кратність перевіряється через %", has: "%", hint: "Остача від ділення дорівнює нулю, коли число ділиться націло: i % 3 == 0." },
    ],
  },
  {
    ...base, id: "python-first-prime", lesson: "python/14", xp: 25,
    title: "Перше просте число: break, continue і else",
    context: "Пошук першого підходящого елемента — типова задача для break, а continue допомагає відфільтрувати зайве. Блок else після циклу замінює прапорець «знайшли чи ні».",
    brief: [
      "Знайдіть і виведіть перше просте число більше за 90. Для кожного <code>n</code> перебирайте дільники від 2 до <code>n - 1</code> з <code>break</code>, а виведення й вихід із зовнішнього циклу напишіть у блоці <code>else</code>.",
      "У другому циклі додайте до суми числа від 1 до 20, пропустивши кратні 3 за допомогою <code>continue</code>. Виведіть <code>Сума: 147</code>.",
    ],
    starter: raw`# 1. Перше просте число більше за 90
for n in range(91, 200):
    # TODO: внутрішній цикл по дільниках із break; вивід і вихід — у блоці else
    pass

# 2. Сума чисел 1..20, крім кратних 3
total = 0
for i in range(1, 21):
    # TODO: пропустіть кратні 3 через continue
    total += i
print("Сума:", total)
`,
    checks: [
      { on: "stdout", name: "Перше просте число після 90: 97", has: "97\n", hint: "Число просте, якщо жоден дільник від 2 до n - 1 не ділить його націло." },
      { on: "stdout", name: "Сума без кратних 3: 147", has: "Сума: 147", hint: "Перед total += i додайте: if i % 3 == 0: continue." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "97\nСума: 147", hint: "Просте число виводиться один раз, тому після print у блоці else потрібен break." },
      { on: "source", name: "Використано break", matches: "\\bbreak\\b", hint: "break потрібен у внутрішньому циклі, коли знайшли дільник." },
      { on: "source", name: "Використано else після циклу", matches: "\\belse\\s*:", hint: "else стоїть на одному рівні відступу з внутрішнім for." },
      { on: "source", name: "Використано continue", matches: "\\bcontinue\\b", hint: "continue пропускає решту кроку циклу." },
    ],
  },
  {
    ...base, id: "python-function-basics", lesson: "python/15", xp: 20,
    title: "Три прості функції",
    context: "Малі функції з чіткими іменами — будівельні блоки будь-якої програми. Вони повертають результат, а не друкують його, тому їх легко повторно використовувати й тестувати.",
    brief: [
      "Допишіть <code>rectangle_area(w, h)</code> (площа), <code>is_even(n)</code> (<code>True</code> для парних) і <code>full_name(first, last)</code>, що повертає імена з великої літери через пробіл.",
      "Функції мають повертати значення через <code>return</code>, а друкує їх результат код унизу файла.",
    ],
    starter: raw`def rectangle_area(w, h):
    # TODO: поверніть площу
    pass


def is_even(n):
    # TODO: True, якщо n парне
    pass


def full_name(first, last):
    # TODO: "ada", "lovelace" -> "Ada Lovelace"
    pass


print(rectangle_area(4, 6))
print(is_even(10), is_even(7))
print(full_name("ada", "lovelace"))
`,
    checks: [
      { on: "stdout", name: "Площа 4 × 6 = 24", has: "24", hint: "Поверніть w * h через return." },
      { on: "stdout", name: "Парність: True False", has: "True False", hint: "Число парне, коли остача від ділення на 2 дорівнює нулю: n % 2 == 0." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "24\nTrue False\nAda Lovelace", hint: "Для імені допоможе метод title(): first.title() + \" \" + last.title()." },
      { on: "source", name: "Функції повертають значення", matches: "\\breturn\\b", hint: "Усередині кожної функції потрібен return." },
    ],
  },
  {
    ...base, id: "python-functions", lesson: "python/16", xp: 30,
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
      { on: "stdout", name: "Знижка за замовчуванням 10 %: 180.0", has: "180.0", hint: "Ціна після знижки: price * (1 - percent / 100)." },
      { on: "stdout", name: "Знижка 25 %: 150.0", has: "150.0", hint: "Другий аргумент перекриває значення за замовчуванням." },
      { on: "stdout", name: "Підсумок: (3, 27, 9.0)", has: "(3, 27, 9.0)", hint: "Поверніть (len(nums), sum(nums), середнє) через кому, середнє округліть до двох знаків." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "180.0\n150.0\n(3, 27, 9.0)", hint: "Перевірте всі три рядки виводу." },
      { on: "source", name: "Параметр за замовчуванням percent=10", matches: "percent\\s*=\\s*10", hint: "Залиште в заголовку percent=10." },
    ],
  },
  {
    ...base, id: "python-closures", lesson: "python/17", xp: 30,
    title: "Множник і лічильник на замиканнях",
    context: "Замикання дозволяє функції «запам'ятати» значення з місця створення. Так роблять налаштовувані множники, лічильники викликів і фільтри без жодного класу.",
    brief: [
      "Допишіть <code>make_multiplier(n)</code>, що повертає функцію, яка множить свій аргумент на <code>n</code>.",
      "Допишіть <code>make_counter()</code>, що повертає функцію-лічильник: перший виклик дає 1, другий 2 і так далі. Кожен новий лічильник починає з одиниці.",
    ],
    starter: raw`def make_multiplier(n):
    # TODO: поверніть функцію, яка множить x на n
    pass


def make_counter():
    # TODO: поверніть функцію-лічильник (потрібен nonlocal)
    pass


double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5), triple(5))

c = make_counter()
print(c(), c(), c())
d = make_counter()
print(d())
`,
    checks: [
      { on: "stdout", name: "Множники: 10 15", has: "10 15", hint: "Усередині make_multiplier опишіть def multiply(x): return x * n і поверніть multiply." },
      { on: "stdout", name: "Лічильник: 1 2 3", has: "1 2 3", hint: "Змінну count оголосіть у make_counter, а в лічильнику напишіть nonlocal count." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "10 15\n1 2 3\n1", hint: "Другий лічильник d має почати з 1 незалежно від першого." },
      { on: "source", name: "Використано nonlocal", matches: "\\bnonlocal\\b", hint: "Без nonlocal присвоєння count += 1 викличе UnboundLocalError." },
    ],
  },
  {
    ...base, id: "python-recursion", lesson: "python/18", xp: 30,
    title: "Факторіал і сума цифр рекурсією",
    context: "Рекурсія природна для задач, які зводяться до меншої копії самих себе: факторіал, сума цифр, обхід дерев. Головне — базовий випадок і крок, що до нього наближає.",
    brief: [
      "Допишіть рекурсивну <code>factorial(n)</code> з базовим випадком для 0 і <code>digit_sum(n)</code>: остання цифра плюс сума цифр решти числа.",
      "Не використовуйте цикли й <code>math.factorial</code>: обидві функції мають викликати самі себе.",
    ],
    starter: raw`def factorial(n):
    # TODO: базовий випадок і рекурсивний крок
    return 0


def digit_sum(n):
    # TODO: остання цифра + сума цифр решти
    return 0


print(factorial(10))
print(digit_sum(2026))
`,
    checks: [
      { on: "stdout", name: "Факторіал 10 дорівнює 3628800", has: "3628800", hint: "Базовий випадок: factorial(0) == 1; крок: n * factorial(n - 1)." },
      { on: "stdout", name: "Сума цифр 2026 дорівнює 10", has: "\n10", hint: "Остання цифра: n % 10, решта числа: n // 10." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "3628800\n10", hint: "Мають бути два числа, кожне в окремому рядку." },
      { on: "source", name: "factorial викликає сама себе", matches: "def\\s+factorial\\(n\\):(?:(?!\\n\\S)[\\s\\S])*?\\bfactorial\\(", hint: "Усередині тіла factorial має бути виклик factorial(...)." },
      { on: "source", name: "digit_sum викликає сама себе", matches: "def\\s+digit_sum\\(n\\):(?:(?!\\n\\S)[\\s\\S])*?\\bdigit_sum\\(", hint: "Усередині тіла digit_sum має бути виклик digit_sum(...)." },
    ],
  },
];
