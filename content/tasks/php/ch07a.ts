// Практичні завдання глави «Генератори, ітератори й Fibers», частина 07a (уроки 59–66). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_07a: readonly RemoteTask[] = [
  {
    ...base, id: "php-compose-pipeline", lesson: "php/59", xp: 30,
    title: "Композиція функцій зліва направо",
    context: "Обробка даних часто складається з кількох дрібних чистих кроків. Функція compose склеює їх в одну, і порядок кроків стає видно з одного рядка.",
    brief: [
      "Допишіть <code>compose(callable ...$fns): callable</code>: вона повертає функцію, що пропускає значення через усі <code>$fns</code> по черзі <b>зліва направо</b> (результат першої стає входом другої тощо).",
      "Програма друкує три рядки: результат <code>compose('trim', 'strtoupper', fn($s) =&gt; $s . '!')</code> для <code>\"  hello \"</code>, результат <code>compose(fn($x) =&gt; $x + 1, fn($x) =&gt; $x * 2)</code> для <code>5</code>, і елементи <code>[1, 2, 3]</code> після другої композиції через <code>array_map</code>, з'єднані комами. Кожен рядок завершуйте <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function compose(callable ...$fns): callable
{
    // TODO: поверніть функцію, що застосовує $fns по черзі зліва направо
    return fn(mixed $x): mixed => $x;
}

$shout = compose('trim', 'strtoupper', fn($s) => $s . '!');
echo $shout("  hello "), "\n";

$calc = compose(fn($x) => $x + 1, fn($x) => $x * 2);
echo $calc(5), "\n";
echo implode(",", array_map($calc, [1, 2, 3])), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "HELLO!\n12\n4,6,8", hint: "Три рядки; другий результат (5 + 1) * 2, а не 5 * 2 + 1." },
      { on: "stdout", name: "Текст зібрано з трьох кроків", has: "HELLO!", hint: "Спершу trim, потім strtoupper, потім додається знак оклику." },
      { on: "stdout", name: "Порядок кроків зліва направо", has: "12", hint: "Спочатку додається 1, потім множення на 2." },
      { on: "source", name: "Змінна кількість функцій", matches: "callable\\s*\\.\\.\\.\\s*\\$", hint: "Оголосіть параметр як callable ...$fns, щоб прийняти скільки завгодно функцій." },
    ],
  },
  {
    ...base, id: "php-iterator-countdown", lesson: "php/60", xp: 30,
    title: "Зворотний відлік як Iterator",
    context: "Власний клас, який можна пройти циклом foreach, потрібен для колекцій і курсорів. Інтерфейс Iterator описує п'ять кроків, які PHP викликає сам.",
    brief: [
      "Клас <code>Countdown</code> уже оголошено з інтерфейсом <code>Iterator</code>. Реалізуйте методи так, щоб <code>new Countdown(3)</code> віддавав значення <code>3, 2, 1</code> з ключами <code>0, 1, 2</code>: <code>current</code> повертає <code>from - позиція</code>, <code>key</code> повертає позицію, <code>valid</code> перевіряє, що позиція менша за <code>from</code>.",
      "Програма виводить <code>foreach</code> у форматі <code>ключ: значення</code> по рядку (кожен завершуйте <code>\\n</code>), а потім один рядок значень через кому, зібраний <code>iterator_to_array(..., false)</code>: <code>3,2,1</code>. Другий прохід має працювати, тож <code>rewind</code> скидає позицію.",
    ],
    starter: raw`<?php
final class Countdown implements Iterator
{
    private int $pos = 0;

    public function __construct(private int $from) {}

    // TODO: current(): повертає $this->from - $this->pos
    public function current(): mixed { return null; }

    // TODO: key(): повертає $this->pos
    public function key(): mixed { return null; }

    // TODO: next(): збільшує позицію
    public function next(): void {}

    // TODO: rewind(): скидає позицію
    public function rewind(): void {}

    // TODO: valid(): позиція ще менша за $this->from
    public function valid(): bool { return false; }
}

foreach (new Countdown(3) as $k => $v) {
    echo "$k: $v\n";
}
echo implode(",", iterator_to_array(new Countdown(3), false)), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "0: 3\n1: 2\n2: 1\n3,2,1", hint: "Три рядки «ключ: значення» і рядок 3,2,1." },
      { on: "stdout", name: "Значення рахуються вниз", has: "0: 3", hint: "Перший елемент має ключ 0 і значення 3: це from - pos." },
      { on: "stdout", name: "Ключі йдуть із нуля", has: "2: 1", hint: "Останній рядок циклу: ключ 2, значення 1." },
      { on: "source", name: "Клас підписав контракт", matches: "implements\\s+Iterator", hint: "Клас має реалізувати інтерфейс Iterator." },
    ],
  },
  {
    ...base, id: "php-gen-evens", lesson: "php/61", xp: 25,
    title: "Парні числа генератором",
    context: "Генератор видає значення по одному й не зберігає весь ряд у пам'яті. Так можна описати довгу послідовність короткою функцією.",
    brief: [
      "Допишіть генератор <code>evens(int $max): Generator</code>: він видає через <code>yield</code> усі парні числа від 2 до <code>$max</code> включно. Прибирайте з тіла заглушку <code>if (false)</code>.",
      "Програма друкує три рядки (кожен завершуйте <code>\\n</code>): парні числа до 10 через пробіл, <code>Сума: </code> та їх сума (обчисліть у <code>foreach</code>) і назву класу, яку дає <code>get_class(evens(2))</code>.",
    ],
    starter: raw`<?php
function evens(int $max): Generator
{
    // TODO: yield парних чисел від 2 до $max
    if (false) {
        yield 0;
    }
}

echo implode(" ", iterator_to_array(evens(10), false)), "\n";

$sum = 0;
foreach (evens(10) as $n) {
    // TODO: додайте $n до $sum
}
echo "Сума: $sum\n";
echo get_class(evens(2)), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "2 4 6 8 10\nСума: 30\nGenerator", hint: "Три рядки: числа, сума 30 і слово Generator." },
      { on: "stdout", name: "Парні числа", has: "2 4 6 8 10", hint: "Крок циклу 2, починаючи з 2, і кожне значення віддайте через yield." },
      { on: "stdout", name: "Сума підрахована", has: "Сума: 30", hint: "У foreach додавайте кожне $n до $sum." },
      { on: "source", name: "Використано yield", matches: "\\byield\\s+\\$", hint: "Значення мають іти через yield, а не збиратися в масив." },
    ],
  },
  {
    ...base, id: "php-yield-from-merge", lesson: "php/62", xp: 30,
    title: "Склейка потоків і пастка ключів",
    context: "Склеюючи кілька джерел, легко втратити дані: ключі з різних джерел можуть збігтися. Завдання показує це на власному коді.",
    brief: [
      "Допишіть генератор <code>merge(array ...$parts): Generator</code>: для кожного масиву з <code>$parts</code> він делегує через <code>yield from</code>, зберігаючи ключі.",
      "Для <code>merge(['a' =&gt; 1, 'b' =&gt; 2], ['b' =&gt; 3, 'c' =&gt; 4])</code> виведіть три рядки (кожен завершуйте <code>\\n</code>): <code>Обхід: a=1 b=2 b=3 c=4</code> (пари з <code>foreach</code>), <code>З ключами: </code> і кількість елементів <code>iterator_to_array($g)</code>, <code>Без ключів: </code> і кількість для <code>iterator_to_array($g, false)</code>.",
    ],
    starter: raw`<?php
function merge(array ...$parts): Generator
{
    // TODO: для кожного масиву зробіть yield from
    if (false) {
        yield 0;
    }
}

$pairs = [];
foreach (merge(['a' => 1, 'b' => 2], ['b' => 3, 'c' => 4]) as $k => $v) {
    $pairs[] = "$k=$v";
}
echo "Обхід: ", implode(" ", $pairs), "\n";
echo "З ключами: ", count(iterator_to_array(merge(['a' => 1, 'b' => 2], ['b' => 3, 'c' => 4]))), "\n";
echo "Без ключів: ", count(iterator_to_array(merge(['a' => 1, 'b' => 2], ['b' => 3, 'c' => 4]), false)), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Обхід: a=1 b=2 b=3 c=4\nЗ ключами: 3\nБез ключів: 4", hint: "Ключ b зустрічається двічі, тому зі збереженням ключів лишається 3 елементи." },
      { on: "stdout", name: "foreach бачить усе", has: "a=1 b=2 b=3 c=4", hint: "Усі чотири пари мають пройти через foreach, зокрема обидва b." },
      { on: "stdout", name: "Втрата при збереженні ключів", has: "З ключами: 3", hint: "Другий b перезаписує перший, коли ключі збережено." },
      { on: "source", name: "Делегування", matches: "yield\\s+from", hint: "Скористайтеся yield from, а не вкладеним циклом." },
    ],
  },
  {
    ...base, id: "php-gen-pipeline", lesson: "php/63", xp: 35,
    title: "Конвеєр очищення рядків",
    context: "Імпорт даних зазвичай ланцюжок: прочитати, обрізати, відкинути сміття, перетворити. Кожен крок генератор, і дані йдуть по одному рядку.",
    brief: [
      "Дано масив <code>$raw</code> з рядками, частина яких порожня або з пробілів. Допишіть три етапи-генератори, що приймають <code>iterable</code>: <code>trimmed</code> віддає <code>trim($line)</code>, <code>nonEmpty</code> пропускає порожні рядки, <code>upper</code> віддає <code>strtoupper</code>. Заглушки зараз просто передають дані далі.",
      "Програма з'єднує етапи в конвеєр і друкує два рядки (кожен завершуйте <code>\\n</code>): результат через кому (<code>APPLE,BANANA,CHERRY</code>) і <code>Разом: </code> та їх кількість.",
    ],
    starter: raw`<?php
function trimmed(iterable $in): Generator
{
    // TODO: віддавайте trim($line)
    yield from $in;
}

function nonEmpty(iterable $in): Generator
{
    // TODO: пропускайте порожні рядки
    yield from $in;
}

function upper(iterable $in): Generator
{
    // TODO: віддавайте strtoupper($line)
    yield from $in;
}

$raw = ["  apple ", "", "banana", "   ", "cherry"];
$lines = iterator_to_array(upper(nonEmpty(trimmed($raw))), false);
echo implode(",", $lines), "\n";
echo "Разом: ", count($lines), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "APPLE,BANANA,CHERRY\nРазом: 3", hint: "Порожні рядки мають зникнути, решта обрізана й у верхньому регістрі." },
      { on: "stdout", name: "Рядки очищено", has: "APPLE,BANANA,CHERRY", hint: "Порядок етапів: trim, відсіювання порожніх, strtoupper." },
      { on: "stdout", name: "Порожні відкинуто", has: "Разом: 3", hint: "Два з п'яти рядків порожні після trim." },
      { on: "source", name: "Етапи є генераторами", matches: "yield\\s+(?!from)", hint: "Хоча б в одному етапі віддавайте значення через yield, а не yield from." },
    ],
  },
  {
    ...base, id: "php-infinite-take", lesson: "php/64", xp: 35,
    title: "Кратні сімці з нескінченного ряду",
    context: "Нескінченний генератор нічого не вираховує наперед, тому з нього можна брати рівно стільки, скільки треба. Межу ставить споживач.",
    brief: [
      "Генератор <code>naturals()</code> віддає 1, 2, 3 і так без кінця. Допишіть <code>divisibleBy(iterable $in, int $k)</code> (віддає лише кратні <code>$k</code>) і <code>take(iterable $in, int $n)</code> (віддає перші <code>$n</code> елементів і одразу зупиняється, не читаючи зайвого).",
      "Виведіть два рядки (кожен завершуйте <code>\\n</code>): перші 5 чисел, кратних 7, через пробіл (<code>7 14 21 28 35</code>) і перші 3 натуральні числа (<code>1 2 3</code>).",
    ],
    starter: raw`<?php
function naturals(): Generator
{
    $n = 1;
    while (true) {
        yield $n++;
    }
}

function divisibleBy(iterable $in, int $k): Generator
{
    // TODO: віддавайте лише числа, що діляться на $k
    yield from $in;
}

function take(iterable $in, int $n): Generator
{
    // TODO: віддайте перші $n елементів і зупиніться
    if (false) {
        yield 0;
    }
}

echo implode(" ", iterator_to_array(take(divisibleBy(naturals(), 7), 5), false)), "\n";
echo implode(" ", iterator_to_array(take(naturals(), 3), false)), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "7 14 21 28 35\n1 2 3", hint: "Два рядки: п'ять кратних 7 і перші три натуральні." },
      { on: "stdout", name: "Кратні сімці", has: "7 14 21 28 35", hint: "Умова відбору: $v % $k === 0." },
      { on: "stdout", name: "Обмеження потоку", has: "1 2 3", hint: "take має припинити роботу, коли віддано $n елементів." },
      { on: "source", name: "Зупинка через return", matches: "\\breturn\\s*;", hint: "Вийдіть із take через return, щоб нескінченний цикл не працював далі." },
    ],
  },
  {
    ...base, id: "php-aggregate-shelf", lesson: "php/65", xp: 35,
    title: "Книжкова полиця з IteratorAggregate",
    context: "Клас-колекція має ховати внутрішній масив, але давати обхід через foreach. IteratorAggregate просить лише один метод, який повертає готовий ітератор.",
    brief: [
      "Клас <code>Shelf</code> зберігає назви книжок у приватному масиві. Реалізуйте <code>getIterator(): Iterator</code> так, щоб він повертав <code>new ArrayIterator($this-&gt;books)</code>.",
      "Програма друкує <code>foreach</code> по полиці у форматі <code>ключ: назва</code> по рядку, а потім рядок <code>Перші дві: Дюна, Солярис</code>, зібраний через <code>LimitIterator</code> (зсув 0, ліміт 2) і <code>implode</code>. Кожен рядок завершуйте <code>\\n</code>.",
    ],
    starter: raw`<?php
final class Shelf implements IteratorAggregate
{
    private array $books = [];

    public function add(string $title): void
    {
        $this->books[] = $title;
    }

    public function getIterator(): Iterator
    {
        // TODO: поверніть ArrayIterator над $this->books
        return new ArrayIterator([]);
    }
}

$shelf = new Shelf();
foreach (["Дюна", "Солярис", "Кобзар"] as $title) {
    $shelf->add($title);
}

foreach ($shelf as $i => $book) {
    echo "$i: $book\n";
}

// TODO: перші дві книжки через LimitIterator
$firstTwo = [];
echo "Перші дві: ", implode(", ", $firstTwo), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "0: Дюна\n1: Солярис\n2: Кобзар\nПерші дві: Дюна, Солярис", hint: "Три рядки обходу й рядок з двома першими книжками." },
      { on: "stdout", name: "Обхід полиці", has: "2: Кобзар", hint: "getIterator має віддавати ArrayIterator над масивом книжок." },
      { on: "stdout", name: "Обмеження через SPL", has: "Перші дві: Дюна, Солярис", hint: "LimitIterator приймає ітератор, зсув і кількість." },
      { on: "source", name: "LimitIterator", matches: "new\\s+LimitIterator", hint: "Створіть LimitIterator над $shelf->getIterator()." },
      { on: "source", name: "IteratorAggregate", matches: "implements\\s+IteratorAggregate", hint: "Клас має реалізувати IteratorAggregate." },
    ],
  },
  {
    ...base, id: "php-lazy-collection", lesson: "php/66", xp: 40,
    title: "Лінива колекція з ланцюжком",
    context: "Ланцюжок map, filter і take читається як звичайна колекція, але нічого не рахує, доки не попросять результат. Так можна працювати навіть із нескінченним джерелом.",
    brief: [
      "Клас <code>Lazy</code> уже вміє створюватися через <code>Lazy::from()</code> і збирати результат у <code>toArray()</code>. Допишіть <code>map</code>, <code>filter</code> і <code>take</code>: кожен повертає <b>нову</b> <code>Lazy</code> з вкладеним генератором і нічого не обчислює до <code>toArray</code>. <code>take</code> зупиняється одразу після <code>$n</code>-го елемента.",
      "Програма береться за нескінченне <code>naturals()</code>, залишає парні, підносить до квадрата й бере 3. Виведіть два рядки (кожен завершуйте <code>\\n</code>): <code>4,16,36</code> і <code>Викликів map: 3</code> (лічильник у замиканні для <code>map</code>).",
    ],
    starter: raw`<?php
function naturals(): Generator
{
    $n = 1;
    while (true) {
        yield $n++;
    }
}

final class Lazy
{
    private function __construct(private iterable $src) {}

    public static function from(iterable $src): self
    {
        return new self($src);
    }

    public function map(callable $f): self
    {
        // TODO: нова Lazy з генератором, що віддає $f($v)
        return $this;
    }

    public function filter(callable $f): self
    {
        // TODO: нова Lazy з генератором, що віддає лише $v, для яких $f($v) істинне
        return $this;
    }

    public function take(int $n): self
    {
        // TODO: нова Lazy з генератором, що віддає перші $n елементів і зупиняється
        return new self([]);
    }

    public function toArray(): array
    {
        $out = [];
        foreach ($this->src as $v) {
            $out[] = $v;
        }
        return $out;
    }
}

$calls = 0;
$result = Lazy::from(naturals())
    ->filter(fn($x) => $x % 2 === 0)
    ->map(function ($x) use (&$calls) {
        $calls++;
        return $x * $x;
    })
    ->take(3)
    ->toArray();

echo implode(",", $result), "\n";
echo "Викликів map: $calls\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "4,16,36\nВикликів map: 3", hint: "Квадрати перших трьох парних і рівно три виклики map." },
      { on: "stdout", name: "Результат ланцюжка", has: "4,16,36", hint: "Парні 2, 4, 6 дають квадрати 4, 16, 36." },
      { on: "stdout", name: "Лінивість", has: "Викликів map: 3", hint: "take має зупинитися після третього елемента, не читаючи наступного." },
      { on: "source", name: "Вкладені генератори", matches: "\\byield\\b", hint: "Кожен метод має будувати генератор із yield (наприклад, через анонімну функцію)." },
    ],
  },
];
