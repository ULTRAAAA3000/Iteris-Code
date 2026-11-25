// Практичні завдання глави «Архітектура» (уроки 100–105). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_11: readonly RemoteTask[] = [
  {
    ...base, id: "python-layers-orders", lesson: "python/100", xp: 40,
    title: "Замовлення у трьох шарах",
    context: "Розкладіть сервіс по шарах: репозиторій зберігає дані, сервіс містить правила, handler перетворює результат і помилки на статуси. Тоді кожен шар можна змінювати й тестувати окремо.",
    brief: [
      "Допишіть <code>OrderRepository</code> (<code>add</code> і <code>get</code>), <code>OrderService</code> (<code>place</code> із перевіркою порожнього замовлення й підрахунком суми; <code>get</code> із <code>NotFoundError</code>) і <code>handler(call)</code>.",
      "Handler повертає <code>(200, результат)</code>, а помилки перетворює: <code>NotFoundError</code> на <code>404</code>, <code>ValidationError</code> на <code>422</code> із <code>{\"error\": текст}</code>.",
    ],
    starter: raw`class NotFoundError(Exception):
    pass


class ValidationError(Exception):
    pass


class OrderRepository:
    # TODO: add(items, total) -> {"id": ..., "items": ..., "total": ...}; get(order_id) -> словник або None
    pass


class OrderService:
    PRICES = {"хліб": 25, "сир": 180, "молоко": 42}

    def __init__(self, repo):
        self.repo = repo

    def place(self, items):
        # TODO: порожній список -> ValidationError("замовлення порожнє"); сума цін; repo.add
        pass

    def get(self, order_id):
        # TODO: NotFoundError(f"замовлення {order_id} не знайдено"), якщо немає
        pass


def handler(call):
    # TODO: (200, call()); NotFoundError -> (404, {"error": ...}); ValidationError -> (422, {"error": ...})
    return 500, None


service = OrderService(OrderRepository())
print(handler(lambda: service.place(["хліб", "сир"])))
print(handler(lambda: service.place([])))
print(handler(lambda: service.get(1)["total"]))
print(handler(lambda: service.get(99)))
`,
    checks: [
      { on: "stdout", name: "Замовлення створено з сумою", has: "(200, {'id': 1, 'items': ['хліб', 'сир'], 'total': 205})", hint: "Репозиторій видає id, а сервіс рахує суму через PRICES." },
      { on: "stdout", name: "Порожнє замовлення: 422", has: "(422, {'error': 'замовлення порожнє'})", hint: "Сервіс кидає ValidationError, а handler перетворює його на 422." },
      { on: "stdout", name: "Відсутнє замовлення: 404", equals: "(200, {'id': 1, 'items': ['хліб', 'сир'], 'total': 205})\n(422, {'error': 'замовлення порожнє'})\n(200, 205)\n(404, {'error': 'замовлення 99 не знайдено'})", hint: "Сервіс не знає про HTTP-статуси, їх вибирає handler." },
      { on: "source", name: "Handler перехоплює доменні помилки", matches: "except\\s+NotFoundError[\\s\\S]*except\\s+ValidationError", hint: "У handler два блоки except для двох доменних помилок." },
    ],
  },
  {
    ...base, id: "python-di-notifier", lesson: "python/101", xp: 35,
    title: "Сервіс із впровадженою залежністю",
    context: "Сервіс не створює пошту чи базу сам, а отримує їх через конструктор. У тесті замість справжньої пошти підставляється підробка, що запам'ятовує повідомлення, тож нічого не надсилається назовні.",
    brief: [
      "Допишіть <code>OrderService</code>: конструктор приймає <code>repo</code> і <code>notifier</code>; метод <code>place(name, total)</code> зберігає замовлення в репозиторії й надсилає повідомлення <code>Замовлення N на TOTAL грн прийнято</code>.",
      "Допишіть <code>RecordingNotifier</code>, що в списку <code>sent</code> запам'ятовує кортежі <code>(to, text)</code>.",
    ],
    starter: raw`from typing import Protocol


class Notifier(Protocol):
    def send(self, to: str, text: str) -> None: ...


class MemoryRepo:
    def __init__(self):
        self.rows = []

    def add(self, name, total):
        self.rows.append((name, total))
        return len(self.rows)


class RecordingNotifier:
    # TODO: sent = [] у __init__; send(to, text) додає (to, text)
    pass


class OrderService:
    # TODO: __init__(self, repo, notifier); place(name, total): repo.add, потім notifier.send
    pass


notifier = RecordingNotifier()
service = OrderService(MemoryRepo(), notifier)
print(service.place("Оля", 205))
print(notifier.sent)
`,
    checks: [
      { on: "stdout", name: "place повертає id замовлення", has: "1\n", hint: "Поверніть те, що повернув repo.add." },
      { on: "stdout", name: "Повідомлення надіслано через підробку", equals: "1\n[('Оля', 'Замовлення 1 на 205 грн прийнято')]", hint: "notifier.send(name, f\"Замовлення {order_id} на {total} грн прийнято\")." },
      { on: "source", name: "Залежності передаються через конструктор", matches: "def\\s+__init__\\(self,\\s*repo,\\s*notifier\\)", hint: "Конструктор сервісу: __init__(self, repo, notifier)." },
    ],
  },
  {
    ...base, id: "python-safe-store", lesson: "python/102", xp: 35,
    title: "Потокобезпечне сховище",
    context: "Сховище в пам'яті, яким користуються кілька потоків, мусить видавати унікальні ідентифікатори й не віддавати назовні свої внутрішні об'єкти. Для цього потрібні замок і копії.",
    brief: [
      "Додайте у <code>Store</code> замок <code>threading.Lock()</code> і захистіть ним весь метод <code>add</code> (видача id і збереження).",
      "Метод <code>get</code> має повертати копію запису, щоб зміна результату не торкалася сховища.",
    ],
    starter: raw`import threading
import time


class Store:
    def __init__(self):
        self._items = {}
        self._next_id = 1
        # TODO: замок

    def add(self, value):
        # TODO: виконайте тіло під замком
        item_id = self._next_id
        time.sleep(0)
        self._items[item_id] = dict(value)
        self._next_id = item_id + 1
        return item_id

    def get(self, item_id):
        # TODO: поверніть копію запису
        return self._items[item_id]

    def __len__(self):
        return len(self._items)


store = Store()
ids = []


def work():
    for _ in range(100):
        ids.append(store.add({"x": 1}))


threads = [threading.Thread(target=work) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(len(store), len(set(ids)))
item = store.get(1)
item["x"] = 99
print(store.get(1)["x"] == 99)
`,
    checks: [
      { on: "stdout", name: "Усі id унікальні", has: "400 400\n", hint: "Весь add має виконуватись під with self._lock:." },
      { on: "stdout", name: "get повертає копію", equals: "400 400\nFalse", hint: "return dict(self._items[item_id]) (або copy.deepcopy)." },
      { on: "source", name: "Є замок і with", matches: "Lock\\(\\)[\\s\\S]*with\\s+self\\._lock", hint: "Створіть self._lock = threading.Lock() і користуйтеся with self._lock:." },
    ],
  },
  {
    ...base, id: "python-settings-env", lesson: "python/103", xp: 35,
    title: "Налаштування зі змінних середовища",
    context: "Конфігурацію збирають в один незмінний об'єкт із типами й перевіркою обов'язкових полів. Параметр env робить фабрику тестованою: у тесті передається звичайний словник замість справжнього середовища.",
    brief: [
      "Допишіть <code>Settings.from_env(env)</code>: <code>DB_URL</code> обов'язкова (інакше <code>ConfigError(\"змінна DB_URL обов'язкова\")</code>), <code>PORT</code> за замовчуванням 8000 (ціле), <code>DEBUG</code> за замовчуванням false (булеве через <code>parse_bool</code>).",
      "Поля класу: <code>db_url</code>, <code>port</code>, <code>debug</code>; датаклас незмінний.",
    ],
    starter: raw`from dataclasses import dataclass


class ConfigError(Exception):
    pass


def parse_bool(text):
    return text.strip().lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Settings:
    db_url: str
    port: int = 8000
    debug: bool = False

    @classmethod
    def from_env(cls, env):
        # TODO: прочитайте DB_URL (обов'язкова), PORT, DEBUG; кидайте ConfigError
        return cls(db_url="")


print(Settings.from_env({"DB_URL": "sqlite://", "PORT": "9000", "DEBUG": "yes"}))
print(Settings.from_env({"DB_URL": "sqlite://"}))
try:
    Settings.from_env({})
except ConfigError as e:
    print(e)
`,
    checks: [
      { on: "stdout", name: "Значення з середовища", has: "Settings(db_url='sqlite://', port=9000, debug=True)", hint: "int(env.get(\"PORT\", \"8000\")) і parse_bool(env.get(\"DEBUG\", \"false\"))." },
      { on: "stdout", name: "Значення за замовчуванням", has: "Settings(db_url='sqlite://', port=8000, debug=False)", hint: "Без PORT і DEBUG діють значення за замовчуванням." },
      { on: "stdout", name: "Обов'язкова змінна", equals: "Settings(db_url='sqlite://', port=9000, debug=True)\nSettings(db_url='sqlite://', port=8000, debug=False)\nзмінна DB_URL обов'язкова", hint: "Якщо \"DB_URL\" not in env, киньте ConfigError з вказаним текстом." },
      { on: "source", name: "Фабрика читає env, а не os.environ", matches: "os\\.environ", not: true, hint: "Використовуйте параметр env, щоб тест міг передати власний словник." },
    ],
  },
  {
    ...base, id: "python-sqlite-notes", lesson: "python/104", xp: 40,
    title: "Нотатки в SQLite із захистом від ін'єкцій",
    context: "Параметризовані запити захищають від SQL-ін'єкцій, а обмеження UNIQUE у схемі не дають створити дублікат. База в пам'яті не потребує файлів і ідеальна для тестів.",
    brief: [
      "Допишіть <code>init_db</code> (таблиця <code>notes</code> з <code>id INTEGER PRIMARY KEY</code> і унікальним <code>title</code>), <code>add_note</code> (повертає id або <code>None</code> при дублікаті через <code>IntegrityError</code>) і <code>search</code> (назви, що містять підрядок, за алфавітом).",
      "Усі значення передавайте параметрами <code>?</code>, а для пошуку скористайтеся <code>LIKE ?</code> із значенням <code>f\"%{term}%\"</code>.",
    ],
    starter: raw`import sqlite3


def init_db(conn):
    # TODO: CREATE TABLE notes (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)
    pass


def add_note(conn, title):
    # TODO: INSERT з параметром; IntegrityError -> None; інакше lastrowid
    return None


def search(conn, term):
    # TODO: SELECT title ... WHERE title LIKE ? ORDER BY title
    return []


conn = sqlite3.connect(":memory:")
init_db(conn)
print(add_note(conn, "купити хліб"))
print(add_note(conn, "купити молоко"))
print(add_note(conn, "купити хліб"))
print(search(conn, "хліб"))
print(search(conn, "x' OR '1'='1"))
print(search(conn, "купити"))
`,
    checks: [
      { on: "stdout", name: "Ідентифікатори й дублікат", has: "1\n2\nNone\n", hint: "cursor.lastrowid повертає id нового рядка, а при IntegrityError поверніть None." },
      { on: "stdout", name: "Пошук і захист від ін'єкції", equals: "1\n2\nNone\n['купити хліб']\n[]\n['купити молоко', 'купити хліб']", hint: "Значення для LIKE передавайте параметром, тоді рядок із лапками не зламає запит." },
      { on: "source", name: "Використано параметри ?", has: "?", hint: "Підставляйте значення через ? і кортеж, а не f-рядком у SQL." },
      { on: "source", name: "Перехоплення IntegrityError", has: "IntegrityError", hint: "except sqlite3.IntegrityError: return None." },
    ],
  },
  {
    ...base, id: "python-json-logs", lesson: "python/105", xp: 35,
    title: "Структуровані JSON-логи",
    context: "Структурований запис журналу — це JSON із полями, за якими системи моніторингу фільтрують і групують події. Додаткові дані передаються через extra й виводяться окремими полями.",
    brief: [
      "Допишіть <code>JsonFormatter.format(record)</code>: словник з <code>level</code>, <code>event</code> (повідомлення) і всіма додатковими полями запису (ті, яких немає в <code>RESERVED</code>), записаний як JSON із <code>ensure_ascii=False</code> та <code>sort_keys=True</code>.",
      "Решта коду підключає форматувальник до логера з виводом у <code>StringIO</code> і пише дві події.",
    ],
    starter: raw`import io
import json
import logging

RESERVED = set(vars(logging.LogRecord("", 0, "", 0, "", (), None)))


class JsonFormatter(logging.Formatter):
    def format(self, record):
        # TODO: {"level": ..., "event": ..., + поля з extra} -> json.dumps(..., ensure_ascii=False, sort_keys=True)
        return record.getMessage()


stream = io.StringIO()
handler = logging.StreamHandler(stream)
handler.setFormatter(JsonFormatter())
log = logging.getLogger("jsonlog")
log.setLevel(logging.INFO)
log.addHandler(handler)
log.propagate = False

log.info("order_created", extra={"user_id": 42, "order_id": 7})
log.warning("disk_full")
print(stream.getvalue().strip())
`,
    checks: [
      { on: "stdout", name: "Подія з додатковими полями", has: '{"event": "order_created", "level": "INFO", "order_id": 7, "user_id": 42}', hint: "Додайте до словника всі атрибути запису, яких немає в RESERVED." },
      { on: "stdout", name: "Подія без додаткових полів", equals: '{"event": "order_created", "level": "INFO", "order_id": 7, "user_id": 42}\n{"event": "disk_full", "level": "WARNING"}', hint: "Рівень береться з record.levelname, повідомлення з record.getMessage()." },
      { on: "source", name: "Використано json.dumps", has: "json.dumps(", hint: "Серіалізуйте словник через json.dumps." },
    ],
  },
];
