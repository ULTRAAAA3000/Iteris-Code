// Практичні завдання глави «Тестування й якість» (уроки 86–91). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_09: readonly RemoteTask[] = [
  {
    ...base, id: "php-assert-percent", lesson: "php/86", xp: 30,
    title: "Assert як страж припущень",
    context: "Функція обчислює відсоток і припускає, що ціле додатне. Це припущення програміста, і його варто записати в коді так, щоб порушення одразу було видно.",
    brief: [
      "У функції <code>percent(int $part, int $whole): int</code> додайте на початку <code>assert($whole &gt; 0, 'ціле має бути додатним')</code>. Решту (<code>intdiv($part * 100, $whole)</code>) уже написано.",
      "Програма друкує <code>percent(2, 4)</code>, потім викликає <code>percent(1, 0)</code> усередині <code>try</code> і виводить <code>Помилка: </code> та повідомлення спійманого <code>Throwable</code>. Кожен рядок завершуйте <code>\\n</code>. Очікуваний вивід: <code>50</code> і <code>Помилка: ціле має бути додатним</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function percent(int $part, int $whole): int
{
    // TODO: додайте assert($whole > 0, 'ціле має бути додатним')
    return intdiv($part * 100, $whole);
}

echo percent(2, 4), "\n";

try {
    echo percent(1, 0), "\n";
} catch (Throwable $e) {
    echo "Помилка: ", $e->getMessage(), "\n";
}
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "50\nПомилка: ціле має бути додатним", hint: "Два рядки: результат 50 і повідомлення з вашого assert." },
      { on: "stdout", name: "Повідомлення про порушення", has: "ціле має бути додатним", hint: "Передайте текст другим аргументом assert, а не власним виключенням." },
      { on: "stdout", name: "Нормальний виклик працює", has: "50", hint: "2 від 4 це 50 відсотків; assert не повинен заважати правильним даним." },
      { on: "source", name: "Використано assert", matches: "assert\\s*\\(", hint: "Запишіть припущення через конструкцію assert." },
    ],
  },
  {
    ...base, id: "php-mini-stand", lesson: "php/87", xp: 35,
    title: "Власний мінітестовий стенд",
    context: "Стенд запускає кожну перевірку окремо, не зупиняється на першому збої й друкує підсумок. Так працюють PHPUnit і Pest, але тут усе вміщається у два десятки рядків.",
    brief: [
      "Допишіть <code>assertSame($expected, $actual)</code>: якщо значення не ідентичні (<code>!==</code>), киньте <code>AssertionError</code> з текстом <code>очікували X, отримали Y</code>, де X і Y це <code>var_export($v, true)</code>.",
      "Допишіть <code>test($name, $fn)</code>: виклик у <code>try</code>, ловіть <code>Throwable</code>. Успіх друкує <code>ok   назва</code> (після <code>ok</code> три пробіли), збій друкує <code>FAIL назва: повідомлення</code>. Лічильники ведуть статичні поля класу <code>Stand</code>. Останній рядок програми вже написано. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

final class Stand
{
    public static int $passed = 0;
    public static int $failed = 0;
}

function assertSame(mixed $expected, mixed $actual): void
{
    // TODO: якщо $expected !== $actual, киньте AssertionError("очікували X, отримали Y") через var_export(..., true)
}

function test(string $name, callable $fn): void
{
    // TODO: запустіть $fn() у try; ok -> "ok   $name", збій Throwable -> "FAIL $name: повідомлення"; ведіть Stand::$passed і Stand::$failed
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
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ok   ПДВ 20% від 100\nok   нуль лишається нулем\nFAIL хибне очікування: очікували 13, отримали 12\nFAIL тип має значення: очікували '12', отримали 12\nПройдено: 2, провалено: 2", hint: "Чотири рядки тестів і підсумок; рядок '12' у var_export стоїть в апострофах, число без них." },
      { on: "stdout", name: "Збій показує обидва значення", has: "очікували 13, отримали 12", hint: "Повідомлення складіть із двох var_export(..., true)." },
      { on: "stdout", name: "Суворе порівняння відрізняє тип", has: "очікували '12', отримали 12", hint: "Порівнюйте через !==, тоді рядок і число різні." },
      { on: "stdout", name: "Підсумок лічильників", has: "Пройдено: 2, провалено: 2", hint: "Збільшуйте Stand::$passed в успіху й Stand::$failed в catch." },
    ],
  },
  {
    ...base, id: "php-assert-throws", lesson: "php/88", xp: 35,
    title: "assertThrows: перевірка виключень",
    context: "Контракт функції включає й відмови: очікуваний клас виключення, а не будь-який. Хелпер assertThrows має розрізняти три результати: збіг, чужий клас і відсутність виключення.",
    brief: [
      "Допишіть <code>assertThrows(string $class, callable $fn): Throwable</code>. Якщо <code>$fn</code> кидає об'єкт потрібного класу (перевірка <code>instanceof</code>), поверніть його. Якщо кидає інший клас, киньте <code>AssertionError</code> з текстом <code>очікували КЛАС, отримали ФАКТИЧНИЙ_КЛАС</code> (через <code>get_class</code>). Якщо нічого не кинуто, киньте <code>AssertionError</code> з текстом <code>очікували КЛАС, але виключення не було</code>.",
      "Програма вже викликає хелпер у трьох сценаріях і друкує клас або повідомлення. Очікуваний вивід: <code>DivisionByZeroError</code>, потім два повідомлення про збій. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function assertThrows(string $class, callable $fn): Throwable
{
    // TODO: спіймайте Throwable; потрібний клас повертайте, чужий і відсутність виключення обертайте в AssertionError
    $fn();
    return new Exception('заглушка');
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
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "DivisionByZeroError\nочікували InvalidArgumentException, отримали DivisionByZeroError\nочікували RuntimeException, але виключення не було", hint: "Три рядки: клас спійманого, чужий клас і випадок без виключення." },
      { on: "stdout", name: "Збіг класу повертає виняток", has: "DivisionByZeroError", hint: "Якщо $e instanceof $class, поверніть $e." },
      { on: "stdout", name: "Чужий клас", has: "отримали DivisionByZeroError", hint: "Склеїть get_class($e) у повідомлення AssertionError." },
      { on: "stdout", name: "Виключення не кинуто", has: "але виключення не було", hint: "Рядок після try: сюди виконання потрапляє, лише якщо виключення не було." },
      { on: "source", name: "Перевірка через instanceof", matches: "instanceof", hint: "Клас винятку порівнюйте через instanceof, щоб працювали й нащадки." },
    ],
  },
  {
    ...base, id: "php-table-grades", lesson: "php/89", xp: 35,
    title: "Табличні тести оцінок",
    context: "Одну функцію перевіряють багатьма парами «вхід-очікуване». Таблиця з назвами випадків дозволяє додати нову перевірку одним рядком і одразу бачити, який сценарій зламався.",
    brief: [
      "Реалізуйте <code>grade(int $score): string</code>: від 90 включно це <code>'A'</code>, від 75 це <code>'B'</code>, від 60 це <code>'C'</code>, інакше <code>'F'</code>.",
      "Таблицю випадків і цикл, що друкує <code>ok   назва</code> або <code>FAIL назва: очікували X, отримали Y</code>, уже написано. Вивід завершується підсумком <code>Пройдено: N з M</code>. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function grade(int $score): string
{
    // TODO: від 90 'A', від 75 'B', від 60 'C', інакше 'F'
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
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ok   відмінно\nok   межа A\nok   добре\nok   межа B\nok   задовільно\nok   нижче порогу\nПройдено: 6 з 6", hint: "Усі шість випадків мають пройти; увага до меж 90, 75 і 60." },
      { on: "stdout", name: "Підсумок", has: "Пройдено: 6 з 6", hint: "Підсумок з'явиться, коли жоден випадок не буде FAIL." },
      { on: "stdout", name: "Межові значення", has: "ok   межа B", hint: "75 уже належить до B, тож порівняння має бути не менше, а не строго більше." },
      { on: "stdout", name: "Жодного збою", matches: "^(?![\\s\\S]*FAIL)", hint: "Якщо бачите FAIL, перевірте порядок умов: спершу найвищий поріг." },
    ],
  },
  {
    ...base, id: "php-spy-mailer", lesson: "php/90", xp: 40,
    title: "Шпигун замість справжньої пошти",
    context: "Сервіс реєстрації надсилає лист, але в тесті реальна пошта не потрібна. Шпигун запам'ятовує виклики, і тест перевіряє, що саме й кому було б надіслано.",
    brief: [
      "Інтерфейс <code>Mailer</code> уже оголошено. У класі <code>SpyMailer</code> реалізуйте <code>send($to, $subject)</code>: додавайте пару <code>[$to, $subject]</code> до публічного масиву <code>$sent</code>. У <code>Signup::register($email)</code> викличте <code>$this-&gt;mailer-&gt;send($email, 'Вітаємо')</code>.",
      "Програма реєструє <code>a@x.com</code> і <code>b@x.com</code>, друкує кількість записаних листів, а потім по рядку <code>адреса: тема</code>. Очікуваний вивід: <code>2</code>, <code>a@x.com: Вітаємо</code>, <code>b@x.com: Вітаємо</code>. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
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
        // TODO: запишіть виклик у $this->sent
    }
}

final class Signup
{
    public function __construct(private Mailer $mailer) {}

    public function register(string $email): void
    {
        // TODO: надішліть вітальний лист з темою 'Вітаємо'
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
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "2\na@x.com: Вітаємо\nb@x.com: Вітаємо", hint: "Кількість листів, потім по рядку на кожен запис шпигуна." },
      { on: "stdout", name: "Шпигун записав два листи", has: "2", hint: "Кожен виклик send має додавати запис у $sent." },
      { on: "stdout", name: "Адресат і тема", has: "b@x.com: Вітаємо", hint: "register має передати і адресу, і тему 'Вітаємо'." },
      { on: "source", name: "Запис через масив", matches: "\\$this->sent\\[\\]|array_push", hint: "Додавайте елементи в кінець масиву $sent." },
    ],
  },
  {
    ...base, id: "php-tdd-wordcount", lesson: "php/91", xp: 45,
    title: "TDD: зробити тести зеленими",
    context: "Тести вже написані й падають: це червоний крок TDD. Ваше завдання на зелений: мінімальна реалізація, після якої всі перевірки проходять, зокрема на порожніх рядках і зайвих пробілах.",
    brief: [
      "Реалізуйте <code>wordCount(string $s): int</code>: кількість слів, розділених будь-якими пробільними символами (пробіл, табуляція). Порожній рядок і рядок із самих пробілів дають <code>0</code>. Підказка: корисні <code>trim</code> і <code>preg_split</code> з прапорцем <code>PREG_SPLIT_NO_EMPTY</code>.",
      "Мінітестовий стенд і чотири тести вже є. Вивід: рядок <code>ok   назва</code> для кожного пройденого тесту або <code>FAIL назва</code> для проваленого, а в кінці <code>Усього збоїв: N</code>. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function wordCount(string $s): int
{
    // TODO: порахуйте слова, розділені пробільними символами
    return 0;
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
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ok   два слова\nok   порожній рядок\nok   зайві пробіли\nok   кирилиця\nУсього збоїв: 0", hint: "Усі чотири тести мають бути зеленими, а збоїв нуль." },
      { on: "stdout", name: "Без збоїв", has: "Усього збоїв: 0", hint: "Перевірте порожній рядок і рядок із зайвими пробілами та табуляцією." },
      { on: "stdout", name: "Зайві пробіли враховано", has: "ok   зайві пробіли", hint: "Розділяйте за \\s+ і відкидайте порожні елементи." },
      { on: "source", name: "Функція wordCount реалізована", matches: "function\\s+wordCount", hint: "Лишайте функцію з назвою wordCount, її викликають тести." },
    ],
  },
];
