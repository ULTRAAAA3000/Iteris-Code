// Практичні завдання глави «Помилки» (уроки 52–58). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_06: readonly RemoteTask[] = [
  {
    ...base, id: "php-error-handler", lesson: "php/52", xp: 25,
    title: "Свій обробник повідомлень",
    context: "Програма читає неіснуючий ключ і видає власне сповіщення. Замість стандартного виводу потрібен обробник, який друкує повідомлення українською з позначкою рівня.",
    brief: [
      "Зареєструйте через <code>set_error_handler</code> функцію з параметрами <code>$no</code> і <code>$msg</code>. Для <code>E_WARNING</code> вона друкує <code>Попередження: </code> і текст, для <code>E_USER_NOTICE</code> друкує <code>Сповіщення: </code> і текст (використайте <code>match</code>), кожен рядок завершується <code>\n</code>. Обробник повертає <code>true</code>.",
      "Далі код читає <code>$data['b']</code> (ключа немає) і викликає <code>trigger_error('власне', E_USER_NOTICE)</code>, а наприкінці друкує <code>кінець</code>. Очікуваний вивід: <code>Попередження: Undefined array key \"b\"</code>, <code>Сповіщення: власне</code>, <code>кінець</code>.",
    ],
    starter: raw`<?php
// TODO: set_error_handler(...) з match по $no; повертайте true

$data = ["a" => 1];
$x = $data["b"];
trigger_error("власне", E_USER_NOTICE);
echo "кінець\n";
`,
    checks: [
      { on: "stdout", name: "Попередження перехоплено", has: "Попередження: Undefined array key", hint: "E_WARNING у match має давати мітку «Попередження», далі двокрапка з пробілом і $msg." },
      { on: "stdout", name: "Власне сповіщення", has: "Сповіщення: власне", hint: "trigger_error з E_USER_NOTICE приходить в обробник з рівнем E_USER_NOTICE." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Попередження: Undefined array key \"b\"\nСповіщення: власне\nкінець", hint: "Три рядки: попередження, сповіщення, «кінець»." },
      { on: "source", name: "Використано set_error_handler", has: "set_error_handler", hint: "Обробник реєструють функцією set_error_handler." },
    ],
  },
  {
    ...base, id: "php-try-catch-parse", lesson: "php/53", xp: 30,
    title: "Розбір чисел із помилками",
    context: "Функція перетворює рядок на додатне число. На некоректний ввід вона кидає виключення, а цикл перехоплює їх і друкує звіт по кожному елементу.",
    brief: [
      "У функції <code>parsePositive(string $s): int</code> кидайте <code>InvalidArgumentException</code> із текстом <code>не число: </code> і значенням, якщо <code>is_numeric</code> дає false, та <code>RangeException</code> із текстом <code>не додатнє: </code> і значенням, якщо число не більше нуля.",
      "Для кожного елемента <code>[\"5\", \"abc\", \"-2\", \"12\"]</code> у <code>try</code> виведіть <code>ok: число</code>, а в <code>catch</code> виведіть <code>помилка: </code> і повідомлення. Кожен рядок завершуйте <code>\n</code>.",
    ],
    starter: raw`<?php
function parsePositive(string $s): int
{
    // TODO: кидайте InvalidArgumentException і RangeException
    return (int) $s;
}

foreach (["5", "abc", "-2", "12"] as $s) {
    // TODO: try / catch
    echo "ok: " . parsePositive($s) . "\n";
}
`,
    checks: [
      { on: "stdout", name: "Не число", has: "помилка: не число: abc", hint: "is_numeric(\"abc\") це false: киньте InvalidArgumentException із текстом «не число: » і значенням." },
      { on: "stdout", name: "Не додатнє", has: "помилка: не додатнє: -2", hint: "Після перевірки на число порівняйте (int) $s з нулем і киньте RangeException." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ok: 5\nпомилка: не число: abc\nпомилка: не додатнє: -2\nok: 12", hint: "Чотири рядки, по одному на кожен елемент, у порядку масиву." },
      { on: "source", name: "Є блок catch", matches: "catch\\s*\\(", hint: "Виключення мають перехоплюватись блоком catch у циклі." },
    ],
  },
  {
    ...base, id: "php-throwable-catch", lesson: "php/54", xp: 30,
    title: "Хто кинув: Exception чи Error",
    context: "Функція за номером випадку кидає виключення різних гілок ієрархії. Потрібно перехопити кожне й надрукувати назву його класу, не загубивши жодного.",
    brief: [
      "Функція <code>risky(int $case): string</code> уже написана: випадки 0, 1, 2 кидають <code>RuntimeException</code>, <code>DivisionByZeroError</code> і <code>TypeError</code>, а випадок 3 повертає <code>ок</code>. Для кожного <code>$case</code> від 0 до 3 у <code>try</code> викличте її, а в <code>catch (Throwable $e)</code> виведіть рядок <code>номер: назва класу</code> (через <code>get_class</code>).",
      "Успішний випадок виводить <code>3: ок</code>. Очікуваний вивід: <code>0: RuntimeException</code>, <code>1: DivisionByZeroError</code>, <code>2: TypeError</code>, <code>3: ок</code>, кожен рядок завершується <code>\n</code>.",
    ],
    starter: raw`<?php
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
    // TODO: try { ... } catch (Throwable $e) { ... }
    echo $case . ": TODO\n";
}
`,
    checks: [
      { on: "stdout", name: "Виключення гілки Exception", has: "0: RuntimeException", hint: "Виведіть $case, двокрапку й get_class($e) у блоці catch." },
      { on: "stdout", name: "Помилки гілки Error", has: "1: DivisionByZeroError", hint: "Catch (Exception) цього не спіймає: потрібен Throwable." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "0: RuntimeException\n1: DivisionByZeroError\n2: TypeError\n3: ок", hint: "Для випадку 3 у try виводьте результат risky." },
      { on: "source", name: "Ловимо Throwable", matches: "catch\\s*\\(\\s*Throwable", hint: "Спільний тип обох гілок це Throwable." },
    ],
  },
  {
    ...base, id: "php-finally-cleanup", lesson: "php/55", xp: 30,
    title: "Завжди закрити ресурс",
    context: "Функція «відкриває» ресурс, працює й мусить його закрити за будь-якого результату. Блок finally гарантує прибирання і після успіху, і після перехопленої помилки.",
    brief: [
      "У функції <code>run(bool $fail)</code> спочатку друкується <code>відкрито</code>. У <code>try</code> при <code>$fail</code> кидається <code>RuntimeException(\"збій\")</code>, інакше друкується <code>робота</code>. У <code>catch</code> друкується <code>помилка: збій</code> (через <code>getMessage</code>). У <code>finally</code> друкується <code>закрито</code>.",
      "Викличте <code>run(false)</code>, потім надрукуйте <code>--</code>, потім <code>run(true)</code>. Кожен рядок завершуйте <code>\n</code>. Очікуваний вивід: <code>відкрито</code>, <code>робота</code>, <code>закрито</code>, <code>--</code>, <code>відкрито</code>, <code>помилка: збій</code>, <code>закрито</code>.",
    ],
    starter: raw`<?php
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
    }
    // TODO: finally з рядком «закрито»
}

run(false);
echo "--\n";
run(true);
`,
    checks: [
      { on: "stdout", name: "Закрито після помилки", matches: "помилка: збій\\nзакрито", hint: "Після блока catch має йти ще один рядок із finally." },
      { on: "stdout", name: "Закрито й після успіху", matches: "робота\\nзакрито", hint: "finally виконується і тоді, коли виключення не було." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "відкрито\nробота\nзакрито\n--\nвідкрито\nпомилка: збій\nзакрито", hint: "Сім рядків: два прогони, між ними «--»." },
      { on: "source", name: "Є блок finally", matches: "finally\\s*\\{", hint: "Прибирання має бути у блоці finally." },
    ],
  },
  {
    ...base, id: "php-custom-exception", lesson: "php/56", xp: 35,
    title: "Власне виключення з причиною",
    context: "Банківська операція кидає власне виключення з даними про нестачу коштів. Верхній рівень загортає його у загальніше виключення, зберігаючи причину в ланцюжку previous.",
    brief: [
      "Клас <code>InsufficientFundsException extends Exception</code> має конструктор <code>(int $balance, int $needed)</code>, що викликає <code>parent::__construct</code> з повідомленням <code>Не вистачає </code> і різницею <code>$needed - $balance</code>. Клас <code>PaymentException extends Exception</code> порожній.",
      "Функція <code>pay(int $balance, int $amount)</code> кидає перше виключення, якщо коштів бракує. Викличте <code>pay(100, 150)</code> у <code>try</code>; у <code>catch</code> перехопіть <code>InsufficientFundsException</code> і киньте <code>PaymentException(\"платіж відхилено\", 0, $e)</code>. Зовнішній <code>catch</code> друкує три рядки: <code>Не вистачає 50</code> (повідомлення причини), <code>PaymentException: платіж відхилено</code> і <code>причина: InsufficientFundsException</code>.",
    ],
    starter: raw`<?php
// TODO: class InsufficientFundsException extends Exception
// TODO: class PaymentException extends Exception

function pay(int $balance, int $amount): int
{
    // TODO: кидайте InsufficientFundsException, якщо $amount більше за $balance
    return $balance - $amount;
}

echo "TODO\n";
`,
    checks: [
      { on: "stdout", name: "Повідомлення з різницею", has: "Не вистачає 50", hint: "Різниця $needed - $balance для 150 і 100 дорівнює 50." },
      { on: "stdout", name: "Зовнішнє виключення", has: "PaymentException: платіж відхилено", hint: "Друкуйте get_class($e), двокрапку з пробілом і getMessage()." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Не вистачає 50\nPaymentException: платіж відхилено\nпричина: InsufficientFundsException", hint: "Причину беріть із getPrevious() зовнішнього виключення." },
      { on: "source", name: "Передано previous", has: "getPrevious", hint: "Щоб прочитати причину, викличте getPrevious() у зовнішньому catch." },
    ],
  },
  {
    ...base, id: "php-validate-input", lesson: "php/57", xp: 40,
    title: "Валідація кількості товару",
    context: "Кількість приходить рядком із форми. Її треба перевірити: це має бути ціле в межах від 1 до 10, і кожен тип помилки кидається окремим виключенням.",
    brief: [
      "У функції <code>parseQty(string $raw): int</code> отримайте число через <code>filter_var($raw, FILTER_VALIDATE_INT)</code>. Якщо результат <code>false</code> (порівнюйте строго), киньте <code>InvalidArgumentException</code> із текстом <code>не ціле: </code> і значенням. Якщо число менше 1 або більше 10, киньте <code>ValueError</code> із текстом <code>поза діапазоном: </code> і числом.",
      "Для елементів <code>[\"3\", \"x\", \"50\", \"10\"]</code> у <code>try</code> виведіть <code>ok: число</code>, а в <code>catch</code> виведіть <code>назва класу: повідомлення</code>. Кожен рядок завершуйте <code>\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function parseQty(string $raw): int
{
    // TODO: filter_var, InvalidArgumentException і ValueError
    return (int) $raw;
}

foreach (["3", "x", "50", "10"] as $raw) {
    // TODO: try / catch (InvalidArgumentException | ValueError $e)
    echo "ok: " . parseQty($raw) . "\n";
}
`,
    checks: [
      { on: "stdout", name: "Не ціле", has: "InvalidArgumentException: не ціле: x", hint: "filter_var для «x» дає false: порівняйте через === false." },
      { on: "stdout", name: "Поза діапазоном", has: "ValueError: поза діапазоном: 50", hint: "Ціле, але більше за 10: киньте ValueError із числом у повідомленні." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "ok: 3\nInvalidArgumentException: не ціле: x\nValueError: поза діапазоном: 50\nok: 10", hint: "Чотири рядки у порядку елементів; межа 10 ще допустима." },
      { on: "source", name: "Використано filter_var", has: "filter_var", hint: "Розбирайте рядок функцією filter_var з FILTER_VALIDATE_INT." },
    ],
  },
  {
    ...base, id: "php-assert-contract", lesson: "php/58", xp: 40,
    title: "Контракт середнього",
    context: "Функція рахує ціле середнє списку й має передумову: список не порожній. Порушення передумови виявляє assert, а зовнішній код перехоплює AssertionError і друкує повідомлення.",
    brief: [
      "У функції <code>average(array $nums): int</code> першим рядком напишіть <code>assert(count($nums) &gt; 0, \"список порожній\")</code>, далі поверніть <code>intdiv(array_sum($nums), count($nums))</code>.",
      "Виведіть <code>середнє: 4</code> для <code>[2, 4, 6]</code>. Потім у <code>try</code> викличте <code>average([])</code>, а в <code>catch (AssertionError $e)</code> виведіть <code>контракт порушено: </code> і повідомлення. Кожен рядок завершуйте <code>\n</code>. Перевірки <code>assert</code> у пісочниці ввімкнені.",
    ],
    starter: raw`<?php
function average(array $nums): int
{
    // TODO: передумова через assert
    return intdiv(array_sum($nums), count($nums));
}

echo "середнє: " . average([2, 4, 6]) . "\n";
// TODO: try { average([]) } catch (AssertionError $e) { ... }
`,
    checks: [
      { on: "stdout", name: "Звичайний виклик", has: "середнє: 4", hint: "Сума 12, елементів 3." },
      { on: "stdout", name: "Контракт порушено", has: "контракт порушено: список порожній", hint: "Повідомлення AssertionError це другий аргумент assert." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "середнє: 4\nконтракт порушено: список порожній", hint: "Два рядки: звичайний результат і повідомлення про порушення." },
      { on: "source", name: "Використано assert", matches: "assert\\s*\\(", hint: "Передумову виразіть викликом assert()." },
    ],
  },
];
