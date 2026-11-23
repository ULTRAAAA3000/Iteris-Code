// Еталонні рішення завдань Python, глава 10 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_10 = {
  "python-api-response": raw`import json


class Response:
    """Імітація відповіді бібліотеки requests: status_code і json()"""

    def __init__(self, status_code, body=""):
        self.status_code = status_code
        self._body = body

    def json(self):
        return json.loads(self._body)


def get_username(resp):
    if resp.status_code == 200:
        return resp.json()["user"]["name"]
    if resp.status_code == 404:
        return "не знайдено"
    raise RuntimeError(f"Помилка сервера: {resp.status_code}")


for resp in [Response(200, '{"user": {"name": "Оля"}}'), Response(404), Response(500)]:
    try:
        print(get_username(resp))
    except RuntimeError as e:
        print(e)
`,
  "python-wsgi-hello": raw`import io
from urllib.parse import parse_qs
from wsgiref.util import setup_testing_defaults


def app(environ, start_response):
    headers = [("Content-Type", "text/plain; charset=utf-8")]
    if environ["PATH_INFO"] == "/hello":
        params = parse_qs(environ["QUERY_STRING"])
        name = params.get("name", ["гість"])[0]
        start_response("200 OK", headers)
        return [f"Привіт, {name}!".encode("utf-8")]
    start_response("404 Not Found", headers)
    return ["не знайдено".encode("utf-8")]


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
  "python-client-tests": raw`import io
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
        self.status = int(status_line.split()[0])
        self.text = text

    def json(self):
        return json.loads(self.text)


class Client:
    def __init__(self, app):
        self.app = app

    def get(self, path):
        return Response(*run_app(self.app, "GET", path))

    def post(self, path, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        return Response(*run_app(self.app, "POST", path, body))


client = Client(app)
r = client.get("/users")
print(r.status, r.json())
r = client.post("/users", {"name": "Марко"})
print(r.status, r.json())
r = client.get("/nope")
print(r.status, r.json()["error"])
`,
  "python-router": raw`import re


class Router:
    def __init__(self):
        self.routes = []

    def route(self, method, template):
        pattern = re.compile("^" + re.sub(r"<(\w+)>", r"(?P<\1>[^/]+)", template) + "$")

        def decorator(func):
            self.routes.append((method, pattern, func))
            return func
        return decorator

    def handle(self, method, path):
        allowed = False
        for m, pattern, func in self.routes:
            match = pattern.match(path)
            if match:
                if m == method:
                    return 200, func(**match.groupdict())
                allowed = True
        if allowed:
            return 405, "метод не підтримується"
        return 404, "не знайдено"


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
  "python-notes-crud": raw`notes = {}
next_id = 1


def handle(method, path, body=None):
    global next_id
    parts = [p for p in path.split("/") if p]
    if parts == ["notes"]:
        if method == "GET":
            return 200, list(notes.values())
        if method == "POST":
            title = (body or {}).get("title")
            if not isinstance(title, str) or not title.strip():
                return 422, {"error": "поле title обов'язкове"}
            note = {"id": next_id, "title": title}
            notes[next_id] = note
            next_id += 1
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


print(handle("POST", "/notes", {"title": "купити хліб"}))
print(handle("POST", "/notes", {"title": ""}))
print(handle("GET", "/notes"))
print(handle("GET", "/notes/1"))
print(handle("DELETE", "/notes/1"))
print(handle("GET", "/notes/1"))
`,
  "python-middleware-chain": raw`import io
from wsgiref.util import setup_testing_defaults


def require_token(app, token):
    def wrapper(environ, start_response):
        if environ.get("HTTP_AUTHORIZATION") != f"Bearer {token}":
            start_response("401 Unauthorized", [("Content-Type", "text/plain")])
            return [b"no access"]
        return app(environ, start_response)
    return wrapper


def add_header(app, name, value):
    def wrapper(environ, start_response):
        def start(status, headers, exc_info=None):
            return start_response(status, headers + [(name, value)], exc_info)
        return app(environ, start)
    return wrapper


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
  "python-http-retry-client": raw`class ClientError(Exception):
    pass


IDEMPOTENT = {"GET", "PUT", "DELETE", "HEAD"}


def request(transport, method, url, attempts, sleep):
    status = None
    for attempt in range(attempts):
        status, body = transport(method, url)
        transient = status == 429 or status >= 500
        if not (transient and method in IDEMPOTENT):
            return status, body
        if attempt < attempts - 1:
            sleep(2 ** attempt)
    raise ClientError(f"вичерпано спроб: статус {status}")


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
  "python-graceful-shutdown": raw`import atexit
import signal

received = []
processed = []
stop = False


def handler(signum, frame):
    global stop
    received.append(signal.Signals(signum).name)
    stop = True


def cleanup():
    print("прибирання виконано")


signal.signal(signal.SIGTERM, handler)
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
};
