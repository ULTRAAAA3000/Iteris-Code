const raw = String.raw;

export const SOLUTIONS_02b = {
  "php-match-shipping": raw`<?php
function shipping(string $country): int
{
    return match ($country) {
        "UA" => 70,
        "PL", "DE" => 250,
        default => 400,
    };
}

foreach (["UA", "PL", "US", "DE"] as $c) {
    echo $c . ": " . shipping($c) . "\n";
}
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

$scores = ["Оля" => 95, "Петро" => 80, "Марко" => 61, "Ігор" => 30];

$passed = 0;
foreach ($scores as $name => $score) {
    $g = grade($score);
    echo $name . " " . $score . " " . $g . "\n";
    if ($g !== "D") {
        $passed++;
    }
}
echo "Склали: " . $passed . "\n";
`,
  "php-discount-func": raw`<?php
function price(float $base, int $percent = 0): float
{
    return round($base * (100 - $percent) / 100, 2);
}

printf("Без знижки: %.2f\n", price(200.0));
printf("Знижка 15%%: %.2f\n", price(200.0, 15));
printf("Знижка 50%%: %.2f\n", price(200.0, 50));
`,
  "php-named-args": raw`<?php
function total(int ...$nums): int
{
    return array_sum($nums);
}

function label(string $name, string $unit = "шт", int $qty = 1): string
{
    return $name . ": " . $qty . " " . $unit;
}

echo total(1, 2, 3), "\n";
echo total(...[10, 20, 30, 40]), "\n";
echo label("Чай", qty: 5), "\n";
`,
  "php-static-counter": raw`<?php
function nextId(): int
{
    static $id = 0;
    $id++;
    return $id;
}

function makeAdder(int $step): Closure
{
    return function (int $n) use ($step): int {
        return $n + $step;
    };
}

echo nextId(), "\n";
echo nextId(), "\n";
echo nextId(), "\n";
$add5 = makeAdder(5);
echo $add5(10), "\n";
`,
  "php-arrow-callable": raw`<?php
$prices = [100, 250, 40];
$rate = 2;
$words = ["php", "код", "мова"];

$doubled = array_map(fn (int $p): int => $p * $rate, $prices);
$lengths = array_map(mb_strlen(...), $words);

echo implode(",", $doubled), "\n";
echo implode(",", $lengths), "\n";
`,
  "php-recursion-sum": raw`<?php
function sumDeep(array $data): int
{
    $total = 0;
    foreach ($data as $item) {
        if (is_array($item)) {
            $total += sumDeep($item);
        } else {
            $total += $item;
        }
    }
    return $total;
}

echo sumDeep([1, [2, [3, 4]], 5, [[6]]]), "\n";
echo sumDeep([]), "\n";
`,
};
