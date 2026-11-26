const raw = String.raw;

export const SOLUTIONS_07a = {
  "php-compose-pipeline": raw`<?php
declare(strict_types=1);

function compose(callable ...$fns): callable
{
    return function (mixed $x) use ($fns): mixed {
        foreach ($fns as $fn) {
            $x = $fn($x);
        }
        return $x;
    };
}

$shout = compose('trim', 'strtoupper', fn($s) => $s . '!');
echo $shout("  hello "), "\n";

$calc = compose(fn($x) => $x + 1, fn($x) => $x * 2);
echo $calc(5), "\n";
echo implode(",", array_map($calc, [1, 2, 3])), "\n";
`,
  "php-iterator-countdown": raw`<?php
final class Countdown implements Iterator
{
    private int $pos = 0;

    public function __construct(private int $from) {}

    public function current(): mixed { return $this->from - $this->pos; }

    public function key(): mixed { return $this->pos; }

    public function next(): void { $this->pos++; }

    public function rewind(): void { $this->pos = 0; }

    public function valid(): bool { return $this->pos < $this->from; }
}

foreach (new Countdown(3) as $k => $v) {
    echo "$k: $v\n";
}
echo implode(",", iterator_to_array(new Countdown(3), false)), "\n";
`,
  "php-gen-evens": raw`<?php
function evens(int $max): Generator
{
    for ($i = 2; $i <= $max; $i += 2) {
        yield $i;
    }
}

echo implode(" ", iterator_to_array(evens(10), false)), "\n";

$sum = 0;
foreach (evens(10) as $n) {
    $sum += $n;
}
echo "Сума: $sum\n";
echo get_class(evens(2)), "\n";
`,
  "php-yield-from-merge": raw`<?php
function merge(array ...$parts): Generator
{
    foreach ($parts as $part) {
        yield from $part;
    }
}

$pairs = [];
foreach (merge(['a' => 1, 'b' => 2], ['b' => 3, 'c' => 4]) as $k => $v) {
    $pairs[] = "$k=$v";
}
echo "Обхід: ", implode(" ", $pairs), "\n";
echo "З ключами: ", count(iterator_to_array(merge(['a' => 1, 'b' => 2], ['b' => 3, 'c' => 4]))), "\n";
echo "Без ключів: ", count(iterator_to_array(merge(['a' => 1, 'b' => 2], ['b' => 3, 'c' => 4]), false)), "\n";
`,
  "php-gen-pipeline": raw`<?php
function trimmed(iterable $in): Generator
{
    foreach ($in as $line) {
        yield trim($line);
    }
}

function nonEmpty(iterable $in): Generator
{
    foreach ($in as $line) {
        if ($line !== '') {
            yield $line;
        }
    }
}

function upper(iterable $in): Generator
{
    foreach ($in as $line) {
        yield strtoupper($line);
    }
}

$raw = ["  apple ", "", "banana", "   ", "cherry"];
$lines = iterator_to_array(upper(nonEmpty(trimmed($raw))), false);
echo implode(",", $lines), "\n";
echo "Разом: ", count($lines), "\n";
`,
  "php-infinite-take": raw`<?php
function naturals(): Generator
{
    $n = 1;
    while (true) {
        yield $n++;
    }
}

function divisibleBy(iterable $in, int $k): Generator
{
    foreach ($in as $v) {
        if ($v % $k === 0) {
            yield $v;
        }
    }
}

function take(iterable $in, int $n): Generator
{
    if ($n <= 0) {
        return;
    }
    foreach ($in as $v) {
        yield $v;
        if (--$n <= 0) {
            return;
        }
    }
}

echo implode(" ", iterator_to_array(take(divisibleBy(naturals(), 7), 5), false)), "\n";
echo implode(" ", iterator_to_array(take(naturals(), 3), false)), "\n";
`,
  "php-aggregate-shelf": raw`<?php
final class Shelf implements IteratorAggregate
{
    private array $books = [];

    public function add(string $title): void
    {
        $this->books[] = $title;
    }

    public function getIterator(): Iterator
    {
        return new ArrayIterator($this->books);
    }
}

$shelf = new Shelf();
foreach (["Дюна", "Солярис", "Кобзар"] as $title) {
    $shelf->add($title);
}

foreach ($shelf as $i => $book) {
    echo "$i: $book\n";
}

$firstTwo = iterator_to_array(new LimitIterator($shelf->getIterator(), 0, 2), false);
echo "Перші дві: ", implode(", ", $firstTwo), "\n";
`,
  "php-lazy-collection": raw`<?php
function naturals(): Generator
{
    $n = 1;
    while (true) {
        yield $n++;
    }
}

final class Lazy
{
    private function __construct(private iterable $src) {}

    public static function from(iterable $src): self
    {
        return new self($src);
    }

    public function map(callable $f): self
    {
        $src = $this->src;
        return new self((function () use ($src, $f) {
            foreach ($src as $v) {
                yield $f($v);
            }
        })());
    }

    public function filter(callable $f): self
    {
        $src = $this->src;
        return new self((function () use ($src, $f) {
            foreach ($src as $v) {
                if ($f($v)) {
                    yield $v;
                }
            }
        })());
    }

    public function take(int $n): self
    {
        $src = $this->src;
        return new self((function () use ($src, $n) {
            if ($n <= 0) {
                return;
            }
            foreach ($src as $v) {
                yield $v;
                if (--$n <= 0) {
                    return;
                }
            }
        })());
    }

    public function toArray(): array
    {
        $out = [];
        foreach ($this->src as $v) {
            $out[] = $v;
        }
        return $out;
    }
}

$calls = 0;
$result = Lazy::from(naturals())
    ->filter(fn($x) => $x % 2 === 0)
    ->map(function ($x) use (&$calls) {
        $calls++;
        return $x * $x;
    })
    ->take(3)
    ->toArray();

echo implode(",", $result), "\n";
echo "Викликів map: $calls\n";
`,
};
