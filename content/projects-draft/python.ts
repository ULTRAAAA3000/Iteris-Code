// ЧЕРНЕТКИ проєктів за ТЗ для Python. Не підключені до сайту (див. types.ts).
import type { ProgramProject } from "./types.ts";

// Спільний початок harness: помічники, що друкують «R<n> PASS» або «R<n> FAIL: причина» і ніколи не валять весь запуск.
const HELPERS = `def _r(rid, fn):
    try:
        fn()
        print(rid + " PASS")
    except AssertionError as e:
        print(rid + " FAIL: " + str(e).replace(chr(10), " "))
    except BaseException as e:
        print(rid + " FAIL: помилка " + type(e).__name__ + ": " + str(e).replace(chr(10), " "))

def _eq(got, exp):
    if got != exp:
        raise AssertionError("очікувалось " + repr(exp) + ", отримано " + repr(got))

def _raises(exc, fn, what):
    try:
        fn()
    except exc:
        return
    except Exception as e:
        raise AssertionError(what + ": очікувалась " + exc.__name__ + ", отримано " + type(e).__name__)
    raise AssertionError(what + ": очікувалась " + exc.__name__ + ", але помилки не було")
`;

const gradebookHarness = `${HELPERS}
def _book():
    return {}

def _t1():
    b = _book()
    add_grade(b, "Марія", 10)
    _eq(b, {"Марія": [10]})
    add_grade(b, "Марія", 12)
    add_grade(b, "Іван", 7)
    _eq(b, {"Марія": [10, 12], "Іван": [7]})

def _t2():
    b = _book()
    for bad in (0, 13, -3, 100):
        _raises(ValueError, lambda: add_grade(b, "Марія", bad), "оцінка " + repr(bad))
    _eq(b, {})
    add_grade(b, "Марія", 1)
    add_grade(b, "Марія", 12)
    _eq(b, {"Марія": [1, 12]})

def _t3():
    b = _book()
    for bad in ("10", 7.5, None, True):
        _raises(ValueError, lambda: add_grade(b, "Марія", bad), "оцінка " + repr(bad))
    _eq(b, {})

def _t4():
    b = {"А": [10, 11], "Б": [10, 11, 11], "В": [9]}
    _eq(average(b, "А"), 10.5)
    _eq(average(b, "Б"), 10.67)
    _eq(average(b, "В"), 9)

def _t5():
    _raises(ValueError, lambda: average({"А": [5]}, "Невідомий"), "невідомий учень")
    _raises(ValueError, lambda: average({"А": []}, "А"), "учень без оцінок")

def _t6():
    b = {"Олена": [9, 10], "Петро": [12, 11], "Ірина": [8]}
    _eq(best_student(b), "Петро")

def _t7():
    _eq(best_student({}), None)
    _eq(best_student({"Максим": [10], "Анна": [10], "Зоя": [9]}), "Анна")

def _t8():
    b = {"Петро": [12, 11], "Анна": [10, 11, 11], "Богдан": [9]}
    _eq(report(b), "Анна: 10.67" + chr(10) + "Богдан: 9.00" + chr(10) + "Петро: 11.50")
    _eq(report({}), "Журнал порожній")

_r("R1", _t1)
_r("R2", _t2)
_r("R3", _t3)
_r("R4", _t4)
_r("R5", _t5)
_r("R6", _t6)
_r("R7", _t7)
_r("R8", _t8)
`;

