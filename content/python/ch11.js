export const LESSONS_11 = [
  {
    t: "Шари: handler, service, repository",
    ch: "Архітектура",
    easy: "Хороша програма влаштована як ресторан: офіціант приймає замовлення, кухар готує страву за правилами, комірник видає продукти. Кожен робить свою справу й не лізе в чужу, тому зміна одного не ламає інших.",
    p: [
      "Коли вся логіка сервісу лежить в одній функції-обробнику, вона швидко стає невпорядкованою: розбір запиту, перевірка правил, запити до бази й формування відповіді перемішані. Таку функцію важко тестувати (потрібні і HTTP, і база), важко змінювати (правка однієї частини ламає іншу) і неможливо використати повторно, скажімо, з командного рядка. Рішення — розділити код на шари, кожен із власною відповідальністю.",
      "Класична схема має три шари. <b>Handler</b> (контролер, транспортний шар) працює з HTTP: читає запит, розбирає параметри, викликає сервіс і перетворює результат на відповідь зі статусом. <b>Service</b> (шар бізнес-логіки) містить правила предметної області: що можна, що ні, які перевірки, які обчислення. <b>Repository</b> (шар даних) ховає, де й як зберігаються дані: база, файл чи пам'ять. Кожен шар знає лише про той, що нижче.",
      "Напрямок залежностей лише один: handler → service → repository. Сервіс нічого не знає про HTTP: він приймає звичайні параметри й повертає звичайні об'єкти чи кидає доменні винятки (<code>NotFoundError</code>, <code>ValidationError</code>). Репозиторій нічого не знає про бізнес-правила: він лише зберігає й повертає. Handler перетворює доменні винятки на статуси: <code>NotFoundError</code> стає <code>404</code>, <code>ValidationError</code> — <code>422</code>. Зворотних залежностей бути не повинно.",
      "Для передачі даних між шарами використовують прості структури: датакласи або словники. Не передавайте між шарами «сирі» запити чи рядки з бази: на межі шару дані перетворюють на доменні об'єкти. Так внутрішні шари не залежать від форматів зовнішнього світу. Назви в сервісі відображають мову предметної області (<code>place_order</code>, <code>cancel_order</code>), а не технічні подробиці (<code>insert_row</code>).",
      "Головна користь шарів — тестованість. Сервіс перевіряють без HTTP і без бази: підставляють у нього репозиторій у пам'яті й викликають методи напряму. Handler перевіряють із підробним сервісом, переконуючись лише, що він правильно відображає результати й помилки на відповіді. Репозиторій перевіряють окремо, з реальною базою. Кожен шар тестується швидко й ізольовано, а помилка швидко локалізується.",
      "Уникайте типових помилок. «Товстий handler», у якому живе вся логіка. Сервіс, який імпортує <code>request</code> чи формує JSON-відповідь. Репозиторій, який перевіряє бізнес-правила. Витік деталей бази (SQL, імена колонок) нагору. Надмірна абстракція: для маленького скрипта три шари — зайвий церемоніал, і розділяти варто, коли справді з'являється складність. Але звичка тримати транспорт, логіку й дані окремо окупається на будь-якому проєкті, що живе довше за кілька тижнів.",
      "Збирають шари в одному місці — «корені композиції» (composition root), зазвичай у точці входу: створюють репозиторій, передають його в сервіс, сервіс у handler. Усі решта частини отримують залежності через конструктор, а не створюють їх самі. Це веде до наступного уроку про впровадження залежностей, де ми побачимо, як протоколи роблять шари ще незалежнішими й дозволяють підміняти реалізації у тестах і в робочому коді.",
    ],
    code: [
      String.raw`class OrderRepository:
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

repo = OrderRepository()
print(repo.add(["хліб"], 25))
print(repo.get(1), repo.get(99))
`,
      String.raw`class NotFoundError(Exception):
    pass

class ValidationError(Exception):
    pass

class OrderService:
    def __init__(self, repo):
        self.repo = repo

    def place(self, items, prices):
        if not items:
            raise ValidationError("замовлення порожнє")
        total = sum(prices[item] for item in items)
        return self.repo.add(items, total)

    def get(self, order_id):
        order = self.repo.get(order_id)
        if order is None:
            raise NotFoundError(f"замовлення {order_id} не знайдено")
        return order

class FakeRepo:
    def __init__(self):
        self.saved = []
    def add(self, items, total):
        order = {"id": len(self.saved) + 1, "items": items, "total": total}
        self.saved.append(order)
        return order
    def get(self, order_id):
        return next((o for o in self.saved if o["id"] == order_id), None)

service = OrderService(FakeRepo())
print(service.place(["хліб", "сир"], {"хліб": 25, "сир": 180}))
print(service.get(1)["total"])
`,
      String.raw`class NotFoundError(Exception):
    pass

class ValidationError(Exception):
    pass

def handler(service_call):
    """Перетворює результат і доменні помилки сервісу на пару (статус, дані)."""
    try:
        return 200, service_call()
    except NotFoundError as e:
        return 404, {"error": str(e)}
    except ValidationError as e:
        return 422, {"error": str(e)}

def not_found():
    raise NotFoundError("немає такого")

def invalid():
    raise ValidationError("дані некоректні")

print(handler(lambda: {"ok": True}))
print(handler(not_found))
print(handler(invalid))
`,
      String.raw`class Repo:
    def __init__(self):
        self.data = {1: "перший"}

    def get(self, key):
        return self.data.get(key)

class Service:
    def __init__(self, repo):
        self.repo = repo

    def title(self, key):
        value = self.repo.get(key)
        return value.upper() if value else "немає"

def build():
    """Корінь композиції: збираємо шари разом."""
    return Service(Repo())

service = build()
print(service.title(1), service.title(2))
`,
      String.raw`# аварія: доменну помилку нікому обробити
class NotFoundError(Exception):
    pass

def service_get(order_id):
    raise NotFoundError(f"замовлення {order_id} не знайдено")

print("виклик сервісу")
service_get(7)
`,
    ],
    note: "Handler перекладає HTTP на виклики сервісу й помилки на статуси, service містить правила предметної області, repository зберігає дані. Залежності йдуть лише вниз, а збираються шари в одному місці — корені композиції.",
    work: "Шарова архітектура — стандарт для бекенд-сервісів: вона дозволяє тестувати правила без HTTP і бази, замінювати сховище без переписування логіки й розподіляти роботу між розробниками. Уміння розкласти код по шарах — типова вимога на співбесідах для middle-розробників.",
    tasks: [
      "Розділіть код створення замовлення на репозиторій, сервіс і handler так, щоб сервіс не знав про HTTP, а handler — про зберігання.",
      "Напишіть тест сервісу з підробним репозиторієм, що перевіряє підрахунок суми й помилку для порожнього замовлення.",
    ],
  },
  {
    t: "Залежності й Protocol",
    ch: "Архітектура",
    easy: "Якщо техніку на кухні кожного разу будувати з нуля, нічого не вийде. Краще, щоб кухар отримував готову плиту ззовні: тоді її легко замінити, а для тренування підставити іграшкову.",
    p: [
      "Залежність — це все, з чим клас чи функція працює для виконання своєї справи: база даних, годинник, поштовий клієнт, інший сервіс. Є два способи її отримати. Перший: створити всередині (<code>self.db = PostgresDb()</code>). Другий: отримати ззовні як параметр (<code>def __init__(self, db)</code>). Другий спосіб називається впровадженням залежностей (dependency injection), і він робить код гнучким і тестованим.",
      "Чому створення всередині шкодить? Клас жорстко прив'язаний до конкретної реалізації: щоб протестувати його, довелося б мати справжню базу чи справжню пошту. Не вдасться підмінити реалізацію (скажімо, перейти з SMTP на сервіс розсилки), не змінивши класу. А прихована залежність від глобального об'єкта чи часу робить поведінку непередбачуваною. Конструктор, що явно перелічує залежності, одразу показує, що потрібно класу.",
      "Щоб залежність можна було підміняти, клас має залежати не від конкретної реалізації, а від <b>інтерфейсу</b>: набору методів, який вона має підтримувати. У Python його описують через <code>Protocol</code>: <code>class Notifier(Protocol): def send(self, to, text) -&gt; None</code>. Будь-який об'єкт із таким методом підходить: справжній поштовий клієнт, SMS-шлюз чи тестова заглушка, яка просто запам'ятовує повідомлення. Ніякого спільного предка не потрібно.",
      "Для тестів пишуть прості підробки (fakes): <code>class RecordingNotifier</code> зберігає всі надіслані повідомлення у списку, і тест перевіряє цей список. Це простіше й зрозуміліше за моки, бо підробка — звичайний код без налаштувань. Підробка може мати й логіку: репозиторій у пам'яті поводиться як справжній, але працює зі словником. Тести з такими підробками швидкі, не залежать від зовнішнього світу й читаються як специфікація.",
      "Усі залежності збирають в одному місці — у «корені композиції», зазвичай у точці входу застосунку: <code>def build_app(): notifier = SmtpNotifier(...); repo = SqlRepo(...); service = OrderService(repo, notifier); return Handler(service)</code>. Решта коду просто отримує те, що потрібно, і нічого не створює самостійно. Для великих застосунків існують контейнери залежностей, але для більшості проєктів достатньо ручного збирання: воно прозоре й не потребує бібліотек.",
      "Корисна ідіома Python — значення за замовчуванням для зручності: <code>def __init__(self, repo, clock=None): self.clock = clock or SystemClock()</code>. Звичайний код може не передавати годинник, а тест підставить фіксований. Також безпосередньо як залежності використовують функції: <code>def __init__(self, now=datetime.now)</code> дозволяє в тесті передати <code>lambda: fixed_time</code>. Не потрібно створювати класи там, де достатньо функції.",
      "Не перебирайте з абстракціями. Інтерфейс потрібен там, де справді є кілька реалізацій чи потреба в підміні (зовнішні системи, час, випадковість, ввід-вивід). Для внутрішніх допоміжних класів, що завжди одні, окремий протокол лише додає шарів. Хороше правило: введіть абстракцію, коли з'являється друга реалізація або коли тест без неї стає болючим. А інакше достатньо звичайного конструктора з параметрами.",
    ],
    code: [
      String.raw`from typing import Protocol

class Notifier(Protocol):
    def send(self, to: str, text: str) -> None: ...

class EmailNotifier:
    def send(self, to, text):
        print(f"EMAIL до {to}: {text}")

class RecordingNotifier:
    def __init__(self):
        self.sent = []

    def send(self, to, text):
        self.sent.append((to, text))

def welcome(notifier: Notifier, name: str):
    notifier.send(f"{name}@example.com", f"Вітаємо, {name}!")

welcome(EmailNotifier(), "oля")
fake = RecordingNotifier()
welcome(fake, "ivan")
print(fake.sent)
`,
      String.raw`class OrderService:
    def __init__(self, repo, notifier):
        self.repo = repo
        self.notifier = notifier

    def place(self, name, total):
        order_id = self.repo.add(name, total)
        self.notifier.send(name, f"Замовлення {order_id} на {total} грн прийнято")
        return order_id

class MemoryRepo:
    def __init__(self):
        self.rows = []
    def add(self, name, total):
        self.rows.append((name, total))
        return len(self.rows)

class Recorder:
    def __init__(self):
        self.sent = []
    def send(self, to, text):
        self.sent.append(text)

notifier = Recorder()
service = OrderService(MemoryRepo(), notifier)
print(service.place("Оля", 205))
print(notifier.sent)
`,
      String.raw`from datetime import datetime

class Greeter:
    def __init__(self, now=datetime.now):
        self.now = now

    def greeting(self):
        hour = self.now().hour
        return "Доброго ранку" if hour < 12 else "Доброго дня"

print(Greeter(now=lambda: datetime(2026, 11, 19, 8)).greeting())
print(Greeter(now=lambda: datetime(2026, 11, 19, 15)).greeting())
print(Greeter().greeting() in ("Доброго ранку", "Доброго дня"))
`,
      String.raw`class Service:
    def __init__(self, repo, clock):
        self.repo = repo
        self.clock = clock

def build_app():
    """Корінь композиції: усі залежності створюються тут."""
    class Repo: ...
    class Clock: ...
    return Service(Repo(), Clock())

app = build_app()
print(type(app.repo).__name__, type(app.clock).__name__)
`,
      String.raw`# аварія: залежність не передано
class Service:
    def __init__(self, repo, notifier):
        self.repo = repo
        self.notifier = notifier

print("створюємо сервіс")
Service(repo="сховище")
`,
    ],
    note: "Отримуйте залежності через конструктор, описуйте їх протоколом, а в тестах підставляйте прості підробки. Збирайте все в одному місці — корені композиції, а абстракцію вводьте, коли з'являється друга реалізація або тест без неї болить.",
    work: "Впровадження залежностей — головна техніка, що робить код тестованим і гнучким: без неї кожен тест тягне за собою базу й мережу. У FastAPI воно вбудоване в механізм <code>Depends</code>, а в інших фреймворках його реалізують контейнери.",
    tasks: [
      "Опишіть протокол <code>Notifier</code>, підробку, що запам'ятовує повідомлення, і сервіс, який отримує її через конструктор, а потім перевірте список надісланих повідомлень.",
      "Зробіть залежність від часу параметром (функція <code>now</code>) і перевірте вітання для ранку й вечора з фіксованим часом.",
    ],
  },
  {
    t: "Сховище в пам'яті з Lock",
    ch: "Архітектура",
    easy: "Спільна шафа з документами в офісі потребує правил: хто береться за папку, той має її закрити від інших, поки працює. Інакше двоє одночасно перепишуть один і той самий аркуш, і хтось втратить роботу.",
    p: [
      "Репозиторій у пам'яті — це словник із методами <code>add</code>, <code>get</code>, <code>update</code> і <code>delete</code>. Для тестів і прототипів цього достатньо. Але якщо цей самий об'єкт використовують кілька потоків (наприклад, сервер обробляє запити паралельно), виникають гонки даних: два потоки одночасно додають записи й отримують однаковий ідентифікатор або затирають зміни одне одного. Тому сховище в пам'яті для багатопотокового застосунку обов'язково захищають замком.",
      "Замок (<code>threading.Lock</code>) оголошують у <code>__init__</code> і використовують через <code>with self._lock:</code> у кожному методі, що читає чи змінює спільний стан. Критичною секцією вважають мінімальний набір дій, які мають виконатись нерозривно: «взяти наступний ідентифікатор, зберегти запис, збільшити лічильник». Замок має охороняти й читання, а не лише запис, інакше читач побачить стан посеред зміни.",
      "Коли метод одного сховища викликає інший метод того ж сховища, обидва беруть замок, і звичайний <code>Lock</code> заблокує потік, що тримає його. Для таких випадків потрібен <code>RLock</code>, який той самий потік може захопити повторно. Інший шлях — розділити методи на публічні (беруть замок) і внутрішні (<code>_add_unlocked</code>, не беруть). Другий підхід чистіший, бо точно видно, де замок утримується.",
      "Ще одна пастка — псевдоніми. Якщо метод <code>get</code> повертає сам об'єкт, що лежить у сховищі, зовнішній код може змінити його поза замком, і сховище отримає зіпсований стан без жодного виклику його методів. Тому сховище повертає <b>копії</b> (<code>copy.deepcopy</code> чи нові датакласи) і зберігає копії того, що отримало. Так внутрішній стан змінюється тільки через методи, що тримають замок.",
      "Для сценарію «прочитав, змінив, записав» (оновлення лічильника, зміна статусу) самого замка в методах недостатньо: між <code>get</code> і <code>update</code> інший потік може змінити запис. Рішення — оптимістичне блокування: у кожного запису є поле <code>version</code>, і <code>update(item, expected_version)</code> перевіряє, що версія не змінилась, інакше кидає <code>VersionConflict</code>. Клієнт перечитує запис і повторює спробу. Так само працюють багато баз даних і HTTP-заголовки ETag.",
      "Транзакції з кількох операцій (перенести елемент з одного списку в інший) зручно виражати контекстним менеджером: <code>with store.transaction():</code> захоплює замок, виконує зміни й у разі винятку відкочує їх, повертаючи копію попереднього стану. Це проста версія справжніх транзакцій, і вона дає зрозумілу гарантію «або все, або нічого». Для складних сценаріїв краще скористатися справжньою базою, наприклад sqlite3, про що наступний урок.",
      "Перевіряйте безпеку потоків тестом: запустіть кілька потоків, що додають записи, і переконайтеся, що кількість записів і унікальність ідентифікаторів збігаються з очікуваними. Тест без замка зазвичай падає (а іноді й ні, що саме й небезпечно), тож для надійності вставте в критичну секцію <code>time.sleep(0)</code>, який віддає керування іншому потоку й робить гонку легко відтворюваною. Не забувайте, що замок захищає лише процес: для кількох процесів потрібна зовнішня база.",
    ],
    code: [
      String.raw`import threading

class Store:
    def __init__(self):
        self._items = {}
        self._next_id = 1
        self._lock = threading.Lock()

    def add(self, value):
        with self._lock:
            item_id = self._next_id
            self._items[item_id] = value
            self._next_id += 1
            return item_id

    def __len__(self):
        with self._lock:
            return len(self._items)

store = Store()
threads = [threading.Thread(target=lambda: [store.add("x") for _ in range(100)]) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(len(store))
`,
      String.raw`import copy
import threading

class Store:
    def __init__(self):
        self._items = {}
        self._lock = threading.Lock()

    def save(self, key, value):
        with self._lock:
            self._items[key] = copy.deepcopy(value)

    def get(self, key):
        with self._lock:
            return copy.deepcopy(self._items[key])

store = Store()
data = {"tags": ["a"]}
store.save(1, data)
data["tags"].append("b")
copy_back = store.get(1)
copy_back["tags"].append("c")
print(store.get(1), data, copy_back)
`,
      String.raw`import threading

class VersionConflict(Exception):
    pass

class Store:
    def __init__(self):
        self._items = {1: {"value": 10, "version": 1}}
        self._lock = threading.Lock()

    def get(self, key):
        with self._lock:
            return dict(self._items[key])

    def update(self, key, value, expected_version):
        with self._lock:
            item = self._items[key]
            if item["version"] != expected_version:
                raise VersionConflict(f"очікували версію {expected_version}, є {item['version']}")
            item["value"] = value
            item["version"] += 1

store = Store()
a = store.get(1)
b = store.get(1)
store.update(1, 20, a["version"])
try:
    store.update(1, 30, b["version"])
except VersionConflict as e:
    print("конфлікт:", e)
print(store.get(1))
`,
      String.raw`import copy
from contextlib import contextmanager

class Store:
    def __init__(self):
        self.items = []

    @contextmanager
    def transaction(self):
        snapshot = copy.deepcopy(self.items)
        try:
            yield self
        except Exception:
            self.items = snapshot
            raise

store = Store()
store.items.append("a")
try:
    with store.transaction():
        store.items.append("b")
        raise ValueError("збій у транзакції")
except ValueError:
    pass
print(store.items)
`,
      String.raw`# аварія: конфлікт версій при оновленні
class VersionConflict(Exception):
    pass

item = {"value": 10, "version": 2}

def update(expected_version, value):
    if item["version"] != expected_version:
        raise VersionConflict(f"очікували {expected_version}, є {item['version']}")
    item["value"] = value
    item["version"] += 1

update(2, 11)
print("перше оновлення вдалось")
update(2, 12)
`,
    ],
    note: "Захищайте всі звернення до спільного сховища замком, повертайте копії, а не внутрішні об'єкти, і для сценарію «прочитав — змінив — записав» використовуйте версії запису (оптимістичне блокування). Замок працює лише в межах одного процесу.",
    work: "Сховища в пам'яті використовують у кешах, тестових підробках і прототипах, а правила потокобезпеки — ті самі, що в справжніх системах: ізоляція, атомарність і контроль конфліктів. Оптимістичне блокування за версією застосовують у базах даних і HTTP API.",
    tasks: [
      "Додайте у сховище замок і перевірте чотирма потоками по сто додавань, що ідентифікатори унікальні, а загальна кількість дорівнює 400.",
      "Змініть метод читання так, щоб він повертав копію запису, і переконайтеся, що зміна копії не торкається сховища.",
    ],
  },
  {
    t: "Конфігурація: os.environ і dataclass",
    ch: "Архітектура",
    adv: true,
    easy: "Налаштування програми — це перемикачі на щитку: порт, адреса бази, режим налагодження. Їх виносять із коду на окрему панель, щоб той самий код працював на ноутбуці розробника й на сервері без жодної правки.",
    p: [
      "Налаштування змінюються залежно від середовища: на комп'ютері розробника база локальна, у тестах — тимчасова, у продакшені — віддалена із секретним паролем. Якщо зашити їх у код, для кожного середовища доведеться змінювати код, а секрети потраплять у репозиторій, що небезпечно. Принцип «Twelve-Factor App» радить зберігати конфігурацію в <b>змінних середовища</b>: код однаковий, а відмінності вказує оточення.",
      "У Python змінні середовища доступні через <code>os.environ</code>, що поводиться як словник рядків. <code>os.environ[\"DB_URL\"]</code> кидає <code>KeyError</code>, якщо змінної немає, а <code>os.environ.get(\"PORT\", \"8000\")</code> повертає значення за замовчуванням. Важливо: усі значення — рядки, тому <code>\"8000\"</code> треба перетворити на число, а <code>\"false\"</code> на булеве значення вручну (<code>bool(\"false\")</code> дає <code>True</code>, як ми пам'ятаємо).",
      "Розкидані по коду виклики <code>os.environ</code> ускладнюють розуміння, яка конфігурація потрібна програмі. Краще зібрати її в один об'єкт: незмінний датаклас <code>Settings</code> із типізованими полями (<code>debug: bool</code>, <code>port: int</code>, <code>db_url: str</code>) і методом-фабрикою <code>from_env(env)</code>, що читає змінні, перетворює типи й перевіряє обов'язкові. Решта коду отримує готовий об'єкт і не знає, звідки значення.",
      "Зверніть увагу на параметр <code>env</code>: метод приймає словник, а не звертається до <code>os.environ</code> напряму. У програмі йому передають <code>os.environ</code>, а в тесті — звичайний словник із потрібними значеннями. Це та сама ідея впровадження залежностей: тест не залежить від справжнього оточення й не псує його. Так само для файлів налаштувань приймайте текст чи шлях, а не читайте фіксоване місце.",
      "Перевірка — частина конфігурації. Якщо обов'язкової змінної немає, програма має впасти одразу під час запуску (fail fast) із зрозумілим повідомленням, а не за годину під час першого запиту. Для цього метод <code>from_env</code> кидає власний <code>ConfigError</code> з іменем відсутньої змінної. Також перевіряють допустимі діапазони (<code>port</code> від 1 до 65535) і формати. Не друкуйте секрети в журналі навіть у повідомленнях про помилки: показуйте лише назви змінних.",
      "Крім змінних середовища, налаштування можуть лежати у файлах. Формат TOML зручний і читається стандартним модулем <code>tomllib</code> (з Python 3.11): <code>tomllib.loads(text)</code> повертає словник. Класичний <code>configparser</code> читає INI-файли, а локальні <code>.env</code>-файли підвантажують бібліотекою <code>python-dotenv</code>. Різні джерела мають пріоритети: зазвичай аргументи командного рядка важливіші за змінні середовища, ті важливіші за файл, а файл — за значення за замовчуванням.",
      "Секрети (паролі, токени, ключі API) ніколи не комітять у репозиторій і не пишуть у журнал. Їх передають через змінні середовища, менеджери секретів хмарних платформ або спеціальні сховища. Для локальної розробки використовують <code>.env</code>-файл, який додають у <code>.gitignore</code>. А для документації корисно тримати приклад <code>.env.example</code> без справжніх значень, щоб новий учасник команди знав, які змінні потрібні.",
    ],
    code: [
      String.raw`def parse_bool(text):
    return text.strip().lower() in ("1", "true", "yes", "on")

env = {"DEBUG": "false", "PORT": "9000"}
print(parse_bool(env["DEBUG"]), bool(env["DEBUG"]))
print(int(env.get("PORT", "8000")), int(env.get("WORKERS", "4")))
`,
      String.raw`from dataclasses import dataclass

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

print(Settings.from_env({"DB_URL": "sqlite://", "DEBUG": "yes"}))
`,
      String.raw`import tomllib

text = """
[server]
host = "0.0.0.0"
port = 8080

[database]
url = "sqlite:///app.db"
"""
config = tomllib.loads(text)
print(config["server"]["port"], config["database"]["url"])
print(sorted(config))
`,
      String.raw`defaults = {"port": 8000, "debug": False}
file_config = {"port": 8080}
env_config = {"debug": True}
cli_config = {"port": 9000}

merged = {**defaults, **file_config, **env_config, **cli_config}
print(merged)
`,
      String.raw`# аварія: обов'язкової змінної немає
import os

print(os.environ.get("MISSING_VAR", "значення за замовчуванням"))
print(os.environ["MISSING_VAR"])
`,
    ],
    note: "Конфігурацію беріть зі змінних середовища, збирайте в незмінний датаклас із типами й перевіркою обов'язкових полів і передавайте <code>env</code> параметром для тестів. Перетворюйте рядки на потрібні типи вручну, а секрети не комітьте й не друкуйте.",
    work: "У контейнерах і хмарі конфігурація практично завжди приходить зі змінних середовища, а відсутність потрібного значення виявляється під час запуску. Єдиний об'єкт налаштувань із валідацією скорочує кількість помилок розгортання й полегшує тестування.",
    tasks: [
      "Опишіть незмінний датаклас <code>Settings</code> із методом <code>from_env(env)</code>, що читає порт, режим налагодження й обов'язкову адресу бази.",
      "Покажіть, що відсутня обов'язкова змінна призводить до <code>ConfigError</code> під час створення налаштувань, а не пізніше.",
    ],
  },
  {
    t: "sqlite3: база даних у пам'яті",
    ch: "Архітектура",
    adv: true,
    easy: "SQLite — це повноцінна реляційна база, яка живе в одному файлі або навіть у пам'яті й не потребує сервера. Для навчання й невеликих застосунків це ідеальний варіант, а мова запитів SQL однакова для всіх баз.",
    p: [
      "Реляційні бази зберігають дані в таблицях із рядками й стовпцями, а запити пишуться мовою SQL. У стандартну бібліотеку Python входить модуль <code>sqlite3</code>: вбудована база SQLite, що не потребує встановлення чи сервера. З'єднання <code>sqlite3.connect(\"app.db\")</code> працює з файлом, а <code>sqlite3.connect(\":memory:\")</code> створює тимчасову базу в пам'яті, яка зникає при закритті з'єднання: ідеально для тестів і навчання.",
      "Типовий порядок: підключитися, створити таблицю командою <code>CREATE TABLE</code>, додати рядки через <code>INSERT</code>, вибрати через <code>SELECT</code>. Команди виконують методом <code>conn.execute(sql, params)</code>, що повертає курсор. Результати вибірки беруть методами <code>fetchone()</code> (один рядок або <code>None</code>) і <code>fetchall()</code> (список кортежів). Зміни не зберігаються назавжди, доки не викликано <code>conn.commit()</code>.",
      "Найважливіше правило: <b>ніколи не вставляйте значення в SQL рядковою склейкою чи f-рядком</b>. Запит <code>f\"SELECT * FROM users WHERE name = '{name}'\"</code> вразливий до SQL-ін'єкцій: якщо в <code>name</code> опиниться <code>' OR '1'='1</code>, запит поверне всю таблицю, а зловмисний рядок може навіть видалити дані. Правильно використовувати параметри: <code>conn.execute(\"SELECT * FROM users WHERE name = ?\", (name,))</code>. Драйвер сам екранує значення, і ін'єкція неможлива.",
      "За замовчуванням рядки повертаються кортежами, що незручно. Якщо встановити <code>conn.row_factory = sqlite3.Row</code>, до значень можна звертатися за іменем стовпця: <code>row[\"title\"]</code>. Для масових вставок є <code>executemany(sql, список_параметрів)</code>, який швидший за цикл. А <code>cursor.lastrowid</code> повертає ідентифікатор щойно доданого рядка, коли стовпець <code>id</code> оголошено як <code>INTEGER PRIMARY KEY</code> із автоінкрементом.",
      "Транзакції гарантують, що кілька змін або виконаються разом, або не виконаються взагалі. З'єднання можна використовувати як контекстний менеджер: <code>with conn:</code> автоматично викликає <code>commit()</code> після успішного блоку та <code>rollback()</code>, якщо виник виняток. Саме так переказ коштів між двома рахунками не лишає гроші «у повітрі» при збої посередині. Блок <code>with conn</code> не закриває з'єднання, а лише керує транзакцією.",
      "Обмеження в схемі захищають дані краще за перевірки в коді: <code>NOT NULL</code> забороняє порожні значення, <code>UNIQUE</code> — дублікати, <code>CHECK (price &gt; 0)</code> — недопустимі числа, <code>FOREIGN KEY</code> — посилання на відсутній запис. Порушення викликає <code>sqlite3.IntegrityError</code>, який репозиторій перетворює на доменну помилку (<code>DuplicateError</code>). Індекси (<code>CREATE INDEX</code>) прискорюють пошук за стовпцем, але сповільнюють запис, тож додаються там, де це справді потрібно.",
      "SQLite — відмінний вибір для навчання, тестів, невеликих застосунків і локального зберігання, але не для великих багатокористувацьких серверів: для них беруть PostgreSQL чи MySQL, а звертаються до них драйверами з тим самим SQL. Для складних моделей використовують ORM (SQLAlchemy), що перетворює таблиці на класи, а зміни схеми керуються міграціями. Але принципи (параметри, транзакції, обмеження) однакові скрізь, і вони вам уже знайомі.",
    ],
    code: [
      String.raw`import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE notes (id INTEGER PRIMARY KEY, title TEXT NOT NULL)")
conn.execute("INSERT INTO notes (title) VALUES (?)", ("купити хліб",))
conn.execute("INSERT INTO notes (title) VALUES (?)", ("зателефонувати",))
conn.commit()
print(conn.execute("SELECT id, title FROM notes").fetchall())
print(conn.execute("SELECT COUNT(*) FROM notes").fetchone())
`,
      String.raw`import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (name TEXT)")
conn.executemany("INSERT INTO users VALUES (?)", [("Оля",), ("Іван",), ("Марко",)])

evil = "x' OR '1'='1"
safe = conn.execute("SELECT name FROM users WHERE name = ?", (evil,)).fetchall()
print(safe)
unsafe_sql = f"SELECT name FROM users WHERE name = '{evil}'"
print(len(conn.execute(unsafe_sql).fetchall()))
`,
      String.raw`import sqlite3

conn = sqlite3.connect(":memory:")
conn.row_factory = sqlite3.Row
conn.execute("CREATE TABLE items (id INTEGER PRIMARY KEY, title TEXT, price INTEGER)")
cursor = conn.execute("INSERT INTO items (title, price) VALUES (?, ?)", ("зошит", 40))
print(cursor.lastrowid)
row = conn.execute("SELECT * FROM items").fetchone()
print(row["title"], row["price"], dict(row))
`,
      String.raw`import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER)")
conn.executemany("INSERT INTO accounts VALUES (?, ?)", [("a", 100), ("b", 0)])
conn.commit()

try:
    with conn:
        conn.execute("UPDATE accounts SET balance = balance - 50 WHERE name = 'a'")
        raise RuntimeError("збій посередині переказу")
except RuntimeError:
    pass
print(conn.execute("SELECT name, balance FROM accounts ORDER BY name").fetchall())
`,
      String.raw`# аварія: порушення обмеження UNIQUE
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (email TEXT UNIQUE)")
conn.execute("INSERT INTO users VALUES ('a@example.com')")
print("перший запис додано")
conn.execute("INSERT INTO users VALUES ('a@example.com')")
`,
    ],
    note: "Параметри в SQL передавайте лише через <code>?</code> і кортеж, а не склейкою рядків: це захист від ін'єкцій. Транзакції — <code>with conn:</code>, обмеження (<code>UNIQUE</code>, <code>NOT NULL</code>, <code>CHECK</code>) — у схемі, а <code>IntegrityError</code> перетворюйте на доменну помилку.",
    work: "SQL-бази — основа більшості застосунків, а SQL-ін'єкція довго лишається однією з найнебезпечніших уразливостей. Параметризовані запити, транзакції й обмеження в схемі — базова гігієна роботи з даними в будь-якій мові й базі.",
    tasks: [
      "Створіть у базі в пам'яті таблицю нотаток, додайте кілька записів параметризованим запитом і виведіть їх списком.",
      "Покажіть на прикладі, чим параметризований запит безпечніший за f-рядок, і перехопіть <code>IntegrityError</code> при дублікаті.",
    ],
  },
  {
    t: "Структуровані логи",
    ch: "Архітектура",
    adv: true,
    easy: "Звичайний рядок журналу — це записка для людини, а структурований — картка зі стовпцями для машини. За такими картками можна швидко знайти всі помилки одного користувача чи всі повільні запити за добу.",
    p: [
      "Звичайні логи — це текстові рядки на кшталт <code>INFO: користувач 42 оформив замовлення 7</code>. Людині вони зрозумілі, але шукати в них автоматично складно: щоб знайти всі події користувача 42, доведеться писати регулярні вирази, які ламаються при кожній зміні формулювання. Структуровані логи записують кожну подію як набір полів (зазвичай JSON): <code>{\"level\": \"INFO\", \"event\": \"order_placed\", \"user_id\": 42, \"order_id\": 7}</code>.",
      "Перевага очевидна: системи збору логів (Elasticsearch, Loki, Datadog, CloudWatch) індексують поля й дозволяють фільтрувати, групувати й будувати графіки: «скільки помилок рівня ERROR за годину», «середній час відповіді по маршрутах», «усе, що сталося із запитом з цим ідентифікатором». Формат JSON — один рядок на подію, що зручно для потокової обробки. А людина читає ті самі логи через інструменти форматування.",
      "У Python структуровані логи будують поверх модуля <code>logging</code>. Створюють власний <code>Formatter</code>, у методі <code>format(record)</code> якого збирають словник із рівнем, повідомленням, іменем логера й часом і повертають <code>json.dumps(...)</code>. Додаткові поля передають параметром <code>extra</code>: <code>logger.info(\"замовлення\", extra={\"user_id\": 42})</code>. Атрибути з <code>extra</code> з'являються в записі, і форматувальник може їх вивантажити.",
      "Повідомлення мають бути стабільними, а змінні дані — окремими полями. Погано: <code>f\"замовлення {id} створено\"</code>, бо кожне повідомлення унікальне й їх неможливо згрупувати. Добре: стале повідомлення <code>order_created</code> і поле <code>order_id</code>. Тоді запит «скільки замовлень створено» — це просто підрахунок записів із цією подією. Така дисципліна називається «логувати події, а не речення».",
      "Особливо корисно пов'язувати всі записи одного запиту спільним ідентифікатором (request id або correlation id). Його зберігають у <code>contextvars.ContextVar</code> — змінній, що має власне значення для кожного потоку чи асинхронної задачі, — і додають до кожного запису через <code>logging.Filter</code>. Тоді одним пошуком за ідентифікатором видно повний шлях запиту через усі шари й сервіси, і розслідування інциденту скорочується з годин до хвилин.",
      "Безпека. Логи — типове місце витоку даних: паролі, токени, номери карток, персональні дані потрапляють у них непомітно. Додайте фільтр, що маскує чутливі поля (<code>\"password\": \"***\"</code>), і ніколи не логуйте тіла запитів повністю. Також обирайте рівні свідомо: ERROR лише для справжніх помилок, WARNING для підозрілого, INFO для ключових подій, DEBUG для налагодження. Надлишок записів коштує грошей за зберігання й заглушує важливе.",
      "Не вигадуйте все з нуля: бібліотеки <code>structlog</code> і <code>python-json-logger</code> реалізують ці ідеї готово, а обгортка <code>LoggerAdapter</code> із стандартної бібліотеки дозволяє автоматично додавати постійні поля. Але розуміння механіки (форматувальник, <code>extra</code>, фільтри, контекстні змінні) допомагає налаштувати будь-яку бібліотеку, а також побачити, що саме потрапляє в логи вашого сервісу й чи не міститься там зайвого.",
    ],
    code: [
      String.raw`import io
import json
import logging

class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({"level": record.levelname, "message": record.getMessage()},
                          ensure_ascii=False)

stream = io.StringIO()
handler = logging.StreamHandler(stream)
handler.setFormatter(JsonFormatter())
log = logging.getLogger("json_demo")
log.setLevel(logging.INFO)
log.addHandler(handler)
log.propagate = False

log.info("order_created")
log.warning("стара подія")
print(stream.getvalue().strip())
`,
      String.raw`import io
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
log = logging.getLogger("extra_demo")
log.setLevel(logging.INFO)
log.addHandler(handler)
log.propagate = False

log.info("order_created", extra={"user_id": 42, "order_id": 7})
print(stream.getvalue().strip())
`,
      String.raw`import contextvars
import io
import json
import logging

request_id = contextvars.ContextVar("request_id", default="-")

class ContextFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id.get()
        return True

class JsonFormatter(logging.Formatter):
    def format(self, record):
        return json.dumps({"event": record.getMessage(), "request_id": record.request_id})

stream = io.StringIO()
handler = logging.StreamHandler(stream)
handler.setFormatter(JsonFormatter())
handler.addFilter(ContextFilter())
log = logging.getLogger("ctx_demo")
log.setLevel(logging.INFO)
log.addHandler(handler)
log.propagate = False

log.info("без контексту")
request_id.set("req-123")
log.info("з контекстом")
print(stream.getvalue().strip())
`,
      String.raw`import json

SENSITIVE = {"password", "token", "card"}

def redact(data):
    return {k: ("***" if k in SENSITIVE else v) for k, v in data.items()}

event = {"user": "Оля", "password": "qwerty", "token": "abc123", "action": "login"}
print(json.dumps(redact(event), ensure_ascii=False, sort_keys=True))
`,
      String.raw`# аварія: поле, яке не серіалізується в JSON
import json

print(json.dumps({"event": "ok", "count": 3}))
print(json.dumps({"event": "bad", "obj": object()}))
`,
    ],
    note: "Логуйте події зі сталими повідомленнями й окремими полями (<code>extra</code>), пов'язуйте записи запиту спільним ідентифікатором через <code>contextvars</code> та фільтр, а чутливі дані (паролі, токени) маскуйте або не пишіть узагалі.",
    work: "У продакшені розслідування інцидентів ведеться саме за логами: структурований JSON дозволяє фільтрувати записи за користувачем, запитом і сервісом. Невиправлені витоки паролів у логах — типова причина проблем безпеки, тому їх перевіряють на аудитах.",
    tasks: [
      "Напишіть форматувальник, що виводить запис журналу як JSON із рівнем, подією та додатковими полями з <code>extra</code>.",
      "Додайте ідентифікатор запиту через <code>contextvars</code> і фільтр та переконайтеся, що він з'являється в усіх записах після встановлення.",
    ],
  },
];
