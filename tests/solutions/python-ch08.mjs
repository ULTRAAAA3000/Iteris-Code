// Еталонні рішення завдань Python, глава 08 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_08 = {
  "python-text-cleanup": raw`def normalize(text):
    table = str.maketrans("", "", ".,!?;:")
    return " ".join(text.translate(table).lower().split())


def parse_pairs(line):
    result = {}
    for part in line.split(";"):
        key, _, value = part.partition("=")
        result[key.strip()] = value.strip()
    return result


print(normalize("  Привіт,   СВІТЕ!!  Як  справи?  "))
print(parse_pairs("a=1; b=2;c=3"))
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
  "python-dates": raw`from datetime import date, timedelta

NAMES = ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"]


def days_between(a, b):
    return (date.fromisoformat(b) - date.fromisoformat(a)).days


def add_days(iso, n):
    return (date.fromisoformat(iso) + timedelta(days=n)).isoformat()


def weekday_name(iso):
    return NAMES[date.fromisoformat(iso).weekday()]


print(days_between("2026-11-19", "2026-12-25"))
print(add_days("2026-02-27", 3))
print(weekday_name("2026-11-21"))
`,
  "python-stats-summary": raw`import random
import statistics


def summary(nums):
    return {
        "mean": statistics.mean(nums),
        "median": statistics.median(nums),
        "mode": statistics.mode(nums),
        "pstdev": statistics.pstdev(nums),
    }


def same_with_seed(seed):
    a = random.Random(seed)
    b = random.Random(seed)
    return [a.randint(1, 100) for _ in range(3)] == [b.randint(1, 100) for _ in range(3)]


print(summary([2, 4, 4, 4, 5, 5, 7, 9]))
print(same_with_seed(42))
`,
  "python-json-csv": raw`import json


def orders_total(text):
    return sum(o["price"] * o["qty"] for o in json.loads(text))


def to_json(obj):
    return json.dumps(obj, ensure_ascii=False)


def roundtrip(obj):
    return json.loads(json.dumps(obj))


orders = '[{"item": "Хліб", "price": 25, "qty": 2}, {"item": "Сир", "price": 180, "qty": 1}]'
print(orders_total(orders))
print(to_json({"name": "Оля", "tags": ["a", "b"]}))
print(roundtrip({"k": (1, 2)}))
`,
  "python-json-codec": raw`import json
from dataclasses import dataclass, asdict
from datetime import date


@dataclass
class Event:
    name: str
    when: date


def encode_event(event):
    return json.dumps(asdict(event), default=lambda o: o.isoformat(), ensure_ascii=False)


def decode_event(text):
    data = json.loads(text)
    return Event(name=data["name"], when=date.fromisoformat(data["when"]))


text = encode_event(Event("Конференція", date(2026, 11, 19)))
print(text)
print(decode_event(text))
`,
  "python-regex-extract": raw`import re


def find_dates(text):
    return re.findall(r"\d{4}-\d{2}-\d{2}", text)


def find_emails(text):
    return re.findall(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)


def mask_digits(text):
    return re.sub(r"\d", "*", text)


text = "Зустріч 2026-11-19, дедлайн 2026-12-01. Пишіть на ann@example.com або bob@test.org"
print(find_dates(text))
print(find_emails(text))
print(mask_digits("Тел: 050-123-45-67"))
`,
  "python-csv-report": raw`import csv
import io

data = "item,category,price,qty\nХліб,їжа,25,2\nСир,їжа,180,1\nЗошит,канцелярія,40,3\n"


def totals_by_category(text):
    totals = {}
    for row in csv.DictReader(io.StringIO(text)):
        amount = int(row["price"]) * int(row["qty"])
        totals[row["category"]] = totals.get(row["category"], 0) + amount
    return totals


def to_csv(totals):
    out = io.StringIO()
    writer = csv.DictWriter(out, fieldnames=["category", "total"])
    writer.writeheader()
    for category, total in totals.items():
        writer.writerow({"category": category, "total": total})
    return out.getvalue()


totals = totals_by_category(data)
print(totals)
print(to_csv(totals).splitlines())
`,
  "python-logging-setup": raw`import io
import logging


def make_logger(stream):
    logger = logging.getLogger("report")
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler(stream)
    handler.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))
    logger.addHandler(handler)
    logger.propagate = False
    return logger


stream = io.StringIO()
logger = make_logger(stream)
logger.debug("відкинуто")
logger.info("старт")
logger.warning("диск майже повний")
logger.error("збій %d", 42)
print(stream.getvalue().strip())
`,
  "python-stdlib-modules": raw`import argparse
from pathlib import PurePosixPath


def describe_path(p):
    path = PurePosixPath(p)
    return (path.name, path.stem, path.suffix, str(path.parent))


def parse_args(argv):
    parser = argparse.ArgumentParser(description="Обробка файла")
    parser.add_argument("input")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--verbose", action="store_true")
    return parser.parse_args(argv)


print(describe_path("/data/reports/2026/summary.final.csv"))
args = parse_args(["input.txt", "--limit", "5", "--verbose"])
print(args.input, args.limit, args.verbose)
`,
  "python-functools-tools": raw`from functools import reduce, singledispatch, lru_cache


def product(nums):
    return reduce(lambda a, b: a * b, nums, 1)


@singledispatch
def describe(x):
    return f"щось {x}"


@describe.register(int)
def _(x):
    return f"ціле {x}"


@describe.register(list)
def _(x):
    return f"список із {len(x)}"


@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)


print(product([1, 2, 3, 4]))
print(describe(5), describe([1, 2]), describe("a"))
print(fib(30), fib.cache_info().misses)
`,
  "python-report-format": raw`import textwrap
from string import Template


def render(template, data):
    return template.safe_substitute(data)


def short(text, width):
    return textwrap.shorten(text, width=width, placeholder="…")


def wrap_text(text, width):
    return textwrap.wrap(text, width=width)


tpl = Template("Привіт, $name! Ваш баланс: $balance грн.")
print(render(tpl, {"name": "Оля", "balance": 120}))
print(render(tpl, {"name": "Іван"}))
text = "Python — це мова програмування, яку люблять за простоту."
print(short(text, 30))
print(wrap_text(text, 20))
`,
};
