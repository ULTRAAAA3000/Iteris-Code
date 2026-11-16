// Еталонні рішення завдань Python (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const PYTHON = {
  "python-hello-run": raw`print("Привіт, Python!")
print(2 ** 10)
`,
  "python-print-sep-end": raw`print("Go", "Rust", "Python", sep="-")

print("Завантаження", end="... ")
print("готово")
`,
  "python-order-total": raw`price = 199.99
qty = 3
total = price * qty

print(f"Разом: {total:.2f}")
print(type(price).__name__, type(qty).__name__)
`,
  "python-grade": raw`def grade(score):
    if score >= 90:
        return "відмінно"
    elif score >= 75:
        return "добре"
    elif score >= 60:
        return "задовільно"
    else:
        return "незадовільно"


for s in [95, 80, 61, 30]:
    print(s, grade(s))
`,
  "python-fizzbuzz": raw`for i in range(1, 16):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)

n = 100
steps = 0
while n >= 1:
    n /= 2
    steps += 1
print("Кроків:", steps)
`,
  "python-slugify": raw`def slugify(title):
    return "-".join(title.strip().lower().split())


def is_palindrome(text):
    clean = text.lower().replace(" ", "")
    return clean == clean[::-1]


print(slugify("  Hello   World From Python "))
print(is_palindrome("А роза упала на лапу Азора"))
print(is_palindrome("Python"))
`,
  "python-top3-unique": raw`def unique(nums):
    seen = set()
    result = []
    for n in nums:
        if n not in seen:
            seen.add(n)
            result.append(n)
    return result


def top3(nums):
    return sorted(nums, reverse=True)[:3]


data = [5, 3, 9, 3, 7, 9, 1, 5]
u = unique(data)
print(u)
print(top3(u))
`,
  "python-sets-tuples": raw`def min_max(nums):
    return (min(nums), max(nums))


def common(a, b):
    return sorted(set(a) & set(b))


low, high = min_max([7, 2, 9, 4])
print("Мін:", low, "Макс:", high)
print("Спільні:", common([1, 2, 3, 4, 5], [4, 5, 6, 7]))
`,
  "python-word-freq": raw`def word_count(text):
    counts = {}
    for word in text.split():
        counts[word] = counts.get(word, 0) + 1
    return counts


counts = word_count("to be or not to be that is the question to")
for word, n in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
    print(word, n)
`,
  "python-functions": raw`def apply_discount(price, percent=10):
    return round(price * (1 - percent / 100), 2)


def summary(*nums):
    total = sum(nums)
    return (len(nums), total, round(total / len(nums), 2))


print(apply_discount(200))
print(apply_discount(200, 25))
print(summary(4, 8, 15))
`,
  "python-sort-key": raw`products = [
    {"name": "Хліб", "price": 25, "qty": 10},
    {"name": "Молоко", "price": 42, "qty": 3},
    {"name": "Сир", "price": 180, "qty": 3},
    {"name": "Яйця", "price": 60, "qty": 10},
]


def by_price(items):
    return [p["name"] for p in sorted(items, key=lambda p: p["price"])]


def by_qty_then_name(items):
    return [p["name"] for p in sorted(items, key=lambda p: (-p["qty"], p["name"]))]


print(by_price(products))
print(by_qty_then_name(products))
`,
  "python-comprehensions": raw`def squares_of_evens(nums):
    return [n * n for n in nums if n % 2 == 0]


def scores(names, points):
    return dict(zip(names, points))


def numbered(names):
    return [f"{i}. {name}" for i, name in enumerate(names, start=1)]


print(squares_of_evens([1, 2, 3, 4, 5, 6]))
print(scores(["Оля", "Іван"], [90, 75]))
print(numbered(["Оля", "Іван"]))
`,
  "python-files-stringio": raw`import io


def save_lines(f, lines):
    for line in lines:
        f.write(line + "\n")


def load_lines(f):
    return f.read().splitlines()


buf = io.StringIO()
save_lines(buf, ["перший", "другий", "третій"])
buf.seek(0)
lines = load_lines(buf)
print(lines)
print("Рядків:", len(lines))
`,
  "python-exceptions": raw`def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None


class NegativeAgeError(ValueError):
    pass


def check_age(age):
    if age < 0:
        raise NegativeAgeError("вік не може бути від'ємним")
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
  "python-stdlib-modules": raw`import math
import statistics
from collections import Counter

print("Корінь:", math.sqrt(144))
print("Середнє:", statistics.mean([2, 4, 4, 4, 5, 5, 7, 9]))
print("Найчастіше:", Counter("abracadabra").most_common(1)[0][0])
`,
  "python-json-csv": raw`import csv
import io
import json


def orders_total(text):
    return sum(o["price"] * o["qty"] for o in json.loads(text))


def read_csv(text):
    return list(csv.DictReader(io.StringIO(text)))


def to_json(obj):
    return json.dumps(obj, ensure_ascii=False)


orders = '[{"item": "Хліб", "price": 25, "qty": 2}, {"item": "Сир", "price": 180, "qty": 1}]'
print(orders_total(orders))

rows = read_csv("name,age\nОля,25\nІван,30\n")
print([r["name"] for r in rows])
print(to_json(rows[0]))
`,
  "python-account-class": raw`class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Недостатньо коштів")
        self.balance -= amount

    def __str__(self):
        return f"{self.owner}: {self.balance} грн"


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
  "python-shapes-property": raw`import math


class Shape:
    name = "Фігура"

    def area(self):
        raise NotImplementedError

    def describe(self):
        return f"{self.name}: {self.area()}"


class Circle(Shape):
    name = "Коло"

    def __init__(self, r):
        self.r = r

    def area(self):
        return round(math.pi * self.r ** 2, 2)


class Rectangle(Shape):
    name = "Прямокутник"

    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h


class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    @property
    def fahrenheit(self):
        return self.celsius * 9 / 5 + 32


for shape in [Circle(2), Rectangle(3, 4)]:
    print(shape.describe())
print(Temperature(100).fahrenheit)
`,
  "python-api-response": raw`import json


class Response:
    """Імітація відповіді бібліотеки requests: status_code і json()"""

    def __init__(self, status_code, body=""):
        self.status_code = status_code
        self._body = body

    def json(self):
        return json.loads(self._body)


def get_username(resp):
    if resp.status_code == 200:
        return resp.json()["user"]["name"]
    if resp.status_code == 404:
        return "не знайдено"
    raise RuntimeError(f"Помилка сервера: {resp.status_code}")


for resp in [Response(200, '{"user": {"name": "Оля"}}'), Response(404), Response(500)]:
    try:
        print(get_username(resp))
    except RuntimeError as e:
        print(e)
`,
  "python-mini-tests": raw`def slugify(title):
    return "-".join(title.lower().split())


def test_simple():
    assert slugify("Hello World") == "hello-world"


def test_extra_spaces():
    assert slugify("  Hello   World  ") == "hello-world"


def test_already_lower():
    assert slugify("python") == "python"


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
};
