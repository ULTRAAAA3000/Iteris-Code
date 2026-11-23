// Практичні завдання глави «Абстракція та типи» (уроки 40–51). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_05: readonly RemoteTask[] = [
  {
    ...base, id: "python-dunder-vector", lesson: "python/40", xp: 30,
    title: "Вектор зі спеціальними методами",
    context: "Спеціальні методи вчать власний клас поводитися як вбудований: додаватися, множитися на число, мати довжину й гарний вивід. Так влаштовані вектори, суми грошей, дати.",
    brief: [
      "Допишіть у <code>Vector</code> методи <code>__add__</code> (покоординатна сума), <code>__mul__</code> (множення на число), <code>__len__</code> (завжди 2) і <code>__repr__</code> виду <code>Vector(4, 6)</code>.",
      "Решта коду вже написана й перевіряє вирази <code>a + b</code>, <code>a * 3</code> і <code>len(a)</code>.",
    ],
    starter: raw`class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # TODO: __add__, __mul__, __len__ і __repr__


a = Vector(1, 2)
b = Vector(3, 4)
print(a + b)
print(a * 3)
print(len(a))
`,
    checks: [
      { on: "stdout", name: "Сума векторів: Vector(4, 6)", has: "Vector(4, 6)", hint: "__add__ повертає новий Vector із сумами координат." },
      { on: "stdout", name: "Множення на число: Vector(3, 6)", has: "Vector(3, 6)", hint: "__mul__(self, k) повертає Vector(self.x * k, self.y * k)." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Vector(4, 6)\nVector(3, 6)\n2", hint: "Третій рядок — результат len(a), тобто 2." },
      { on: "source", name: "Описано __add__ і __repr__", matches: "def\\s+__add__[\\s\\S]*def\\s+__repr__|def\\s+__repr__[\\s\\S]*def\\s+__add__", hint: "Потрібні обидва спеціальні методи." },
    ],
  },
  {
    ...base, id: "python-abc-shapes", lesson: "python/41", xp: 30,
    title: "Абстрактна фігура і два нащадки",
    context: "Абстрактний клас задає контракт: кожна фігура зобов'язана вміти рахувати площу. Поки нащадок цього не зробить, створити його об'єкт Python не дозволить.",
    brief: [
      "Допишіть <code>Square(Shape)</code> (<code>name = \"Квадрат\"</code>, площа <code>side ** 2</code>) і <code>Circle(Shape)</code> (<code>name = \"Коло\"</code>, площа <code>round(math.pi * r ** 2, 2)</code>).",
      "Код унизу виводить описи фігур та список абстрактних методів класу <code>Shape</code>.",
    ],
    starter: raw`import math
from abc import ABC, abstractmethod


class Shape(ABC):
    name = "Фігура"

    @abstractmethod
    def area(self):
        ...

    def describe(self):
        return f"{self.name}: {self.area()}"


# TODO: class Square(Shape) з __init__(self, side) і area()
# TODO: class Circle(Shape) з __init__(self, r) і area()


for shape in [Square(3), Circle(1)]:
    print(shape.describe())
print(sorted(Shape.__abstractmethods__))
`,
    checks: [
      { on: "stdout", name: "Квадрат: 9", has: "Квадрат: 9", hint: "area квадрата: self.side ** 2." },
      { on: "stdout", name: "Коло: 3.14", has: "Коло: 3.14", hint: "area кола: round(math.pi * self.r ** 2, 2)." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Квадрат: 9\nКоло: 3.14\n['area']", hint: "Мають бути три рядки." },
      { on: "source", name: "Нащадки успадковують Shape", matches: "class\\s+Square\\s*\\(\\s*Shape\\s*\\)[\\s\\S]*class\\s+Circle\\s*\\(\\s*Shape\\s*\\)", hint: "Напишіть class Square(Shape): і class Circle(Shape):." },
    ],
  },
  {
    ...base, id: "python-protocol-notifier", lesson: "python/42", xp: 30,
    title: "Протокол Notifier без успадкування",
    context: "Протокол описує, що потрібно від об'єкта, а не звідки він походить. Класи Email і Sms підходять до нього без жодного успадкування, а функція розсилки працює з обома.",
    brief: [
      "Допишіть класи <code>Email</code> і <code>Sms</code> із методом <code>send(message)</code>, який повертає <code>Email: ...</code> і <code>SMS: ...</code>. Успадковувати <code>Notifier</code> не потрібно.",
      "Перевірка наприкінці з'ясовує через <code>isinstance</code>, що відповідає протоколу.",
    ],
    starter: raw`from typing import Protocol, runtime_checkable


@runtime_checkable
class Notifier(Protocol):
    def send(self, message: str) -> str: ...


# TODO: class Email: send(message) -> "Email: <message>"
# TODO: class Sms: send(message) -> "SMS: <message>"


def notify_all(notifiers: list[Notifier], message: str) -> None:
    for n in notifiers:
        print(n.send(message))


notify_all([Email(), Sms()], "Привіт")
print(isinstance(Email(), Notifier), isinstance("текст", Notifier))
`,
    checks: [
      { on: "stdout", name: "Обидва сповіщувачі спрацювали", has: "Email: Привіт\nSMS: Привіт\n", hint: "Кожен клас повертає рядок із власним префіксом." },
      { on: "stdout", name: "isinstance: True False", has: "True False", hint: "Протокол перевіряє лише наявність методу send." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Email: Привіт\nSMS: Привіт\nTrue False", hint: "Мають бути три рядки." },
      { on: "source", name: "Класи не успадковують протокол", matches: "class\\s+(Email|Sms)\\s*\\(\\s*Notifier", not: true, hint: "Структурна типізація не потребує успадкування: пишіть class Email:." },
    ],
  },
  {
    ...base, id: "python-annotations-basic", lesson: "python/43", xp: 20,
    title: "Анотації функцій і __annotations__",
    context: "Анотації типів роблять підписи функцій самодокументованими й дають аналізаторам змогу ловити помилки. Python їх не перевіряє, але зберігає в __annotations__.",
    brief: [
      "Додайте анотації: <code>average(nums: list[float]) -&gt; float</code> і <code>greet(name: str, times: int = 1) -&gt; str</code>.",
      "Решту вже написано: код викликає функції й виводить <code>average.__annotations__</code>.",
    ],
    starter: raw`def average(nums):
    return sum(nums) / len(nums)


def greet(name, times=1):
    return " ".join([f"Привіт, {name}!"] * times)


print(average([1, 2, 3, 4]))
print(greet("Оля", 2))
print(average.__annotations__)
`,
    checks: [
      { on: "stdout", name: "Середнє дорівнює 2.5", has: "2.5\n", hint: "Логіку функцій змінювати не треба, лише додати анотації." },
      { on: "stdout", name: "Анотації average збережено", has: "{'nums': list[float], 'return': <class 'float'>}", hint: "Параметр nums: list[float], результат -> float." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "2.5\nПривіт, Оля! Привіт, Оля!\n{'nums': list[float], 'return': <class 'float'>}", hint: "Мають бути три рядки." },
      { on: "source", name: "Анотовано greet", matches: "def\\s+greet\\(\\s*name\\s*:\\s*str\\s*,\\s*times\\s*:\\s*int\\s*=\\s*1\\s*\\)\\s*->\\s*str", hint: "Підпис: def greet(name: str, times: int = 1) -> str:." },
    ],
  },
  {
    ...base, id: "python-typed-dict", lesson: "python/44", xp: 25,
    title: "TypedDict і пошук із результатом | None",
    context: "Дані з JSON приходять словниками, і TypedDict описує їхню форму. А тип User | None змушує обробити випадок, коли користувача не знайдено, ще до запуску програми.",
    brief: [
      "Опишіть <code>User(TypedDict)</code> із полями <code>name: str</code> і <code>age: int</code>.",
      "Допишіть <code>find_user(users, name)</code> (повертає користувача або <code>None</code>) і <code>describe(user)</code>: <code>Оля, 16 років</code> або <code>Не знайдено</code>.",
    ],
    starter: raw`from typing import TypedDict

# TODO: class User(TypedDict) з полями name: str і age: int


def find_user(users: list[User], name: str) -> User | None:
    # TODO: поверніть користувача з таким іменем або None
    return None


def describe(user: User | None) -> str:
    # TODO: "Оля, 16 років" або "Не знайдено"
    return ""


users: list[User] = [{"name": "Оля", "age": 16}, {"name": "Іван", "age": 17}]
print(describe(find_user(users, "Іван")))
print(describe(find_user(users, "Марко")))
`,
    checks: [
      { on: "stdout", name: "Знайдений користувач", has: "Іван, 17 років", hint: "Пройдіться циклом по users і порівняйте user[\"name\"] з name." },
      { on: "stdout", name: "Користувача не знайдено", has: "Не знайдено", hint: "Якщо user is None, повертайте текст Не знайдено." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Іван, 17 років\nНе знайдено", hint: "Мають бути два рядки." },
      { on: "source", name: "Описано TypedDict", matches: "class\\s+User\\s*\\(\\s*TypedDict\\s*\\)", hint: "Напишіть class User(TypedDict): з двома полями." },
      { on: "source", name: "Перевірка на None", has: "is None", hint: "Звужуйте тип через is None або is not None." },
    ],
  },
  {
    ...base, id: "python-generic-stack", lesson: "python/45", xp: 30,
    title: "Узагальнений стос Stack[T]",
    context: "Стос однаково працює з числами, рядками й будь-чим іншим, а аналізатор стежить, щоб типи не змішувались. Саме для цього існують узагальнені класи з типовою змінною.",
    brief: [
      "Допишіть <code>class Stack[T]</code> (Python 3.12): <code>push(item)</code>, <code>pop()</code>, <code>peek()</code> (дивиться на верхній без видалення) і <code>size()</code>.",
      "Допишіть функцію <code>first[T](items: list[T]) -&gt; T</code>, що повертає перший елемент списку.",
    ],
    starter: raw`class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        pass  # TODO

    def pop(self) -> T:
        pass  # TODO

    def peek(self) -> T:
        pass  # TODO

    def size(self) -> int:
        pass  # TODO


def first[T](items: list[T]) -> T:
    pass  # TODO


s = Stack[int]()
s.push(1)
s.push(2)
s.push(3)
print(s.peek(), s.pop(), s.size())
print(first(["a", "b"]))
`,
    checks: [
      { on: "stdout", name: "peek, pop і size", has: "3 3 2", hint: "peek повертає self._items[-1], pop — self._items.pop(), size — len(self._items)." },
      { on: "stdout", name: "Перший елемент списку", has: "\na", hint: "first повертає items[0]." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "3 3 2\na", hint: "Мають бути два рядки." },
      { on: "source", name: "Використано синтаксис 3.12", matches: "class\\s+Stack\\[T\\][\\s\\S]*def\\s+first\\[T\\]", hint: "Залиште class Stack[T] і def first[T]." },
    ],
  },
  {
    ...base, id: "python-countdown-iterator", lesson: "python/46", xp: 25,
    title: "Ітератор зворотного відліку",
    context: "Протокол ітерації дозволяє власному класу працювати в циклах for, у sum() і list(). Достатньо двох методів: __iter__ і __next__.",
    brief: [
      "Допишіть <code>__iter__</code> (поверніть <code>self</code>) і <code>__next__</code> у класі <code>Countdown</code>: видає числа від <code>n</code> до 1, а потім кидає <code>StopIteration</code>.",
      "Решта коду перевіряє <code>list</code>, <code>sum</code> і ручні виклики <code>next</code>.",
    ],
    starter: raw`class Countdown:
    def __init__(self, n):
        self.n = n

    # TODO: __iter__ і __next__


print(list(Countdown(3)))
print(sum(Countdown(4)))
it = Countdown(2)
print(next(it), next(it))
`,
    checks: [
      { on: "stdout", name: "Відлік у списку", has: "[3, 2, 1]", hint: "__next__ зменшує self.n і повертає попереднє значення." },
      { on: "stdout", name: "Сума 4 + 3 + 2 + 1 = 10", has: "\n10\n", hint: "sum споживає ітератор, поки не отримає StopIteration." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[3, 2, 1]\n10\n2 1", hint: "Мають бути три рядки." },
      { on: "source", name: "Є StopIteration", has: "StopIteration", hint: "Коли відлік закінчився, кидайте raise StopIteration." },
    ],
  },
  {
    ...base, id: "python-fib-generator", lesson: "python/47", xp: 25,
    title: "Нескінченний генератор Фібоначчі",
    context: "Генератор виробляє значення на вимогу й не зберігає зайвого, тож нескінченна послідовність не лякає. З нього беруть потрібну кількість значень і фільтрують їх на льоту.",
    brief: [
      "Допишіть генератор <code>fib()</code>: нескінченна послідовність 0, 1, 1, 2, 3, 5 … (використайте <code>yield</code>).",
      "Код унизу виводить перші десять чисел і суму парних серед перших двадцяти через генераторний вираз.",
    ],
    starter: raw`from itertools import islice


def fib():
    # TODO: нескінченний генератор чисел Фібоначчі
    return None


print(list(islice(fib(), 10)))
print(sum(x for x in islice(fib(), 20) if x % 2 == 0))
`,
    checks: [
      { on: "stdout", name: "Перші десять чисел", has: "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]", hint: "Тримайте a, b = 0, 1 і в циклі while True віддавайте a, потім a, b = b, a + b." },
      { on: "stdout", name: "Сума парних серед перших 20: 3382", has: "3382", hint: "Генератор має бути нескінченним, а islice сам обріже потрібну кількість." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n3382", hint: "Мають бути два рядки." },
      { on: "source", name: "Використано yield", has: "yield", hint: "Значення віддає оператор yield." },
    ],
  },
  {
    ...base, id: "python-flatten-pipeline", lesson: "python/48", xp: 30,
    title: "Розплющення списку й конвеєр генераторів",
    context: "Рекурсивний генератор з yield from обходить вкладені структури, а ланцюжок генераторів обробляє потік даних без проміжних списків.",
    brief: [
      "Допишіть <code>flatten(items)</code>: рекурсивний генератор, що розплющує вкладені списки через <code>yield from</code>.",
      "Допишіть <code>evens(nums)</code> і <code>squares(nums)</code> як генератори та підрахуйте суму квадратів парних чисел від 1 до 10.",
    ],
    starter: raw`def flatten(items):
    # TODO: yield from для вкладених списків
    return None


def evens(nums):
    # TODO: генератор парних
    return None


def squares(nums):
    # TODO: генератор квадратів
    return None


print(list(flatten([1, [2, [3, 4]], 5, [[6]]])))
print(sum(squares(evens(range(1, 11)))))
`,
    checks: [
      { on: "stdout", name: "Плоский список", has: "[1, 2, 3, 4, 5, 6]", hint: "Для вкладеного списку напишіть yield from flatten(item), для решти — yield item." },
      { on: "stdout", name: "Сума квадратів парних: 220", has: "220", hint: "4 + 16 + 36 + 64 + 100 = 220." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "[1, 2, 3, 4, 5, 6]\n220", hint: "Мають бути два рядки." },
      { on: "source", name: "Використано yield from", has: "yield from", hint: "Делегуйте обхід вкладеного списку через yield from." },
    ],
  },
  {
    ...base, id: "python-decorator-counter", lesson: "python/49", xp: 25,
    title: "Декоратор-лічильник викликів",
    context: "Декоратор додає поведінку функції, не змінюючи її коду. Лічильник викликів — класичний приклад: обгортка веде облік і передає виклик далі.",
    brief: [
      "Допишіть декоратор <code>count_calls</code>: обгортка збільшує <code>wrapper.calls</code>, викликає оригінал і повертає його результат.",
      "Задайте початкове значення <code>wrapper.calls = 0</code> і поверніть <code>wrapper</code> із декоратора.",
    ],
    starter: raw`def count_calls(func):
    # TODO: обгортка з *args, **kwargs і лічильником wrapper.calls
    return None


@count_calls
def hello():
    return "hi"


print(hello(), hello(), hello())
print(hello.calls)
`,
    checks: [
      { on: "stdout", name: "Результати передаються", has: "hi hi hi\n", hint: "Обгортка має повертати те, що повернула func(*args, **kwargs)." },
      { on: "stdout", name: "Лічильник дорівнює 3", has: "\n3", hint: "wrapper.calls += 1 на кожному виклику, початкове значення 0." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "hi hi hi\n3", hint: "Мають бути два рядки." },
      { on: "source", name: "Обгортка приймає довільні аргументи", matches: "\\*args\\s*,\\s*\\*\\*kwargs", hint: "Оголосіть def wrapper(*args, **kwargs)." },
    ],
  },
  {
    ...base, id: "python-repeat-decorator", lesson: "python/50", xp: 30,
    title: "Декоратор repeat(times) із wraps",
    context: "Декоратор із параметром виготовляє налаштований декоратор. Усередині обов'язковий wraps, інакше функція втратить ім'я й документацію, а налагодження й логи стануть незрозумілими.",
    brief: [
      "Допишіть <code>repeat(times)</code>: три рівні вкладення (налаштування, функція, виклик), обгортка викликає функцію <code>times</code> разів.",
      "Додайте <code>@wraps(func)</code>, щоб <code>greet.__name__</code> лишилося <code>greet</code>.",
    ],
    starter: raw`from functools import wraps


def repeat(times):
    # TODO: decorator(func) -> wrapper(*args, **kwargs) з @wraps(func)
    return None


@repeat(3)
def greet():
    print("Привіт!")


greet()
print(greet.__name__)
`,
    checks: [
      { on: "stdout", name: "Функція викликається тричі", has: "Привіт!\nПривіт!\nПривіт!\n", hint: "У wrapper використайте цикл for _ in range(times)." },
      { on: "stdout", name: "Ім'я збережено", has: "greet", hint: "Над wrapper поставте @wraps(func)." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Привіт!\nПривіт!\nПривіт!\ngreet", hint: "Останній рядок — ім'я функції." },
      { on: "source", name: "Використано wraps", matches: "@wraps\\(\\s*func\\s*\\)", hint: "Напишіть @wraps(func) над обгорткою." },
    ],
  },
  {
    ...base, id: "python-inspect-params", lesson: "python/51", xp: 30,
    title: "Обов'язкові параметри функції через inspect",
    context: "Фреймворки читають підписи функцій, щоб самі вирішити, які аргументи передати. Для цього потрібно вміти дістати параметри й відрізнити обов'язкові від необов'язкових.",
    brief: [
      "Допишіть <code>required_params(func)</code>: список імен параметрів без значення за замовчуванням, окрім <code>*args</code> і <code>**kwargs</code>.",
      "Другий рядок виводу — рядкове подання підпису функції.",
    ],
    starter: raw`import inspect


def connect(host, port=80, *args, timeout, **options):
    ...


def required_params(func):
    # TODO: імена параметрів без значення за замовчуванням (без *args і **kwargs)
    return []


print(required_params(connect))
print(inspect.signature(connect))
`,
    checks: [
      { on: "stdout", name: "Обов'язкові параметри: host і timeout", has: "['host', 'timeout']", hint: "Параметр обов'язковий, якщо p.default is p.empty і його kind не VAR_POSITIONAL та не VAR_KEYWORD." },
      { on: "stdout", name: "Підпис функції", has: "(host, port=80, *args, timeout, **options)", hint: "Підпис виводить print(inspect.signature(connect))." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "['host', 'timeout']\n(host, port=80, *args, timeout, **options)", hint: "Мають бути два рядки." },
      { on: "source", name: "Використано inspect.signature", has: "signature(", hint: "Параметри дістають із inspect.signature(func).parameters." },
    ],
  },
];
