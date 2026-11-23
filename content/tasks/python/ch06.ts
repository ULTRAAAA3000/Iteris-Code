// Практичні завдання глави «Помилки» (уроки 52–58). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_06: readonly RemoteTask[] = [
  {
    ...base, id: "python-exceptions", lesson: "python/52", xp: 35,
    title: "Безпечне ділення, власна помилка і finally",
    context: "Помилки неминучі: ділення на нуль, некоректні дані, відсутні ключі. Задача програми обробити їх так, щоб користувач побачив зрозуміле повідомлення, а не traceback, а ресурси були прибрані.",
    brief: [
      "Допишіть <code>safe_div(a, b)</code>: повертає <code>a / b</code>, а при діленні на нуль перехоплює <code>ZeroDivisionError</code> і повертає <code>None</code>.",
      "Опишіть клас <code>NegativeAgeError(ValueError)</code> і функцію <code>check_age(age)</code>: для віку менше 0 вона викликає <code>raise NegativeAgeError(\"вік не може бути від'ємним\")</code>. Блок <code>finally</code> у коді внизу виводить «Перевірку завершено» за будь-якого результату.",
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
      { on: "stdout", name: "Звичайне ділення: 5.0", has: "5.0\n", hint: "Для нормальних чисел safe_div повертає a / b без змін." },
      { on: "stdout", name: "Ділення на нуль повертає None", has: "5.0\nNone", hint: "У блоці except ZeroDivisionError поверніть None." },
      { on: "stdout", name: "Власна помилка перехоплена з повідомленням", has: "Помилка: вік не може бути від'ємним", hint: "Для age < 0 напишіть raise NegativeAgeError(\"вік не може бути від'ємним\")." },
      { on: "stdout", name: "finally спрацював", has: "Перевірку завершено", hint: "Блок finally виконується завжди, його писати не треба: він уже є внизу." },
      { on: "source", name: "Використано try / except", matches: "\\btry:[\\s\\S]*\\bexcept\\b", hint: "Огорніть ділення у try і перехопіть ZeroDivisionError." },
    ],
  },
  {
    ...base, id: "python-custom-errors", lesson: "python/53", xp: 30,
    title: "Ієрархія власних винятків і валідація",
    context: "Власні винятки дають помилкам імена й додаткові поля. Кореневий AppError дозволяє ловити всі помилки застосунку разом, а ValidationError розповідає, яке саме поле не пройшло перевірку.",
    brief: [
      "Опишіть <code>AppError(Exception)</code> і <code>ValidationError(AppError)</code>, що в <code>__init__(self, field, message)</code> зберігає поле в <code>self.field</code> і передає повідомлення батьку.",
      "Функція <code>validate(user)</code> кидає <code>ValidationError(\"name\", \"порожнє ім'я\")</code> для порожнього імені та <code>ValidationError(\"age\", \"вік від'ємний\")</code> для віку менше 0.",
    ],
    starter: raw`# TODO: class AppError(Exception)
# TODO: class ValidationError(AppError): __init__(self, field, message) зберігає self.field


def validate(user):
    # TODO: порожнє ім'я -> ValidationError("name", "порожнє ім'я")
    #       вік < 0     -> ValidationError("age", "вік від'ємний")
    return True


users = [{"name": "Оля", "age": 16}, {"name": "", "age": 5}, {"name": "Іван", "age": -1}]
for user in users:
    try:
        validate(user)
        print("ok")
    except AppError as e:
        print(f"{e.field}: {e}")
`,
    checks: [
      { on: "stdout", name: "Коректний користувач проходить", has: "ok\n", hint: "Для Оля 16 років validate нічого не кидає." },
      { on: "stdout", name: "Порожнє ім'я: поле name", has: "name: порожнє ім'я", hint: "Конструктор: super().__init__(message) і self.field = field." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ok\nname: порожнє ім'я\nage: вік від'ємний", hint: "Мають бути три рядки." },
      { on: "source", name: "ValidationError успадковує AppError", matches: "class\\s+ValidationError\\s*\\(\\s*AppError\\s*\\)", hint: "Напишіть class ValidationError(AppError):." },
    ],
  },
  {
    ...base, id: "python-wrap-errors", lesson: "python/54", xp: 30,
    title: "Переклад помилок через raise from",
    context: "Технічне KeyError: 'port' нічого не каже користувачу, а ConfigError із причиною каже і що сталося, і чому. Ланцюжок raise from зберігає обидва рівні.",
    brief: [
      "У <code>load_port(config)</code> перехопіть <code>KeyError</code> і <code>ValueError</code> та киньте <code>ConfigError(\"Некоректний порт\")</code> через <code>raise ... from e</code>.",
      "Решта коду виводить порт або повідомлення й тип причини з <code>__cause__</code>.",
    ],
    starter: raw`class ConfigError(Exception):
    pass


def load_port(config):
    # TODO: int(config["port"]); KeyError і ValueError -> ConfigError("Некоректний порт") from e
    return int(config["port"])


for config in [{"port": "8080"}, {}, {"port": "abc"}]:
    try:
        print(load_port(config))
    except ConfigError as e:
        print(e, "|", type(e.__cause__).__name__)
`,
    checks: [
      { on: "stdout", name: "Коректний порт", has: "8080\n", hint: "Для правильних налаштувань повертається int(config[\"port\"])." },
      { on: "stdout", name: "Відсутній порт: причина KeyError", has: "Некоректний порт | KeyError", hint: "Перехопіть (KeyError, ValueError) as e і киньте нову помилку з from e." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "8080\nНекоректний порт | KeyError\nНекоректний порт | ValueError", hint: "Причина зберігається в e.__cause__." },
      { on: "source", name: "Використано raise ... from", matches: "raise\\s+ConfigError\\([^\\n]*\\)\\s+from\\s+e", hint: "Напишіть raise ConfigError(\"...\") from e." },
    ],
  },
  {
    ...base, id: "python-exception-groups", lesson: "python/55", xp: 30,
    title: "Група помилок валідації й except*",
    context: "Форма може мати кілька помилок одразу, і користувачу краще побачити їх усі. ExceptionGroup збирає помилки докупи, а except* розбирає їх за типами.",
    brief: [
      "У <code>validate(form)</code> зберіть помилки у список (вже написано) і, якщо він не порожній, киньте <code>ExceptionGroup(\"форма\", errors)</code>.",
      "Обробіть групу двома блоками: <code>except* ValueError</code> виводить <code>значення: N</code>, <code>except* TypeError</code> — <code>типи: N</code>, де N — кількість помилок у групі.",
    ],
    starter: raw`def validate(form):
    errors = []
    if not form.get("name"):
        errors.append(ValueError("порожнє ім'я"))
    if not isinstance(form.get("age"), int):
        errors.append(TypeError("вік має бути числом"))
    if not form.get("email"):
        errors.append(ValueError("порожня пошта"))
    # TODO: якщо errors не порожній, киньте ExceptionGroup("форма", errors)


try:
    validate({"name": "", "age": "abc", "email": ""})
# TODO: except* ValueError as g -> print("значення:", len(g.exceptions))
# TODO: except* TypeError as g  -> print("типи:", len(g.exceptions))
finally:
    print("перевірку завершено")
`,
    checks: [
      { on: "stdout", name: "Дві помилки значення", has: "значення: 2", hint: "except* ValueError as g: g.exceptions містить дві помилки." },
      { on: "stdout", name: "Одна помилка типу", has: "типи: 1", hint: "except* TypeError as g: g.exceptions містить одну помилку." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "значення: 2\nтипи: 1\nперевірку завершено", hint: "Спершу блоки except*, наприкінці finally." },
      { on: "source", name: "Використано ExceptionGroup", has: "ExceptionGroup(", hint: "Киньте raise ExceptionGroup(\"форма\", errors)." },
      { on: "source", name: "Використано except*", matches: "except\\*\\s+ValueError[\\s\\S]*except\\*\\s+TypeError", hint: "Потрібні два блоки except* для різних типів." },
    ],
  },
  {
    ...base, id: "python-context-manager", lesson: "python/56", xp: 30,
    title: "Контекстний менеджер section",
    context: "Контекстний менеджер гарантує, що прибирання відбудеться навіть за помилки. Власні менеджери зручно писати через @contextmanager, а непотрібні помилки ігнорувати через suppress.",
    brief: [
      "Напишіть через <code>@contextmanager</code> функцію <code>section(name)</code>: виводить <code>start ІМ'Я</code>, віддає керування, а в <code>finally</code> виводить <code>end ІМ'Я</code>.",
      "Код унизу перевіряє її без помилки й із <code>ValueError</code> усередині, який гасить <code>suppress</code>.",
    ],
    starter: raw`from contextlib import contextmanager, suppress

# TODO: @contextmanager def section(name): start / yield / end (у finally)


with section("A"):
    print("work")

with suppress(ValueError):
    with section("B"):
        raise ValueError("збій")
print("готово")
`,
    checks: [
      { on: "stdout", name: "Звичайний блок", has: "start A\nwork\nend A\n", hint: "Усе до yield виконується на вході, а після — на виході." },
      { on: "stdout", name: "Блок із помилкою: end виконується", has: "start B\nend B\n", hint: "Огорніть yield у try/finally, тоді end друкується навіть за винятку." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "start A\nwork\nend A\nstart B\nend B\nготово", hint: "Мають бути шість рядків." },
      { on: "source", name: "Використано @contextmanager", has: "@contextmanager", hint: "Позначте функцію декоратором @contextmanager." },
      { on: "source", name: "Прибирання у finally", matches: "try:[\\s\\S]*yield[\\s\\S]*finally:", hint: "Структура: try: yield, finally: print(\"end\", name)." },
    ],
  },
  {
    ...base, id: "python-exit-codes", lesson: "python/57", xp: 25,
    title: "main із кодом виходу й рядок traceback",
    context: "Скрипти в автоматизації оцінюють результат за кодом виходу: 0 це успіх, усе інше помилка. А для журналу корисно записати останній рядок traceback із типом помилки.",
    brief: [
      "Допишіть <code>main(items)</code>: сума <code>int(x)</code> для кожного елемента. Успіх: надрукувати <code>Сума: N</code> і повернути <code>0</code>.",
      "При <code>ValueError</code> надрукуйте останній рядок <code>traceback.format_exc()</code> (<code>.strip().splitlines()[-1]</code>) і поверніть <code>2</code>.",
    ],
    starter: raw`import traceback


def main(items):
    # TODO: сума int(x); успіх -> print("Сума:", total), return 0
    #       ValueError -> друк останнього рядка traceback, return 2
    return 0


print(main(["1", "2", "3"]))
print(main(["1", "x"]))
`,
    checks: [
      { on: "stdout", name: "Успішний сценарій: сума й код 0", has: "Сума: 6\n0\n", hint: "Порахуйте суму через цикл або sum(int(x) for x in items)." },
      { on: "stdout", name: "Помилка розбору: рядок traceback", has: "ValueError: invalid literal for int() with base 10: 'x'", hint: "Усередині except викличте traceback.format_exc() і візьміть останній рядок." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Сума: 6\n0\nValueError: invalid literal for int() with base 10: 'x'\n2", hint: "Після помилки повертається код 2." },
      { on: "source", name: "Використано format_exc", has: "format_exc", hint: "traceback.format_exc() повертає текст поточного винятку." },
    ],
  },
  {
    ...base, id: "python-retry-result", lesson: "python/58", xp: 30,
    title: "Повторні спроби з лімітом",
    context: "Тимчасові збої мережі часто минають, тож операцію повторюють кілька разів. Але спроб має бути обмежена кількість, а після вичерпання остання помилка не повинна губитися.",
    brief: [
      "Допишіть <code>retry(func, attempts)</code>: до <code>attempts</code> викликів <code>func()</code>, при <code>ConnectionError</code> повторити, при успіху повернути результат.",
      "Якщо всі спроби невдалі, піднімайте останню помилку (<code>raise last_error</code>).",
    ],
    starter: raw`def retry(func, attempts):
    # TODO: до attempts спроб; ConnectionError -> повтор; після вичерпання raise останньої помилки
    return None


state = {"calls": 0}


def flaky():
    state["calls"] += 1
    if state["calls"] < 3:
        raise ConnectionError(f"збій {state['calls']}")
    return "успіх"


print(retry(flaky, 3))
print(state["calls"])


def broken():
    raise ConnectionError("немає мережі")


try:
    retry(broken, 2)
except ConnectionError as e:
    print("Остання помилка:", e)
`,
    checks: [
      { on: "stdout", name: "Успіх після двох збоїв", has: "успіх\n3\n", hint: "Перші дві спроби падають, на третій повертається успіх, і лічильник дорівнює 3." },
      { on: "stdout", name: "Остання помилка піднімається", has: "Остання помилка: немає мережі", hint: "Збережіть останню помилку й після циклу напишіть raise last_error." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "успіх\n3\nОстання помилка: немає мережі", hint: "Мають бути три рядки." },
      { on: "source", name: "Є цикл спроб і перехоплення ConnectionError", matches: "\\bfor\\b[\\s\\S]*except\\s+ConnectionError", hint: "Цикл по спробах із try/except ConnectionError всередині." },
    ],
  },
];
