// Еталонні рішення завдань PHP (id завдання -> повний код). У сайт не потрапляють
const raw = String.raw;

export const PHP = {
  "php-hello-calc": raw`<?php
echo "Привіт, PHP!" . PHP_EOL;
echo "2 + 3 = " . (2 + 3) . PHP_EOL;
`,
  "php-order-total": raw`<?php
$price = 19.9;
$qty = 3;
$total = $price * $qty;

echo "Разом: " . number_format($total, 2) . PHP_EOL;
echo gettype($price) . " " . gettype($qty) . PHP_EOL;
`,
  "php-strings-slug": raw`<?php
function slugify(string $title): string
{
    return preg_replace('/\s+/', '-', strtolower(trim($title)));
}

function shout(string $s): string
{
    return strtoupper($s) . "!";
}

function isPalindrome(string $s): bool
{
    $s = strtolower($s);
    return $s === strrev($s);
}

echo slugify("  Hello   World From PHP ") . PHP_EOL;
echo shout("php") . PHP_EOL;
echo var_export(isPalindrome("Level"), true) . PHP_EOL;
echo var_export(isPalindrome("PHP8"), true) . PHP_EOL;
`,
  "php-grade-loop": raw`<?php
function grade(int $score): string
{
    if ($score >= 90) {
        return "A";
    } elseif ($score >= 75) {
        return "B";
    } elseif ($score >= 60) {
        return "C";
    } else {
        return "D";
    }
}

foreach ([95, 80, 61, 30] as $s) {
    echo $s . " " . grade($s) . PHP_EOL;
}
`,
  "php-arrays-products": raw`<?php
function evens(array $nums): array
{
    return array_values(array_filter($nums, fn($n) => $n % 2 === 0));
}

function totalPrice(array $items): float
{
    return array_sum(array_column($items, 'price'));
}

function names(array $items): array
{
    return array_map(fn($item) => $item['name'], $items);
}

$products = [
    ['name' => 'Хліб', 'price' => 25.5],
    ['name' => 'Молоко', 'price' => 42],
    ['name' => 'Сир', 'price' => 180],
];

echo implode(' ', evens([5, 2, 9, 7, 4, 10, 3, 8])) . PHP_EOL;
echo totalPrice($products) . PHP_EOL;
echo implode(', ', names($products)) . PHP_EOL;
`,
  "php-form-validate": raw`<?php
function validate(array $post): array
{
    $errors = [];
    if (trim($post['name'] ?? '') === '') {
        $errors[] = "Ім'я обов'язкове";
    }
    if (!filter_var($post['email'] ?? '', FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Невірний email";
    }
    if ((int)($post['age'] ?? 0) < 18) {
        $errors[] = "Вік має бути 18+";
    }
    return $errors;
}

function safe(string $s): string
{
    return htmlspecialchars($s);
}

$bad = ['name' => '', 'email' => 'not-an-email', 'age' => '16'];
$good = ['name' => 'Оля', 'email' => 'olya@example.com', 'age' => '25'];

echo implode('; ', validate($bad)) . PHP_EOL;
echo (validate($good) === [] ? 'OK' : 'є помилки') . PHP_EOL;
echo safe('<b>Оля</b>') . PHP_EOL;
`,
  "php-product-class": raw`<?php
class Product
{
    public function __construct(private string $name, private float $price)
    {
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function __toString(): string
    {
        return $this->name . ': ' . number_format($this->price, 2);
    }
}

$products = [new Product('Хліб', 25.5), new Product('Молоко', 42), new Product('Сир', 180)];
$total = 0;
foreach ($products as $p) {
    echo $p . PHP_EOL;
    $total += $p->getPrice();
}
echo 'Разом: ' . number_format($total, 2) . PHP_EOL;
`,
  "php-password-auth": raw`<?php
function register(string $password): string
{
    return password_hash($password, PASSWORD_DEFAULT);
}

function login(string $password, string $hash): bool
{
    return password_verify($password, $hash);
}

$hash = register('secret123');
echo (login('secret123', $hash) ? 'Вхід дозволено' : 'Відмовлено') . PHP_EOL;
echo (login('wrong', $hash) ? 'Вхід дозволено' : 'Відмовлено') . PHP_EOL;
echo ($hash !== 'secret123' ? 'Пароль не зберігається відкрито' : 'Пароль збережено відкрито!') . PHP_EOL;
`,
  "php-psr4-path": raw`<?php
namespace App\Models {
    class User {}
}

namespace {
    function classToPath(string $class): string
    {
        $relative = substr($class, strlen('App\\'));
        return 'src/' . str_replace('\\', '/', $relative) . '.php';
    }

    echo \App\Models\User::class . PHP_EOL;
    echo classToPath(\App\Models\User::class) . PHP_EOL;
    echo classToPath('App\Services\Mailer') . PHP_EOL;
}
`,
};