const bankHarness = `${HELPERS}
def _t1():
    a = Account("Ія")
    _eq(a.owner, "Ія")
    _eq(a.balance, 0)
    b = Account("Остап", 250)
    _eq(b.balance, 250)
    _raises(ValueError, lambda: Account("Х", -1), "від'ємний початковий баланс")

def _t2():
    a = Account("Ія", 50)
    _raises(AttributeError, lambda: setattr(a, "balance", 1000), "присвоєння balance")
    _eq(a.balance, 50)

def _t3():
    a = Account("Ія", 100)
    _eq(a.deposit(50), 150)
    _eq(a.balance, 150)
    a.deposit(0.5)
    _eq(a.balance, 150.5)

def _t4():
    a = Account("Ія", 100)
    for bad in (0, -10, "50", None):
        _raises(ValueError, lambda: a.deposit(bad), "внесок " + repr(bad))
        _raises(ValueError, lambda: a.withdraw(bad), "зняття " + repr(bad))
    _eq(a.balance, 100)

def _t5():
    a = Account("Ія", 100)
    _eq(a.withdraw(30), 70)
    _eq(a.balance, 70)
    _eq(a.withdraw(70), 0)
    _eq(a.balance, 0)

def _t6():
    a = Account("Ія", 100)
    try:
        a.withdraw(130)
    except InsufficientFundsError as e:
        _eq(e.shortage, 30)
    except Exception as e:
        raise AssertionError("очікувалась InsufficientFundsError, отримано " + type(e).__name__)
    else:
        raise AssertionError("зняття більше за баланс не викликало InsufficientFundsError")
    _eq(a.balance, 100)
    if not issubclass(InsufficientFundsError, Exception):
        raise AssertionError("InsufficientFundsError має успадковувати Exception")
    if issubclass(InsufficientFundsError, ValueError):
        raise AssertionError("InsufficientFundsError не має бути підкласом ValueError")

def _t7():
    a = Account("Ія", 100)
    a.deposit(50)
    a.withdraw(30)
    try:
        a.withdraw(1000)
    except Exception:
        pass
    try:
        a.deposit(-5)
    except Exception:
        pass
    _eq(a.history, [("deposit", 50), ("withdraw", 30)])
    h = a.history
    h.append(("hack", 1))
    _eq(a.history, [("deposit", 50), ("withdraw", 30)])
    _eq(Account("Нова").history, [])

def _t8():
    a = Account("А", 100)
    b = Account("Б", 20)
    a.transfer(b, 40)
    _eq(a.balance, 60)
    _eq(b.balance, 60)
    _eq(a.history, [("transfer_out", 40)])
    _eq(b.history, [("transfer_in", 40)])

def _t9():
    a = Account("А", 100)
    b = Account("Б", 20)
    _raises(InsufficientFundsError, lambda: a.transfer(b, 500), "переказ більше за баланс")
    _eq((a.balance, b.balance), (100, 20))
    _eq((a.history, b.history), ([], []))
    _raises(ValueError, lambda: a.transfer(b, 0), "переказ нуля")
    _eq((a.balance, b.balance), (100, 20))

_r("R1", _t1)
_r("R2", _t2)
_r("R3", _t3)
_r("R4", _t4)
_r("R5", _t5)
_r("R6", _t6)
_r("R7", _t7)
_r("R8", _t8)
_r("R9", _t9)
`;

const inventoryHarness = `${HELPERS}
def _t1():
    s = {}
    add_stock(s, "болт", 10)
    _eq(s, {"болт": 10})
    add_stock(s, "болт", 5)
    add_stock(s, "гайка", 3)
    _eq(s, {"болт": 15, "гайка": 3})

def _t2():
    s = {"болт": 1}
    for bad in (0, -5, "3", 2.5):
        _raises(ValueError, lambda: add_stock(s, "гайка", bad), "кількість " + repr(bad))
    _eq(s, {"болт": 1})

def _t3():
    s = {"болт": 10, "гайка": 3}
    remove_stock(s, "болт", 4)
    _eq(s, {"болт": 6, "гайка": 3})
    remove_stock(s, "гайка", 3)
    _eq(s, {"болт": 6})

def _t4():
    s = {"болт": 5}
    _raises(ValueError, lambda: remove_stock(s, "шайба", 1), "невідомий товар")
    _raises(ValueError, lambda: remove_stock(s, "болт", 6), "більше, ніж є")
    _raises(ValueError, lambda: remove_stock(s, "болт", 0), "нульова кількість")
    _raises(ValueError, lambda: remove_stock(s, "болт", -1), "від'ємна кількість")
    _eq(s, {"болт": 5})

def _t5():
    s = {"гайка": 3, "болт": 10, "шайба": 5, "дюбель": 2}
    _eq(low_stock(s, 5), ["гайка", "дюбель"])
    _eq(low_stock(s, 100), ["болт", "гайка", "дюбель", "шайба"])
    _eq(low_stock(s, 1), [])
    _eq(low_stock({}, 5), [])

def _t6():
    s = {"гайка": 3, "болт": 10, "шайба": 3, "дюбель": 7}
    _eq(sorted_report(s), [("болт", 10), ("дюбель", 7), ("гайка", 3), ("шайба", 3)])
    _eq(sorted_report({}), [])

def _t7():
    _eq(to_json({"b": 1, "a": 2}), '{"a": 2, "b": 1}')
    _eq(to_json({"болт": 4}), '{"болт": 4}')
    _eq(to_json({}), "{}")

def _t8():
    s = {"болт": 10, "гайка": 3, "шайба": 7}
    text = to_json(s)
    back = from_json(text)
    _eq(back, s)
    if not isinstance(back, dict):
        raise AssertionError("from_json має повертати dict")
    _eq(from_json("{}"), {})

def _t9():
    for bad in ("це не json", "[1, 2]", '{"a": -1}', '{"a": "x"}', '{"a": 0}', '{"a": 1.5}'):
        _raises(ValueError, lambda: from_json(bad), "вхід " + repr(bad))

_r("R1", _t1)
_r("R2", _t2)
_r("R3", _t3)
_r("R4", _t4)
_r("R5", _t5)
_r("R6", _t6)
_r("R7", _t7)
_r("R8", _t8)
_r("R9", _t9)
`;

