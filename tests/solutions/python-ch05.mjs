// Еталонні рішення завдань Python, глава 05 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_05 = {
  "python-dunder-vector": raw`class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, k):
        return Vector(self.x * k, self.y * k)

    def __len__(self):
        return 2

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"


a = Vector(1, 2)
b = Vector(3, 4)
print(a + b)
print(a * 3)
print(len(a))
`,
  "python-abc-shapes": raw`import math
from abc import ABC, abstractmethod


class Shape(ABC):
    name = "Фігура"

    @abstractmethod
    def area(self):
        ...

    def describe(self):
        return f"{self.name}: {self.area()}"


class Square(Shape):
    name = "Квадрат"

    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2


class Circle(Shape):
    name = "Коло"

    def __init__(self, r):
        self.r = r

    def area(self):
        return round(math.pi * self.r ** 2, 2)


for shape in [Square(3), Circle(1)]:
    print(shape.describe())
print(sorted(Shape.__abstractmethods__))
`,
  "python-protocol-notifier": raw`from typing import Protocol, runtime_checkable


@runtime_checkable
class Notifier(Protocol):
    def send(self, message: str) -> str: ...


class Email:
    def send(self, message: str) -> str:
        return f"Email: {message}"


class Sms:
    def send(self, message: str) -> str:
        return f"SMS: {message}"


def notify_all(notifiers: list[Notifier], message: str) -> None:
    for n in notifiers:
        print(n.send(message))


notify_all([Email(), Sms()], "Привіт")
print(isinstance(Email(), Notifier), isinstance("текст", Notifier))
`,
  "python-annotations-basic": raw`def average(nums: list[float]) -> float:
    return sum(nums) / len(nums)


def greet(name: str, times: int = 1) -> str:
    return " ".join([f"Привіт, {name}!"] * times)


print(average([1, 2, 3, 4]))
print(greet("Оля", 2))
print(average.__annotations__)
`,
  "python-typed-dict": raw`from typing import TypedDict


class User(TypedDict):
    name: str
    age: int


def find_user(users: list[User], name: str) -> User | None:
    for user in users:
        if user["name"] == name:
            return user
    return None


def describe(user: User | None) -> str:
    if user is None:
        return "Не знайдено"
    return f"{user['name']}, {user['age']} років"


users: list[User] = [{"name": "Оля", "age": 16}, {"name": "Іван", "age": 17}]
print(describe(find_user(users, "Іван")))
print(describe(find_user(users, "Марко")))
`,
  "python-generic-stack": raw`class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

    def peek(self) -> T:
        return self._items[-1]

    def size(self) -> int:
        return len(self._items)


def first[T](items: list[T]) -> T:
    return items[0]


s = Stack[int]()
s.push(1)
s.push(2)
s.push(3)
print(s.peek(), s.pop(), s.size())
print(first(["a", "b"]))
`,
  "python-countdown-iterator": raw`class Countdown:
    def __init__(self, n):
        self.n = n

    def __iter__(self):
        return self

    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1


print(list(Countdown(3)))
print(sum(Countdown(4)))
it = Countdown(2)
print(next(it), next(it))
`,
  "python-fib-generator": raw`from itertools import islice


def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b


print(list(islice(fib(), 10)))
print(sum(x for x in islice(fib(), 20) if x % 2 == 0))
`,
  "python-flatten-pipeline": raw`def flatten(items):
    for item in items:
        if isinstance(item, list):
            yield from flatten(item)
        else:
            yield item


def evens(nums):
    for n in nums:
        if n % 2 == 0:
            yield n


def squares(nums):
    for n in nums:
        yield n * n


print(list(flatten([1, [2, [3, 4]], 5, [[6]]])))
print(sum(squares(evens(range(1, 11)))))
`,
  "python-decorator-counter": raw`def count_calls(func):
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return func(*args, **kwargs)
    wrapper.calls = 0
    return wrapper


@count_calls
def hello():
    return "hi"


print(hello(), hello(), hello())
print(hello.calls)
`,
  "python-repeat-decorator": raw`from functools import wraps


def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = None
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator


@repeat(3)
def greet():
    print("Привіт!")


greet()
print(greet.__name__)
`,
  "python-inspect-params": raw`import inspect


def connect(host, port=80, *args, timeout, **options):
    ...


def required_params(func):
    result = []
    for name, p in inspect.signature(func).parameters.items():
        if p.default is p.empty and p.kind not in (p.VAR_POSITIONAL, p.VAR_KEYWORD):
            result.append(name)
    return result


print(required_params(connect))
print(inspect.signature(connect))
`,
};
