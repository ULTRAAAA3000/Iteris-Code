// Практичні завдання глави «Абстракція», частина 05b (уроки 46–51). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_05b: readonly RemoteTask[] = [
  {
    ...base, id: "php-arrayaccess-cart", lesson: "php/46", xp: 30,
    title: "Кошик, що поводиться як масив",
    context: "Кошик товарів має вміти читати й записувати кількість за назвою через квадратні дужки та відповідати на count(). Для цього клас підписує два вбудовані інтерфейси.",
    brief: [
      "Клас <code>Cart</code> зберігає кількість у приватному масиві <code>$items</code>. Реалізуйте <code>ArrayAccess</code> (запис, читання, <code>isset</code>, <code>unset</code>) і <code>Countable</code> (кількість різних назв). Читання відсутнього ключа має повертати <code>0</code>.",
      "Готовий код після класу виводить п'ять рядків: кількість позицій, суму двох товарів, наявність <code>pear</code>, наявність <code>apple</code> і значення відсутнього ключа. Очікується <code>2</code>, <code>8</code>, <code>немає</code>, <code>є</code>, <code>0</code>, кожен рядок завершується <code>\n</code>.",
    ],
    starter: raw`<?php
// TODO: підпишіть інтерфейси ArrayAccess і Countable та реалізуйте методи
class Cart
{
    private array $items = [];

    public function offsetExists(mixed $offset): bool
    {
        return false; // TODO
    }

    public function offsetGet(mixed $offset): mixed
    {
        return null; // TODO: для відсутнього ключа поверніть 0
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        // TODO
    }

    public function offsetUnset(mixed $offset): void
    {
        // TODO
    }

    public function count(): int
    {
        return 0; // TODO
    }
}

$c = new Cart();
$c = $c;
echo "TODO\n";
`,
    checks: [
      { on: "stdout", name: "Підрахунок і сума", has: "2\n8", hint: "Після unset лишаються apple і kiwi: count дає 2, а сума 3 + 5 дорівнює 8." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "2\n8\nнемає\nє\n0", hint: "П'ять рядків: count, сума, isset(pear), isset(apple), читання відсутнього ключа." },
      { on: "source", name: "Підписано ArrayAccess", matches: "implements[^{]*ArrayAccess", hint: "Клас має заявити implements ArrayAccess." },
      { on: "source", name: "Підписано Countable", matches: "implements[^{]*Countable", hint: "Для count($c) потрібен інтерфейс Countable." },
    ],
  },
  {
    ...base, id: "php-closure-counter", lesson: "php/47", xp: 30,
    title: "Лічильники на замиканнях",
    context: "Функція-фабрика повертає незалежні лічильники, кожен зі своїм станом. Стан живе в змінній, захопленій замиканням за посиланням, тож його потрібно правильно передати через use.",
    brief: [
      "Напишіть <code>makeCounter(int $start, int $step = 1): Closure</code>: кожен виклик повернутого замикання збільшує поточне значення на <code>$step</code> і повертає нове. Напишіть <code>multiplier(int $k): Closure</code> у вигляді стрілочної функції, що множить аргумент на <code>$k</code>.",
      "Готовий код друкує п'ять значень: <code>11</code>, <code>12</code>, <code>105</code>, <code>13</code> і <code>18</code> (сума <code>array_map</code> з множником 3 над <code>[1, 2, 3]</code>), кожне з нового рядка.",
    ],
    starter: raw`<?php
function makeCounter(int $start, int $step = 1): Closure
{
    // TODO: захопіть поточне значення за посиланням і збільшуйте його
    return function (): int {
        return 0;
    };
}

function multiplier(int $k): Closure
{
    // TODO: стрілочна функція fn, що множить на $k
    return fn(int $x): int => 0;
}

$a = makeCounter(10);
$b = makeCounter(100, 5);
echo $a() . "\n";
echo $a() . "\n";
echo $b() . "\n";
echo $a() . "\n";
echo array_sum(array_map(multiplier(3), [1, 2, 3])) . "\n";
`,
    checks: [
      { on: "stdout", name: "Лічильники незалежні", has: "105", hint: "Другий лічильник стартує зі 100 із кроком 5, перший виклик дає 105 і не чіпає перший лічильник." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "11\n12\n105\n13\n18", hint: "Лічильник $a: 11, 12, 13; $b: 105; наприкінці сума 3 + 6 + 9." },
      { on: "source", name: "Стан захоплено за посиланням", matches: "use\\s*\\(\\s*&", hint: "Щоб замикання пам'ятало зміну між викликами, змінну передають у use зі знаком &." },
      { on: "source", name: "Множник як стрілочна функція", matches: "fn\\s*\\(", hint: "У multiplier поверніть коротке замикання fn(...)" },
    ],
  },
  {
    ...base, id: "php-typed-collection", lesson: "php/48", xp: 35,
    title: "Типізована колекція з докблоком",
    context: "У PHP немає справжніх generics, тому тип елементів описують докблоком для аналізатора і перевіряють у рантаймі. Зробіть колекцію, що приймає лише об'єкти заданого класу.",
    brief: [
      "Клас <code>Collection</code> отримує в конструкторі ім'я класу (<code>class-string</code>). Метод <code>add()</code> додає елемент лише якщо він є екземпляром цього класу, інакше кидає <code>InvalidArgumentException</code> з текстом <code>Очікується User</code> (ім'я класу береться зі змінної). Додайте над класом докблок із <code>@template T</code>, а над <code>add</code> докблок <code>@param T $item</code>.",
      "Готовий код друкує кількість елементів (<code>2</code>), а потім повідомлення винятку для спроби додати рядок.",
    ],
    starter: raw`<?php
class User
{
    public function __construct(public string $name) {}
}

class Collection implements Countable
{
    private array $items = [];

    public function __construct(private string $type) {}

    public function add(mixed $item): void
    {
        // TODO: перевірте тип і киньте InvalidArgumentException
        $this->items[] = $item;
    }

    public function count(): int
    {
        return count($this->items);
    }
}

$c = new Collection(User::class);
$c->add(new User("Оля"));
$c->add(new User("Іван"));
echo count($c) . "\n";
try {
    $c->add("не користувач");
} catch (InvalidArgumentException $e) {
    echo $e->getMessage() . "\n";
}
`,
    checks: [
      { on: "stdout", name: "Рядок відхилено", has: "Очікується User", hint: "Для сторонніх значень add() має кинути виняток із назвою очікуваного класу." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "2\nОчікується User", hint: "Спершу кількість, потім текст винятку." },
      { on: "source", name: "Є докблок @template", matches: "@template\\s+T", hint: "Типовий параметр оголошують тегом @template у докблоці класу." },
      { on: "source", name: "Перевірка через instanceof", matches: "instanceof", hint: "Рантайм-перевірку зручно робити оператором instanceof." },
    ],
  },
  {
    ...base, id: "php-route-attributes", lesson: "php/49", xp: 35,
    title: "Маршрути з атрибутів",
    context: "Фреймворки читають атрибути методів контролера й будують таблицю маршрутів. Збудуйте мініатюрну версію: атрибут Route уже оголошено, потрібно прочитати його рефлексією.",
    brief: [
      "Функція <code>collectRoutes(string $class): array</code> проходить по методах класу, для кожного атрибута <code>Route</code> створює екземпляр через <code>newInstance()</code> і додає рядок формату <code>МЕТОД шлях -> метод_класу</code>, наприклад <code>GET /users -> list</code>.",
      "Готовий код друкує рядки через <code>implode</code> з переведенням рядка між ними.",
    ],
    starter: raw`<?php
#[Attribute(Attribute::TARGET_METHOD)]
final class Route
{
    public function __construct(public string $path, public string $method = "GET") {}
}

class UserController
{
    #[Route("/users")]
    public function list(): void {}

    #[Route("/users", method: "POST")]
    public function create(): void {}

    public function helper(): void {}
}

function collectRoutes(string $class): array
{
    $lines = [];
    // TODO: ReflectionClass, getMethods(), getAttributes(Route::class), newInstance()
    return $lines;
}

echo implode("\n", collectRoutes(UserController::class)) . "\n";
`,
    checks: [
      { on: "stdout", name: "Є маршрут POST", has: "POST /users -> create", hint: "Другий параметр Route задає метод, за замовчуванням GET." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "GET /users -> list\nPOST /users -> create", hint: "Метод без атрибута (helper) у таблицю не потрапляє; порядок як в оголошенні." },
      { on: "source", name: "Атрибути читаються рефлексією", matches: "getAttributes\\s*\\(", hint: "Скористайтеся методом getAttributes у ReflectionMethod." },
      { on: "source", name: "Екземпляр атрибута", matches: "newInstance\\s*\\(", hint: "Об'єкт атрибута створює newInstance()." },
    ],
  },
  {
    ...base, id: "php-reflect-ctor", lesson: "php/50", xp: 35,
    title: "Опис конструктора рефлексією",
    context: "Контейнери залежностей спершу вивчають параметри конструктора. Напишіть функцію, що описує їх за допомогою рефлексії: ім'я, тип і наявність значення за замовчуванням.",
    brief: [
      "Функція <code>describeCtor(string $class): array</code> повертає по рядку на кожен параметр конструктора у форматі <code>ім'я: тип</code>. Якщо параметр має значення за замовчуванням, додайте після типу <code> (необов'язковий)</code>. Тип отримайте приведенням <code>getType()</code> до рядка.",
      "Готовий код друкує рядки для класу <code>Point</code>, кожен з нового рядка.",
    ],
    starter: raw`<?php
class Point
{
    public function __construct(
        public int $x,
        public int $y = 0,
        public ?string $label = null,
    ) {}
}

function describeCtor(string $class): array
{
    $out = [];
    // TODO: (new ReflectionClass($class))->getConstructor()->getParameters()
    return $out;
}

echo implode("\n", describeCtor(Point::class)) . "\n";
`,
    checks: [
      { on: "stdout", name: "Необов'язковий параметр", has: "y: int (необов'язковий)", hint: "isOptional() або isDefaultValueAvailable() підкаже, що значення за замовчуванням є." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "x: int\ny: int (необов'язковий)\nlabel: ?string (необов'язковий)", hint: "Обов'язковий параметр x іде без дописки; nullable-тип друкується з знаком питання." },
      { on: "source", name: "Використано ReflectionClass", matches: "ReflectionClass", hint: "Починайте з new ReflectionClass($class)." },
      { on: "source", name: "Параметри конструктора", matches: "getParameters\\s*\\(", hint: "Параметри віддає getParameters() у ReflectionMethod." },
    ],
  },
  {
    ...base, id: "php-never-intersection", lesson: "php/51", xp: 35,
    title: "never, intersection і new в ініціалізаторі",
    context: "Зберіть докупи три можливості сучасних типів: функцію, що ніколи не повертається, параметр із перетином двох типів і значення за замовчуванням через new.",
    brief: [
      "Функція <code>fail(string $m): never</code> кидає <code>RuntimeException</code>. Функція <code>describe(Countable&amp;Traversable $c): string</code> повертає <code>N елементів: a,b,c</code> (кількість, потім елементи через кому). У класі <code>Service</code> параметр конструктора <code>Counter $c</code> має значення за замовчуванням <code>new Counter()</code>, метод <code>hit()</code> збільшує лічильник і повертає нове значення.",
      "Готовий код друкує опис <code>ArrayObject</code> із трьох літер, потім два виклики <code>hit()</code> та повідомлення винятку від <code>fail(\"порожньо\")</code> із префіксом <code>Помилка: </code>, кожне з нового рядка.",
    ],
    starter: raw`<?php
class Counter
{
    public int $n = 0;
}

class Service
{
    // TODO: значення за замовчуванням через new Counter()
    public function __construct(private Counter $c) {}

    public function hit(): int
    {
        return ++$this->c->n;
    }
}

function fail(string $m): never
{
    // TODO: киньте RuntimeException
    exit(0);
}

// TODO: змініть тип параметра на Countable&Traversable
function describe($c): string
{
    return "";
}

echo describe(new ArrayObject(["a", "b", "c"])) . "\n";
$s = new Service();
echo $s->hit() . "\n";
echo $s->hit() . "\n";
try {
    fail("порожньо");
} catch (RuntimeException $e) {
    echo "Помилка: " . $e->getMessage() . "\n";
}
`,
    checks: [
      { on: "stdout", name: "Опис колекції", has: "3 елементів: a,b,c", hint: "Кількість беріть з count(), елементи склейте через implode з iterator_to_array." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "3 елементів: a,b,c\n1\n2\nПомилка: порожньо", hint: "Сервіс без аргументу створює власний Counter, тож hit() дає 1, потім 2." },
      { on: "source", name: "Intersection-тип", matches: "Countable\\s*&\\s*Traversable", hint: "Тип параметра записують через амперсанд між двома іменами." },
      { on: "source", name: "new в ініціалізаторі", matches: "=\\s*new\\s+Counter", hint: "Значення за замовчуванням параметра може бути виразом new." },
      { on: "source", name: "Тип never", matches: ":\\s*never", hint: "Поверненим типом fail є never." },
    ],
  },
];
