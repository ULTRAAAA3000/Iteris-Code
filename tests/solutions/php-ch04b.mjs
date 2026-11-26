const raw = String.raw;

export const SOLUTIONS_04b = {
  "php-order-status-enum": raw`<?php
declare(strict_types=1);

enum Status: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Shipped = 'shipped';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Очікує',
            self::Paid => 'Оплачено',
            self::Shipped => 'Відправлено',
        };
    }
}

foreach (['paid', 'shipped', 'pending'] as $raw) {
    $s = Status::from($raw);
    echo $s->value . ': ' . $s->label() . PHP_EOL;
}
`,
  "php-employee-manager": raw`<?php
declare(strict_types=1);

class Employee
{
    public function __construct(protected string $name, protected int $salary) {}

    public function describe(): string
    {
        return $this->name . ' (' . $this->salary . ')';
    }

    protected function bonus(): int
    {
        return 0;
    }

    final public function total(): int
    {
        return $this->salary + $this->bonus();
    }
}

class Manager extends Employee
{
    public function __construct(string $name, int $salary, private int $bonus)
    {
        parent::__construct($name, $salary);
    }

    protected function bonus(): int
    {
        return $this->bonus;
    }

    public function describe(): string
    {
        return parent::describe() . ' + бонус ' . $this->bonus;
    }
}

$people = [new Employee('Олена', 1000), new Manager('Іван', 1000, 200)];
foreach ($people as $p) {
    echo $p->describe() . ' - ' . $p->total() . "\n";
}
`,
  "php-deep-clone": raw`<?php
declare(strict_types=1);

class Address
{
    public function __construct(public string $city) {}
}

class User
{
    public function __construct(public string $name, public Address $address) {}

    public function __clone()
    {
        $this->address = clone $this->address;
    }
}

$a = new User('Ольга', new Address('Київ'));
$b = clone $a;
$b->address->city = 'Львів';
echo 'a: ' . $a->address->city . "\n";
echo 'b: ' . $b->address->city . "\n";
`,
  "php-late-static": raw`<?php
declare(strict_types=1);

class Model
{
    public static function make(): static
    {
        return new static();
    }

    public function kind(): string
    {
        return static::class;
    }
}

class User extends Model {}
class Post extends Model {}

foreach (['Model', 'User', 'Post'] as $cls) {
    echo $cls::make()->kind() . "\n";
}
`,
};
