// Практичні завдання глави «Стандартна бібліотека», частина 08b (уроки 80–85). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_08b: readonly RemoteTask[] = [
  {
    ...base, id: "php-numbers-money", lesson: "php/80", xp: 35,
    title: "Гроші в копійках і розподіл рахунку",
    context: "Гроші зберігають цілими копійками, щоб не мати справи з похибками дробових чисел. Гривні й копійки з'являються лише під час друку, а залишок при діленні треба кудись подіти.",
    brief: [
      "Допишіть <code>formatMoney(int $cents): string</code>: гривні це <code>intdiv($cents, 100)</code>, копійки це остача від ділення, доповнена нулем зліва до двох цифр (<code>str_pad</code>). Результат виглядає як <code>1999.00</code> чи <code>0.05</code>.",
      "Допишіть <code>splitBill(int $cents, int $people): array</code>, що повертає пару <code>[частка кожного, залишок]</code>. Програма друкує три рядки, кожен завершується <code>\\n</code>: <code>formatMoney(199900)</code>, <code>formatMoney(5)</code> і частку та залишок розподілу 1000 копійок на трьох, через пропуск.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function formatMoney(int $cents): string
{
    // TODO: intdiv для гривень, % для копійок, str_pad до двох цифр
    return (string) $cents;
}

function splitBill(int $cents, int $people): array
{
    // TODO: [частка кожного, залишок]
    return [0, 0];
}

echo formatMoney(199900), "\n";
echo formatMoney(5), "\n";
[$share, $rest] = splitBill(1000, 3);
echo $share, " ", $rest, "\n";
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "1999.00\n0.05\n333 1", hint: "Три рядки: дві суми й пара «частка залишок»." },
      { on: "stdout", name: "Копійки мають два знаки", has: "0.05", hint: "Остачу 5 треба доповнити нулем зліва: str_pad з STR_PAD_LEFT." },
      { on: "stdout", name: "Розподіл із залишком", has: "333 1", hint: "Частка це цілочисельне ділення, залишок це остача від ділення." },
      { on: "source", name: "Використано intdiv", has: "intdiv(", hint: "Для цілої частини ділення є функція intdiv." },
    ],
  },
  {
    ...base, id: "php-spl-rpn", lesson: "php/81", xp: 35,
    title: "Зворотний польський запис і черга",
    context: "Калькулятори й інтерпретатори обчислюють вирази за допомогою стека: числа кладуть, оператор знімає два верхні й кладе результат. Черга ж віддає завдання в порядку надходження.",
    brief: [
      "Допишіть <code>rpn(string $expr): int</code>. Розбийте вираз за пропусками, числа кладіть у <code>SplStack</code>, а для <code>+</code>, <code>-</code>, <code>*</code> зніміть <b>правий</b> операнд, потім <b>лівий</b>, обчисліть і покладіть результат назад. Наприкінці в стеку лишається відповідь.",
      "Допишіть <code>drain(array $jobs): string</code>: покладіть завдання в <code>SplQueue</code> через <code>enqueue</code>, дістаньте всі через <code>dequeue</code> і поверніть їх через пропуск. Програма друкує три рядки: <code>rpn(\"2 3 4 * +\")</code>, <code>rpn(\"10 2 8 * + 3 -\")</code> і <code>drain(['A', 'B', 'C'])</code>. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function rpn(string $expr): int
{
    $stack = new SplStack();
    foreach (explode(' ', $expr) as $token) {
        // TODO: число покласти в стек, оператор: зняти правий, потім лівий операнд
    }
    return 0;
}

function drain(array $jobs): string
{
    // TODO: SplQueue, enqueue усіх, dequeue в порядку надходження
    return '';
}

echo rpn("2 3 4 * +"), "\n";
echo rpn("10 2 8 * + 3 -"), "\n";
echo drain(['A', 'B', 'C']), "\n";
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "14\n23\nA B C", hint: "Три рядки: два результати виразів і порядок черги." },
      { on: "stdout", name: "Перший вираз дорівнює 14", has: "14", hint: "Спершу 3 * 4, потім 2 + 12. Правий операнд знімається першим." },
      { on: "stdout", name: "Віднімання в правильному порядку", has: "23", hint: "Для мінуса важливо: лівий мінус правий, а не навпаки." },
      { on: "source", name: "Використано SplStack і SplQueue", matches: "SplStack[\\s\\S]*SplQueue", hint: "Стек для виразу, черга для завдань: створіть обидві структури." },
    ],
  },
  {
    ...base, id: "php-heap-queue", lesson: "php/82", xp: 40,
    title: "Черга з пріоритетами й купа",
    context: "Планувальник завдань бере спершу найважливіше, а серед рівних за важливістю найстаріше. Для цього служить SplPriorityQueue, бо сама по собі вона рівних не впорядковує.",
    brief: [
      "Допишіть <code>schedule(array $tasks): string</code>. Кожне завдання це пара <code>[ім'я, пріоритет]</code>. Вставляйте в <code>SplPriorityQueue</code> з пріоритетом-масивом <code>[$prio, -$seq]</code>, де <code>$seq</code> це порядковий номер вставки: так рівні за важливістю виходять у порядку надходження. Поверніть імена через пропуск.",
      "Допишіть <code>smallest(array $nums, int $k): string</code> через <code>SplMinHeap</code>: вставте всі числа, витягніть <code>$k</code> найменших, поверніть їх через пропуск. Допишіть <code>squares(int $n): string</code> через <code>SplFixedArray</code> розміру <code>$n</code> із квадратами індексів, через кому. Програма друкує три рядки, кожен завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function schedule(array $tasks): string
{
    $q = new SplPriorityQueue();
    // TODO: insert з пріоритетом [$prio, -$seq], потім extract доки не порожньо
    return '';
}

function smallest(array $nums, int $k): string
{
    // TODO: SplMinHeap, insert усіх, extract k разів
    return '';
}

function squares(int $n): string
{
    // TODO: SplFixedArray($n), arr[i] = i * i, toArray і implode через кому
    return '';
}

echo schedule([['docs', 1], ['deploy', 5], ['fix', 5], ['lint', 3]]), "\n";
echo smallest([9, 4, 7, 1, 8], 3), "\n";
echo squares(4), "\n";
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "deploy fix lint docs\n1 4 7\n0,1,4,9", hint: "Три рядки: черга пріоритетів, три найменші числа, квадрати." },
      { on: "stdout", name: "Рівні пріоритети в порядку надходження", has: "deploy fix", hint: "Пріоритет-масив [$prio, -$seq]: чим менший номер вставки, тим вищий другий елемент." },
      { on: "stdout", name: "Три найменші числа", has: "1 4 7", hint: "SplMinHeap віддає найменше першим; extract викликайте k разів." },
      { on: "source", name: "Використано SplFixedArray", has: "SplFixedArray", hint: "Масив фіксованого розміру створює клас SplFixedArray." },
    ],
  },
  {
    ...base, id: "php-tz-meeting", lesson: "php/83", xp: 40,
    title: "Нарада в різних часових поясах",
    context: "Команда розкидана по світу, тож час наради зберігають у UTC, а кожному учаснику показують його місцевий. Окремо потрібно порахувати робочі дні в тижні.",
    brief: [
      "Створіть момент <code>2025-07-01 12:00:00</code> у поясі <code>UTC</code> як <code>DateTimeImmutable</code>. Для поясів <code>Europe/Kyiv</code>, <code>America/New_York</code> і <code>Asia/Tokyo</code> виведіть рядок виду <code>Europe/Kyiv 15:00</code>: назва поясу, пропуск, година й хвилини (<code>format('H:i')</code>) після <code>setTimezone</code>. Кожен рядок завершується <code>\\n</code>.",
      "Четвертим рядком виведіть кількість робочих днів (понеділок–п'ятниця) у <code>DatePeriod</code> від <code>2025-03-03</code> до <code>2025-03-10</code> (кінець не входить) з кроком <code>P1D</code>, у форматі <code>Робочих днів: N</code>. День тижня дає <code>format('N')</code>, числа 1–5.",
    ],
    starter: raw`<?php
$utc = new DateTimeZone('UTC');
$meeting = new DateTimeImmutable('2025-07-01 12:00:00', $utc);

foreach (['Europe/Kyiv', 'America/New_York', 'Asia/Tokyo'] as $name) {
    // TODO: setTimezone(new DateTimeZone($name)) і вивід «назва HH:MM»
}

$count = 0;
// TODO: DatePeriod від 2025-03-03 до 2025-03-10 (без кінця), рахувати дні з format('N') від 1 до 5
echo "Робочих днів: ", $count, "\n";
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "Europe/Kyiv 15:00\nAmerica/New_York 08:00\nAsia/Tokyo 21:00\nРобочих днів: 5", hint: "Три рядки з поясами й один з кількістю робочих днів." },
      { on: "stdout", name: "Київ на три години вперед", has: "Europe/Kyiv 15:00", hint: "Влітку Київ випереджає UTC на 3 години; пояс має зсунути setTimezone." },
      { on: "stdout", name: "Нью-Йорк відстає", has: "America/New_York 08:00", hint: "Змінюйте пояс за іменем, не додавайте години вручну." },
      { on: "source", name: "Використано DatePeriod", has: "DatePeriod", hint: "Перебрати дні між двома датами допоможе DatePeriod з DateInterval P1D." },
    ],
  },
  {
    ...base, id: "php-csv-memory", lesson: "php/84", xp: 40,
    title: "CSV у пам'яті: розбір і підсумок",
    context: "Імпорт файлів завжди починається з розбору CSV, у якому поля можуть містити коми й лапки. У пісочниці без файлів потік php://memory ідеально замінює диск.",
    brief: [
      "Відкрийте <code>php://memory</code> у режимі <code>w+</code>, запишіть через <code>fputcsv</code> (із параметрами <code>',', '\"', ''</code>) три рядки: заголовок <code>name,qty</code>, далі <code>Apple</code> з кількістю <code>3</code> та <code>\"Pear, green\"</code> з кількістю <code>5</code>. Не забудьте <code>rewind</code>.",
      "Прочитайте рядки через <code>fgetcsv($h, null, ',', '\"', '')</code>, перший вважайте заголовком, решту з'єднайте з ним через <code>array_combine</code>. Для кожного рядка виведіть <code>name: qty</code>, а наприкінці <code>Разом: N</code>. Кожен рядок завершується <code>\\n</code>.",
    ],
    starter: raw`<?php
$rows = [['name', 'qty'], ['Apple', 3], ['Pear, green', 5]];

$h = fopen('php://memory', 'w+');
foreach ($rows as $row) {
    // TODO: fputcsv($h, $row, ',', '"', '')
}
// TODO: rewind($h)

$header = fgetcsv($h, null, ',', '"', '');
$total = 0;
// TODO: цикл while по fgetcsv, array_combine($header, $row), вивід «name: qty», додавання до $total
fclose($h);
echo "Разом: ", $total, "\n";
`,
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "Apple: 3\nPear, green: 5\nРазом: 8", hint: "Два рядки з товарами й підсумок. Кома в назві не мусить розбити поле." },
      { on: "stdout", name: "Поле з комою ціле", has: "Pear, green: 5", hint: "fputcsv бере таке поле в лапки, а fgetcsv повертає його цілим." },
      { on: "stdout", name: "Сума кількостей", has: "Разом: 8", hint: "Кількості прочитані як рядки: приведіть їх до int перед додаванням." },
      { on: "source", name: "Використано rewind", has: "rewind(", hint: "Після запису позицію в потоці треба повернути на початок." },
    ],
  },
  {
    ...base, id: "php-serialize-settings", lesson: "php/85", xp: 45,
    title: "Серіалізація налаштувань без кешу",
    context: "Налаштування користувача зберігають у вигляді рядка, але тимчасовий кеш у цей рядок потрапляти не повинен. Керувати складом даних дозволяють методи __serialize та __unserialize.",
    brief: [
      "У класі <code>Settings</code> (властивості <code>theme</code> і <code>lang</code>, приватний масив <code>$cache</code>) допишіть <code>__serialize(): array</code>, що повертає лише <code>theme</code> і <code>lang</code>, та <code>__unserialize(array $data): void</code>, що відновлює їх і скидає кеш у порожній масив.",
      "Програма друкує чотири рядки, кожен завершується <code>\\n</code>: результат <code>serialize</code>, тема й мова відновленої копії через пропуск, розмір кешу копії та <code>true</code> або <code>false</code> залежно від того, чи рядок містить слово <code>cache</code> (<code>str_contains</code>, виводьте через <code>var_export(..., true)</code>).",
    ],
    starter: raw`<?php
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

    // TODO: __serialize() повертає лише theme і lang
    // TODO: __unserialize(array $data) відновлює їх і скидає $cache
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
    checks: [
      { on: "stdout", name: "Весь вивід збігається", equals: "O:8:\"Settings\":2:{s:5:\"theme\";s:4:\"dark\";s:4:\"lang\";s:2:\"uk\";}\ndark uk\n0\nfalse", hint: "У рядку лише два поля, копія має порожній кеш, а слова cache у рядку немає." },
      { on: "stdout", name: "Кеш не потрапив у рядок", has: "false", hint: "__serialize має повертати масив лише з theme і lang." },
      { on: "stdout", name: "Копія відновила тему й мову", has: "dark uk", hint: "__unserialize присвоює властивості з переданого масиву." },
      { on: "source", name: "Є __unserialize", has: "__unserialize", hint: "Потрібна пара методів: __serialize і __unserialize." },
    ],
  },
];
