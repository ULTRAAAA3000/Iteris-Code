// Практичні завдання глави «Абстракція», частина 05a (уроки 40–45). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_05a: readonly RemoteTask[] = [
  {
    ...base, id: "php-interface-discount", lesson: "php/40", xp: 30,
    title: "Знижки за єдиним контрактом",
    context: "Магазин має різні види знижок, а кошик не повинен знати, який саме. Інтерфейс задає один метод, а кожен клас реалізує його по-своєму.",
    brief: [
      "Інтерфейс <code>Discount</code> з методом <code>apply(int $price): int</code> уже оголошено. Створіть класи <code>PercentOff</code> (у конструкторі відсоток, віднімає <code>intdiv($price * $percent, 100)</code>) і <code>FixedOff</code> (у конструкторі сума, віднімає її, але результат не менший за 0). Обидва мають реалізовувати <code>Discount</code>.",
      "Для ціни 1000 виведіть по рядку для <code>new PercentOff(10)</code>, <code>new FixedOff(50)</code> і <code>new FixedOff(2000)</code> у форматі <code>Назва класу: результат</code> (назву дає <code>get_class</code>), тобто <code>PercentOff: 900</code>, <code>FixedOff: 950</code>, <code>FixedOff: 0</code>. Кожен рядок завершуйте <code>\n</code>.",
    ],
    starter: raw`<?php
interface Discount
{
    public function apply(int $price): int;
}

// TODO: клас PercentOff implements Discount (private int $percent)
// TODO: клас FixedOff implements Discount (private int $amount, результат не менше 0)

$discounts = [];
// TODO: додайте PercentOff(10), FixedOff(50), FixedOff(2000)

foreach ($discounts as $d) {
    echo get_class($d) . ": " . $d->apply(1000) . "\n";
}
`,
    checks: [
      { on: "stdout", name: "Відсоткова знижка", has: "PercentOff: 900", hint: "Від 1000 треба відняти intdiv(1000 * 10, 100), тобто 100." },
      { on: "stdout", name: "Знижка не опускає ціну нижче нуля", has: "FixedOff: 0", hint: "Для суми 2000 різниця від'ємна, використайте max(0, ...)." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "PercentOff: 900\nFixedOff: 950\nFixedOff: 0", hint: "Три рядки в порядку: PercentOff(10), FixedOff(50), FixedOff(2000)." },
      { on: "source", name: "Класи підписали контракт", matches: "implements\\s+Discount", hint: "Клас має заявити, що реалізує інтерфейс Discount, ключовим словом implements." },
    ],
  },
  {
    ...base, id: "php-abstract-employee", lesson: "php/41", xp: 30,
    title: "Працівники з абстрактною виплатою",
    context: "Зарплата в різних працівників рахується по-різному, а рядок звіту однаковий. Абстрактний клас тримає спільний рядок, а розрахунок залишає нащадкам.",
    brief: [
      "Зробіть <code>Employee</code> абстрактним: конструктор із <code>protected string $name</code>, абстрактний <code>pay(): int</code> і готовий <code>line(): string</code>, що повертає <code>Ім'я: сума</code>. Створіть <code>Salaried</code> (оклад, <code>pay</code> повертає його) і <code>Hourly</code> (ставка й години, <code>pay</code> повертає їх добуток).",
      "Виведіть <code>line()</code> для <code>Salaried(\"Іван\", 3000)</code> і <code>Hourly(\"Марія\", 150, 8)</code>, кожен рядок завершуйте <code>\n</code>. Потім спробуйте <code>new Employee(\"X\")</code> у <code>try</code>, перехопіть <code>Error</code> і виведіть <code>Помилка: </code> та повідомлення виключення.",
    ],
    starter: raw`<?php
// TODO: зробіть клас абстрактним і додайте абстрактний метод pay(): int
class Employee
{
    public function __construct(protected string $name) {}

    public function line(): string
    {
        return $this->name . ": " . $this->pay();
    }
}

// TODO: класи Salaried і Hourly, що успадковують Employee

echo "TODO\n";
`,
    checks: [
      { on: "stdout", name: "Рядок для окладу", has: "Іван: 3000", hint: "Salaried повертає в pay() лише оклад." },
      { on: "stdout", name: "Рядок для погодинної оплати", has: "Марія: 1200", hint: "Hourly множить ставку на години." },
      { on: "stdout", name: "Абстрактний клас не створюється", has: "Помилка: Cannot instantiate abstract class Employee", hint: "Створення абстрактного класу кидає Error; виведіть його getMessage()." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Іван: 3000\nМарія: 1200\nПомилка: Cannot instantiate abstract class Employee", hint: "Три рядки: два працівники, потім помилка." },
      { on: "source", name: "Є абстрактний клас", matches: "abstract\\s+class\\s+Employee", hint: "Додайте слово abstract перед class." },
    ],
  },
  {
    ...base, id: "php-trait-tags", lesson: "php/42", xp: 30,
    title: "Теги через трейт",
    context: "Теги потрібні і статтям, і товарам, хоча спільного предка в них немає. Трейт дозволяє написати логіку один раз і підключити її в обидва класи.",
    brief: [
      "Створіть трейт <code>HasTags</code> із приватним масивом <code>$tags</code>, методом <code>addTag(string $tag): static</code> (дублікати не додає, повертає <code>$this</code>) і методом <code>tagList(): string</code>, що повертає теги через <code>, </code>.",
      "Підключіть його в класи <code>Post</code> і <code>Product</code>. Виведіть <code>Post: php, oop</code> (додайте теги php, oop, php) і <code>Product: sale</code>, кожен рядок завершуйте <code>\n</code>.",
    ],
    starter: raw`<?php
// TODO: trait HasTags (private array $tags, addTag, tagList)

class Post {}
class Product {}

$post = new Post();
$product = new Product();
// TODO: додайте теги php, oop, php до $post та sale до $product

echo "TODO\n";
`,
    checks: [
      { on: "stdout", name: "Теги статті без дубліката", has: "Post: php, oop", hint: "Повторний тег php не повинен потрапити в масив двічі, перевірте in_array." },
      { on: "stdout", name: "Теги товару", has: "Product: sale", hint: "Той самий трейт має працювати й у другому класі." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Post: php, oop\nProduct: sale", hint: "Два рядки: спочатку Post, потім Product." },
      { on: "source", name: "Трейт підключено через use", matches: "use\\s+HasTags", hint: "Усередині класу підключіть трейт рядком use." },
    ],
  },
  {
    ...base, id: "php-override-tax", lesson: "php/43", xp: 30,
    title: "Податок: перевизначення методів",
    context: "Різні категорії товарів оподатковуються по-різному, а підсумок рахується однаково. Нащадки перевизначають лише податок, решту робить базовий клас.",
    brief: [
      "У класі <code>Item</code> (конструктор <code>protected int $price</code>) є метод <code>tax()</code>: 20% через <code>intdiv($this->price * 20, 100)</code>, і готовий <code>total()</code> = ціна плюс <code>tax()</code>. Створіть <code>Book</code>, що перевизначає <code>tax()</code> на 5%, і <code>Luxury</code>, що бере <code>parent::tax()</code> і додає ще <code>intdiv($this->price, 10)</code>.",
      "Для ціни 1000 виведіть у порядку <code>Item</code>, <code>Book</code>, <code>Luxury</code> рядки <code>Назва: total</code> (назва через <code>get_class</code>), тобто <code>Item: 1200</code>, <code>Book: 1050</code>, <code>Luxury: 1300</code>.",
    ],
    starter: raw`<?php
class Item
{
    public function __construct(protected int $price) {}

    public function tax(): int
    {
        return intdiv($this->price * 20, 100);
    }

    public function total(): int
    {
        return $this->price + $this->tax();
    }
}

// TODO: class Book extends Item (податок 5%)
// TODO: class Luxury extends Item (parent::tax() плюс десята частина ціни)

$items = [new Item(1000)];
// TODO: додайте Book(1000) і Luxury(1000)

foreach ($items as $i) {
    echo get_class($i) . ": " . $i->total() . "\n";
}
`,
    checks: [
      { on: "stdout", name: "Звичайний товар", has: "Item: 1200", hint: "Базова поведінка: ціна плюс 20%." },
      { on: "stdout", name: "Книга з пільговим податком", has: "Book: 1050", hint: "Перевизначте tax() на 5%, а total() успадкується без змін." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "Item: 1200\nBook: 1050\nLuxury: 1300", hint: "Три рядки в порядку Item, Book, Luxury." },
      { on: "source", name: "Викликано батьківський метод", matches: "parent::tax\\(", hint: "Luxury має не переписувати 20%, а звернутися до версії батька через parent::." },
    ],
  },
  {
    ...base, id: "php-union-describe", lesson: "php/44", xp: 30,
    title: "Union-типи й iterable",
    context: "Ідентифікатори приходять то числом, то рядком, а то їх немає зовсім. Точні типи й strict_types ловлять неправильні значення одразу на вході у функцію.",
    brief: [
      "Напишіть <code>describe(int|string|null $id): string</code>: для <code>null</code> повертає <code>немає</code>, для int <code>№7</code> (з номером), для рядка <code>код:ab</code>. Напишіть <code>sum(iterable $items): int</code>, що додає елементи.",
      "Виведіть рядки: <code>describe(7)</code>, <code>describe(\"ab\")</code>, <code>describe(null)</code>, <code>sum([1, 2, 3])</code>, <code>sum(new ArrayIterator([4, 5]))</code>. Потім у <code>try</code> викличте <code>describe(1.5)</code>, перехопіть <code>TypeError</code> і виведіть <code>TypeError</code>. Кожен рядок завершуйте <code>\n</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

// TODO: function describe(int|string|null $id): string
// TODO: function sum(iterable $items): int

echo "TODO\n";
`,
    checks: [
      { on: "stdout", name: "Число і рядок", has: "№7\nкод:ab", hint: "Для int поверніть «№» і число, для рядка «код:» і сам рядок; розрізняйте через is_int чи is_string." },
      { on: "stdout", name: "Суми з масиву й ітератора", has: "6\n9", hint: "iterable приймає і масив, і ArrayIterator, foreach працює з обома." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "№7\nкод:ab\nнемає\n6\n9\nTypeError", hint: "Шість рядків; останній з'являється, коли float не підходить під int|string|null у strict_types." },
      { on: "source", name: "Є union-тип", matches: "int\\|string\\|null", hint: "Параметр describe оголошується union-типом через вертикальні риски." },
    ],
  },
  {
    ...base, id: "php-magic-config", lesson: "php/45", xp: 30,
    title: "Config з магічними методами",
    context: "Налаштування зручно читати як властивості й гетери, а друкувати як рядок. Магічні методи дозволяють зробити таку обгортку над звичайним масивом.",
    brief: [
      "У класі <code>Config</code> (конструктор приймає приватний масив <code>$data</code>) реалізуйте <code>__get</code> (значення або <code>null</code>), <code>__isset</code>, <code>__call</code> (для імен на кшталт <code>getPort</code>: ключ <code>port</code>, перша літера малою через <code>lcfirst</code>) і <code>__toString</code> (<code>ключ=значення</code> через <code>;</code>).",
      "Для <code>['host' => 'localhost', 'port' => 8080]</code> виведіть рядки: <code>$c-&gt;host</code>; <code>так</code> чи <code>ні</code> для <code>isset($c-&gt;port)</code> і <code>isset($c-&gt;user)</code> через пробіл; <code>$c-&gt;getPort()</code>; сам об'єкт. Тобто <code>localhost</code>, <code>так ні</code>, <code>8080</code>, <code>host=localhost;port=8080</code>. Кожен рядок завершуйте <code>\n</code>.",
    ],
    starter: raw`<?php
class Config
{
    public function __construct(private array $data) {}

    // TODO: __get, __isset, __call, __toString
}

$c = new Config(['host' => 'localhost', 'port' => 8080]);
echo "TODO\n";
`,
    checks: [
      { on: "stdout", name: "Читання властивості", has: "localhost\n", hint: "Звернення $c->host приходить у __get з іменем host." },
      { on: "stdout", name: "isset працює через __isset", has: "так ні", hint: "isset($c->port) і isset($c->user) викликають __isset, який перевіряє масив." },
      { on: "stdout", name: "Вивід збігається з очікуваним", equals: "localhost\nтак ні\n8080\nhost=localhost;port=8080", hint: "Чотири рядки; об'єкт друкується через __toString." },
      { on: "source", name: "Реалізовано __toString і __call", matches: "__toString[\\s\\S]*__call|__call[\\s\\S]*__toString", hint: "У класі мають бути обидва магічні методи." },
    ],
  },
];
