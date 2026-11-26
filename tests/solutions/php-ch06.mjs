const raw = String.raw;

export const SOLUTIONS_06 = {
  "php-error-handler": raw`<?php
set_error_handler(function (int $no, string $msg): bool {
    $label = match ($no) {
        E_WARNING => "Попередження",
        E_USER_NOTICE => "Сповіщення",
        default => "Інше",
    };
    echo "$label: $msg\n";
    return true;
});

$data = ["a" => 1];
$x = $data["b"];
trigger_error("власне", E_USER_NOTICE);
echo "кінець\n";
`,
  "php-try-catch-parse": raw`<?php
function parsePositive(string $s): int
{
    if (!is_numeric($s)) {
        throw new InvalidArgumentException("не число: $s");
    }
    if ((int) $s <= 0) {
        throw new RangeException("не додатнє: $s");
    }
    return (int) $s;
}

foreach (["5", "abc", "-2", "12"] as $s) {
    try {
        echo "ok: " . parsePositive($s) . "\n";
    } catch (InvalidArgumentException | RangeException $e) {
        echo "помилка: " . $e->getMessage() . "\n";
    }
}
`,
  "php-throwable-catch": raw`<?php
declare(strict_types=1);

function risky(int $case): string
{
    return match ($case) {
        0 => throw new RuntimeException("збій"),
        1 => (string) intdiv(5, 0),
        2 => (fn(int $x): string => "x=$x")("abc"),
        default => "ок",
    };
}

foreach ([0, 1, 2, 3] as $case) {
    try {
        echo $case . ": " . risky($case) . "\n";
    } catch (Throwable $e) {
        echo $case . ": " . get_class($e) . "\n";
    }
}
`,
  "php-finally-cleanup": raw`<?php
function run(bool $fail): void
{
    echo "відкрито\n";
    try {
        if ($fail) {
            throw new RuntimeException("збій");
        }
        echo "робота\n";
    } catch (RuntimeException $e) {
        echo "помилка: " . $e->getMessage() . "\n";
    } finally {
        echo "закрито\n";
    }
}

run(false);
echo "--\n";
run(true);
`,
  "php-custom-exception": raw`<?php
class InsufficientFundsException extends Exception
{
    public function __construct(public readonly int $balance, public readonly int $needed)
    {
        parent::__construct("Не вистачає " . ($needed - $balance));
    }
}

class PaymentException extends Exception {}

function pay(int $balance, int $amount): int
{
    if ($amount > $balance) {
        throw new InsufficientFundsException($balance, $amount);
    }
    return $balance - $amount;
}

try {
    try {
        pay(100, 150);
    } catch (InsufficientFundsException $e) {
        throw new PaymentException("платіж відхилено", 0, $e);
    }
} catch (PaymentException $e) {
    $cause = $e->getPrevious();
    echo $cause->getMessage() . "\n";
    echo get_class($e) . ": " . $e->getMessage() . "\n";
    echo "причина: " . get_class($cause) . "\n";
}
`,
  "php-validate-input": raw`<?php
declare(strict_types=1);

function parseQty(string $raw): int
{
    $n = filter_var($raw, FILTER_VALIDATE_INT);
    if ($n === false) {
        throw new InvalidArgumentException("не ціле: $raw");
    }
    if ($n < 1 || $n > 10) {
        throw new ValueError("поза діапазоном: $n");
    }
    return $n;
}

foreach (["3", "x", "50", "10"] as $raw) {
    try {
        echo "ok: " . parseQty($raw) . "\n";
    } catch (InvalidArgumentException | ValueError $e) {
        echo get_class($e) . ": " . $e->getMessage() . "\n";
    }
}
`,
  "php-assert-contract": raw`<?php
function average(array $nums): int
{
    assert(count($nums) > 0, "список порожній");
    return intdiv(array_sum($nums), count($nums));
}

echo "середнє: " . average([2, 4, 6]) . "\n";
try {
    average([]);
} catch (AssertionError $e) {
    echo "контракт порушено: " . $e->getMessage() . "\n";
}
`,
};
