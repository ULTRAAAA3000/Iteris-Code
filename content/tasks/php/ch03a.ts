// Практичні завдання частини ch03a «Колекції» (уроки 19–24). Запускаються на сервері (runtime: "remote"), результат перевіряється за stdout.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_03a: readonly RemoteTask[] = [
  {
    ...base, id: "php-index-queue", lesson: "php/19", xp: 20,
    title: "Черга до каси: індексний масив",
    context: "Черга це класичний індексний масив: людей додають у кінець, а обслуговують з початку. Для цього є запис [] і функція array_shift, яка забирає перший елемент і зсуває решту.",
    brief: [
      "У масиві <code>$queue</code> уже стоять <code>Оля</code> та <code>Іван</code>. Додайте в кінець <code>Марія</code> записом <code>[]</code>, а потім заберіть першого функцією <code>array_shift</code>.",
      "Виведіть три рядки: <code>Обслужено: Оля</code>, <code>У черзі: Іван, Марія</code> (через <code>implode</code>) і <code>Розмір: 2</code> (через <code>count</code>).",
    ],
    starter: raw`<?php
$queue = ['Оля', 'Іван'];

// TODO: додайте 'Марія' в кінець масиву
// TODO: заберіть першого через array_shift і збережіть у $served
$served = '';

echo 'Обслужено: ' . $served . "\n";
echo 'У черзі: ' . implode(', ', $queue) . "\n";
echo 'Розмір: ' . count($queue);
`,
    checks: [
      { on: "stdout", name: "Обслужено першого з черги", has: "Обслужено: Оля", hint: "array_shift повертає забраний перший елемент: збережіть його у змінну." },
      { on: "stdout", name: "У черзі лишилися двоє", has: "У черзі: Іван, Марія", hint: "Марію додайте записом $queue[] = ...; після array_shift у масиві лишаються Іван і Марія." },
      { on: "stdout", name: "Повний вивід збігається", equals: "Обслужено: Оля\nУ черзі: Іван, Марія\nРозмір: 2", hint: "Рівно три рядки у вказаному форматі, розмір береться через count." },
      { on: "source", name: "Вжито array_shift", has: "array_shift(", hint: "Першого з черги забирає саме array_shift." },
    ],
  },
  {
    ...base, id: "php-arrays-products", lesson: "php/20", xp: 30,
    title: "Картка товару: асоціативний масив",
    context: "Один товар зручно описати асоціативним масивом: назва, ціна й кількість лежать під зрозумілими ключами. Масив можна доповнювати, змінювати й перебирати разом із ключами.",
    brief: [
      "У <code>$product</code> лежать <code>name</code>, <code>price</code> і <code>qty</code>. Змініть <code>price</code> на <code>28</code> і додайте новий ключ <code>unit</code> зі значенням <code>шт</code>.",
      "Виведіть кожну пару рядком <code>ключ: значення</code> через <code>foreach</code>, а після них рядок <code>Сума: 84</code>, де сума це <code>price * qty</code>, обчислена з масиву.",
    ],
    starter: raw`<?php
$product = ['name' => 'Хліб', 'price' => 25, 'qty' => 3];

// TODO: змініть price на 28
// TODO: додайте ключ unit зі значенням 'шт'

foreach ($product as $key => $value) {
    echo "$key: $value\n";
}
// TODO: виведіть 'Сума: ' і добуток price та qty
`,
    checks: [
      { on: "stdout", name: "Ціну змінено на 28", has: "price: 28", hint: "Існуючий ключ змінюють присвоєнням $product['price'] = ...;" },
      { on: "stdout", name: "Додано ключ unit", has: "unit: шт", hint: "Новий ключ додають так само присвоєнням: $product['unit'] = ...;" },
      { on: "stdout", name: "Сума обчислена з масиву", has: "Сума: 84", hint: "Перемножте $product['price'] і $product['qty'] після зміни ціни." },
      { on: "stdout", name: "Повний вивід збігається", equals: "name: Хліб\nprice: 28\nqty: 3\nunit: шт\nСума: 84", hint: "Спершу чотири пари в порядку додавання ключів, потім рядок із сумою." },
    ],
  },
  {
    ...base, id: "php-nested-orders", lesson: "php/21", xp: 30,
    title: "Суми замовлень: вкладені масиви",
    context: "Замовлення містить список позицій, а кожна позиція має кількість і ціну. Щоб порахувати суму, треба пройти по вкладених масивах: зовнішній цикл бере замовлення, внутрішній його позиції.",
    brief: [
      "Для кожного замовлення з <code>$orders</code> порахуйте суму <code>qty * price</code> по всіх позиціях і виведіть рядок <code>Клієнт: сума грн</code>. Наприкінці виведіть загальну суму рядком <code>Разом: ... грн</code>.",
      "Очікуваний вивід: <code>Оля: 92 грн</code>, <code>Іван: 180 грн</code>, <code>Разом: 272 грн</code>.",
    ],
    starter: raw`<?php
$orders = [
    ['customer' => 'Оля', 'items' => [
        ['name' => 'Хліб', 'qty' => 2, 'price' => 25],
        ['name' => 'Молоко', 'qty' => 1, 'price' => 42],
    ]],
    ['customer' => 'Іван', 'items' => [
        ['name' => 'Сир', 'qty' => 1, 'price' => 180],
    ]],
];

$grand = 0;
foreach ($orders as $order) {
    $total = 0;
    // TODO: внутрішній цикл по $order['items']: додайте qty * price до $total
    echo $order['customer'] . ': ' . $total . " грн\n";
    // TODO: додайте $total до $grand
}
echo 'Разом: ' . $grand . ' грн';
`,
    checks: [
      { on: "stdout", name: "Сума замовлення Олі", has: "Оля: 92 грн", hint: "Пройдіть циклом по $order['items'] і додавайте $item['qty'] * $item['price']." },
      { on: "stdout", name: "Сума замовлення Івана", has: "Іван: 180 грн", hint: "Лічильник $total обнуляється на початку кожного замовлення, як у заготовці." },
      { on: "stdout", name: "Загальна сума", has: "Разом: 272 грн", hint: "Після кожного замовлення додавайте його суму до $grand." },
      { on: "stdout", name: "Повний вивід збігається", equals: "Оля: 92 грн\nІван: 180 грн\nРазом: 272 грн", hint: "Три рядки у вказаному форматі без зайвих." },
    ],
  },
  {
    ...base, id: "php-destructure-rows", lesson: "php/22", xp: 25,
    title: "Розбір рядків: foreach і деструктуризація",
    context: "Деструктуризація розкладає масив на змінні одним записом, а у foreach її ставлять на місце змінної. Так рядки таблиці й пари «ключ=значення» розбирають без службових індексів.",
    brief: [
      "Перебір <code>$rows</code> зробіть через <code>foreach</code> із деструктуризацією <code>[$name, $score]</code> і виведіть для кожного <code>Оля - 90</code> (ім'я, дефіс, бал).",
      "Потім розкладіть <code>$pair</code> (результат <code>explode</code>) на <code>$key</code> і <code>$value</code> і виведіть <code>lang -> uk</code>.",
    ],
    starter: raw`<?php
$rows = [['Оля', 90], ['Іван', 75]];

foreach ($rows as $row) {
    // TODO: замініть $row на деструктуризацію [$name, $score] у foreach
    echo $row[0] . ' - ' . $row[1] . "\n";
}

$pair = explode('=', 'lang=uk');
// TODO: розкладіть $pair на $key і $value та виведіть 'lang -> uk'
`,
    checks: [
      { on: "stdout", name: "Рядки з іменем і балом", has: "Іван - 75", hint: "Після деструктуризації вживайте змінні $name і $score." },
      { on: "stdout", name: "Розібрана пара ключ-значення", has: "lang -> uk", hint: "Запис [$key, $value] = $pair; розкладає масив за позиціями." },
      { on: "stdout", name: "Повний вивід збігається", equals: "Оля - 90\nІван - 75\nlang -> uk", hint: "Спершу два рядки з балами, потім рядок із парою." },
      { on: "source", name: "Деструктуризація прямо у foreach", matches: "foreach\\s*\\(\\s*\\$rows\\s+as\\s+\\[", hint: "На місці змінної після as поставте квадратні дужки: foreach ($rows as [$name, $score])." },
    ],
  },
  {
    ...base, id: "php-array-lookup", lesson: "php/23", xp: 25,
    title: "Запитання до масиву: пошук і підрахунок",
    context: "Щоб дізнатися, чи є значення в масиві й де саме воно лежить, вживають in_array та array_search. Обидві без третього аргументу true порівнюють нестрого, тому строгий режим варто вмикати.",
    brief: [
      "Для <code>$roles</code> виведіть чотири рядки: <code>Ролей: 3</code> (через <code>count</code>), <code>editor є: так</code> чи <code>ні</code> (через <code>in_array</code> зі строгим режимом), <code>Позиція viewer: 2</code> (через <code>array_search</code>) і <code>guest є: ні</code>.",
    ],
    starter: raw`<?php
$roles = ['admin', 'editor', 'viewer'];

echo 'Ролей: ' . 0 . "\n"; // TODO: порахуйте через count
// TODO: editor є: так/ні (in_array зі строгим режимом)
// TODO: Позиція viewer: (array_search)
// TODO: guest є: так/ні
`,
    checks: [
      { on: "stdout", name: "Кількість ролей", has: "Ролей: 3", hint: "count($roles) повертає кількість елементів." },
      { on: "stdout", name: "Позиція viewer", has: "Позиція viewer: 2", hint: "array_search повертає ключ першого збігу." },
      { on: "stdout", name: "Повний вивід збігається", equals: "Ролей: 3\neditor є: так\nПозиція viewer: 2\nguest є: ні", hint: "Чотири рядки у вказаному порядку, слова «так» і «ні» малими літерами." },
      { on: "source", name: "in_array зі строгим режимом", matches: "in_array\\([^;]*true\\s*\\)", hint: "Третім аргументом in_array передайте true." },
    ],
  },
  {
    ...base, id: "php-map-filter-reduce", lesson: "php/24", xp: 30,
    title: "Ціни: map, filter і reduce",
    context: "Три функції вищого порядку покривають більшість циклів над масивами: array_filter відбирає, array_map перетворює, array_reduce зводить до одного числа. Ключі після фільтра треба скидати.",
    brief: [
      "З <code>$prices</code> відберіть ціни від <code>50</code> і вище (<code>array_filter</code>), знизьте кожну на <code>10</code> (<code>array_map</code>) і додайте (<code>array_reduce</code> з початковим <code>0</code>).",
      "Виведіть три рядки: <code>Дорогі: 120, 80, 60</code>, <code>Після знижки: 110, 70, 50</code> і <code>Сума: 230</code>. Перед <code>implode</code> викличте <code>array_values</code> там, де потрібно.",
    ],
    starter: raw`<?php
$prices = [120, 35, 80, 15, 60];

$expensive = []; // TODO: array_filter, ціна від 50
$discounted = []; // TODO: array_map, мінус 10 до кожної
$sum = 0; // TODO: array_reduce з початковим значенням 0

echo 'Дорогі: ' . implode(', ', $expensive) . "\n";
echo 'Після знижки: ' . implode(', ', $discounted) . "\n";
echo 'Сума: ' . $sum;
`,
    checks: [
      { on: "stdout", name: "Відібрано дорогі ціни", has: "Дорогі: 120, 80, 60", hint: "Функція фільтра повертає true для цін від 50 включно." },
      { on: "stdout", name: "Знижка застосована", has: "Після знижки: 110, 70, 50", hint: "array_map приймає спершу функцію, потім масив." },
      { on: "stdout", name: "Повний вивід збігається", equals: "Дорогі: 120, 80, 60\nПісля знижки: 110, 70, 50\nСума: 230", hint: "Три рядки; суму рахуйте за цінами після знижки." },
      { on: "source", name: "Вжито filter, map і reduce", matches: "array_filter\\([\\s\\S]*array_map\\([\\s\\S]*array_reduce\\(", hint: "Використайте всі три функції в такому порядку: array_filter, array_map, array_reduce." },
    ],
  },
];
