// Практичні завдання частини 02b (уроки 12–18). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_02b: readonly RemoteTask[] = [
  {
    ...base, id: "php-match-shipping", lesson: "php/12", xp: 20,
    title: "Вартість доставки через match",
    context: "Коли треба обчислити одне значення з кількох варіантів, зручний match: він повертає результат, порівнює суворо й не провалюється в сусідні гілки.",
    brief: [
      "Допишіть <code>shipping(string $country): int</code> через <code>match</code>: <code>UA</code> це 70, <code>PL</code> і <code>DE</code> це 250, усе інше 400.",
      "Програма виводить для країн <code>UA</code>, <code>PL</code>, <code>US</code>, <code>DE</code> по рядку у форматі <code>UA: 70</code>.",
    ],
    starter: raw`<?php
function shipping(string $country): int
{
    // TODO: match: UA 70, PL і DE 250, інакше 400
    return 0;
}

foreach (["UA", "PL", "US", "DE"] as $c) {
    echo $c . ": " . shipping($c) . "\n";
}
`,
    checks: [
      { on: "stdout", name: "Повний вивід збігається", equals: "UA: 70\nPL: 250\nUS: 400\nDE: 250", hint: "Чотири рядки у форматі «країна: сума», у порядку UA, PL, US, DE." },
      { on: "stdout", name: "Країни з однаковою ставкою", has: "DE: 250", hint: "Кілька варіантів з однаковим результатом у match пишуть через кому в одній гілці." },
      { on: "stdout", name: "Невідома країна отримує 400", has: "US: 400", hint: "Усе, що не збіглося з іншими гілками, ловить default." },
      { on: "source", name: "Використано match", matches: "\\bmatch\\s*\\(", hint: "Результат має повертати вираз match (...) { ... }." },
    ],
  },
  {
    ...base, id: "php-grade-loop", lesson: "php/13", xp: 25,
    title: "Оцінки учнів: foreach і elseif",
    context: "Цикл foreach проходить по всіх записах, а умова вирішує, що з кожним робити. Разом вони дають типовий звіт: рядок на запис і підсумок наприкінці.",
    brief: [
      "Допишіть <code>grade(int $score)</code>: від 90 балів <code>A</code>, від 75 <code>B</code>, від 60 <code>C</code>, інакше <code>D</code> (<code>if / elseif / else</code> або <code>match(true)</code>).",
      "У циклі <code>foreach</code> виведіть рядок <code>Оля 95 A</code> (ім'я, бал, оцінка) і порахуйте тих, хто отримав не <code>D</code>. Наприкінці виведіть <code>Склали: 3</code>.",
    ],
    starter: raw`<?php
function grade(int $score): string
{
    // TODO: A від 90, B від 75, C від 60, інакше D
    return "?";
}

$scores = ["Оля" => 95, "Петро" => 80, "Марко" => 61, "Ігор" => 30];

$passed = 0;
foreach ($scores as $name => $score) {
    echo $name . " " . $score . " " . grade($score) . "\n";
    // TODO: збільште $passed, якщо оцінка не D
}
echo "Склали: " . $passed . "\n";
`,
    checks: [
      { on: "stdout", name: "Повний вивід збігається", equals: "Оля 95 A\nПетро 80 B\nМарко 61 C\nІгор 30 D\nСклали: 3", hint: "Рядок на учня у форматі «ім'я бал оцінка», потім підсумок «Склали: N»." },
      { on: "stdout", name: "95 балів: A", has: "Оля 95 A", hint: "Спершу перевіряйте найвищий поріг: перша гілка, що збіглась, виграє." },
      { on: "stdout", name: "30 балів: D", has: "Ігор 30 D", hint: "Гілка else (або default) ловить усе, що нижче 60." },
      { on: "stdout", name: "Підраховано тих, хто склав", has: "Склали: 3", hint: "Лічильник збільшують усередині циклу, коли grade() не дорівнює D." },
      { on: "source", name: "Використано elseif або match", matches: "\\belseif\\b|\\bmatch\\s*\\(", hint: "Для кількох порогів підійде ланцюжок elseif або match (true)." },
    ],
  },
  {
    ...base, id: "php-discount-func", lesson: "php/14", xp: 25,
    title: "Ціна зі знижкою: параметр за замовчуванням",
    context: "Параметр зі значенням за замовчуванням робить аргумент необов'язковим: виклик без знижки стає коротшим, а функція все одно повертає число, а не друкує його.",
    brief: [
      "Допишіть <code>price(float $base, int $percent = 0): float</code>: повертає ціну після знижки у відсотках, округлену до копійок (<code>round(..., 2)</code>).",
      "Основний код уже друкує три рядки через <code>printf</code>: <code>Без знижки: 200.00</code>, <code>Знижка 15%: 170.00</code> і <code>Знижка 50%: 100.00</code>.",
    ],
    starter: raw`<?php
function price(float $base, int $percent): float
{
    // TODO: зробіть $percent необов'язковим (0) і поверніть ціну зі знижкою
    return 0.0;
}

printf("Без знижки: %.2f\n", price(200.0));
printf("Знижка 15%%: %.2f\n", price(200.0, 15));
printf("Знижка 50%%: %.2f\n", price(200.0, 50));
`,
    checks: [
      { on: "stdout", name: "Повний вивід збігається", equals: "Без знижки: 200.00\nЗнижка 15%: 170.00\nЗнижка 50%: 100.00", hint: "Ціна зі знижкою це base * (100 - percent) / 100." },
      { on: "stdout", name: "Без знижки ціна не змінюється", has: "Без знижки: 200.00", hint: "Значення за замовчуванням 0 означає нуль відсотків знижки." },
      { on: "stdout", name: "Знижка 15%", has: "Знижка 15%: 170.00", hint: "Від 200 відняти 15 відсотків." },
      { on: "source", name: "Є значення за замовчуванням", matches: "int\\s+\\$percent\\s*=\\s*0", hint: "У списку параметрів напишіть $percent = 0 після типу." },
    ],
  },
  {
    ...base, id: "php-named-args", lesson: "php/15", xp: 25,
    title: "Іменовані аргументи й змінна кількість",
    context: "Іменовані аргументи роблять виклик самоописовим, а variadic-параметр приймає будь-яку кількість значень. Разом із spread вони дають гнучкі, але читабельні функції.",
    brief: [
      "Допишіть <code>total(int ...$nums): int</code>, що повертає суму всіх переданих чисел, і <code>label(string $name, string $unit = \"шт\", int $qty = 1): string</code>, що повертає рядок <code>назва: кількість одиниця</code>.",
      "Виведіть три рядки: <code>total(1, 2, 3)</code>; <code>total(...[10, 20, 30, 40])</code>; <code>label(\"Чай\", qty: 5)</code>. Очікуваний вивід: <code>6</code>, <code>100</code>, <code>Чай: 5 шт</code>.",
    ],
    starter: raw`<?php
function total(int ...$nums): int
{
    // TODO: просумуйте всі числа
    return 0;
}

function label(string $name, string $unit = "шт", int $qty = 1): string
{
    // TODO: поверніть "назва: кількість одиниця"
    return "";
}

echo total(1, 2, 3), "\n";
echo total(...[10, 20, 30, 40]), "\n";
echo label("Чай", qty: 5), "\n";
`,
    checks: [
      { on: "stdout", name: "Повний вивід збігається", equals: "6\n100\nЧай: 5 шт", hint: "Три рядки: сума 1+2+3, сума розгорнутого масиву й підпис товару." },
      { on: "stdout", name: "Сума розгорнутого масиву", has: "100", hint: "Variadic-параметр збирає значення в масив, який можна підсумувати через array_sum." },
      { on: "stdout", name: "Підпис з іменованим аргументом", has: "Чай: 5 шт", hint: "Одиниця береться зі значення за замовчуванням, кількість з іменованого аргументу." },
      { on: "source", name: "Є іменований аргумент", matches: "qty\\s*:\\s*5", hint: "У виклику label вкажіть ім'я параметра перед значенням." },
    ],
  },
  {
    ...base, id: "php-static-counter", lesson: "php/16", xp: 30,
    title: "Лічильник із static і use",
    context: "Змінна static переживає виклики функції, а замикання бачить зовнішні змінні лише через use. Обидва механізми зберігають стан, але по-різному.",
    brief: [
      "Допишіть <code>nextId(): int</code>, яка при кожному виклику повертає 1, 2, 3 тощо (використайте <code>static</code>). Допишіть <code>makeAdder(int $step): Closure</code>, що повертає замикання, яке додає <code>$step</code> до переданого числа (через <code>use</code>).",
      "Основний код друкує три виклики <code>nextId()</code> і результат <code>makeAdder(5)(10)</code>, по одному на рядок: <code>1</code>, <code>2</code>, <code>3</code>, <code>15</code>.",
    ],
    starter: raw`<?php
function nextId(): int
{
    // TODO: зберігайте лічильник між викликами
    return 0;
}

function makeAdder(int $step): Closure
{
    // TODO: поверніть замикання, що додає $step
    return function (int $n): int {
        return $n;
    };
}

echo nextId(), "\n";
echo nextId(), "\n";
echo nextId(), "\n";
$add5 = makeAdder(5);
echo $add5(10), "\n";
`,
    checks: [
      { on: "stdout", name: "Повний вивід збігається", equals: "1\n2\n3\n15", hint: "Лічильник росте між викликами, а замикання додає крок до аргументу." },
      { on: "stdout", name: "Лічильник дійшов до трьох", has: "3", hint: "Змінна, оголошена як static, зберігає значення між викликами функції." },
      { on: "stdout", name: "Замикання додало крок", has: "15", hint: "Змінну $step у замикання передають через use ($step)." },
      { on: "source", name: "Використано static", matches: "\\bstatic\\s+\\$", hint: "Оголосіть у функції змінну з ключовим словом static." },
      { on: "source", name: "Використано use", matches: "\\buse\\s*\\(", hint: "Замикання отримує зовнішню змінну через use ($step)." },
    ],
  },
  {
    ...base, id: "php-arrow-callable", lesson: "php/17", xp: 30,
    title: "Стрілкові функції та callable",
    context: "Стрілкова функція fn коротко записує одновираз і сама захоплює зовнішні змінні. Першокласні callable дозволяють передати існуючу функцію як значення.",
    brief: [
      "Є масив <code>$prices = [100, 250, 40]</code> і змінна <code>$rate = 2</code>. Створіть <code>$doubled</code> через <code>array_map</code> зі стрілковою функцією, що множить ціну на <code>$rate</code>, та <code>$lengths</code> через <code>array_map(mb_strlen(...), $words)</code> для слів <code>[\"php\", \"код\", \"мова\"]</code>... довжини рахуйте через <code>mb_strlen(...)</code>.",
      "Виведіть через <code>implode(\",\", ...)</code> спершу <code>$doubled</code>, потім <code>$lengths</code>: <code>200,500,80</code> і <code>3,3,4</code>, кожен на окремому рядку.",
    ],
    starter: raw`<?php
$prices = [100, 250, 40];
$rate = 2;
$words = ["php", "код", "мова"];

// TODO: $doubled = array_map із fn, що множить на $rate
$doubled = [];
// TODO: $lengths = array_map із mb_strlen(...)
$lengths = [];

echo implode(",", $doubled), "\n";
echo implode(",", $lengths), "\n";
`,
    checks: [
      { on: "stdout", name: "Повний вивід збігається", equals: "200,500,80\n3,3,4", hint: "Перший рядок: подвоєні ціни, другий: довжини слів." },
      { on: "stdout", name: "Подвоєні ціни", has: "200,500,80", hint: "Стрілкова функція бачить $rate без use, тож fn ($p) => $p * $rate." },
      { on: "stdout", name: "Довжини слів", has: "3,3,4", hint: "Для кирилиці довжину дає mb_strlen, а не strlen." },
      { on: "source", name: "Використано fn", matches: "\\bfn\\s*\\(", hint: "Для ціни напишіть стрілкову функцію з ключовим словом fn." },
      { on: "source", name: "Першокласна callable", matches: "mb_strlen\\s*\\(\\s*\\.\\.\\.\\s*\\)", hint: "Запис функції з трьома крапками в дужках створює callable без рядка з назвою." },
    ],
  },
  {
    ...base, id: "php-recursion-sum", lesson: "php/18", xp: 35,
    title: "Сума вкладеного масиву",
    context: "Рекурсія зручна, коли глибина вкладення невідома. Базовий випадок це число, а рекурсивний крок розгортає внутрішній масив і додає його суму.",
    brief: [
      "Допишіть <code>sumDeep(array $data): int</code>, яка сумує всі числа у вкладених масивах будь-якої глибини (елемент-масив обробляйте викликом самої себе, перевіряючи <code>is_array</code>).",
      "Виведіть <code>sumDeep([1, [2, [3, 4]], 5, [[6]]])</code> і <code>sumDeep([])</code>, кожне на окремому рядку: <code>21</code> та <code>0</code>.",
    ],
    starter: raw`<?php
function sumDeep(array $data): int
{
    // TODO: пройдіть елементи, масиви розгортайте рекурсивно
    return 0;
}

echo sumDeep([1, [2, [3, 4]], 5, [[6]]]), "\n";
echo sumDeep([]), "\n";
`,
    checks: [
      { on: "stdout", name: "Повний вивід збігається", equals: "21\n0", hint: "Сума всіх чисел на всіх рівнях і нуль для порожнього масиву." },
      { on: "stdout", name: "Глибока сума", has: "21", hint: "Якщо елемент є масивом, додайте результат виклику sumDeep для нього." },
      { on: "stdout", name: "Порожній масив дає нуль", has: "0", hint: "Початкове значення суми 0 і порожній цикл дадуть нуль без окремих гілок." },
      { on: "source", name: "Функція викликає себе", matches: "sumDeep\\s*\\([^)]*\\$[a-z]+", hint: "Усередині тіла sumDeep має бути ще один виклик sumDeep." },
    ],
  },
];
