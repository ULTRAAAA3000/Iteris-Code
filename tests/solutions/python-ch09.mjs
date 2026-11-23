// Еталонні рішення завдань Python, глава 09 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_09 = {
  "python-project-layout": raw`import importlib
import sys
import types


def make_module(name, exports, **attrs):
    module = types.ModuleType(name)
    for key, value in attrs.items():
        setattr(module, key, value)
    module.__all__ = exports
    sys.modules[name] = module
    return module


make_module("shop_utils", ["TAX"], TAX=0.2, double=lambda x: x * 2)
mod = importlib.import_module("shop_utils")
print(mod.TAX, mod.double(21), mod.__name__)
namespace = {}
exec("from shop_utils import *", namespace)
print(sorted(k for k in namespace if not k.startswith("__")))
`,
  "python-mini-tests": raw`import io
import unittest


def slugify(title):
    return "-".join(title.lower().split())


class TestSlugify(unittest.TestCase):
    def test_simple(self):
        self.assertEqual(slugify("Hello World"), "hello-world")

    def test_extra_spaces(self):
        self.assertEqual(slugify("  Hello   World  "), "hello-world")

    def test_already_lower(self):
        self.assertEqual(slugify("python"), "python")


suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestSlugify)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
passed = result.testsRun - len(result.failures) - len(result.errors)
print(f"Пройдено {passed} з {result.testsRun}")
`,
  "python-mock-retry": raw`from unittest.mock import Mock


def fetch_with_retry(client, item, attempts):
    last_error = None
    for _ in range(attempts):
        try:
            return client.fetch(item)
        except ConnectionError as e:
            last_error = e
    raise last_error


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
  "python-benchmark-compare": raw`import timeit


def faster(stmt_a, stmt_b, setup="pass", number=300):
    time_a = min(timeit.repeat(stmt_a, setup=setup, repeat=3, number=number))
    time_b = min(timeit.repeat(stmt_b, setup=setup, repeat=3, number=number))
    return "a" if time_a < time_b else "b"


setup = "data_list = list(range(5000)); data_set = set(data_list)"
print(faster("4999 in data_list", "4999 in data_set", setup))
print(faster("sum(range(10000))", "sum(range(10))"))
`,
  "python-doctest-runner": raw`import doctest


def clamp(x, lo, hi):
    """Обмежує x діапазоном від lo до hi.

    >>> clamp(5, 0, 10)
    5
    >>> clamp(-3, 0, 10)
    0
    >>> clamp(42, 0, 10)
    10
    """
    return max(lo, min(x, hi))


test = doctest.DocTestParser().get_doctest(clamp.__doc__, {"clamp": clamp}, "clamp", None, 0)
runner = doctest.DocTestRunner(verbose=False)
runner.run(test, out=lambda text: None)
print(f"Прикладів: {runner.tries}, помилок: {runner.failures}")
`,
  "python-refactor-idioms": raw`def has_even(nums):
    return any(n % 2 == 0 for n in nums)


def indexed(names):
    return [f"{i}. {name}" for i, name in enumerate(names, 1)]


def is_empty(items):
    return not items


print(has_even([1, 3, 4]))
print(indexed(["Оля", "Іван"]))
print(is_empty([]), is_empty([1]))
`,
};
