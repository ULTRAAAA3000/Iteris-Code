export const LESSONS_10 = [
  {
    t: "HTTP: запит, відповідь і статуси",
    ch: "Сервіси без мережі",
    easy: "HTTP — це розмова за чітким протоколом: клієнт ставить питання («дай сторінку», «збережи запис»), а сервер відповідає кодом і змістом. Код каже, чим закінчилась справа, ще до того, як ви прочитали відповідь.",
    p: [
      "Майже кожен сучасний сервіс говорить через HTTP: браузер із сайтом, мобільний додаток із сервером, один мікросервіс із іншим. Модель проста: клієнт надсилає <b>запит</b> (request), сервер повертає <b>відповідь</b> (response). Кожна пара незалежна, і сервер не пам'ятає попередніх запитів, тож протокол називають безстановим (stateless). Усе, що потрібно для виконання запиту, клієнт передає у самому запиті, наприклад ознаку авторизації.",
      "Запит складається з методу, адреси (URL), заголовків і необов'язкового тіла. Метод повідомляє намір: <code>GET</code> — прочитати, <code>POST</code> — створити, <code>PUT</code> — замінити повністю, <code>PATCH</code> — змінити частково, <code>DELETE</code> — видалити. Методи <code>GET</code>, <code>PUT</code> і <code>DELETE</code> ідемпотентні: повторення того самого запиту не змінює результату, а повторний <code>POST</code> може створити дублікат. Це важливо для повторних спроб після збоїв.",
      "URL має структуру: <code>https://example.com:8443/users/42?sort=name&amp;page=2#top</code>. Це схема, хост, порт, шлях, рядок запиту (параметри після <code>?</code>) і фрагмент. Модуль <code>urllib.parse</code> розбирає її: <code>urlparse</code> повертає частини, <code>parse_qs</code> перетворює рядок запиту на словник списків, <code>urlencode</code> складає його назад, а <code>quote</code> екранує спеціальні символи. Ніколи не збирайте URL руками зі значень користувача: пробіли, кирилиця й символи <code>&amp;</code> зламають адресу.",
      "Відповідь починається зі статус-коду: тризначного числа, перша цифра якого визначає клас. <code>2xx</code> — успіх (<code>200 OK</code>, <code>201 Created</code>, <code>204 No Content</code>). <code>3xx</code> — перенаправлення. <code>4xx</code> — помилка клієнта: <code>400</code> погані дані, <code>401</code> не авторизовано, <code>403</code> заборонено, <code>404</code> не знайдено, <code>409</code> конфлікт, <code>422</code> дані не пройшли валідацію, <code>429</code> забагато запитів. <code>5xx</code> — помилка сервера: <code>500</code>, <code>503</code> недоступний. У стандартній бібліотеці є перелік <code>http.HTTPStatus</code> зі значеннями й описами.",
      "Заголовки — це пари «ім'я: значення» з метаданими. <code>Content-Type</code> описує формат тіла (<code>application/json; charset=utf-8</code>), <code>Accept</code> — які формати клієнт готовий прийняти, <code>Authorization</code> передає облікові дані, <code>Content-Length</code> — розмір тіла, <code>Location</code> — адресу створеного ресурсу, <code>Retry-After</code> — через скільки повторити запит. Імена заголовків нечутливі до регістру, тому їх зручно нормалізувати до нижнього регістру перед порівнянням.",
      "Тіло в сучасних API здебільшого JSON, і розбір відповіді має чітку послідовність: спершу перевірити статус, потім формат, а вже тоді розбирати тіло. Типова помилка — викликати <code>response.json()</code> для відповіді з помилкою, у якій тіло не JSON (скажімо, HTML-сторінка від проксі). Тому логіку будують так: успіх — розібрати дані; очікувана помилка (404) — повернути спеціальне значення; несподівана (500) — кинути виняток.",
      "У цій главі ми не використовуємо мережу: сервер і клієнт — це звичайні функції в одній програмі, і запит передається як звичайний об'єкт. Такий підхід працює в будь-якому середовищі, а головне, показує, що HTTP — це просто домовленість про формат повідомлень, а не магія. Усе, що ви напишете в цій главі (обробники, маршрутизатори, проміжні шари), легко переноситься на справжні фреймворки вроді Flask чи FastAPI, бо вони реалізують ті самі ідеї.",
    ],
    code: [
      String.raw`from urllib.parse import urlparse, parse_qs, urlencode, quote

url = "https://example.com:8443/users/42?sort=name&page=2#top"
parts = urlparse(url)
print(parts.scheme, parts.hostname, parts.port, parts.path)
print(parse_qs(parts.query))
print(urlencode({"q": "кава з молоком", "page": 1}))
print(quote("/шлях з пробілом/"))
`,
      String.raw`from http import HTTPStatus

print(HTTPStatus.NOT_FOUND.value, HTTPStatus.NOT_FOUND.phrase)
print(HTTPStatus(201).name, HTTPStatus(429).phrase)
print([s.value for s in HTTPStatus if s.value in (200, 201, 204)])
`,
      String.raw`class Response:
    def __init__(self, status_code, body=""):
        self.status_code = status_code
        self.body = body

    @property
    def kind(self):
        return {2: "успіх", 3: "перенаправлення", 4: "помилка клієнта", 5: "помилка сервера"}.get(
            self.status_code // 100, "інше")

for code in [200, 301, 404, 503]:
    print(code, Response(code).kind)
`,
      String.raw`headers = {"Content-Type": "application/json", "ACCEPT": "*/*", "Retry-After": "30"}
normalized = {name.lower(): value for name, value in headers.items()}
print(normalized["content-type"], normalized["accept"])
print(int(normalized["retry-after"]) * 2)
`,
      String.raw`# аварія: такого статус-коду не існує
from http import HTTPStatus

print(HTTPStatus(404).phrase)
print(HTTPStatus(999).phrase)
`,
    ],
    note: "Статус-код — перше, що перевіряють у відповіді: <code>2xx</code> успіх, <code>4xx</code> помилка клієнта, <code>5xx</code> помилка сервера. Не збирайте URL руками, а користуйтеся <code>urllib.parse</code>, і розбирайте тіло лише після перевірки статусу.",
    work: "Кожен розробник бекенду й інтеграцій щодня читає статуси, заголовки й тіла запитів. Правильна обробка кодів (404 — це відповідь, 500 — збій, 429 — почекати) відрізняє надійний клієнт від того, що падає на першій несподіванці.",
    tasks: [
      "Розберіть URL із параметрами запиту на схему, хост, шлях і словник параметрів за допомогою <code>urlparse</code> і <code>parse_qs</code>.",
      "Напишіть функцію, що за статус-кодом повертає дані, значення «не знайдено» або кидає виняток для помилок сервера.",
    ],
  },
  {
    t: "Обробник як функція: WSGI",
    ch: "Сервіси без мережі",
    easy: "Веб-застосунок у Python — це звичайна функція, яка отримує опис запиту й повертає відповідь. Сервер лише передає їй запит і віддає клієнту те, що вона повернула. Домовленість про те, як саме, і називається WSGI.",
    p: [
      "Щоб різні сервери (gunicorn, uWSGI, Apache) могли запускати різні застосунки (Flask, Django, власні), потрібен спільний інтерфейс. У Python це WSGI (Web Server Gateway Interface, PEP 3333). Застосунок — це виклик <code>app(environ, start_response)</code>, який повертає ітерований набір байтових рядків. Усе, що вміють фреймворки, побудоване над цією простою ідеєю, тож розуміння WSGI розкриває, як вони працюють усередині.",
      "Перший параметр <code>environ</code> — словник з описом запиту. Основні ключі: <code>REQUEST_METHOD</code> (<code>\"GET\"</code>), <code>PATH_INFO</code> (шлях), <code>QUERY_STRING</code> (рядок запиту без знака питання), <code>CONTENT_LENGTH</code> (розмір тіла), <code>CONTENT_TYPE</code>, а також заголовки у вигляді <code>HTTP_ACCEPT</code>, <code>HTTP_AUTHORIZATION</code>. Тіло запиту читають із файлоподібного об'єкта <code>environ[\"wsgi.input\"]</code>, обов'язково обмежуючи кількість байтів значенням <code>CONTENT_LENGTH</code>.",
      "Другий параметр <code>start_response(status, headers)</code> — функція, яку застосунок викликає, щоб почати відповідь. Статус — рядок на кшталт <code>\"200 OK\"</code> або <code>\"404 Not Found\"</code>, заголовки — список пар <code>[(\"Content-Type\", \"text/plain; charset=utf-8\")]</code>. Тіло повертається як ітерований набір <b>байтів</b>, зазвичай списком із одного елемента: <code>[\"Привіт\".encode(\"utf-8\")]</code>. Повернути звичайний рядок замість байтів — типова помилка початківців.",
      "Мінімальний застосунок виглядає так: функція викликає <code>start_response(\"200 OK\", [(\"Content-Type\", \"text/plain; charset=utf-8\")])</code> і повертає <code>[b\"hello\"]</code>. Усе інше — це логіка: прочитати метод і шлях з <code>environ</code>, вибрати відповідь, сформувати заголовки й тіло. У стандартній бібліотеці є <code>wsgiref.simple_server</code>, який дозволяє запустити такий застосунок як справжній сервер для розробки, але ми будемо викликати застосунок напряму.",
      "Для перевірки не потрібен жодний сервер: застосунок — звичайна функція, тож її можна викликати з власним <code>environ</code>. Допоміжна функція <code>wsgiref.util.setup_testing_defaults(environ)</code> заповнює обов'язкові ключі правдоподібними значеннями, а ви лише задаєте метод, шлях і тіло. Так створюють «тестовий клієнт»: функцію, що викликає застосунок, збирає статус, заголовки й тіло та повертає їх для перевірки.",
      "Параметри запиту розбирають через <code>urllib.parse.parse_qs(environ[\"QUERY_STRING\"])</code>, а тіло JSON — через <code>json.loads(environ[\"wsgi.input\"].read(length))</code>. Довжину читають із <code>CONTENT_LENGTH</code>: якщо заголовка немає або він порожній, її вважають нулем. Закодовані символи (кирилиця в запиті) уже розкодовані функцією <code>parse_qs</code>, а в самому шляху їх слід декодувати окремо через <code>urllib.parse.unquote</code>, коли це потрібно.",
      "Сучасна альтернатива WSGI — ASGI, інтерфейс для асинхронних застосунків (FastAPI, Starlette): там обробник — це корутина, що працює з повідомленнями. Ідея та сама: стандартна межа між сервером і застосунком. Починати з WSGI корисно, бо він простіший і прозоріший: усе видно як виклик функції зі словником. А коли ви зрозумієте його, перехід на ASGI чи будь-який фреймворк стане лише питанням синтаксису.",
    ],
    code: [
      String.raw`import io
from wsgiref.util import setup_testing_defaults

def call(app, method="GET", path="/", body=b""):
    environ = {}
    setup_testing_defaults(environ)
    path_info, _, query = path.partition("?")
    environ.update({"REQUEST_METHOD": method, "PATH_INFO": path_info, "QUERY_STRING": query,
                    "CONTENT_LENGTH": str(len(body)), "wsgi.input": io.BytesIO(body)})
    captured = {}
    def start_response(status, headers, exc_info=None):
        captured["status"] = status
        captured["headers"] = dict(headers)
    data = b"".join(app(environ, start_response))
    return captured["status"], captured["headers"], data.decode("utf-8")

def app(environ, start_response):
    start_response("200 OK", [("Content-Type", "text/plain; charset=utf-8")])
    return ["Привіт, WSGI!".encode("utf-8")]

print(call(app))
`,
      String.raw`import io
from urllib.parse import parse_qs
from wsgiref.util import setup_testing_defaults

def call(app, method="GET", path="/", body=b""):
    environ = {}
    setup_testing_defaults(environ)
    path_info, _, query = path.partition("?")
    environ.update({"REQUEST_METHOD": method, "PATH_INFO": path_info, "QUERY_STRING": query,
                    "CONTENT_LENGTH": str(len(body)), "wsgi.input": io.BytesIO(body)})
    captured = {}
    def start_response(status, headers, exc_info=None):
        captured["status"] = status
    data = b"".join(app(environ, start_response))
    return captured["status"], data.decode("utf-8")

def app(environ, start_response):
    params = parse_qs(environ["QUERY_STRING"])
    name = params.get("name", ["гість"])[0]
    start_response("200 OK", [("Content-Type", "text/plain; charset=utf-8")])
    return [f"Привіт, {name}!".encode("utf-8")]

print(call(app, path="/hello?name=Оля"))
print(call(app, path="/hello"))
`,
      String.raw`import io
import json
from wsgiref.util import setup_testing_defaults

def call(app, method="GET", path="/", body=b""):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": method, "PATH_INFO": path, "QUERY_STRING": "",
                    "CONTENT_LENGTH": str(len(body)), "wsgi.input": io.BytesIO(body)})
    captured = {}
    def start_response(status, headers, exc_info=None):
        captured["status"] = status
    data = b"".join(app(environ, start_response))
    return captured["status"], data.decode("utf-8")

def echo(environ, start_response):
    length = int(environ.get("CONTENT_LENGTH") or 0)
    payload = json.loads(environ["wsgi.input"].read(length))
    start_response("200 OK", [("Content-Type", "application/json; charset=utf-8")])
    return [json.dumps({"received": payload}, ensure_ascii=False).encode("utf-8")]

body = json.dumps({"name": "Оля"}, ensure_ascii=False).encode("utf-8")
print(call(echo, "POST", "/echo", body))
`,
      String.raw`import io
from wsgiref.util import setup_testing_defaults

def call(app, method="GET", path="/"):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": method, "PATH_INFO": path, "QUERY_STRING": "",
                    "CONTENT_LENGTH": "0", "wsgi.input": io.BytesIO(b"")})
    captured = {}
    def start_response(status, headers, exc_info=None):
        captured["status"] = status
    data = b"".join(app(environ, start_response))
    return captured["status"], data.decode("utf-8")

def app(environ, start_response):
    if environ["PATH_INFO"] == "/":
        start_response("200 OK", [("Content-Type", "text/plain; charset=utf-8")])
        return ["головна".encode("utf-8")]
    start_response("404 Not Found", [("Content-Type", "text/plain; charset=utf-8")])
    return ["нічого немає".encode("utf-8")]

print(call(app, path="/"), call(app, path="/missing"))
`,
      String.raw`# аварія: застосунок повернув рядок замість байтів
def app(environ, start_response):
    start_response("200 OK", [("Content-Type", "text/plain")])
    return ["це рядок, а не байти"]

body = b"".join(app({}, lambda status, headers: None))
print(body)
`,
    ],
    note: "WSGI-застосунок — це <code>app(environ, start_response)</code>, що повертає <b>байти</b>. Тіло запиту читайте з <code>wsgi.input</code> за довжиною з <code>CONTENT_LENGTH</code>, а для перевірок викликайте застосунок напряму з власним <code>environ</code>.",
    work: "Flask, Django і більшість Python-фреймворків працюють поверх WSGI чи ASGI. Розуміння цього інтерфейсу допомагає налагоджувати проблеми з розгортанням (gunicorn, nginx), писати проміжні шари й розуміти, звідки береться кожен заголовок і кожен байт відповіді.",
    tasks: [
      "Напишіть WSGI-застосунок, що за шляхом <code>/hello?name=Оля</code> повертає привітання, а для невідомих шляхів статус <code>404 Not Found</code>.",
      "Викличте свій застосунок із власним <code>environ</code> через допоміжну функцію й виведіть статус і тіло відповіді.",
    ],
  },
  {
    t: "Тестування обробників викликом",
    ch: "Сервіси без мережі",
    easy: "Щоб перевірити магазин, не потрібно будувати вулицю й чекати покупців: достатньо зайти всередину й подивитися на полиці. Так само й обробник перевіряють прямим викликом, без жодного сервера й мережі.",
    p: [
      "Найбільше переваг WSGI-застосунок дає у тестах. Оскільки це звичайна функція, її можна викликати прямо з тесту, передавши підготовлений <code>environ</code>, і перевірити, що вона повернула. Не потрібні порти, процеси, затримки мережі й очікування запуску сервера: тест виконується за мілісекунди, стабільний і працює в будь-якому середовищі. Саме тому тестувати обробники варто часто й багато.",
      "Щоб тест не повторював підготовку <code>environ</code> щоразу, створюють тестовий клієнт — невеликий клас-обгортку над застосунком із методами <code>get(path)</code> та <code>post(path, json=...)</code>. Клієнт будує словник <code>environ</code>, викликає застосунок, збирає статус, заголовки й тіло та повертає зручний об'єкт відповіді з полями <code>status</code>, <code>headers</code>, <code>text</code> і методом <code>json()</code>. Саме так працюють клієнти Flask і Django.",
      "Тест обробника перевіряє три речі: статус, заголовки й тіло. Для JSON-відповідей тіло розбирають і порівнюють зі словником, а не з рядком: порядок ключів і пробіли не мають значення. Окремо перевіряють <b>помилкові</b> сценарії: невідомий шлях (404), недопустимий метод (405), некоректні дані (400 чи 422), відсутній токен (401). Саме на них найчастіше ламається реальний код, і саме про них найчастіше забувають.",
      "Тести мають бути незалежними. Якщо застосунок зберігає стан (список нотаток у пам'яті), кожен тест повинен починати з чистого стану: створювати нову копію застосунку в <code>setUp</code> або очищати сховище. Інакше результат залежатиме від порядку запуску тестів, і вони стануть «пливучими»: проходять поодинці й падають разом. Незалежність важливіша за економію кількох рядків підготовки.",
      "Для таблиці випадків зручний <code>subTest</code>: список кортежів «метод, шлях, очікуваний статус», по якому проходить один тест. Так легко покрити багато маршрутів, не пишучи десятки методів. Додавайте новий рядок у таблицю щоразу, коли знаходите помилку: таблиця перетворюється на живу специфікацію поведінки API, а регресія не повернеться непоміченою.",
      "Не плутайте юніт-тести обробників з інтеграційними. Перші перевіряють логіку без мережі й за мілісекунди, другі запускають справжній сервер і перевіряють взаємодію з базою, чергою, зовнішніми системами. Обидва потрібні, але пропорція інша: багато швидких юніт-тестів і небагато повільних інтеграційних. Піраміда тестів із широкою основою з швидких перевірок — типова й розумна стратегія.",
      "Корисні практики. Давайте тестам імена, що описують поведінку: <code>test_unknown_path_returns_404</code>. Перевіряйте і вдалі, і невдалі сценарії. Не тестуйте внутрішніх деталей (які функції викликано), а лише видимий результат. Пам'ятайте про покриття коду (<code>coverage</code>): воно показує, які рядки жодного разу не виконувалися тестами, і це хороший орієнтир для пошуку недосліджених гілок, хоча й не гарантія якості.",
    ],
    code: [
      String.raw`import io
import json
from wsgiref.util import setup_testing_defaults

class Response:
    def __init__(self, status, headers, text):
        self.status = int(status.split()[0])
        self.headers = headers
        self.text = text

    def json(self):
        return json.loads(self.text)

class Client:
    def __init__(self, app):
        self.app = app

    def request(self, method, path, payload=None):
        body = json.dumps(payload).encode("utf-8") if payload is not None else b""
        environ = {}
        setup_testing_defaults(environ)
        environ.update({"REQUEST_METHOD": method, "PATH_INFO": path, "QUERY_STRING": "",
                        "CONTENT_LENGTH": str(len(body)), "wsgi.input": io.BytesIO(body)})
        captured = {}
        def start_response(status, headers, exc_info=None):
            captured["status"], captured["headers"] = status, dict(headers)
        data = b"".join(self.app(environ, start_response))
        return Response(captured["status"], captured["headers"], data.decode("utf-8"))

    def get(self, path):
        return self.request("GET", path)

    def post(self, path, payload):
        return self.request("POST", path, payload)

def app(environ, start_response):
    start_response("200 OK", [("Content-Type", "application/json")])
    return [json.dumps({"ok": True}).encode("utf-8")]

response = Client(app).get("/")
print(response.status, response.headers["Content-Type"], response.json())
`,
      String.raw`import io
import json
import unittest
from wsgiref.util import setup_testing_defaults

def app(environ, start_response):
    if environ["PATH_INFO"] == "/ping":
        start_response("200 OK", [("Content-Type", "application/json")])
        return [b'{"pong": true}']
    start_response("404 Not Found", [("Content-Type", "application/json")])
    return [b'{"error": "not found"}']

def call(path):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": "GET", "PATH_INFO": path, "QUERY_STRING": ""})
    captured = {}
    def start_response(status, headers, exc_info=None):
        captured["status"] = status
    body = json.loads(b"".join(app(environ, start_response)))
    return captured["status"], body

class TestApp(unittest.TestCase):
    def test_ping(self):
        self.assertEqual(call("/ping"), ("200 OK", {"pong": True}))

    def test_missing(self):
        status, body = call("/nope")
        self.assertTrue(status.startswith("404"))
        self.assertIn("error", body)

suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestApp)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print(result.testsRun, len(result.failures), len(result.errors))
`,
      String.raw`import unittest
import io

def status_for(method, path):
    routes = {("GET", "/"): 200, ("GET", "/users"): 200, ("POST", "/users"): 201}
    if (method, path) in routes:
        return routes[(method, path)]
    if any(p == path for _, p in routes):
        return 405
    return 404

class TestRoutes(unittest.TestCase):
    def test_table(self):
        cases = [("GET", "/", 200), ("POST", "/users", 201), ("DELETE", "/users", 405), ("GET", "/x", 404)]
        for method, path, expected in cases:
            with self.subTest(method=method, path=path):
                self.assertEqual(status_for(method, path), expected)

suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestRoutes)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print(result.wasSuccessful(), result.testsRun)
`,
      String.raw`class Store:
    def __init__(self):
        self.items = []

def fresh_store():
    return Store()

a = fresh_store()
a.items.append("перший тест")
b = fresh_store()
print(a.items, b.items)
print(a is b)
`,
      String.raw`# аварія: тест із помилковим очікуванням
import unittest

class T(unittest.TestCase):
    pass

case = T()
case.assertEqual(404, 404)
print("очікуваний 404 збігся")
case.assertEqual(404, 200, "очікували 200")
`,
    ],
    note: "Обробник перевіряють прямим викликом через тестовий клієнт: статус, заголовки, тіло. Перевіряйте помилкові сценарії (404, 405, 422), давайте кожному тесту чистий стан і використовуйте <code>subTest</code> для таблиці маршрутів.",
    work: "Швидкі тести обробників без мережі запускаються при кожному коміті та ловлять регресії раніше, ніж вони потраплять до користувачів. Тестовий клієнт — стандартний інструмент у Flask, Django і FastAPI, і принцип його роботи ви тепер розумієте зсередини.",
    tasks: [
      "Напишіть тестовий клієнт із методами <code>get</code> і <code>post</code>, що повертає об'єкт відповіді зі статусом числом і методом <code>json()</code>.",
      "Складіть таблицю «метод, шлях, очікуваний статус» і перевірте її через <code>subTest</code>.",
    ],
  },
  {
    t: "Маршрутизація",
    ch: "Сервіси без мережі",
    easy: "Маршрутизація — це довідник на ресепшні: за адресою і типом звернення він підказує, до якого кабінету йти. Запит приходить один, а обробників багато, і саме маршрутизатор обирає потрібний.",
    p: [
      "Реальний застосунок має десятки адрес: <code>/</code>, <code>/users</code>, <code>/users/42</code>, <code>/orders</code>. Писати довгий ланцюжок <code>if path == ...</code> у єдиній функції невигідно. Маршрутизатор (router) — це таблиця відповідності: пара «метод і шлях» зіставляється з функцією-обробником. Застосунок стає тонким: знаходить обробник за запитом і викликає його, а вся логіка розкладена по окремих функціях.",
      "Найпростіша таблиця — словник: <code>routes = {(\"GET\", \"/users\"): list_users, (\"POST\", \"/users\"): create_user}</code>. Пошук обробника — звернення за ключем із <code>get</code>. Якщо збігу немає, відповідають <code>404</code>. Але є тонкість: якщо шлях існує, а метод не підходить (спроба <code>DELETE /users</code>), правильна відповідь — <code>405 Method Not Allowed</code> із заголовком <code>Allow</code>, що перелічує допустимі методи. Це допомагає клієнту зрозуміти, що саме він зробив не так.",
      "Зручніше реєструвати маршрути декоратором: <code>@router.route(\"GET\", \"/users\")</code> над функцією додає її в таблицю й повертає без змін. Так список маршрутів лежить поруч із кодом обробників, а не в окремій таблиці, яку легко забути оновити. Саме так вам знайомі <code>@app.route</code> у Flask і <code>@app.get</code> у FastAPI. Реалізація — просте замикання, яке записує функцію в словник під час оголошення.",
      "Шляхи часто містять змінні частини: <code>/users/42</code>, <code>/users/7</code>. Їх задають шаблоном із параметрами на кшталт <code>/users/&lt;id&gt;</code> і перетворюють на регулярний вираз із іменованою групою: <code>^/users/(?P&lt;id&gt;[^/]+)$</code>. Знайшовши збіг, маршрутизатор витягує значення параметрів із <code>match.groupdict()</code> і передає їх обробнику. Можна додати перетворення типів (<code>&lt;int:id&gt;</code>), щоб обробник отримував уже число, а некоректний шлях давав 404.",
      "Порядок і однозначність важливі. Якщо один шлях відповідає кільком шаблонам, перемагає той, що зареєстрований першим, або той, що точніший. Тому статичні маршрути (<code>/users/me</code>) перевіряють раніше за динамічні (<code>/users/&lt;id&gt;</code>). Дублікати маршрутів — помилка програмування: краще виявити їх під час реєстрації й кинути виняток, ніж дозволити одному мовчки перекрити інший.",
      "Не забувайте про дрібниці. Слеш наприкінці (<code>/users</code> і <code>/users/</code>) — окремі адреси, і фреймворки зазвичай або нормалізують їх, або перенаправляють. Параметри запиту (<code>?page=2</code>) не входять у шлях і розбираються окремо. Регістр у шляхах значущий. А якщо маршрутів стає багато (сотні), лінійний перебір регулярок сповільнює роботу, і професійні маршрутизатори використовують префіксні дерева. Але для навчання й невеликих застосунків достатньо простого словника й кількох шаблонів.",
    ],
    code: [
      String.raw`def list_users():
    return 200, ["Оля", "Іван"]

def create_user():
    return 201, "створено"

routes = {("GET", "/users"): list_users, ("POST", "/users"): create_user}

def dispatch(method, path):
    handler = routes.get((method, path))
    if handler:
        return handler()
    if any(p == path for _, p in routes):
        return 405, "метод не підтримується"
    return 404, "не знайдено"

for method, path in [("GET", "/users"), ("POST", "/users"), ("DELETE", "/users"), ("GET", "/x")]:
    print(method, path, dispatch(method, path))
`,
      String.raw`class Router:
    def __init__(self):
        self.routes = {}

    def route(self, method, path):
        def decorator(func):
            self.routes[(method, path)] = func
            return func
        return decorator

    def handle(self, method, path):
        func = self.routes.get((method, path))
        return func() if func else "404"

router = Router()

@router.route("GET", "/")
def index():
    return "головна"

@router.route("GET", "/about")
def about():
    return "про нас"

print(router.handle("GET", "/"), router.handle("GET", "/about"), router.handle("GET", "/x"))
print(sorted(path for _, path in router.routes))
`,
      String.raw`import re

def compile_pattern(path):
    regex = re.sub(r"<(\w+)>", r"(?P<\1>[^/]+)", path)
    return re.compile(f"^{regex}$")

pattern = compile_pattern("/users/<id>/posts/<post_id>")
match = pattern.match("/users/42/posts/7")
print(match.groupdict())
print(pattern.match("/users/42"))
print(compile_pattern("/users/<id>").match("/users/abc").group("id"))
`,
      String.raw`import re

routes = []

def add(method, template, handler):
    pattern = re.compile("^" + re.sub(r"<(\w+)>", r"(?P<\1>[^/]+)", template) + "$")
    routes.append((method, pattern, handler))

def dispatch(method, path):
    allowed = []
    for m, pattern, handler in routes:
        match = pattern.match(path)
        if match:
            if m == method:
                return handler(**match.groupdict())
            allowed.append(m)
    return ("405", sorted(allowed)) if allowed else "404"

add("GET", "/users/<id>", lambda id: f"користувач {id}")
add("DELETE", "/users/<id>", lambda id: f"видалено {id}")
print(dispatch("GET", "/users/42"), dispatch("PUT", "/users/42"), dispatch("GET", "/nothing"))
`,
      String.raw`# аварія: дублікат маршруту виявляється під час реєстрації
routes = {}

def register(method, path, handler):
    key = (method, path)
    if key in routes:
        raise ValueError(f"маршрут {method} {path} уже зареєстровано")
    routes[key] = handler

register("GET", "/users", lambda: "перший")
print("перша реєстрація пройшла")
register("GET", "/users", lambda: "другий")
`,
    ],
    note: "Маршрутизатор зіставляє пару «метод і шлях» з обробником. Для відомого шляху з невідомим методом повертайте <code>405</code>, для невідомого шляху <code>404</code>, а змінні частини шляху розбирайте регулярним виразом з іменованими групами.",
    work: "Кожен фреймворк має маршрутизатор: Flask, Django, FastAPI. Розуміння того, як шаблони шляху перетворюються на регулярні вирази й чому 405 відрізняється від 404, допомагає швидко налагоджувати помилки «чому мій маршрут не спрацьовує» й писати власні проміжні шари.",
    tasks: [
      "Створіть клас <code>Router</code> із декоратором <code>route(method, path)</code> і методом <code>handle</code>, що повертає результат обробника або <code>404</code>.",
      "Додайте підтримку параметра в шляху <code>/users/&lt;id&gt;</code> і передавайте його значення в обробник за іменем.",
    ],
  },
  {
    t: "JSON API: CRUD у пам'яті",
    ch: "Сервіси без мережі",
    easy: "CRUD — чотири основні дії над даними: створити, прочитати, оновити, видалити. Більшість API — це саме вони, подані як HTTP-запити до ресурсів, і для навчання їх зручно зберігати просто в словнику.",
    p: [
      "Практично кожен бекенд зводиться до керування ресурсами: нотатками, користувачами, замовленнями. Для кожного ресурсу потрібно чотири дії, що називаються CRUD: Create, Read, Update, Delete. REST-стиль зіставляє їх із HTTP: <code>POST /notes</code> створює нотатку, <code>GET /notes/1</code> читає, <code>PUT /notes/1</code> або <code>PATCH</code> змінює, <code>DELETE /notes/1</code> видаляє, а <code>GET /notes</code> повертає список. Адреса вказує на ресурс, метод — на дію.",
      "Для навчання сховищем може бути звичайний словник у пам'яті: ключ — числовий ідентифікатор, значення — словник з даними нотатки, плюс лічильник для наступного ідентифікатора. Це дозволяє зосередитися на логіці API, не відволікаючись на базу даних. У справжньому сервісі за цим інтерфейсом стояла б база, але обробники не змінилися б: вони звертаються до сховища через кілька функцій, і реалізацію можна підмінити.",
      "Правильні статус-коди — частина API. Створення повертає <code>201 Created</code> із тілом нового ресурсу (і зазвичай заголовком <code>Location</code>), читання — <code>200</code>, видалення — <code>204 No Content</code> (без тіла) або <code>200</code>. Звернення до неіснуючого ресурсу — <code>404</code>. Конфлікт (наприклад, дублікат унікального поля) — <code>409</code>. Неправильні дані — <code>400</code> або <code>422</code>. Клієнту має вистачати статусу, щоб зрозуміти, що сталося.",
      "Валідація вхідних даних — обов'язок обробника: ніколи не довіряйте тілу запиту. Перевірте, що воно є коректним JSON, що це об'єкт (а не список чи число), що обов'язкові поля присутні й мають правильні типи. При порушенні повертайте <code>422</code> із поясненням: <code>{\"error\": \"поле title обов'язкове\"}</code>. Корисно, щоб усі помилки мали єдиний формат: клієнт пише один обробник помилок замість десятка.",
      "Різниця між <code>PUT</code> і <code>PATCH</code>: <code>PUT</code> замінює ресурс повністю (відсутні поля скидаються), а <code>PATCH</code> змінює лише передані поля. <code>PUT</code> і <code>DELETE</code> ідемпотентні: повторний виклик дає той самий стан (повторне видалення вже видаленого ресурсу може повертати 404, і це нормально). <code>POST</code> не ідемпотентний, тому клієнти з повторними спробами вживають спеціальні ключі ідемпотентності, щоб не створити дублікати.",
      "Для списків з великою кількістю елементів додають параметри запиту: <code>?limit=10&amp;offset=20</code> для посторінкового виводу, <code>?q=текст</code> для пошуку, <code>?sort=-created</code> для сортування. Відповідь зазвичай містить не лише масив, а й підсумок: загальну кількість, посилання на наступну сторінку. Не повертайте нескінченні списки: навіть невелика таблиця за рік зростає, і застосунок «ляже» від одного неоптимального запиту.",
      "Стан у пам'яті не безпечний для потоків: якщо сервер обробляє запити в кількох потоках, одночасне створення двох нотаток може видати однаковий ідентифікатор. Тому критичні ділянки (генерація id, зміна словника) захищають замком, як ви вже вмієте. І пам'ятайте, що дані в пам'яті зникають при перезапуску: для справжніх застосунків потрібна база, але логіка обробників, статуси й валідація лишаються тими самими.",
    ],
    code: [
      String.raw`notes = {}
next_id = 1

def create(title):
    global next_id
    note = {"id": next_id, "title": title}
    notes[next_id] = note
    next_id += 1
    return note

create("перша")
create("друга")
print(notes[1], len(notes))
print([n["title"] for n in notes.values()])
`,
      String.raw`import json

notes = {1: {"id": 1, "title": "перша"}}

def handle(method, path, body=None):
    parts = [p for p in path.split("/") if p]
    if parts == ["notes"] and method == "GET":
        return 200, list(notes.values())
    if parts == ["notes"] and method == "POST":
        note = {"id": max(notes, default=0) + 1, "title": body["title"]}
        notes[note["id"]] = note
        return 201, note
    if len(parts) == 2 and parts[0] == "notes":
        note_id = int(parts[1])
        if note_id not in notes:
            return 404, {"error": "не знайдено"}
        if method == "GET":
            return 200, notes[note_id]
        if method == "DELETE":
            del notes[note_id]
            return 204, None
    return 405, {"error": "метод не підтримується"}

print(handle("POST", "/notes", {"title": "нова"}))
print(handle("GET", "/notes/2"))
print(handle("DELETE", "/notes/1"), handle("GET", "/notes/1"))
`,
      String.raw`def validate(body):
    if not isinstance(body, dict):
        return "тіло має бути об'єктом"
    title = body.get("title")
    if not isinstance(title, str) or not title.strip():
        return "поле title обов'язкове"
    if len(title) > 20:
        return "title задовгий"
    return None

for body in [{"title": "ок"}, {"title": ""}, [], {"title": "x" * 30}]:
    print(validate(body))
`,
      String.raw`items = [{"id": n, "title": f"нотатка {n}"} for n in range(1, 8)]

def page(limit, offset):
    chunk = items[offset:offset + limit]
    return {"total": len(items), "items": [i["id"] for i in chunk],
            "has_more": offset + limit < len(items)}

print(page(3, 0))
print(page(3, 6))
`,
      String.raw`# аварія: звернення до відсутнього ресурсу без перевірки
notes = {1: {"title": "перша"}}

def get(note_id):
    return notes[note_id]

print(get(1))
print(get(99))
`,
    ],
    note: "Зіставляйте CRUD із методами (<code>POST</code> створює з <code>201</code>, <code>DELETE</code> повертає <code>204</code>, відсутній ресурс — <code>404</code>), валідуйте тіло запиту й використовуйте єдиний формат помилок <code>{\"error\": ...}</code>. Стан у пам'яті захищайте замком.",
    work: "Типовий бекенд-сервіс — це CRUD-API над ресурсами з валідацією, пагінацією та зрозумілими кодами відповідей. Правильні статуси й формат помилок економлять клієнтам години налагодження, а розділення обробників і сховища дозволяє підміняти пам'ять базою даних.",
    tasks: [
      "Реалізуйте функцію <code>handle(method, path, body)</code>, що створює, читає й видаляє нотатки у словнику та повертає пару «статус, дані».",
      "Додайте валідацію заголовка нотатки з кодом <code>422</code> і поясненням у єдиному форматі помилки.",
    ],
  },
  {
    t: "Middleware як декоратор",
    ch: "Сервіси без мережі",
    easy: "Middleware — це охоронець на вході в будівлю: кожен відвідувач проходить повз нього, і він може перевірити перепустку, записати візит чи відправити назад. Сам кабінет про це може й не знати.",
    p: [
      "Деякі дії потрібні для кожного запиту незалежно від адреси: записати його в журнал, перевірити токен, виміряти час, обробити помилку, додати заголовок. Копіювати такий код у кожен обробник — марно й небезпечно: хтось обов'язково забуде. Проміжний шар (middleware) — це обгортка навколо всього застосунку, яка виконується до й після нього. Обробники лишаються простими, а наскрізна поведінка живе в одному місці.",
      "У WSGI проміжний шар — це функція, що приймає застосунок і повертає новий застосунок: <code>def logging_middleware(app): def wrapper(environ, start_response): ...; return wrapper</code>. Структура збігається з декоратором, який ми вже знаємо: функція приймає функцію й повертає функцію. Тому middleware часто й називають декораторами застосунку, і над застосунком їх можна застосовувати записом <code>app = logging_middleware(app)</code>.",
      "Усередині обгортки є три місця для логіки. До виклику застосунку (<code>before</code>): перевірити заголовок авторизації, дописати значення в <code>environ</code>. Замість виклику (<code>short-circuit</code>): повернути відповідь самому, не передаючи запит далі (скажімо, <code>401 Unauthorized</code>). Після виклику (<code>after</code>): змінити відповідь, додати заголовок, записати тривалість. Щоб змінити відповідь застосунку, обгортка передає йому власну версію <code>start_response</code>, яка перехоплює статус і заголовки.",
      "Приклади корисних шарів. Журнал записує метод, шлях і статус. Автентифікація перевіряє токен і відсікає запити без нього. Обробник помилок перехоплює виняток із застосунку й повертає <code>500</code> у єдиному форматі замість падіння сервера. Шар CORS додає заголовки для браузерів. Шар часу вимірює тривалість обробки. Кожен — окрема маленька функція з однією відповідальністю, і їх можна комбінувати.",
      "Порядок шарів має значення. Шари застосовуються як матрьошка: останній, що обгорнув застосунок, виконується першим при вході й останнім при виході. Тому обробник помилок зазвичай ставлять зовні (щоб він ловив помилки всіх внутрішніх шарів), а автентифікацію перед обробниками, але після журналу (щоб відхилені запити теж записувалися). Помилка в порядку дає тонкі баги: наприклад, заголовок додається до відповіді, що вже згенерована.",
      "Обережність потрібна з тілом запиту й відповіді. Якщо шар прочитав <code>wsgi.input</code>, наступні вже нічого не прочитають, тож тіло слід або не чіпати, або перезаписати в <code>environ</code>. Для відповідей: застосунок повертає ітерований об'єкт, і шар, що його перебирає, змінює його потік. Також не забувайте, що виняток у шарі до виклику <code>start_response</code> призводить до порожньої відповіді: обробник помилок має гарантувати коректну відповідь.",
      "Для передачі даних між шарами й обробниками використовують ключі в <code>environ</code>: шар автентифікації записує <code>environ[\"app.user\"] = \"Оля\"</code>, а обробник читає його. Назви власних ключів починають зі свого префікса, щоб не перетнутися зі стандартними. У фреймворках те саме називається «контекст запиту». Така схема ефективніша й чистіша за глобальні змінні, адже кожен запит має власний словник.",
    ],
    code: [
      String.raw`import io
from wsgiref.util import setup_testing_defaults

def call(app, method="GET", path="/", headers=None):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": method, "PATH_INFO": path, "QUERY_STRING": "",
                    "CONTENT_LENGTH": "0", "wsgi.input": io.BytesIO(b"")})
    environ.update(headers or {})
    captured = {}
    def start_response(status, headers_list, exc_info=None):
        captured["status"] = status
        captured["headers"] = dict(headers_list)
    body = b"".join(app(environ, start_response)).decode("utf-8")
    if "status" not in captured:
        raise RuntimeError("start_response не було викликано")
    return captured["status"], captured["headers"], body

log = []

def logging_middleware(app):
    def wrapper(environ, start_response):
        def logging_start(status, headers, exc_info=None):
            log.append(f"{environ['REQUEST_METHOD']} {environ['PATH_INFO']} -> {status}")
            return start_response(status, headers, exc_info)
        return app(environ, logging_start)
    return wrapper

def app(environ, start_response):
    start_response("200 OK", [("Content-Type", "text/plain")])
    return [b"ok"]

app = logging_middleware(app)
call(app, path="/a")
call(app, path="/b")
print(log)
`,
      String.raw`import io
from wsgiref.util import setup_testing_defaults

def call(app, headers=None):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": "GET", "PATH_INFO": "/", "QUERY_STRING": "",
                    "wsgi.input": io.BytesIO(b"")})
    environ.update(headers or {})
    captured = {}
    def start_response(status, headers_list, exc_info=None):
        captured["status"] = status
    body = b"".join(app(environ, start_response)).decode("utf-8")
    return captured["status"], body

def require_token(app, token):
    def wrapper(environ, start_response):
        if environ.get("HTTP_AUTHORIZATION") != f"Bearer {token}":
            start_response("401 Unauthorized", [("Content-Type", "text/plain")])
            return [b"no access"]
        return app(environ, start_response)
    return wrapper

def secret(environ, start_response):
    start_response("200 OK", [("Content-Type", "text/plain")])
    return [b"secret"]

protected = require_token(secret, "abc")
print(call(protected))
print(call(protected, {"HTTP_AUTHORIZATION": "Bearer abc"}))
`,
      String.raw`import io
import json
from wsgiref.util import setup_testing_defaults

def call(app):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": "GET", "PATH_INFO": "/", "QUERY_STRING": "",
                    "wsgi.input": io.BytesIO(b"")})
    captured = {}
    def start_response(status, headers_list, exc_info=None):
        captured["status"] = status
    body = b"".join(app(environ, start_response)).decode("utf-8")
    return captured["status"], body

def catch_errors(app):
    def wrapper(environ, start_response):
        try:
            return list(app(environ, start_response))
        except Exception as e:
            start_response("500 Internal Server Error", [("Content-Type", "application/json")])
            return [json.dumps({"error": type(e).__name__}).encode("utf-8")]
    return wrapper

def broken(environ, start_response):
    raise ZeroDivisionError("збій")

print(call(catch_errors(broken)))
`,
      String.raw`import io
from wsgiref.util import setup_testing_defaults

def call(app):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": "GET", "PATH_INFO": "/", "QUERY_STRING": "",
                    "wsgi.input": io.BytesIO(b"")})
    captured = {}
    def start_response(status, headers_list, exc_info=None):
        captured["headers"] = dict(headers_list)
    app(environ, start_response)
    return captured["headers"]

def add_header(app, name, value):
    def wrapper(environ, start_response):
        def start(status, headers, exc_info=None):
            return start_response(status, headers + [(name, value)], exc_info)
        return app(environ, start)
    return wrapper

def base(environ, start_response):
    start_response("200 OK", [("Content-Type", "text/plain")])
    return [b"ok"]

app = add_header(add_header(base, "X-Inner", "1"), "X-Outer", "2")
print(sorted(call(app)))
`,
      String.raw`# аварія: проміжний шар забув викликати start_response
import io
from wsgiref.util import setup_testing_defaults

def call(app):
    environ = {}
    setup_testing_defaults(environ)
    environ.update({"REQUEST_METHOD": "GET", "PATH_INFO": "/", "wsgi.input": io.BytesIO(b"")})
    captured = {}
    def start_response(status, headers, exc_info=None):
        captured["status"] = status
    body = b"".join(app(environ, start_response))
    if "status" not in captured:
        raise RuntimeError("start_response не було викликано")
    return captured["status"], body

def silent(environ, start_response):
    return [b"body without status"]

print("перевіряємо шар")
call(silent)
`,
    ],
    note: "Middleware — функція, що приймає застосунок і повертає новий. Підміняйте <code>start_response</code>, щоб змінити статус чи заголовки, відповідайте самі для коротких замикань (<code>401</code>), а порядок шарів продумуйте: зовнішній виконується першим.",
    work: "Журнал запитів, автентифікація, обробка помилок, CORS, стиснення й метрики реалізовані проміжними шарами майже в кожному сервісі. Уміння написати такий шар — основа розуміння Flask-розширень, Django-middleware й ASGI-шарів у FastAPI.",
    tasks: [
      "Напишіть проміжний шар <code>require_token(app, token)</code>, що повертає <code>401</code> без правильного заголовка <code>Authorization</code>.",
      "Напишіть шар <code>add_header(app, name, value)</code>, що додає заголовок до кожної відповіді, і поєднайте два шари в ланцюжок.",
    ],
  },
  {
    t: "Клієнт із тайм-аутами й повторами",
    ch: "Сервіси без мережі",
    adv: true,
    easy: "Надійний клієнт — це ввічливий, але наполегливий відвідувач: він не чекає біля зачинених дверей вічно, не стукає без упину, а повторює спробу з нарастаючими паузами й здається, коли справа безнадійна.",
    p: [
      "Мережа ненадійна: з'єднання рветься, сервери перевантажуються, відповіді запізнюються. Клієнт, що не враховує цього, ламається на першому ж збої. Надійний HTTP-клієнт має три складники: <b>тайм-аути</b> (не чекати вічно), <b>повторні спроби</b> (дати шанс тимчасовим збоям минути) і <b>відповідну реакцію на помилки</b> (розрізняти те, що варто повторити, і те, що ні). Усе це можна реалізувати й перевірити без жодної мережі.",
      "Для тестованості клієнт не повинен звертатися до мережі напряму. Замість цього він отримує <b>транспорт</b>: функцію <code>transport(method, url)</code>, яка повертає відповідь або кидає помилку. У продакшені транспорт викликає <code>urllib</code> чи <code>requests</code>, а в тесті це проста заглушка зі списком готових відповідей. Так логіку повторів можна перевірити детерміновано: «перші два виклики дають 503, третій 200». Це та сама ідея впровадження залежностей.",
      "Що повторювати? Тимчасові помилки: тайм-аути, обриви з'єднання, статуси <code>429</code> (забагато запитів), <code>502</code>, <code>503</code>, <code>504</code>. Не повторюють помилки клієнта (<code>400</code>, <code>404</code>, <code>422</code>): другий запит дасть той самий результат. Особлива обережність із методами, що змінюють дані: повторення <code>POST</code> може створити дублікат, тому без ключа ідемпотентності повторюють лише <code>GET</code>, <code>PUT</code>, <code>DELETE</code>.",
      "Паузи між спробами зростають за експоненційним законом (exponential backoff): 1 с, 2 с, 4 с, 8 с. Це дає серверу час оговтатися й не додає навантаження. До паузи додають випадковий розкид (jitter), щоб тисячі клієнтів не повторювали запити в один і той самий момент і знову не «поклали» сервер. Верхню межу паузи й загальну кількість спроб обмежують. Для тестів паузи роблять параметром: замість <code>time.sleep</code> клієнт отримує функцію <code>sleep</code>, яку тест підміняє записом викликів.",
      "Сервер може сам підказати, скільки чекати: заголовок <code>Retry-After</code> містить кількість секунд (або дату). Якщо він є, клієнт має користуватися ним замість власного розрахунку. Також варто враховувати загальний дедлайн: якщо користувач чекає відповіді, усі повтори разом не повинні перевищувати прийнятного часу. Інакше «наполегливість» клієнта перетворюється на зависання застосунку.",
      "Для захисту від каскадних збоїв використовують «автоматичний вимикач» (circuit breaker): після кількох невдач підряд клієнт на деякий час перестає надсилати запити й одразу повертає помилку, не навантажуючи хворий сервіс. Через певний час вимикач пробує один запит, і якщо той вдалий, повертається до нормальної роботи. Реалізація складніша, але ідея проста: краще швидко відмовити, ніж мучити систему, яка не відповідає.",
      "Нарешті, помилки мають бути зрозумілими. Коли спроби вичерпано, кидайте власний виняток (<code>ClientError</code>) із контекстом: адреса, останній статус, кількість спроб, а першопричину зберігайте в ланцюжку <code>from</code>. Журналюйте кожну повторну спробу на рівні WARNING: у продакшені «непомітні» повтори — ознака проблем, які варто бачити. А в справжніх проєктах не пишіть усе це вручну: бібліотеки <code>tenacity</code>, <code>urllib3.Retry</code> і <code>httpx</code> уже реалізують ці механізми, і тепер ви розумієте, як вони працюють.",
    ],
    code: [
      String.raw`import random

def backoff_delays(attempts, base=1.0, cap=10.0):
    return [min(cap, base * 2 ** n) for n in range(attempts)]

print(backoff_delays(6))
random.seed(1)
jittered = [d * random.uniform(0.5, 1.0) for d in backoff_delays(3)]
print(all(0.5 * b <= j <= b for j, b in zip(jittered, backoff_delays(3))))
`,
      String.raw`class ClientError(Exception):
    pass

def request(transport, method, url, attempts=3, sleep=lambda s: None):
    last = None
    for attempt in range(attempts):
        try:
            status, body = transport(method, url)
        except ConnectionError as e:
            last = e
        else:
            if status < 500 and status != 429:
                return status, body
            last = f"статус {status}"
        if attempt < attempts - 1:
            sleep(2 ** attempt)
    raise ClientError(f"вичерпано спроб: {last}")

responses = iter([(503, ""), (503, ""), (200, "готово")])
delays = []
print(request(lambda m, u: next(responses), "GET", "/x", sleep=delays.append), delays)
`,
      String.raw`def retry_delay(headers, attempt, base=1.0):
    value = headers.get("Retry-After")
    if value and value.isdigit():
        return int(value)
    return base * 2 ** attempt

print(retry_delay({"Retry-After": "30"}, 0))
print(retry_delay({}, 3))
print(retry_delay({"Retry-After": "завтра"}, 1))
`,
      String.raw`IDEMPOTENT = {"GET", "PUT", "DELETE", "HEAD"}

def should_retry(method, status):
    return method in IDEMPOTENT and (status == 429 or status >= 500)

print(should_retry("GET", 503), should_retry("POST", 503))
print(should_retry("GET", 404), should_retry("DELETE", 429))
`,
      String.raw`# аварія: спроби вичерпано
class ClientError(Exception):
    pass

def request(transport, attempts=2):
    last = None
    for _ in range(attempts):
        try:
            return transport()
        except ConnectionError as e:
            last = e
    raise ClientError(f"вичерпано спроб: {last}") from last

def down():
    raise ConnectionError("сервер недоступний")

print("запит...")
request(down)
`,
    ],
    note: "Повторюйте лише тимчасові збої (тайм-аути, <code>429</code>, <code>5xx</code>) і лише безпечні методи, з експоненційною паузою й розкидом, а <code>Retry-After</code> враховуйте. Транспорт і <code>sleep</code> передавайте параметрами, щоб тестувати без мережі.",
    work: "Клієнти зовнішніх API без повторів і тайм-аутів — головне джерело нестабільності сервісів. Правильний backoff із jitter і автоматичні вимикачі — стандартна практика надійних інтеграцій, а бібліотеки на кшталт <code>tenacity</code> лише автоматизують ці прийоми.",
    tasks: [
      "Напишіть функцію, що виконує запит через заглушку-транспорт із повторами при <code>5xx</code> та записує паузи у список замість справжнього сну.",
      "Додайте врахування заголовка <code>Retry-After</code> і правило, що <code>POST</code> без ключа ідемпотентності не повторюється.",
    ],
  },
  {
    t: "Коректне завершення: atexit і сигнали",
    ch: "Сервіси без мережі",
    adv: true,
    easy: "Коли сервіс закривають, він має не вимкнутися раптово, а ввічливо завершити роботу: дообробити поточну справу, зберегти стан, закрити з'єднання. Сигнали — це дзвінок, а <code>atexit</code> і <code>finally</code> — прибирання після нього.",
    p: [
      "Сервіси не працюють вічно: їх оновлюють, перезапускають, масштабують. Оркестратор (Kubernetes, systemd, Docker) завершує програму, надсилаючи їй сигнал: спочатку м'який <code>SIGTERM</code> («завершуйся, будь ласка»), а через кілька секунд, якщо програма не зупинилась, жорсткий <code>SIGKILL</code>, який перехопити неможливо. Коректне завершення (graceful shutdown) — це використати цей проміжок, щоб завершити поточні запити й нічого не втратити.",
      "Сигнал — це асинхронне повідомлення від операційної системи. У Python його перехоплюють модулем <code>signal</code>: <code>signal.signal(signal.SIGTERM, handler)</code>, де <code>handler(signum, frame)</code> — звичайна функція. Обробники виконуються в головному потоці між інструкціями байткоду, тож встановлювати їх можна лише там. Усередині обробника робіть мінімум: найчастіше достатньо встановити прапорець (<code>threading.Event</code>), а основний цикл програми побачить його й завершить роботу.",
      "Типовий шаблон — цикл обробки із прапорцем зупинки: <code>while not stop.is_set(): handle_next()</code>. Обробник сигналу викликає <code>stop.set()</code>, цикл завершується природно після поточної ітерації, і далі виконується прибирання. Так поточна задача не обривається посередині. Якщо цикл блокується на очікуванні (<code>queue.get</code>), додають тайм-аут, щоб він періодично перевіряв прапорець, або кладуть у чергу спеціальний маркер завершення.",
      "Сигнал <code>SIGINT</code> (Ctrl+C у терміналі) за замовчуванням перетворюється на виняток <code>KeyboardInterrupt</code> у головному потоці. Це виняток від <code>BaseException</code>, а не <code>Exception</code>, тож звичайний <code>except Exception</code> його не ловить, і програму можна зупинити. Перехоплюйте його лише на верхньому рівні, щоб показати зрозуміле повідомлення й виконати прибирання, а не гасіть мовчки. Для тестів є <code>signal.raise_signal(signum)</code>, який «надсилає» сигнал самій програмі.",
      "Прибирання реєструють трьома способами. Блок <code>finally</code> й контекстні менеджери (<code>with</code>) виконуються при виході з відповідного коду, чи то нормальному, чи через виняток. Функції, зареєстровані через <code>atexit.register(func)</code>, виконуються при нормальному завершенні інтерпретатора у зворотному порядку реєстрації (останній зареєстрований іде першим). Вони підходять для глобального прибирання: закрити журнал, зберегти кеш, вивести підсумок.",
      "Важливо знати, чого <code>atexit</code> не робить. Його функції не викликаються, якщо процес убито сигналом <code>SIGKILL</code>, завершено через <code>os._exit()</code> чи аварійно впав інтерпретатор. Тому критичні дані не можна залишати «на потім»: зберігайте їх своєчасно й атомарно. Також не покладайтеся на довгі операції в обробниках завершення: оркестратор дає обмежений час (зазвичай 10–30 секунд), після чого застосує <code>SIGKILL</code>.",
      "У Windows набір сигналів обмежений: <code>SIGINT</code> і <code>SIGTERM</code> працюють не так, як у Unix, і надійні інструменти завершення різняться. Кросплатформні сервіси використовують високорівневі засоби: у <code>asyncio</code> — <code>loop.add_signal_handler</code> (Unix) і скасування задач, у веб-серверах — вбудовану підтримку graceful shutdown. Головне, що ви тепер розумієте механіку: сигнал — це подія, прапорець — спосіб повідомити програму, а прибирання — окремий, обов'язковий етап.",
    ],
    code: [
      String.raw`import atexit

atexit.register(lambda: print("прибирання 1"))
atexit.register(lambda: print("прибирання 2 (виконається першим)"))
print("програма працює")
`,
      String.raw`import signal

received = []

def handler(signum, frame):
    received.append(signal.Signals(signum).name)

signal.signal(signal.SIGTERM, handler)
signal.raise_signal(signal.SIGTERM)
print(received)
`,
      String.raw`import signal
import threading

stop = threading.Event()
signal.signal(signal.SIGTERM, lambda signum, frame: stop.set())

processed = []
for item in range(6):
    if stop.is_set():
        break
    processed.append(item)
    if item == 2:
        signal.raise_signal(signal.SIGTERM)
print(processed, stop.is_set())
`,
      String.raw`import signal

try:
    signal.raise_signal(signal.SIGINT)
except KeyboardInterrupt:
    print("перехоплено Ctrl+C як виняток")
finally:
    print("прибирання завжди виконується")
print(issubclass(KeyboardInterrupt, Exception))
`,
      String.raw`# аварія: SIGKILL перехопити неможливо
import signal

signal.signal(signal.SIGTERM, lambda signum, frame: None)
print("SIGTERM можна перехопити")
signal.signal(signal.SIGKILL, lambda signum, frame: None)
`,
    ],
    note: "Обробник сигналу лише ставить прапорець, а цикл завершується сам і виконує прибирання. <code>SIGKILL</code> перехопити не можна, <code>atexit</code> спрацьовує у зворотному порядку й не викликається при жорсткому вбивстві, а <code>KeyboardInterrupt</code> не є <code>Exception</code>.",
    work: "У контейнерах і хмарі сервіси перезапускаються постійно, тож коректне завершення — вимога, а не розкіш. Без нього запити обриваються посередині, транзакції лишаються незавершеними, а повідомлення безповоротно втрачаються, і користувачі одразу це відчувають.",
    tasks: [
      "Встановіть обробник <code>SIGTERM</code>, що ставить прапорець зупинки, і покажіть, що цикл обробки завершується, а вже оброблені елементи зберігаються.",
      "Зареєструйте два прибирання через <code>atexit</code> і поясніть, у якому порядку вони виконаються.",
    ],
  },
];
