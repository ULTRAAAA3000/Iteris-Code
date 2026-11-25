// Еталонні рішення завдань Python, глава 04 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_04 = {
  "python-account-class": raw`class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            return False
        self.balance -= amount
        return True

    def __str__(self):
        return f"{self.owner}: {self.balance} грн"


acc = Account("Оля", 100)
acc.deposit(50)
print(acc)
print(acc.withdraw(500))
print(acc.withdraw(30))
print(acc.balance)
`,
  "python-class-counter": raw`class Ticket:
    issued = 0

    def __init__(self, owner, row):
        self.owner = owner
        self.row = row
        Ticket.issued += 1

    @classmethod
    def from_string(cls, text):
        owner, row = text.split(":")
        return cls(owner, int(row))

    @staticmethod
    def is_valid_row(row):
        return 1 <= row <= 30

    def __str__(self):
        return f"{self.owner} (ряд {self.row})"


t1 = Ticket("Оля", 5)
t2 = Ticket.from_string("Іван:12")
print(t1, t2)
print(Ticket.issued)
print(Ticket.is_valid_row(31))
`,
  "python-equality": raw`class Money:
    def __init__(self, amount, currency):
        self.amount = amount
        self.currency = currency

    def __eq__(self, other):
        if not isinstance(other, Money):
            return NotImplemented
        return (self.amount, self.currency) == (other.amount, other.currency)

    def __hash__(self):
        return hash((self.amount, self.currency))


a = Money(10, "UAH")
b = Money(10, "UAH")
c = Money(10, "USD")
print(a == b, a is b, a == c)
print(len({a, b, c}))
print(a == 10)
`,
  "python-mutable-args": raw`def add_tag(tag, tags=None):
    if tags is None:
        tags = []
    tags.append(tag)
    return tags


print(add_tag("a"))
print(add_tag("b"))


def with_bonus(scores):
    result = []
    for score in scores:
        result.append(score + 5)
    return result


data = [60, 70]
print(with_bonus(data))
print(data)
`,
  "python-inheritance-composition": raw`class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def describe(self):
        return f"{self.name}: {self.salary}"


class Manager(Employee):
    def __init__(self, name, salary, team):
        super().__init__(name, salary)
        self.team = team

    def describe(self):
        return super().describe() + f" (команда: {len(self.team)})"


class Engine:
    def __init__(self, hp):
        self.hp = hp


class Car:
    def __init__(self, engine):
        self.engine = engine

    def describe(self):
        return f"Авто з двигуном {self.engine.hp} к.с."


print(Employee("Оля", 1000).describe())
print(Manager("Іван", 2000, ["Оля", "Марко"]).describe())
print(Car(Engine(150)).describe())
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
  "python-dataclass-enum": raw`from dataclasses import dataclass, field
from enum import Enum


class Status(Enum):
    NEW = 1
    PAID = 2
    SHIPPED = 3


@dataclass
class Order:
    id: int
    status: Status = Status.NEW
    items: list = field(default_factory=list)


o1 = Order(1)
o2 = Order(2)
o1.items.append("book")
print(o1)
print(o2.items)
print(o1 == Order(1, Status.NEW, ["book"]))
print(Status(2).name, Status.SHIPPED.value)
`,
  "python-factory-registry": raw`class Circle:
    def __init__(self, r):
        self.r = r

    def area(self):
        return round(3.14159 * self.r ** 2, 2)


class Square:
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2


REGISTRY = {"circle": Circle, "square": Square}


def make_shape(kind, *args):
    if kind not in REGISTRY:
        raise ValueError(f"Невідомий тип: {kind}")
    return REGISTRY[kind](*args)


print(make_shape("circle", 2).area())
print(make_shape("square", 3).area())
print(type(make_shape("square", 1)).__name__)
`,
  "python-slots-weakref": raw`import weakref


class Point:
    __slots__ = ("x", "y")

    def __init__(self, x, y):
        self.x = x
        self.y = y


class Box:
    pass


p = Point(3, 4)
print(p.x + p.y)
print(hasattr(p, "__dict__"))

box = Box()
ref = weakref.ref(box)
print(ref() is box)
del box
print(ref())
`,
};
