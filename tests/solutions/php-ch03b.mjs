const raw = String.raw;

export const SOLUTIONS_03b = {
  "php-sort-leaderboard": raw`<?php
$scores = ["Оля" => 72, "Ів" => 95, "Марк" => 72, "Ана" => 88];
$words = ["слива", "ківі", "яблуко", "фіг"];

arsort($scores);
echo implode(", ", array_keys($scores)) . "\n";
$values = array_values($scores);
sort($values);
echo implode(", ", $values) . "\n";
usort($words, fn($a, $b) => mb_strlen($a) <=> mb_strlen($b));
echo implode(", ", $words) . "\n";
`,
  "php-merge-slice": raw`<?php
$base = ["Хліб", "Молоко"];
$extra = ["Сир", "Яйця", "Масло"];

$all = [...$base, ...$extra];
echo implode(", ", $all) . "\n";
echo implode(", ", array_slice($all, 0, 3)) . "\n";
echo implode(", ", array_slice($all, -2)) . "\n";
$removed = array_splice($all, 1, 1, ["Кефір", "Йогурт"]);
echo "Видалено: " . implode(", ", $removed) . "\n";
echo implode(", ", $all) . "\n";
`,
  "php-word-freq": raw`<?php
function wordFreq(string $text): array
{
    $words = preg_split('/[^\p{L}]+/u', mb_strtolower($text), -1, PREG_SPLIT_NO_EMPTY);
    $freq = array_count_values($words);
    uksort($freq, fn($x, $y) => $freq[$y] <=> $freq[$x] ?: strcmp((string)$x, (string)$y));
    return $freq;
}

$freq = wordFreq("Кіт та пес, кіт та миша. Пес спить, кіт грає.");
echo "Унікальних слів: " . count($freq) . "\n";
foreach (array_slice($freq, 0, 3, true) as $w => $n) {
    echo "$w: $n\n";
}
`,
  "php-column-combine": raw`<?php
$orders = [
    ["id" => 1, "city" => "Київ", "sum" => 100],
    ["id" => 2, "city" => "Львів", "sum" => 250],
    ["id" => 3, "city" => "Київ", "sum" => 70],
    ["id" => 4, "city" => "Одеса", "sum" => 40],
    ["id" => 5, "city" => "Львів", "sum" => 10],
];

echo implode(", ", array_values(array_unique(array_column($orders, "city")))) . "\n";
echo "Сума: " . array_sum(array_column($orders, "sum")) . "\n";
$parts = [];
foreach (array_column($orders, "sum", "id") as $id => $sum) {
    $parts[] = "$id=$sum";
}
echo implode(" ", $parts) . "\n";
echo "Пачки: " . count(array_chunk($orders, 2)) . "\n";
`,
  "php-copy-refs": raw`<?php
function double(array &$list): void
{
    foreach ($list as &$x) {
        $x *= 2;
    }
    unset($x);
}

function doubled(array $list): array
{
    foreach ($list as $k => $x) {
        $list[$k] = $x * 2;
    }
    return $list;
}

$nums = [1, 2, 3];
$copy = doubled($nums);
echo implode(", ", $nums) . "\n";
echo implode(", ", $copy) . "\n";
double($nums);
echo implode(", ", $nums) . "\n";
`,
  "php-multikey-sort": raw`<?php
$staff = [
    ["name" => "Оля", "dept" => "IT", "salary" => 100],
    ["name" => "Ів", "dept" => "HR", "salary" => 80],
    ["name" => "Марк", "dept" => "IT", "salary" => 120],
    ["name" => "Ана", "dept" => "HR", "salary" => 90],
];

usort($staff, fn($a, $b) => $a["dept"] <=> $b["dept"] ?: $b["salary"] <=> $a["salary"]);
foreach ($staff as $s) {
    echo $s["dept"] . " " . $s["name"] . " " . $s["salary"] . "\n";
}
echo implode(", ", array_column($staff, "name")) . "\n";
`,
};
