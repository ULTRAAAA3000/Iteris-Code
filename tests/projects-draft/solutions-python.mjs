// Еталонні розв'язки чернеток проєктів Python: повний код користувача (без harness).
export default {
  "py-gradebook": `def add_grade(book, student, grade):
    if type(grade) is not int or not 1 <= grade <= 12:
        raise ValueError("оцінка має бути цілим числом від 1 до 12")
    book.setdefault(student, []).append(grade)


def average(book, student):
    grades = book.get(student)
    if not grades:
        raise ValueError("немає оцінок для учня " + str(student))
    return round(sum(grades) / len(grades), 2)


def best_student(book):
    if not book:
        return None
    return min(book, key=lambda s: (-average(book, s), s))


def report(book):
    if not book:
        return "Журнал порожній"
    return "\\n".join(f"{name}: {average(book, name):.2f}" for name in sorted(book))
`,

  "py-bank": `class InsufficientFundsError(Exception):
    def __init__(self, shortage):
        super().__init__("не вистачає " + str(shortage))
        self.shortage = shortage


class Account:
    def __init__(self, owner, balance=0):
        if balance < 0:
            raise ValueError("початковий баланс не може бути від'ємним")
        self.owner = owner
        self._balance = balance
        self._history = []

    @property
    def balance(self):
        return self._balance

    @property
    def history(self):
        return list(self._history)

    def _check(self, amount):
        if type(amount) not in (int, float) or amount <= 0:
            raise ValueError("сума має бути числом більше нуля")

    def deposit(self, amount):
        self._check(amount)
        self._balance += amount
        self._history.append(("deposit", amount))
        return self._balance

    def withdraw(self, amount):
        self._check(amount)
        if amount > self._balance:
            raise InsufficientFundsError(amount - self._balance)
        self._balance -= amount
        self._history.append(("withdraw", amount))
        return self._balance

    def transfer(self, other, amount):
        self._check(amount)
        if amount > self._balance:
            raise InsufficientFundsError(amount - self._balance)
        self._balance -= amount
        other._balance += amount
        self._history.append(("transfer_out", amount))
        other._history.append(("transfer_in", amount))
`,

  "py-inventory": `import json


def _check_qty(qty):
    if type(qty) is not int or qty <= 0:
        raise ValueError("кількість має бути додатним цілим")


def add_stock(stock, name, qty):
    _check_qty(qty)
    stock[name] = stock.get(name, 0) + qty


def remove_stock(stock, name, qty):
    _check_qty(qty)
    if name not in stock:
        raise ValueError("немає товару " + str(name))
    if qty > stock[name]:
        raise ValueError("на складі менше, ніж потрібно списати")
    stock[name] -= qty
    if stock[name] == 0:
        del stock[name]


def low_stock(stock, threshold):
    return sorted([n for n, q in stock.items() if q < threshold])


def sorted_report(stock):
    return sorted(stock.items(), key=lambda p: (-p[1], p[0]))


def to_json(stock):
    return json.dumps(stock, sort_keys=True, ensure_ascii=False)


def from_json(text):
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("очікувався об'єкт JSON")
    for qty in data.values():
        _check_qty(qty)
    return data
`,
};
