// Практичні завдання глави «Сервіси без мережі» (уроки 92–99). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_10: readonly RemoteTask[] = [
  {
    ...base, id: "python-api-response", lesson: "python/92", xp: 40,
    title: "Обробка відповіді API за статус-кодом",
    context: "Запит до API закінчується відповіддю, і першим ділом дивляться на статус-код: 200 дані, 404 немає, 500 помилка сервера. У пісочниці немає мережі й бібліотеки requests, тому відповідь імітує клас Response з тими самими status_code і json().",
    brief: [
      "Допишіть <code>get_username(resp)</code>: для статусу 200 поверніть <code>resp.json()[\"user\"][\"name\"]</code>, для 404 рядок <code>не знайдено</code>, для будь-якого іншого статусу викличте <code>RuntimeError(f\"Помилка сервера: {resp.status_code}\")</code>.",
    ],
    starter: raw`import json


class Response:
    """Імітація відповіді бібліотеки requests: status_code і json()"""

    def __init__(self, status_code, body=""):
        self.status_code = status_code
        self._body = body

    def json(self):
        return json.loads(self._body)


def get_username(resp):
    # TODO: 200 -> ім'я, 404 -> "не знайдено", інше -> RuntimeError
    return None


for resp in [Response(200, '{"user": {"name": "Оля"}}'), Response(404), Response(500)]:
    try:
        print(get_username(resp))
    except RuntimeError as e:
        print(e)
`,
    checks: [
      { on: "stdout", name: "Статус 200: ім'я користувача", has: "Оля", hint: "Для 200 поверніть resp.json()[\"user\"][\"name\"]." },
      { on: "stdout", name: "Статус 404: «не знайдено»", has: "не знайдено", hint: "Для 404 поверніть рядок «не знайдено» без виклику json()." },
      { on: "stdout", name: "Статус 500: «Помилка сервера: 500»", has: "Помилка сервера: 500", hint: "Для інших статусів викличте raise RuntimeError(f\"Помилка сервера: {resp.status_code}\")." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Оля\nне знайдено\nПомилка сервера: 500", hint: "Мають бути три рядки." },
      { on: "source", name: "Перевіряється status_code", has: "status_code", hint: "Розгалужуйтеся за resp.status_code." },
    ],
  },
  {
    ...base, id: "python-wsgi-hello", lesson: "python/93", xp: 30,
    title: "WSGI-застосунок із параметром запиту",
    context: "Веб-застосунок у Python — це функція app(environ, start_response). Вона читає метод, шлях і параметри з environ, викликає start_response зі статусом і заголовками та повертає тіло у вигляді байтів.",
    brief: [
      "Допишіть <code>app</code>: для шляху <code>/hello</code> прочитайте <code>name</code> із <code>QUERY_STRING</code> (<code>parse_qs</code>), за замовчуванням <code>гість</code>, і поверніть <code>Привіт, ІМ'Я!</code> зі статусом <code>200 OK</code>.",
      "Для будь-якого іншого шляху поверніть <code>404 Not Found</code> і текст <code>не знайдено</code>. Тіло — байти (<code>.encode(\"utf-8\")</code>).",
    ],
    starter: raw`import io
from urllib.parse import parse_qs
from wsgiref.util import setup_testing_defaults


def app(environ, start_response):
    # TODO: /hello?name=Оля -> 200 "Привіт, Оля!" (без name - "гість"); інші шляхи -> 404 "не знайдено"
    start_response("200 OK", [("Content-Type", "text/plain; charset=utf-8")])
    return []


def call(app, path):
    environ = {}
    setup_testing_defaults(environ)
    route, _, query = path.partition("?")
    environ.update({"REQUEST_METHOD": "GET", "PATH_INFO": route, "QUERY_STRING": query,
                    "wsgi.input": io.BytesIO(b"")})
    captured = {}

    def start_response(status, headers, exc_info=None):
        captured["status"] = status

    body = b"".join(app(environ, start_response)).decode("utf-8")
    return captured["status"], body


print(call(app, "/hello?name=Оля"))
print(call(app, "/hello"))
print(call(app, "/other"))
`,
    checks: [
      { on: "stdout", name: "Привітання з іменем", has: "('200 OK', 'Привіт, Оля!')", hint: "parse_qs(environ[\"QUERY_STRING\"]).get(\"name\", [\"гість\"])[0]." },
      { on: "stdout", name: "Невідомий шлях: 404", has: "('404 Not Found', 'не знайдено')", hint: "Для шляху, що не дорівнює /hello, викличте start_response(\"404 Not Found\", ...)." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "('200 OK', 'Привіт, Оля!')\n('200 OK', 'Привіт, гість!')\n('404 Not Found', 'не знайдено')", hint: "Без параметра name використовується «гість»." },
      { on: "source", name: "Тіло відповіді кодується в байти", has: ".encode(", hint: "Повертайте [text.encode(\"utf-8\")], а не рядок." },
    ],
  },
  {
    ...base, id: "python-client-tests", lesson: "python/94", xp: 30,
    title: "Тестовий клієнт для WSGI-застосунку",
    context: "Щоб перевіряти обробники без сервера, пишуть тестовий клієнт: він будує запит, викликає застосунок і повертає зручну відповідь зі статусом числом і методом json(). Так працюють клієнти Flask і Django.",
    brief: [
      "Допишіть <code>Response</code>: <code>status</code> (число з рядка на кшталт <code>\"200 OK\"</code>), <code>text</code> і метод <code>json()</code>.",
      "Допишіть методи <code>get(path)</code> і <code>post(path, payload)</code> класу <code>Client</code> через готову функцію <code>run_app</code>.",
    ],
    starter: raw`import io
import json
from wsgiref.util import setup_testing_defaults


def app(environ, start_response):
    method, path = environ["REQUEST_METHOD"], environ["PATH_INFO"]
    if path == "/users" and method == "GET":
        start_response("200 OK", [("Content-Type", "application/json")])
        return [json.dumps(["Оля", "Іван"], ensure_ascii=False).encode("utf-8")]
    if path == "/users" and method == "POST":
        length = int(environ.get("CONTENT_LENGTH") or 0)
        data = json.loads(environ["wsgi.input"].read(length))
        start_response("201 Created", [("Content-Type", "application/json")])
        return [json.dumps({"name": data["name"]}, ensure_ascii=False).encode("utf-8")]
    start_response("404 Not Found", [("Content-Type", "application/json")])
    return [json.dumps({"error": "not found"}).encode("utf-8")]


def run_app(app, method, path, body=b""):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": method, "PATH_INFO": path, "QUERY_STRING": "",
                    "CONTENT_LENGTH": str(len(body)), "wsgi.input": io.BytesIO(body)})
    captured = {}

    def start_response(status, headers, exc_info=None):
        captured["status"] = status

    text = b"".join(app(environ, start_response)).decode("utf-8")
    return captured["status"], text


class Response:
    def __init__(self, status_line, text):
        # TODO: self.status = число зі status_line, self.text = text
        pass

    def json(self):
        # TODO: розібрати self.text як JSON
        return None


class Client:
    def __init__(self, app):
        self.app = app

    def get(self, path):
        # TODO: Response(*run_app(self.app, "GET", path))
        return None

    def post(self, path, payload):
        # TODO: тіло - JSON у байтах (ensure_ascii=False, encode utf-8)
        return None


client = Client(app)
r = client.get("/users")
print(r.status, r.json())
r = client.post("/users", {"name": "Марко"})
print(r.status, r.json())
r = client.get("/nope")
print(r.status, r.json()["error"])
`,
    checks: [
      { on: "stdout", name: "GET повертає список", has: "200 ['Оля', 'Іван']", hint: "status = int(status_line.split()[0]), json() = json.loads(self.text)." },
      { on: "stdout", name: "POST створює користувача", has: "201 {'name': 'Марко'}", hint: "Тіло запиту: json.dumps(payload, ensure_ascii=False).encode(\"utf-8\")." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "200 ['Оля', 'Іван']\n201 {'name': 'Марко'}\n404 not found", hint: "Для невідомого шляху статус 404, а в тілі ключ error." },
      { on: "source", name: "Використано run_app", matches: "run_app\\(self\\.app", hint: "Клієнт передає свій застосунок у run_app." },
    ],
  },
  {
    ...base, id: "python-router", lesson: "python/95", xp: 35,
    title: "Маршрутизатор із параметрами шляху",
    context: "Маршрутизатор зіставляє метод і шлях з функцією-обробником. Параметри на кшталт /users/<id> перетворюються на регулярний вираз, а 404 і 405 повідомляють клієнту, що саме не так.",
    brief: [
      "Допишіть <code>route(method, template)</code> (декоратор, що зберігає шаблон, перетворений на регулярний вираз з іменованими групами) і <code>handle(method, path)</code>.",
      "Повертайте <code>(200, результат)</code> для знайденого обробника (параметри передайте за іменами), <code>(405, \"метод не підтримується\")</code>, якщо шлях є, а метод інший, і <code>(404, \"не знайдено\")</code> в решті випадків.",
    ],
    starter: raw`import re


class Router:
    def __init__(self):
        self.routes = []

    def route(self, method, template):
        # TODO: декоратор: pattern = ^...$ з <name> -> (?P<name>[^/]+); зберегти (method, pattern, func)
        def decorator(func):
            return func
        return decorator

    def handle(self, method, path):
        # TODO: знайти обробник; 200 / 405 / 404
        return (500, "TODO")


router = Router()


@router.route("GET", "/users")
def users():
    return "список"


@router.route("GET", "/users/<id>")
def user(id):
    return f"користувач {id}"


print(router.handle("GET", "/users"))
print(router.handle("GET", "/users/42"))
print(router.handle("DELETE", "/users"))
print(router.handle("GET", "/x"))
`,
    checks: [
      { on: "stdout", name: "Статичний маршрут", has: "(200, 'список')", hint: "Для збігу методу й шляху викличте func(**match.groupdict())." },
      { on: "stdout", name: "Параметр шляху", has: "(200, 'користувач 42')", hint: "re.sub(r\"<(\\w+)>\", r\"(?P<\\1>[^/]+)\", template)." },
      { on: "stdout", name: "405 і 404", equals: "(200, 'список')\n(200, 'користувач 42')\n(405, 'метод не підтримується')\n(404, 'не знайдено')", hint: "Якщо шлях збігся, але метод інший, поверніть 405; якщо шляху немає — 404." },
      { on: "source", name: "Використано регулярні вирази з іменованими групами", has: "(?P<", hint: "Параметри шляху перетворюйте на іменовані групи (?P<id>...)." },
    ],
  },
  {
    ...base, id: "python-notes-crud", lesson: "python/96", xp: 40,
    title: "CRUD для нотаток у пам'яті",
    context: "Типовий бекенд-сервіс — це CRUD над ресурсами з валідацією й правильними кодами відповідей. Для навчання сховищем слугує словник, а обробник повертає пару «статус, дані».",
    brief: [
      "Допишіть <code>handle(method, path, body=None)</code>: <code>POST /notes</code> (створення, <code>201</code>, порожній чи відсутній <code>title</code> дає <code>422</code> із <code>{\"error\": \"поле title обов'язкове\"}</code>), <code>GET /notes</code> (список, <code>200</code>), <code>GET /notes/&lt;id&gt;</code> і <code>DELETE /notes/&lt;id&gt;</code> (<code>200</code>/<code>204</code> із <code>None</code>, а для відсутньої нотатки <code>404</code> із <code>{\"error\": \"не знайдено\"}</code>).",
      "Ідентифікатори видає лічильник <code>next_id</code>, починаючи з 1.",
    ],
    starter: raw`notes = {}
next_id = 1


def handle(method, path, body=None):
    # TODO: POST /notes, GET /notes, GET /notes/<id>, DELETE /notes/<id>
    return 500, {}


print(handle("POST", "/notes", {"title": "купити хліб"}))
print(handle("POST", "/notes", {"title": ""}))
print(handle("GET", "/notes"))
print(handle("GET", "/notes/1"))
print(handle("DELETE", "/notes/1"))
print(handle("GET", "/notes/1"))
`,
    checks: [
      { on: "stdout", name: "Створення: 201 і id", has: "(201, {'id': 1, 'title': 'купити хліб'})", hint: "Створіть {\"id\": next_id, \"title\": ...}, збережіть і збільште next_id (global)." },
      { on: "stdout", name: "Валідація: 422", has: "(422, {'error': \"поле title обов'язкове\"})", hint: "Порожній title.strip() — це помилка валідації з кодом 422." },
      { on: "stdout", name: "Видалення й 404", equals: "(201, {'id': 1, 'title': 'купити хліб'})\n(422, {'error': \"поле title обов'язкове\"})\n(200, [{'id': 1, 'title': 'купити хліб'}])\n(200, {'id': 1, 'title': 'купити хліб'})\n(204, None)\n(404, {'error': 'не знайдено'})", hint: "DELETE повертає (204, None), а наступний GET того самого id — 404." },
      { on: "source", name: "Оголошено global next_id", matches: "global\\s+next_id", hint: "Щоб змінити лічильник, оголосіть global next_id." },
    ],
  },
  {
    ...base, id: "python-middleware-chain", lesson: "python/97", xp: 35,
    title: "Ланцюжок проміжних шарів",
    context: "Автентифікація й додаткові заголовки потрібні кожному запиту, тому їх виносять у проміжні шари: функції, що приймають застосунок і повертають новий. Шари можна комбінувати в будь-якому порядку.",
    brief: [
      "Допишіть <code>require_token(app, token)</code>: якщо заголовок <code>HTTP_AUTHORIZATION</code> не дорівнює <code>Bearer ТОКЕН</code>, відповідайте <code>401 Unauthorized</code> і текстом <code>no access</code>, не викликаючи <code>app</code>.",
      "Допишіть <code>add_header(app, name, value)</code>: додайте заголовок до кожної відповіді через власну версію <code>start_response</code>.",
    ],
    starter: raw`import io
from wsgiref.util import setup_testing_defaults


def require_token(app, token):
    # TODO: повернути wrapper(environ, start_response)
    return app


def add_header(app, name, value):
    # TODO: повернути wrapper із власним start_response, що додає (name, value)
    return app


def secret(environ, start_response):
    start_response("200 OK", [("Content-Type", "text/plain")])
    return [b"secret"]


def call(app, headers=None):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": "GET", "PATH_INFO": "/", "QUERY_STRING": "",
                    "wsgi.input": io.BytesIO(b"")})
    environ.update(headers or {})
    captured = {}

    def start_response(status, headers_list, exc_info=None):
        captured["status"] = status
        captured["headers"] = dict(headers_list)

    body = b"".join(app(environ, start_response)).decode("utf-8")
    return captured["status"], body, captured["headers"].get("X-Version")


app = add_header(require_token(secret, "abc"), "X-Version", "1")
for status, body, version in [call(app), call(app, {"HTTP_AUTHORIZATION": "Bearer abc"})]:
    print(status, body, version)
`,
    checks: [
      { on: "stdout", name: "Без токена: 401 і заголовок", has: "401 Unauthorized no access 1", hint: "Заголовок додає зовнішній шар, тож він є і в короткого відповіді 401." },
      { on: "stdout", name: "З токеном: 200", equals: "401 Unauthorized no access 1\n200 OK secret 1", hint: "Перевірка: environ.get(\"HTTP_AUTHORIZATION\") == f\"Bearer {token}\"." },
      { on: "source", name: "Проміжні шари підміняють start_response", matches: "def\\s+\\w+\\(status,\\s*headers", hint: "У add_header створіть внутрішню функцію start(status, headers, exc_info=None)." },
    ],
  },
  {
    ...base, id: "python-http-retry-client", lesson: "python/98", xp: 35,
    title: "Клієнт із повторами й backoff",
    context: "Надійний клієнт повторює тимчасові збої з паузою, що зростає, і не повторює небезпечні запити. Транспорт і sleep передаються параметрами, тому перевірити логіку можна без мережі.",
    brief: [
      "Допишіть <code>request(transport, method, url, attempts, sleep)</code>: викликайте <code>transport(method, url)</code>. Повторюйте за <code>429</code> і <code>5xx</code> лише для методів з <code>IDEMPOTENT</code>; між спробами викликайте <code>sleep(2 ** attempt)</code>.",
      "Якщо метод небезпечний або статус не тимчасовий, поверніть <code>(status, body)</code> одразу. Коли спроби вичерпані, киньте <code>ClientError(f\"вичерпано спроб: статус {status}\")</code>.",
    ],
    starter: raw`class ClientError(Exception):
    pass


IDEMPOTENT = {"GET", "PUT", "DELETE", "HEAD"}


def request(transport, method, url, attempts, sleep):
    # TODO: цикл спроб; повтор лише для IDEMPOTENT і статусів 429 / 5xx; sleep(2 ** attempt) між спробами
    return None


responses = iter([(503, ""), (429, ""), (200, "готово")])
delays = []
print(request(lambda m, u: next(responses), "GET", "/x", 4, delays.append), delays)
print(request(lambda m, u: (503, ""), "POST", "/y", 3, delays.append))
try:
    request(lambda m, u: (500, ""), "GET", "/z", 2, delays.append)
except ClientError as e:
    print(e)
print(delays)
`,
    checks: [
      { on: "stdout", name: "Успіх після двох тимчасових збоїв", has: "(200, 'готово') [1, 2]", hint: "Паузи 2 ** attempt: після першої невдачі 1, після другої 2." },
      { on: "stdout", name: "POST не повторюється", has: "(503, '')\n", hint: "Для небезпечного методу поверніть відповідь одразу без повторів." },
      { on: "stdout", name: "Вичерпання спроб", equals: "(200, 'готово') [1, 2]\n(503, '')\nвичерпано спроб: статус 500\n[1, 2, 1]", hint: "Після останньої спроби sleep не викликається, а кидається ClientError." },
      { on: "source", name: "Використано IDEMPOTENT і sleep", matches: "IDEMPOTENT[\\s\\S]*sleep\\(", hint: "Перевіряйте method in IDEMPOTENT і викликайте sleep(2 ** attempt)." },
    ],
  },
  {
    ...base, id: "python-graceful-shutdown", lesson: "python/99", xp: 30,
    title: "Коректне завершення за сигналом",
    context: "Сервіс, який отримав SIGTERM, повинен дообробити поточну справу й прибрати за собою. Обробник сигналу лише ставить прапорець, цикл завершується сам, а atexit виконує фінальне прибирання.",
    brief: [
      "Допишіть <code>handler(signum, frame)</code>: додайте назву сигналу (<code>signal.Signals(signum).name</code>) у <code>received</code> і встановіть <code>stop = True</code> (потрібен <code>global stop</code>). Зареєструйте його для <code>SIGTERM</code>.",
      "Після сигналу цикл має зупинитися, а наприкінці програми через <code>atexit</code> має надрукуватися <code>прибирання виконано</code>.",
    ],
    starter: raw`import atexit
import signal

received = []
processed = []
stop = False


def handler(signum, frame):
    # TODO: global stop; received.append(signal.Signals(signum).name); stop = True
    pass


def cleanup():
    print("прибирання виконано")


# TODO: signal.signal(signal.SIGTERM, handler)
atexit.register(cleanup)

for item in range(6):
    if stop:
        break
    processed.append(item)
    if item == 2:
        signal.raise_signal(signal.SIGTERM)

print(processed)
print(received)
`,
    checks: [
      { on: "stdout", name: "Цикл зупинився після сигналу", has: "[0, 1, 2]\n['SIGTERM']", hint: "Обробник має встановити stop = True, і цикл не обробить елемент 3." },
      { on: "stdout", name: "atexit виконав прибирання", equals: "[0, 1, 2]\n['SIGTERM']\nприбирання виконано", hint: "atexit-функції виконуються вже після завершення основного коду." },
      { on: "source", name: "Обробник зареєстровано для SIGTERM", matches: "signal\\.signal\\(\\s*signal\\.SIGTERM", hint: "Додайте signal.signal(signal.SIGTERM, handler)." },
    ],
  },
];
