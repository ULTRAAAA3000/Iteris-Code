const raw = String.raw;

export const SOLUTIONS_09 = {
  "php-assert-percent": raw`<?php
declare(strict_types=1);

function percent(int $part, int $whole): int
{
    assert($whole > 0, 'ціле має бути додатним');
    return intdiv($part * 100, $whole);
}

echo percent(2, 4), "\n";

try {
    echo percent(1, 0), "\n";
} catch (Throwable $e) {
    echo "Помилка: ", $e->getMessage(), "\n";
}
`,
  "php-mini-stand": raw`<?php
declare(strict_types=1);

final class Stand
{
    public static int $passed = 0;
    public static int $failed = 0;
}

function assertSame(mixed $expected, mixed $actual): void
{
    if ($expected !== $actual) {
        throw new AssertionError('очікували ' . var_export($expected, true) . ', отримали ' . var_export($actual, true));
    }
}

function test(string $name, callable $fn): void
{
    try {
        $fn();
        Stand::$passed++;
        echo "ok   $name\n";
    } catch (Throwable $e) {
        Stand::$failed++;
        echo "FAIL $name: ", $e->getMessage(), "\n";
    }
}

function withVat(int $net): int
{
    return $net + intdiv($net * 20, 100);
}

test('ПДВ 20% від 100', fn() => assertSame(120, withVat(100)));
test('нуль лишається нулем', fn() => assertSame(0, withVat(0)));
test('хибне очікування', fn() => assertSame(13, withVat(10)));
test('тип має значення', fn() => assertSame('12', withVat(10)));

echo "Пройдено: ", Stand::$passed, ", провалено: ", Stand::$failed, "\n";
`,
  "php-assert-throws": raw`<?php
declare(strict_types=1);

function assertThrows(string $class, callable $fn): Throwable
{
    try {
        $fn();
    } catch (Throwable $e) {
        if ($e instanceof $class) {
            return $e;
        }
        throw new AssertionError("очікували $class, отримали " . get_class($e));
    }
    throw new AssertionError("очікували $class, але виключення не було");
}

echo get_class(assertThrows(DivisionByZeroError::class, fn() => intdiv(1, 0))), "\n";

try {
    assertThrows(InvalidArgumentException::class, fn() => intdiv(1, 0));
} catch (AssertionError $e) {
    echo $e->getMessage(), "\n";
}

try {
    assertThrows(RuntimeException::class, fn() => 1 + 1);
} catch (AssertionError $e) {
    echo $e->getMessage(), "\n";
}
`,
  "php-table-grades": raw`<?php
declare(strict_types=1);

function grade(int $score): string
{
    if ($score >= 90) {
        return 'A';
    }
    if ($score >= 75) {
        return 'B';
    }
    if ($score >= 60) {
        return 'C';
    }
    return 'F';
}

$cases = [
    'відмінно'        => [95, 'A'],
    'межа A'          => [90, 'A'],
    'добре'           => [80, 'B'],
    'межа B'          => [75, 'B'],
    'задовільно'      => [60, 'C'],
    'нижче порогу'    => [59, 'F'],
];

$passed = 0;
foreach ($cases as $name => [$score, $expected]) {
    $actual = grade($score);
    if ($actual === $expected) {
        $passed++;
        echo "ok   $name\n";
    } else {
        echo "FAIL $name: очікували $expected, отримали $actual\n";
    }
}
echo "Пройдено: $passed з ", count($cases), "\n";
`,
  "php-spy-mailer": raw`<?php
declare(strict_types=1);

interface Mailer
{
    public function send(string $to, string $subject): void;
}

final class SpyMailer implements Mailer
{
    public array $sent = [];

    public function send(string $to, string $subject): void
    {
        $this->sent[] = [$to, $subject];
    }
}

final class Signup
{
    public function __construct(private Mailer $mailer) {}

    public function register(string $email): void
    {
        $this->mailer->send($email, 'Вітаємо');
    }
}

$spy = new SpyMailer();
$signup = new Signup($spy);
$signup->register('a@x.com');
$signup->register('b@x.com');

echo count($spy->sent), "\n";
foreach ($spy->sent as [$to, $subject]) {
    echo "$to: $subject\n";
}
`,
  "php-tdd-wordcount": raw`<?php
declare(strict_types=1);

function wordCount(string $s): int
{
    $parts = preg_split('/\s+/u', trim($s), -1, PREG_SPLIT_NO_EMPTY);
    return count($parts);
}

$failed = 0;
function check(string $name, bool $ok): void
{
    global $failed;
    if ($ok) {
        echo "ok   $name\n";
    } else {
        $failed++;
        echo "FAIL $name\n";
    }
}

check('два слова', wordCount('hello world') === 2);
check('порожній рядок', wordCount('') === 0);
check('зайві пробіли', wordCount("  a   b \t c  ") === 3);
check('кирилиця', wordCount('один') === 1);

echo "Усього збоїв: $failed\n";
`,
};
