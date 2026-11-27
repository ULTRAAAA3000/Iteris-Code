const raw = String.raw;

export const SOLUTIONS_08b = {
  "php-numbers-money": raw`<?php
declare(strict_types=1);

function formatMoney(int $cents): string
{
    return intdiv($cents, 100) . "." . str_pad((string) ($cents % 100), 2, "0", STR_PAD_LEFT);
}

function splitBill(int $cents, int $people): array
{
    return [intdiv($cents, $people), $cents % $people];
}

echo formatMoney(199900), "\n";
echo formatMoney(5), "\n";
[$share, $rest] = splitBill(1000, 3);
echo $share, " ", $rest, "\n";
`,
  "php-spl-rpn": raw`<?php
declare(strict_types=1);

function rpn(string $expr): int
{
    $stack = new SplStack();
    foreach (explode(' ', $expr) as $token) {
        if (is_numeric($token)) {
            $stack->push((int) $token);
            continue;
        }
        $right = $stack->pop();
        $left = $stack->pop();
        $stack->push(match ($token) {
            '+' => $left + $right,
            '-' => $left - $right,
            '*' => $left * $right,
        });
    }
    return $stack->pop();
}

function drain(array $jobs): string
{
    $queue = new SplQueue();
    foreach ($jobs as $job) {
        $queue->enqueue($job);
    }
    $out = [];
    while (!$queue->isEmpty()) {
        $out[] = $queue->dequeue();
    }
    return implode(' ', $out);
}

echo rpn("2 3 4 * +"), "\n";
echo rpn("10 2 8 * + 3 -"), "\n";
echo drain(['A', 'B', 'C']), "\n";
`,
  "php-heap-queue": raw`<?php
declare(strict_types=1);

function schedule(array $tasks): string
{
    $q = new SplPriorityQueue();
    $seq = 0;
    foreach ($tasks as [$name, $prio]) {
        $q->insert($name, [$prio, -$seq++]);
    }
    $out = [];
    while (!$q->isEmpty()) {
        $out[] = $q->extract();
    }
    return implode(' ', $out);
}

function smallest(array $nums, int $k): string
{
    $heap = new SplMinHeap();
    foreach ($nums as $n) {
        $heap->insert($n);
    }
    $out = [];
    for ($i = 0; $i < $k; $i++) {
        $out[] = $heap->extract();
    }
    return implode(' ', $out);
}

function squares(int $n): string
{
    $arr = new SplFixedArray($n);
    for ($i = 0; $i < $n; $i++) {
        $arr[$i] = $i * $i;
    }
    return implode(',', $arr->toArray());
}

echo schedule([['docs', 1], ['deploy', 5], ['fix', 5], ['lint', 3]]), "\n";
echo smallest([9, 4, 7, 1, 8], 3), "\n";
echo squares(4), "\n";
`,
  "php-tz-meeting": raw`<?php
$utc = new DateTimeZone('UTC');
$meeting = new DateTimeImmutable('2025-07-01 12:00:00', $utc);

foreach (['Europe/Kyiv', 'America/New_York', 'Asia/Tokyo'] as $name) {
    $local = $meeting->setTimezone(new DateTimeZone($name));
    echo $name, " ", $local->format('H:i'), "\n";
}

$count = 0;
$period = new DatePeriod(
    new DateTimeImmutable('2025-03-03', $utc),
    new DateInterval('P1D'),
    new DateTimeImmutable('2025-03-10', $utc)
);
foreach ($period as $day) {
    if ((int) $day->format('N') <= 5) {
        $count++;
    }
}
echo "Робочих днів: ", $count, "\n";
`,
  "php-csv-memory": raw`<?php
$rows = [['name', 'qty'], ['Apple', 3], ['Pear, green', 5]];

$h = fopen('php://memory', 'w+');
foreach ($rows as $row) {
    fputcsv($h, $row, ',', '"', '');
}
rewind($h);

$header = fgetcsv($h, null, ',', '"', '');
$total = 0;
while (($row = fgetcsv($h, null, ',', '"', '')) !== false) {
    $item = array_combine($header, $row);
    echo $item['name'], ": ", $item['qty'], "\n";
    $total += (int) $item['qty'];
}
fclose($h);
echo "Разом: ", $total, "\n";
`,
  "php-serialize-settings": raw`<?php
final class Settings
{
    private array $cache = [];

    public function __construct(public string $theme, public string $lang) {}

    public function remember(string $key, string $value): void
    {
        $this->cache[$key] = $value;
    }

    public function cacheSize(): int
    {
        return count($this->cache);
    }

    public function __serialize(): array
    {
        return ['theme' => $this->theme, 'lang' => $this->lang];
    }

    public function __unserialize(array $data): void
    {
        $this->theme = $data['theme'];
        $this->lang = $data['lang'];
        $this->cache = [];
    }
}

$s = new Settings('dark', 'uk');
$s->remember('menu', 'open');
$text = serialize($s);
echo $text, "\n";

$copy = unserialize($text);
echo $copy->theme, " ", $copy->lang, "\n";
echo $copy->cacheSize(), "\n";
echo var_export(str_contains($text, 'cache'), true), "\n";
`,
};
