const raw = String.raw;

export const SOLUTIONS_02a = {
  "php-order-total": raw`<?php
$price = 19.9;
$qty = 3;
$total = $price * $qty;

echo "Разом: " . number_format($total, 2) . PHP_EOL;
echo gettype($price) . " " . gettype($qty) . PHP_EOL;
`,
  "php-int-cents": raw`<?php
$a = 1999;
$b = 550;
$c = 250;

$sum = $a + $b + $c;
echo "Разом: " . intdiv($sum, 100) . "." . str_pad((string)($sum % 100), 2, "0", STR_PAD_LEFT) . "\n";
echo "0.1 + 0.2 == 0.3: " . (0.1 + 0.2 == 0.3 ? "так" : "ні") . "\n";
`,
  "php-greeting-card": raw`<?php
$name = "Оля";
$items = 3;

echo <<<TXT
Вітаємо, {$name}!
У кошику $items товари.
TXT;
echo "\n";
echo "Символів у імені: " . mb_strlen($name) . "\n";
`,
  "php-constants-config": raw`<?php
const SHOP = "Книгарня";
define('TAX_PERCENT', 20);

function showPrice(int $price): void
{
    echo "Магазин: " . SHOP . "\n";
    echo "Ціна з податком: " . ($price + intdiv($price * TAX_PERCENT, 100)) . "\n";
    echo "Функція: " . __FUNCTION__ . "\n";
}

showPrice(100);
`,
  "php-safe-cast": raw`<?php
declare(strict_types=1);

function toQty(string $raw): int
{
    if (!is_numeric($raw)) {
        return 0;
    }
    return (int)$raw;
}

foreach (["12", "abc", "7", "3.9"] as $raw) {
    echo $raw . " -> " . toQty($raw) . "\n";
}
`,
  "php-null-defaults": raw`<?php
$input = ['name' => 'Оля', 'age' => 0, 'note' => null];

echo "Ім'я: " . ($input['name'] ?? 'гість') . "\n";
echo "Місто: " . ($input['city'] ?? 'невідомо') . "\n";
echo "Вік: " . ($input['age'] ?? 18) . "\n";
echo "Примітка: " . ($input['note'] ?? 'немає') . "\n";

$input['lang'] ??= 'uk';
echo "Мова: " . $input['lang'] . "\n";
`,
  "php-receipt-format": raw`<?php
$rows = [["Bread", 3, 19.5], ["Milk", 2, 42.0], ["Cheese", 1, 1189.9]];
$sum = 0;

foreach ($rows as [$name, $qty, $price]) {
    printf("%-8s|%3d|%8.2f\n", $name, $qty, $price);
    $sum += $qty * $price;
}

echo "Разом: " . number_format($sum, 2, ',', ' ') . "\n";
`,
};
