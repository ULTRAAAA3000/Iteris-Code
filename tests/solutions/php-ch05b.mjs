const raw = String.raw;

export const SOLUTIONS_05b = {
  "php-arrayaccess-cart": raw`<?php
class Cart implements ArrayAccess, Countable
{
    private array $items = [];

    public function offsetExists(mixed $offset): bool
    {
        return isset($this->items[$offset]);
    }

    public function offsetGet(mixed $offset): mixed
    {
        return $this->items[$offset] ?? 0;
    }

    public function offsetSet(mixed $offset, mixed $value): void
    {
        if ($offset === null) {
            $this->items[] = $value;
        } else {
            $this->items[$offset] = $value;
        }
    }

    public function offsetUnset(mixed $offset): void
    {
        unset($this->items[$offset]);
    }

    public function count(): int
    {
        return count($this->items);
    }
}

$c = new Cart();
$c["apple"] = 3;
$c["pear"] = 2;
$c["kiwi"] = 5;
unset($c["pear"]);
echo count($c) . "\n";
echo ($c["apple"] + $c["kiwi"]) . "\n";
echo (isset($c["pear"]) ? "є" : "немає") . "\n";
echo (isset($c["apple"]) ? "є" : "немає") . "\n";
echo $c["none"] . "\n";
`,
  "php-closure-counter": raw`<?php
function makeCounter(int $start, int $step = 1): Closure
{
    $current = $start;
    return function () use (&$current, $step): int {
        $current += $step;
        return $current;
    };
}

function multiplier(int $k): Closure
{
    return fn(int $x): int => $x * $k;
}

$a = makeCounter(10);
$b = makeCounter(100, 5);
echo $a() . "\n";
echo $a() . "\n";
echo $b() . "\n";
echo $a() . "\n";
echo array_sum(array_map(multiplier(3), [1, 2, 3])) . "\n";
`,
  "php-typed-collection": raw`<?php
class User
{
    public function __construct(public string $name) {}
}

/**
 * @template T
 */
class Collection implements Countable
{
    /** @var list<T> */
    private array $items = [];

    /** @param class-string<T> $type */
    public function __construct(private string $type) {}

    /** @param T $item */
    public function add(mixed $item): void
    {
        if (!$item instanceof $this->type) {
            throw new InvalidArgumentException("Очікується " . $this->type);
        }
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
  "php-route-attributes": raw`<?php
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
    foreach ((new ReflectionClass($class))->getMethods() as $m) {
        foreach ($m->getAttributes(Route::class) as $attr) {
            $r = $attr->newInstance();
            $lines[] = $r->method . " " . $r->path . " -> " . $m->getName();
        }
    }
    return $lines;
}

echo implode("\n", collectRoutes(UserController::class)) . "\n";
`,
  "php-reflect-ctor": raw`<?php
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
    foreach ((new ReflectionClass($class))->getConstructor()->getParameters() as $p) {
        $line = $p->getName() . ": " . $p->getType();
        if ($p->isOptional()) {
            $line .= " (необов'язковий)";
        }
        $out[] = $line;
    }
    return $out;
}

echo implode("\n", describeCtor(Point::class)) . "\n";
`,
  "php-never-intersection": raw`<?php
class Counter
{
    public int $n = 0;
}

class Service
{
    public function __construct(private Counter $c = new Counter()) {}

    public function hit(): int
    {
        return ++$this->c->n;
    }
}

function fail(string $m): never
{
    throw new RuntimeException($m);
}

function describe(Countable&Traversable $c): string
{
    return count($c) . " елементів: " . implode(",", iterator_to_array($c));
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
};
