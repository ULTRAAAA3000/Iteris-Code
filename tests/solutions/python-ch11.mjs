// Еталонні рішення завдань Python, глава 11 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_11 = {
  "python-layers-orders": raw`class NotFoundError(Exception):
    pass


class ValidationError(Exception):
    pass


class OrderRepository:
    def __init__(self):
        self._orders = {}
        self._next_id = 1

    def add(self, items, total):
        order = {"id": self._next_id, "items": items, "total": total}
        self._orders[self._next_id] = order
        self._next_id += 1
        return order

    def get(self, order_id):
        return self._orders.get(order_id)


class OrderService:
    PRICES = {"хліб": 25, "сир": 180, "молоко": 42}

    def __init__(self, repo):
        self.repo = repo

    def place(self, items):
        if not items:
            raise ValidationError("замовлення порожнє")
        total = sum(self.PRICES[item] for item in items)
        return self.repo.add(items, total)

    def get(self, order_id):
        order = self.repo.get(order_id)
        if order is None:
            raise NotFoundError(f"замовлення {order_id} не знайдено")
        return order


def handler(call):
    try:
        return 200, call()
    except NotFoundError as e:
        return 404, {"error": str(e)}
    except ValidationError as e:
        return 422, {"error": str(e)}


service = OrderService(OrderRepository())
print(handler(lambda: service.place(["хліб", "сир"])))
print(handler(lambda: service.place([])))
print(handler(lambda: service.get(1)["total"]))
print(handler(lambda: service.get(99)))
`,
  "python-di-notifier": raw`from typing import Protocol


class Notifier(Protocol):
    def send(self, to: str, text: str) -> None: ...


class MemoryRepo:
    def __init__(self):
        self.rows = []

    def add(self, name, total):
        self.rows.append((name, total))
        return len(self.rows)


class RecordingNotifier:
    def __init__(self):
        self.sent = []

    def send(self, to, text):
        self.sent.append((to, text))


class OrderService:
    def __init__(self, repo, notifier):
        self.repo = repo
        self.notifier = notifier

    def place(self, name, total):
        order_id = self.repo.add(name, total)
        self.notifier.send(name, f"Замовлення {order_id} на {total} грн прийнято")
        return order_id


notifier = RecordingNotifier()
service = OrderService(MemoryRepo(), notifier)
print(service.place("Оля", 205))
print(notifier.sent)
`,
  "python-safe-store": raw`import threading
import time


class Store:
    def __init__(self):
        self._items = {}
        self._next_id = 1
        self._lock = threading.Lock()

    def add(self, value):
        with self._lock:
            item_id = self._next_id
            time.sleep(0)
            self._items[item_id] = dict(value)
            self._next_id = item_id + 1
            return item_id

    def get(self, item_id):
        with self._lock:
            return dict(self._items[item_id])

    def __len__(self):
        with self._lock:
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
  "python-settings-env": raw`from dataclasses import dataclass


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
        if "DB_URL" not in env:
            raise ConfigError("змінна DB_URL обов'язкова")
        return cls(
            db_url=env["DB_URL"],
            port=int(env.get("PORT", "8000")),
            debug=parse_bool(env.get("DEBUG", "false")),
        )


print(Settings.from_env({"DB_URL": "sqlite://", "PORT": "9000", "DEBUG": "yes"}))
print(Settings.from_env({"DB_URL": "sqlite://"}))
try:
    Settings.from_env({})
except ConfigError as e:
    print(e)
`,
  "python-sqlite-notes": raw`import sqlite3


def init_db(conn):
    conn.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, title TEXT NOT NULL UNIQUE)")
    conn.commit()


def add_note(conn, title):
    try:
        with conn:
            cursor = conn.execute("INSERT INTO notes (title) VALUES (?)", (title,))
    except sqlite3.IntegrityError:
        return None
    return cursor.lastrowid


def search(conn, term):
    rows = conn.execute(
        "SELECT title FROM notes WHERE title LIKE ? ORDER BY title", (f"%{term}%",)
    ).fetchall()
    return [row[0] for row in rows]


conn = sqlite3.connect(":memory:")
init_db(conn)
print(add_note(conn, "купити хліб"))
print(add_note(conn, "купити молоко"))
print(add_note(conn, "купити хліб"))
print(search(conn, "хліб"))
print(search(conn, "x' OR '1'='1"))
print(search(conn, "купити"))
`,
  "python-json-logs": raw`import io
import json
import logging

RESERVED = set(vars(logging.LogRecord("", 0, "", 0, "", (), None)))


class JsonFormatter(logging.Formatter):
    def format(self, record):
        data = {"level": record.levelname, "event": record.getMessage()}
        data.update({k: v for k, v in vars(record).items() if k not in RESERVED})
        return json.dumps(data, ensure_ascii=False, sort_keys=True)


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
};
