// Практичні завдання глави «Типи користувача», частина 04b (уроки 36–39). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout і кодом.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_04b: readonly RemoteTask[] = [
  {
    ...base, id: "php-order-status-enum", lesson: "php/36", xp: 30,
    title: "Статуси замовлення як enum",
    context: "Enum зі значеннями замінює розсип рядкових констант: допустимі варіанти перелічені в одному місці, а тип не дозволяє передати щось стороннє.",
    brief: [
      "Опишіть <code>enum Status: string</code> з варіантами <code>Pending = 'pending'</code>, <code>Paid = 'paid'</code>, <code>Shipped = 'shipped'</code> і методом <code>label(): string</code> через <code>match</code>: <b>Очікує</b>, <b>Оплачено</b>, <b>Відправлено</b>.",
      "Програма перебирає значення <code>['paid', 'shipped', 'pending']</code>, перетворює кожне через <code>Status::from()</code> і друкує рядок <code>paid: Оплачено</code> (значення, двокрапка, пробіл, мітка). Кожен рядок завершується переходом на новий.",
    ],
    starter: raw`<?php
declare(strict_types=1);

// TODO: enum Status: string із варіантами і методом label() через match

foreach (['paid', 'shipped', 'pending'] as $raw) {
    // TODO: Status::from($raw) і друк «значення: мітка»
    echo $raw . PHP_EOL;
}
`,
    checks: [
      { on: "stdout", name: "Усі три рядки виведено точно", equals: "paid: Оплачено\nshipped: Відправлено\npending: Очікує", hint: "Формат рядка: значення, двокрапка, пробіл, мітка. Порядок як у масиві." },
      { on: "stdout", name: "Є мітка для оплаченого", has: "paid: Оплачено", hint: "Метод label() має повертати українську мітку для варіанта Paid." },
      { on: "source", name: "Описано enum зі значеннями", matches: "enum\\s+Status\\s*:\\s*string", hint: "Enum зі значеннями типу string оголошується як enum Імя: string." },
      { on: "source", name: "Використано match", has: "match", hint: "Мітки зручно вибирати виразом match за $this." },
    ],
  },
  {
    ...base, id: "php-employee-manager", lesson: "php/37", xp: 30,
    title: "Employee і Manager: parent та final",
    context: "Нащадок розширює поведінку предка, а <code>parent::</code> дозволяє не копіювати код. Модифікатор <code>final</code> забороняє перевизначати метод далі.",
    brief: [
      "Опишіть клас <code>Employee</code> з конструктором (promoted <code>protected string $name</code>, <code>protected int $salary</code>) і методом <code>describe(): string</code>, що повертає <code>Ім'я (оклад)</code>, наприклад <code>Олена (1000)</code>.",
      "Додайте <code>protected function bonus(): int</code>, що повертає <code>0</code>, і <code>final public function total(): int</code>: оклад плюс <code>$this->bonus()</code>. Клас <code>Manager extends Employee</code> приймає ще <code>private int $bonus</code>, перевизначає <code>bonus()</code> (повертає її) і <code>describe()</code>: <code>parent::describe()</code> плюс <code> + бонус N</code>.",
      "Друк для кожної людини: <code>describe()</code>, потім <code> - </code> і <code>total()</code>, наприклад <code>Олена (1000) - 1000</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

// TODO: class Employee (promoted protected, describe(), bonus(), final total())
// TODO: class Manager extends Employee (bonus, bonus(), describe() через parent::)

$people = [new Employee('Олена', 1000), new Manager('Іван', 1000, 200)];
foreach ($people as $p) {
    echo $p->describe() . ' - ' . $p->total() . "\n";
}
`,
    checks: [
      { on: "stdout", name: "Точний вивід двох рядків", equals: "Олена (1000) - 1000\nІван (1000) + бонус 200 - 1200", hint: "Менеджер: parent::describe(), потім рядок ' + бонус 200'. total() це оклад плюс бонус." },
      { on: "stdout", name: "Менеджер показує бонус", has: "+ бонус 200", hint: "Додайте бонус до результату parent::describe()." },
      { on: "source", name: "Є виклик parent::", has: "parent::", hint: "Перевизначений метод має спиратися на батьківський." },
      { on: "source", name: "Є final", matches: "final\\s+public\\s+function\\s+total", hint: "Оголосіть total() як final public function." },
    ],
  },
  {
    ...base, id: "php-deep-clone", lesson: "php/38", xp: 35,
    title: "Глибоке копіювання через __clone",
    context: "<code>clone</code> робить лише поверхневу копію: вкладені об'єкти лишаються спільними. Метод <code>__clone</code> дозволяє скопіювати їх теж.",
    brief: [
      "Клас <code>Address</code> має публічну властивість <code>string $city</code>. Клас <code>User</code> має <code>public string $name</code> і <code>public Address $address</code> (обидва через конструктор). Додайте в <code>User</code> метод <code>__clone()</code>, що клонує адресу, щоб копія була незалежною.",
      "Програма створює <code>$a = new User('Ольга', new Address('Київ'))</code>, <code>$b = clone $a</code>, змінює у <code>$b</code> місто на <code>Львів</code> і друкує два рядки: <code>a: Київ</code> та <code>b: Львів</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

class Address
{
    public function __construct(public string $city) {}
}

class User
{
    public function __construct(public string $name, public Address $address) {}
    // TODO: __clone(), щоб копія мала власну адресу
}

$a = new User('Ольга', new Address('Київ'));
$b = clone $a;
$b->address->city = 'Львів';
echo 'a: ' . $a->address->city . "\n";
echo 'b: ' . $b->address->city . "\n";
`,
    checks: [
      { on: "stdout", name: "Оригінал не змінився, копія змінилась", equals: "a: Київ\nb: Львів", hint: "Без __clone обидва об'єкти вказують на одну Address." },
      { on: "stdout", name: "Оригінал лишився в Києві", has: "a: Київ", hint: "Зміна копії не повинна зачепити $a." },
      { on: "source", name: "Описано __clone", has: "__clone", hint: "Спеціальний метод викликається автоматично після clone." },
      { on: "source", name: "Вкладений об'єкт клонується", matches: "clone\\s+\\$this->address", hint: "У __clone перепризначте властивість її копією." },
    ],
  },
  {
    ...base, id: "php-late-static", lesson: "php/39", xp: 35,
    title: "Фабрика на new static",
    context: "<code>new static</code> створює об'єкт класу, на якому метод викликали, а не класу, де його описано. Так базовий клас дає фабрику всім нащадкам.",
    brief: [
      "Клас <code>Model</code> має статичний метод <code>make(): static</code>, що повертає <code>new static()</code>, і метод <code>kind(): string</code>, що повертає <code>static::class</code>. Класи <code>User</code> і <code>Post</code> наслідують <code>Model</code> без власного коду.",
      "Програма друкує <code>kind()</code> для <code>Model::make()</code>, <code>User::make()</code> і <code>Post::make()</code>, кожне з нового рядка: <code>Model</code>, <code>User</code>, <code>Post</code>.",
    ],
    starter: raw`<?php
declare(strict_types=1);

class Model
{
    // TODO: public static function make(): static
    // TODO: public function kind(): string через static::class
}

class User extends Model {}
class Post extends Model {}

foreach (['Model', 'User', 'Post'] as $cls) {
    // TODO: викликати $cls::make()->kind()
    echo $cls . "\n";
}
`,
    checks: [
      { on: "stdout", name: "Три імені класів", equals: "Model\nUser\nPost", hint: "Кожна фабрика має повернути об'єкт свого класу." },
      { on: "source", name: "Є new static", matches: "new\\s+static", hint: "self створив би завжди Model, потрібне пізнє зв'язування." },
      { on: "source", name: "Є static::class", has: "static::class", hint: "Ім'я класу під час виконання дає static::class." },
    ],
  },
];
