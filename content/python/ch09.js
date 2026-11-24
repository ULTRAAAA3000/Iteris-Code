export const LESSONS_09 = [
  {
    t: "Пакети, модулі й структура проєкту",
    ch: "Тестування й якість",
    easy: "Структура проєкту — це план будинку: де кухня, де спальня, де комора. Коли все лежить на своїх місцях, новий мешканець за хвилину знаходить потрібне, а ремонт одного кімнати не зачіпає інших.",
    p: [
      "Поки програма вміщається в одному файлі, структура не потрібна. Але проєкти ростуть, і кілька тисяч рядків в одному <code>main.py</code> перетворюються на хаос. Тоді код розкладають по <b>модулях</b> (файлах) і <b>пакетах</b> (папках з модулями). Хороша структура відображає зміст: кожен модуль відповідає за одну зрозумілу частину задачі, а пакет об'єднує споріднені модулі. Назви мають бути короткими, малими літерами й без дефісів.",
      "Типовий розклад сучасного проєкту: у корені лежать <code>README.md</code>, файл налаштувань <code>pyproject.toml</code>, <code>.gitignore</code>, папка <code>src/</code> із пакетом коду (<code>src/shop/</code>) і папка <code>tests/</code> з тестами. Така схема «src layout» гарантує, що тести працюють із установленим пакетом, а не з випадково знайденою папкою, і запобігає помилкам імпорту. Для невеликих скриптів вистачить плоскої структури, але про тести слід подбати з самого початку.",
      "Папка стає пакетом, коли в ній є файл <code>__init__.py</code> (у сучасному Python він необов'язковий, але стандартно його створюють). Цей файл виконується під час імпорту пакета й часто використовується для того, щоб «підняти» публічні імена: <code>from .cart import Cart</code> дозволяє користувачам писати <code>from shop import Cart</code>, не знаючи внутрішньої структури. Список <code>__all__ = [\"Cart\"]</code> визначає, що експортується при <code>from shop import *</code>.",
      "Імпорти бувають абсолютними й відносними. Абсолютний вказує повний шлях від кореня пакета: <code>from shop.cart import Cart</code>. Відносний використовує крапки: <code>from .cart import Cart</code> (з цього ж пакета) або <code>from ..utils import money</code> (з батьківського). Відносні імпорти працюють лише всередині пакета: у скрипті, запущеному напряму, вони завершуються <code>ImportError: attempted relative import with no known parent package</code>. Тому пакети запускають як модулі: <code>python -m shop</code>.",
      "Для запуску пакета як програми створюють файл <code>__main__.py</code>: він виконується при <code>python -m shop</code>. Налаштування проєкту, залежності й точки входу описують у <code>pyproject.toml</code>: розділ <code>[project.scripts]</code> дозволяє створити команду, яка викликає функцію з пакета. Установлення у режимі розробки <code>pip install -e .</code> робить пакет доступним для імпорту з будь-якого місця, а зміни коду підхоплюються одразу.",
      "Типові проблеми структури. Циклічні імпорти (модуль A імпортує B, а B імпортує A) виникають, коли відповідальності змішані: розв'язують їх винесенням спільного коду в окремий модуль або імпортом усередині функції. Файли з іменами стандартних модулів (<code>random.py</code>, <code>test.py</code>) затінюють бібліотеку. Імпорти <code>from module import *</code> засмічують простір імен і ховають джерело імен. Код у верхньому рівні модуля, що виконує роботу при імпорті, робить модуль непридатним для повторного використання.",
      "Розділяйте відповідальності. Предметна логіка (розрахунки, правила) не повинна залежати від введення-виведення (файли, мережа, консоль): тоді її легко тестувати. Допоміжний код (утиліти, конфігурація) лежить окремо, а точка входу тонка: розбирає аргументи й викликає логіку. Такий поділ ви ще побачите в главах про архітектуру. Не поспішайте створювати десятки пакетів: починайте з простого й ділите код, лише коли справді з'являється потреба.",
    ],
    code: [
      String.raw`# фрагмент: типова структура проєкту
shop/
├── pyproject.toml
├── README.md
├── src/
│   └── shop/
│       ├── __init__.py      # from .cart import Cart
│       ├── __main__.py      # python -m shop
│       ├── cart.py
│       └── pricing.py
└── tests/
    └── test_cart.py
`,
      String.raw`import sys
import types

mod = types.ModuleType("shop_utils")
mod.TAX = 0.2
mod.double = lambda x: x * 2
sys.modules["shop_utils"] = mod

import shop_utils
print(shop_utils.TAX, shop_utils.double(21), shop_utils.__name__)
print("shop_utils" in sys.modules)
`,
      String.raw`import sys
import types

mod = types.ModuleType("shop_api")
mod.public = "видно"
mod.hidden = "не експортується"
mod.__all__ = ["public"]
sys.modules["shop_api"] = mod

namespace = {}
exec("from shop_api import *", namespace)
print(sorted(k for k in namespace if not k.startswith("__")))
`,
      String.raw`# фрагмент: pyproject.toml
[project]
name = "shop"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["requests>=2.32"]

[project.scripts]
shop = "shop.__main__:main"
`,
      String.raw`# аварія: відносний імпорт у скрипті, запущеному напряму
from . import cart

print("сюди не дійдемо")
`,
    ],
    note: "Використовуйте «src layout», піднімайте публічні імена в <code>__init__.py</code> і запускайте пакети через <code>python -m</code>. Відносні імпорти працюють лише всередині пакета, а імена власних файлів не повинні збігатися зі стандартними модулями.",
    work: "Структура проєкту визначає, як швидко нові люди в команді розбираються в коді й наскільки легко його тестувати. Налаштований <code>pyproject.toml</code>, зрозумілі пакети й тонка точка входу — перші ознаки охайної кодової бази, на які звертають увагу на код-рев'ю.",
    tasks: [
      "Створіть модуль програмно через <code>types.ModuleType</code>, зареєструйте його в <code>sys.modules</code> і імпортуйте за іменем.",
      "Опишіть <code>__all__</code> у модулі й перевірте, які імена потрапляють у простір імен при <code>from module import *</code>.",
    ],
  },
  {
    t: "unittest: перші тести",
    ch: "Тестування й якість",
    easy: "Тест — це контрольна перевірка, яку ви пишете для власного коду: щоразу, коли щось змінюєте, ви запускаєте її й одразу бачите, чи нічого не зламалося. Це страховий трос, який дозволяє сміливо вносити зміни.",
    p: [
      "Код без тестів — це код, який «працює, якщо нічого не чіпати». Кожна зміна ризикує зламати те, що працювало, а перевірити вручну все неможливо. Автоматичні тести фіксують очікувану поведінку: ви один раз описуєте «для цього входу очікуємо ось такий результат», і комп'ютер перевіряє це за секунди скільки завгодно разів. Тести також слугують живою документацією: з них видно, як мають використовуватися функції.",
      "Стандартний інструмент — модуль <code>unittest</code>. Тести описують як методи класу, що успадковує <code>unittest.TestCase</code>. Назва кожного тестового методу починається з <code>test_</code>. Усередині використовують перевірки: <code>assertEqual(a, b)</code>, <code>assertTrue(x)</code>, <code>assertFalse(x)</code>, <code>assertIn(item, container)</code>, <code>assertIs(a, b)</code>, <code>assertAlmostEqual(a, b)</code> для дробових чисел. Якщо перевірка не виконується, тест позначається як невдалий (failure) і виводить повідомлення з очікуваним і справжнім значенням.",
      "Перевірка помилок виконується через <code>assertRaises</code>, найзручніше як контекстний менеджер: <code>with self.assertRaises(ValueError): parse(\"abc\")</code>. Тест пройде, лише якщо всередині блоку справді виникне такий виняток. Можна додатково перевірити текст повідомлення через <code>assertRaisesRegex</code>. Тестувати варто не лише «щасливий шлях», а й крайні випадки: порожні дані, нуль, від'ємні числа, неправильні типи.",
      "Для підготовки спільного стану є <code>setUp</code> (виконується перед кожним тестом) і <code>tearDown</code> (після кожного): у них створюють потрібні об'єкти й прибирають за собою. Це гарантує ізоляцію: кожен тест стартує з чистого стану й не залежить від порядку виконання інших. Тести ніколи не повинні покладатися один на одного, інакше їх неможливо запускати поодинці й налагоджувати.",
      "Запуск із командного рядка: <code>python -m unittest</code> знаходить усі файли <code>test*.py</code> у проєкті й виконує їх; <code>python -m unittest tests.test_cart -v</code> запускає окремий модуль із докладним виводом. У самому файлі додають <code>if __name__ == \"__main__\": unittest.main()</code>. Програмний запуск (як у нашому середовищі) дає <code>TextTestRunner</code> із потоком виводу в <code>io.StringIO</code>, і результат читається з об'єкта <code>result</code>: <code>testsRun</code>, <code>failures</code>, <code>errors</code>.",
      "Розрізняйте «failure» і «error». Failure — перевірка не виконалась: код працює, але результат неправильний. Error — під час тесту виник несподіваний виняток: помилка в тесті чи коді. Обидва означають, що тест не пройдений, але діагностика різна. Читайте вивід: у ньому вказано, який саме тест, у якому рядку й що очікувалося замість отриманого.",
      "Добрі тести мають структуру «підготувати — виконати — перевірити» (Arrange–Act–Assert), перевіряють одну поведінку за раз, мають зрозумілі імена на кшталт <code>test_slugify_removes_extra_spaces</code> і швидко виконуються. Не пишіть тестів, що залежать від мережі, поточного часу чи випадкових чисел без контролю. Багато проєктів використовують сторонній <code>pytest</code>: він простіший у записі (звичайні <code>assert</code>), але ідеї ті самі, тож знання <code>unittest</code> легко переноситься.",
    ],
    code: [
      String.raw`import io
import unittest

def run(case):
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(case)
    result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
    return result.testsRun, len(result.failures), len(result.errors)

def slugify(title):
    return "-".join(title.lower().split())

class TestSlugify(unittest.TestCase):
    def test_simple(self):
        self.assertEqual(slugify("Hello World"), "hello-world")

    def test_extra_spaces(self):
        self.assertEqual(slugify("  Hello   World  "), "hello-world")

    def test_empty(self):
        self.assertEqual(slugify(""), "")

print(run(TestSlugify))
`,
      String.raw`import io
import unittest

def run(case):
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(case)
    result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
    return result.testsRun, len(result.failures), len(result.errors)

class Demo(unittest.TestCase):
    def test_ok(self):
        self.assertTrue(True)

    def test_failure(self):
        self.assertEqual(1 + 1, 3)

    def test_error(self):
        1 / 0

print(run(Demo))
`,
      String.raw`import io
import unittest

def run(case):
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(case)
    result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
    return result.testsRun, len(result.failures), len(result.errors)

class TestParse(unittest.TestCase):
    def setUp(self):
        self.data = ["1", "2", "3"]

    def test_sum(self):
        self.assertEqual(sum(int(x) for x in self.data), 6)

    def test_invalid(self):
        with self.assertRaises(ValueError):
            int("abc")

    def test_float(self):
        self.assertAlmostEqual(0.1 + 0.2, 0.3)

print(run(TestParse))
`,
      String.raw`import unittest

class T(unittest.TestCase):
    def test_x(self):
        self.assertIn("a", "abc")
        self.assertIs(None, None)
        self.assertIsNone(None)
        self.assertGreater(3, 2)
        self.assertListEqual([1, 2], [1, 2])

t = T("test_x")
t.test_x()
print("усі перевірки пройшли")
`,
      String.raw`# аварія: невдала перевірка піднімає AssertionError
import unittest

case = unittest.TestCase()
case.assertEqual(2 + 2, 4)
print("перша перевірка пройшла")
case.assertEqual(2 + 2, 5)
`,
    ],
    note: "Тестовий метод починається з <code>test_</code> і перевіряє одну поведінку; <code>assertRaises</code> перевіряє помилки, а <code>setUp</code> готує чистий стан для кожного тесту. Тести не повинні залежати один від одного чи від зовнішніх умов.",
    work: "Автоматичні тести — обов'язкова частина професійної розробки: вони запускаються в CI при кожному зміненні коду й не дають зламану поведінку потрапити до користувачів. Уміння швидко написати тест, який відтворює помилку, — один із найкращих способів її виправити.",
    tasks: [
      "Напишіть клас <code>TestSlugify</code> щонайменше з трьома методами, що перевіряють звичайний випадок, зайві пробіли й порожній рядок.",
      "Додайте тест, який перевіряє, що функція кидає <code>ValueError</code> для некоректного вводу, через <code>assertRaises</code>.",
    ],
  },
  {
    t: "Підтести, моки й unittest.mock",
    ch: "Тестування й якість",
    easy: "Мок — це актор-дублер: справжній виконавець (мережа, база, час) може бути недоступним, повільним чи непередбачуваним, тож у тесті його замінює дублер, який точно знає, що сказати, і запам'ятовує, що йому казали.",
    p: [
      "Часто один тест треба повторити для багатьох наборів даних: перевірити функцію на десяти входах. Писати десять майже однакових методів нудно. Для цього є <code>subTest</code>: усередині одного тесту ви запускаєте цикл по таблиці даних і обгортаєте кожну ітерацію в <code>with self.subTest(case=case):</code>. Кожен набір перевіряється окремо: якщо один упаде, інші все одно виконаються, а у звіті буде видно, який саме набір не пройшов.",
      "Справжні проблеми з тестами починаються, коли код залежить від зовнішнього світу: мережі, бази даних, поточного часу, файлів, випадкових чисел. Такі тести повільні, нестабільні й можуть мати побічні ефекти (скажімо, реально надіслати лист). Рішення — замінити зовнішню залежність <b>дублером</b> (test double) на час тесту. Модуль <code>unittest.mock</code> створює такі дублери.",
      "Основний клас — <code>Mock</code> (і потужніший <code>MagicMock</code>, що підтримує спеціальні методи). Звернення до будь-якого атрибута створює новий дублер: <code>m.fetch(\"x\")</code> просто працює. Налаштовують поведінку через <code>return_value</code> (що повернути) і <code>side_effect</code> (виняток, функція чи послідовність значень для кожного наступного виклику). Після виконання коду перевіряють, як дублера використали: <code>assert_called_once_with(...)</code>, <code>call_count</code>, <code>call_args_list</code>.",
      "Функція <code>patch</code> підміняє справжній об'єкт у модулі на мок лише на час тесту: <code>with patch(\"module.requests.get\") as fake_get:</code>. Після виходу з блоку оригінал повертається автоматично. Є й декоратор <code>@patch(...)</code>, що передає мок аргументом тестового методу. Головне правило: підміняйте об'єкт <b>там, де його використовують</b>, а не там, де його оголошено. Якщо модуль зробив <code>from time import sleep</code>, підміняти треба <code>module.sleep</code>.",
      "Щоб мок не «прощав» помилок, використовують <code>spec</code>: <code>Mock(spec=Client)</code> дозволяє лише ті атрибути, що є в справжнього класу, і спроба виклику неіснуючого методу дасть <code>AttributeError</code>. Функція <code>create_autospec</code> також перевіряє сигнатури викликів. Без цього тест може проходити, хоча реальний код викликає метод неправильно, і мок цього не помітив би.",
      "Найкраща стратегія — проєктувати код так, щоб моків потрібно було менше. Якщо функція отримує залежність параметром (<code>def fetch_with_retry(client, item)</code>), у тесті достатньо передати простий об'єкт-заглушку й не потрібен жоден <code>patch</code>. Це називається впровадженням залежностей (dependency injection), і ми докладніше розглянемо його в главі про архітектуру. Надмірне використання <code>patch</code> зв'язує тести з внутрішньою будовою коду, і вони ламаються при кожному рефакторингу.",
      "Не перевіряйте за допомогою моків надто багато дрібниць: тест, який лише повторює реалізацію («викликали саме ці три методи саме в цьому порядку»), не знаходить помилок і заважає змінам. Краще перевіряти результат і помітні ефекти. Різні види дублерів мають назви: заглушка (stub) повертає готові відповіді, шпигун (spy) запам'ятовує виклики, підробка (fake) — спрощена робоча реалізація (як база в пам'яті). Обирайте найпростіший, що вирішує задачу.",
    ],
    code: [
      String.raw`import io
import unittest

def run(case):
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(case)
    result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
    return result.testsRun, len(result.failures), len(result.errors)

def is_even(n):
    return n % 2 == 0

class TestEven(unittest.TestCase):
    def test_table(self):
        for number, expected in [(2, True), (3, False), (0, True), (-4, True)]:
            with self.subTest(number=number):
                self.assertEqual(is_even(number), expected)

print(run(TestEven))
`,
      String.raw`from unittest.mock import Mock

client = Mock()
client.fetch.return_value = {"price": 10}
print(client.fetch("хліб"))
client.fetch("сир")
print(client.fetch.call_count, client.fetch.call_args_list[0].args)
client.fetch.assert_any_call("сир")
`,
      String.raw`from unittest.mock import Mock

client = Mock()
client.fetch.side_effect = [ConnectionError("збій"), {"price": 10}]
try:
    client.fetch("x")
except ConnectionError as e:
    print("перший виклик:", e)
print("другий виклик:", client.fetch("x"))

failing = Mock(side_effect=ValueError("погано"))
try:
    failing()
except ValueError as e:
    print(e)
`,
      String.raw`from unittest.mock import patch
import random
import time

def slow_double(x):
    time.sleep(10)
    return x * 2

with patch("time.sleep") as fake_sleep:
    print(slow_double(21))
    print(fake_sleep.call_args)

with patch("random.random", return_value=0.5):
    print(random.random())
print(0 <= random.random() < 1)
`,
      String.raw`# аварія: перевірка виклику не збігається
from unittest.mock import Mock

m = Mock()
m.send("привіт")
m.send.assert_called_once_with("привіт")
print("перша перевірка пройшла")
m.send.assert_called_once_with("бувай")
`,
    ],
    note: "<code>subTest</code> дозволяє перевірити таблицю даних одним тестом, а <code>Mock</code> і <code>patch</code> замінюють зовнішні залежності. Підміняйте об'єкт там, де його використовують, і краще передавайте залежності параметрами, ніж підміняти їх.",
    work: "Тести без мережі, часу й баз даних швидкі й стабільні: їх запускають при кожному коміті. Моки застосовують для імітації збоїв (таймаут, помилка сервера), яких важко домогтися від справжньої системи, і для перевірки того, що код правильно використовує зовнішній інтерфейс.",
    tasks: [
      "Перевірте функцію на п'яти наборах даних через <code>subTest</code>, щоб збій одного набору не зупиняв решту.",
      "Створіть мок клієнта, що спершу кидає <code>ConnectionError</code>, а потім повертає значення, і перевірте повторний виклик та кількість звернень.",
    ],
  },
  {
    t: "timeit і профілювання",
    ch: "Тестування й якість",
    adv: true,
    easy: "Оптимізувати без вимірювань — це як лікувати без діагнозу: можна довго старатися над тим, що ніколи не було проблемою. Спершу заміряємо, де програма справді гальмує, а вже потім виправляємо.",
    p: [
      "Є відомий вислів: передчасна оптимізація — корінь усіх бід. Програмісти погано вгадують, де саме програма витрачає час: інтуїція підказує одне, а профайлер показує зовсім інше. Тому правило таке: спершу напишіть правильний і читабельний код, потім, якщо його швидкість справді недостатня, виміряйте, знайдіть вузьке місце й оптимізуйте лише його. Виміряйте ще раз і переконайтеся, що стало краще.",
      "Найпростіший вимір — <code>time.perf_counter()</code>: різниця двох викликів дає тривалість ділянки коду. Але одиничні заміри ненадійні: на результат впливають кеш процесора, фонові програми й збирач сміття. Для надійного порівняння маленьких фрагментів є модуль <code>timeit</code>. Виклик <code>timeit.timeit(stmt, setup=..., number=1000)</code> виконує фрагмент задану кількість разів і повертає загальний час, при цьому відключає збирач сміття на час виміру.",
      "Кращий варіант — <code>timeit.repeat(stmt, repeat=5, number=1000)</code>: він повертає список часів кількох серій, а <b>мінімум</b> із них найточніше відображає швидкість самого коду (інші значення зіпсовані шумом). Рядок <code>setup</code> готує дані й не входить у вимір. Пам'ятайте, що мікробенчмарки легко ввести в оману: результат залежить від розмірів даних і платформи, тому порівнюйте різні варіанти на однакових даних і не робіть висновків із різниці в кілька відсотків.",
      "Типові приклади різниці: перевірка наявності елемента у списку (<code>x in lst</code>) потребує проходу, а в множині чи словнику вона майже миттєва, тож для частих перевірок на тисячах елементів множина швидша в сотні разів. Склеювання рядків через <code>\"\".join</code> швидше за <code>+=</code> у циклі. Генератор списку зазвичай швидший за цикл із <code>append</code>. Вбудовані функції (<code>sum</code>, <code>min</code>, <code>sorted</code>) швидші за ручні цикли, бо виконуються на C.",
      "Коли програма велика, окремі заміри не допомагають: потрібен профайлер. Модуль <code>cProfile</code> запускає програму й записує, скільки разів викликалась кожна функція і скільки часу вона зайняла. Результат аналізує <code>pstats.Stats</code>: <code>sort_stats(\"cumulative\").print_stats(10)</code> покаже десять найдорожчих функцій. Із командного рядка: <code>python -m cProfile -s cumtime script.py</code>. Саме там зазвичай і виявляється несподіване вузьке місце.",
      "Для пам'яті є <code>tracemalloc</code>: <code>tracemalloc.start()</code>, потім <code>get_traced_memory()</code> повертає поточний і піковий обсяг пам'яті, а <code>take_snapshot()</code> показує, які рядки коду виділили найбільше. Для знаходження повільних рядків усередині функції існують сторонні інструменти (<code>line_profiler</code>, <code>py-spy</code>, <code>scalene</code>), які працюють поверх тих самих ідей. Профайлінг спрацьовує найкраще в умовах, наближених до реальних даних.",
      "Важлива порада щодо тестів: не перевіряйте абсолютні значення часу (<code>assert time &lt; 0.5</code>), бо на іншому комп'ютері вони нестабільні. Порівнюйте <i>відносно</i>: «варіант А швидший за варіант Б». А виграш від оптимізації завжди зважуйте проти складності: код, швидший на 5 %, але вдвічі складніший, майже ніколи не вартий вашого часу та часу тих, хто його читатиме.",
    ],
    code: [
      String.raw`import timeit

setup = "data_list = list(range(5000)); data_set = set(data_list)"
t_list = timeit.timeit("4999 in data_list", setup=setup, number=300)
t_set = timeit.timeit("4999 in data_set", setup=setup, number=300)
print(t_set < t_list)
`,
      String.raw`import timeit

times = timeit.repeat("sum(range(1000))", repeat=3, number=200)
print(len(times), min(times) <= max(times))
print(timeit.timeit("sum(range(10))", number=500) < timeit.timeit("sum(range(10000))", number=500))
`,
      String.raw`import cProfile
import pstats

def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

profiler = cProfile.Profile()
profiler.enable()
fib(15)
profiler.disable()
stats = pstats.Stats(profiler)
print(stats.total_calls > 1000)
`,
      String.raw`import tracemalloc

tracemalloc.start()
data = [0] * 100_000
current, peak = tracemalloc.get_traced_memory()
tracemalloc.stop()
print(current > 100_000, peak >= current)
`,
      String.raw`# аварія: у рядку для timeit використано неіснуюче ім'я
import timeit

print(timeit.timeit("1 + 1", number=10) >= 0)
print(timeit.timeit("undefined_name + 1", number=10))
`,
    ],
    note: "Спершу вимірюйте, потім оптимізуйте: для фрагментів — <code>timeit.repeat</code> і мінімум серій, для програми — <code>cProfile</code>. У тестах порівнюйте варіанти відносно, а не перевіряйте абсолютний час.",
    work: "Профілювання допомагає знайти справжнє вузьке місце: найчастіше це зайвий запит до бази, повторне обчислення чи структура даних, не підходяща для задачі. Оптимізація без вимірювань зазвичай ускладнює код і не прискорює його.",
    tasks: [
      "Порівняйте через <code>timeit</code> перевірку належності у списку й у множині й виведіть, який варіант швидший.",
      "Запустіть <code>cProfile</code> для рекурсивної функції й виведіть кількість викликів із <code>pstats.Stats</code>.",
    ],
  },
  {
    t: "doctest",
    ch: "Тестування й якість",
    adv: true,
    easy: "Doctest перевіряє приклади, які ви вже написали в документації: якщо в описі функції показано, що <code>add(2, 3)</code> дає 5, то Python запустить цей приклад і переконається, що опис не бреше.",
    p: [
      "Документація швидко застаріває: функцію змінили, а приклад у коментарі лишився старим. Модуль <code>doctest</code> розв'язує це так: приклади, записані в рядку документації (docstring) у стилі інтерактивного режиму з <code>&gt;&gt;&gt;</code>, виконуються як тести. Якщо вивід збігається з тим, що написано під прикладом, перевірка пройдена. Так приклади в документації стають гарантовано робочими.",
      "Формат простий. У docstring пишете рядок <code>&gt;&gt;&gt; add(2, 3)</code>, а наступним рядком очікуваний результат <code>5</code>. Кілька прикладів йдуть один за одним. Порожній рядок завершує очікуваний вивід. Те, що виводить <code>print</code>, записують як є, а значення виразу показується так, як його показує інтерактивна консоль, тобто через <code>repr</code>: для рядків це з лапками. Саме тому <code>&gt;&gt;&gt; \"a\"</code> очікує <code>'a'</code>.",
      "Запустити всі приклади модуля можна функцією <code>doctest.testmod()</code>: вона повертає пару «скільки помилок, скільки прикладів» і для невдалих друкує докладний звіт. З командного рядка: <code>python -m doctest -v module.py</code>. Часто в кінці файла пишуть <code>if __name__ == \"__main__\": import doctest; doctest.testmod()</code>, щоб запуск файла перевіряв його приклади. Програмно приклади запускають через <code>DocTestParser</code> і <code>DocTestRunner</code>, у яких доступні лічильники <code>tries</code> і <code>failures</code>.",
      "Деякі результати непередбачувані: адреси об'єктів, час, порядок елементів множини. Для таких випадків є прапорці. <code>ELLIPSIS</code> дозволяє замінювати частину виводу трикрапкою (<code>&lt;object at 0x...&gt;</code>), <code>NORMALIZE_WHITESPACE</code> ігнорує різницю в пробілах і переносах, <code>IGNORE_EXCEPTION_DETAIL</code> порівнює лише тип винятку. Їх вмикають у коментарі прикладу: <code>&gt;&gt;&gt; f()  # doctest: +ELLIPSIS</code>.",
      "Приклади можуть перевіряти й винятки. Очікуваний вивід записують із заголовком <code>Traceback (most recent call last):</code> і останнім рядком із типом та повідомленням; усе між ними ігнорується. Це зручно, щоб показати, коли функція кидає помилку: приклад служить і документацією, і тестом. Але повідомлення має збігатися дослівно, тож для змінних текстів додайте прапорець <code>IGNORE_EXCEPTION_DETAIL</code>.",
      "Ця техніка найкраще підходить для маленьких чистих функцій, де приклад вхід-вихід природний: форматування, розбір, обчислення. Для складних сценаріїв (база даних, мережа, стан) приклади в docstring стають громіздкими, і тут краще працює <code>unittest</code> чи <code>pytest</code>. Доцільно поєднувати: doctest для короткої документації, звичайні тести для детальних перевірок і крайніх випадків.",
      "Не перевантажуйте docstring прикладами: їх має бути достатньо, щоб показати основне використання, а не весь набір випадків. Не покладайтеся на doctest як на єдиний вид перевірки: він не заміняє тестів. І стежте за стабільністю виводу: якщо приклад залежить від порядку ключів, дати чи адрес, він ламатиметься без причини. Хороший doctest читається як невелика історія про те, як користуватися функцією.",
    ],
    code: [
      String.raw`import doctest

def add(a, b):
    """Додає два числа.

    >>> add(2, 3)
    5
    >>> add(-1, 1)
    0
    >>> add(0.5, 0.25)
    0.75
    """
    return a + b

print(doctest.testmod())
`,
      String.raw`import doctest

def greet(name):
    """
    >>> greet("Оля")
    'Привіт, Оля!'
    >>> greet("")
    'Привіт, !'
    """
    return f"Привіт, {name}!"

parser = doctest.DocTestParser()
test = parser.get_doctest(greet.__doc__, {"greet": greet}, "greet", None, 0)
runner = doctest.DocTestRunner(verbose=False)
output = []
runner.run(test, out=output.append)
print(runner.tries, runner.failures)
`,
      String.raw`import doctest

def broken():
    """
    >>> broken()
    42
    """
    return 41

test = doctest.DocTestParser().get_doctest(broken.__doc__, {"broken": broken}, "broken", None, 0)
runner = doctest.DocTestRunner(verbose=False)
messages = []
runner.run(test, out=messages.append)
print(runner.tries, runner.failures, "Expected" in messages[0])
`,
      String.raw`import doctest

def show():
    """
    >>> object()  # doctest: +ELLIPSIS
    <object object at 0x...>
    >>> print("а   б")  # doctest: +NORMALIZE_WHITESPACE
    а б
    """

test = doctest.DocTestParser().get_doctest(show.__doc__, {}, "show", None, 0)
runner = doctest.DocTestRunner(verbose=False)
runner.run(test, out=lambda text: None)
print(runner.tries, runner.failures)
`,
      String.raw`# аварія: приклади з непослідовними відступами не розбираються
import doctest

parser = doctest.DocTestParser()
print(len(parser.get_examples(">>> 1 + 1\n2\n")))
parser.get_examples(">>> 1 + 1\n 2\n  >>> 2 + 2\n4\n")
`,
    ],
    note: "Приклади з <code>&gt;&gt;&gt;</code> у docstring перевіряються як тести. Для нестабільного виводу використовуйте прапорці <code>ELLIPSIS</code> і <code>NORMALIZE_WHITESPACE</code>, а doctest лишайте для малих чистих функцій і дублюйте звичайними тестами.",
    work: "Doctest — дешевий спосіб гарантувати, що приклади з документації працюють. Його використовують у стандартній бібліотеці й багатьох сторонніх бібліотеках, а для серйозних перевірок і крайніх випадків додають звичайні юніт-тести.",
    tasks: [
      "Напишіть функцію <code>clamp(x, lo, hi)</code> із docstring, у якому щонайменше три приклади, і перевірте їх через <code>DocTestRunner</code>.",
      "Додайте приклад із <code>ELLIPSIS</code> для виводу, що містить нестабільну частину, і поясніть, навіщо він потрібен.",
    ],
  },
  {
    t: "Ідіоми Python, PEP 8 і лінтери",
    ch: "Тестування й якість",
    easy: "Ідіоми — це мовні звороти, які знають усі носії мови: можна сказати те саме довгими складними фразами, але природно звучить інакше. Лінтери — це коректори, які підкреслюють у коді те, що звучить неприродно чи вдає помилку.",
    p: [
      "Код можна написати правильно, але «не по-пітонівськи»: дослівно переклавши звички з іншої мови. Такий код працює, але читається важче й часто повільніший. Пітонівський стиль (Pythonic) спирається на ідіоми — усталені прийоми, які знають досвідчені розробники. Їхня філософія зібрана в «Дзен Python» (<code>import this</code>): простий код краще за складний, читабельність має значення, явне краще за неявне.",
      "Офіційний стандарт оформлення — PEP 8. Основні правила: відступ чотири пробіли; довжина рядка до 79 символів (багато команд використовують 88–100); імена змінних і функцій у <code>snake_case</code>, класів у <code>CamelCase</code>, констант у <code>UPPER_CASE</code>; два порожні рядки між функціями верхнього рівня; пробіли навколо операторів; імпорти на початку файла у три групи (стандартна бібліотека, сторонні, власні), кожна за алфавітом. Єдиний стиль дозволяє читати чужий код без здивувань.",
      "Кілька найпоширеніших ідіом. Замість <code>for i in range(len(items))</code> пишіть <code>for item in items</code> або <code>for i, item in enumerate(items)</code>. Для паралельного обходу — <code>zip</code>. Замість перевірки <code>if len(items) == 0</code> — <code>if not items</code>. Замість <code>if flag == True</code> — <code>if flag</code>. Порівняння з <code>None</code> — через <code>is</code>. Для перевірки, чи є хоча б один елемент, — <code>any(...)</code>, чи всі — <code>all(...)</code>. Для склеювання рядків — <code>join</code>.",
      "Ще кілька. Обмін значень <code>a, b = b, a</code>; розпакування замість індексів; <code>with</code> для ресурсів; генератори списків замість циклів з <code>append</code>; <code>dict.get(key, default)</code> замість перевірки наявності ключа; f-рядки замість <code>+</code> та <code>%</code>; <code>defaultdict</code> і <code>Counter</code> для лічильників і груп; <code>str.startswith</code> замість зрізів. Але ідіома — не самоціль: якщо «розумний» запис важко прочитати, простий цикл кращий.",
      "Дотримання стилю автоматизують інструментами. Форматувальники (<code>black</code>, <code>ruff format</code>) самі розставляють відступи й переносять рядки, тож суперечки про стиль зникають. Лінтери (<code>ruff</code>, <code>flake8</code>, <code>pylint</code>) шукають підозрілі місця: невикористані змінні й імпорти, невизначені імена, надто складні функції, змінювані аргументи за замовчуванням. Статичні перевірки типів (<code>mypy</code>, <code>pyright</code>) ловлять невідповідності анотацій. Усе це запускається в редакторі й у CI.",
      "Практичний набір для проєкту: <code>ruff check</code> для лінтера, <code>ruff format</code> (або <code>black</code>) для форматування, <code>mypy</code> для типів, <code>pytest</code> для тестів, усе це об'єднано в <code>pre-commit</code>, який запускає перевірки перед кожним комітом. Налаштування зберігають у <code>pyproject.toml</code>. Так нові учасники команди отримують однакові правила, а код-рев'ю зосереджується на змісті, а не на пробілах.",
      "Звертайте увагу й на документацію: PEP 257 рекомендує писати рядки документації для модулів, класів і публічних функцій (коротке речення про призначення). Давайте змінним змістовні імена й не використовуйте «магічні» числа: <code>MAX_RETRIES = 3</code> зрозуміліше за голе <code>3</code>. А булеві змінні називайте як питання (<code>is_valid</code>, <code>has_access</code>). Усе це дрібниці, але саме з них складається код, який приємно читати.",
    ],
    code: [
      String.raw`names = ["Оля", "Іван"]

# не по-пітонівськи
for i in range(len(names)):
    print(str(i + 1) + ". " + names[i])

# ідіоматично
for i, name in enumerate(names, 1):
    print(f"{i}. {name}")
`,
      String.raw`nums = [3, 8, 5]

has_even = False
for n in nums:
    if n % 2 == 0:
        has_even = True
print(has_even, any(n % 2 == 0 for n in nums))

items = []
if len(items) == 0:
    print("порожньо (громіздко)")
if not items:
    print("порожньо (ідіоматично)")
`,
      String.raw`import contextlib
import io

buffer = io.StringIO()
with contextlib.redirect_stdout(buffer):
    import this
print(buffer.getvalue().splitlines()[0])
print(buffer.getvalue().splitlines()[2])
`,
      String.raw`import keyword

print("class_".isidentifier(), "2fast".isidentifier(), keyword.iskeyword("class"))
MAX_RETRIES = 3
is_valid = True
print(MAX_RETRIES, is_valid)
`,
      "# не компілюється: змішування табуляції та пробілів у відступах\nif True:\n    x = 1\n\ty = 2\n",
    ],
    note: "Пишіть так, як прийнято в мові: <code>for item in items</code>, <code>enumerate</code>, <code>any/all</code>, <code>if not items</code>, f-рядки. Дотримання PEP 8 перекладіть на форматувальник і лінтер у редакторі та CI, а не на ручну перевірку.",
    work: "У командах стиль перевіряють автоматично: <code>ruff</code>, <code>black</code> і <code>mypy</code> у pre-commit та CI не пропускають зміни, що порушують правила. Це економить час код-рев'ю й робить код однорідним незалежно від автора.",
    tasks: [
      "Перепишіть цикл із <code>range(len(...))</code> на ідіоматичний із <code>enumerate</code> і замініть ручний прапорець на <code>any</code>.",
      "Налаштуйте у своєму проєкті <code>ruff</code> і <code>black</code> і подивіться, які зауваження вони дають для вашого коду.",
    ],
  },
];
