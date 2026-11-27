// Практичні завдання глави «Генератори, ітератори й Fibers», частина 07b (уроки 67–73). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_07b: readonly RemoteTask[] = [
  {
    ...base, id: "php-memoize", lesson: "php/67", xp: 35,
    title: "Мемоїзація з лічильником викликів",
    context: "Повільну чисту функцію можна обгорнути кешем за аргументами. Другий виклик із тим самим аргументом має віддати збережений результат, не рахуючи нічого заново.",
    brief: [
      "Допишіть <code>memoize(callable $fn): callable</code>: вона повертає функцію, що запам'ятовує результати за аргументом (ключ масиву <code>$cache</code>, захоплений через <code>use (&amp;$cache)</code> або в замиканні). Підказка: перевіряйте наявність ключа через <code>array_key_exists</code>, а не <code>isset</code>, щоб кешувався й <code>null</code>.",
      "Програма викликає обгорнуте піднесення до квадрата для <code>4, 4, 5, 4</code> і друкує результати через пробіл, а потім у новому рядку <code>Викликів: N</code> (скільки разів справді спрацювала початкова функція). Кожен рядок завершуйте <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

$calls = 0;

function memoize(callable $fn): callable
{
    // TODO: збережіть результати в масиві за аргументом
    return $fn;
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
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "16 16 25 16\nВикликів: 2", hint: "Чотири результати, але справжніх викликів лише для різних аргументів." },
      { on: "stdout", name: "Лічильник викликів", has: "Викликів: 2", hint: "Повторний аргумент має брати значення з кешу." },
      { on: "stdout", name: "Результати правильні", has: "16 16 25 16", hint: "Кеш не повинен змінювати самих результатів." },
      { on: "source", name: "Перевірка ключа в кеші", matches: "array_key_exists|isset|\\?\\?", hint: "Перед обчисленням перевірте, чи є аргумент у масиві кешу." },
    ],
  },
  {
    ...base, id: "php-date-deadlines", lesson: "php/68", xp: 35,
    title: "Дедлайни через DateTimeImmutable",
    context: "Для замовлення відомо дату створення й кількість днів на виконання. Потрібно обчислити дедлайн і скільки днів лишилось до нього від фіксованої дати перевірки.",
    brief: [
      "Допишіть функцію <code>deadline(DateTimeImmutable $start, int $days): DateTimeImmutable</code> (поверніть <code>$start-&gt;modify(\"+$days days\")</code> або <code>add(new DateInterval(...))</code>) і <code>daysLeft(DateTimeImmutable $now, DateTimeImmutable $due): int</code> через <code>diff</code> та властивість <code>days</code>.",
      "Програма друкує два рядки: <code>Дедлайн: 2025-02-14</code> (формат <code>Y-m-d</code>) і <code>Лишилось днів: 30</code>. Початок <code>2025-01-15</code>, строк 30 днів, перевірка <code>2025-01-15</code>. Не змінюйте вихідні об'єкти: вони незмінні.",
    ],
    starter: raw`<?php
declare(strict_types=1);

$tz = new DateTimeZone('UTC');
$start = new DateTimeImmutable('2025-01-15 10:00:00', $tz);

function deadline(DateTimeImmutable $start, int $days): DateTimeImmutable
{
    // TODO: поверніть нову дату через $days днів
    return $start;
}

function daysLeft(DateTimeImmutable $now, DateTimeImmutable $due): int
{
    // TODO: різниця в днях через diff
    return 0;
}

$due = deadline($start, 30);
echo "Дедлайн: ", $due->format('Y-m-d'), "\n";
echo "Лишилось днів: ", daysLeft($start, $due), "\n";
echo "Початок: ", $start->format('Y-m-d'), "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Дедлайн: 2025-02-14\nЛишилось днів: 30\nПочаток: 2025-01-15", hint: "Три рядки; початкова дата після обчислень не змінюється." },
      { on: "stdout", name: "Дедлайн обчислено", has: "Дедлайн: 2025-02-14", hint: "30 днів від 15 січня потрапляють на середину лютого." },
      { on: "stdout", name: "Різниця в днях", has: "Лишилось днів: 30", hint: "diff повертає DateInterval, потрібна його властивість days." },
      { on: "source", name: "Використано diff", matches: "->diff\\(", hint: "Для різниці між датами використайте метод diff." },
    ],
  },
  {
    ...base, id: "php-stream-log", lesson: "php/69", xp: 35,
    title: "Потоковий розбір журналу",
    context: "Журнал сервера приходить рядок за рядком. Конвеєр на генераторах відфільтровує помилки й рахує їх, не тримаючи весь журнал у пам'яті.",
    brief: [
      "Допишіть генератори <code>parse(iterable $lines): Generator</code> (кожен рядок вигляду <code>LEVEL повідомлення</code> віддає масив <code>[level, message]</code>, розбивши за першим пробілом через <code>explode(' ', $line, 2)</code>) та <code>onlyLevel(iterable $items, string $level): Generator</code>.",
      "Програма друкує повідомлення рівня <code>ERROR</code> по одному в рядку у форматі <code>- повідомлення</code>, а потім <code>Помилок: 2</code>. Кожен рядок завершуйте <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function parse(iterable $lines): Generator
{
    // TODO: yield [рівень, повідомлення] для кожного рядка
    yield from [];
}

function onlyLevel(iterable $items, string $level): Generator
{
    // TODO: пропускайте лише елементи потрібного рівня
    yield from [];
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
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "- диск майже повний\n- таймаут бази\nПомилок: 2", hint: "Лише рядки з рівнем ERROR, кожен із префіксом дефіса." },
      { on: "stdout", name: "Підсумок", has: "Помилок: 2", hint: "Лічильник збільшується лише для відфільтрованих елементів." },
      { on: "stdout", name: "Інформаційні рядки відкинуто", matches: "^(?![\\s\\S]*запит оброблено)", hint: "Рядки INFO не повинні потрапити у вивід." },
      { on: "source", name: "Використано yield", has: "yield", hint: "Конвеєр має складатися з генераторів, а не з масивів." },
    ],
  },
  {
    ...base, id: "php-gen-send-average", lesson: "php/70", xp: 40,
    title: "Рухоме середнє через send",
    context: "Генератор-акумулятор отримує числа через send і щоразу повертає поточне середнє. Наприкінці його можна завершити й забрати підсумок через getReturn.",
    brief: [
      "Допишіть генератор <code>averager(): Generator</code>: у циклі він виконує <code>$x = yield $avg;</code> (спершу <code>$avg = null</code>), накопичує суму й кількість, оновлює <code>$avg</code>. Коли надходить <code>null</code> (виклик <code>send(null)</code>), цикл завершується, а генератор повертає <code>[count, avg]</code> через <code>return</code>.",
      "Програма надсилає <code>10, 20, 60</code>, друкує після кожного <code>send</code> середнє через <code>round($avg, 1)</code> у форматі <code>Середнє: X</code>, потім завершує генератор і друкує <code>Усього: 3, середнє 30</code>. Кожен рядок завершуйте <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function averager(): Generator
{
    $sum = 0;
    $count = 0;
    $avg = null;
    // TODO: у циклі приймайте значення через yield; на null вийдіть і поверніть [count, avg]
    return [0, 0];
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
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Середнє: 10\nСереднє: 15\nСереднє: 30\nУсього: 3, середнє 30", hint: "Середнє після кожного числа: 10, потім 15, потім 30." },
      { on: "stdout", name: "Підсумок із getReturn", has: "Усього: 3, середнє 30", hint: "Значення return забирається через getReturn після завершення." },
      { on: "stdout", name: "Проміжні середні", has: "Середнє: 15", hint: "send повертає те, що генератор віддав наступним yield." },
      { on: "source", name: "Присвоєння з yield", matches: "=\\s*yield", hint: "Значення з send приймається як результат виразу yield." },
    ],
  },
  {
    ...base, id: "php-fiber-basics", lesson: "php/71", xp: 40,
    title: "Fiber: призупинка й відновлення",
    context: "Fiber дозволяє зупинити функцію посередині, віддати значення назовні й продовжити пізніше з новим значенням. Це основа кооперативної багатозадачності.",
    brief: [
      "Створіть <code>new Fiber(function (string $name): string { ... })</code>, у тілі якого: друк <code>Початок $name</code>, <code>$got = Fiber::suspend(1);</code>, друк <code>Отримано $got</code>, <code>$got2 = Fiber::suspend(2);</code>, і <code>return \"$name: $got+$got2\"</code>.",
      "Запустіть через <code>start('job')</code>, двічі відновіть через <code>resume('A')</code> та <code>resume('B')</code>, друкуючи значення, які повернули <code>start</code> і перший <code>resume</code> (<code>Віддано 1</code>, <code>Віддано 2</code>), а в кінці результат <code>getReturn()</code>. Кожен рядок завершуйте <code>\\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

$fiber = new Fiber(function (string $name): string {
    // TODO: друк, suspend(1), друк, suspend(2), return
    return $name;
});

// TODO: start, resume, resume із друком значень
echo "Статус: ", $fiber->isTerminated() ? "завершено" : "триває", "\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Початок job\nВіддано 1\nОтримано A\nВіддано 2\nОтримано B\njob: A+B\nСтатус: завершено", hint: "Спостерігайте чергування: тіло fiber і зовнішній код друкують по черзі." },
      { on: "stdout", name: "Результат Fiber", has: "job: A+B", hint: "getReturn доступний лише після завершення fiber." },
      { on: "stdout", name: "Значення з suspend", has: "Віддано 2", hint: "start і resume повертають значення, передане в Fiber::suspend." },
      { on: "source", name: "Використано Fiber::suspend", has: "Fiber::suspend", hint: "Зупиняйте виконання з тіла fiber статичним викликом suspend." },
    ],
  },
  {
    ...base, id: "php-fiber-scheduler", lesson: "php/72", xp: 45,
    title: "Планувальник fibers по колу",
    context: "Планувальник тримає чергу fibers і по черзі відновлює кожну, поки всі не завершаться. Так кілька завдань роблять крок за кроком, не блокуючи одне одного.",
    brief: [
      "Допишіть <code>runAll(array $fibers): void</code>: спершу запустіть кожну fiber через <code>start()</code>, потім у циклі по колу викликайте <code>resume()</code> лише для тих, що ще не завершені (<code>isTerminated()</code>), доки не лишиться жодної.",
      "Завдання <code>task('A', 2)</code> і <code>task('B', 3)</code> друкують <code>ім'я:крок</code> і після кожного кроку роблять <code>Fiber::suspend()</code>. Очікуваний порядок: <code>A:1 B:1 A:2 B:2 B:3</code>, кожне на окремому рядку.",
    ],
    starter: raw`<?php
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
    // TODO: start для всіх, потім resume по колу, поки не завершаться всі
}

