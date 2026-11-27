const raw = String.raw;

export const SOLUTIONS_04a = {
  "php-product-class": raw`<?php
class Product
{
    public string $name = '';
    public float $price = 0.0;

    public function label(): string
    {
        return $this->name . ': ' . number_format($this->price, 2);
    }
}

$products = [];
foreach ([['Хліб', 25.5], ['Молоко', 42.0], ['Сир', 180.0]] as [$name, $price]) {
    $p = new Product();
    $p->name = $name;
    $p->price = $price;
    $products[] = $p;
}

$total = 0.0;
foreach ($products as $p) {
    echo $p->label() . PHP_EOL;
    $total += $p->price;
}
echo 'Разом: ' . number_format($total, 2) . PHP_EOL;
`,
  "php-cart-promotion": raw`<?php
declare(strict_types=1);

class Item
{
    public function __construct(
        public string $title,
        public int $qty,
        public float $price,
    ) {
    }

    public function sum(): float
    {
        return $this->qty * $this->price;
    }
}

$rows = [['Ручка', 3, 5.0], ['Зошит', 2, 12.5]];
$items = [];
foreach ($rows as [$title, $qty, $price]) {
    $items[] = new Item($title, $qty, $price);
}

$total = 0.0;
foreach ($items as $item) {
    echo $item->title . ' x' . $item->qty . ' = ' . number_format($item->sum(), 2) . PHP_EOL;
    $total += $item->sum();
}
echo 'Разом: ' . number_format($total, 2) . PHP_EOL;
`,
  "php-account-visibility": raw`<?php
class Account
{
    private int $balance = 0;

    public function deposit(int $amount): bool
    {
        if ($amount <= 0) {
            return false;
        }
        $this->balance += $amount;
        return true;
    }

    public function withdraw(int $amount): bool
    {
        if ($amount <= 0 || $amount > $this->balance) {
            return false;
        }
        $this->balance -= $amount;
        return true;
    }

    public function balance(): int
    {
        return $this->balance;
    }
}

function show(string $label, bool $ok): void
{
    echo $label . ': ' . ($ok ? 'ok' : 'відмова') . PHP_EOL;
}

$acc = new Account();
show('внесок 500', $acc->deposit(500));
show('зняття 200', $acc->withdraw(200));
show('зняття 1000', $acc->withdraw(1000));
show('внесок -5', $acc->deposit(-5));
echo 'Баланс: ' . $acc->balance() . PHP_EOL;
`,
  "php-class-static-counter": raw`<?php
class Ticket
{
    public const PREFIX = 'T-';
    private static int $next = 1;

    public string $code = '';

    public static function issue(): self
    {
        $t = new self();
        $t->code = self::PREFIX . sprintf('%03d', self::$next);
        self::$next++;
        return $t;
    }

    public static function issued(): int
    {
        return self::$next - 1;
    }
}

for ($i = 0; $i < 3; $i++) {
    $t = Ticket::issue();
    echo $t->code . PHP_EOL;
}
echo 'Видано: ' . Ticket::issued() . PHP_EOL;
`,
  "php-money-value": raw`<?php
class Money
{
    public function __construct(
        public readonly int $cents,
        public readonly string $currency = 'UAH',
    ) {
    }

    public function add(Money $other): self
    {
        return new self($this->cents + $other->cents, $this->currency);
    }

    public function equals(Money $other): bool
    {
        return $this->cents === $other->cents && $this->currency === $other->currency;
    }

    public function format(): string
    {
        return number_format($this->cents / 100, 2, '.', '') . ' ' . $this->currency;
    }
}

function yesNo(bool $v): string
{
    return $v ? 'так' : 'ні';
}

$a = new Money(1250);
$b = new Money(250);
$c = $a->add($b);
echo $a->format() . PHP_EOL;
echo $c->format() . PHP_EOL;
echo 'a == c: ' . yesNo($a->equals($c)) . PHP_EOL;
echo 'a == 1250: ' . yesNo($a->equals(new Money(1250))) . PHP_EOL;
`,
};
