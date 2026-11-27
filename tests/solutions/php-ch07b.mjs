const raw = String.raw;

export const SOLUTIONS_07b = {
  "php-memoize": raw`<?php
declare(strict_types=1);

$calls = 0;

function memoize(callable $fn): callable
{
    $cache = [];
    return function (int $n) use (&$cache, $fn): mixed {
        if (!array_key_exists($n, $cache)) {
            $cache[$n] = $fn($n);
        }
        return $cache[$n];
    };
}

$square = memoize(function (int $n) use (&$calls): int {
    $calls++;
    return $n * $n;
});

$out = [];
foreach ([4, 4, 5, 4] as $n) {
    $out[] = $square($n);
}
echo implode(" ", $out), "\n";
echo "Викликів: $calls\n";
`,
  "php-date-deadlines": raw`<?php
declare(strict_types=1);

$tz = new DateTimeZone('UTC');
$start = new DateTimeImmutable('2025-01-15 10:00:00', $tz);

function deadline(DateTimeImmutable $start, int $days): DateTimeImmutable
{
    return $start->modify("+$days days");
}

function daysLeft(DateTimeImmutable $now, DateTimeImmutable $due): int
{
    return $now->diff($due)->days;
}

$due = deadline($start, 30);
echo "Дедлайн: ", $due->format('Y-m-d'), "\n";
echo "Лишилось днів: ", daysLeft($start, $due), "\n";
echo "Початок: ", $start->format('Y-m-d'), "\n";
`,
  "php-stream-log": raw`<?php
declare(strict_types=1);

function parse(iterable $lines): Generator
{
    foreach ($lines as $line) {
        yield explode(' ', $line, 2);
    }
}

function onlyLevel(iterable $items, string $level): Generator
{
    foreach ($items as $item) {
        if ($item[0] === $level) {
            yield $item;
        }
    }
}

$log = [
    "INFO сервер запущено",
    "ERROR диск майже повний",
    "INFO запит оброблено",
    "ERROR таймаут бази",
];

$count = 0;
foreach (onlyLevel(parse($log), 'ERROR') as [$level, $msg]) {
    echo "- $msg\n";
    $count++;
}
echo "Помилок: $count\n";
`,
  "php-gen-send-average": raw`<?php
declare(strict_types=1);

function averager(): Generator
{
    $sum = 0;
    $count = 0;
    $avg = null;
    while (true) {
        $x = yield $avg;
        if ($x === null) {
            break;
        }
        $sum += $x;
        $count++;
        $avg = $sum / $count;
    }
    return [$count, $avg];
}

$gen = averager();
$gen->current();
foreach ([10, 20, 60] as $n) {
    $avg = $gen->send($n);
    echo "Середнє: ", round((float) $avg, 1), "\n";
}
$gen->send(null);
[$count, $avg] = $gen->getReturn();
echo "Усього: $count, середнє ", round($avg, 1), "\n";
`,
  "php-fiber-basics": raw`<?php
declare(strict_types=1);

$fiber = new Fiber(function (string $name): string {
    echo "Початок $name\n";
    $got = Fiber::suspend(1);
    echo "Отримано $got\n";
    $got2 = Fiber::suspend(2);
    echo "Отримано $got2\n";
    return "$name: $got+$got2";
});

$v = $fiber->start('job');
echo "Віддано $v\n";
$v = $fiber->resume('A');
echo "Віддано $v\n";
$fiber->resume('B');
echo $fiber->getReturn(), "\n";
echo "Статус: ", $fiber->isTerminated() ? "завершено" : "триває", "\n";
`,
  "php-fiber-scheduler": raw`<?php
declare(strict_types=1);

function task(string $name, int $steps): Fiber
{
    return new Fiber(function () use ($name, $steps): void {
        for ($i = 1; $i <= $steps; $i++) {
            echo "$name:$i\n";
            Fiber::suspend();
        }
    });
}

function runAll(array $fibers): void
{
    foreach ($fibers as $f) {
        $f->start();
    }
    do {
        $alive = false;
        foreach ($fibers as $f) {
            if (!$f->isTerminated()) {
                $f->resume();
                $alive = true;
            }
        }
    } while ($alive);
}

runAll([task('A', 2), task('B', 3)]);
echo "Готово\n";
`,
  "php-gen-coroutines": raw`<?php
declare(strict_types=1);

function worker(string $name, int $n): Generator
{
    for ($i = 1; $i <= $n; $i++) {
        yield "$name$i";
    }
}

function runLoop(array $tasks): void
{
    while ($tasks) {
        $t = array_shift($tasks);
        if (!$t->valid()) {
            continue;
        }
        echo $t->current(), "\n";
        $t->next();
        if ($t->valid()) {
            $tasks[] = $t;
        }
    }
}

runLoop([worker('X', 2), worker('Y', 1)]);
echo "Кінець\n";
`,
};