runAll([task('A', 2), task('B', 3)]);
echo "Готово\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "A:1\nB:1\nA:2\nB:2\nB:3\nГотово", hint: "Кроки чергуються; коли A завершилась, B доробляє сама." },
      { on: "stdout", name: "Останній крок B", has: "B:3", hint: "Не відновлюйте завершену fiber: це FiberError." },
      { on: "stdout", name: "Фінальний рядок", has: "Готово", hint: "Функція runAll має повернутися лише коли всі fibers завершені." },
      { on: "source", name: "Перевірка завершення", has: "isTerminated", hint: "Перед resume перевіряйте, чи fiber ще не завершилась." },
    ],
  },
  {
    ...base, id: "php-gen-coroutines", lesson: "php/73", xp: 50,
    title: "Корутини на генераторах",
    context: "Генератор теж можна використати як кооперативне завдання: кожен yield віддає керування планувальнику. Простий цикл по черзі просуває всі корутини вперед.",
    brief: [
      "Допишіть <code>runLoop(array $tasks): void</code>: <code>$tasks</code> це масив генераторів. Поки є незавершені, беріть з початку черги задачу, виводьте її поточне значення (<code>current()</code>), викликайте <code>next()</code>; якщо вона ще <code>valid()</code>, повертайте її в кінець черги.",
      "Корутини <code>worker('X', 2)</code> і <code>worker('Y', 1)</code> роблять <code>yield \"$name$i\"</code> для <code>i</code> від 1. Очікуваний вивід: <code>X1</code>, <code>Y1</code>, <code>X2</code> (окремі рядки), потім <code>Кінець</code>. Метод <code>current()</code> першої задачі спрацьовує одразу, без окремого <code>rewind</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

function worker(string $name, int $n): Generator
{
    for ($i = 1; $i <= $n; $i++) {
        yield "$name$i";
    }
}

function runLoop(array $tasks): void
{
    // TODO: по черзі беріть задачу, друкуйте current(), робіть next(), повертайте в чергу, якщо valid()
}

runLoop([worker('X', 2), worker('Y', 1)]);
echo "Кінець\n";
`,
    checks: [
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "X1\nY1\nX2\nКінець", hint: "Задачі чергуються: X, Y, потім знову X, бо Y уже завершилась." },
      { on: "stdout", name: "Друга ітерація X", has: "X2", hint: "Після next() задачу, що ще valid(), повертайте в кінець черги." },
      { on: "stdout", name: "Завершення", has: "Кінець", hint: "Цикл закінчується, коли черга порожня." },
      { on: "source", name: "Використано чергу", matches: "array_shift|SplQueue", hint: "Беріть задачі з початку черги, наприклад через array_shift." },
    ],
  },
];
