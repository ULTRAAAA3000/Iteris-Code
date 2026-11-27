// Практичні завдання глави «Стандартна бібліотека», частина 08a (уроки 74–79). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_08a: readonly RemoteTask[] = [
  {
    ...base, id: "php-strings-slug", lesson: "php/74", xp: 30,
    title: "Рядки: slug, оклик і паліндром",
    context: "Із заголовка статті роблять адресу сторінки: прибрати зайві пропуски, перейти на малі літери, замінити пропуски дефісом. Тут же потрібні функції для вигуку й перевірки паліндрома.",
    brief: [
      "Допишіть <code>slugify($title)</code>: <code>trim</code>, <code>strtolower</code> і заміна будь-якої кількості пропусків на один <code>-</code> через <code>preg_replace('/\\s+/', '-', ...)</code>.",
      "Допишіть <code>shout($s)</code>: великі літери через <code>strtoupper</code> і знак оклику в кінці. Допишіть <code>isPalindrome($s)</code>: порівняйте рядок з його <code>strrev</code> без урахування регістру. Програма друкує чотири рядки, кожен завершується <code>\\n</code>: slug, оклик, <code>true</code> або <code>false</code> для <code>Level</code>, і те саме для <code>PHP8</code>.",
    ],
    starter: raw`<?php
function slugify(string $title): string
{
    // TODO: trim, strtolower, preg_replace('/\s+/', '-', ...)
    return $title;
}

function shout(string $s): string
{
    // TODO: великі літери й знак оклику в кінці
    return $s;
}

function isPalindrome(string $s): bool
{
    // TODO: порівняти з strrev без урахування регістру
    return false;
}

echo slugify("  Hello   World From PHP "), "\n";
echo shout("php"), "\n";
echo var_export(isPalindrome("Level"), true), "\n";
echo var_export(isPalindrome("PHP8"), true), "\n";
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "hello-world-from-php\nPHP!\ntrue\nfalse", hint: "Чотири рядки: slug, оклик, потім два результати паліндрома." },
      { on: "stdout", name: "slugify: пропуски стали дефісами", has: "hello-world-from-php", hint: "Спершу обріжте краї, потім малі літери, потім замініть групи пропусків одним дефісом." },
      { on: "stdout", name: "shout дає великі літери й оклик", has: "PHP!", hint: "Результат strtoupper доповніть знаком оклику через крапку." },
      { on: "stdout", name: "Level паліндром, PHP8 ні", has: "true\nfalse", hint: "Перед порівнянням із strrev приведіть рядок до одного регістру." },
      { on: "source", name: "Використано preg_replace", has: "preg_replace(", hint: "Замінити групу пропусків можна функцією preg_replace." },
    ],
  },
  {
    ...base, id: "php-mb-preview", lesson: "php/75", xp: 30,
    title: "Прев'ю заголовка з багатокрапкою",
    context: "Довгі заголовки на сторінці обрізають до ліміту символів. Рахувати треба літери, а не байти, інакше українські слова вийдуть зламаними.",
    brief: [
      "Допишіть <code>preview(string $text, int $limit): string</code>. Якщо довжина тексту в <b>символах</b> не перевищує <code>$limit</code>, поверніть текст як є. Інакше поверніть перші <code>$limit - 1</code> символів і додайте <code>…</code>, тож загалом буде рівно <code>$limit</code> символів.",
      "Допишіть <code>capitalize(string $s)</code>: перша літера велика, решта без змін. Програма друкує три рядки: прев'ю заголовка «Київ у листопаді: що зміниться» з лімітом 12, прев'ю «Львів» з лімітом 12 і <code>capitalize(\"україна\")</code>. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function preview(string $text, int $limit): string
{
    // TODO: порівняйте mb_strlen з лімітом, обріжте через mb_substr
    return $text;
}

function capitalize(string $s): string
{
    // TODO: mb_strtoupper першої літери + решта через mb_substr
    return $s;
}

echo preview("Київ у листопаді: що зміниться", 12), "\n";
echo preview("Львів", 12), "\n";
echo capitalize("україна"), "\n";
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "Київ у лист…\nЛьвів\nУкраїна", hint: "Перший рядок має рівно 12 символів разом із трьома крапками-знаком." },
      { on: "stdout", name: "Довгий заголовок обрізано по літерах", has: "Київ у лист…", hint: "Візьміть limit - 1 символів функцією mb_substr і додайте знак «…»." },
      { on: "stdout", name: "Перша літера велика", has: "Україна", hint: "Велика літера: mb_strtoupper від першого символа, далі решта рядка." },
      { on: "source", name: "Використано mb_ функції", has: "mb_substr(", hint: "Для кирилиці беріть mb_substr, бо substr рахує байти." },
    ],
  },
  {
    ...base, id: "php-json-roundtrip", lesson: "php/76", xp: 30,
    title: "JSON туди й назад",
    context: "Сервіси обмінюються даними через JSON. Тут потрібно прочитати рядок, змінити дані й записати назад, не втративши кирилицю та не пропустивши помилку.",
    brief: [
      "Рядок <code>$json</code> містить користувача з іменем, віком і списком ролей. Розберіть його через <code>json_decode</code> із масивами та <code>JSON_THROW_ON_ERROR</code>, додайте роль <code>\"admin\"</code> у кінець списку й збільште вік на 1.",
      "Виведіть дві речі. Перший рядок: <code>json_encode</code> зміненого масиву з прапорцями <code>JSON_UNESCAPED_UNICODE</code> і <code>JSON_THROW_ON_ERROR</code>. Другий рядок: <code>error</code>, якщо розбір зламаного рядка <code>{\"a\": }</code> кинув <code>JsonException</code>, або <code>ok</code>, якщо ні. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
$json = '{"name":"Оксана","age":29,"roles":["editor"]}';

// TODO: json_decode($json, true, 512, JSON_THROW_ON_ERROR)
$data = [];

// TODO: додайте роль "admin" і збільште age на 1

// TODO: json_encode з JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
echo "", "\n";

try {
    json_decode('{"a": }', true, 512, JSON_THROW_ON_ERROR);
    echo "ok\n";
} catch (Exception $e) {
    // TODO: друкуйте error
    echo "ok\n";
}
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "{\"name\":\"Оксана\",\"age\":30,\"roles\":[\"editor\",\"admin\"]}\nerror", hint: "Перший рядок це JSON зі зміненими полями, другий слово error." },
      { on: "stdout", name: "Кирилиця не екранована", has: "Оксана", hint: "Додайте прапорець JSON_UNESCAPED_UNICODE до json_encode." },
      { on: "stdout", name: "Вік і ролі оновлено", has: "\"age\":30,\"roles\":[\"editor\",\"admin\"]", hint: "Додайте елемент у масив roles і збільште age." },
      { on: "stdout", name: "Помилку розбору перехоплено", has: "error", hint: "У блоці catch надрукуйте слово error." },
      { on: "source", name: "Прапорець винятку", has: "JSON_THROW_ON_ERROR", hint: "Передайте JSON_THROW_ON_ERROR у json_decode й json_encode." },
    ],
  },
  {
    ...base, id: "php-regex-logline", lesson: "php/77", xp: 35,
    title: "Розбір рядка логу",
    context: "Рядки журналу мають сталий формат, і з них потрібно дістати дату, рівень і повідомлення. Іменовані групи регулярного виразу роблять код читабельним.",
    brief: [
      "Допишіть <code>parseLine(string $line): ?array</code>: за допомогою <code>preg_match</code> з іменованими групами <code>date</code> (формат <code>РРРР-ММ-ДД</code>), <code>level</code> (великі латинські літери) і <code>msg</code> (решта рядка) поверніть масив із трьох полів, а якщо рядок не підходить, поверніть <code>null</code>.",
      "Програма розбирає три рядки і друкує для кожного <code>level: msg</code>, або слово <code>skip</code>, якщо розбір не вдався. Кожен рядок виводу завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
function parseLine(string $line): ?array
{
    // TODO: preg_match з іменованими групами date, level, msg; null, якщо збігу немає
    return null;
}

$lines = [
    "2025-01-15 ERROR Disk is full",
    "broken line without format",
    "2025-01-16 INFO Backup done",
];

foreach ($lines as $line) {
    $r = parseLine($line);
    echo $r === null ? "skip" : $r["level"] . ": " . $r["msg"], "\n";
}
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "ERROR: Disk is full\nskip\nINFO: Backup done", hint: "Правильні рядки дають «рівень: повідомлення», зламаний дає skip." },
      { on: "stdout", name: "Перший рядок розібрано", has: "ERROR: Disk is full", hint: "Шаблон: дата, пропуск, великі літери, пропуск, решта рядка." },
      { on: "stdout", name: "Зламаний рядок пропущено", has: "skip", hint: "Якщо preg_match не дав 1, поверніть null." },
      { on: "source", name: "Іменовані групи", matches: "\\(\\?<\\w+>", hint: "Іменована група записується як (?<назва>...)." },
    ],
  },
  {
    ...base, id: "php-regex-mask", lesson: "php/78", xp: 35,
    title: "Маска номерів і нормалізація тексту",
    context: "У логах не можна зберігати повні номери карток, а введений текст часто містить зайві пропуски. Заміна за шаблоном вирішує обидві задачі одним викликом.",
    brief: [
      "Допишіть <code>maskCard(string $s)</code>: у рядку знайдіть кожну групу з 16 цифр (можливо, розділену пропусками по чотири) і залиште видимими лише останні чотири цифри, а решту замініть на <code>****</code>. Для цього підійде <code>preg_replace_callback</code>.",
      "Допишіть <code>squash(string $s)</code>: обріжте краї й замініть будь-яку кількість пропусків підряд на один пропуск. Програма друкує два рядки: <code>maskCard(\"Картка 4111 1111 1111 1234 оплачена\")</code> і <code>squash(\"  багато   зайвих    пропусків \")</code>. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
function maskCard(string $s): string
{
    // TODO: preg_replace_callback('/\b(?:\d{4}\s?){3}(\d{4})\b/', ..., $s)
    return $s;
}

function squash(string $s): string
{
    // TODO: trim і preg_replace для пропусків
    return $s;
}

echo maskCard("Картка 4111 1111 1111 1234 оплачена"), "\n";
echo squash("  багато   зайвих    пропусків "), "\n";
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "Картка **** 1234 оплачена\nбагато зайвих пропусків", hint: "Номер замінюється на «**** » і останні чотири цифри." },
      { on: "stdout", name: "Номер картки замасковано", has: "Картка **** 1234 оплачена", hint: "У функції заміни візьміть із групи 1 останні чотири цифри." },
      { on: "stdout", name: "Пропуски стиснуто", has: "багато зайвих пропусків", hint: "Спершу trim, потім заміна груп пропусків одним пропуском." },
      { on: "source", name: "Заміна через функцію", has: "preg_replace_callback(", hint: "Для підстановки, що залежить від збігу, використайте preg_replace_callback." },
    ],
  },
  {
    ...base, id: "php-date-deadline", lesson: "php/79", xp: 35,
    title: "Дедлайн і залишок днів",
    context: "Для підписки потрібно знайти дату завершення й порахувати, скільки днів лишилось. Усі дати задано явно, а клас DateTimeImmutable не змінює початкові значення.",
    brief: [
      "Допишіть <code>deadline(DateTimeImmutable $start, int $days): DateTimeImmutable</code>, що повертає дату через <code>$days</code> днів від старту, і <code>daysLeft(DateTimeImmutable $now, DateTimeImmutable $end): int</code>, що повертає кількість повних днів між ними через <code>diff</code>.",
      "Програма друкує три рядки: дату завершення у форматі <code>d.m.Y</code>, залишок днів і початкову дату у форматі <code>Y-m-d</code>, щоб показати, що вона не змінилась. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
function deadline(DateTimeImmutable $start, int $days): DateTimeImmutable
{
    // TODO: додайте інтервал P{$days}D через add
    return $start;
}

function daysLeft(DateTimeImmutable $now, DateTimeImmutable $end): int
{
    // TODO: використайте diff і поле days
    return 0;
}

$utc = new DateTimeZone('UTC');
$start = new DateTimeImmutable('2025-01-15 10:00:00', $utc);
$now = new DateTimeImmutable('2025-02-01 09:00:00', $utc);

$end = deadline($start, 30);
echo $end->format('d.m.Y'), "\n";
echo daysLeft($now, $end), "\n";
echo $start->format('Y-m-d'), "\n";
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "14.02.2025\n13\n2025-01-15", hint: "Три рядки: дата завершення, залишок днів, початкова дата." },
      { on: "stdout", name: "Дедлайн через 30 днів", has: "14.02.2025", hint: "Інтервал у ISO-записі для 30 днів це P30D." },
      { on: "stdout", name: "Залишок повних днів", has: "13", hint: "Беріть поле days з результату diff." },
      { on: "stdout", name: "Початкова дата не змінилась", has: "2025-01-15", hint: "DateTimeImmutable повертає новий об'єкт, тож початковий лишається." },
      { on: "source", name: "Використано DateInterval", has: "DateInterval", hint: "Додавання днів робить add із DateInterval." },
    ],
  },
];
