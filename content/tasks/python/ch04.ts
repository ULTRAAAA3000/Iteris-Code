// Практичні завдання глави «Класи й об'єкти» (уроки 31–39). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04: readonly RemoteTask[] = [
  {
    ...base, id: "python-account-class", lesson: "python/31", xp: 40,
    title: "Клас банківського рахунку",
    context: "Клас об'єднує дані й поведінку: рахунок знає свій баланс і сам стежить, щоб він не пішов у мінус. Так проєктують користувачів, кошики, замовлення.",
    brief: [
      "Опишіть клас <code>Account</code>: конструктор <code>__init__(self, owner, balance=0)</code>, методи <code>deposit(amount)</code> і <code>withdraw(amount)</code>.",
      "Якщо коштів не вистачає, <code>withdraw</code> нічого не знімає й повертає <code>False</code>, інакше знімає й повертає <code>True</code>. Метод <code>__str__</code> повертає рядок виду <code>Оля: 150 грн</code>.",
    ],
    starter: raw`# TODO: клас Account з __init__, deposit, withdraw (True/False) і __str__


acc = Account("Оля", 100)
acc.deposit(50)
print(acc)
print(acc.withdraw(500))
print(acc.withdraw(30))
print(acc.balance)
`,
    checks: [
      { on: "stdout", name: "Рахунок виводиться через __str__", has: "Оля: 150 грн", hint: "У __str__ поверніть f\"{self.owner}: {self.balance} грн\"." },
      { on: "stdout", name: "Недостатньо коштів: False", has: "Оля: 150 грн\nFalse\n", hint: "Якщо amount > self.balance, поверніть False, не змінюючи баланс." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Оля: 150 грн\nFalse\nTrue\n120", hint: "Після успішного зняття 30 залишається 120." },
      { on: "source", name: "Описано клас Account", matches: "class\\s+Account\\b", hint: "Почніть із class Account:." },
      { on: "source", name: "Є __init__ і __str__", matches: "def\\s+__init__[\\s\\S]*def\\s+__str__|def\\s+__str__[\\s\\S]*def\\s+__init__", hint: "Опишіть обидва спеціальні методи." },
    ],
  },
  {
    ...base, id: "python-class-counter", lesson: "python/32", xp: 30,
    title: "Квитки: лічильник класу, classmethod і staticmethod",
    context: "Лічильник створених об'єктів живе в атрибуті класу, альтернативний конструктор — у @classmethod, а перевірка без доступу до об'єкта — у @staticmethod. Так розкладають по поличках різні види логіки.",
    brief: [
      "У <code>__init__</code> збережіть <code>owner</code> і <code>row</code> та збільште атрибут класу <code>Ticket.issued</code>.",
      "Додайте <code>@classmethod from_string(cls, text)</code> (з рядка <code>\"Іван:12\"</code>) і <code>@staticmethod is_valid_row(row)</code>, яка повертає <code>True</code> для рядів від 1 до 30.",
    ],
    starter: raw`class Ticket:
    issued = 0                      # скільки квитків створено

    def __init__(self, owner, row):
        # TODO: збережіть owner і row, збільште лічильник Ticket.issued
        pass

    # TODO: @classmethod from_string(cls, text): "Іван:12" -> Ticket("Іван", 12)

    # TODO: @staticmethod is_valid_row(row): True, якщо 1 <= row <= 30

    def __str__(self):
        return f"{self.owner} (ряд {self.row})"


t1 = Ticket("Оля", 5)
t2 = Ticket.from_string("Іван:12")
print(t1, t2)
print(Ticket.issued)
print(Ticket.is_valid_row(31))
`,
    checks: [
      { on: "stdout", name: "Квитки створено й виведено", has: "Оля (ряд 5) Іван (ряд 12)", hint: "from_string розбиває текст за двокрапкою й викликає cls(owner, int(row))." },
      { on: "stdout", name: "Лічильник класу: 2", has: "\n2\n", hint: "У __init__ додайте Ticket.issued += 1." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Оля (ряд 5) Іван (ряд 12)\n2\nFalse", hint: "Ряд 31 недопустимий, тож перевірка має повернути False." },
      { on: "source", name: "Є @classmethod", has: "@classmethod", hint: "Позначте from_string декоратором @classmethod." },
      { on: "source", name: "Є @staticmethod", has: "@staticmethod", hint: "Позначте is_valid_row декоратором @staticmethod." },
    ],
  },
  {
    ...base, id: "python-equality", lesson: "python/33", xp: 30,
    title: "Рівність і хеш для грошових сум",
    context: "Дві суми по 10 гривень — одна й та сама сума, хоча це різні об'єкти. Власні __eq__ і __hash__ навчають Python порівнювати такі об'єкти за змістом і складати їх у множини.",
    brief: [
      "Допишіть <code>__eq__</code>: суми рівні, якщо збігаються <code>amount</code> і <code>currency</code>; для об'єктів іншого типу поверніть <code>NotImplemented</code>.",
      "Допишіть <code>__hash__</code> за тими самими полями, щоб однакові суми зливалися в множині.",
    ],
    starter: raw`class Money:
    def __init__(self, amount, currency):
        self.amount = amount
        self.currency = currency

    # TODO: __eq__ за amount і currency, для інших типів - NotImplemented
    # TODO: __hash__ за тими самими полями


a = Money(10, "UAH")
b = Money(10, "UAH")
c = Money(10, "USD")
print(a == b, a is b, a == c)
print(len({a, b, c}))
print(a == 10)
`,
    checks: [
      { on: "stdout", name: "Рівні за змістом, але різні об'єкти", has: "True False False", hint: "a == b має бути True, a is b — False, a == c — False." },
      { on: "stdout", name: "У множині дві різні суми", has: "\n2\n", hint: "Описавши __eq__, додайте __hash__: hash((self.amount, self.currency))." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "True False False\n2\nFalse", hint: "Порівняння з числом 10 має дати False без помилки." },
      { on: "source", name: "Описано __eq__ і __hash__", matches: "def\\s+__eq__[\\s\\S]*def\\s+__hash__|def\\s+__hash__[\\s\\S]*def\\s+__eq__", hint: "Потрібні обидва методи." },
      { on: "source", name: "Чужі типи обробляються через NotImplemented", has: "NotImplemented", hint: "Якщо other не Money, поверніть NotImplemented." },
    ],
  },
  {
    ...base, id: "python-mutable-args", lesson: "python/34", xp: 30,
    title: "Змінювані аргументи: виправлення двох багів",
    context: "Спільний список у значенні за замовчуванням і функція, що непомітно змінює вхідні дані, — два найчастіші баги зі змінюваними об'єктами. Їх виправлення потребує розуміння того, що саме передається у функцію.",
    brief: [
      "Виправте <code>add_tag</code>: без другого аргументу кожен виклик має починати з нового порожнього списку (використайте <code>None</code>).",
      "Виправте <code>with_bonus</code>: вона має повертати <b>новий</b> список із оцінками, збільшеними на 5, і не змінювати вхідний.",
    ],
    starter: raw`def add_tag(tag, tags=[]):
    tags.append(tag)
    return tags


print(add_tag("a"))
print(add_tag("b"))          # має бути ['b'], а не ['a', 'b']


def with_bonus(scores):
    for i in range(len(scores)):
        scores[i] += 5
    return scores


data = [60, 70]
print(with_bonus(data))      # [65, 75]
print(data)                  # має лишитися [60, 70]
`,
    checks: [
      { on: "stdout", name: "Другий виклик починає з нового списку", has: "['a']\n['b']\n", hint: "Параметр tags=None і всередині: if tags is None: tags = []." },
      { on: "stdout", name: "Вхідний список не змінено", has: "[65, 75]\n[60, 70]", hint: "Створіть новий список (наприклад, у циклі з append) і поверніть його." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "['a']\n['b']\n[65, 75]\n[60, 70]", hint: "Мають бути чотири рядки." },
      { on: "source", name: "Немає змінюваного значення за замовчуванням", matches: "tags\\s*=\\s*\\[\\]\\s*\\)", not: true, hint: "Замініть tags=[] на tags=None." },
      { on: "source", name: "Використано None як маркер", has: "is None", hint: "Перевіряйте if tags is None." },
    ],
  },
  {
    ...base, id: "python-inheritance-composition", lesson: "python/35", xp: 35,
    title: "Менеджер як нащадок і двигун у складі автомобіля",
    context: "Менеджер є різновидом працівника, тож успадковує його, а автомобіль не є двигуном, а має двигун, тож використовує композицію. Правильний вибір між ними робить код гнучким.",
    brief: [
      "Опишіть <code>Manager(Employee)</code>: конструктор із додатковим параметром <code>team</code> (викличте <code>super().__init__</code>) і <code>describe()</code>, що додає до батьківського опису <code> (команда: N)</code>.",
      "Опишіть <code>Car</code>, що зберігає об'єкт <code>Engine</code> і повертає з <code>describe()</code> рядок <code>Авто з двигуном 150 к.с.</code>.",
    ],
    starter: raw`class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def describe(self):
        return f"{self.name}: {self.salary}"


# TODO: class Manager(Employee): __init__(self, name, salary, team) із super().__init__,
#       describe() додає " (команда: N)" (N - len(team)), використайте super().describe()


class Engine:
    def __init__(self, hp):
        self.hp = hp


# TODO: class Car: __init__(self, engine) зберігає self.engine,
#       describe() повертає "Авто з двигуном 150 к.с."


print(Employee("Оля", 1000).describe())
print(Manager("Іван", 2000, ["Оля", "Марко"]).describe())
print(Car(Engine(150)).describe())
`,
    checks: [
      { on: "stdout", name: "Опис менеджера з командою", has: "Іван: 2000 (команда: 2)", hint: "describe() менеджера: super().describe() + f\" (команда: {len(self.team)})\"." },
      { on: "stdout", name: "Опис автомобіля", has: "Авто з двигуном 150 к.с.", hint: "Використайте self.engine.hp у f-рядку." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Оля: 1000\nІван: 2000 (команда: 2)\nАвто з двигуном 150 к.с.", hint: "Мають бути три рядки." },
      { on: "source", name: "Manager успадковує Employee", matches: "class\\s+Manager\\s*\\(\\s*Employee\\s*\\)", hint: "Напишіть class Manager(Employee):." },
      { on: "source", name: "Викликано super()", matches: "super\\(\\)", hint: "Скористайтеся super().__init__(...) і super().describe()." },
      { on: "source", name: "Двигун зберігається в автомобілі", has: "self.engine", hint: "Збережіть двигун як атрибут: self.engine = engine." },
    ],
  },
  {
    ...base, id: "python-shapes-property", lesson: "python/36", xp: 40,
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
      { on: "stdout", name: "Коло: 12.57", has: "Коло: 12.57", hint: "area кола: round(math.pi * self.r ** 2, 2)." },
      { on: "stdout", name: "Прямокутник: 12", has: "Прямокутник: 12", hint: "area прямокутника: self.w * self.h." },
      { on: "stdout", name: "100 °C це 212.0 °F", has: "212.0", hint: "Властивість fahrenheit повертає self.celsius * 9 / 5 + 32; її читають без дужок." },
      { on: "source", name: "Нащадки успадковують Shape", matches: "class\\s+Circle\\s*\\(\\s*Shape\\s*\\)[\\s\\S]*class\\s+Rectangle\\s*\\(\\s*Shape\\s*\\)", hint: "Напишіть class Circle(Shape): і class Rectangle(Shape):." },
      { on: "source", name: "Використано @property", has: "@property", hint: "Над методом fahrenheit поставте декоратор @property." },
    ],
  },
  {
    ...base, id: "python-dataclass-enum", lesson: "python/37", xp: 30,
    title: "Замовлення: dataclass і Enum",
    context: "Запис із кількох полів і набір допустимих станів — типова модель даних. Dataclass і Enum описують її кількома рядками, а решту (конструктор, вивід, порівняння) беруть на себе.",
    brief: [
      "Опишіть <code>Status(Enum)</code> з елементами <code>NEW = 1</code>, <code>PAID = 2</code>, <code>SHIPPED = 3</code> і dataclass <code>Order</code> із полями <code>id: int</code>, <code>status: Status = Status.NEW</code>, <code>items: list = field(default_factory=list)</code>.",
      "Перевірте виводом: два замовлення мають окремі списки товарів, однакові замовлення рівні, а <code>Status(2).name</code> дає <code>PAID</code>.",
    ],
    starter: raw`from dataclasses import dataclass, field
from enum import Enum

# TODO: class Status(Enum): NEW = 1, PAID = 2, SHIPPED = 3
# TODO: @dataclass class Order: id, status (за замовчуванням Status.NEW), items (default_factory=list)


o1 = Order(1)
o2 = Order(2)
o1.items.append("book")
print(o1)
print(o2.items)
print(o1 == Order(1, Status.NEW, ["book"]))
print(Status(2).name, Status.SHIPPED.value)
`,
    checks: [
      { on: "stdout", name: "Виведення dataclass", has: "Order(id=1, status=<Status.NEW: 1>, items=['book'])", hint: "Dataclass сам створює __repr__ з іменами полів." },
      { on: "stdout", name: "Списки товарів незалежні", has: "\n[]\n", hint: "Використайте field(default_factory=list), а не items: list = []." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Order(id=1, status=<Status.NEW: 1>, items=['book'])\n[]\nTrue\nPAID 3", hint: "Два однакові замовлення рівні завдяки __eq__ від dataclass." },
      { on: "source", name: "Використано @dataclass і Enum", matches: "@dataclass[\\s\\S]*Enum|Enum[\\s\\S]*@dataclass", hint: "Потрібні обидва: декоратор @dataclass і клас, що успадковує Enum." },
      { on: "source", name: "Використано default_factory", has: "default_factory", hint: "Для списку за замовчуванням потрібна фабрика." },
    ],
  },
  {
    ...base, id: "python-factory-registry", lesson: "python/38", xp: 35,
    title: "Фабрика фігур із реєстром класів",
    context: "Фабрика створює об'єкт за назвою, а реєстр у словнику замінює довгий if/elif. Додати новий тип можна одним рядком, не чіпаючи логіку створення.",
    brief: [
      "Заповніть <code>REGISTRY</code> словником «назва: клас» для <code>circle</code> і <code>square</code>.",
      "Напишіть <code>make_shape(kind, *args)</code>, що створює об'єкт через реєстр. Невідомий тип має викликати <code>ValueError</code> із зрозумілим текстом.",
    ],
    starter: raw`class Circle:
    def __init__(self, r):
        self.r = r

    def area(self):
        return round(3.14159 * self.r ** 2, 2)


class Square:
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2


REGISTRY = {}   # TODO: {"circle": Circle, "square": Square}


def make_shape(kind, *args):
    # TODO: створіть об'єкт через REGISTRY; для невідомого kind - raise ValueError
    return None


print(make_shape("circle", 2).area())
print(make_shape("square", 3).area())
print(type(make_shape("square", 1)).__name__)
`,
    checks: [
      { on: "stdout", name: "Площа кола: 12.57", has: "12.57", hint: "REGISTRY[kind](*args) викликає клас із переданими аргументами." },
      { on: "stdout", name: "Площа квадрата: 9", has: "12.57\n9\n", hint: "Для квадрата REGISTRY[\"square\"] має бути класом Square." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "12.57\n9\nSquare", hint: "Третій рядок — назва класу створеного об'єкта." },
      { on: "source", name: "Використано реєстр", matches: "REGISTRY\\[", hint: "Звертайтеся до класу через REGISTRY[kind]." },
      { on: "source", name: "Невідомий тип викликає ValueError", has: "raise ValueError", hint: "Якщо kind немає в реєстрі, кидайте raise ValueError(...)." },
    ],
  },
  {
    ...base, id: "python-slots-weakref", lesson: "python/39", xp: 35,
    title: "__slots__ і слабке посилання",
    context: "Клас із __slots__ не має словника атрибутів і економить пам'ять, а слабке посилання не заважає об'єкту зникнути. Вони потрібні в кешах і програмах із мільйонами малих об'єктів.",
    brief: [
      "Опишіть клас <code>Point</code> із <code>__slots__ = (\"x\", \"y\")</code> і конструктором <code>__init__(self, x, y)</code>.",
      "Решта коду вже написана: вона перевіряє відсутність <code>__dict__</code> та поведінку слабкого посилання після видалення об'єкта.",
    ],
    starter: raw`import weakref

# TODO: клас Point з __slots__ = ("x", "y") і __init__(self, x, y)


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
    checks: [
      { on: "stdout", name: "Сума координат: 7", has: "7\n", hint: "Збережіть x і y у self.x та self.y." },
      { on: "stdout", name: "У Point немає __dict__", has: "7\nFalse", hint: "__slots__ вимикає словник атрибутів." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "7\nFalse\nTrue\nNone", hint: "Після видалення об'єкта слабке посилання повертає None." },
      { on: "source", name: "Оголошено __slots__", matches: "__slots__\\s*=\\s*\\(\\s*[\"']x[\"']\\s*,\\s*[\"']y[\"']\\s*\\)", hint: "Напишіть __slots__ = (\"x\", \"y\") усередині класу Point." },
    ],
  },
];
