const raw = String.raw;

export const SOLUTIONS_05a = {
  "php-interface-discount": raw`<?php
interface Discount
{
    public function apply(int $price): int;
}

class PercentOff implements Discount
{
    public function __construct(private int $percent) {}

    public function apply(int $price): int
    {
        return $price - intdiv($price * $this->percent, 100);
    }
}

class FixedOff implements Discount
{
    public function __construct(private int $amount) {}

    public function apply(int $price): int
    {
        return max(0, $price - $this->amount);
    }
}

$discounts = [new PercentOff(10), new FixedOff(50), new FixedOff(2000)];

foreach ($discounts as $d) {
    echo get_class($d) . ": " . $d->apply(1000) . "\n";
}
`,
  "php-abstract-employee": raw`<?php
abstract class Employee
{
    public function __construct(protected string $name) {}

    abstract public function pay(): int;

    public function line(): string
    {
        return $this->name . ": " . $this->pay();
    }
}

class Salaried extends Employee
{
    public function __construct(string $name, private int $salary)
    {
        parent::__construct($name);
    }

    public function pay(): int
    {
        return $this->salary;
    }
}

class Hourly extends Employee
{
    public function __construct(string $name, private int $rate, private int $hours)
    {
        parent::__construct($name);
    }

    public function pay(): int
    {
        return $this->rate * $this->hours;
    }
}

echo (new Salaried("Іван", 3000))->line() . "\n";
echo (new Hourly("Марія", 150, 8))->line() . "\n";
try {
    new Employee("X");
} catch (Error $e) {
    echo "Помилка: " . $e->getMessage() . "\n";
}
`,
  "php-trait-tags": raw`<?php
trait HasTags
{
    private array $tags = [];

    public function addTag(string $tag): static
    {
        if (!in_array($tag, $this->tags, true)) {
            $this->tags[] = $tag;
        }
        return $this;
    }

    public function tagList(): string
    {
        return implode(", ", $this->tags);
    }
}

class Post { use HasTags; }
class Product { use HasTags; }

$post = new Post();
$product = new Product();
$post->addTag("php")->addTag("oop")->addTag("php");
$product->addTag("sale");

echo "Post: " . $post->tagList() . "\n";
echo "Product: " . $product->tagList() . "\n";
`,
  "php-override-tax": raw`<?php
class Item
{
    public function __construct(protected int $price) {}

    public function tax(): int
    {
        return intdiv($this->price * 20, 100);
    }

    public function total(): int
    {
        return $this->price + $this->tax();
    }
}

class Book extends Item
{
    public function tax(): int
    {
        return intdiv($this->price * 5, 100);
    }
}

class Luxury extends Item
{
    public function tax(): int
    {
        return parent::tax() + intdiv($this->price, 10);
    }
}

$items = [new Item(1000), new Book(1000), new Luxury(1000)];

foreach ($items as $i) {
    echo get_class($i) . ": " . $i->total() . "\n";
}
`,
  "php-union-describe": raw`<?php
declare(strict_types=1);

function describe(int|string|null $id): string
{
    if ($id === null) {
        return "немає";
    }
    return is_int($id) ? "№" . $id : "код:" . $id;
}

function sum(iterable $items): int
{
    $total = 0;
    foreach ($items as $n) {
        $total += $n;
    }
    return $total;
}

echo describe(7) . "\n";
echo describe("ab") . "\n";
echo describe(null) . "\n";
echo sum([1, 2, 3]) . "\n";
echo sum(new ArrayIterator([4, 5])) . "\n";
try {
    describe(1.5);
} catch (TypeError $e) {
    echo "TypeError\n";
}
`,
  "php-magic-config": raw`<?php
class Config
{
    public function __construct(private array $data) {}

    public function __get(string $name): mixed
    {
        return $this->data[$name] ?? null;
    }

    public function __isset(string $name): bool
    {
        return isset($this->data[$name]);
    }

    public function __call(string $name, array $args): mixed
    {
        return $this->data[lcfirst(substr($name, 3))] ?? null;
    }

    public function __toString(): string
    {
        $parts = [];
        foreach ($this->data as $k => $v) {
            $parts[] = $k . "=" . $v;
        }
        return implode(";", $parts);
    }
}

$c = new Config(['host' => 'localhost', 'port' => 8080]);
echo $c->host . "\n";
echo (isset($c->port) ? "так" : "ні") . " " . (isset($c->user) ? "так" : "ні") . "\n";
echo $c->getPort() . "\n";
echo $c . "\n";
`,
};