export const PROJECTS: readonly ProgramProject[] = [
  {
    id: "py-gradebook",
    lang: "python",
    lesson: "python/10",
    title: "Проєкт: журнал оцінок",
    xp: 60,
    context:
      "Майже кожна програма зберігає дані у словниках і списках та перевіряє їх на вході: оцінки, замовлення, показники. Тут ви потренуєтеся поєднувати dict, list, функції та помилки ValueError так, як це роблять у справжніх облікових системах.",
    brief: [
      "Шкільний вчитель просить маленьку бібліотеку для журналу оцінок. Журнал це звичайний словник: ключ — ім'я учня, значення — список його оцінок за 12-бальною шкалою. Потрібні функції, що додають оцінки, рахують середнє, знаходять найкращого учня та друкують звіт.",
      "Нижче вимоги R1–R8. Натискайте «Перевірити проєкт»: ми запустимо вашу програму, виконаємо дії над журналом (додамо оцінки, передамо некоректні дані, попросимо звіт) і перевіримо кожну вимогу R1–R8.",
    ],
    contract: [
      "<code>add_grade(book, student, grade)</code> — додає оцінку учневі, нічого не повертає. <code>book</code> — словник <code>{ім'я: [оцінки]}</code>.",
      "<code>average(book, student)</code> — повертає середнє, округлене до 2 знаків (<code>round(x, 2)</code>).",
      "<code>best_student(book)</code> — повертає ім'я учня з найвищим середнім або <code>None</code>, якщо журнал порожній.",
      "<code>report(book)</code> — повертає один рядок: по рядку на учня у форматі <code>Ім'я: 10.50</code> (рівно 2 знаки після крапки), рядки з'єднані символом нового рядка й відсортовані за іменем.",
      "Усі помилки даних — це <code>ValueError</code>. Оцінка коректна, лише якщо це <code>int</code> (не <code>bool</code>) від 1 до 12.",
    ],
    requirements: [
      {
        id: "R1",
        text: "<code>add_grade</code> створює учня, якого ще немає в журналі, і додає оцінку до списку. Повторні виклики дописують оцінки в кінець: після <code>add_grade(b, \"Марія\", 10)</code> та <code>add_grade(b, \"Марія\", 12)</code> маємо <code>{\"Марія\": [10, 12]}</code>.",
        hint: "Скористайтеся <code>book.setdefault(student, []).append(grade)</code> або перевіркою <code>if student not in book</code>.",
      },
      {
        id: "R2",
        text: "Оцінка поза діапазоном 1–12 (наприклад 0, 13, -3) викликає <code>ValueError</code>, а журнал після цього не змінюється (учень навіть не створюється). Оцінки 1 і 12 допустимі.",
        hint: "Перевіряйте оцінку <b>до</b> того, як чіпати словник. Межі включно: <code>1 &lt;= grade &lt;= 12</code>.",
      },
      {
        id: "R3",
        text: "Оцінка не того типу (рядок <code>\"10\"</code>, дріб <code>7.5</code>, <code>None</code>, <code>True</code>) теж викликає <code>ValueError</code>, журнал не змінюється.",
        hint: "<code>type(grade) is not int</code> відсіює і рядки, і дроби, і <code>True</code> (адже <code>bool</code> — окремий тип).",
      },
      {
        id: "R4",
        text: "<code>average</code> повертає середнє, округлене до 2 знаків: для <code>[10, 11]</code> це <code>10.5</code>, для <code>[10, 11, 11]</code> це <code>10.67</code>, для <code>[9]</code> це <code>9</code>.",
        hint: "<code>round(sum(grades) / len(grades), 2)</code>.",
      },
      {
        id: "R5",
        text: "<code>average</code> для учня, якого немає в журналі, або в якого порожній список оцінок, викликає <code>ValueError</code>.",
        hint: "Перевірте <code>student not in book</code> та порожній список, інакше отримаєте KeyError чи ділення на нуль замість ValueError.",
      },
      {
        id: "R6",
        text: "<code>best_student</code> повертає ім'я учня з найвищим середнім: для <code>{\"Олена\": [9, 10], \"Петро\": [12, 11], \"Ірина\": [8]}</code> це <code>\"Петро\"</code>.",
        hint: "<code>max(book, key=lambda s: average(book, s))</code> або власний цикл із запам'ятовуванням кращого.",
      },
      {
        id: "R7",
        text: "Для порожнього журналу <code>best_student</code> повертає <code>None</code>. Якщо в кількох учнів однакове найвище середнє, повертається той, чиє ім'я йде першим за алфавітом (серед <code>Максим</code> і <code>Анна</code> з десятками — <code>Анна</code>).",
        hint: "Для рівних середніх відсортуйте за парою: <code>min(book, key=lambda s: (-average(book, s), s))</code>.",
      },
      {
        id: "R8",
        text: "<code>report</code> повертає рядки <code>Ім'я: середнє</code> з двома знаками після крапки, відсортовані за іменем: <code>\"Анна: 10.67\"</code>, <code>\"Богдан: 9.00\"</code>, <code>\"Петро: 11.50\"</code> через перенос рядка. Для порожнього журналу повертається <code>\"Журнал порожній\"</code>.",
        hint: "Формат із двома знаками: <code>f\"{name}: {avg:.2f}\"</code>. Рядки збирайте через <code>\"\\n\".join(...)</code>, імена беріть із <code>sorted(book)</code>.",
      },
    ],
    starter: `# Журнал оцінок: словник {ім'я: [оцінки]}, шкала 1–12.


def add_grade(book, student, grade):
    # TODO: перевірте, що grade — це int (не bool) від 1 до 12, інакше raise ValueError
    # TODO: додайте оцінку у список учня (створіть учня, якщо його ще немає)
    pass


def average(book, student):
    # TODO: ValueError, якщо учня немає або в нього немає оцінок
    # TODO: поверніть середнє, округлене до 2 знаків
    return None


def best_student(book):
    # TODO: ім'я учня з найвищим середнім; None, якщо журнал порожній
    # TODO: при рівності — перше за алфавітом
    return None


def report(book):
    # TODO: рядки "Ім'я: 10.50" за алфавітом, з'єднані через перенос рядка
    # TODO: для порожнього журналу — "Журнал порожній"
    return None
`,
    harness: gradebookHarness,
  },
  {
    id: "py-bank",
    lang: "python",
    lesson: "python/17",
    title: "Проєкт: банківський рахунок",
    xp: 75,
    context:
      "Клас, що охороняє власний стан, є основою майже будь-якої бізнес-логіки: гроші, склад, кошик. Власні винятки та властивість лише для читання не дозволяють іншому коду зламати інваріанти, а саме цього вимагають від розробників у фінансових сервісах.",
    brief: [
      "Невеликий банк просить модель рахунку. Рахунок має власника та баланс, дозволяє вносити й знімати гроші, переказувати їх на інший рахунок і пам'ятає історію операцій. Головне правило: баланс не можна змінити нікуди, крім як через операції, а зняти більше, ніж є на рахунку, не можна.",
      "Нижче вимоги R1–R9. Натискайте «Перевірити проєкт»: ми запустимо вашу програму, створимо рахунки, виконаємо операції, у тому числі некоректні, і перевіримо кожну вимогу R1–R9.",
    ],
    contract: [
      "<code>class InsufficientFundsError(Exception)</code> — помилка нестачі коштів; має атрибут <code>shortage</code> — скільки не вистачає.",
      "<code>Account(owner, balance=0)</code> — атрибут <code>owner</code>, властивість <code>balance</code> (лише читання), властивість <code>history</code>.",
      "<code>deposit(amount)</code> та <code>withdraw(amount)</code> повертають новий баланс. Сума коректна, якщо це число (<code>int</code> або <code>float</code>, не <code>bool</code>) більше нуля, інакше <code>ValueError</code>.",
      "<code>transfer(other, amount)</code> знімає гроші з цього рахунку й зараховує на <code>other</code>.",
      "<code>history</code> повертає <b>нову копію</b> списку кортежів <code>(тип, сума)</code>: <code>\"deposit\"</code>, <code>\"withdraw\"</code>, <code>\"transfer_out\"</code>, <code>\"transfer_in\"</code>. Невдалі операції в історію не потрапляють.",
    ],
    requirements: [
      {
        id: "R1",
        text: "<code>Account(\"Ія\")</code> має <code>owner == \"Ія\"</code> та баланс <code>0</code>; <code>Account(\"Остап\", 250)</code> починає з 250. Від'ємний початковий баланс викликає <code>ValueError</code>.",
        hint: "Збережіть значення у приватному атрибуті, наприклад <code>self._balance</code>, і перевірте його в <code>__init__</code>.",
      },
      {
        id: "R2",
        text: "<code>balance</code> доступний лише для читання: спроба <code>a.balance = 1000</code> викликає <code>AttributeError</code>, а баланс лишається таким, як був.",
        hint: "Оголосіть метод із декоратором <code>@property</code> і не додавайте <code>@balance.setter</code>.",
      },
      {
        id: "R3",
        text: "<code>deposit(50)</code> на рахунку зі 100 повертає <code>150</code> і баланс стає 150. Дробові суми допустимі: додавання <code>0.5</code> дає <code>150.5</code>.",
        hint: "Збільште <code>self._balance</code> і поверніть його.",
      },
      {
        id: "R4",
        text: "Для <code>deposit</code> і <code>withdraw</code> некоректна сума (<code>0</code>, <code>-10</code>, рядок <code>\"50\"</code>, <code>None</code>) викликає <code>ValueError</code>, баланс не змінюється.",
        hint: "Винесіть перевірку суми в окремий метод і викликайте його на початку обох операцій.",
      },
      {
        id: "R5",
        text: "<code>withdraw(30)</code> на рахунку зі 100 повертає <code>70</code>; зняти все (<code>withdraw(70)</code>) дозволено, баланс стає <code>0</code>.",
        hint: "Нестача — це <code>amount &gt; balance</code> (строго більше), тож зняття рівно всього балансу допустиме.",
      },
      {
        id: "R6",
        text: "Спроба зняти більше, ніж є (<code>withdraw(130)</code> при балансі 100), викликає <code>InsufficientFundsError</code> із <code>shortage == 30</code>, баланс не змінюється. Цей клас успадковує <code>Exception</code>, але не <code>ValueError</code>.",
        hint: "Оголосіть клас, у його <code>__init__</code> збережіть <code>self.shortage</code> і викличте <code>super().__init__(повідомлення)</code>.",
      },
      {
        id: "R7",
        text: "<code>history</code> — список кортежів у порядку виконання: після <code>deposit(50)</code> і <code>withdraw(30)</code> це <code>[(\"deposit\", 50), (\"withdraw\", 30)]</code>. Невдалі операції не записуються. Зміна повернутого списку не впливає на рахунок. Новий рахунок має порожню історію.",
        hint: "Тримайте внутрішній список <code>self._history</code>, а з властивості повертайте <code>list(self._history)</code>.",
      },
      {
        id: "R8",
        text: "<code>a.transfer(b, 40)</code> при балансах 100 і 20 дає 60 і 60. В історії <code>a</code> з'являється <code>(\"transfer_out\", 40)</code>, в історії <code>b</code> — <code>(\"transfer_in\", 40)</code> (а не deposit/withdraw).",
        hint: "Змінюйте <code>_balance</code> і <code>_history</code> обох рахунків напряму, не викликаючи <code>withdraw</code>/<code>deposit</code>, або запишіть тип операції окремим параметром.",
      },
      {
        id: "R9",
        text: "Якщо коштів на переказ не вистачає, виникає <code>InsufficientFundsError</code>, а баланси й історії <b>обох</b> рахунків лишаються без змін. Сума <code>0</code> дає <code>ValueError</code>, теж без змін.",
        hint: "Спершу перевірте суму та достатність коштів, і лише потім змінюйте обидва рахунки: так операція не буде «наполовину виконаною».",
      },
    ],
    starter: `# Банківський рахунок. Баланс змінюється лише через операції.


class InsufficientFundsError(Exception):
    # TODO: збережіть у self.shortage, скільки не вистачає, і передайте повідомлення в super().__init__
    pass


class Account:
    def __init__(self, owner, balance=0):
        # TODO: збережіть owner; початковий баланс і порожню історію тримайте в приватних атрибутах
        # TODO: від'ємний початковий баланс — ValueError
        pass

    @property
    def balance(self):
        # TODO: поверніть поточний баланс (сеттера бути не повинно)
        return 0

    @property
    def history(self):
        # TODO: поверніть КОПІЮ списку кортежів (тип, сума)
        return []

    def deposit(self, amount):
        # TODO: перевірити суму (число > 0, не bool), збільшити баланс, записати ("deposit", amount), повернути баланс
        return None

    def withdraw(self, amount):
        # TODO: перевірити суму; якщо більше за баланс — InsufficientFundsError
        # TODO: зменшити баланс, записати ("withdraw", amount), повернути баланс
        return None

    def transfer(self, other, amount):
        # TODO: зняти з цього рахунку й зарахувати на other; історія: "transfer_out" / "transfer_in"
        # TODO: при помилці обидва рахунки лишаються без змін
        return None
`,
    harness: bankHarness,
  },
  {
    id: "py-inventory",
    lang: "python",
    lesson: "python/16",
    title: "Проєкт: склад",
    xp: 90,
    context:
      "Облік залишків із збереженням у JSON — типова задача для магазинів і невеликих сервісів: дані живуть у словнику, а між запусками передаються текстом. Тут ви поєднаєте словники, comprehensions, сортування з ключем і модуль json, а також навчитеся не пускати у склад сміття.",
    brief: [
      "Власник невеликого магазину хоче вести облік товарів на складі. Склад це словник <code>{назва: кількість}</code>. Потрібні функції приходу й списання, пошук товарів, що закінчуються, впорядкований звіт та збереження складу у вигляді JSON-рядка з відновленням назад.",
      "Нижче вимоги R1–R9. Натискайте «Перевірити проєкт»: ми запустимо вашу програму, виконаємо операції зі складом (у тому числі помилкові), перевіримо збереження та відновлення й покажемо, які вимоги R1–R9 виконано.",
    ],
    contract: [
      "<code>add_stock(stock, name, qty)</code> і <code>remove_stock(stock, name, qty)</code> змінюють словник на місці, нічого не повертають. Кількість коректна, лише якщо це <code>int</code> (не <code>bool</code>) більше нуля, інакше <code>ValueError</code>.",
      "<code>low_stock(stock, threshold)</code> — список назв, кількість яких <b>строго менша</b> за поріг, відсортований за алфавітом.",
      "<code>sorted_report(stock)</code> — список кортежів <code>(назва, кількість)</code>: від більшої кількості до меншої, за рівності за назвою за алфавітом.",
      "<code>to_json(stock)</code> — JSON-рядок із ключами в алфавітному порядку, кирилиця зберігається як є (не <code>\\uXXXX</code>). Наприклад <code>'{\"a\": 2, \"b\": 1}'</code>.",
      "<code>from_json(text)</code> — повертає словник зі складом. Усе некоректне (не JSON, не словник, кількість не додатне ціле) — <code>ValueError</code>.",
    ],
    requirements: [
      {
        id: "R1",
        text: "<code>add_stock</code> створює товар, якого немає, і збільшує кількість наявного: після <code>add_stock(s, \"болт\", 10)</code> та <code>add_stock(s, \"болт\", 5)</code> у складі <code>{\"болт\": 15}</code>.",
        hint: "<code>stock[name] = stock.get(name, 0) + qty</code>.",
      },
      {
        id: "R2",
        text: "Кількість <code>0</code>, <code>-5</code>, рядок <code>\"3\"</code> або дріб <code>2.5</code> у <code>add_stock</code> викликає <code>ValueError</code>, склад не змінюється.",
        hint: "Перевірку кількості винесіть у допоміжну функцію, вона знадобиться ще в <code>remove_stock</code> і <code>from_json</code>.",
      },
      {
        id: "R3",
        text: "<code>remove_stock</code> зменшує кількість: з <code>{\"болт\": 10}</code> після <code>remove_stock(s, \"болт\", 4)</code> лишається 6. Коли кількість стає нулем, товар повністю видаляється зі словника.",
        hint: "Після віднімання, якщо <code>stock[name] == 0</code>, зробіть <code>del stock[name]</code>.",
      },
      {
        id: "R4",
        text: "<code>remove_stock</code> викликає <code>ValueError</code> (і не змінює склад) для невідомого товару, для спроби списати більше, ніж є (6 при залишку 5), та для кількості 0 або від'ємної.",
        hint: "Усі перевірки робіть до зміни словника. Для невідомого товару не покладайтеся на KeyError, перетворіть його на ValueError.",
      },
      {
        id: "R5",
        text: "<code>low_stock(s, 5)</code> для <code>{\"гайка\": 3, \"болт\": 10, \"шайба\": 5, \"дюбель\": 2}</code> повертає <code>[\"гайка\", \"дюбель\"]</code>. Поріг строгий (5 не менше за 5), результат відсортований, для порожнього складу порожній.",
        hint: "<code>sorted([n for n, q in stock.items() if q &lt; threshold])</code>.",
      },
      {
        id: "R6",
        text: "<code>sorted_report</code> повертає список пар від більшої кількості до меншої, а за рівних кількостей за назвою: <code>[(\"болт\", 10), (\"дюбель\", 7), (\"гайка\", 3), (\"шайба\", 3)]</code>.",
        hint: "<code>sorted(stock.items(), key=lambda p: (-p[1], p[0]))</code>.",
      },
      {
        id: "R7",
        text: "<code>to_json({\"b\": 1, \"a\": 2})</code> повертає <code>'{\"a\": 2, \"b\": 1}'</code>, а <code>to_json({\"болт\": 4})</code> лишає кирилицю читабельною: <code>'{\"болт\": 4}'</code>.",
        hint: "<code>json.dumps(stock, sort_keys=True, ensure_ascii=False)</code>. Не забудьте <code>import json</code> угорі.",
      },
      {
        id: "R8",
        text: "<code>from_json(to_json(s)) == s</code> для складу з кириличними назвами, <code>from_json(\"{}\")</code> повертає порожній словник.",
        hint: "<code>json.loads(text)</code> дає словник; далі перевірте його вміст за правилами з R9.",
      },
      {
        id: "R9",
        text: "<code>from_json</code> викликає <code>ValueError</code> для: <code>\"це не json\"</code>, <code>\"[1, 2]\"</code> (не словник), <code>'{\"a\": -1}'</code>, <code>'{\"a\": 0}'</code>, <code>'{\"a\": \"x\"}'</code> та <code>'{\"a\": 1.5}'</code>.",
        hint: "<code>json.JSONDecodeError</code> уже є підкласом ValueError; решту перевірте вручну: <code>isinstance(data, dict)</code> і кількість як у R2.",
      },
    ],
    starter: `import json

# Склад: словник {назва: кількість}. Кількість — додатне ціле число.


def add_stock(stock, name, qty):
    # TODO: ValueError, якщо qty не int (не bool) або qty <= 0
    # TODO: збільшити кількість товару (створити, якщо немає)
    pass


def remove_stock(stock, name, qty):
    # TODO: ValueError для невідомого товару, нестачі або некоректної кількості
    # TODO: коли кількість стає 0 — видалити товар зі словника
    pass


def low_stock(stock, threshold):
    # TODO: відсортований список назв, де кількість строго менша за threshold
    return []


def sorted_report(stock):
    # TODO: список кортежів (назва, кількість): спершу більша кількість, за рівності — за назвою
    return []


def to_json(stock):
    # TODO: json.dumps з ключами за алфавітом і без екранування кирилиці
    return ""


def from_json(text):
    # TODO: json.loads, потім перевірка: це словник, а кожна кількість — додатне ціле
    # TODO: усе некоректне — ValueError
    return {}
`,
    harness: inventoryHarness,
  },
];
