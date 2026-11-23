// Еталонні рішення завдань Python, глава 06 (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const SOLUTIONS_06 = {
  "python-exceptions": raw`def safe_div(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None


class NegativeAgeError(ValueError):
    pass


def check_age(age):
    if age < 0:
        raise NegativeAgeError("вік не може бути від'ємним")
    return age


print(safe_div(10, 2))
print(safe_div(1, 0))
try:
    check_age(-5)
except NegativeAgeError as e:
    print("Помилка:", e)
finally:
    print("Перевірку завершено")
`,
  "python-custom-errors": raw`class AppError(Exception):
    pass


class ValidationError(AppError):
    def __init__(self, field, message):
        super().__init__(message)
        self.field = field


def validate(user):
    if not user["name"]:
        raise ValidationError("name", "порожнє ім'я")
    if user["age"] < 0:
        raise ValidationError("age", "вік від'ємний")
    return True


users = [{"name": "Оля", "age": 16}, {"name": "", "age": 5}, {"name": "Іван", "age": -1}]
for user in users:
    try:
        validate(user)
        print("ok")
    except AppError as e:
        print(f"{e.field}: {e}")
`,
  "python-wrap-errors": raw`class ConfigError(Exception):
    pass


def load_port(config):
    try:
        return int(config["port"])
    except (KeyError, ValueError) as e:
        raise ConfigError("Некоректний порт") from e


for config in [{"port": "8080"}, {}, {"port": "abc"}]:
    try:
        print(load_port(config))
    except ConfigError as e:
        print(e, "|", type(e.__cause__).__name__)
`,
  "python-exception-groups": raw`def validate(form):
    errors = []
    if not form.get("name"):
        errors.append(ValueError("порожнє ім'я"))
    if not isinstance(form.get("age"), int):
        errors.append(TypeError("вік має бути числом"))
    if not form.get("email"):
        errors.append(ValueError("порожня пошта"))
    if errors:
        raise ExceptionGroup("форма", errors)


try:
    validate({"name": "", "age": "abc", "email": ""})
except* ValueError as g:
    print("значення:", len(g.exceptions))
except* TypeError as g:
    print("типи:", len(g.exceptions))
finally:
    print("перевірку завершено")
`,
  "python-context-manager": raw`from contextlib import contextmanager, suppress


@contextmanager
def section(name):
    print("start", name)
    try:
        yield
    finally:
        print("end", name)


with section("A"):
    print("work")

with suppress(ValueError):
    with section("B"):
        raise ValueError("збій")
print("готово")
`,
  "python-exit-codes": raw`import traceback


def main(items):
    try:
        total = sum(int(x) for x in items)
    except ValueError:
        print(traceback.format_exc().strip().splitlines()[-1])
        return 2
    print("Сума:", total)
    return 0


print(main(["1", "2", "3"]))
print(main(["1", "x"]))
`,
  "python-retry-result": raw`def retry(func, attempts):
    last_error = None
    for _ in range(attempts):
        try:
            return func()
        except ConnectionError as e:
            last_error = e
    raise last_error


state = {"calls": 0}


def flaky():
    state["calls"] += 1
    if state["calls"] < 3:
        raise ConnectionError(f"збій {state['calls']}")
    return "успіх"


print(retry(flaky, 3))
print(state["calls"])


def broken():
    raise ConnectionError("немає мережі")


try:
    retry(broken, 2)
except ConnectionError as e:
    print("Остання помилка:", e)
`,
};
