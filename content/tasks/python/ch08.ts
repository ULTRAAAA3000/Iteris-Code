// Практичні завдання глави «Стандартна бібліотека» (уроки 74–85). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_08: readonly RemoteTask[] = [
  {
    ...base, id: "python-text-cleanup", lesson: "python/74", xp: 25,
    title: "Очищення тексту й розбір пар ключ=значення",
    context: "Сирий текст майже завжди потребує чищення: зайві пробіли, розділові знаки, різний регістр. А рядки налаштувань на кшталт a=1; b=2 розбирають простими split і partition без регулярних виразів.",
    brief: [
      "Допишіть <code>normalize(text)</code>: прибрати знаки <code>. , ! ? ; :</code> (через <code>translate</code>), привести до малих літер і замінити будь-які групи пробілів одним (<code>split</code> та <code>join</code>).",
      "Допишіть <code>parse_pairs(line)</code>: розбийте рядок за <code>;</code>, кожну частину за <code>=</code> (<code>partition</code>), приберіть пробіли й поверніть словник із рядковими значеннями.",
    ],
    starter: raw`def normalize(text):
    # TODO: translate без знаків . , ! ? ; :, малі літери, split + join
    return text


def parse_pairs(line):
    # TODO: "a=1; b=2;c=3" -> {"a": "1", "b": "2", "c": "3"}
    return {}


print(normalize("  Привіт,   СВІТЕ!!  Як  справи?  "))
print(parse_pairs("a=1; b=2;c=3"))
`,
    checks: [
      { on: "stdout", name: "Текст нормалізовано", has: "привіт світе як справи", hint: "str.maketrans(\"\", \"\", \".,!?;:\") створює таблицю видалення, а \" \".join(text.split()) нормалізує пробіли." },
      { on: "stdout", name: "Пари розібрано в словник", has: "{'a': '1', 'b': '2', 'c': '3'}", hint: "Для кожної частини: key, _, value = part.partition(\"=\") і strip() для обох." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "привіт світе як справи\n{'a': '1', 'b': '2', 'c': '3'}", hint: "Мають бути два рядки." },
      { on: "source", name: "Використано translate і join", matches: "translate[\\s\\S]*join|join[\\s\\S]*translate", hint: "Скористайтеся translate для видалення знаків і join для склеювання слів." },
    ],
  },
  {
    ...base, id: "python-files-stringio", lesson: "python/75", xp: 35,
    title: "Запис і читання рядків, як у файлі",
    context: "Файл записують і читають одними й тими самими методами, що б у ньому не лежало: логи, експорт, налаштування. У пісочниці немає диска, тому тренуємось на io.StringIO: це об'єкт-«файл» у пам'яті з тим самим API, що й open().",
    brief: [
      "Допишіть <code>save_lines(f, lines)</code>: запишіть кожен рядок у «файл» <code>f</code>, закінчуючи його символом переносу <code>\\n</code>.",
      "Допишіть <code>load_lines(f)</code>: прочитайте весь вміст і поверніть список рядків без символів переносу (<code>read().splitlines()</code>).",
    ],
    starter: raw`import io


def save_lines(f, lines):
    # TODO: f.write(рядок + "\n") для кожного рядка
    pass


def load_lines(f):
    # TODO: поверніть список рядків без \n
    return []


buf = io.StringIO()          # працює як файл, відкритий через open()
save_lines(buf, ["перший", "другий", "третій"])
buf.seek(0)                  # повертаємось на початок перед читанням
lines = load_lines(buf)
print(lines)
print("Рядків:", len(lines))
`,
    checks: [
      { on: "stdout", name: "Прочитано три рядки", has: "['перший', 'другий', 'третій']", hint: "Запишіть кожен рядок через f.write(line + \"\\n\"), а читайте f.read().splitlines()." },
      { on: "stdout", name: "Рядків: 3", has: "Рядків: 3", hint: "Кількість рядків — len(lines)." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "['перший', 'другий', 'третій']\nРядків: 3", hint: "Мають бути два рядки." },
      { on: "source", name: "Рядки записуються через write", matches: "\\.write\\(", hint: "Використайте метод write у циклі по рядках." },
    ],
  },
  {
    ...base, id: "python-dates", lesson: "python/76", xp: 25,
    title: "Дати: різниця, зсув і день тижня",
    context: "Терміни, дедлайни й звіти за період потребують арифметики з датами. Об'єкти date самі знають календар: скільки днів у місяці, коли кінець лютого й який день тижня.",
    brief: [
      "Допишіть <code>days_between(a, b)</code> (кількість днів між датами в форматі ISO), <code>add_days(iso, n)</code> (дата через n днів у форматі ISO) і <code>weekday_name(iso)</code> (назва дня тижня українською).",
      "Використовуйте <code>date.fromisoformat</code>, <code>timedelta</code> і метод <code>weekday()</code> (понеділок — 0).",
    ],
    starter: raw`from datetime import date, timedelta

NAMES = ["понеділок", "вівторок", "середа", "четвер", "п'ятниця", "субота", "неділя"]


def days_between(a, b):
    # TODO: кількість днів між ISO-датами a та b
    return 0


def add_days(iso, n):
    # TODO: ISO-дата через n днів
    return ""


def weekday_name(iso):
    # TODO: назва дня тижня з NAMES
    return ""


print(days_between("2026-11-19", "2026-12-25"))
print(add_days("2026-02-27", 3))
print(weekday_name("2026-11-21"))
`,
    checks: [
      { on: "stdout", name: "Днів між датами: 36", has: "36\n", hint: "(date.fromisoformat(b) - date.fromisoformat(a)).days." },
      { on: "stdout", name: "Перехід через кінець лютого", has: "2026-03-02", hint: "date.fromisoformat(iso) + timedelta(days=n), потім .isoformat()." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "36\n2026-03-02\nсубота", hint: "21 листопада 2026 — субота: NAMES[date.weekday()]." },
      { on: "source", name: "Використано timedelta", has: "timedelta(", hint: "Для зсуву дати створіть timedelta(days=n)." },
    ],
  },
  {
    ...base, id: "python-stats-summary", lesson: "python/77", xp: 25,
    title: "Статистичний підсумок і відтворюваний seed",
    context: "Середнє, медіана, мода й відхилення — стандартний набір для опису даних, а фіксований seed робить випадкові експерименти відтворюваними, що рятує під час налагодження й тестування.",
    brief: [
      "Допишіть <code>summary(nums)</code>: словник із ключами <code>mean</code>, <code>median</code>, <code>mode</code> і <code>pstdev</code> (функції з <code>statistics</code>).",
      "Допишіть <code>same_with_seed(seed)</code>: створіть два генератори <code>random.Random(seed)</code> і перевірте, що вони дають однакові три числа <code>randint(1, 100)</code>.",
    ],
    starter: raw`import random
import statistics


def summary(nums):
    # TODO: {"mean": ..., "median": ..., "mode": ..., "pstdev": ...}
    return {}


def same_with_seed(seed):
    # TODO: два random.Random(seed) дають однакові три числа randint(1, 100) -> True
    return False


print(summary([2, 4, 4, 4, 5, 5, 7, 9]))
print(same_with_seed(42))
`,
    checks: [
      { on: "stdout", name: "Підсумок даних", has: "{'mean': 5, 'median': 4.5, 'mode': 4, 'pstdev': 2.0}", hint: "statistics.mean, median, mode і pstdev; порядок ключів саме такий." },
      { on: "stdout", name: "Однаковий seed дає однакові числа", equals: "{'mean': 5, 'median': 4.5, 'mode': 4, 'pstdev': 2.0}\nTrue", hint: "Порівняйте списки з трьох викликів randint для двох окремих генераторів Random(seed)." },
      { on: "source", name: "Використано statistics і Random", matches: "statistics\\.[\\s\\S]*Random\\(|Random\\([\\s\\S]*statistics\\.", hint: "Потрібні і модуль statistics, і клас random.Random." },
    ],
  },
  {
    ...base, id: "python-json-csv", lesson: "python/78", xp: 35,
    title: "Розбір і запис JSON",
    context: "JSON приходить із API й файлів налаштувань. Прочитати, порахувати, записати назад із читабельною кирилицею й розуміти, що кортеж після круга стане списком, — типовий шматок інтеграційного скрипта.",
    brief: [
      "Допишіть <code>orders_total(text)</code>: розберіть JSON-рядок зі списком замовлень (<code>json.loads</code>) і поверніть суму <code>price * qty</code>.",
      "Допишіть <code>to_json(obj)</code> (JSON із кирилицею, <code>ensure_ascii=False</code>) і <code>roundtrip(obj)</code>: <code>loads(dumps(obj))</code>, щоб побачити втрату типів.",
    ],
    starter: raw`import json


def orders_total(text):
    # TODO: json.loads, потім сума price * qty
    return 0


def to_json(obj):
    # TODO: json.dumps з ensure_ascii=False
    return ""


def roundtrip(obj):
    # TODO: json.loads(json.dumps(obj))
    return None


orders = '[{"item": "Хліб", "price": 25, "qty": 2}, {"item": "Сир", "price": 180, "qty": 1}]'
print(orders_total(orders))
print(to_json({"name": "Оля", "tags": ["a", "b"]}))
print(roundtrip({"k": (1, 2)}))
`,
    checks: [
      { on: "stdout", name: "Сума замовлень: 230", has: "230\n", hint: "sum(o[\"price\"] * o[\"qty\"] for o in json.loads(text))." },
      { on: "stdout", name: "JSON із кирилицею", has: '{"name": "Оля", "tags": ["a", "b"]}', hint: "Додайте ensure_ascii=False до json.dumps." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "230\n{\"name\": \"Оля\", \"tags\": [\"a\", \"b\"]}\n{'k': [1, 2]}", hint: "Кортеж після roundtrip стає списком." },
      { on: "source", name: "Використано loads і dumps", matches: "json\\.loads[\\s\\S]*json\\.dumps|json\\.dumps[\\s\\S]*json\\.loads", hint: "Потрібні обидві функції модуля json." },
    ],
  },
  {
    ...base, id: "python-json-codec", lesson: "python/79", xp: 30,
    title: "JSON для dataclass із датою",
    context: "Стандартний json не вміє записувати дати й власні класи. Функція default підказує, як їх записати, а розбір повертає рядки, тож дату потрібно відновити явно.",
    brief: [
      "Допишіть <code>encode_event(event)</code>: <code>json.dumps(asdict(event), default=..., ensure_ascii=False)</code>, де <code>default</code> перетворює <code>date</code> на рядок ISO.",
      "Допишіть <code>decode_event(text)</code>: розберіть JSON і створіть <code>Event</code>, відновивши дату через <code>date.fromisoformat</code>.",
    ],
    starter: raw`import json
from dataclasses import dataclass, asdict
from datetime import date


@dataclass
class Event:
    name: str
    when: date


def encode_event(event):
    # TODO: json.dumps(asdict(event), default=..., ensure_ascii=False)
    return ""


def decode_event(text):
    # TODO: json.loads, а потім Event(name=..., when=date.fromisoformat(...))
    return None


text = encode_event(Event("Конференція", date(2026, 11, 19)))
print(text)
print(decode_event(text))
`,
    checks: [
      { on: "stdout", name: "Дата записана як рядок ISO", has: '{"name": "Конференція", "when": "2026-11-19"}', hint: "default=lambda o: o.isoformat() перетворює date на рядок." },
      { on: "stdout", name: "Подію відновлено з датою", has: "Event(name='Конференція', when=datetime.date(2026, 11, 19))", hint: "when має бути date, а не рядок: date.fromisoformat(data[\"when\"])." },
      { on: "source", name: "Використано default", has: "default=", hint: "Передайте функцію у параметр default функції json.dumps." },
    ],
  },
  {
    ...base, id: "python-regex-extract", lesson: "python/80", xp: 30,
    title: "Дати, пошта й маскування номера регулярками",
    context: "Витягти з тексту всі дати й адреси, приховати цифри номера телефону — типові завдання для регулярних виразів. Один шаблон замінює десяток рядків ручного розбору.",
    brief: [
      "Допишіть <code>find_dates(text)</code> (усі дати формату <code>РРРР-ММ-ДД</code>), <code>find_emails(text)</code> (адреси виду <code>name@domain.tld</code>) і <code>mask_digits(text)</code> (кожну цифру замінити на <code>*</code>).",
      "Використовуйте <code>re.findall</code> і <code>re.sub</code> та сирі рядки <code>r\"...\"</code>.",
    ],
    starter: raw`import re


def find_dates(text):
    # TODO: re.findall для РРРР-ММ-ДД
    return []


def find_emails(text):
    # TODO: re.findall для name@domain.tld
    return []


def mask_digits(text):
    # TODO: re.sub цифр на *
    return text


text = "Зустріч 2026-11-19, дедлайн 2026-12-01. Пишіть на ann@example.com або bob@test.org"
print(find_dates(text))
print(find_emails(text))
print(mask_digits("Тел: 050-123-45-67"))
`,
    checks: [
      { on: "stdout", name: "Знайдено дві дати", has: "['2026-11-19', '2026-12-01']", hint: "Шаблон r\"\\d{4}-\\d{2}-\\d{2}\"." },
      { on: "stdout", name: "Знайдено дві адреси", has: "['ann@example.com', 'bob@test.org']", hint: "Шаблон на кшталт r\"[\\w.+-]+@[\\w-]+\\.[\\w.-]+\"." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "['2026-11-19', '2026-12-01']\n['ann@example.com', 'bob@test.org']\nТел: ***-***-**-**", hint: "re.sub(r\"\\d\", \"*\", text) замінює кожну цифру." },
      { on: "source", name: "Використано re.sub і re.findall", matches: "re\\.findall[\\s\\S]*re\\.sub|re\\.sub[\\s\\S]*re\\.findall", hint: "Потрібні обидві функції модуля re." },
    ],
  },
  {
    ...base, id: "python-csv-report", lesson: "python/81", xp: 30,
    title: "Підсумки продажів із CSV",
    context: "Звіт із CSV — класична задача: прочитати рядки, перетворити текст на числа, згрупувати за категорією, підсумувати й записати результат назад у CSV для наступного споживача.",
    brief: [
      "Допишіть <code>totals_by_category(text)</code>: прочитайте CSV через <code>DictReader</code> і поверніть словник «категорія: сума <code>price * qty</code>» (значення з CSV — рядки).",
      "Допишіть <code>to_csv(totals)</code>: запишіть словник у CSV із заголовком <code>category,total</code> через <code>DictWriter</code> (<code>io.StringIO</code>) і поверніть текст.",
    ],
    starter: raw`import csv
import io

data = "item,category,price,qty\nХліб,їжа,25,2\nСир,їжа,180,1\nЗошит,канцелярія,40,3\n"


def totals_by_category(text):
    # TODO: DictReader, перетворення price і qty на int, підсумок за категорією
    return {}


def to_csv(totals):
    # TODO: DictWriter(fieldnames=["category", "total"]), writeheader, рядки
    return ""


totals = totals_by_category(data)
print(totals)
print(to_csv(totals).splitlines())
`,
    checks: [
      { on: "stdout", name: "Підсумки за категоріями", has: "{'їжа': 230, 'канцелярія': 120}", hint: "int(row[\"price\"]) * int(row[\"qty\"]), додавайте до totals[category]." },
      { on: "stdout", name: "CSV із заголовком", has: "['category,total', 'їжа,230', 'канцелярія,120']", hint: "DictWriter.writeheader() записує заголовок, а writerow приймає словник." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "{'їжа': 230, 'канцелярія': 120}\n['category,total', 'їжа,230', 'канцелярія,120']", hint: "Мають бути два рядки." },
      { on: "source", name: "Використано DictReader і DictWriter", matches: "DictReader[\\s\\S]*DictWriter|DictWriter[\\s\\S]*DictReader", hint: "Читайте через csv.DictReader, пишіть через csv.DictWriter." },
    ],
  },
  {
    ...base, id: "python-logging-setup", lesson: "python/82", xp: 25,
    title: "Логер із форматом і рівнем",
    context: "Журнал із рівнями відрізняє звичайні події від проблем і вимикається без зміни коду. Для тестів його спрямовують у StringIO, щоб перевіряти точний текст повідомлень.",
    brief: [
      "Допишіть <code>make_logger(stream)</code>: логер <code>report</code> з рівнем <code>INFO</code>, <code>StreamHandler(stream)</code>, форматом <code>%(levelname)s: %(message)s</code> і <code>propagate = False</code>.",
      "Повідомлення рівня DEBUG мають відкидатися, решта потрапляє у потік.",
    ],
    starter: raw`import io
import logging


def make_logger(stream):
    # TODO: logger "report": INFO, StreamHandler(stream), Formatter("%(levelname)s: %(message)s"), propagate=False
    return logging.getLogger("report")


stream = io.StringIO()
logger = make_logger(stream)
logger.debug("відкинуто")
logger.info("старт")
logger.warning("диск майже повний")
logger.error("збій %d", 42)
print(stream.getvalue().strip())
`,
    checks: [
      { on: "stdout", name: "INFO і WARNING записано з форматом", has: "INFO: старт\nWARNING: диск майже повний", hint: "Formatter(\"%(levelname)s: %(message)s\") задає вигляд рядка." },
      { on: "stdout", name: "DEBUG відкинуто, ERROR із підстановкою", equals: "INFO: старт\nWARNING: диск майже повний\nERROR: збій 42", hint: "setLevel(logging.INFO) відкидає DEBUG, а %d підставляє 42." },
      { on: "source", name: "Вимкнено propagate", matches: "propagate\\s*=\\s*False", hint: "logger.propagate = False не дає дублювати повідомлення в корінь." },
    ],
  },
  {
    ...base, id: "python-stdlib-modules", lesson: "python/83", xp: 30,
    title: "Шляхи й аргументи командного рядка",
    context: "Утиліти працюють зі шляхами й аргументами: pathlib розкладає шлях на частини без ручного розбору рядків, а argparse перетворює аргументи на зручний об'єкт і сам формує довідку.",
    brief: [
      "Допишіть <code>describe_path(p)</code> через <code>PurePosixPath</code>: кортеж <code>(name, stem, suffix, parent)</code> (усе рядками).",
      "Допишіть <code>parse_args(argv)</code> через <code>argparse</code>: позиційний <code>input</code>, <code>--limit</code> (int, за замовчуванням 10) і прапорець <code>--verbose</code>.",
    ],
    starter: raw`import argparse
from pathlib import PurePosixPath


def describe_path(p):
    # TODO: (name, stem, suffix, parent) як рядки
    return ()


def parse_args(argv):
    # TODO: ArgumentParser: input, --limit (int, default=10), --verbose (store_true)
    return None


print(describe_path("/data/reports/2026/summary.final.csv"))
args = parse_args(["input.txt", "--limit", "5", "--verbose"])
print(args.input, args.limit, args.verbose)
`,
    checks: [
      { on: "stdout", name: "Шлях розкладено на частини", has: "('summary.final.csv', 'summary.final', '.csv', '/data/reports/2026')", hint: "p.name, p.stem, p.suffix, str(p.parent) для PurePosixPath(p)." },
      { on: "stdout", name: "Аргументи розібрано", equals: "('summary.final.csv', 'summary.final', '.csv', '/data/reports/2026')\ninput.txt 5 True", hint: "parser.parse_args(argv) приймає список; --limit має type=int, а --verbose — action=\"store_true\"." },
      { on: "source", name: "Використано argparse і pathlib", matches: "ArgumentParser[\\s\\S]*PurePosixPath|PurePosixPath[\\s\\S]*ArgumentParser", hint: "Потрібні обидва модулі." },
    ],
  },
  {
    ...base, id: "python-functools-tools", lesson: "python/84", xp: 30,
    title: "reduce, singledispatch і lru_cache",
    context: "functools закриває типові потреби: згорнути послідовність, обрати реалізацію за типом аргумента, запам'ятати результати дорогих обчислень. Кожен інструмент замінює кілька рядків ручного коду.",
    brief: [
      "Допишіть <code>product(nums)</code> через <code>reduce</code> з початковим значенням 1; зареєструйте реалізації <code>describe</code> для <code>int</code> (<code>ціле N</code>) і <code>list</code> (<code>список із N</code>).",
      "Допишіть рекурсивну <code>fib(n)</code> із кешем <code>lru_cache</code>: після <code>fib(30)</code> промахів кешу має бути 31.",
    ],
    starter: raw`from functools import reduce, singledispatch, lru_cache


def product(nums):
    # TODO: reduce із початковим значенням 1
    return 0


@singledispatch
def describe(x):
    return f"щось {x}"


# TODO: @describe.register(int) -> "ціле N"; @describe.register(list) -> "список із N"


@lru_cache(maxsize=None)
def fib(n):
    # TODO: рекурсивно: n, якщо n < 2, інакше fib(n - 1) + fib(n - 2)
    return 0


print(product([1, 2, 3, 4]))
print(describe(5), describe([1, 2]), describe("a"))
print(fib(30), fib.cache_info().misses)
`,
    checks: [
      { on: "stdout", name: "Добуток через reduce", has: "24\n", hint: "reduce(lambda a, b: a * b, nums, 1)." },
      { on: "stdout", name: "Диспетчеризація за типом", has: "ціле 5 список із 2 щось a", hint: "@describe.register(int) і @describe.register(list) над окремими функціями." },
      { on: "stdout", name: "Кеш Фібоначчі", equals: "24\nціле 5 список із 2 щось a\n832040 31", hint: "fib(30) = 832040, а промахів кешу 31 (значення від 0 до 30)." },
      { on: "source", name: "Використано register", has: ".register(", hint: "Реалізації для типів додаються через describe.register." },
    ],
  },
  {
    ...base, id: "python-report-format", lesson: "python/85", xp: 30,
    title: "Шаблон звіту й перенесення тексту",
    context: "Шаблони листів і звітів зберігають окремо від коду, а довгий текст переносять за шириною. string.Template безпечніший за format для чужих шаблонів, а textwrap дає охайні рядки.",
    brief: [
      "Допишіть <code>render(template, data)</code> через <code>safe_substitute</code>: відсутні значення лишаються як є. Допишіть <code>short(text, width)</code> через <code>textwrap.shorten</code> із заповнювачем <code>…</code> та <code>wrap_text(text, width)</code> через <code>textwrap.wrap</code>.",
      "Решта коду демонструє ці функції на шаблоні привітання й реченні про Python.",
    ],
    starter: raw`import textwrap
from string import Template


def render(template, data):
    # TODO: template.safe_substitute(data)
    return ""


def short(text, width):
    # TODO: textwrap.shorten із placeholder="…"
    return text


def wrap_text(text, width):
    # TODO: textwrap.wrap
    return []


tpl = Template("Привіт, $name! Ваш баланс: $balance грн.")
print(render(tpl, {"name": "Оля", "balance": 120}))
print(render(tpl, {"name": "Іван"}))
text = "Python — це мова програмування, яку люблять за простоту."
print(short(text, 30))
print(wrap_text(text, 20))
`,
    checks: [
      { on: "stdout", name: "Шаблон заповнено", has: "Привіт, Оля! Ваш баланс: 120 грн.", hint: "template.safe_substitute(data) приймає словник." },
      { on: "stdout", name: "Відсутнє значення лишається", has: "Привіт, Іван! Ваш баланс: $balance грн.", hint: "safe_substitute не кидає KeyError, а залишає $balance." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Привіт, Оля! Ваш баланс: 120 грн.\nПривіт, Іван! Ваш баланс: $balance грн.\nPython — це мова…\n['Python — це мова', 'програмування, яку', 'люблять за простоту.']", hint: "shorten(text, width, placeholder=\"…\") і wrap(text, width)." },
      { on: "source", name: "Використано textwrap і Template", matches: "textwrap\\.[\\s\\S]*safe_substitute|safe_substitute[\\s\\S]*textwrap\\.", hint: "Потрібні і textwrap, і safe_substitute." },
    ],
  },
];
