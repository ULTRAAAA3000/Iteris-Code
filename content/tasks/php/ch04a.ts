// Практичні завдання глави «Типи користувача», частина 04a (уроки 31–35). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04a: readonly RemoteTask[] = [
  {
    ...base, id: "php-product-class", lesson: "php/31", xp: 25,
    title: "Клас Product і три об'єкти",
    context: "Клас збирає дані й поведінку сутності в одному місці. За одним класом створюють скільки завгодно об'єктів, і кожен має власні значення властивостей.",
    brief: [
      "Опишіть клас <code>Product</code> з типізованими властивостями <code>public string $name</code> і <code>public float $price</code> та методом <code>label()</code>, що повертає рядок виду <code>Хліб: 25.50</code> (ціна через <code>number_format($price, 2)</code>).",
      "Створіть через <code>new</code> три товари: Хліб 25.5, Молоко 42, Сир 180, заповніть їм властивості й додайте до <code>$products</code>. Цикл у заготовці надрукує три рядки й підсумок <code>Разом: 247.50</code>.",
    ],
    starter: raw`<?php
// TODO: клас Product (name, price, метод label())

$products = [];
// TODO: створіть три об'єкти через new і додайте їх у $products

$total = 0.0;
foreach ($products as $p) {
    echo $p->label() . PHP_EOL;
    $total += $p->price;
}
echo 'Разом: ' . number_format($total, 2) . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "Рядок «Хліб: 25.50»", has: "Хліб: 25.50", hint: "Метод label() має з'єднати назву, двокрапку й ціну, відформатовану до двох знаків." },
      { on: "stdout", name: "Підсумок «Разом: 247.50»", has: "Разом: 247.50", hint: "Цикл підсумовує price кожного об'єкта з масиву $products, тож масив має бути заповнений." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Хліб: 25.50\nМолоко: 42.00\nСир: 180.00\nРазом: 247.50", hint: "Чотири рядки: три товари в порядку Хліб, Молоко, Сир і підсумок." },
      { on: "source", name: "Описано клас Product", matches: "class\\s+Product\\b", hint: "Клас оголошують ключовим словом class, а ім'я пишуть з великої літери." },
      { on: "source", name: "Об'єкти створено через new", matches: "new\\s+Product", hint: "Об'єкт з'являється лише після виразу new, за яким іде ім'я класу." },
    ],
  },
  {
    ...base, id: "php-cart-promotion", lesson: "php/32", xp: 30,
    title: "Позиція кошика з промоцією властивостей",
    context: "Конструктор із промоцією оголошує й заповнює властивості одним рядком. Метод рахує суму позиції, не лізучи в чужі змінні: усі дані лежать у самому об'єкті.",
    brief: [
      "Опишіть клас <code>Item</code>, конструктор якого приймає <code>public string $title</code>, <code>public int $qty</code> і <code>public float $price</code> з промоцією, та метод <code>sum(): float</code> (кількість на ціну).",
      "Перетворіть кожен рядок масиву <code>$rows</code> на об'єкт <code>Item</code> і виведіть <code>Ручка x3 = 15.00</code> (назва, <code>x</code>, кількість, <code>=</code>, сума з двома знаками), по рядку на позицію. Останнім рядком <code>Разом: 40.00</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

// TODO: клас Item із конструктором-промоцією та методом sum()

$rows = [['Ручка', 3, 5.0], ['Зошит', 2, 12.5]];
$items = [];
// TODO: для кожного рядка з $rows створіть new Item(...) і додайте в $items

$total = 0.0;
foreach ($items as $item) {
    echo $item->title . ' x' . $item->qty . ' = ' . number_format($item->sum(), 2) . PHP_EOL;
    $total += $item->sum();
}
echo 'Разом: ' . number_format($total, 2) . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "Позиція «Ручка x3 = 15.00»", has: "Ручка x3 = 15.00", hint: "Сума позиції це кількість, помножена на ціну, надрукована з двома знаками після крапки." },
      { on: "stdout", name: "Підсумок «Разом: 40.00»", has: "Разом: 40.00", hint: "Підсумок складається з сум усіх позицій, тож обидва рядки масиву мають стати об'єктами." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Ручка x3 = 15.00\nЗошит x2 = 25.00\nРазом: 40.00", hint: "Три рядки: дві позиції у порядку масиву й підсумок." },
      { on: "source", name: "Є конструктор", has: "__construct", hint: "Властивості мають надходити в об'єкт через спеціальний метод, який викликається під час new." },
      { on: "source", name: "Промоція: параметр із public", matches: "__construct\\([^)]*public\\s+string\\s+\\$title", hint: "Перед параметром конструктора поставте модифікатор видимості, і окреме оголошення властивості не знадобиться." },
    ],
  },
  {
    ...base, id: "php-account-visibility", lesson: "php/33", xp: 30,
    title: "Рахунок із закритим балансом",
    context: "Закрита властивість змушує всіх працювати через методи, які перевіряють дані. Тоді баланс неможливо зіпсувати зовні, а правила живуть в одному місці.",
    brief: [
      "Опишіть клас <code>Account</code> з приватною властивістю <code>private int $balance = 0</code>. Метод <code>deposit(int $amount): bool</code> додає суму, лише якщо вона додатна, <code>withdraw(int $amount): bool</code> знімає, лише якщо сума додатна й не більша за баланс; обидва повертають <code>true</code> при успіху й <code>false</code> при відмові. Метод <code>balance(): int</code> віддає поточне значення.",
      "Скрипт нижче друкує результат кожної операції й підсумковий баланс. Очікуваний вивід: п'ять рядків, останній <code>Баланс: 300</code>.",
    ],
    starter: raw`<?php
// TODO: клас Account із приватним $balance та методами deposit(), withdraw(), balance()

function show(string $label, bool $ok): void
{
    echo $label . ': ' . ($ok ? 'ok' : 'відмова') . PHP_EOL;
}

$acc = new Account();
show('внесок 500', $acc->deposit(500));
show('зняття 200', $acc->withdraw(200));
show('зняття 1000', $acc->withdraw(1000));
show('внесок -5', $acc->deposit(-5));
echo 'Баланс: ' . $acc->balance() . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "Успішний внесок", has: "внесок 500: ok", hint: "Додатна сума має збільшити баланс, а метод повернути true." },
      { on: "stdout", name: "Відмова при перевищенні балансу", has: "зняття 1000: відмова", hint: "Перед зняттям порівняйте суму з поточним балансом." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "внесок 500: ok\nзняття 200: ok\nзняття 1000: відмова\nвнесок -5: відмова\nБаланс: 300", hint: "П'ять рядків: чотири результати операцій і підсумковий баланс." },
      { on: "source", name: "Баланс приватний", matches: "private\\s+int\\s+\\$balance", hint: "Властивість треба закрити модифікатором, який пускає лише код самого класу." },
    ],
  },
  {
    ...base, id: "php-static-counter", lesson: "php/34", xp: 30,
    title: "Квитки з лічильником і константою",
    context: "Статичний лічильник живе в класі, а не в об'єкті, тому нумерує всі створені квитки підряд. Константа класу тримає префікс в одному місці.",
    brief: [
      "Опишіть клас <code>Ticket</code>: константа <code>public const PREFIX = 'T-'</code>, приватний статичний лічильник <code>private static int $next = 1</code>, публічна властивість <code>public string $code</code> і статичний метод <code>issue(): self</code>, який створює квиток із кодом виду <code>T-001</code> (<code>sprintf('%03d', ...)</code>) та збільшує лічильник.",
      "Ще один статичний метод <code>issued(): int</code> повертає, скільки квитків видано. Скрипт друкує три коди по одному в рядок і <code>Видано: 3</code>.",
    ],
    starter: raw`<?php
// TODO: клас Ticket (const PREFIX, static $next, поле $code, static issue(), static issued())

for ($i = 0; $i < 3; $i++) {
    $t = Ticket::issue();
    echo $t->code . PHP_EOL;
}
echo 'Видано: ' . Ticket::issued() . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "Перший код T-001", has: "T-001", hint: "Лічильник починається з одиниці, а число доповнюється нулями до трьох цифр." },
      { on: "stdout", name: "Підсумок «Видано: 3»", has: "Видано: 3", hint: "Лічильник належить класові, тож він пам'ятає всі виклики issue()." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "T-001\nT-002\nT-003\nВидано: 3", hint: "Чотири рядки: три коди підряд і підсумок." },
      { on: "source", name: "Є статичний лічильник", matches: "static\\s+int\\s+\\$next", hint: "Лічильник має бути спільним для всіх об'єктів, для цього є окреме ключове слово." },
      { on: "source", name: "Є константа класу", has: "const PREFIX", hint: "Префікс не змінюється, тому його оголошують як константу класу." },
    ],
  },
  {
    ...base, id: "php-money-value", lesson: "php/35", xp: 35,
    title: "Незмінні гроші: value-об'єкт Money",
    context: "Value-об'єкт після створення не змінюється: операції повертають новий екземпляр. Тому гроші можна безпечно передавати між функціями, а порівнювати за значенням.",
    brief: [
      "Опишіть клас <code>Money</code> із промоцією в конструкторі: <code>public readonly int $cents</code> і <code>public readonly string $currency = 'UAH'</code>. Методи: <code>add(Money $other): self</code> повертає нове значення, <code>equals(Money $other): bool</code> порівнює копійки й валюту, <code>format(): string</code> повертає, наприклад, <code>12.50 UAH</code> (<code>number_format($cents / 100, 2, '.', '')</code>).",
      "Скрипт друкує початкову суму, суму після додавання (оригінал не змінюється) та два результати порівняння словами <code>так</code> або <code>ні</code>.",
    ],
    starter: raw`<?php
// TODO: клас Money (readonly cents і currency, add(), equals(), format())

function yesNo(bool $v): string
{
    return $v ? 'так' : 'ні';
}

$a = new Money(1250);
$b = new Money(250);
$c = $a->add($b);
echo $a->format() . PHP_EOL;
echo $c->format() . PHP_EOL;
echo 'a == c: ' . yesNo($a->equals($c)) . PHP_EOL;
echo 'a == 1250: ' . yesNo($a->equals(new Money(1250))) . PHP_EOL;
`,
    checks: [
      { on: "stdout", name: "Форматування «12.50 UAH»", has: "12.50 UAH", hint: "Копійки діляться на сто, форматуються з двома знаками й крапкою, а після пробіл і валюта." },
      { on: "stdout", name: "Сума після додавання 15.00 UAH", has: "15.00 UAH", hint: "add() має скласти копійки обох об'єктів і повернути новий Money тієї самої валюти." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "12.50 UAH\n15.00 UAH\na == c: ні\na == 1250: так", hint: "Чотири рядки: оригінал лишається 12.50, а порівняння дивиться на значення полів." },
      { on: "source", name: "Властивості readonly", matches: "readonly\\s+int\\s+\\$cents", hint: "Поле копійок треба позначити модифікатором, що забороняє зміну після створення." },
      { on: "source", name: "add() створює новий об'єкт", matches: "new\\s+(self|static|Money)\\s*\\(", hint: "Замість зміни поточного об'єкта метод має повернути свіжий екземпляр." },
    ],
  },
];
