// Практичні завдання глави «Тестування й якість» (уроки 86–91). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_09: readonly RemoteTask[] = [
  {
    ...base, id: "python-project-layout", lesson: "python/86", xp: 25,
    title: "Модуль, створений програмно, і __all__",
    context: "Імпорт у Python спирається на sys.modules, а __all__ визначає публічні імена модуля. Створення модуля вручну допомагає зрозуміти, як працює система пакетів, не створюючи файлів на диску.",
    brief: [
      "Допишіть <code>make_module(name, exports, **attrs)</code>: створіть <code>types.ModuleType(name)</code>, додайте атрибути, задайте <code>__all__ = exports</code> і зареєструйте модуль у <code>sys.modules</code>.",
      "Решта коду імпортує модуль за іменем і перевіряє, що <code>from shop_utils import *</code> приносить лише імена зі списку <code>__all__</code>.",
    ],
    starter: raw`import importlib
import sys
import types


def make_module(name, exports, **attrs):
    # TODO: ModuleType(name), атрибути, __all__ = exports, sys.modules[name] = module
    return None


make_module("shop_utils", ["TAX"], TAX=0.2, double=lambda x: x * 2)
mod = importlib.import_module("shop_utils")
print(mod.TAX, mod.double(21), mod.__name__)
namespace = {}
exec("from shop_utils import *", namespace)
print(sorted(k for k in namespace if not k.startswith("__")))
`,
    checks: [
      { on: "stdout", name: "Модуль імпортується за іменем", has: "0.2 42 shop_utils", hint: "Після sys.modules[name] = module importlib.import_module знаходить модуль." },
      { on: "stdout", name: "Зірочковий імпорт бере лише __all__", equals: "0.2 42 shop_utils\n['TAX']", hint: "Задайте module.__all__ = exports, тоді double не експортується." },
      { on: "source", name: "Використано ModuleType і sys.modules", matches: "ModuleType[\\s\\S]*sys\\.modules\\[", hint: "types.ModuleType(name) і sys.modules[name] = module." },
    ],
  },
  {
    ...base, id: "python-mini-tests", lesson: "python/87", xp: 40,
    title: "Напишіть unittest-тести для slugify",
    context: "Тест фіксує очікувану поведінку функції: зламаєте її пізніше, і тест одразу скаже про це. Функція slugify уже працює, а запуск тестів у пісочниці написано за вас через TextTestRunner у StringIO.",
    brief: [
      "Напишіть клас <code>TestSlugify(unittest.TestCase)</code> щонайменше з <b>трьома</b> методами <code>test_...</code>: звичайний випадок, зайві пробіли, рядок, що вже в нижньому регістрі.",
      "Усі тести мають проходити: підсумок <code>Пройдено N з N</code>, де N не менше 3.",
    ],
    starter: raw`import io
import unittest


def slugify(title):
    return "-".join(title.lower().split())


# TODO: class TestSlugify(unittest.TestCase) щонайменше з трьома методами test_...


suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestSlugify)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
passed = result.testsRun - len(result.failures) - len(result.errors)
print(f"Пройдено {passed} з {result.testsRun}")
`,
    checks: [
      { on: "stdout", name: "Написано щонайменше три тести", matches: "(?:^|\\n)Пройдено ([3-9]|[1-9]\\d+) з ", hint: "Додайте три методи test_... у клас TestSlugify." },
      { on: "stdout", name: "Усі тести проходять", matches: "(?:^|\\n)Пройдено (\\d+) з \\1$", hint: "Кількість пройдених має збігатися із загальною: кожен assertEqual має бути правильним." },
      { on: "source", name: "Тести використовують assert", matches: "def\\s+test_\\w+[\\s\\S]*self\\.assert\\w+", hint: "Перевіряйте результат через self.assertEqual(slugify(...), \"...\")." },
    ],
  },
  {
    ...base, id: "python-mock-retry", lesson: "python/88", xp: 30,
    title: "Повтор запиту, перевірений через Mock",
    context: "Мок дозволяє змоделювати збій мережі, якого важко домогтися від справжнього сервера: перші два виклики падають, третій повертає відповідь. Так перевіряють логіку повторних спроб без реальної мережі.",
    brief: [
      "Допишіть <code>fetch_with_retry(client, item, attempts)</code>: до <code>attempts</code> викликів <code>client.fetch(item)</code>; при <code>ConnectionError</code> повторіть, при успіху поверніть результат.",
      "Якщо всі спроби невдалі, піднімайте останню помилку. Мок-клієнти з <code>side_effect</code> уже створено внизу.",
    ],
    starter: raw`from unittest.mock import Mock


def fetch_with_retry(client, item, attempts):
    # TODO: до attempts спроб; ConnectionError -> повтор; після вичерпання raise останньої помилки
    return None


client = Mock()
client.fetch.side_effect = [ConnectionError("1"), ConnectionError("2"), {"price": 10}]
print(fetch_with_retry(client, "x", 3))
print(client.fetch.call_count)

down = Mock()
down.fetch.side_effect = ConnectionError("down")
try:
    fetch_with_retry(down, "y", 2)
except ConnectionError as e:
    print("вичерпано спроб:", e)
print(down.fetch.call_count)
`,
    checks: [
      { on: "stdout", name: "Успіх після двох збоїв", has: "{'price': 10}\n3\n", hint: "Перші два виклики кидають ConnectionError, третій повертає словник." },
      { on: "stdout", name: "Вичерпання спроб піднімає помилку", has: "вичерпано спроб: down", hint: "Збережіть останню помилку і після циклу напишіть raise last_error." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "{'price': 10}\n3\nвичерпано спроб: down\n2", hint: "Другий мок має отримати рівно 2 виклики." },
      { on: "source", name: "Перехоплення ConnectionError", has: "except ConnectionError", hint: "Повторюйте лише при ConnectionError." },
    ],
  },
  {
    ...base, id: "python-benchmark-compare", lesson: "python/89", xp: 30,
    title: "Порівняння швидкості через timeit",
    context: "Оптимізувати без вимірювань марно. Функція faster вимірює два фрагменти на однакових даних і називає швидший, а мінімум із кількох серій відсікає шум від фонових процесів.",
    brief: [
      "Допишіть <code>faster(stmt_a, stmt_b, setup, number=300)</code>: виміряйте кожен фрагмент через <code>timeit.repeat</code> (3 серії), візьміть мінімум і поверніть <code>\"a\"</code> або <code>\"b\"</code>.",
      "Порівняйте перевірку належності у списку й множині та суму великого й малого діапазонів.",
    ],
    starter: raw`import timeit


def faster(stmt_a, stmt_b, setup="pass", number=300):
    # TODO: min(timeit.repeat(...)) для кожного фрагмента; повернути "a" або "b"
    return "a"


setup = "data_list = list(range(5000)); data_set = set(data_list)"
print(faster("4999 in data_list", "4999 in data_set", setup))
print(faster("sum(range(10000))", "sum(range(10))"))
`,
    checks: [
      { on: "stdout", name: "Множина швидша за список", has: "b\n", hint: "Перевірка 4999 in data_set майже миттєва, а у списку проходить 5000 елементів." },
      { on: "stdout", name: "Малий діапазон швидший", equals: "b\nb", hint: "min(timeit.repeat(stmt, setup=setup, repeat=3, number=number)) для кожного фрагмента." },
      { on: "source", name: "Використано timeit.repeat і min", matches: "timeit\\.repeat[\\s\\S]*min\\(|min\\([\\s\\S]*timeit\\.repeat", hint: "Беріть мінімум серій: він найменше залежить від шуму." },
    ],
  },
  {
    ...base, id: "python-doctest-runner", lesson: "python/90", xp: 30,
    title: "Приклади в docstring як тести",
    context: "Приклади в документації застарівають, якщо їх ніхто не перевіряє. Doctest виконує їх як тести, тож документація лишається правдивою, а функція — задокументованою.",
    brief: [
      "У docstring функції <code>clamp</code> додайте щонайменше <b>три</b> приклади у форматі <code>&gt;&gt;&gt; clamp(5, 0, 10)</code> із очікуваним результатом на наступному рядку.",
      "Код унизу запускає їх через <code>DocTestRunner</code> і виводить кількість прикладів та помилок: помилок має бути 0.",
    ],
    starter: raw`import doctest


def clamp(x, lo, hi):
    """Обмежує x діапазоном від lo до hi.

    TODO: додайте тут щонайменше три приклади (>>> клич функцію, результат на наступному рядку).
    """
    return max(lo, min(x, hi))


test = doctest.DocTestParser().get_doctest(clamp.__doc__, {"clamp": clamp}, "clamp", None, 0)
runner = doctest.DocTestRunner(verbose=False)
runner.run(test, out=lambda text: None)
print(f"Прикладів: {runner.tries}, помилок: {runner.failures}")
`,
    checks: [
      { on: "stdout", name: "Щонайменше три приклади", matches: "Прикладів: ([3-9]|[1-9]\\d+),", hint: "Кожен приклад — рядок >>> clamp(...) і наступний рядок із результатом." },
      { on: "stdout", name: "Усі приклади проходять", matches: "помилок: 0$", hint: "Очікувані значення мають збігатися з реальними: clamp(-3, 0, 10) дає 0." },
      { on: "source", name: "Приклади написано в docstring", matches: ">>>\\s+clamp\\(", hint: "У docstring потрібні рядки виду >>> clamp(5, 0, 10)." },
    ],
  },
  {
    ...base, id: "python-refactor-idioms", lesson: "python/91", xp: 25,
    title: "Пітонівський рефакторинг",
    context: "Код, що працює, але написаний «дослівно» з інших мов, довший і менш читабельний. Ідіоми Python скорочують його, не змінюючи поведінки, а це перше, на що дивляться на код-рев'ю.",
    brief: [
      "Перепишіть <code>has_even</code> через <code>any(...)</code>, <code>indexed</code> через <code>enumerate</code> і f-рядок, а <code>is_empty</code> через <code>not items</code>. Вивід має лишитися таким самим.",
      "Не використовуйте <code>range(len(...))</code>, ручний лічильник <code>i</code> і порівняння <code>len(items) == 0</code>.",
    ],
    starter: raw`def has_even(nums):
    found = False
    for i in range(len(nums)):
        if nums[i] % 2 == 0:
            found = True
    return found


def indexed(names):
    result = []
    i = 0
    for name in names:
        result.append(str(i + 1) + ". " + name)
        i = i + 1
    return result


def is_empty(items):
    if len(items) == 0:
        return True
    else:
        return False


print(has_even([1, 3, 4]))
print(indexed(["Оля", "Іван"]))
print(is_empty([]), is_empty([1]))
`,
    checks: [
      { on: "stdout", name: "Поведінка збережена", equals: "True\n['1. Оля', '2. Іван']\nTrue False", hint: "Після рефакторингу вивід не має змінитися." },
      { on: "source", name: "Немає range(len(...))", matches: "range\\(len\\(", not: true, hint: "Для обходу використовуйте for n in nums або enumerate." },
      { on: "source", name: "Використано any", has: "any(", hint: "return any(n % 2 == 0 for n in nums)." },
      { on: "source", name: "Використано enumerate", has: "enumerate(", hint: "[f\"{i}. {name}\" for i, name in enumerate(names, 1)]." },
      { on: "source", name: "Немає порівняння len(items) == 0", matches: "len\\(items\\)\\s*==\\s*0", not: true, hint: "Порожність перевіряють як not items." },
    ],
  },
];
