const raw = String.raw;

export const SOLUTIONS_03a = {
  "php-index-queue": raw`<?php
$queue = ['Оля', 'Іван'];

$queue[] = 'Марія';
$served = array_shift($queue);

echo 'Обслужено: ' . $served . "\n";
echo 'У черзі: ' . implode(', ', $queue) . "\n";
echo 'Розмір: ' . count($queue);
`,
  "php-arrays-products": raw`<?php
$product = ['name' => 'Хліб', 'price' => 25, 'qty' => 3];

$product['price'] = 28;
$product['unit'] = 'шт';

foreach ($product as $key => $value) {
    echo "$key: $value\n";
}
echo 'Сума: ' . $product['price'] * $product['qty'];
`,
  "php-nested-orders": raw`<?php
$orders = [
    ['customer' => 'Оля', 'items' => [
        ['name' => 'Хліб', 'qty' => 2, 'price' => 25],
        ['name' => 'Молоко', 'qty' => 1, 'price' => 42],
    ]],
    ['customer' => 'Іван', 'items' => [
        ['name' => 'Сир', 'qty' => 1, 'price' => 180],
    ]],
];

$grand = 0;
foreach ($orders as $order) {
    $total = 0;
    foreach ($order['items'] as $item) {
        $total += $item['qty'] * $item['price'];
    }
    echo $order['customer'] . ': ' . $total . " грн\n";
    $grand += $total;
}
echo 'Разом: ' . $grand . ' грн';
`,
  "php-destructure-rows": raw`<?php
$rows = [['Оля', 90], ['Іван', 75]];

foreach ($rows as [$name, $score]) {
    echo $name . ' - ' . $score . "\n";
}

$pair = explode('=', 'lang=uk');
[$key, $value] = $pair;
echo $key . ' -> ' . $value . "\n";
`,
  "php-array-lookup": raw`<?php
$roles = ['admin', 'editor', 'viewer'];

echo 'Ролей: ' . count($roles) . "\n";
echo 'editor є: ' . (in_array('editor', $roles, true) ? 'так' : 'ні') . "\n";
echo 'Позиція viewer: ' . array_search('viewer', $roles, true) . "\n";
echo 'guest є: ' . (in_array('guest', $roles, true) ? 'так' : 'ні');
`,
  "php-map-filter-reduce": raw`<?php
$prices = [120, 35, 80, 15, 60];

$expensive = array_values(array_filter($prices, function ($p) {
    return $p >= 50;
}));
$discounted = array_map(function ($p) {
    return $p - 10;
}, $expensive);
$sum = array_reduce($discounted, function ($acc, $p) {
    return $acc + $p;
}, 0);

echo 'Дорогі: ' . implode(', ', $expensive) . "\n";
echo 'Після знижки: ' . implode(', ', $discounted) . "\n";
echo 'Сума: ' . $sum;
`,
};
